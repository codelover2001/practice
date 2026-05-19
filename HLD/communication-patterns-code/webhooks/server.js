/*
 * WEBHOOKS — Node.js Server
 *
 * Run:  node server.js  →  open http://localhost:3004
 *
 * How to test:
 *   1. Open http://localhost:3004 — dashboard showing received webhooks.
 *   2. Click buttons to simulate Razorpay calling your endpoint.
 *   3. Or use curl:
 *        curl -X POST http://localhost:3004/webhooks/razorpay \
 *          -H "Content-Type: application/json" \
 *          -H "x-razorpay-signature: VALID" \
 *          -d '{"event":"payment.captured","event_id":"evt_001","payload":{"payment":{"id":"pay_abc","amount":64000,"order_id":"ord_456","method":"upi"}}}'
 *   4. Try invalid signature:
 *        curl -X POST http://localhost:3004/webhooks/razorpay \
 *          -H "x-razorpay-signature: HACKER" \
 *          -H "Content-Type: application/json" \
 *          -d '{"event":"payment.captured","event_id":"evt_hack","payload":{"payment":{"id":"pay_xyz","amount":99999}}}'
 *   5. Send same event_id twice — idempotency check skips the duplicate.
 *
 * HOW WEBHOOKS DIFFER FROM SSE/WEBSOCKET:
 *   SSE/WebSocket: server pushes to a BROWSER (client).
 *   Webhooks:      server pushes to another SERVER. No browser involved.
 *
 *   Razorpay doesn't open a WebSocket to you. It just POSTs to your URL
 *   when an event happens. Your server is the "client" in this case.
 *
 * THREE CRITICAL THINGS:
 *   1. Verify signature — anyone can POST to your endpoint, not just Razorpay
 *   2. Be idempotent — Razorpay retries on failure, you'll get duplicates
 *   3. Respond fast (200 OK) — do heavy work async, or Razorpay thinks you're down
 */

const express = require("express");
const crypto = require("crypto");
const path = require("path");
const app = express();
const PORT = 3004;

const WEBHOOK_SECRET = "your_razorpay_secret_key";
const processedEvents = new Set();
const webhookLog = []; // in-memory log for the dashboard

// ─── Webhook receiver endpoint ───────────────────────────────────────────────

app.post("/webhooks/razorpay", express.json(), (req, res) => {
  const receivedSig = req.headers["x-razorpay-signature"];
  const entry = { timestamp: new Date().toISOString(), body: req.body };

  // STEP 1: Verify signature.
  // In production, Razorpay signs the raw body with HMAC-SHA256 using your secret.
  // We accept "VALID" as a shortcut for the demo buttons.
  const expectedSig = crypto
    .createHmac("sha256", WEBHOOK_SECRET)
    .update(JSON.stringify(req.body))
    .digest("hex");

  const sigValid = receivedSig === expectedSig || receivedSig === "VALID";

  if (!sigValid) {
    entry.result = "REJECTED — invalid signature";
    webhookLog.unshift(entry);
    console.log("WEBHOOK REJECTED: invalid signature");
    return res.status(401).json({ error: "Invalid signature" });
  }

  // STEP 2: Idempotency.
  // Razorpay retries if you don't return 200, or if your server was slow.
  // You WILL get the same event multiple times. Process it only once.
  const eventId = req.body.event_id;
  if (processedEvents.has(eventId)) {
    entry.result = "SKIPPED — already processed (idempotent)";
    webhookLog.unshift(entry);
    console.log(`Duplicate webhook ${eventId} — skipped`);
    return res.status(200).json({ ok: true, message: "Already processed" });
  }

  // STEP 3: Process the event.
  const event = req.body.event;
  const payment = req.body.payload?.payment;

  if (event === "payment.captured") {
    entry.result = `PROCESSED — payment ${payment.id} captured, ₹${payment.amount / 100} for order ${payment.order_id} (${payment.method || "unknown"})`;
  } else if (event === "payment.failed") {
    entry.result = `PROCESSED — payment ${payment?.id} FAILED`;
  } else if (event === "refund.processed") {
    entry.result = `PROCESSED — refund for payment ${payment?.id}`;
  } else {
    entry.result = `PROCESSED — event: ${event}`;
  }

  console.log(entry.result);
  processedEvents.add(eventId);
  webhookLog.unshift(entry);

  // STEP 4: Return 200 fast.
  // Heavy processing (updating DB, sending SMS, notifying restaurant)
  // should be pushed to a message queue and done asynchronously.
  // If you take >30s, Razorpay retries.
  res.status(200).json({ ok: true });
});

// ─── API for dashboard to fetch the log ──────────────────────────────────────

app.get("/api/log", (req, res) => res.json(webhookLog));

// ─── Serve static files ──────────────────────────────────────────────────────

app.use(express.static(path.join(__dirname, "public")));

// ─── Start ───────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`\n  WEBHOOKS demo → http://localhost:${PORT}\n`);
  console.log("  Simulate webhook:");
  console.log(`  curl -X POST http://localhost:${PORT}/webhooks/razorpay \\`);
  console.log(`    -H "Content-Type: application/json" \\`);
  console.log(`    -H "x-razorpay-signature: VALID" \\`);
  console.log(`    -d '{"event":"payment.captured","event_id":"evt_001","payload":{"payment":{"id":"pay_abc","amount":64000,"order_id":"ord_456"}}}'\n`);
});
