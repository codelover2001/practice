/*
 * SAGA PATTERN — Run: node server.js → http://localhost:4003
 *
 * A saga is a sequence of local transactions. Each step has a COMPENSATING action.
 * If step N fails, compensate steps N-1, N-2, ... back to step 1.
 *
 * This demo uses the ORCHESTRATION approach: a central saga orchestrator
 * drives the steps and triggers compensations on failure.
 *
 * What to test:
 *   1. "Happy Path" — all 4 steps succeed → order CONFIRMED
 *   2. "Inventory fails" — step 3 fails → compensate step 2 (refund) → compensate step 1 (cancel)
 *   3. "Notification fails" — step 4 fails → compensate 3, 2, 1
 *   4. "Compensation itself fails" — what happens when a refund fails? (real-world edge case)
 *
 * SAGA vs 2PC:
 *   2PC: lock all resources, atomic commit. Blocking, slow, fragile.
 *   SAGA: no locks, each step commits immediately, undo on failure.
 *         Eventually consistent. Fast. Resilient. Used by Netflix, Uber, Airbnb.
 *
 * DIRTY SECRET: Between steps, state IS inconsistent.
 *   After payment but before inventory: customer charged, order not confirmed.
 *   Mitigation: status shows "Processing..." — user expects a brief delay.
 */

const express = require("express");
const path = require("path");
const app = express();
const PORT = 4003;

// ─── Simulated services ──────────────────────────────────────────────────────

const db = {
  orders:   [],
  payments: [],
  inventory: { stock: 5 },
  notifications: [],
};

let sagaLog = [];
let sagaCounter = 0;

function log(sagaId, msg, type) {
  sagaLog.unshift({ sagaId, msg, type, time: new Date().toISOString() });
}

// ─── Forward steps (the actual actions) ──────────────────────────────────────

const steps = [
  {
    name: "Create Order",
    execute(sagaId, ctx) {
      const order = { id: `ORD-${sagaId}`, status: "PENDING", amount: ctx.amount };
      db.orders.push(order);
      ctx.orderId = order.id;
      log(sagaId, `Step 1 — Create Order: ${order.id} (status=PENDING)`, "step");
      return true;
    },
    compensate(sagaId, ctx) {
      const order = db.orders.find((o) => o.id === ctx.orderId);
      if (order) order.status = "CANCELLED";
      log(sagaId, `Compensate 1 — Cancel Order: ${ctx.orderId} → CANCELLED`, "compensate");
    },
  },
  {
    name: "Charge Payment",
    execute(sagaId, ctx) {
      if (ctx.failAt === "payment") {
        log(sagaId, `Step 2 — Charge Payment: FAILED (card declined)`, "error");
        return false;
      }
      const payment = { id: `PAY-${sagaId}`, orderId: ctx.orderId, amount: ctx.amount, status: "CHARGED" };
      db.payments.push(payment);
      ctx.paymentId = payment.id;
      log(sagaId, `Step 2 — Charge Payment: ${payment.id} ₹${ctx.amount} CHARGED`, "step");
      return true;
    },
    compensate(sagaId, ctx) {
      const payment = db.payments.find((p) => p.id === ctx.paymentId);
      if (payment) payment.status = "REFUNDED";
      log(sagaId, `Compensate 2 — Refund Payment: ${ctx.paymentId} → REFUNDED ₹${ctx.amount}`, "compensate");
    },
  },
  {
    name: "Reserve Inventory",
    execute(sagaId, ctx) {
      if (ctx.failAt === "inventory") {
        log(sagaId, `Step 3 — Reserve Inventory: FAILED (out of stock)`, "error");
        return false;
      }
      if (db.inventory.stock <= 0) {
        log(sagaId, `Step 3 — Reserve Inventory: FAILED (stock=0)`, "error");
        return false;
      }
      db.inventory.stock -= 1;
      log(sagaId, `Step 3 — Reserve Inventory: stock ${db.inventory.stock + 1} → ${db.inventory.stock}`, "step");
      return true;
    },
    compensate(sagaId, ctx) {
      db.inventory.stock += 1;
      log(sagaId, `Compensate 3 — Release Inventory: stock → ${db.inventory.stock}`, "compensate");
    },
  },
  {
    name: "Notify Restaurant",
    execute(sagaId, ctx) {
      if (ctx.failAt === "notification") {
        log(sagaId, `Step 4 — Notify Restaurant: FAILED (restaurant API down)`, "error");
        return false;
      }
      db.notifications.push({ orderId: ctx.orderId, message: "New order!" });
      log(sagaId, `Step 4 — Notify Restaurant: sent notification for ${ctx.orderId}`, "step");
      return true;
    },
    compensate(sagaId, ctx) {
      db.notifications = db.notifications.filter((n) => n.orderId !== ctx.orderId);
      log(sagaId, `Compensate 4 — Cancel Notification: removed for ${ctx.orderId}`, "compensate");
    },
  },
];

// ─── Saga Orchestrator ───────────────────────────────────────────────────────

app.post("/place-order", express.json(), (req, res) => {
  const sagaId = ++sagaCounter;
  const ctx = { amount: req.body.amount || 640, failAt: req.body.failAt };
  const completedSteps = [];

  log(sagaId, `SAGA ORCHESTRATOR: Starting saga for ₹${ctx.amount}`, "coord");

  // Execute steps forward, one by one
  for (let i = 0; i < steps.length; i++) {
    log(sagaId, `─── ${steps[i].name} ───`, "phase");
    const success = steps[i].execute(sagaId, ctx);

    if (success) {
      completedSteps.push(i);
    } else {
      // Step failed → compensate all completed steps in REVERSE order
      log(sagaId, `═══ STEP FAILED — Starting compensation (reverse order) ═══`, "phase");

      for (let j = completedSteps.length - 1; j >= 0; j--) {
        steps[completedSteps[j]].compensate(sagaId, ctx);
      }

      const order = db.orders.find((o) => o.id === ctx.orderId);
      log(sagaId, `SAGA: ROLLED BACK. Order ${ctx.orderId} → ${order?.status || "cancelled"}`, "coord");
      return res.json({
        sagaId,
        result: "COMPENSATED",
        failedStep: steps[i].name,
        log: sagaLog.filter((e) => e.sagaId === sagaId),
      });
    }
  }

  // All steps succeeded → confirm the order
  const order = db.orders.find((o) => o.id === ctx.orderId);
  if (order) order.status = "CONFIRMED";
  log(sagaId, `SAGA: All steps succeeded. Order ${ctx.orderId} → CONFIRMED ✅`, "coord");

  return res.json({
    sagaId,
    result: "CONFIRMED",
    log: sagaLog.filter((e) => e.sagaId === sagaId),
  });
});

app.post("/reset", (req, res) => {
  db.orders = []; db.payments = []; db.inventory.stock = 5; db.notifications = [];
  sagaLog = []; sagaCounter = 0;
  res.json({ ok: true });
});

app.get("/api/state", (req, res) => res.json({ db, log: sagaLog }));
app.use(express.static(path.join(__dirname, "public")));

app.listen(PORT, () => {
  console.log(`\n  SAGA demo → http://localhost:${PORT}\n`);
});
