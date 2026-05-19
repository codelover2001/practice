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
  logEl.innerHTML = '<div style="color:#8b949e">Reset. Try a scenario.</div>';
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
  stateEl.innerHTML = ["payment", "inventory", "notification"]
    .map((k) => {
      const s = data.services[k];
      let val = k === "payment" ? "₹" + s.balance : k === "inventory" ? "Stock: " + s.stock : "Sent: " + s.sent.length;
      return (
        '<div class="svc-card"><div class="name">' + s.name + "</div>" +
        '<div class="val">' + val + "</div>" +
        '<div class="st ' + s.state + '">State: ' + s.state + "</div></div>"
      );
    })
    .join("");
}

refreshState();
