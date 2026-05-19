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
  logEl.innerHTML = '<div style="color:#8b949e">Reset.</div>';
  refreshState();
}

function renderLog(entries) {
  logEl.innerHTML = entries
    .map(
      (e) =>
        '<div class="entry"><span class="time">' +
        e.time.split("T")[1].slice(0, 12) + "</span> " +
        '<span class="' + e.type + '">' + e.msg + "</span></div>"
    )
    .join("");
}

async function refreshState() {
  const data = await fetch("/api/state").then((r) => r.json());
  const d = data.db;

  const ordersHtml = d.orders.length
    ? d.orders.map((o) => '<div class="row ' + o.status.toLowerCase() + '">' + o.id + " — " + o.status + " — ₹" + o.amount + "</div>").join("")
    : '<div class="empty">No orders yet</div>';

  const paymentsHtml = d.payments.length
    ? d.payments.map((p) => '<div class="row ' + p.status.toLowerCase() + '">' + p.id + " — " + p.status + " — ₹" + p.amount + "</div>").join("")
    : '<div class="empty">No payments yet</div>';

  stateEl.innerHTML =
    '<div class="db-card"><div class="title">Orders</div>' + ordersHtml + "</div>" +
    '<div class="db-card"><div class="title">Payments</div>' + paymentsHtml + "</div>" +
    '<div class="db-card"><div class="title">Inventory</div><div class="row">Stock: ' + d.inventory.stock + "</div></div>" +
    '<div class="db-card"><div class="title">Notifications</div>' +
    (d.notifications.length
      ? d.notifications.map((n) => '<div class="row">' + n.orderId + ": " + n.message + "</div>").join("")
      : '<div class="empty">None sent</div>') +
    "</div>";
}

refreshState();
