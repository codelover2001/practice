/*
 * WEBRTC — Run: node 05-webrtc.js → open http://localhost:3005
 *
 * How to test:
 *   1. Open http://localhost:3005 in TWO browser tabs (or two different browsers).
 *   2. Tab 1: Click "Join as Customer" — grants microphone access.
 *   3. Tab 2: Click "Join as Driver", then "Call Customer".
 *   4. Audio flows DIRECTLY between the two tabs (peer-to-peer).
 *      The server is only used for the initial signaling handshake.
 *
 * What's happening:
 *   - A WebSocket signaling server relays "offer", "answer", and "ice-candidate" messages
 *     between the two peers so they can discover each other's network addresses.
 *   - Each browser creates an RTCPeerConnection, gets the local microphone stream,
 *     and exchanges SDP (Session Description Protocol) offers/answers.
 *   - ICE (Interactive Connectivity Establishment) finds the best path: direct P2P,
 *     STUN-assisted (public IP discovery), or TURN relay (fallback).
 *   - Once connected, audio streams directly between browsers — the server is NOT involved.
 */

const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const PORT = 3005;

// ─── Signaling server (just a relay between customer and driver) ─────────────

const rooms = {};

wss.on("connection", (ws) => {
  ws.on("message", (raw) => {
    const data = JSON.parse(raw);

    if (data.type === "join") {
      if (!rooms[data.orderId]) rooms[data.orderId] = {};
      rooms[data.orderId][data.role] = ws;
      ws.orderId = data.orderId;
      ws.role = data.role;

      const room = rooms[data.orderId];
      const otherRole = data.role === "customer" ? "driver" : "customer";
      const otherOnline = room[otherRole] && room[otherRole].readyState === WebSocket.OPEN;

      ws.send(JSON.stringify({ type: "joined", role: data.role, peerOnline: otherOnline }));
      if (otherOnline) {
        room[otherRole].send(JSON.stringify({ type: "peer_joined", peerRole: data.role }));
      }
      console.log(`${data.role} joined room ${data.orderId}`);
      return;
    }

    // Forward offer/answer/ice-candidate to the other peer
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
      const other = ws.role === "customer" ? room.driver : room.customer;
      if (other && other.readyState === WebSocket.OPEN) {
        other.send(JSON.stringify({ type: "peer_left", peerRole: ws.role }));
      }
      console.log(`${ws.role} left room ${ws.orderId}`);
    }
  });
});

// ─── Serve the test page ─────────────────────────────────────────────────────

app.get("/", (req, res) => {
  res.send(`<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>WebRTC Demo</title>
<style>
  body { font-family: monospace; background: #0d1117; color: #c9d1d9; padding: 30px; }
  h1 { color: #58a6ff; }
  .btn { background: #238636; color: #fff; border: none; padding: 10px 18px;
         border-radius: 6px; cursor: pointer; font-family: monospace; font-size: 14px; margin: 4px; }
  .btn:hover { background: #2ea043; }
  .btn:disabled { background: #21262d; color: #484f58; cursor: default; }
  .btn.call { background: #1f6feb; }
  .btn.call:hover { background: #388bfd; }
  .btn.hangup { background: #da3633; }
  #status { font-size: 16px; color: #7ee787; margin: 10px 0; }
  #peer { font-size: 14px; color: #d29922; margin: 5px 0; }
  #log { background: #161b22; border: 1px solid #30363d; border-radius: 6px; padding: 16px;
         max-height: 350px; overflow-y: auto; font-size: 12px; line-height: 1.8; }
  .entry { border-bottom: 1px solid #21262d; padding: 3px 0; }
  .time { color: #8b949e; }
  .sig { color: #d2a8ff; }
  .ice { color: #79c0ff; }
  .media { color: #7ee787; }
  .err { color: #f85149; }
  .info { color: #8b949e; font-size: 12px; margin-top: 16px; padding: 12px;
          background: #161b22; border: 1px solid #30363d; border-radius: 6px; }
</style></head><body>
  <h1>WebRTC Peer-to-Peer Audio Demo</h1>
  <p>Open this page in <strong>two tabs</strong>. One joins as Customer, the other as Driver.</p>

  <div style="margin:16px 0">
    <button class="btn" id="joinCustomer" onclick="join('customer')">Join as Customer</button>
    <button class="btn" id="joinDriver" onclick="join('driver')">Join as Driver</button>
    <button class="btn call" id="callBtn" onclick="startCall()" disabled>Call</button>
    <button class="btn hangup" id="hangupBtn" onclick="hangup()" disabled>Hang Up</button>
  </div>

  <div id="status">Not joined</div>
  <div id="peer"></div>
  <audio id="remoteAudio" autoplay></audio>

  <h3>Signaling Log</h3>
  <div id="log"></div>

  <div class="info">
    <strong>What to observe:</strong><br>
    1. "Join" messages go through the WebSocket signaling server.<br>
    2. "Offer" and "Answer" are SDP (Session Description Protocol) — codec/network negotiation.<br>
    3. "ICE candidate" messages are possible network routes discovered by the browser.<br>
    4. Once connected, audio flows directly between tabs — the server is not involved.
  </div>

<script>
  const logEl = document.getElementById('log');
  const statusEl = document.getElementById('status');
  const peerEl = document.getElementById('peer');
  let signaling, pc, myRole, localStream;

  function log(msg, cls) {
    const t = new Date().toLocaleTimeString();
    logEl.innerHTML = '<div class="entry"><span class="time">[' + t + ']</span> '
      + '<span class="' + (cls||'') + '">' + msg + '</span></div>' + logEl.innerHTML;
  }

  function join(role) {
    myRole = role;
    document.getElementById('joinCustomer').disabled = true;
    document.getElementById('joinDriver').disabled = true;
    statusEl.textContent = 'Joined as ' + role;

    signaling = new WebSocket('ws://' + location.host);
    signaling.onopen = () => {
      signaling.send(JSON.stringify({ type: 'join', orderId: 'order_456', role }));
      log('Connected to signaling server as ' + role, 'sig');
    };

    signaling.onmessage = async (e) => {
      const data = JSON.parse(e.data);

      if (data.type === 'joined') {
        log('Joined room. Peer ' + (data.peerOnline ? 'is online' : 'not yet online'), 'sig');
        if (data.peerOnline && role === 'driver') document.getElementById('callBtn').disabled = false;
      }

      if (data.type === 'peer_joined') {
        peerEl.textContent = data.peerRole + ' joined the room';
        log('Peer joined: ' + data.peerRole, 'sig');
        if (role === 'driver') document.getElementById('callBtn').disabled = false;
      }

      if (data.type === 'peer_left') {
        peerEl.textContent = data.peerRole + ' left';
        log('Peer left: ' + data.peerRole, 'err');
        hangup();
      }

      if (data.type === 'offer') {
        log('Received OFFER from driver (SDP exchange)', 'sig');
        await setupPeerConnection();
        await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
        localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        localStream.getTracks().forEach(t => pc.addTrack(t, localStream));
        log('Microphone acquired, creating answer...', 'media');
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        signaling.send(JSON.stringify({ type: 'answer', answer, orderId: 'order_456' }));
        log('Sent ANSWER back to driver', 'sig');
        document.getElementById('hangupBtn').disabled = false;
      }

      if (data.type === 'answer') {
        log('Received ANSWER from customer', 'sig');
        await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
        statusEl.textContent = 'Connected! Audio flowing peer-to-peer.';
      }

      if (data.type === 'ice-candidate') {
        log('Received ICE candidate from peer (network route option)', 'ice');
        if (pc) await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
      }
    };
  }

  async function setupPeerConnection() {
    pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        signaling.send(JSON.stringify({ type: 'ice-candidate', candidate: e.candidate, orderId: 'order_456' }));
        log('Sent ICE candidate (my network route option)', 'ice');
      }
    };

    pc.ontrack = (e) => {
      document.getElementById('remoteAudio').srcObject = e.streams[0];
      statusEl.textContent = 'Audio connected! Speaking peer-to-peer.';
      log('Receiving remote audio stream — direct P2P, server not involved!', 'media');
    };

    pc.onconnectionstatechange = () => {
      log('Connection state: ' + pc.connectionState, pc.connectionState === 'connected' ? 'media' : 'ice');
    };
  }

  async function startCall() {
    log('Initiating call...', 'sig');
    await setupPeerConnection();
    localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    localStream.getTracks().forEach(t => pc.addTrack(t, localStream));
    log('Microphone acquired, creating offer...', 'media');
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    signaling.send(JSON.stringify({ type: 'offer', offer, orderId: 'order_456' }));
    log('Sent OFFER to customer via signaling server', 'sig');
    document.getElementById('callBtn').disabled = true;
    document.getElementById('hangupBtn').disabled = false;
  }

  function hangup() {
    if (pc) { pc.close(); pc = null; }
    if (localStream) { localStream.getTracks().forEach(t => t.stop()); localStream = null; }
    document.getElementById('remoteAudio').srcObject = null;
    document.getElementById('hangupBtn').disabled = true;
    statusEl.textContent = 'Call ended';
    log('Call ended', 'err');
  }
</script></body></html>`);
});

server.listen(PORT, () => {
  console.log(`\n  WEBRTC demo running → http://localhost:${PORT}\n`);
  console.log("  Open in TWO tabs. Tab 1 = Customer, Tab 2 = Driver.\n");
});
