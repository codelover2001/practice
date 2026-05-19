/*
 * WEBSOCKET — Run: node 02-websocket.js → open http://localhost:3002
 *
 * How to test:
 *   1. Open http://localhost:3002 in TWO browser tabs.
 *   2. Type a message in one tab → it appears in the other tab instantly.
 *   3. Use curl to push a status update from the "server side":
 *        curl -X POST http://localhost:3002/update-order -H "Content-Type: application/json" \
 *             -d '{"orderId":"456","status":"PREPARING","driverLat":12.97,"driverLng":77.59}'
 *   4. Both tabs receive the push instantly — no request needed from client.
 *
 * What's happening under the hood:
 *   - Client opens ws://localhost:3002 — browser sends HTTP "Upgrade: websocket" header.
 *   - Server responds "101 Switching Protocols" — same TCP socket, new protocol.
 *   - Connection stays open. Either side sends messages anytime (full duplex).
 *   - No HTTP headers repeated per message — just tiny binary frames (2-14 bytes overhead).
 */

const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const PORT = 3002;

const orderConnections = {};

wss.on("connection", (ws, req) => {
  const url = new URL(req.url, "http://localhost");
  const orderId = url.searchParams.get("orderId") || "456";

  if (!orderConnections[orderId]) orderConnections[orderId] = [];
  orderConnections[orderId].push(ws);
  console.log(`Client subscribed to order ${orderId} (${orderConnections[orderId].length} watchers)`);

  ws.send(JSON.stringify({ type: "connected", orderId, message: "WebSocket connection established" }));

  ws.on("message", (raw) => {
    const data = JSON.parse(raw);
    console.log(`Client (order ${orderId}) says:`, data);

    // Broadcast chat messages to all watchers of this order
    if (data.type === "chat") {
      const outgoing = JSON.stringify({ type: "chat", text: data.text, from: "customer", timestamp: Date.now() });
      orderConnections[orderId].forEach((c) => {
        if (c !== ws && c.readyState === WebSocket.OPEN) c.send(outgoing);
      });
    }
  });

  ws.on("close", () => {
    orderConnections[orderId] = orderConnections[orderId].filter((c) => c !== ws);
    console.log(`Client disconnected from order ${orderId}`);
  });
});

// Server-side push: restaurant/driver updates order
app.post("/update-order", express.json(), (req, res) => {
  const { orderId = "456", status, driverLat, driverLng } = req.body;
  const conns = orderConnections[orderId] || [];
  const payload = JSON.stringify({
    type: "status_update",
    status,
    driverLocation: driverLat ? { lat: driverLat, lng: driverLng } : null,
    timestamp: Date.now(),
  });
  conns.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) ws.send(payload);
  });
  console.log(`Pushed status "${status}" to ${conns.length} client(s)`);
  res.json({ ok: true, notified: conns.length });
});

app.get("/", (req, res) => {
  res.send(`<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>WebSocket Demo</title>
<style>
  body { font-family: monospace; background: #0d1117; color: #c9d1d9; padding: 30px; }
  h1 { color: #58a6ff; }
  #status { font-size: 28px; color: #7ee787; margin: 10px 0; }
  #log { background: #161b22; border: 1px solid #30363d; border-radius: 6px; padding: 16px;
         max-height: 350px; overflow-y: auto; font-size: 13px; line-height: 1.8; }
  .entry { border-bottom: 1px solid #21262d; padding: 4px 0; }
  .time { color: #8b949e; }
  .highlight { color: #ffa657; font-weight: bold; }
  .chat { color: #d2a8ff; }
  input { background: #161b22; border: 1px solid #30363d; color: #c9d1d9; padding: 8px 12px;
          border-radius: 6px; font-family: monospace; font-size: 14px; width: 300px; }
  button { background: #238636; color: #fff; border: none; padding: 8px 16px;
           border-radius: 6px; cursor: pointer; font-family: monospace; font-size: 14px; margin: 4px; }
  button:hover { background: #2ea043; }
</style></head><body>
  <h1>WebSocket Demo</h1>
  <p>Order status: <span id="status">waiting...</span></p>
  <p>Send a chat message (open 2 tabs to see bidirectional):</p>
  <input id="msg" placeholder="Type a message..." onkeydown="if(event.key==='Enter')sendChat()">
  <button onclick="sendChat()">Send</button>
  <p style="margin-top:12px">Push status from "server" side:</p>
  <button onclick="pushStatus('PREPARING')">PREPARING</button>
  <button onclick="pushStatus('PICKED_UP')">PICKED_UP</button>
  <button onclick="pushStatus('DELIVERED')">DELIVERED</button>
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
    fetch('/update-order', { method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({orderId:'456',status:s}) });
  }

  const ws = new WebSocket('ws://' + location.host + '/ws?orderId=456');

  ws.onopen = () => log('WebSocket connected (persistent, full-duplex)', 'highlight');

  ws.onmessage = (e) => {
    const data = JSON.parse(e.data);
    if (data.type === 'status_update') {
      statusEl.textContent = data.status;
      log('Server pushed: ' + data.status + (data.driverLocation ? ' (driver @ ' + data.driverLocation.lat + ',' + data.driverLocation.lng + ')' : ''), 'highlight');
    } else if (data.type === 'chat') {
      log('Other tab says: ' + data.text, 'chat');
    } else if (data.type === 'connected') {
      log('Server: ' + data.message);
    }
  };

  ws.onclose = () => log('Disconnected. Refresh to reconnect.');
  ws.onerror = () => log('WebSocket error');

  function sendChat() {
    const input = document.getElementById('msg');
    if (!input.value.trim()) return;
    ws.send(JSON.stringify({ type: 'chat', text: input.value }));
    log('You: ' + input.value, 'chat');
    input.value = '';
  }
</script></body></html>`);
});

server.listen(PORT, () => {
  console.log(`\n  WEBSOCKET demo running → http://localhost:${PORT}\n`);
  console.log("  Push status with:");
  console.log(`  curl -X POST http://localhost:${PORT}/update-order -H "Content-Type: application/json" -d '{"orderId":"456","status":"PREPARING"}'\n`);
});
