/*
 * WEBHOOKS — Run: node 04-webhooks.js → open http://localhost:3004
 *
 * How to test:
 *   1. Open http://localhost:3004 — it shows a dashboard of received webhooks.
 *   2. Simulate Razorpay calling your webhook:
 *        curl -X POST http://localhost:3004/webhooks/razorpay \
 *             -H "Content-Type: application/json" \
 *             -H "x-razorpay-signature: VALID" \
 *             -d '{"event":"payment.captured","event_id":"evt_001","payload":{"payment":{"id":"pay_abc","amount":64000,"order_id":"ord_456","method":"upi"}}}'
 *   3. Try with a bad signature:
 *        curl -X POST http://localhost:3004/webhooks/razorpay \
 *             -H "Content-Type: application/json" \
 *             -H "x-razorpay-signature: HACKER" \
 *             -d '{"event":"payment.captured","event_id":"evt_002","payload":{"payment":{"id":"pay_xyz","amount":99999,"order_id":"ord_999"}}}'
 *   4. Try sending the same event_id twice — idempotency kicks in.
 *   5. Or just use the buttons on the page.
 *
 * What's happening:
 *   - YOUR server exposes a POST endpoint.
 *   - Razorpay (or any external service) POSTs to it when an event occurs.
 *   - You verify the signature (is this really Razorpay or a hacker?).
 *   - You check idempotency (did I already process this event?).
 *   - You process the event and respond 200 quickly.
 *   - No browser involved in the webhook itself — it's server-to-server.
 */

const express = require("express");
const crypto = require("crypto");
const app = express();
const PORT = 3004;

const WEBHOOK_SECRET = "your_razorpay_secret_key";
const processedEvents = new Set();
const webhookLog = [];

// ─── Webhook receiver endpoint ───────────────────────────────────────────────

app.post("/webhooks/razorpay", express.json(), (req, res) => {
  const receivedSig = req.headers["x-razorpay-signature"];
  const entry = { timestamp: new Date().toISOString(), body: req.body };

  // STEP 1: Verify signature
  // In production, Razorpay signs the raw body with HMAC-SHA256 using your secret.
  // Here we simplify: signature must equal "VALID" or the real HMAC.
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

  // STEP 2: Idempotency check
  const eventId = req.body.event_id;
  if (processedEvents.has(eventId)) {
    entry.result = "SKIPPED — already processed (idempotent)";
    webhookLog.unshift(entry);
    console.log(`Duplicate webhook ${eventId} — already processed, returning 200`);
    return res.status(200).json({ ok: true, message: "Already processed" });
  }

  // STEP 3: Process the event
  const event = req.body.event;
  const payment = req.body.payload?.payment;

  if (event === "payment.captured") {
    entry.result = `PROCESSED — payment ${payment.id} captured, ₹${payment.amount / 100} for order ${payment.order_id}`;
    console.log(entry.result);
  } else if (event === "payment.failed") {
    entry.result = `PROCESSED — payment ${payment?.id} failed`;
    console.log(entry.result);
  } else {
    entry.result = `PROCESSED — unknown event type: ${event}`;
  }

  processedEvents.add(eventId);
  webhookLog.unshift(entry);

  // STEP 4: Respond 200 fast. Heavy work should be done async.
  res.status(200).json({ ok: true });
});

// ─── Dashboard + API to see received webhooks ────────────────────────────────

app.get("/api/log", (req, res) => res.json(webhookLog));

app.get("/", (req, res) => {
  res.send(`<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Webhooks Demo</title>
<style>
  body { font-family: monospace; background: #0d1117; color: #c9d1d9; padding: 30px; }
  h1 { color: #58a6ff; }
  #log { background: #161b22; border: 1px solid #30363d; border-radius: 6px; padding: 16px;
         max-height: 500px; overflow-y: auto; font-size: 12px; line-height: 1.7; }
  .processed { color: #7ee787; }
  .rejected { color: #f85149; }
  .skipped { color: #d29922; }
  .time { color: #8b949e; }
  .entry { border-bottom: 1px solid #21262d; padding: 8px 0; }
  button { background: #238636; color: #fff; border: none; padding: 8px 16px;
           border-radius: 6px; cursor: pointer; font-family: monospace; font-size: 13px; margin: 4px; }
  button:hover { background: #2ea043; }
  .red { background: #da3633; }
  .red:hover { background: #f85149; }
  .yellow { background: #9e6a03; }
  .yellow:hover { background: #d29922; }
</style></head><body>
  <h1>Webhooks Demo (receiver dashboard)</h1>
  <p>Simulate Razorpay calling your webhook endpoint:</p>
  <button onclick="sendWebhook('payment.captured','evt_' + Date.now(),'VALID')">Valid payment.captured</button>
  <button onclick="sendWebhook('payment.failed','evt_fail_' + Date.now(),'VALID')" class="yellow">Valid payment.failed</button>
  <button onclick="sendWebhook('payment.captured','evt_hack','BAD_SIG')" class="red">Invalid signature (hacker)</button>
  <button onclick="sendWebhook('payment.captured','evt_dupe','VALID')">Send same event_id twice</button>
  <h3>Received Webhooks</h3>
  <div id="log">Loading...</div>
<script>
  const logEl = document.getElementById('log');

  async function sendWebhook(event, eventId, sig) {
    await fetch('/webhooks/razorpay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-razorpay-signature': sig },
      body: JSON.stringify({
        event: event,
        event_id: eventId,
        payload: { payment: { id: 'pay_' + Math.random().toString(36).slice(2,8), amount: 64000, order_id: 'ord_456', method: 'upi' } }
      })
    });
    refreshLog();
  }

  async function refreshLog() {
    const data = await fetch('/api/log').then(r => r.json());
    if (!data.length) { logEl.innerHTML = '<div style="color:#8b949e">No webhooks received yet.</div>'; return; }
    logEl.innerHTML = data.map(e => {
      const cls = e.result.startsWith('REJECTED') ? 'rejected' : e.result.startsWith('SKIPPED') ? 'skipped' : 'processed';
      return '<div class="entry"><span class="time">' + e.timestamp + '</span><br>'
        + '<span class="' + cls + '">' + e.result + '</span><br>'
        + '<span style="color:#8b949e;font-size:11px">event_id: ' + (e.body.event_id||'?') + ' | event: ' + (e.body.event||'?') + '</span></div>';
    }).join('');
  }

  refreshLog();
  setInterval(refreshLog, 2000);
</script></body></html>`);
});

app.listen(PORT, () => {
  console.log(`\n  WEBHOOKS demo running → http://localhost:${PORT}\n`);
  console.log("  Simulate a webhook call:");
  console.log(`  curl -X POST http://localhost:${PORT}/webhooks/razorpay -H "Content-Type: application/json" -H "x-razorpay-signature: VALID" -d '{"event":"payment.captured","event_id":"evt_001","payload":{"payment":{"id":"pay_abc","amount":64000,"order_id":"ord_456"}}}'\n`);
});
