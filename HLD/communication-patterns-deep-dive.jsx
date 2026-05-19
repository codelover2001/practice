const { useState, useEffect, useRef } = React;

const SECTIONS = [
  { id: "realtime", label: "Real-Time", icon: "⚡", color: "#E8B931" },
  { id: "async", label: "Async", icon: "📨", color: "#4A90D9" },
  { id: "reliability", label: "Reliability", icon: "🛡️", color: "#E74C3C" },
  { id: "bigpicture", label: "Full Picture", icon: "🗺️", color: "#9B59B6" },
];

const STEPS = [
  // ============ REAL-TIME ============
  {
    id: 0, section: "realtime",
    phase: "WHY",
    title: "The Problem — Why HTTP Isn't Enough",
    icon: "🤔",
    color: "#E8B931",
    concepts: ["Request-Response", "Real-Time Communication"],
    actors: ["Rahul's Phone", "Food App Server"],
    simple: `Let's continue building our food delivery app. Rahul has placed his order. Now he's staring at his phone waiting for updates: "Is the restaurant preparing my biryani? Has the driver picked it up? Where is the driver RIGHT NOW?"

Here's the problem: HTTP (REST/GraphQL) is REQUEST-RESPONSE. The client asks, the server answers. The server can NEVER proactively send data to the client. It's like a telephone that only lets YOU call — the other person can never call you back.

But Rahul needs the SERVER to push updates: "Your order is being prepared!" → "Driver picked up!" → "Driver is 2km away!" → "Arriving in 1 min!"

How do we solve this? That's what this entire chapter is about — 5 different real-time techniques, each with different tradeoffs.`,
    detail: `THE FUNDAMENTAL PROBLEM:

HTTP is a pull protocol. Client pulls data from server.

Client: "Any updates?"     → Server: "No."
Client: "Any updates now?"  → Server: "No."
Client: "How about now?"    → Server: "No."
Client: "Now?"              → Server: "Yes! Driver picked up your order!"

This is wasteful. 99% of requests get "no update."

WHAT WE ACTUALLY WANT:

Client: "Let me know when something happens."
Server: (silence... silence...)
Server: "Driver picked up your order!"
Server: (silence...)
Server: "Driver is 2km away!"
Server: "Driver is arriving!"

The server PUSHES updates to the client. No wasted requests. Instant delivery of information.

FIVE SOLUTIONS (each solving this differently):

1. LONG POLLING — "Keep the phone line open until there's news"
   Simple, works everywhere. Decent latency.

2. WEBSOCKETS — "Open a permanent two-way phone line"
   True real-time. Both sides can talk anytime. Most powerful.

3. SERVER-SENT EVENTS (SSE) — "Server broadcasts, you listen"
   One-way push from server. Simple, efficient for notifications.

4. WEBHOOKS — "Call me at this number when something happens"
   Server-to-server callbacks. For payment confirmations, etc.

5. WEBRTC — "Direct peer-to-peer video/audio call"
   For voice/video between users. Driver calling Rahul.

Each one is the RIGHT choice for different scenarios in your app. Let's explore them one by one.

ANALOGY TO SET THE STAGE:

Imagine you're waiting for a package delivery:

REGULAR HTTP:  You call the courier every 5 seconds: "Is it here yet?"
LONG POLLING:  You call once, courier keeps you on hold: "I'll tell you when it arrives"
WEBSOCKETS:    You and the courier have a walkie-talkie — either side can talk anytime
SSE:           The courier has a loudspeaker broadcasting updates to the whole street
WEBHOOKS:      You gave the courier your doorbell — they ring it when they arrive
WEBRTC:        You and the courier are on a live video call, you can see them driving`,
    analogy: `🍕 Regular HTTP is like texting a restaurant "Is my food ready?" every 30 seconds. Annoying, wasteful, and you still get the news late. What you REALLY want is for the restaurant to text YOU when something changes. That's the core problem all 5 techniques solve — just differently.`
  },
  {
    id: 1, section: "realtime",
    phase: "LONG POLL",
    title: "Long Polling — The Patient Phone Call",
    icon: "📞",
    color: "#F39C12",
    concepts: ["Long Polling", "HTTP Polling", "Timeout"],
    actors: ["Rahul's Phone", "API Server", "Order Service"],
    simple: `Long Polling is the simplest upgrade from regular HTTP. Instead of the server immediately responding "no update," it HOLDS the connection open and waits. When an update finally arrives, THEN it responds. The client immediately opens a new connection and waits again.

It's like calling a friend and saying "Don't hang up until you have news." They keep you on hold, and the moment something happens, they tell you. Then you call back and say "Keep me on hold again."`,
    detail: `REGULAR POLLING (the naive approach):

Client → Server: "Any updates for order #456?"
Server → Client: "No." (instant response)
(client waits 3 seconds)
Client → Server: "Any updates for order #456?"
Server → Client: "No."
(client waits 3 seconds)
Client → Server: "Any updates for order #456?"
Server → Client: "No."
... 50 more times ...
Client → Server: "Any updates for order #456?"
Server → Client: "Yes! Status changed to PICKED_UP"

Problems:
— 50 wasted HTTP requests to get 1 update
— Each request has overhead (TCP handshake, headers, TLS)
— If you poll every 3 seconds, updates are delayed up to 3 seconds
— If you poll more frequently, you waste MORE resources
— Server handles 50x more requests than necessary

LONG POLLING (the smarter approach):

Client → Server: "Any updates for order #456?"
Server: (holds connection open... waiting... 10 seconds... 20 seconds...)
Server → Client: "Yes! Status changed to PICKED_UP" (responds ONLY when there's an update)
Client → Server: "Any more updates for order #456?" (immediately reconnects)
Server: (holds connection open again... waiting...)
Server → Client: "Driver is 3km away!"
Client → Server: (reconnects again)
...

Total requests: ~5 (one per actual update) vs ~50 with regular polling!

IMPLEMENTATION:

CLIENT SIDE:
async function longPoll(orderId) {
  while (true) {
    try {
      const response = await fetch(
        "/api/orders/" + orderId + "/updates?timeout=30"
      );
      const data = await response.json();
      
      if (data.hasUpdate) {
        updateUI(data);  // Show the update to Rahul
      }
      // Immediately reconnect for next update
    } catch (error) {
      // Connection failed, wait a bit, try again
      await sleep(3000);
    }
  }
}

SERVER SIDE:
app.get("/api/orders/:id/updates", async (req, res) => {
  const timeout = req.query.timeout || 30;  // max wait: 30 seconds
  
  const update = await waitForUpdate(req.params.id, timeout);
  
  if (update) {
    res.json({ hasUpdate: true, ...update });
  } else {
    // Timeout reached, no update. Send empty response.
    // Client will reconnect.
    res.json({ hasUpdate: false });
  }
});

THE TIMEOUT IS CRITICAL:
— Without timeout: Connection held forever → firewalls/proxies kill it
— Typical timeout: 20-30 seconds
— When timeout hits with no update: Server sends empty response, client reconnects
— This "heartbeat" keeps the connection alive through proxies

LONG POLLING TRADEOFFS:

✅ Works EVERYWHERE (just regular HTTP requests)
✅ No special server infrastructure needed
✅ Works through corporate firewalls and proxies
✅ Simple to implement
✅ Compatible with existing load balancers

❌ Each update requires a new HTTP connection (overhead)
❌ Headers sent every time (wastes bandwidth)
❌ Server holds many open connections (resource usage)
❌ Not truly real-time (small delay on each reconnection)
❌ One-directional (client can't push mid-wait)

WHEN TO USE LONG POLLING:
— When WebSocket support is uncertain (old browsers, corporate networks)
— For moderate update frequency (every few seconds)
— When simplicity matters more than performance
— As a FALLBACK when WebSockets fail

REAL-WORLD USAGE:
— Facebook's original chat (before switching to WebSockets)
— Slack's fallback mechanism
— Many notification systems
— COMET pattern (older name for long polling)

YOUR FOOD APP: Long polling works for order status updates (changes every few minutes). But for live driver location (updates every 2 seconds)? Too much overhead. You need WebSockets.`,
    analogy: `🍕 Long Polling is like calling the restaurant and saying "Don't hang up until my food is ready." You wait on hold for 10 minutes. They finally say "It's ready!" You hang up, then immediately call back: "Don't hang up until the driver picks it up." Each update = one phone call cycle.`
  },
  {
    id: 2, section: "realtime",
    phase: "WEBSOCKET",
    title: "WebSockets — The Always-Open Line",
    icon: "🔌",
    color: "#50C878",
    concepts: ["WebSockets", "Full Duplex", "Persistent Connection"],
    actors: ["Rahul's Phone", "WebSocket Server", "Order Service", "Location Service"],
    simple: `WebSockets are the gold standard for real-time communication. Unlike HTTP (request-then-response-then-done), a WebSocket creates a PERSISTENT, TWO-WAY connection between client and server. Either side can send messages at ANY time without the overhead of creating new connections.

Think of it as upgrading from phone calls (hang up after each message) to a walkie-talkie (always connected, both sides can talk anytime).`,
    detail: `HOW WEBSOCKETS WORK:

Step 1 — THE UPGRADE (starts as HTTP, upgrades to WebSocket):

Client sends a normal HTTP request with an "upgrade" header:

GET /ws/orders/456 HTTP/1.1
Host: api.foodapp.com
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
Sec-WebSocket-Version: 13

Server responds:
HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=

"101 Switching Protocols" — the connection is now a WebSocket!
The original HTTP connection is UPGRADED. Same TCP connection, new protocol.

Step 2 — FULL DUPLEX COMMUNICATION:

Now EITHER side can send messages at any time:

Server → Client: {"type": "status", "status": "PREPARING", "time": "12:30"}
Server → Client: {"type": "status", "status": "READY", "time": "12:45"}
Client → Server: {"type": "ping"}  (keepalive)
Server → Client: {"type": "driver_assigned", "driver": "Amit", "eta": "15 min"}
Server → Client: {"type": "location", "lat": 12.97, "lng": 77.59}
Server → Client: {"type": "location", "lat": 12.96, "lng": 77.58}
Client → Server: {"type": "message", "text": "Please don't ring the bell"}
Server → Client: {"type": "location", "lat": 12.95, "lng": 77.57}
Server → Client: {"type": "status", "status": "ARRIVING"}
Server → Client: {"type": "status", "status": "DELIVERED"}

No HTTP headers repeated. No connection re-establishment. Pure data.

CLIENT IMPLEMENTATION:
const ws = new WebSocket("wss://api.foodapp.com/ws/orders/456");

ws.onopen = () => {
  console.log("Connected! Tracking order 456.");
  ws.send(JSON.stringify({ type: "subscribe", orderId: "456" }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  switch (data.type) {
    case "status":
      updateOrderStatus(data.status);
      break;
    case "location":
      moveDriverPin(data.lat, data.lng);  // Update map marker
      break;
    case "eta":
      showETA(data.minutes);
      break;
  }
};

ws.onclose = () => {
  console.log("Connection closed. Reconnecting...");
  setTimeout(reconnect, 3000);  // Auto-reconnect
};

SERVER IMPLEMENTATION (Node.js):
const WebSocket = require("ws");
const wss = new WebSocket.Server({ port: 8080 });

wss.on("connection", (ws, req) => {
  const orderId = extractOrderId(req);
  
  // Subscribe to order updates from internal message queue
  orderEvents.subscribe(orderId, (update) => {
    ws.send(JSON.stringify(update));
  });
  
  ws.on("message", (msg) => {
    const data = JSON.parse(msg);
    if (data.type === "message") {
      forwardToDriver(orderId, data.text);
    }
  });
  
  ws.on("close", () => {
    orderEvents.unsubscribe(orderId);
  });
});

WEBSOCKET FRAMES (what actually goes over the wire):
Unlike HTTP which sends text headers every time, WebSocket sends tiny binary frames:
— 2-14 bytes of overhead per message (vs ~200-800 bytes for HTTP headers)
— This is why it's so efficient for frequent small updates

SCALING WEBSOCKETS (the hard part):

Problem: WebSocket connections are STATEFUL. Each user has a persistent connection to ONE specific server. With 1 million users, that's 1 million open connections.

Challenges:
1. MEMORY: Each connection uses ~2-10KB of RAM. 1M connections = 2-10GB RAM per server.

2. LOAD BALANCING: Unlike HTTP (any server can handle any request), WebSocket connections are "sticky" — user stays connected to ONE server.

3. BROADCASTING: If Order #456 updates, and Rahul is connected to Server A, but the Order Service notifies Server B — how does Rahul get the message?

Solutions:
— Redis Pub/Sub: All WebSocket servers subscribe to Redis. When an update happens, Redis broadcasts to all servers, and each server forwards to its connected clients.
— Dedicated WebSocket service: Separate from your API servers.
— Managed services: AWS API Gateway WebSocket, Pusher, Ably, Socket.IO

CONNECTION LIFECYCLE:
OPEN → (messages flowing) → PING/PONG (keepalive every 30s) → CLOSE

KEEPALIVE: Client and server exchange ping/pong frames to detect dead connections. If no pong received within timeout → connection is dead, clean up resources.

WEBSOCKET vs LONG POLLING:
                    Long Polling       WebSocket
Connection:         New per update     Persistent
Direction:          One-way            Two-way (full duplex)
Overhead:           HTTP headers       2-14 bytes per message
Latency:            ~100-300ms         ~1-10ms
Server memory:      Lower              Higher (persistent)
Scaling:            Easier (stateless) Harder (stateful)
Proxy/firewall:     Always works       Sometimes blocked
Best for:           Infrequent updates Frequent real-time data

YOUR FOOD APP:
— Order status updates: WebSocket (status changes + location every 2s)
— Driver-customer chat: WebSocket (bidirectional messaging)
— Admin dashboard: WebSocket (real-time order feed)
— One-time payment confirmation: NOT WebSocket (overkill, use webhook)`,
    analogy: `🍕 WebSocket is like a walkie-talkie between you and the delivery driver. Once connected, either side can talk instantly — "I'm picking up the food" / "Please get extra napkins" — without dialing, ringing, or reconnecting. It stays on until one side says "over and out." The downside? The walkie-talkie is always using battery (server resources), even during silence.`
  },
  {
    id: 3, section: "realtime",
    phase: "SSE",
    title: "Server-Sent Events — One-Way Broadcast",
    icon: "📡",
    color: "#9B59B6",
    concepts: ["SSE", "EventSource", "Server Push"],
    actors: ["Rahul's Phone (Listener)", "SSE Server (Broadcaster)"],
    simple: `Server-Sent Events (SSE) is the middle ground between Long Polling and WebSockets. It creates a persistent one-way connection where the SERVER can push messages to the CLIENT. The client can only listen — it can't send messages back through the same connection (it uses normal HTTP for that).

Think of it like a radio broadcast: the station transmits, you listen. If you want to call in, you use a separate phone line.`,
    detail: `HOW SSE WORKS:

Client opens a special HTTP connection:
GET /api/orders/456/stream HTTP/1.1
Accept: text/event-stream
Cache-Control: no-cache

Server responds with Content-Type: text/event-stream and KEEPS THE CONNECTION OPEN, sending events as they happen:

HTTP/1.1 200 OK
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive

data: {"status": "PREPARING", "time": "12:30"}

data: {"status": "READY", "time": "12:45"}

event: driver_location
data: {"lat": 12.97, "lng": 77.59}

event: driver_location
data: {"lat": 12.96, "lng": 77.58}

id: 42
event: status_change
data: {"status": "DELIVERED", "time": "13:05"}

SSE EVENT FORMAT:
— "data:" — the payload (required)
— "event:" — custom event type (optional, default is "message")
— "id:" — unique event ID (enables auto-reconnection from last event)
— "retry:" — tells client how long to wait before reconnecting (ms)

CLIENT IMPLEMENTATION (incredibly simple):
const source = new EventSource("/api/orders/456/stream");

// Default "message" events
source.onmessage = (event) => {
  const data = JSON.parse(event.data);
  updateOrderStatus(data);
};

// Custom named events
source.addEventListener("driver_location", (event) => {
  const loc = JSON.parse(event.data);
  moveDriverPin(loc.lat, loc.lng);
});

source.addEventListener("status_change", (event) => {
  const data = JSON.parse(event.data);
  showStatusUpdate(data.status);
});

source.onerror = () => {
  console.log("Connection lost. Browser will auto-reconnect!");
  // EventSource automatically reconnects. You don't need to code this!
};

KILLER FEATURE — AUTOMATIC RECONNECTION:
If the connection drops, EventSource automatically:
1. Waits (using the "retry" value from server)
2. Reconnects
3. Sends "Last-Event-ID: 42" header (the last ID it received)
4. Server can resume from event #43

You get FREE resume-from-where-you-left-off behavior. 
WebSocket? You have to build reconnection logic yourself.

SERVER IMPLEMENTATION (Node.js):
app.get("/api/orders/:id/stream", (req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive",
  });

  const lastId = req.headers["last-event-id"];
  if (lastId) {
    // Client reconnected! Send missed events since lastId
    sendMissedEvents(req.params.id, lastId, res);
  }

  const handler = (update) => {
    res.write("id: " + update.id + "\\n");
    res.write("event: " + update.type + "\\n");
    res.write("data: " + JSON.stringify(update) + "\\n\\n");
  };

  orderEvents.subscribe(req.params.id, handler);

  req.on("close", () => {
    orderEvents.unsubscribe(req.params.id, handler);
  });
});

SSE vs WEBSOCKET:
                    SSE                 WebSocket
Direction:          Server → Client     Both ways
Protocol:           HTTP (standard)     WebSocket (upgrade)
Auto-reconnect:     Built-in!           Manual
Last-Event-ID:      Built-in!           Manual
Data format:        Text only           Text + Binary
Browser support:    All modern          All modern
Through proxies:    Easy (just HTTP)    Sometimes blocked
Max connections:    6 per domain (HTTP/1) No limit (per browser)
Complexity:         Very simple         Moderate

WHEN TO USE SSE:
✅ Server-to-client updates only (notifications, feeds, dashboards)
✅ When you want auto-reconnection with resume
✅ Through restrictive firewalls (it's just HTTP!)
✅ Live news/score feeds
✅ Stock price tickers
✅ AI chat streaming (ChatGPT uses SSE to stream responses!)

WHEN NOT TO USE SSE:
❌ Need bidirectional communication (use WebSocket)
❌ Need binary data (use WebSocket)
❌ High-frequency updates from client (use WebSocket)
❌ Need more than 6 connections to same domain on HTTP/1.1

YOUR FOOD APP:
— Push notifications feed: SSE (one-way server push, perfect!)
— Live restaurant availability: SSE (server broadcasts changes)
— AI chatbot streaming: SSE (response streams token by token)
— Order tracking with chat: WebSocket (need bidirectional)`,
    analogy: `🍕 SSE is like a restaurant's order status display board. The kitchen keeps updating it: "Order 456: Preparing → Ready → Out for delivery." You just WATCH the board. If you need to talk back ("add extra raita"), you go to the counter separately (normal HTTP request). The board auto-refreshes if the screen flickers (auto-reconnect).`
  },
  {
    id: 4, section: "realtime",
    phase: "WEBHOOKS",
    title: "Webhooks — Don't Call Us, We'll Call You",
    icon: "🪝",
    color: "#1ABC9C",
    concepts: ["Webhooks", "Callback URL", "Server-to-Server"],
    actors: ["Razorpay", "Your Server's Webhook Endpoint", "Order Service"],
    simple: `Webhooks flip the entire model. Instead of your server repeatedly asking Razorpay "Did the payment go through?" — you tell Razorpay: "Here's my URL. When the payment is done, call ME."

Webhooks are SERVER-TO-SERVER push notifications. You give a callback URL to another service, and they POST data to it when something happens. No polling. No persistent connections. Just: "Call me when it's done."`,
    detail: `THE PROBLEM:

Without webhooks, your payment flow:
1. You create a payment via Razorpay API → get payment_id
2. Customer completes payment on Razorpay's page
3. Now what? You don't know when they'll finish!

Option A — POLLING:
while (true) {
  status = GET razorpay.com/payments/pay_123
  if (status === "captured") break;
  sleep(2000);
}
Wasteful. Could be 2 seconds or 20 minutes.

Option B — WEBHOOKS (the right way):
When setting up Razorpay:
"Hey Razorpay, when anything happens with my payments, 
POST the details to https://api.foodapp.com/webhooks/razorpay"

Done. You just wait. Razorpay calls YOU.

THE COMPLETE WEBHOOK FLOW:

Step 1 — REGISTRATION:
You configure a webhook URL in Razorpay's dashboard:
  URL: https://api.foodapp.com/webhooks/razorpay
  Events: payment.captured, payment.failed, refund.created
  Secret: whsec_abc123 (for signature verification)

Step 2 — EVENT OCCURS:
Rahul completes his UPI payment on Razorpay.

Step 3 — RAZORPAY CALLS YOUR URL:
POST https://api.foodapp.com/webhooks/razorpay
Content-Type: application/json
X-Razorpay-Signature: sha256=a1b2c3d4e5...

{
  "event": "payment.captured",
  "payload": {
    "payment": {
      "id": "pay_abc123",
      "amount": 64000,
      "currency": "INR",
      "status": "captured",
      "order_id": "ord_456",
      "method": "upi"
    }
  }
}

Step 4 — YOUR SERVER PROCESSES IT:
app.post("/webhooks/razorpay", (req, res) => {
  // 1. VERIFY SIGNATURE (critical!)
  const expectedSig = hmac_sha256(req.body, webhookSecret);
  if (req.headers["x-razorpay-signature"] !== expectedSig) {
    return res.status(401).send("Invalid signature");
  }

  // 2. PROCESS THE EVENT
  if (req.body.event === "payment.captured") {
    markOrderAsPaid(req.body.payload.payment.order_id);
    notifyRestaurant(req.body.payload.payment.order_id);
    sendConfirmationSMS();
  }

  // 3. RESPOND QUICKLY with 200 OK
  res.status(200).send("OK");
  
  // IMPORTANT: Return 200 fast! Do heavy processing async.
  // If you take too long, Razorpay thinks your server is down
  // and will RETRY the webhook.
});

CRITICAL WEBHOOK SECURITY:

1. SIGNATURE VERIFICATION:
   Razorpay signs every webhook with your secret key.
   YOU verify the signature before trusting the data.
   Without this: anyone could POST fake "payment successful" to your URL!

2. HTTPS ONLY:
   Webhook URLs must be HTTPS. Data contains sensitive payment info.

3. IDEMPOTENCY:
   Razorpay may send the same webhook MULTIPLE TIMES (retries).
   Your handler MUST be idempotent — processing the same event twice should have no effect.
   
   if (eventAlreadyProcessed(event.id)) return res.status(200).send("OK");

WEBHOOK RETRY LOGIC (Razorpay's side):
If your server returns non-2xx or times out:
  Attempt 1: immediately
  Attempt 2: 5 minutes later
  Attempt 3: 30 minutes later
  Attempt 4: 2 hours later
  Attempt 5: 24 hours later
  After 5 failures: event marked as failed, alert sent

REAL WEBHOOK EXAMPLES IN YOUR APP:

RAZORPAY → YOUR SERVER:
  payment.captured → Mark order as paid, notify restaurant
  payment.failed → Show error, ask customer to retry
  refund.processed → Update order status, notify customer

TWILIO → YOUR SERVER:
  message.delivered → Mark SMS as delivered
  message.failed → Retry via push notification instead

YOUR SERVER → RESTAURANT'S SYSTEM:
  order.placed → Restaurant receives new order
  order.cancelled → Restaurant stops preparing

WEBHOOKS vs OTHER PATTERNS:
                    Webhooks           Polling           WebSocket
Direction:          Server → Server    Client → Server   Both (client-server)
Connection:         No persistent      No persistent     Persistent
Use case:           Event callbacks    Checking status   Live UI updates
Latency:            Near-instant       Depends on poll   Instant
Infrastructure:     Simple             Simple            Complex

KEY INSIGHT: Webhooks are for SERVER-TO-SERVER events. WebSockets are for SERVER-TO-CLIENT real-time. They solve DIFFERENT problems and are often used TOGETHER.`,
    analogy: `🍕 Webhooks are like leaving your phone number with the restaurant: "Call me when my order is ready." You don't have to sit in the restaurant staring at the kitchen. You go about your day, and they CALL YOU when it's time. But you need to make sure the person calling is actually the restaurant (signature verification) and not a prank caller.`
  },
  {
    id: 5, section: "realtime",
    phase: "WEBRTC",
    title: "WebRTC — Peer-to-Peer Audio/Video",
    icon: "📹",
    color: "#E74C3C",
    concepts: ["WebRTC", "Peer-to-Peer", "STUN", "TURN", "Signaling"],
    actors: ["Rahul's Phone", "Signaling Server", "STUN/TURN Server", "Driver Amit's Phone"],
    simple: `Rahul can't find the driver. He taps "Call Driver" in the app. Instantly, he's in a voice call with Amit the driver — no phone number exchanged, no third-party app needed. This is WebRTC.

WebRTC (Web Real-Time Communication) enables DIRECT peer-to-peer audio, video, and data streaming between browsers/apps. The data flows directly between Rahul and Amit's devices — it doesn't go through your server. This means low latency and no server bandwidth costs for the media.`,
    detail: `WHY NOT JUST USE WEBSOCKETS FOR CALLS?

WebSocket path: Rahul → Your Server → Amit
  — Server processes EVERY audio/video packet
  — Server bandwidth: huge (video = ~2-5 Mbps per call)
  — Latency: doubled (two hops instead of one)
  — Cost: astronomical at scale

WebRTC path: Rahul ←directly→ Amit
  — Data flows between phones directly
  — Your server only helps with initial setup
  — Lower latency (one hop)
  — Zero bandwidth cost on your server for media

THE WEBRTC CONNECTION PROCESS:

Step 1 — SIGNALING (via your server, using WebSocket):
Before peers can connect directly, they need to exchange connection info. Your server acts as a "matchmaker":

Rahul's phone → Your Server: "I want to call the driver for order #456"
Your Server → Amit's phone: "Rahul wants to call you"
(They exchange "offers" and "answers" containing connection details)

The signaling server is NOT a WebRTC thing — it's any communication channel (WebSocket, HTTP, carrier pigeon). WebRTC doesn't define how signaling works.

Step 2 — ICE CANDIDATES (finding a path):
Both devices need to discover their network addresses and figure out how to reach each other. ICE (Interactive Connectivity Establishment) finds the best path:

Option A — Direct P2P:
  Rahul (public IP) ↔ Amit (public IP)
  Best case. Both on open networks.

Option B — Via STUN server:
  Most devices are behind NAT (your router hides your real IP).
  STUN server helps discover your public IP + port:
  
  Rahul → STUN: "What's my public address?"
  STUN → Rahul: "You're at 103.56.78.12:45123"
  (Amit does the same)
  Now they can connect directly using public addresses.

Option C — Via TURN server (fallback):
  If direct connection fails (strict firewalls, symmetric NAT):
  Rahul → TURN server → Amit
  TURN relays the media. Less efficient but works everywhere.
  (~10-15% of calls need TURN)

Step 3 — DTLS + SRTP (security):
All WebRTC media is encrypted end-to-end:
  — DTLS for key exchange (like TLS but for UDP)
  — SRTP for media encryption
  Nobody (not even your server) can eavesdrop on the call.

Step 4 — MEDIA FLOWING:
Direct audio/video stream between Rahul and Amit.
WebRTC handles:
  — Codec negotiation (VP8/VP9/H.264 for video, Opus for audio)
  — Adaptive bitrate (adjusts quality based on network)
  — Echo cancellation, noise suppression
  — Packet loss concealment

CODE OUTLINE:
// Rahul's side
const pc = new RTCPeerConnection({
  iceServers: [
    { urls: "stun:stun.foodapp.com:3478" },
    { urls: "turn:turn.foodapp.com:3478", username: "...", credential: "..." }
  ]
});

// Get Rahul's camera/mic
const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
stream.getTracks().forEach(track => pc.addTrack(track, stream));

// When Amit's video arrives, show it
pc.ontrack = (event) => {
  document.getElementById("driverVideo").srcObject = event.streams[0];
};

// Create offer, send via signaling server (WebSocket)
const offer = await pc.createOffer();
await pc.setLocalDescription(offer);
signalingChannel.send(JSON.stringify({ type: "offer", sdp: offer }));

WEBRTC IN YOUR FOOD APP:
— Driver ↔ Customer voice call (no phone numbers shared!)
— Customer support video call
— Live kitchen camera feed (restaurant → customer)

WEBRTC USE CASES ELSEWHERE:
— Google Meet, Zoom (web version), Discord
— Telehealth video consultations
— Live streaming (one-to-many with SFU servers)
— Screen sharing

KEY INSIGHT: WebRTC needs a signaling mechanism (WebSocket/HTTP) to set up the connection, but the actual media flows peer-to-peer. Your server helps them find each other; after that, it steps aside.`,
    analogy: `🍕 WebRTC is like two people agreeing to meet in person. They need a mutual friend (signaling server) to exchange phone numbers. One might need to check their address with a map service (STUN). If they're both behind locked gates, they might meet at a coffee shop instead (TURN relay). But once they're face-to-face, the conversation is direct — the friend isn't involved anymore.`
  },
  // ============ ASYNC ============
  {
    id: 6, section: "async",
    phase: "SYNC vs ASYNC",
    title: "Sync vs Async — The Fundamental Choice",
    icon: "⏳",
    color: "#4A90D9",
    concepts: ["Synchronous", "Asynchronous", "Blocking vs Non-blocking"],
    actors: ["Order Service", "Payment Service", "Notification Service", "Restaurant Service"],
    simple: `When Rahul places an order, your Order Service needs to: charge his payment, notify the restaurant, send him a confirmation SMS, and update analytics. Should it do ALL of these one-by-one and make Rahul wait? Or should it trigger them in the background and respond to Rahul immediately?

SYNCHRONOUS: "I'll do everything right now and tell you when ALL of it is done."
ASYNCHRONOUS: "I'll start everything in the background. Here's your confirmation. The rest will happen shortly."`,
    detail: `SYNCHRONOUS FLOW (Rahul waits for EVERYTHING):

Rahul taps "Place Order"
  ↓
Order Service → Payment Service: "Charge ₹640" (waits 800ms)
  ↓ (success)
Order Service → Restaurant Service: "New order!" (waits 200ms)
  ↓ (success)
Order Service → Notification Service: "Send SMS" (waits 500ms)
  ↓ (success)
Order Service → Analytics Service: "Log order" (waits 150ms)
  ↓ (success)
Order Service → Rahul: "Order placed!" 

TOTAL WAIT TIME: 800 + 200 + 500 + 150 = 1,650ms
Rahul stares at a loading spinner for 1.6 SECONDS.

AND WORSE — if Notification Service is down:
Order Service → Notification Service: ... timeout (5000ms) ... FAILED!
What now? Cancel the order? Rahul paid! But he didn't get a confirmation SMS!

ASYNCHRONOUS FLOW (Rahul waits for ESSENTIALS only):

Rahul taps "Place Order"
  ↓
Order Service → Payment Service: "Charge ₹640" (waits 800ms) ← ESSENTIAL, must be sync
  ↓ (success)
Order Service → Message Queue: "Notify restaurant" (instant, ~5ms)
Order Service → Message Queue: "Send SMS" (instant, ~5ms)
Order Service → Message Queue: "Log analytics" (instant, ~5ms)
Order Service → Rahul: "Order placed!"

TOTAL WAIT TIME: 800 + 5 + 5 + 5 = 815ms
Rahul sees confirmation in under 1 second!

Meanwhile, in the background:
— Message Queue → Restaurant Service picks up "notify restaurant" → processes it
— Message Queue → Notification Service picks up "send SMS" → sends it
— Message Queue → Analytics Service picks up "log order" → logs it

If Notification Service is down? The message stays in the queue. When the service comes back, it processes the SMS. Rahul still got his order confirmation!

THE DECISION FRAMEWORK:

USE SYNCHRONOUS WHEN:
— The result is needed IMMEDIATELY for the response
— The operation MUST succeed for the request to succeed
— The caller needs the exact result right now
Examples:
  — Payment processing (need to know if it succeeded)
  — Authentication (need to verify before proceeding)
  — Reading data to display (need the data for the page)

USE ASYNCHRONOUS WHEN:
— The result is NOT needed for the immediate response
— Failure can be retried later
— The operation is slow or unreliable
— You want to decouple services
Examples:
  — Sending emails/SMS (can arrive a few seconds later)
  — Updating analytics (not user-facing)
  — Generating reports (takes minutes)
  — Notifying other services
  — Processing images/videos

THE REAL INSIGHT:
Most production systems use BOTH. The critical path is synchronous (payment → confirm order). Everything else is asynchronous (notify, log, email, update recommendations).

This is called the "sync for writes you need confirmed, async for everything else" pattern. And the mechanism that makes async work? Message Queues — which we'll cover next.`,
    analogy: `🍕 Synchronous = you order at a restaurant and stand at the counter until EVERYTHING is ready — food cooked, packed, receipt printed, loyalty points added. Asynchronous = you order, they immediately say "Order #456 confirmed!" and hand you a receipt. The cooking, packing, and loyalty points happen in the background. You go sit down and they'll call your number when the food is ready.`
  },
  {
    id: 7, section: "async",
    phase: "QUEUES",
    title: "Message Queues — The Reliable Middleman",
    icon: "📬",
    color: "#F39C12",
    concepts: ["Message Queue", "Producer", "Consumer", "Decoupling"],
    actors: ["Order Service (Producer)", "Message Queue (RabbitMQ/SQS)", "Notification Service (Consumer)", "Restaurant Service (Consumer)"],
    simple: `A Message Queue is a buffer that sits between services. Service A puts a message in the queue. Service B takes it out and processes it — whenever it's ready. The queue guarantees the message won't be lost, even if Service B is temporarily down.

Think of it as a reliable mailbox. You drop a letter in. The recipient picks it up when they can. The mailbox keeps it safe in the meantime. The sender and recipient never need to be available at the same time.`,
    detail: `HOW A MESSAGE QUEUE WORKS:

PRODUCER → QUEUE → CONSUMER

Order Service (producer):
  queue.send("notifications", {
    type: "order_confirmation",
    orderId: "456",
    userId: "rahul_1",
    phone: "+91-9876543210",
    message: "Your order #456 is confirmed!"
  });
  // Returns immediately. Doesn't wait for SMS to actually send.

Queue (RabbitMQ / AWS SQS / Redis):
  Stores the message durably (written to disk)
  Keeps it until a consumer processes it

Notification Service (consumer):
  queue.consume("notifications", async (msg) => {
    await twilioClient.sendSMS(msg.phone, msg.message);
    msg.acknowledge();  // "I processed it, remove from queue"
  });

THE ACKNOWLEDGE PATTERN:
1. Consumer receives message from queue
2. Consumer processes it
3. Consumer sends ACK (acknowledge) → queue deletes message
4. If consumer CRASHES before ACK → queue REDELIVERS the message to another consumer

This guarantees no message is lost, even if consumers crash!

DECOUPLING — THE BIG WIN:

WITHOUT QUEUE (tight coupling):
Order Service directly calls Notification Service.
— If Notification Service is down → Order Service fails or must handle the error
— If you add a new service (Analytics) → modify Order Service code
— If Notification is slow → Order Service is slow
— Order Service KNOWS about Notification Service

WITH QUEUE (loose coupling):
Order Service just puts messages in the queue.
— If Notification Service is down → messages wait in queue, no data loss
— Add Analytics Service? → it just subscribes to the queue. Zero changes to Order Service!
— If Notification is slow → only affects notification delivery, not order placement
— Order Service has NO IDEA who reads its messages

REAL MESSAGE QUEUE SYSTEMS:

1. RABBITMQ:
   — Traditional message broker
   — Supports complex routing (exchanges, bindings)
   — Message-level acknowledgment
   — Good for: task queues, RPC patterns
   
2. AWS SQS (Simple Queue Service):
   — Fully managed (no infrastructure)
   — Scales automatically
   — Standard queue (at-least-once, unordered)
   — FIFO queue (exactly-once, ordered)
   — Good for: AWS-native apps, simple async tasks

3. REDIS (as a queue):
   — In-memory, super fast
   — Redis Streams or List-based queues
   — Less durable (in-memory by default)
   — Good for: speed-critical, can tolerate some loss

QUEUE FEATURES:
— PERSISTENCE: Messages stored on disk (survive restarts)
— ORDERING: FIFO (first in, first out) — optional
— RETRY: Failed messages can be retried with backoff
— DEAD LETTER QUEUE: Messages that fail repeatedly go to a DLQ (we'll cover this)
— TTL: Messages expire after a time limit
— PRIORITY: High-priority messages processed first

QUEUE vs DIRECT CALL:
                    Direct Call         Message Queue
Coupling:           Tight               Loose
Failure handling:   Complex             Built-in retry
Speed:              Immediate           Slight delay
Reliability:        If callee is down?  Message waits safely
Scaling:            Scale both together Scale independently
Debugging:          Direct stack trace  Need queue monitoring

YOUR FOOD APP QUEUES:
— "order-notifications": Order placed → send SMS, push notification, email
— "restaurant-orders": Order placed → notify restaurant system
— "analytics-events": Any event → log to analytics
— "email-queue": Various → send transactional emails
— "image-processing": Restaurant uploads photo → resize, compress, CDN`,
    analogy: `🍕 A message queue is like the order ticket rail in a restaurant kitchen. The waiter (producer) clips a ticket on the rail and walks away — they don't wait for the chef. The chef (consumer) grabs tickets when ready, in order. If the chef takes a bathroom break, tickets just pile up on the rail and get processed when they return. The rail NEVER loses a ticket.`
  },
  {
    id: 8, section: "async",
    phase: "PUB/SUB",
    title: "Pub/Sub — One Event, Many Listeners",
    icon: "📢",
    color: "#50C878",
    concepts: ["Publish/Subscribe", "Topics", "Fan-out", "Event-Driven"],
    actors: ["Order Service (Publisher)", "Topic: order.placed", "Notification Service", "Restaurant Service", "Analytics Service", "Recommendation Service"],
    simple: `In a message queue, one message goes to ONE consumer. But when an order is placed, you want MULTIPLE services to know about it — notifications, restaurant, analytics, recommendations, loyalty points, etc.

Pub/Sub (Publish/Subscribe) solves this: one event is published to a TOPIC, and ALL services subscribed to that topic receive a copy. The publisher doesn't know or care who's listening.`,
    detail: `MESSAGE QUEUE vs PUB/SUB:

MESSAGE QUEUE (point-to-point):
Producer → Queue → ONE Consumer
"Send this SMS" → Notification Service processes it → done.
The message is consumed by ONE service and deleted.

PUB/SUB (fan-out):
Publisher → Topic → MANY Subscribers (each gets a copy)
"Order placed" → Topic "order.placed" →
  → Notification Service (sends SMS) ← gets its own copy
  → Restaurant Service (alerts kitchen) ← gets its own copy
  → Analytics Service (logs event) ← gets its own copy
  → Recommendation Service (updates model) ← gets its own copy
  → Loyalty Service (awards points) ← gets its own copy

Each subscriber gets the FULL message independently.

HOW IT WORKS:

PUBLISHING:
pubsub.publish("order.placed", {
  orderId: "456",
  userId: "rahul_1",
  restaurantId: "123",
  items: ["Biryani x2"],
  amount: 640,
  timestamp: "2024-01-15T12:30:00Z"
});

SUBSCRIBING (each service independently):
// Notification Service
pubsub.subscribe("order.placed", async (event) => {
  await sendSMS(event.userId, "Order confirmed!");
  await sendPushNotification(event.userId, "Your food is being prepared");
});

// Restaurant Service
pubsub.subscribe("order.placed", async (event) => {
  await alertRestaurant(event.restaurantId, event);
});

// Analytics Service
pubsub.subscribe("order.placed", async (event) => {
  await logOrderEvent(event);
  await updateDashboard(event);
});

// Recommendation Service
pubsub.subscribe("order.placed", async (event) => {
  await updateUserPreferences(event.userId, event.items);
});

THE POWER — ADDING NEW SUBSCRIBERS:
Your PM says: "We need to add a loyalty points system!"

WITHOUT Pub/Sub:
  → Modify Order Service to also call Loyalty Service
  → Redeploy Order Service
  → Risk breaking existing order flow

WITH Pub/Sub:
  → Loyalty Service subscribes to "order.placed" topic
  → Zero changes to Order Service
  → Zero changes to any other service
  → The Loyalty Service is the ONLY thing deployed

This is the Open/Closed Principle in action: open for extension, closed for modification.

REAL PUB/SUB SYSTEMS:

1. APACHE KAFKA:
   — Distributed streaming platform
   — Extremely high throughput (millions of messages/sec)
   — Messages are PERSISTENT (stored on disk, replayable!)
   — Consumer groups (multiple instances of a service share load)
   — Used by: LinkedIn, Netflix, Uber, your food app's backbone
   
2. GOOGLE CLOUD PUB/SUB:
   — Fully managed
   — Global scale
   — At-least-once delivery
   — Push and pull subscription modes

3. AWS SNS (Simple Notification Service):
   — Fan-out to SQS queues, Lambda, HTTP endpoints
   — Often paired: SNS (pub/sub) → SQS (queue per subscriber)
   
4. REDIS PUB/SUB:
   — In-memory, super fast
   — No persistence (if subscriber is offline, message lost!)
   — Good for: ephemeral events (typing indicators, presence)

KAFKA DEEP DIVE (since it's the most important):

TOPICS: Named channels for events
  — "order.placed", "order.cancelled", "payment.captured"

PARTITIONS: Each topic split into partitions for parallelism
  — "order.placed" with 4 partitions → 4 consumers can read in parallel

CONSUMER GROUPS: Multiple instances of a service share partitions
  — 3 Notification Service instances → each reads from different partitions
  — Load balancing within a subscriber!

RETENTION: Kafka keeps messages for days/weeks (configurable)
  — New service? Replay last 7 days of events to build its state
  — Bug in consumer? Replay and reprocess!

YOUR FOOD APP'S EVENT ARCHITECTURE:

Events published:
  order.placed → 5 subscribers
  order.cancelled → 3 subscribers (refund, restaurant, analytics)
  payment.captured → 2 subscribers (order service, receipt service)
  delivery.status_changed → 4 subscribers (customer app, restaurant, analytics, ETA service)
  driver.location_updated → 2 subscribers (customer app, ETA service)

This is called EVENT-DRIVEN ARCHITECTURE. Services don't call each other — they react to events. Loose coupling, independent scaling, incredible flexibility.`,
    analogy: `🍕 Pub/Sub is like a restaurant's announcement speaker. When the chef says "Order 456 ready!" over the speaker (publishes to topic), EVERYONE hears it — the waiter, the cashier, the manager, the quality checker. Each person acts on the announcement independently. Adding a new listener (food critic) doesn't require changing the speaker system. They just start listening.`
  },
  {
    id: 9, section: "async",
    phase: "CDC",
    title: "Change Data Capture — Database as Event Source",
    icon: "🔄",
    color: "#D63384",
    concepts: ["CDC", "Database Log", "Debezium", "Event Sourcing"],
    actors: ["Order Database", "CDC Connector (Debezium)", "Kafka", "Search Index", "Analytics DB", "Cache"],
    simple: `What if I told you that every change to your database — every INSERT, UPDATE, DELETE — could automatically become an event that other services can consume? That's Change Data Capture (CDC).

Instead of making your application code publish events (which it might forget to do), CDC watches the DATABASE ITSELF and streams every change as an event. The database becomes the single source of truth, and changes flow out automatically.`,
    detail: `THE PROBLEM CDC SOLVES:

Your Order Service writes to its database:
  INSERT INTO orders (id, status, user_id) VALUES ("456", "placed", "rahul_1");

Now you need to:
1. Update the Elasticsearch search index
2. Update the analytics data warehouse
3. Invalidate the cache
4. Send a notification

APPROACH 1 — APPLICATION-LEVEL EVENTS (dual write problem):
async function placeOrder(order) {
  await db.insert("orders", order);           // Write to DB
  await kafka.publish("order.placed", order);  // Publish event
}

PROBLEM: What if the DB write succeeds but Kafka publish fails?
— DB has the order, but no event was published
— Notification never sent, analytics never updated
— Data is INCONSISTENT across systems

What if Kafka succeeds but DB fails?
— Event says "order placed" but there's no order in the DB!

This is the "dual write problem" — writing to two systems atomically is HARD.

APPROACH 2 — CDC (the elegant solution):
Just write to the database. CDC watches the database log and publishes events automatically.

async function placeOrder(order) {
  await db.insert("orders", order);  // ONLY write to DB. That's it!
}

// Meanwhile, CDC (Debezium) is reading the database's transaction log:
// "Oh, a new row in 'orders' table!" → publishes to Kafka automatically

No dual write. Database is the single source of truth. Events are derived.

HOW CDC ACTUALLY WORKS:

Every database maintains a TRANSACTION LOG (also called WAL, binlog, oplog):
— PostgreSQL: Write-Ahead Log (WAL)
— MySQL: Binary Log (binlog)
— MongoDB: Oplog

This log records EVERY change before it's applied. It's how databases implement crash recovery and replication.

CDC tools (like Debezium) READ this log and convert each entry into an event:

Database Log Entry:
  INSERT orders: {id: "456", status: "placed", user_id: "rahul_1", amount: 640}

CDC converts to Kafka event:
{
  "op": "c",              (c=create, u=update, d=delete)
  "table": "orders",
  "before": null,         (no previous state for INSERT)
  "after": {
    "id": "456",
    "status": "placed",
    "user_id": "rahul_1",
    "amount": 640
  },
  "timestamp": "2024-01-15T12:30:00Z"
}

For an UPDATE:
  UPDATE orders SET status = 'preparing' WHERE id = '456';

CDC event:
{
  "op": "u",
  "table": "orders",
  "before": {"id": "456", "status": "placed", ...},
  "after": {"id": "456", "status": "preparing", ...},
  "timestamp": "2024-01-15T12:35:00Z"
}

You get BOTH the before and after state! Perfect for building derived views.

CDC TOOLS:
— Debezium (open-source, most popular, supports Postgres/MySQL/MongoDB/etc.)
— AWS DMS (Database Migration Service)
— Maxwell (MySQL only)
— Custom: Read the WAL/binlog directly (hard, not recommended)

CDC USE CASES:

1. KEEP SEARCH INDEX IN SYNC:
   Order DB → CDC → Kafka → Elasticsearch consumer → Search index updated
   Search is always in sync with the database, automatically!

2. REAL-TIME ANALYTICS:
   Order DB → CDC → Kafka → Analytics consumer → Data warehouse
   Analytics dashboard shows real-time order data.

3. CACHE INVALIDATION:
   Order DB → CDC → Kafka → Cache consumer → Redis cache invalidated
   Never serve stale cached data again.

4. CROSS-SERVICE DATA SYNC:
   Order DB → CDC → Kafka → Restaurant Service → updates its own view of orders
   Each service maintains its own read-optimized view.

5. AUDIT LOG:
   Order DB → CDC → Kafka → Audit Service → permanent change log
   "Who changed what, when?" — answered perfectly.

CDC vs APPLICATION EVENTS:
                  App Events           CDC
Source of truth:  Application code     Database log
Dual write risk:  Yes!                 No (single write)
Guaranteed:       No (code might fail) Yes (DB log is reliable)
Schema:           Custom               Matches DB schema
Latency:          Instant              Near-instant (~100ms)
Complexity:       Simple code          Infrastructure setup`,
    analogy: `🍕 CDC is like a security camera in the kitchen. Instead of asking the chef to announce every action ("I'm chopping onions! Now I'm stirring!"), the camera silently records everything that happens. Anyone can watch the footage later — the manager, quality control, or the training team. The chef just cooks (writes to DB). The camera (CDC) captures everything automatically.`
  },
  // ============ RELIABILITY ============
  {
    id: 10, section: "reliability",
    phase: "DELIVERY",
    title: "Delivery Semantics — How Many Times?",
    icon: "📦",
    color: "#E74C3C",
    concepts: ["At-Most-Once", "At-Least-Once", "Exactly-Once"],
    actors: ["Producer", "Message Broker", "Consumer"],
    simple: `Here's a deceptively tricky question: when you send a message through a queue, how many times will the consumer receive it?

Exactly once? That would be ideal, but it's surprisingly hard to guarantee. Networks fail. Servers crash. Messages get duplicated. The three delivery semantics — at-most-once, at-least-once, and exactly-once — represent different tradeoffs between losing messages and duplicating them.`,
    detail: `THE THREE DELIVERY SEMANTICS:

━━━ AT-MOST-ONCE (fire and forget) ━━━

"I'll send it once. If it's lost, oh well."

How: Producer sends message, doesn't wait for acknowledgment.
If anything fails → message is lost forever.

Flow:
  Producer → Message → Broker
  (no ACK, no retry)
  Broker → Consumer (if consumer crashes → message gone)

Guarantee: Message delivered 0 or 1 times. NEVER duplicated. May be LOST.

Use when:
  — Loss is acceptable
  — Speed matters more than reliability
  — Metrics/logging (losing one data point is fine)
  — Live sensor data (next reading coming in 1 second anyway)

Your food app example:
  — Driver location pings every 2 seconds
  — Losing one ping? No problem, next one arrives in 2 seconds
  — Using at-most-once for speed

━━━ AT-LEAST-ONCE (most common!) ━━━

"I'll keep sending until I'm SURE you got it. You might get duplicates."

How: Producer sends message, waits for ACK. No ACK? Retry. Consumer processes message, sends ACK. Crash before ACK? Broker redelivers.

Flow:
  Producer → Message → Broker → ACK to Producer ✅
  Broker → Consumer → Consumer processes → ACK to Broker ✅
  
  But what if Consumer processes it, then CRASHES before ACK?
  Broker: "No ACK received. Consumer must have failed. Redeliver!"
  Broker → Consumer (again!) → Consumer processes AGAIN → ACK ✅
  
  Result: Message processed TWICE!

Guarantee: Message delivered 1 or more times. NEVER lost. May be DUPLICATED.

Use when:
  — Losing messages is unacceptable
  — Your consumer is IDEMPOTENT (processing twice = same as once)
  — Most business-critical operations

Your food app example:
  — "Send order confirmation SMS"
  — Better to send 2 SMSes than 0 SMSes
  — Rahul might get "Order confirmed!" twice — annoying but acceptable
  — vs. never getting confirmation — unacceptable!

━━━ EXACTLY-ONCE (the holy grail) ━━━

"Message delivered exactly one time. No loss, no duplicates."

The hard truth: TRUE exactly-once delivery across distributed systems is essentially impossible (see: Two Generals Problem). What systems call "exactly-once" is really "effectively-once" — using clever techniques:

TECHNIQUE 1 — Idempotent Consumer:
  At-least-once delivery + idempotent processing = effectively exactly-once
  
  Consumer tracks processed message IDs:
  async function processMessage(msg) {
    if (await alreadyProcessed(msg.id)) return;  // Skip duplicate
    await processPayment(msg);
    await markProcessed(msg.id);
  }
  
  Even if the message arrives 3 times, payment happens once.

TECHNIQUE 2 — Transactional Outbox:
  Write message + business data in the SAME database transaction:
  
  BEGIN TRANSACTION;
    INSERT INTO orders (...);
    INSERT INTO outbox (message, topic, ...);
  COMMIT;
  
  A separate process reads the outbox and publishes to Kafka.
  If the transaction fails → neither the order NOR the message is created.

TECHNIQUE 3 — Kafka Transactions:
  Kafka supports "exactly-once semantics" within Kafka:
  — Producer idempotency (deduplicates at broker)
  — Transactional produce + consume
  — But only Kafka-to-Kafka! Once you leave Kafka, you need idempotent consumers.

SUMMARY TABLE:
                  At-Most-Once   At-Least-Once   Exactly-Once
Lost messages:    Possible       No              No
Duplicates:       No             Possible        No
Complexity:       Simple         Moderate        High
Performance:      Fastest        Fast            Slower
Use case:         Metrics, logs  Most things     Payments, billing

THE PRACTICAL ANSWER:
Use at-least-once delivery + make your consumers idempotent. 
This gives you "effectively exactly-once" without the complexity.
This is what 95% of production systems do.`,
    analogy: `🍕 At-most-once = shouting your order across a crowded restaurant. Chef might not hear. You don't repeat. At-least-once = you keep shouting until the chef acknowledges. Maybe they heard you twice and make two plates. Exactly-once = you hand a written ticket with a number. Even if the chef sees the same ticket twice, they only cook it once because they check the ticket number.`
  },
  {
    id: 11, section: "reliability",
    phase: "DLQ",
    title: "Dead Letter Queues — Where Failed Messages Go",
    icon: "💀",
    color: "#8B0000",
    concepts: ["Dead Letter Queue", "Poison Message", "Retry Strategy", "Error Handling"],
    actors: ["Main Queue", "Consumer (failing)", "Retry Queue", "Dead Letter Queue", "Alert System"],
    simple: `Some messages are toxic. No matter how many times you retry, they'll fail — maybe the data is corrupted, or the target account doesn't exist, or there's a bug in your code for this edge case.

Without a Dead Letter Queue (DLQ), these "poison messages" stay in your main queue forever, blocking everything behind them. A DLQ is a special queue where messages go after failing too many times. It's the hospital for sick messages — quarantined for humans to investigate.`,
    detail: `THE PROBLEM — POISON MESSAGES:

Main Queue has this message:
{
  "type": "send_sms",
  "phone": "+91-INVALID",      ← invalid phone number!
  "message": "Order confirmed"
}

Consumer tries to process it:
  Attempt 1: Twilio API → "Invalid phone number!" → FAIL
  Attempt 2: Twilio API → "Invalid phone number!" → FAIL
  Attempt 3: Twilio API → "Invalid phone number!" → FAIL
  ... forever ...

WITHOUT DLQ:
  — This message blocks the queue forever
  — All messages BEHIND it are stuck (head-of-line blocking)
  — Or worse: the message is dropped silently and nobody knows

WITH DLQ:
  Attempt 1: FAIL → retry after 1 second
  Attempt 2: FAIL → retry after 5 seconds
  Attempt 3: FAIL → retry after 30 seconds
  MAX RETRIES REACHED → move to Dead Letter Queue
  Alert team: "Message failed 3 times, investigate!"
  
  Main queue continues processing other messages normally!

THE RETRY + DLQ PATTERN:

EXPONENTIAL BACKOFF RETRY:
  Attempt 1: immediate
  Attempt 2: wait 1 second
  Attempt 3: wait 5 seconds
  Attempt 4: wait 30 seconds
  Attempt 5: wait 2 minutes
  FAILED → move to DLQ

Why exponential? If the issue is temporary (network blip), short waits fix it. If it's persistent (bug, bad data), you don't want to hammer the failing service.

IMPLEMENTATION:

// Consumer with retry + DLQ logic
async function processWithRetry(message) {
  const maxRetries = 5;
  const retryCount = message.headers["x-retry-count"] || 0;
  
  try {
    await processMessage(message);
    message.acknowledge();
  } catch (error) {
    if (retryCount >= maxRetries) {
      // Move to DLQ
      await dlq.send({
        originalMessage: message,
        error: error.message,
        failedAt: new Date(),
        retryCount: retryCount,
        queue: "notifications"
      });
      message.acknowledge();  // Remove from main queue
      alertOps("Message moved to DLQ: " + message.id);
    } else {
      // Retry with backoff
      const delay = Math.pow(2, retryCount) * 1000;  // 1s, 2s, 4s, 8s, 16s
      await retryQueue.send(message, { delay, headers: { "x-retry-count": retryCount + 1 }});
      message.acknowledge();
    }
  }
}

DLQ MESSAGE STRUCTURE:
{
  "originalMessage": {
    "type": "send_sms",
    "phone": "+91-INVALID",
    "message": "Order confirmed"
  },
  "error": "Twilio Error 21211: Invalid phone number",
  "failedAt": "2024-01-15T12:30:00Z",
  "retryCount": 5,
  "sourceQueue": "notifications",
  "stackTrace": "..."
}

WHAT HAPPENS TO DLQ MESSAGES:

1. ALERT: Team gets notified (Slack, PagerDuty)
2. INVESTIGATE: Engineer examines the message + error
3. FIX: Fix the bug or data issue
4. REPLAY: Move the message back to the main queue for reprocessing
5. DISCARD: If the message is truly unrecoverable, delete it with a record

DLQ DASHBOARD:
A good operations team monitors:
  — DLQ depth (how many failed messages?)
  — DLQ rate (messages per hour entering DLQ)
  — Top error types (what's failing most?)
  — Age of oldest DLQ message (how long have we been ignoring them?)

CATEGORIES OF DLQ MESSAGES:

1. BAD DATA: Invalid phone numbers, missing fields, corrupted JSON
   Fix: Clean the data, replay the message

2. BUG IN CONSUMER: Code doesn't handle an edge case
   Fix: Fix the code, deploy, replay all DLQ messages

3. DOWNSTREAM SERVICE DOWN: Payment provider outage
   Fix: Wait for recovery, replay messages

4. SCHEMA MISMATCH: Producer sent v2 format, consumer expects v1
   Fix: Update consumer, replay

5. TRULY UNRECOVERABLE: User deleted their account mid-processing
   Fix: Log it, discard the message

YOUR FOOD APP DLQs:
— dlq.notifications: Failed SMS/push notifications (bad phone numbers, provider outages)
— dlq.payments: Failed payment processing (expired cards, insufficient funds)
— dlq.restaurant-orders: Failed restaurant notifications (restaurant API down)
— dlq.analytics: Failed event logging (schema issues)

REAL SYSTEMS:
— AWS SQS: Built-in DLQ support (configure maxReceiveCount)
— RabbitMQ: Dead letter exchanges (DLX)
— Kafka: Custom DLQ topics (no built-in, but easy to implement)

THE RULE OF THUMB:
Every production message queue MUST have a DLQ. Without it, you're flying blind — messages silently fail and nobody knows.`,
    analogy: `🍕 The DLQ is like a restaurant's "problem orders" shelf. Order slip says "deliver to address that doesn't exist"? After 3 delivery attempts, the food goes to the problem shelf. A manager investigates: wrong address? Call the customer. Restaurant closed? Refund. Meanwhile, the rest of the kitchen keeps running smoothly — problem orders don't block everyone else.`
  },
  // ============ BIG PICTURE ============
  {
    id: 12, section: "bigpicture",
    phase: "CONNECTED",
    title: "The Full Picture — All Patterns Working Together",
    icon: "🗺️",
    color: "#9B59B6",
    concepts: ["WebSocket", "Pub/Sub", "Message Queue", "Webhook", "CDC", "SSE", "DLQ"],
    actors: ["Rahul", "API Gateway", "Order Service", "Kafka", "Notification Service", "Restaurant", "Razorpay", "Driver Amit"],
    simple: `Let's trace Rahul's COMPLETE order journey one more time — but now focusing on every communication pattern. Watch how synchronous calls, message queues, pub/sub, webhooks, WebSockets, and CDC all work together in a single user flow.`,
    detail: `THE COMPLETE COMMUNICATION MAP — Rahul orders Biryani:

━━━ PHASE 1: PLACING THE ORDER ━━━

Rahul taps "Place Order"
  ↓ [REST — synchronous]
API Gateway → Order Service
  ↓ [gRPC — synchronous, CRITICAL PATH]
Order Service → Payment Service: "Create payment for ₹640"
  ↓ [REST — synchronous, external]
Payment Service → Razorpay API: "Process UPI payment"
  ↓ 
Razorpay: Processing...

Order Service → Rahul: "Order placed! Payment processing..." (800ms)
  ↓ [ASYNC from here — Pub/Sub via Kafka]
Order Service PUBLISHES to Kafka topic "order.placed"

━━━ PHASE 2: EVENT FAN-OUT (Pub/Sub) ━━━

Kafka topic "order.placed" → FIVE subscribers consume:

  1. Notification Service:
     → Sends push notification via FCM (async)
     → If fails → retry 3x → Dead Letter Queue
     
  2. Restaurant Service:
     → Alerts restaurant's tablet (via WebSocket to restaurant app)
     → Restaurant sees new order instantly
     
  3. Analytics Service:
     → Logs order event to data warehouse
     → If fails? At-most-once is fine, no DLQ needed
     
  4. Recommendation Service:
     → Updates Rahul's food preferences model
     → Fully async, no user impact
     
  5. ETA Service:
     → Calculates estimated delivery time
     → Publishes to "order.eta_updated" topic

━━━ PHASE 3: PAYMENT CONFIRMATION (Webhook) ━━━

Rahul completes UPI on his phone.
Razorpay → [WEBHOOK] → Your server: "payment.captured"
  ↓ [sync] Verify webhook signature
  ↓ [sync] Update order status in DB: "paid"
  ↓ [CDC — Debezium watches order DB]
DB change captured → CDC publishes to Kafka "order.status_changed"
  ↓ [Pub/Sub fan-out]
  → Notification Service: "Payment successful!" (push notification)
  → Restaurant Service: "Start preparing!"

━━━ PHASE 4: REAL-TIME TRACKING (WebSocket) ━━━

Driver Amit accepts the delivery.
Rahul's app opens WebSocket: ws://api.foodapp.com/ws/track/456

Driver app sends location every 2 seconds:
  Driver → [REST/UDP] → Location Service
  Location Service → [Pub/Sub, at-most-once] → Kafka "driver.location"
  Kafka → Location Consumer → [WebSocket push] → Rahul's phone
  
  Rahul sees driver moving on the map in real-time!

Order status updates also flow via WebSocket:
  "PREPARING" → "READY" → "PICKED_UP" → "ON_THE_WAY" → "ARRIVING"

━━━ PHASE 5: DRIVER-CUSTOMER CALL (WebRTC) ━━━

Driver can't find the building.
  Amit taps "Call Customer"
  ↓ [WebSocket — signaling]
  App → Signaling Server → Rahul's phone: "Incoming call"
  ↓ [WebRTC — peer-to-peer]
  Amit ←— direct audio —→ Rahul
  "Which building is it?" "The one with the blue gate!"
  
  Call ends. WebRTC connection closed.

━━━ PHASE 6: DELIVERY COMPLETE ━━━

Amit marks "Delivered"
  ↓ [REST] Driver app → API → Order Service
  Order Service updates DB: status = "DELIVERED"
  ↓ [CDC] DB change → Kafka "order.status_changed"
  ↓ [Pub/Sub]
  → Notification Service (Message Queue): "Rate your experience!"
     → [SSE] if Rahul has web app open: live notification appears
     → [Push notification] if app is in background
  → Analytics: Order completed, delivery time logged
  → Billing Service: Calculate driver payout
     → If payout fails → retry → DLQ → ops investigates

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

COMMUNICATION PATTERN SUMMARY:

SYNCHRONOUS (immediate response needed):
  REST/gRPC → placing order, processing payment
  Used for: critical path, user is waiting

WEBHOOKS (server-to-server event notification):
  Razorpay → your server: "payment done"
  Used for: third-party integrations, event callbacks

WEBSOCKETS (persistent real-time bidirectional):
  Server ↔ Rahul's app: live tracking + status updates
  Used for: live UI updates, real-time tracking

SSE (one-way server push):
  Server → Web dashboard: live notification feed
  Used for: notification streams, admin dashboards

WEBRTC (peer-to-peer media):
  Driver ↔ Customer: voice call
  Used for: audio/video between users

MESSAGE QUEUES (reliable async task execution):
  Send SMS, send email, process image
  Used for: background tasks, one consumer per message

PUB/SUB (event fan-out to multiple services):
  "order.placed" → 5 different services react
  Used for: event-driven architecture, decoupling

CDC (database changes as events):
  DB update → automatic event → downstream sync
  Used for: keeping systems in sync, audit logs

DELIVERY SEMANTICS:
  Location updates → at-most-once (speed > reliability)
  Order notifications → at-least-once (don't lose orders!)
  Payment processing → exactly-once (idempotent consumers)

DLQ (handling failures):
  Every queue has a DLQ for messages that fail repeatedly
  Ops team monitors, fixes, replays

Every pattern exists because of a SPECIFIC need. No one pattern does everything. A real system weaves them all together.`,
    analogy: `🍕 THE COMPLETE RESTAURANT:

Synchronous = Customer orders at the counter, waits for receipt
Webhook = Supplier calls when ingredient delivery arrives  
WebSocket = Kitchen display showing live order status
SSE = Loudspeaker announcing "Order 456 ready!"
WebRTC = Manager video-calling the supplier about a problem
Message Queue = Order tickets on the kitchen rail (one chef per ticket)
Pub/Sub = Announcement "Table 5 is VIP" heard by waiter, chef, manager, sommelier
CDC = Security camera recording every kitchen action
DLQ = Problem order shelf for orders that can't be fulfilled
At-most-once = Background music level sensor (miss one reading? Fine)
At-least-once = Fire alarm (MUST go off, even if it double-rings)
Exactly-once = Cash register (charge the customer exactly once)

All running simultaneously. All invisible to the customer. All essential.`
  }
];

function ConceptTag({ label }) {
  return (
    <span style={{
      display: "inline-block", padding: "3px 10px", borderRadius: "100px",
      fontSize: "10.5px", fontWeight: 700, letterSpacing: "0.5px",
      background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.65)",
      border: "1px solid rgba(255,255,255,0.1)", marginRight: "5px", marginBottom: "4px",
      textTransform: "uppercase",
    }}>{label}</span>
  );
}

function ActorChain({ actors, color }) {
  return (
    <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "4px", marginTop: "10px", marginBottom: "6px" }}>
      {actors.map((actor, i) => (
        <span key={i} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <span style={{
            padding: "3px 9px", borderRadius: "6px", fontSize: "10.5px", fontWeight: 600,
            background: i === 0 ? color + "20" : "rgba(255,255,255,0.04)",
            color: i === 0 ? color : "rgba(255,255,255,0.55)",
            border: `1px solid ${i === 0 ? color + "40" : "rgba(255,255,255,0.07)"}`,
            whiteSpace: "nowrap",
          }}>{actor}</span>
          {i < actors.length - 1 && <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "11px" }}>→</span>}
        </span>
      ))}
    </div>
  );
}

function App() {
  const [activeStep, setActiveStep] = useState(0);
  const [showDetail, setShowDetail] = useState(false);
  const [showAnalogy, setShowAnalogy] = useState(false);
  const [activeSection, setActiveSection] = useState("realtime");
  const contentRef = useRef(null);

  const step = STEPS[activeStep];
  const sectionSteps = STEPS.filter(s => s.section === activeSection);
  const currentSection = SECTIONS.find(s => s.id === activeSection);

  useEffect(() => {
    setShowDetail(false);
    setShowAnalogy(false);
    if (contentRef.current) contentRef.current.scrollTop = 0;
  }, [activeStep]);

  useEffect(() => {
    const first = STEPS.findIndex(s => s.section === activeSection);
    if (first >= 0) setActiveStep(first);
  }, [activeSection]);

  const globalIndex = STEPS.indexOf(step);
  const canPrev = globalIndex > 0;
  const canNext = globalIndex < STEPS.length - 1;

  return (
    <div style={{
      minHeight: "100vh", background: "#0A0D12", color: "#E6EDF3",
      fontFamily: "'IBM Plex Sans', -apple-system, sans-serif",
      display: "flex", flexDirection: "column",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 10px; }
      `}</style>

      {/* Header */}
      <div style={{ padding: "14px 18px 10px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{
          fontSize: "10px", fontWeight: 700, textTransform: "uppercase",
          letterSpacing: "2px", color: "rgba(255,255,255,0.25)", marginBottom: "3px",
          fontFamily: "'IBM Plex Mono', monospace",
        }}>System Design Deep Dive — Part 4</div>
        <div style={{ fontSize: "17px", fontWeight: 800, color: "#fff", lineHeight: 1.3 }}>
          Communication Patterns
        </div>
        <div style={{ fontSize: "11.5px", color: "rgba(255,255,255,0.35)", marginTop: "3px" }}>
          Real-time, async, and everything in between — all in one food delivery order
        </div>
      </div>

      {/* Section Tabs */}
      <div style={{ padding: "8px 18px", borderBottom: "1px solid rgba(255,255,255,0.05)", overflowX: "auto" }}>
        <div style={{ display: "flex", gap: "4px", minWidth: "fit-content" }}>
          {SECTIONS.map(sec => (
            <button key={sec.id} onClick={() => setActiveSection(sec.id)} style={{
              display: "flex", alignItems: "center", gap: "5px",
              padding: "6px 11px", borderRadius: "7px",
              border: activeSection === sec.id ? `1.5px solid ${sec.color}50` : "1.5px solid transparent",
              background: activeSection === sec.id ? sec.color + "14" : "rgba(255,255,255,0.025)",
              color: activeSection === sec.id ? sec.color : "rgba(255,255,255,0.35)",
              cursor: "pointer", fontSize: "11px", fontWeight: activeSection === sec.id ? 700 : 500,
              fontFamily: "'IBM Plex Sans', sans-serif", whiteSpace: "nowrap",
            }}>
              <span style={{ fontSize: "12px" }}>{sec.icon}</span>
              <span>{sec.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Sub Tabs */}
      <div style={{ padding: "7px 18px", borderBottom: "1px solid rgba(255,255,255,0.04)", overflowX: "auto" }}>
        <div style={{ display: "flex", gap: "3px", minWidth: "fit-content" }}>
          {sectionSteps.map((s) => (
            <button key={s.id} onClick={() => setActiveStep(s.id)} style={{
              padding: "5px 9px", borderRadius: "6px",
              border: activeStep === s.id ? `1px solid ${s.color}40` : "1px solid transparent",
              background: activeStep === s.id ? s.color + "10" : "transparent",
              color: activeStep === s.id ? s.color : "rgba(255,255,255,0.3)",
              cursor: "pointer", fontSize: "10.5px", fontWeight: activeStep === s.id ? 700 : 500,
              fontFamily: "'IBM Plex Sans', sans-serif", whiteSpace: "nowrap",
            }}>
              {s.icon} {s.phase}
            </button>
          ))}
        </div>
      </div>

      {/* Progress */}
      <div style={{ height: "2px", background: "rgba(255,255,255,0.03)" }}>
        <div style={{
          height: "100%", width: `${((globalIndex + 1) / STEPS.length) * 100}%`,
          background: `linear-gradient(90deg, ${step.color}88, ${step.color})`,
          transition: "all 0.4s ease",
        }} />
      </div>

      {/* Content */}
      <div ref={contentRef} style={{ flex: 1, overflow: "auto", padding: "14px 18px 110px" }}>
        <div style={{ marginBottom: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "7px" }}>
            <span style={{
              fontSize: "9px", fontWeight: 800, color: currentSection.color,
              background: currentSection.color + "18", padding: "2px 7px", borderRadius: "4px",
              fontFamily: "'IBM Plex Mono', monospace", letterSpacing: "1px",
            }}>{currentSection.label.toUpperCase()}</span>
            <span style={{
              fontSize: "9px", fontWeight: 700, color: "rgba(255,255,255,0.25)",
              fontFamily: "'IBM Plex Mono', monospace",
            }}>{globalIndex + 1} / {STEPS.length}</span>
          </div>
          <h2 style={{ fontSize: "19px", fontWeight: 800, color: "#fff", lineHeight: 1.3, marginBottom: "7px" }}>
            {step.icon} {step.title}
          </h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "2px" }}>
            {step.concepts.map((c, i) => <ConceptTag key={i} label={c} />)}
          </div>
        </div>

        <div style={{
          fontSize: "9.5px", fontWeight: 700, textTransform: "uppercase",
          letterSpacing: "1px", color: "rgba(255,255,255,0.22)", marginBottom: "1px",
        }}>Who's involved</div>
        <ActorChain actors={step.actors} color={step.color} />

        <div style={{
          background: "rgba(255,255,255,0.025)", borderRadius: "11px", padding: "15px",
          border: "1px solid rgba(255,255,255,0.055)", marginTop: "12px",
          fontSize: "13.5px", lineHeight: 1.75, color: "rgba(255,255,255,0.78)",
        }}>{step.simple}</div>

        <button onClick={() => setShowDetail(!showDetail)} style={{
          display: "flex", alignItems: "center", gap: "7px", width: "100%",
          padding: "11px 15px", marginTop: "7px", borderRadius: "10px",
          border: `1px solid ${step.color}30`,
          background: showDetail ? step.color + "10" : "transparent",
          color: step.color, cursor: "pointer", fontSize: "12.5px", fontWeight: 700,
          fontFamily: "'IBM Plex Sans', sans-serif",
        }}>
          <span style={{ transform: showDetail ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s", fontSize: "13px" }}>▶</span>
          {showDetail ? "Hide" : "Show"} Technical Deep Dive
        </button>
        {showDetail && (
          <div style={{
            background: "rgba(0,0,0,0.3)", borderRadius: "10px", padding: "16px",
            border: `1px solid ${step.color}20`, marginTop: "3px",
            fontSize: "12px", lineHeight: 1.85, color: "rgba(255,255,255,0.7)",
            fontFamily: "'IBM Plex Mono', monospace", whiteSpace: "pre-wrap",
          }}>{step.detail}</div>
        )}

        <button onClick={() => setShowAnalogy(!showAnalogy)} style={{
          display: "flex", alignItems: "center", gap: "7px", width: "100%",
          padding: "11px 15px", marginTop: "5px", borderRadius: "10px",
          border: "1px solid rgba(255,255,255,0.08)",
          background: showAnalogy ? "rgba(255,255,255,0.04)" : "transparent",
          color: "rgba(255,255,255,0.6)", cursor: "pointer", fontSize: "12.5px", fontWeight: 700,
          fontFamily: "'IBM Plex Sans', sans-serif",
        }}>
          <span style={{ transform: showAnalogy ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s", fontSize: "13px" }}>▶</span>
          {showAnalogy ? "Hide" : "Show"} Real-World Analogy
        </button>
        {showAnalogy && (
          <div style={{
            background: "rgba(255,255,255,0.025)", borderRadius: "10px", padding: "15px",
            border: "1px solid rgba(255,255,255,0.07)", marginTop: "3px",
            fontSize: "13.5px", lineHeight: 1.75, color: "rgba(255,255,255,0.6)",
          }}>{step.analogy}</div>
        )}
      </div>

      {/* Navigation */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        padding: "10px 18px 16px",
        background: "linear-gradient(transparent, #0A0D12 30%)",
        display: "flex", gap: "8px",
      }}>
        <button onClick={() => { if (canPrev) { const p = STEPS[globalIndex - 1]; setActiveSection(p.section); setActiveStep(p.id); }}} disabled={!canPrev} style={{
          flex: 1, padding: "12px", borderRadius: "10px",
          border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)",
          color: canPrev ? "rgba(255,255,255,0.65)" : "rgba(255,255,255,0.18)",
          cursor: canPrev ? "pointer" : "default", fontSize: "13px", fontWeight: 700,
          fontFamily: "'IBM Plex Sans', sans-serif",
        }}>← Back</button>
        <button onClick={() => { if (canNext) { const n = STEPS[globalIndex + 1]; setActiveSection(n.section); setActiveStep(n.id); }}} disabled={!canNext} style={{
          flex: 2, padding: "12px", borderRadius: "10px", border: "none",
          background: canNext ? `linear-gradient(135deg, ${step.color}, ${step.color}99)` : "rgba(255,255,255,0.08)",
          color: canNext ? "#fff" : "rgba(255,255,255,0.25)",
          cursor: canNext ? "pointer" : "default", fontSize: "13px", fontWeight: 700,
          fontFamily: "'IBM Plex Sans', sans-serif",
        }}>{canNext ? "Next →" : "Communication patterns mastered!"}</button>
      </div>
    </div>
  );
}
