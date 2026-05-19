/*
 * OUTBOX PATTERN — Run: node server.js → http://localhost:4004
 *
 * THE DUAL WRITE PROBLEM:
 *   await db.insert("orders", order);          // write 1: DB
 *   await kafka.publish("order.placed", order); // write 2: Kafka
 *
 *   DB succeeds + Kafka fails → order exists, nobody notified.
 *   Kafka succeeds + DB fails → event for non-existent order.
 *   You CANNOT make two writes atomic without 2PC.
 *
 * THE OUTBOX SOLUTION:
 *   Write BOTH the order AND the event in ONE database transaction.
 *   A separate "publisher" process reads the outbox and publishes to Kafka.
 *
 *   BEGIN;
 *     INSERT INTO orders ...;
 *     INSERT INTO outbox (event_type, payload) ...;
 *   COMMIT;
 *
 *   Both succeed or both fail. No dual write.
 *
 * What to test:
 *   1. "Dual Write (broken)" — DB succeeds, Kafka fails. Order exists, no event. Inconsistent.
 *   2. "Dual Write (broken)" — DB fails, Kafka succeeds. Event for nothing. Inconsistent.
 *   3. "Outbox (correct)" — Both written in one tx. Publisher picks up outbox and publishes.
 *   4. "Start Publisher" — simulates CDC/poller reading outbox → publishing to Kafka.
 *   5. "Publisher crash + restart" — publisher crashes mid-publish, restarts, picks up where it left off.
 */

const express = require("express");
const path = require("path");
const app = express();
const PORT = 4004;

// ─── Simulated databases ─────────────────────────────────────────────────────

const ordersDB = [];
const outboxTable = [];
const kafkaEvents = [];
let publisherInterval = null;
let eventLog = [];
let orderCounter = 0;

function log(msg, type) {
  eventLog.unshift({ msg, type, time: new Date().toISOString() });
}

// ─── BROKEN: Dual Write approach ─────────────────────────────────────────────

app.post("/dual-write", express.json(), (req, res) => {
  const { failAt } = req.body;
  const orderId = `ORD-${++orderCounter}`;

  log(`── DUAL WRITE attempt for ${orderId} ──`, "phase");

  // Write 1: DB
  if (failAt === "db") {
    log(`DB INSERT: FAILED ❌ (simulated DB crash)`, "error");
    // Kafka might still succeed...
    if (failAt !== "kafka") {
      kafkaEvents.push({ type: "order.placed", orderId, published: true });
      log(`Kafka PUBLISH: succeeded ✅ ... but order doesn't exist in DB!`, "error");
      log(`INCONSISTENT: Kafka has event for non-existent order!`, "crash");
    }
    return res.json({ result: "INCONSISTENT", log: eventLog.slice(0, 10) });
  }

  ordersDB.push({ id: orderId, status: "PLACED", amount: 640 });
  log(`DB INSERT: ${orderId} → orders table ✅`, "step");

  // Write 2: Kafka
  if (failAt === "kafka") {
    log(`Kafka PUBLISH: FAILED ❌ (simulated Kafka timeout)`, "error");
    log(`INCONSISTENT: Order ${orderId} exists in DB, but NO event published!`, "crash");
    log(`Downstream services (notification, restaurant) never learn about this order.`, "crash");
    return res.json({ result: "INCONSISTENT", log: eventLog.slice(0, 10) });
  }

  kafkaEvents.push({ type: "order.placed", orderId, published: true });
  log(`Kafka PUBLISH: order.placed for ${orderId} ✅`, "step");
  log(`Both succeeded this time. But next time? No guarantee.`, "coord");

  return res.json({ result: "OK_BUT_FRAGILE", log: eventLog.slice(0, 10) });
});

// ─── CORRECT: Outbox approach ────────────────────────────────────────────────

app.post("/outbox-write", express.json(), (req, res) => {
  const orderId = `ORD-${++orderCounter}`;

  log(`── OUTBOX approach for ${orderId} ──`, "phase");
  log(`BEGIN TRANSACTION`, "coord");

  // Single "transaction" — both writes to the SAME database
  ordersDB.push({ id: orderId, status: "PLACED", amount: 640 });
  log(`  INSERT INTO orders: ${orderId} ✅`, "step");

  outboxTable.push({
    id: `EVT-${orderCounter}`,
    eventType: "order.placed",
    payload: JSON.stringify({ orderId, amount: 640 }),
    published: false,
    createdAt: new Date().toISOString(),
  });
  log(`  INSERT INTO outbox: order.placed for ${orderId} ✅`, "step");

  log(`COMMIT ✅ — Both order and outbox event in ONE transaction`, "coord");
  log(`Event sits in outbox. Publisher will pick it up and send to Kafka.`, "coord");

  return res.json({ result: "COMMITTED", log: eventLog.slice(0, 10) });
});

// ─── Outbox Publisher (simulates CDC / poller) ───────────────────────────────

app.post("/start-publisher", (req, res) => {
  if (publisherInterval) {
    log(`Publisher already running`, "coord");
    return res.json({ ok: true });
  }

  log(`PUBLISHER STARTED — polling outbox every 2 seconds`, "coord");

  publisherInterval = setInterval(() => {
    const unpublished = outboxTable.filter((e) => !e.published);
    if (unpublished.length === 0) return;

    unpublished.forEach((event) => {
      // "Publish" to Kafka
      kafkaEvents.push({
        type: event.eventType,
        orderId: JSON.parse(event.payload).orderId,
        published: true,
      });
      event.published = true;
      log(`PUBLISHER → Kafka: ${event.eventType} (${event.id}) ✅`, "publish");
    });
  }, 2000);

  return res.json({ ok: true });
});

app.post("/stop-publisher", (req, res) => {
  if (publisherInterval) {
    clearInterval(publisherInterval);
    publisherInterval = null;
    log(`PUBLISHER STOPPED (simulating crash)`, "crash");
    log(`Unpublished outbox events will wait. When publisher restarts, it picks them up.`, "crash");
  }
  return res.json({ ok: true });
});

app.post("/reset", (req, res) => {
  ordersDB.length = 0;
  outboxTable.length = 0;
  kafkaEvents.length = 0;
  eventLog = [];
  orderCounter = 0;
  if (publisherInterval) { clearInterval(publisherInterval); publisherInterval = null; }
  res.json({ ok: true });
});

app.get("/api/state", (req, res) => {
  res.json({
    orders: ordersDB,
    outbox: outboxTable,
    kafka: kafkaEvents,
    publisherRunning: !!publisherInterval,
    log: eventLog,
  });
});

app.use(express.static(path.join(__dirname, "public")));

app.listen(PORT, () => {
  console.log(`\n  OUTBOX PATTERN demo → http://localhost:${PORT}\n`);
});
