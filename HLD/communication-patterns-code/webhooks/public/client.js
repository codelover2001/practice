/*
 * Webhooks — Client Side (Dashboard)
 *
 * There's no SSE or WebSocket here — webhooks are server-to-server.
 * This page just polls the server's log API to show what webhooks were received.
 *
 * In production, this dashboard wouldn't exist for end users.
 * It's an internal ops tool for engineers to monitor incoming webhooks.
 */

const logEl = document.getElementById("log");

// ─── Send a simulated webhook to our own server ──────────────────────────────
// In real life, RAZORPAY sends this POST, not your frontend.
// We're simulating it here so you can see the full flow.

async function sendWebhook(event, eventId, signature) {
  await fetch("/webhooks/razorpay", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-razorpay-signature": signature,
    },
    body: JSON.stringify({
      event: event,
      event_id: eventId,
      payload: {
        payment: {
          id: "pay_" + Math.random().toString(36).slice(2, 8),
          amount: 64000,
          order_id: "ord_456",
          method: "upi",
        },
      },
    }),
  });
  refreshLog();
}

// ─── Fetch and render the webhook log ────────────────────────────────────────

async function refreshLog() {
  const data = await fetch("/api/log").then((r) => r.json());

  if (!data.length) {
    logEl.innerHTML = '<div class="empty">No webhooks received yet. Click a button above.</div>';
    return;
  }

  logEl.innerHTML = data
    .map((e) => {
      let cls = "processed";
      if (e.result.startsWith("REJECTED")) cls = "rejected";
      else if (e.result.startsWith("SKIPPED")) cls = "skipped";

      return (
        '<div class="webhook-entry">' +
        '<div class="timestamp">' + e.timestamp + "</div>" +
        '<div class="result ' + cls + '">' + e.result + "</div>" +
        '<div class="meta">event_id: ' + (e.body.event_id || "?") +
        " | event: " + (e.body.event || "?") + "</div>" +
        "</div>"
      );
    })
    .join("");
}

refreshLog();
setInterval(refreshLog, 2000);
