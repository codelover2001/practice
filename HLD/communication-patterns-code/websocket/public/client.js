/*
 * WebSocket — Client Side
 *
 * How this differs from long polling client:
 *
 *   Long Polling:
 *     while (true) {
 *       response = await fetch(...)    // new HTTP request each time
 *       updateUI(response)             // process the one update
 *     }                                // loop back, make ANOTHER request
 *
 *   WebSocket:
 *     ws = new WebSocket(url)          // one connection, stays open forever
 *     ws.onmessage = (event) => {      // server pushes whenever it wants
 *       updateUI(event.data)           // no looping, no re-requesting
 *     }
 *     ws.send(data)                    // client can push anytime too (bidirectional!)
 *
 * No polling loop. No repeated HTTP headers. The connection is persistent.
 * Server pushes, client pushes — either side, anytime.
 */

const logEl = document.getElementById("log");
const statusEl = document.getElementById("status");
const connStatusEl = document.getElementById("connStatus");
const watcherCountEl = document.getElementById("watcherCount");

function log(msg, cls) {
  const t = new Date().toLocaleTimeString();
  const entry = document.createElement("div");
  entry.className = "entry";
  entry.innerHTML =
    '<span class="time">[' + t + "]</span> " +
    '<span class="' + (cls || "") + '">' + msg + "</span>";
  logEl.prepend(entry);
}

// ─── Push a status update via the REST endpoint (simulates server-side push) ─

function pushStatus(s) {
  fetch("/update-order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderId: "456", status: s }),
  });
  log("You triggered server push → " + s, "highlight");
}

// ─── Send a chat message through the WebSocket (client → server, bidirectional) ─

function sendChat() {
  const input = document.getElementById("msg");
  if (!input.value.trim()) return;
  ws.send(JSON.stringify({ type: "chat", text: input.value, from: "You" }));
  log("You: " + input.value, "chat-msg");
  input.value = "";
}

// ─── WebSocket connection ────────────────────────────────────────────────────
//
// "ws://" not "http://" — this is a different protocol.
// The browser sends:
//   GET /ws?orderId=456 HTTP/1.1
//   Upgrade: websocket
//   Connection: Upgrade
//
// The server responds:
//   HTTP/1.1 101 Switching Protocols
//
// After that, the TCP socket speaks WebSocket frames, not HTTP.

let ws;
let reconnectTimeout;

function connect() {
  ws = new WebSocket("ws://" + location.host + "/?orderId=456");

  ws.onopen = () => {
    connStatusEl.textContent = "connected";
    connStatusEl.className = "badge";
    log("WebSocket connected (persistent, full-duplex)", "system");
  };

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);

    switch (data.type) {
      case "connected":
        log("Server confirmed: watching order " + data.orderId, "system");
        watcherCountEl.textContent = data.watchers;
        break;

      case "status_update":
        statusEl.textContent = data.status;
        log(
          "Server pushed: " +
            data.status +
            (data.driverLocation
              ? " (driver @ " +
                data.driverLocation.lat +
                "," +
                data.driverLocation.lng +
                ")"
              : ""),
          "highlight"
        );
        break;

      case "chat":
        log(data.from + ": " + data.text, "chat-msg");
        break;

      case "watcher_count":
        watcherCountEl.textContent = data.count;
        log("Watchers: " + data.count, "system");
        break;
    }
  };

  // Auto-reconnect on disconnect.
  // Unlike SSE (which has built-in reconnect), WebSocket requires you to code this yourself.
  ws.onclose = () => {
    connStatusEl.textContent = "disconnected";
    connStatusEl.className = "badge disconnected";
    log("Disconnected. Reconnecting in 3s...", "error");
    clearTimeout(reconnectTimeout);
    reconnectTimeout = setTimeout(connect, 3000);
  };

  ws.onerror = () => {
    log("WebSocket error", "error");
  };
}

connect();
