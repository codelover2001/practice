/*
 * LONG POLLING — Node.js Server
 *
 * Run:  node server.js  →  open http://localhost:3001
 *
 * Test with curl:
 *   curl -X POST http://localhost:3001/update-order \
 *     -H "Content-Type: application/json" \
 *     -d '{"status":"PREPARING"}'
 */

const express = require("express");
const path = require("path");
const app = express();
const PORT = 3001;

// Simulates our database. In production this comes from PostgreSQL/Redis.
let orderStatus = "PLACED";

// ─── Serve static files (index.html, style.css, client.js) ──────────────────

app.use(express.static(path.join(__dirname, "public")));

// ─── Long Polling endpoint ───────────────────────────────────────────────────
//
// HOW IT WORKS:
//   1. Client sends GET /poll/order/456?lastStatus=PLACED
//   2. Server enters a while loop, checking every 500ms if status changed
//   3. If status changed → respond immediately with the new status
//   4. If 30 seconds pass with no change → respond with { changed: false }
//   5. Client immediately sends a new request (loop continues)
//
// WHY this is better than regular polling:
//   Regular polling: client asks every 3s, server says "no" 50 times, wastes 50 requests.
//   Long polling:    client asks ONCE, server holds it open, responds only when there's news.
//                    Result: ~5 requests for 5 actual updates, not 50 wasted ones.

app.get("/poll/order/:id", async (req, res) => {
  const startTime = Date.now();
  const timeout = 30000; // 30 seconds max wait
  const clientKnows = req.query.lastStatus; // what the client already has

  // THIS IS THE KEY — server sits in a loop, holding the connection open
  while (Date.now() - startTime < timeout) {
    if (orderStatus !== clientKnows) {
      // Status changed! Respond immediately and end.
      return res.json({ status: orderStatus, changed: true });
    }
    // No change yet — sleep 500ms then check again.
    // The connection stays open the whole time.
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  // 30 seconds passed, nothing happened. Tell the client "no news."
  // Client will immediately open a new long poll request.
  res.json({ status: orderStatus, changed: false });
});

// ─── Status update endpoint (simulates restaurant/driver updating the order) ─

app.post("/update-order", express.json(), (req, res) => {
  const prev = orderStatus;
  orderStatus = req.body.status;
  console.log(`Status changed: ${prev} → ${orderStatus}`);
  res.json({ ok: true, previous: prev, current: orderStatus });
});

// ─── Start ───────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`\n  LONG POLLING server → http://localhost:${PORT}\n`);
  console.log("  Push status update:");
  console.log(`  curl -X POST http://localhost:${PORT}/update-order \\`);
  console.log(`    -H "Content-Type: application/json" \\`);
  console.log(`    -d '{"status":"PREPARING"}'\n`);
});
