/*
 * Long Polling — Client Side
 *
 * The core loop:
 *   1. Send a fetch() request to the server.
 *   2. The server HOLDS the connection open for up to 30 seconds.
 *   3. When the server responds (either status changed, or 30s timeout):
 *      - Update the UI if status changed.
 *      - Immediately send the NEXT request (no delay).
 *   4. On network error: wait 3 seconds, retry.
 *
 * The browser is NOT frozen during the wait — fetch() is async.
 * The server is the one holding the connection open in a while loop.
 */

const logEl = document.getElementById("log");
const statusEl = document.getElementById("status");

function log(msg, cls) {
  const t = new Date().toLocaleTimeString();
  const entry = document.createElement("div");
  entry.className = "entry";
  entry.innerHTML =
    '<span class="time">[' + t + "]</span> " +
    '<span class="' + (cls || "") + '">' + msg + "</span>";
  logEl.prepend(entry);
}

// Called when the user clicks a status button on the page.
// This is a normal POST — it changes the server-side status.
// The long-poll request that's currently hanging will detect the change
// within 500ms and respond to the client.
async function updateStatus(newStatus) {
  await fetch("/update-order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: newStatus }),
  });
  log("You triggered status → " + newStatus, "highlight");
}

// The long polling loop — runs forever
async function startPolling() {
  let lastStatus = null;
  log("Long polling started. Waiting for updates...");

  while (true) {
    try {
      const start = Date.now();
      log("→ Request sent (server holds connection open...)", "request");

      // This fetch() will HANG for up to 30 seconds.
      // That's the whole point — the server doesn't respond until there's news.
      const res = await fetch("/poll/order/456?lastStatus=" + lastStatus);
      const data = await res.json();
      const elapsed = ((Date.now() - start) / 1000).toFixed(1);

      if (data.changed) {
        lastStatus = data.status;
        statusEl.textContent = data.status;
        log(
          "← Response after " + elapsed + "s: STATUS CHANGED → " + data.status,
          "highlight"
        );
      } else {
        log(
          "← Response after " +
            elapsed +
            "s: no change (30s timeout). Reconnecting...",
          "timeout"
        );
      }

      // No delay here — immediately start the next long poll.
    } catch (e) {
      log("Connection error. Retrying in 3s...");
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
}

startPolling();
