/*
 * SERVER-SENT EVENTS (SSE) — Run: node 03-sse.js → open http://localhost:3003
 *
 * How to test:
 *   1. Open http://localhost:3003 in your browser.
 *   2. Push a status update via curl:
 *        curl -X POST http://localhost:3003/update-order -H "Content-Type: application/json" -d '{"status":"PREPARING"}'
 *   3. The browser receives it instantly — one-way push from server.
 *   4. Kill the server (Ctrl+C) and restart it. The browser auto-reconnects
 *      AND sends Last-Event-ID so the server can resume from where it left off.
 *
 * What's happening under the hood:
 *   - Client does `new EventSource('/events/order/456')` — one line, done.
 *   - Server responds with Content-Type: text/event-stream and keeps the connection open.
 *   - Server writes SSE-formatted lines: `id: ...\nevent: ...\ndata: ...\n\n`
 *   - Client CANNOT send messages back through this connection (use a separate POST).
 *   - Auto-reconnect + Last-Event-ID resume is built into the browser. Free.
 */

const express = require("express");
const app = express();
const PORT = 3003;

let orderStatus = "PLACED";
let eventId = 0;

// All active SSE connections — we push to these when status changes
const clients = [];

// ─── SSE endpoint ────────────────────────────────────────────────────────────

app.get("/events/order/:id", (req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  // If client reconnected, it sends the last event ID it received
  const lastId = req.headers["last-event-id"];
  if (lastId) {
    console.log(`Client reconnected. Last event they got: #${lastId}`);
    // In production: replay missed events from lastId+1 onward
  }

  // Send current status immediately so the client doesn't show a blank
  eventId++;
  res.write(`id: ${eventId}\n`);
  res.write(`event: order_update\n`);
  res.write(`data: ${JSON.stringify({ status: orderStatus, message: "Current status" })}\n\n`);

  clients.push(res);
  console.log(`SSE client connected (${clients.length} total)`);

  req.on("close", () => {
    const idx = clients.indexOf(res);
    if (idx !== -1) clients.splice(idx, 1);
    console.log(`SSE client disconnected (${clients.length} total)`);
  });
});

// ─── Broadcast to all SSE clients ───────────────────────────────────────────

function broadcast(eventType, data) {
  eventId++;
  const payload = `id: ${eventId}\nevent: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
  clients.forEach((res) => res.write(payload));
}

// ─── Status update endpoint ─────────────────────────────────────────────────

app.post("/update-order", express.json(), (req, res) => {
  const prev = orderStatus;
  orderStatus = req.body.status;
  console.log(`Status: ${prev} → ${orderStatus}`);
  broadcast("order_update", { status: orderStatus, previous: prev });
  res.json({ ok: true });
});

// Simulate driver location (hit this in a loop or manually)
app.post("/driver-location", express.json(), (req, res) => {
  broadcast("driver_location", { lat: req.body.lat, lng: req.body.lng });
  res.json({ ok: true });
});

// ─── Serve a test page ───────────────────────────────────────────────────────

app.get("/", (req, res) => {
  res.send(`<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>SSE Demo</title>
<style>
  body { font-family: monospace; background: #0d1117; color: #c9d1d9; padding: 30px; }
  h1 { color: #58a6ff; }
  #status { font-size: 28px; color: #7ee787; margin: 10px 0; }
  #log { background: #161b22; border: 1px solid #30363d; border-radius: 6px; padding: 16px;
         max-height: 400px; overflow-y: auto; font-size: 13px; line-height: 1.8; }
  .entry { border-bottom: 1px solid #21262d; padding: 4px 0; }
  .time { color: #8b949e; }
  .highlight { color: #ffa657; font-weight: bold; }
  .location { color: #79c0ff; }
  .reconnect { color: #f85149; }
  button { background: #238636; color: #fff; border: none; padding: 8px 16px;
           border-radius: 6px; cursor: pointer; font-family: monospace; font-size: 14px; margin: 4px; }
  button:hover { background: #2ea043; }
  code { background: #161b22; padding: 2px 6px; border-radius: 4px; font-size: 12px; }
</style></head><body>
  <h1>Server-Sent Events (SSE) Demo</h1>
  <p>Order status: <span id="status">connecting...</span></p>
  <p>Push status updates:</p>
  <button onclick="pushStatus('PREPARING')">PREPARING</button>
  <button onclick="pushStatus('PICKED_UP')">PICKED_UP</button>
  <button onclick="pushStatus('OUT_FOR_DELIVERY')">OUT_FOR_DELIVERY</button>
  <button onclick="pushStatus('DELIVERED')">DELIVERED</button>
  <p style="margin-top:8px"><button onclick="pushLocation()">Simulate driver location ping</button></p>
  <p style="font-size:12px;color:#8b949e;margin-top:8px">
    Try: kill the server (Ctrl+C), restart it. The browser auto-reconnects + sends <code>Last-Event-ID</code>.
  </p>
  <h3>Event Log</h3>
  <div id="log"></div>
<script>
  const logEl = document.getElementById('log');
  const statusEl = document.getElementById('status');

  function log(msg, cls) {
    const t = new Date().toLocaleTimeString();
    logEl.innerHTML = '<div class="entry"><span class="time">[' + t + ']</span> '
      + '<span class="' + (cls||'') + '">' + msg + '</span></div>' + logEl.innerHTML;
  }

  function pushStatus(s) {
    fetch('/update-order', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({status:s}) });
  }
  function pushLocation() {
    const lat = (12.9 + Math.random()*0.1).toFixed(4);
    const lng = (77.5 + Math.random()*0.1).toFixed(4);
    fetch('/driver-location', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({lat,lng}) });
  }

  // THIS IS THE ENTIRE CLIENT-SIDE SSE CODE. One line to connect.
  const source = new EventSource('/events/order/456');

  source.addEventListener('order_update', (e) => {
    const data = JSON.parse(e.data);
    statusEl.textContent = data.status;
    log('order_update (id=' + e.lastEventId + '): ' + data.status, 'highlight');
  });

  source.addEventListener('driver_location', (e) => {
    const data = JSON.parse(e.data);
    log('driver_location: lat=' + data.lat + ' lng=' + data.lng, 'location');
  });

  source.onerror = () => {
    log('Connection lost — browser will auto-reconnect + send Last-Event-ID', 'reconnect');
  };

  log('EventSource connected. Listening for server-pushed events...');
</script></body></html>`);
});

app.listen(PORT, () => {
  console.log(`\n  SSE demo running → http://localhost:${PORT}\n`);
  console.log("  Push status with:");
  console.log(`  curl -X POST http://localhost:${PORT}/update-order -H "Content-Type: application/json" -d '{"status":"PREPARING"}'\n`);
});
