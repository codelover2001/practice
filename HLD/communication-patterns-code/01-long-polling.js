/*
 * LONG POLLING — Run: node 01-long-polling.js → open http://localhost:3001
 *
 * How to test:
 *   1. Open http://localhost:3001 in your browser (the "customer" watching the order)
 *   2. Open a second tab or use curl to update the order status:
 *        curl -X POST http://localhost:3001/update-order -H "Content-Type: application/json" -d '{"status":"PREPARING"}'
 *        curl -X POST http://localhost:3001/update-order -H "Content-Type: application/json" -d '{"status":"OUT_FOR_DELIVERY"}'
 *        curl -X POST http://localhost:3001/update-order -H "Content-Type: application/json" -d '{"status":"DELIVERED"}'
 *   3. Watch the first tab — it gets the update near-instantly despite using plain HTTP.
 *
 * What's happening under the hood:
 *   - Client makes a GET request.
 *   - Server HOLDS the connection open (doesn't respond yet).
 *   - Server checks every 500ms if the status changed.
 *   - If it changed → respond immediately.
 *   - If 30s pass with no change → respond with "no change", client reconnects.
 *   - The "long" in long polling = the server holds the request open.
 */

const express = require("express");
const app = express();
const PORT = 3001;

let orderStatus = "PLACED";

// ─── Long Polling endpoint ───────────────────────────────────────────────────

app.get("/poll/order/:id", async (req, res) => {
  const startTime = Date.now();
  const timeout = 30000;
  const clientKnows = req.query.lastStatus;

  while (Date.now() - startTime < timeout) {
    if (orderStatus !== clientKnows) {
      return res.json({ status: orderStatus, changed: true });
    }
    await new Promise((r) => setTimeout(r, 500));
  }

  res.json({ status: orderStatus, changed: false });
});

// ─── Status update endpoint (simulates restaurant/driver) ────────────────────

app.post("/update-order", express.json(), (req, res) => {
  const prev = orderStatus;
  orderStatus = req.body.status;
  console.log(`Status changed: ${prev} → ${orderStatus}`);
  res.json({ ok: true, previous: prev, current: orderStatus });
});

// ─── Serve a test page ───────────────────────────────────────────────────────

app.get("/", (req, res) => {
  res.send(`<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Long Polling Demo</title>
<style>
  body { font-family: monospace; background: #0d1117; color: #c9d1d9; padding: 30px; }
  h1 { color: #58a6ff; }
  #status { font-size: 28px; color: #7ee787; margin: 20px 0; }
  #log { background: #161b22; border: 1px solid #30363d; border-radius: 6px; padding: 16px;
         max-height: 400px; overflow-y: auto; font-size: 13px; line-height: 1.8; }
  .entry { border-bottom: 1px solid #21262d; padding: 4px 0; }
  .time { color: #8b949e; }
  .highlight { color: #ffa657; font-weight: bold; }
  button { background: #238636; color: #fff; border: none; padding: 8px 16px;
           border-radius: 6px; cursor: pointer; font-family: monospace; font-size: 14px; margin: 4px; }
  button:hover { background: #2ea043; }
</style></head><body>
  <h1>Long Polling Demo</h1>
  <p>Current order status:</p>
  <div id="status">PLACED</div>
  <p>Click buttons to simulate status changes (or use curl):</p>
  <button onclick="updateStatus('PREPARING')">PREPARING</button>
  <button onclick="updateStatus('READY')">READY</button>
  <button onclick="updateStatus('OUT_FOR_DELIVERY')">OUT_FOR_DELIVERY</button>
  <button onclick="updateStatus('DELIVERED')">DELIVERED</button>
  <h3>Event Log</h3>
  <div id="log"></div>
<script>
  const logEl = document.getElementById('log');
  const statusEl = document.getElementById('status');

  function log(msg, type) {
    const t = new Date().toLocaleTimeString();
    logEl.innerHTML = '<div class="entry"><span class="time">[' + t + ']</span> '
      + (type === 'highlight' ? '<span class="highlight">' + msg + '</span>' : msg) + '</div>' + logEl.innerHTML;
  }

  async function updateStatus(s) {
    await fetch('/update-order', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({status: s}) });
    log('You triggered status → ' + s, 'highlight');
  }

  async function startPolling() {
    let lastStatus = null;
    log('Long polling started. Waiting for updates...');

    while (true) {
      try {
        const start = Date.now();
        log('→ Request sent (connection held open by server...)');
        const res = await fetch('/poll/order/456?lastStatus=' + lastStatus);
        const data = await res.json();
        const elapsed = ((Date.now() - start) / 1000).toFixed(1);

        if (data.changed) {
          lastStatus = data.status;
          statusEl.textContent = data.status;
          log('← Response after ' + elapsed + 's: STATUS CHANGED → ' + data.status, 'highlight');
        } else {
          log('← Response after ' + elapsed + 's: no change (timeout). Reconnecting...');
        }
      } catch (e) {
        log('Connection error. Retrying in 3s...');
        await new Promise(r => setTimeout(r, 3000));
      }
    }
  }

  startPolling();
</script></body></html>`);
});

app.listen(PORT, () => {
  console.log(`\n  LONG POLLING demo running → http://localhost:${PORT}\n`);
  console.log("  Update status with:");
  console.log(`  curl -X POST http://localhost:${PORT}/update-order -H "Content-Type: application/json" -d '{"status":"PREPARING"}'\n`);
});
