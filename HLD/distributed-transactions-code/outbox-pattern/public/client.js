const logEl = document.getElementById("log");
const ordersView = document.getElementById("ordersView");
const outboxView = document.getElementById("outboxView");
const kafkaView = document.getElementById("kafkaView");

async function dualWrite(opts) {
  const res = await fetch("/dual-write", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(opts),
  });
  const data = await res.json();
  renderLog(data.log);
  refreshState();
}

async function outboxWrite() {
  const res = await fetch("/outbox-write", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  const data = await res.json();
  renderLog(data.log);
  refreshState();
}

async function startPublisher() {
  await fetch("/start-publisher", { method: "POST" });
  refreshState();
}

async function stopPublisher() {
  await fetch("/stop-publisher", { method: "POST" });
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

  ordersView.innerHTML = data.orders.length
    ? data.orders.map((o) => '<div class="row">' + o.id + " — " + o.status + "</div>").join("")
    : '<div class="empty">Empty</div>';

  outboxView.innerHTML = data.outbox.length
    ? data.outbox
        .map(
          (e) =>
            '<div class="row ' + (e.published ? "published" : "unpublished") + '">' +
            e.id + " — " + (e.published ? "✅ published" : "⏳ pending") + "</div>"
        )
        .join("")
    : '<div class="empty">Empty</div>';

  kafkaView.innerHTML = data.kafka.length
    ? data.kafka
        .map((e) => '<div class="row published">' + e.type + " — " + e.orderId + "</div>")
        .join("")
    : '<div class="empty">Empty</div>';

  // Also refresh log from server
  const full = await fetch("/api/state").then((r) => r.json());
  if (full.log.length) renderLog(full.log);
}

refreshState();
setInterval(refreshState, 2500);
