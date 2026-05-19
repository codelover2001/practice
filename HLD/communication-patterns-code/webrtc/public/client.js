/*
 * WebRTC — Client Side
 *
 * The WebRTC connection process:
 *
 *   1. SIGNALING (via WebSocket, through our server):
 *      Both peers connect to the signaling server and join a "room."
 *      The server relays messages between them — it does NOT see the media.
 *
 *   2. OFFER/ANSWER (SDP exchange):
 *      Driver creates an "offer" — "I have a microphone, I support these codecs,
 *      here are my network details."
 *      Customer creates an "answer" — "I also have a microphone, I'll use this codec."
 *      These are exchanged via the signaling server.
 *
 *   3. ICE CANDIDATES (finding a network path):
 *      Both browsers discover their network addresses (local IP, public IP via STUN).
 *      Each candidate is a possible route: "You can reach me at 103.56.78.12:45123."
 *      They exchange these via the signaling server.
 *      The browsers try all combinations and pick the best working path.
 *
 *   4. CONNECTED — MEDIA FLOWS PEER-TO-PEER:
 *      Audio streams directly between the two browsers.
 *      The signaling server is no longer involved.
 *      Your server doesn't handle any audio data. Zero bandwidth cost.
 */

const logEl = document.getElementById("log");
const statusEl = document.getElementById("status");
const peerEl = document.getElementById("peer");

let signaling, pc, myRole, localStream;

function log(msg, cls) {
  const t = new Date().toLocaleTimeString();
  const entry = document.createElement("div");
  entry.className = "entry";
  entry.innerHTML =
    '<span class="time">[' + t + "]</span> " +
    '<span class="' + (cls || "") + '">' + msg + "</span>";
  logEl.prepend(entry);
}

// ─── Join a room via the signaling server ────────────────────────────────────

function join(role) {
  myRole = role;
  document.getElementById("joinCustomer").disabled = true;
  document.getElementById("joinDriver").disabled = true;
  statusEl.textContent = role;
  statusEl.className = "badge";

  signaling = new WebSocket("ws://" + location.host);

  signaling.onopen = () => {
    signaling.send(JSON.stringify({ type: "join", orderId: "order_456", role }));
    log("Connected to signaling server as " + role, "sig");
  };

  signaling.onmessage = async (e) => {
    const data = JSON.parse(e.data);

    // ── Joined confirmation ──
    if (data.type === "joined") {
      log("Joined room. Peer " + (data.peerOnline ? "is online" : "not yet online"), "sig");
      if (data.peerOnline && role === "driver") {
        document.getElementById("callBtn").disabled = false;
      }
    }

    // ── The other peer joined ──
    if (data.type === "peer_joined") {
      peerEl.textContent = data.peerRole;
      peerEl.className = "badge";
      log("Peer joined: " + data.peerRole, "sig");
      if (role === "driver") document.getElementById("callBtn").disabled = false;
    }

    // ── Peer left ──
    if (data.type === "peer_left") {
      peerEl.textContent = "left";
      peerEl.className = "badge error";
      log("Peer left: " + data.peerRole, "err");
      hangup();
    }

    // ── Received an OFFER from the driver ──
    // The driver said: "I want to call. Here are my capabilities and network info."
    // We respond with an ANSWER: "I accept. Here are MY capabilities and network info."
    if (data.type === "offer") {
      log("Received OFFER from driver (SDP exchange)", "sig");
      await setupPeerConnection();
      await pc.setRemoteDescription(new RTCSessionDescription(data.offer));

      localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStream.getTracks().forEach((t) => pc.addTrack(t, localStream));
      log("Microphone acquired, creating answer...", "media");

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      signaling.send(JSON.stringify({ type: "answer", answer, orderId: "order_456" }));
      log("Sent ANSWER back to driver", "sig");
      document.getElementById("hangupBtn").disabled = false;
    }

    // ── Received an ANSWER from the customer ──
    if (data.type === "answer") {
      log("Received ANSWER from customer", "sig");
      await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
      statusEl.textContent = "connected";
    }

    // ── Received an ICE candidate (a possible network route) ──
    if (data.type === "ice-candidate") {
      log("Received ICE candidate from peer", "ice");
      if (pc) await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
    }
  };
}

// ─── Set up the RTCPeerConnection ────────────────────────────────────────────

async function setupPeerConnection() {
  pc = new RTCPeerConnection({
    iceServers: [
      // STUN server: helps discover our public IP when behind NAT/router.
      // Google runs free STUN servers. In production, run your own or use Twilio.
      { urls: "stun:stun.l.google.com:19302" },
    ],
  });

  // When we discover a network route, send it to the other peer via signaling.
  pc.onicecandidate = (e) => {
    if (e.candidate) {
      signaling.send(
        JSON.stringify({ type: "ice-candidate", candidate: e.candidate, orderId: "order_456" })
      );
      log("Sent ICE candidate (my network route option)", "ice");
    }
  };

  // When the remote peer's audio arrives — play it.
  // This audio came DIRECTLY from the other browser, not through our server.
  pc.ontrack = (e) => {
    document.getElementById("remoteAudio").srcObject = e.streams[0];
    statusEl.textContent = "audio connected";
    statusEl.className = "badge";
    log("Receiving remote audio — direct P2P, server NOT involved!", "media");
  };

  pc.onconnectionstatechange = () => {
    const state = pc.connectionState;
    log("Connection state: " + state, state === "connected" ? "media" : "ice");
  };
}

// ─── Driver initiates the call ───────────────────────────────────────────────

async function startCall() {
  log("Initiating call...", "sig");
  await setupPeerConnection();

  localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
  localStream.getTracks().forEach((t) => pc.addTrack(t, localStream));
  log("Microphone acquired, creating offer...", "media");

  // An "offer" = "I want to send audio. Here are my supported codecs and network info."
  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);

  signaling.send(JSON.stringify({ type: "offer", offer, orderId: "order_456" }));
  log("Sent OFFER to customer via signaling server", "sig");

  document.getElementById("callBtn").disabled = true;
  document.getElementById("hangupBtn").disabled = false;
}

// ─── Hang up ─────────────────────────────────────────────────────────────────

function hangup() {
  if (pc) { pc.close(); pc = null; }
  if (localStream) { localStream.getTracks().forEach((t) => t.stop()); localStream = null; }
  document.getElementById("remoteAudio").srcObject = null;
  document.getElementById("hangupBtn").disabled = true;
  statusEl.textContent = "call ended";
  log("Call ended", "err");
}
