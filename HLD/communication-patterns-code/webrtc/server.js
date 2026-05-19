/*
 * WEBRTC — Signaling Server + Static File Server
 *
 * Run:  node server.js  →  open http://localhost:3005
 *
 * How to test:
 *   1. Open http://localhost:3005 in TWO browser tabs.
 *   2. Tab 1: Click "Join as Customer" (grants microphone).
 *   3. Tab 2: Click "Join as Driver", then click "Call Customer".
 *   4. Audio flows DIRECTLY between tabs — peer-to-peer.
 *
 * WHAT THIS SERVER DOES:
 *   This server is ONLY the signaling relay. It forwards "offer", "answer",
 *   and "ice-candidate" messages between the two peers so they can discover
 *   each other's network addresses.
 *
 *   Once the WebRTC connection is established, the audio/video flows
 *   DIRECTLY between the two browsers. This server is NOT involved.
 *   That's the whole point of WebRTC — your server doesn't handle media.
 *
 * WEBRTC NEEDS THREE THINGS:
 *   1. Signaling server (this file) — relays connection negotiation messages.
 *      Uses WebSocket, but could use any transport. Not part of WebRTC spec.
 *   2. STUN server — helps peers discover their public IP when behind NAT/router.
 *      We use Google's free one: stun:stun.l.google.com:19302
 *   3. TURN server (fallback) — relays media when direct P2P fails (~10-15% of cases).
 *      We skip this for the demo. In production you'd run coturn or use Twilio's TURN.
 */

const express = require("express");
const http = require("http");
const path = require("path");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const PORT = 3005;

// ─── Signaling server ────────────────────────────────────────────────────────
// A "room" = one order. Customer and driver join the same room.
// The server just forwards signaling messages between them.

const rooms = {};

wss.on("connection", (ws) => {
  ws.on("message", (raw) => {
    const data = JSON.parse(raw);

    // ── Join a room ──
    if (data.type === "join") {
      if (!rooms[data.orderId]) rooms[data.orderId] = {};
      rooms[data.orderId][data.role] = ws;
      ws.orderId = data.orderId;
      ws.role = data.role;

      const room = rooms[data.orderId];
      const otherRole = data.role === "customer" ? "driver" : "customer";
      const peerOnline = room[otherRole] && room[otherRole].readyState === WebSocket.OPEN;

      ws.send(JSON.stringify({ type: "joined", role: data.role, peerOnline }));

      if (peerOnline) {
        room[otherRole].send(JSON.stringify({ type: "peer_joined", peerRole: data.role }));
      }

      console.log(`${data.role} joined room ${data.orderId}` + (peerOnline ? " (peer online)" : ""));
      return;
    }

    // ── Forward offer/answer/ice-candidate to the other peer ──
    // The server doesn't interpret these — just relays them.
    if (["offer", "answer", "ice-candidate"].includes(data.type)) {
      const room = rooms[data.orderId];
      if (!room) return;
      const target = ws.role === "customer" ? room.driver : room.customer;
      if (target && target.readyState === WebSocket.OPEN) {
        target.send(JSON.stringify(data));
      }
    }
  });

  ws.on("close", () => {
    if (ws.orderId && rooms[ws.orderId]) {
      delete rooms[ws.orderId][ws.role];
      const room = rooms[ws.orderId];
      const otherRole = ws.role === "customer" ? "driver" : "customer";
      const other = room[otherRole];
      if (other && other.readyState === WebSocket.OPEN) {
        other.send(JSON.stringify({ type: "peer_left", peerRole: ws.role }));
      }
      console.log(`${ws.role} left room ${ws.orderId}`);
    }
  });
});

// ─── Serve static files ──────────────────────────────────────────────────────

app.use(express.static(path.join(__dirname, "public")));

// ─── Start ───────────────────────────────────────────────────────────────────

server.listen(PORT, () => {
  console.log(`\n  WEBRTC demo → http://localhost:${PORT}\n`);
  console.log("  Open in TWO tabs. Tab 1 = Customer, Tab 2 = Driver.\n");
});
