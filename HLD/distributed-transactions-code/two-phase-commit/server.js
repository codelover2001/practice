/*
 * TWO-PHASE COMMIT (2PC) — Run: node server.js → http://localhost:4001
 *
 * Simulates a coordinator + 3 participant "services" (Payment, Inventory, Notification)
 * all in one process with separate in-memory data stores.
 *
 * What to test:
 *   1. "Place Order (all succeed)" — happy path: prepare → all YES → commit
 *   2. "Place Order (Inventory fails)" — one says NO → all abort
 *   3. "Place Order (Coordinator crashes after prepare)" — THE BLOCKING PROBLEM
 *      All participants voted YES, resources are LOCKED, but coordinator dies
 *      before sending commit/abort. Participants are STUCK.
 *
 * WHY 2PC EXISTS:
 *   Single DB: BEGIN; INSERT order; UPDATE inventory; INSERT payment; COMMIT;
 *   Three DBs: no single transaction spans them. 2PC simulates atomic commit.
 *
 * WHY 2PC IS PROBLEMATIC:
 *   - Blocking: coordinator crash = everyone frozen with locked resources
 *   - Slow: synchronous, waits for slowest participant each phase
 *   - Single point of failure: coordinator
 *   - Modern microservices avoid it — use SAGA instead
 */

const express = require("express");
const path = require("path");
const app = express();
const PORT = 4001;

// ─── Simulated "databases" for each service ──────────────────────────────────

const services = {
  payment:      { name: "Payment",      balance: 10000, locked: false, preparedValue: null },
  inventory:    { name: "Inventory",     stock: 5,       locked: false, preparedValue: null },
  notification: { name: "Notification",  sent: [],       locked: false, preparedValue: null },
};

let transactionLog = [];
let transactionCounter = 0;

function logEvent(txId, msg, type) {
  transactionLog.unshift({ txId, msg, type, time: new Date().toISOString() });
}

// ─── Phase 1: PREPARE — "Can you commit?" ────────────────────────────────────
// Each participant checks if it CAN do the work, locks resources, but doesn't commit yet.

function prepare(txId, service, amount, shouldFail) {
  const s = services[service];

  if (shouldFail) {
    logEvent(txId, `${s.name}: VOTE NO (simulated failure)`, "error");
    return { vote: "NO", reason: "Simulated failure" };
  }

  if (s.locked) {
    logEvent(txId, `${s.name}: VOTE NO (resources already locked by another tx)`, "error");
    return { vote: "NO", reason: "Resources locked" };
  }

  if (service === "payment" && s.balance < amount) {
    logEvent(txId, `${s.name}: VOTE NO (insufficient balance: ₹${s.balance})`, "error");
    return { vote: "NO", reason: "Insufficient balance" };
  }

  if (service === "inventory" && s.stock <= 0) {
    logEvent(txId, `${s.name}: VOTE NO (out of stock)`, "error");
    return { vote: "NO", reason: "Out of stock" };
  }

  // Vote YES — lock resources, save prepared state
  s.locked = true;
  s.preparedValue = amount;
  logEvent(txId, `${s.name}: VOTE YES ✅ (resources LOCKED, waiting for commit/abort)`, "prepare");
  return { vote: "YES" };
}

// ─── Phase 2: COMMIT — "Go ahead and commit" ────────────────────────────────

function commit(txId, service) {
  const s = services[service];
  if (service === "payment") s.balance -= s.preparedValue;
  if (service === "inventory") s.stock -= 1;
  if (service === "notification") s.sent.push(`Order TX-${txId} confirmed`);
  s.locked = false;
  s.preparedValue = null;
  logEvent(txId, `${s.name}: COMMITTED ✅ (resources released)`, "commit");
}

// ─── Phase 2 (alt): ABORT — "Roll back, forget it" ──────────────────────────

function abort(txId, service) {
  const s = services[service];
  s.locked = false;
  s.preparedValue = null;
  logEvent(txId, `${s.name}: ABORTED ↩️ (resources released)`, "abort");
}

// ─── 2PC Coordinator ─────────────────────────────────────────────────────────

app.post("/place-order", express.json(), async (req, res) => {
  const { amount = 640, failService, simulateCrash } = req.body;
  const txId = ++transactionCounter;
  logEvent(txId, `COORDINATOR: Starting 2PC for order ₹${amount}`, "coord");

  // ── PHASE 1: PREPARE ──
  logEvent(txId, "═══ PHASE 1: PREPARE (Can you commit?) ═══", "phase");

  const votes = {};
  for (const svc of ["payment", "inventory", "notification"]) {
    votes[svc] = prepare(txId, svc, amount, svc === failService);
  }

  const allYes = Object.values(votes).every((v) => v.vote === "YES");

  // ── Simulate coordinator crash AFTER prepare, BEFORE commit ──
  if (simulateCrash && allYes) {
    logEvent(txId, "💀 COORDINATOR CRASHED after prepare, before Phase 2!", "crash");
    logEvent(txId, "All participants voted YES. Resources are LOCKED.", "crash");
    logEvent(txId, "Nobody will send COMMIT or ABORT.", "crash");
    logEvent(txId, "Participants are STUCK — can't commit, can't abort. THIS IS THE BLOCKING PROBLEM.", "crash");
    return res.json({ txId, result: "COORDINATOR_CRASHED", log: transactionLog.filter((e) => e.txId === txId) });
  }

  // ── PHASE 2: COMMIT or ABORT ──
  if (allYes) {
    logEvent(txId, "═══ PHASE 2: COMMIT (All voted YES) ═══", "phase");
    logEvent(txId, "COORDINATOR: Logging COMMIT decision to disk (crash recovery)", "coord");
    for (const svc of ["payment", "inventory", "notification"]) {
      commit(txId, svc);
    }
    logEvent(txId, "COORDINATOR: Transaction COMMITTED ✅", "coord");
    return res.json({ txId, result: "COMMITTED", log: transactionLog.filter((e) => e.txId === txId) });
  } else {
    logEvent(txId, "═══ PHASE 2: ABORT (At least one voted NO) ═══", "phase");
    for (const svc of ["payment", "inventory", "notification"]) {
      abort(txId, svc);
    }
    logEvent(txId, "COORDINATOR: Transaction ABORTED ↩️", "coord");
    return res.json({ txId, result: "ABORTED", log: transactionLog.filter((e) => e.txId === txId) });
  }
});

// Reset locked state (after crash demo)
app.post("/reset", (req, res) => {
  for (const svc of Object.values(services)) {
    svc.locked = false;
    svc.preparedValue = null;
  }
  services.payment.balance = 10000;
  services.inventory.stock = 5;
  services.notification.sent = [];
  transactionLog = [];
  transactionCounter = 0;
  res.json({ ok: true });
});

app.get("/api/state", (req, res) => {
  res.json({ services, log: transactionLog });
});

app.use(express.static(path.join(__dirname, "public")));

app.listen(PORT, () => {
  console.log(`\n  2PC demo → http://localhost:${PORT}\n`);
});
