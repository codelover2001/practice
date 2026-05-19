const logEl = document.getElementById("log");
const stateEl = document.getElementById("state");

async function placeOrder(opts) {
  const res = await fetch("/place-order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount: 640, ...opts }),
  });
  const data = await res.json();
  renderLog(data.log);
  refreshState();
}

async function reset() {
  await fetch("/reset", { method: "POST" });
  logEl.innerHTML = '<div style="color:#8b949e">Reset. Try a scenario above.</div>';
  refreshState();
}

function renderLog(entries) {
  logEl.innerHTML = entries
    .map(
      (e) =>
        '<div class="entry">' +
        '<span class="time">' + e.time.split("T")[1].slice(0, 12) + "</span> " +
        '<span class="' + e.type + '">' + e.msg + "</span></div>"
    )
    .join("");
}

async function refreshState() {
  const data = await fetch("/api/state").then((r) => r.json());
  const s = data.services;
  stateEl.innerHTML = ["payment", "inventory", "notification"]
    .map((k) => {
      const svc = s[k];
      let val = "";
      if (k === "payment") val = "Balance: ₹" + svc.balance;
      if (k === "inventory") val = "Stock: " + svc.stock;
      if (k === "notification") val = "Sent: " + svc.sent.length;
      return (
        '<div class="svc-card"><div class="name">' + svc.name + "</div>" +
        '<div class="val">' + val + "</div>" +
        (svc.locked ? '<div class="locked">🔒 LOCKED (waiting for commit/abort)</div>' : "") +
        "</div>"
      );
    })
    .join("");
}

refreshState();
