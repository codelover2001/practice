/*
 * WEBSOCKET — Node.js Server
 *
 * Run:  node server.js  →  open http://localhost:3002
 *
 * How to test:
 *   1. Open http://localhost:3002 in TWO browser tabs.
 *   2. Type a chat message in one tab → appears in the other instantly (bidirectional).
 *   3. Push a status update via curl (simulates restaurant/driver):
 *        curl -X POST http://localhost:3002/update-order \
 *          -H "Content-Type: application/json" \
 *          -d '{"orderId":"456","status":"PREPARING"}'
 *   4. Both tabs receive the push — no request needed from client.
 *
 * KEY DIFFERENCE FROM LONG POLLING:
 *   Long Polling: new HTTP request for every update. Headers repeated each time.
 *   WebSocket:    connection opens ONCE, stays open. Either side sends anytime.
 *                 No headers repeated. Just raw data. 2-14 bytes overhead per message
 *                 vs ~200-800 bytes for HTTP headers.
 */

const express = require("express");
const http = require("http");
const path = require("path");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);
const PORT = 3002;

// WebSocket server piggybacks on the same HTTP server.
// The browser sends an HTTP request with "Upgrade: websocket" header.
// Server responds "101 Switching Protocols" — same TCP socket, new protocol.
const wss = new WebSocket.Server({ server });

// Track connections per order so we push to the right people.
// In production this would be Redis-backed (multiple server instances).
const orderConnections = {};

// ─── WebSocket connection handler ────────────────────────────────────────────

wss.on("connection", (ws, req) => {
  const url = new URL(req.url, "http://localhost");
  const orderId = url.searchParams.get("orderId") || "456";

  if (!orderConnections[orderId]) orderConnections[orderId] = [];
  orderConnections[orderId].push(ws);

  const clientCount = orderConnections[orderId].length;
  console.log(`Client connected to order ${orderId} (${clientCount} watchers)`);

  // Confirm connection to the client
  ws.send(
    JSON.stringify({
      type: "connected",
      orderId,
      watchers: clientCount,
    })
  );

  // Notify other watchers that someone joined
  broadcast(orderId, { type: "watcher_count", count: clientCount }, ws);

  // ── Incoming messages from this client ──
  // This is the BIDIRECTIONAL part — client can send anytime without a new HTTP request.
  ws.on("message", (raw) => {
    const data = JSON.parse(raw);
    console.log(`Client (order ${orderId}):`, data);

    if (data.type === "chat") {
      // Forward chat to all OTHER watchers of this order
      broadcast(
        orderId,
        {
          type: "chat",
          text: data.text,
          from: data.from || "anonymous",
          timestamp: Date.now(),
        },
        ws // exclude the sender
      );
    }
  });

  // ── Cleanup on disconnect ──
  ws.on("close", () => {
    orderConnections[orderId] = orderConnections[orderId].filter(
      (c) => c !== ws
    );
    const remaining = orderConnections[orderId].length;
    console.log(`Client disconnected from order ${orderId} (${remaining} left)`);
    broadcast(orderId, { type: "watcher_count", count: remaining });
  });
});

// Send a message to all watchers of an order, optionally excluding one client
function broadcast(orderId, data, exclude) {
  const payload = JSON.stringify(data);
  const conns = orderConnections[orderId] || [];
  conns.forEach((ws) => {
    if (ws !== exclude && ws.readyState === WebSocket.OPEN) {
      ws.send(payload);
    }
  });
}

// ─── REST endpoint: server-side push (restaurant/driver updates status) ──────
// This is how your backend services trigger a push to the client.
// They call this HTTP endpoint, and the server pushes via WebSocket.

app.post("/update-order", express.json(), (req, res) => {
  const { orderId = "456", status, driverLat, driverLng } = req.body;

  const data = {
    type: "status_update",
    status,
    driverLocation:
      driverLat != null ? { lat: driverLat, lng: driverLng } : null,
    timestamp: Date.now(),
  };

  const conns = orderConnections[orderId] || [];
  const payload = JSON.stringify(data);
  conns.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) ws.send(payload);
  });

  console.log(`Pushed "${status}" to ${conns.length} client(s) on order ${orderId}`);
  res.json({ ok: true, notified: conns.length });
});

// ─── Serve static files ──────────────────────────────────────────────────────

app.use(express.static(path.join(__dirname, "public")));

// ─── Start ───────────────────────────────────────────────────────────────────

server.listen(PORT, () => {
  console.log(`\n  WEBSOCKET demo → http://localhost:${PORT}\n`);
  console.log("  Push a status update:");
  console.log(`  curl -X POST http://localhost:${PORT}/update-order \\`);
  console.log(`    -H "Content-Type: application/json" \\`);
  console.log(`    -d '{"orderId":"456","status":"PREPARING"}'\n`);
});
