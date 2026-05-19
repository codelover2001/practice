/*
 * THREE-PHASE COMMIT (3PC) — Run: node server.js → http://localhost:4002
 *
 * 3PC adds a PRE-COMMIT phase between prepare and commit to solve 2PC's
 * blocking problem. After pre-commit, participants KNOW everyone agreed,
 * so they can independently commit if the coordinator crashes.
 *
 * What to test:
 *   1. "Happy Path" — prepare → pre-commit → commit (3 phases visible)
 *   2. "Participant fails at prepare" — vote NO → abort (same as 2PC)
 *   3. "Coordinator crashes AFTER pre-commit" — participants can PROCEED
 *      because they know everyone voted YES. Compare this to 2PC where
 *      they'd be stuck.
 *   4. "Coordinator crashes BEFORE pre-commit" — participants ABORT safely
 *      because they haven't received pre-commit yet.
 *
 * WHY 3PC ISN'T WIDELY USED:
 *   - Still fails under network partitions (split brain: one side commits,
 *     other aborts because pre-commit never arrived)
 *   - More messages (3 rounds vs 2)
 *   - SAGA pattern is preferred in practice
 */

const express = require("express");
const path = require("path");
const app = express();
const PORT = 4002;

const services = {
  payment:   { name: "Payment",   balance: 10000, locked: false, state: "INIT" },
  inventory: { name: "Inventory", stock: 5,       locked: false, state: "INIT" },
  notification: { name: "Notification", sent: [], locked: false, state: "INIT" },
};

let txLog = [];
let txCounter = 0;

function log(txId, msg, type) {
  txLog.unshift({ txId, msg, type, time: new Date().toISOString() });
}

function prepare(txId, svc, amount, fail) {
  const s = services[svc];
  if (fail) { log(txId, `${s.name}: VOTE NO ❌ (simulated failure)`, "error"); return "NO"; }
  if (s.locked) { log(txId, `${s.name}: VOTE NO ❌ (locked)`, "error"); return "NO"; }
  if (svc === "payment" && s.balance < amount) { log(txId, `${s.name}: VOTE NO ❌ (insufficient)`, "error"); return "NO"; }
  if (svc === "inventory" && s.stock <= 0) { log(txId, `${s.name}: VOTE NO ❌ (no stock)`, "error"); return "NO"; }
  s.locked = true;
  s.state = "PREPARED";
  log(txId, `${s.name}: VOTE YES ✅ → state=PREPARED (resources locked)`, "prepare");
  return "YES";
}

function preCommit(txId, svc) {
  const s = services[svc];
  s.state = "PRE-COMMITTED";
  log(txId, `${s.name}: ACK pre-commit → state=PRE-COMMITTED (safe to commit independently)`, "precommit");
}

function doCommit(txId, svc, amount) {
  const s = services[svc];
  if (svc === "payment") s.balance -= amount;
  if (svc === "inventory") s.stock -= 1;
  if (svc === "notification") s.sent.push(`TX-${txId}`);
  s.locked = false;
  s.state = "COMMITTED";
  log(txId, `${s.name}: COMMITTED ✅`, "commit");
}

function doAbort(txId, svc) {
  const s = services[svc];
  s.locked = false;
  s.state = "ABORTED";
  log(txId, `${s.name}: ABORTED ↩️`, "abort");
}

const SVCS = ["payment", "inventory", "notification"];

app.post("/place-order", express.json(), (req, res) => {
  const { amount = 640, failService, crashAfterPreCommit, crashBeforePreCommit } = req.body;
  const txId = ++txCounter;
  log(txId, `COORDINATOR: Starting 3PC for ₹${amount}`, "coord");

  // ── PHASE 1: PREPARE ──
  log(txId, "═══ PHASE 1: PREPARE (Can you commit?) ═══", "phase");
  const votes = {};
  SVCS.forEach((svc) => { votes[svc] = prepare(txId, svc, amount, svc === failService); });
  const allYes = SVCS.every((svc) => votes[svc] === "YES");

  if (!allYes) {
    log(txId, "═══ ABORT (at least one NO — skip pre-commit, go straight to abort) ═══", "phase");
    SVCS.forEach((svc) => doAbort(txId, svc));
    log(txId, "COORDINATOR: ABORTED ↩️", "coord");
    return res.json({ txId, result: "ABORTED", log: txLog.filter((e) => e.txId === txId) });
  }

  // ── Crash BEFORE pre-commit ──
  if (crashBeforePreCommit) {
    log(txId, "💀 COORDINATOR CRASHES before sending pre-commit!", "crash");
    log(txId, "Participants are in PREPARED state. No pre-commit received.", "crash");
    log(txId, "After timeout: participants know pre-commit never came → ABORT safely.", "crash");
    log(txId, "This is WHERE 3PC IMPROVES on 2PC — participants can safely abort.", "crash");
    SVCS.forEach((svc) => doAbort(txId, svc));
    log(txId, "All participants timed out and ABORTED (safe, no blocking!)", "abort");
    return res.json({ txId, result: "SAFE_ABORT_AFTER_CRASH", log: txLog.filter((e) => e.txId === txId) });
  }

  // ── PHASE 2: PRE-COMMIT ──
  log(txId, "═══ PHASE 2: PRE-COMMIT (Everyone voted YES, prepare to commit) ═══", "phase");
  log(txId, "COORDINATOR: All voted YES. Sending PRE-COMMIT to all.", "coord");
  SVCS.forEach((svc) => preCommit(txId, svc));

  // ── Crash AFTER pre-commit ──
  if (crashAfterPreCommit) {
    log(txId, "💀 COORDINATOR CRASHES after pre-commit, before final commit!", "crash");
    log(txId, "Participants are PRE-COMMITTED. They KNOW everyone agreed.", "crash");
    log(txId, "After timeout: participants proceed to COMMIT independently.", "crash");
    log(txId, "In 2PC they'd be STUCK. In 3PC they can proceed. THIS is the fix.", "crash");
    SVCS.forEach((svc) => doCommit(txId, svc, amount));
    log(txId, "All participants timed out and COMMITTED independently ✅", "commit");
    return res.json({ txId, result: "INDEPENDENT_COMMIT_AFTER_CRASH", log: txLog.filter((e) => e.txId === txId) });
  }

  // ── PHASE 3: COMMIT ──
  log(txId, "═══ PHASE 3: COMMIT ═══", "phase");
  SVCS.forEach((svc) => doCommit(txId, svc, amount));
  log(txId, "COORDINATOR: Transaction COMMITTED ✅", "coord");
  return res.json({ txId, result: "COMMITTED", log: txLog.filter((e) => e.txId === txId) });
});

app.post("/reset", (req, res) => {
  SVCS.forEach((k) => { services[k].locked = false; services[k].state = "INIT"; });
  services.payment.balance = 10000; services.inventory.stock = 5; services.notification.sent = [];
  txLog = []; txCounter = 0;
  res.json({ ok: true });
});

app.get("/api/state", (req, res) => res.json({ services, log: txLog }));
app.use(express.static(path.join(__dirname, "public")));

app.listen(PORT, () => {
  console.log(`\n  3PC demo → http://localhost:${PORT}\n`);
});
