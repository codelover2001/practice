/*
 * SERVER-SENT EVENTS (SSE) — Node.js Server
 *
 * Run:  node server.js  →  open http://localhost:3003
 *
 * How to test:
 *   1. Open http://localhost:3003 in your browser.
 *   2. Push a status update:
 *        curl -X POST http://localhost:3003/update-order \
 *          -H "Content-Type: application/json" -d '{"status":"PREPARING"}'
 *   3. Browser gets the update instantly — one-way push.
 *   4. Kill the server (Ctrl+C), restart it. Browser auto-reconnects
 *      AND sends Last-Event-ID so the server can resume.
 *
 * HOW SSE DIFFERS FROM WEBSOCKET:
 *   WebSocket: persistent, BOTH sides send anytime (full duplex).
 *   SSE:       persistent, SERVER sends only (one-way push).
 *              Client listens. If client needs to send, it uses a separate POST.
 *
 *   SSE advantages over WebSocket:
 *     - Auto-reconnect built into the browser (WebSocket: you code it yourself)
 *     - Last-Event-ID resume built in (WebSocket: you code it yourself)
 *     - Just plain HTTP (no upgrade, no special protocol, works through every proxy)
 *     - Drastically simpler client code: new EventSource(url) — that's it
 *
 *   SSE disadvantages:
 *     - One-way only (server → client)
 *     - Text only (no binary)
 *     - Max 6 connections per domain on HTTP/1.1
 */

const express = require("express");
const path = require("path");
const app = express();
const PORT = 3003;

let orderStatus = "PLACED";
let eventId = 0;

// All active SSE client connections
const clients = [];

// ─── SSE endpoint ────────────────────────────────────────────────────────────
// The three headers below turn a normal HTTP response into an SSE stream.
// The connection stays open. Server writes events whenever it wants.

app.get("/events/order/:id", (req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/event-stream", // tells browser "this is SSE"
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  // If client reconnected, browser automatically sends the last event ID it got.
  // Server can replay missed events from that point.
  const lastId = req.headers["last-event-id"];
  if (lastId) {
    console.log(`Client reconnected. Last event they received: #${lastId}`);
  }

  // Send current status immediately so client doesn't show blank
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

// ─── Broadcast an event to all connected SSE clients ─────────────────────────
// SSE format: each field on its own line, blank line = event complete.
//   id: 5
//   event: order_update
//   data: {"status":"PREPARING"}
//   (blank line)

function broadcast(eventType, data) {
  eventId++;
  const payload = `id: ${eventId}\nevent: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
  clients.forEach((res) => res.write(payload));
}

// ─── Status update (simulates restaurant/driver) ─────────────────────────────

app.post("/update-order", express.json(), (req, res) => {
  const prev = orderStatus;
  orderStatus = req.body.status;
  console.log(`Status: ${prev} → ${orderStatus}`);
  broadcast("order_update", { status: orderStatus, previous: prev });
  res.json({ ok: true });
});

// ─── Driver location ping ────────────────────────────────────────────────────

app.post("/driver-location", express.json(), (req, res) => {
  broadcast("driver_location", { lat: req.body.lat, lng: req.body.lng });
  res.json({ ok: true });
});

// ─── Serve static files ──────────────────────────────────────────────────────

app.use(express.static(path.join(__dirname, "public")));

// ─── Start ───────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`\n  SSE demo → http://localhost:${PORT}\n`);
  console.log("  Push status:");
  console.log(`  curl -X POST http://localhost:${PORT}/update-order \\`);
  console.log(`    -H "Content-Type: application/json" -d '{"status":"PREPARING"}'\n`);
});
