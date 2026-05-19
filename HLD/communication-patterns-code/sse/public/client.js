/*
 * SSE — Client Side
 *
 * Compare this to the WebSocket client (client.js in ../websocket/public/):
 *
 *   WebSocket:
 *     ws = new WebSocket(url)              // connect
 *     ws.onmessage = (e) => { ... }        // receive
 *     ws.send(data)                        // send (bidirectional!)
 *     ws.onclose = () => { reconnect() }   // YOU code reconnection
 *
 *   SSE:
 *     source = new EventSource(url)        // connect — THAT'S IT
 *     source.addEventListener("x", ...)    // receive named events
 *     // NO send method — one-way only     // client can't push through this
 *     source.onerror = () => { }           // browser auto-reconnects, you do NOTHING
 *
 * SSE also sends Last-Event-ID on reconnect, so the server can replay missed events.
 * With WebSocket, you'd have to implement all of that yourself.
 */

const logEl = document.getElementById("log");
const statusEl = document.getElementById("status");
const connStatusEl = document.getElementById("connStatus");
const lastEventIdEl = document.getElementById("lastEventId");

function log(msg, cls) {
  const t = new Date().toLocaleTimeString();
  const entry = document.createElement("div");
  entry.className = "entry";
  entry.innerHTML =
    '<span class="time">[' + t + "]</span> " +
    '<span class="' + (cls || "") + '">' + msg + "</span>";
  logEl.prepend(entry);
}

// ─── Push via REST (SSE is one-way, so client uses normal HTTP to talk back) ─

function pushStatus(s) {
  fetch("/update-order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: s }),
  });
  log("You triggered → " + s, "highlight");
}

function pushLocation() {
  const lat = (12.9 + Math.random() * 0.1).toFixed(4);
  const lng = (77.5 + Math.random() * 0.1).toFixed(4);
  fetch("/driver-location", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ lat, lng }),
  });
}

// ─── SSE connection ──────────────────────────────────────────────────────────
// This is the ENTIRE client-side SSE setup. One line to connect.
// Compare to WebSocket which needs onopen, onmessage, onclose, onerror,
// manual reconnect logic, etc.

const source = new EventSource("/events/order/456");

// Listen for "order_update" named events
source.addEventListener("order_update", (e) => {
  const data = JSON.parse(e.data);
  statusEl.textContent = data.status;
  lastEventIdEl.textContent = e.lastEventId;
  connStatusEl.textContent = "connected";
  connStatusEl.className = "badge";
  log("order_update (id=" + e.lastEventId + "): " + data.status, "highlight");
});

// Listen for "driver_location" named events
source.addEventListener("driver_location", (e) => {
  const data = JSON.parse(e.data);
  lastEventIdEl.textContent = e.lastEventId;
  log("driver_location: lat=" + data.lat + " lng=" + data.lng, "location");
});

// Connection error — browser handles reconnect automatically.
// It will also send "Last-Event-ID: <id>" header on reconnect.
// The server can use that to replay missed events.
source.onerror = () => {
  connStatusEl.textContent = "reconnecting...";
  connStatusEl.className = "badge disconnected";
  log("Connection lost — browser will auto-reconnect + send Last-Event-ID", "error");
};

log("EventSource connected. Listening for server-pushed events...", "system");
