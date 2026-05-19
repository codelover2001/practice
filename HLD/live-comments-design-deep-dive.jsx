const { useState, useEffect, useRef } = React;

const SECTIONS = [
  { id: "intro", label: "What & Why", icon: "📺", color: "#E8B931" },
  { id: "write", label: "Write Path", icon: "✍️", color: "#4A90D9" },
  { id: "read", label: "Read Path", icon: "📡", color: "#50C878" },
  { id: "fanout", label: "Fanout at Scale", icon: "📢", color: "#E74C3C" },
  { id: "playback", label: "Playback", icon: "⏪", color: "#9B59B6" },
  { id: "bigpicture", label: "Full Picture", icon: "🗺️", color: "#1ABC9C" },
];

const STEPS = [
  // ============ INTRO ============
  {
    id: 0, section: "intro",
    phase: "WHAT IS IT",
    title: "Live Comments — The Hardest Fanout Problem",
    icon: "📺",
    color: "#E8B931",
    concepts: ["Live Comments", "Massive Fanout", "Low Latency"],
    actors: ["5M Viewers", "50K Commenters", "5K Comments/sec", "SSE Gateways"],
    simple: `India vs Australia cricket final. 5 million people watching the livestream. Virat Kohli hits a six. Instantly, thousands of comments flood in — "What a shot!!!", "GOAT 🐐", "SIX!!!" — and ALL 5 million viewers see these comments scrolling on their screen in under 500 milliseconds.

This is Live Comments. It looks like WhatsApp or Slack, but it's a fundamentally different beast. Here's why:

WhatsApp: User A sends to User B. Fanout = 1.
Slack #general: User A sends to 50 people. Fanout = 50.
Live Comments: User A sends to 5 MILLION people. Fanout = 5,000,000.

One comment → 5 million deliveries. 5,000 comments per second × 5 million viewers = 25 BILLION message deliveries per second. That's the core engineering challenge. Everything in this design exists to solve this impossible-sounding number.

The other key difference: this is READ-HEAVY and WRITE-LIGHT. Only ~1% of viewers actually comment (50K people). The other 4.95 million just watch comments scroll by. So the write path is simple; the read path (fanout) is where all the complexity lives.`,
    detail: `HOW LIVE COMMENTS DIFFER FROM CHAT:

                    WhatsApp        Slack           Live Comments
Fanout:             1               50-10K          5,000,000
Direction:          Bidirectional   Bidirectional   Mostly unidirectional
Writers:            Both users      Many users      1% of viewers
Readers:            Both users      Channel members ALL viewers
Ordering:           Strict          Strict per-ch   Approximate OK
Persistence:        Forever         Forever         For playback
Connection type:    WebSocket       WebSocket       SSE (read), HTTP (write)

KEY INSIGHT: Live comments is a BROADCAST problem, not a conversation problem.
In chat, both sides talk. In live comments, a few people talk and millions listen.

This changes everything about the architecture:
  — Connection protocol: SSE (one-way push) instead of WebSocket (two-way)
  — Fanout strategy: tiered architecture instead of direct delivery
  — Ordering: approximate is fine (strict ordering across 5M users is impossible)
  — Latency target: <500ms (vs <100ms for chat)
  — Batching: send 10-50 comments at once instead of one at a time

THE SCALE:

  5 million concurrent viewers (peak, during a World Cup final type event)
  50,000 active commenters (1% of viewers)
  5,000 comments per second incoming
  25 billion deliveries per second outgoing (theoretical)
  
  Storage: ~65 GB per day of comments
  Each SSE server handles ~50,000 connections
  Need 100+ SSE gateway servers just for connections

  This is smaller than WhatsApp (500M users) but the FANOUT PER MESSAGE is astronomically larger.

WHAT WE'RE BUILDING:
  1. Post comments during a live event (write path — simple)
  2. See other people's comments in real-time (read path — the hard part)
  3. Replay comments synchronized with recorded video (playback — clever)`,
    analogy: `🏟️ A stadium with 100,000 people. 1,000 people are shouting things. The other 99,000 are listening. But this isn't just one stadium — it's 50 stadiums across 10 cities, all watching the same match.

WhatsApp = two people having a phone call.
Slack = a conference call with 50 people.
Live Comments = a stadium announcer speaking to 5 million people simultaneously.

The announcer says one thing; 5 million people hear it. The engineering challenge: making that announcement reach every single person within half a second, no matter where they are in the world.`
  },
  {
    id: 1, section: "intro",
    phase: "SSE vs WEBSOCKET",
    title: "Why SSE Instead of WebSocket?",
    icon: "📡",
    color: "#4A90D9",
    concepts: ["SSE", "WebSocket", "Unidirectional", "EventSource"],
    actors: ["Server", "SSE Connection", "Client (read-only)"],
    simple: `In WhatsApp and Slack, we used WebSockets — full two-way connections where both client and server can send messages anytime. But for live comments, we make a different choice: SSE (Server-Sent Events) for the read path.

Why? Because 99% of users only READ comments. They don't write. The data flow is one-way: server → client. SSE is purpose-built for exactly this — a persistent one-way connection where the server pushes data to the client. Using WebSocket here would be like using a two-lane highway when all the traffic goes in one direction — you're wasting half the road.

For the 1% who DO write comments, we use plain old HTTP POST. No persistent connection needed — they send a comment, get a 202 Accepted, done.`,
    detail: `THE THREE OPTIONS:

━━━ HTTP POLLING (Bad for live comments) ━━━

Client every 500ms: "Any new comments?"
Server: "Yes, here are 3 new ones."
Client 500ms later: "Any new comments?"
Server: "No."
Client 500ms later: "Any new comments?"
Server: "Yes, 1 new one."

Problem: 5 million clients polling every 500ms = 10 MILLION requests per second just for checking. Most responses are empty ("no new comments"). Enormous waste of server resources.

━━━ WEBSOCKET (Good but overkill) ━━━

Client opens WebSocket → persistent two-way connection.
Server pushes comments as they arrive.
Client CAN also send through the same connection.

Works great. But:
  — WebSocket requires a protocol upgrade handshake (more complex)
  — Proxies and CDNs don't always handle WebSocket well
  — We're paying for bidirectional when we only need unidirectional
  — WebSocket connections are stateful and harder to load-balance
  — Each WebSocket uses more server memory than SSE

For CHAT (WhatsApp/Slack), WebSocket makes sense because BOTH sides send.
For LIVE COMMENTS, 99% of connections are read-only.

━━━ SSE — Server-Sent Events (Best for live comments) ━━━

Client opens standard HTTP GET request.
Server responds with Content-Type: text/event-stream.
Connection stays open. Server pushes data whenever it wants.
Client receives events via the browser's native EventSource API.

What the data looks like on the wire:

  event: new_comment
  data: {"user":"virat_fan","text":"What a six!!!","ts":1234567890}
  
  event: new_comment
  data: {"user":"cricket_lover","text":"GOAT performance","ts":1234567891}

That's it. Plain text. Each event separated by a blank line.

WHY SSE WINS FOR LIVE COMMENTS:

1. SIMPLICITY: Standard HTTP. No protocol upgrade. Works through every proxy, CDN, and firewall in existence. Load balancers treat it as a normal HTTP connection.

2. AUTO-RECONNECT: The browser's EventSource API automatically reconnects if the connection drops. Mobile user goes through a tunnel? Connection drops. Comes out? Browser reconnects automatically. You don't write any reconnection code.

3. LAST-EVENT-ID (cursor resume): When reconnecting, the browser sends Last-Event-ID header with the ID of the last event it received. The server can resume from exactly where the client left off. No missed comments.

  Server sends:
    id: 12345
    event: new_comment
    data: {"text":"Six!!!"}
    
    id: 12346
    event: new_comment
    data: {"text":"What a shot!"}

  Client disconnects after receiving 12346.
  Client reconnects, sends: Last-Event-ID: 12346
  Server resumes from 12347 onward.

4. LIGHTWEIGHT: Less memory per connection than WebSocket. When you have 5 million connections, every byte of overhead matters. SSE connections use ~50% less memory than equivalent WebSocket connections.

5. CDN-FRIENDLY: CDNs like Cloudflare can actually cache and distribute SSE streams. This is impossible with WebSocket. This becomes critical for geo-distribution.

THE SPLIT ARCHITECTURE:

  WRITE PATH: Plain HTTP POST → Comment Service
    (Only 50K users, 5K req/sec — easy)
  
  READ PATH: SSE stream from Connection Gateway
    (5 million connections — the hard part)

By splitting write and read into different protocols AND different server fleets, each can be optimized independently. The write servers are stateless HTTP servers (scale easily). The read servers are stateful SSE gateways (need careful connection management).

WHEN WOULD YOU USE WEBSOCKET INSTEAD?

If the feature evolved to include:
  — User reactions (likes, emojis) sent back to server in real-time
  — Typing indicators
  — Two-way chat during the stream
  
Then WebSocket becomes justified because you need bidirectional flow. But for pure "server broadcasts, clients listen," SSE is the right tool.`,
    analogy: `📻 SSE is like FM radio. The radio station broadcasts; your radio receives. You can't talk back through your radio. But that's fine — you're there to listen.

WebSocket is like a walkie-talkie. Both sides can talk at any time. Great for conversations. But for a stadium announcement? You don't need every listener to have a walkie-talkie. A simple radio receiver is cheaper, simpler, and does the job perfectly.

HTTP polling is like repeatedly calling the radio station to ask "Did you say anything new?" every half second. Annoying for both you and the station.

For live comments: 5 million radios tuned to one station. 50,000 people occasionally call in (HTTP POST) to say something. The station broadcasts those call-ins to all 5 million radios (SSE push). Simple, efficient, one-way.`
  },
  // ============ WRITE PATH ============
  {
    id: 2, section: "write",
    phase: "WRITE PATH",
    title: "Posting a Comment — The Simple Part",
    icon: "✍️",
    color: "#4A90D9",
    concepts: ["HTTP POST", "202 Accepted", "Async Persistence", "Message Broker"],
    actors: ["User", "API Gateway", "Comment Service", "Database", "Redis Pub/Sub"],
    simple: `When a user posts "What a six!!!" during the cricket match, the write path is refreshingly simple. It's just an HTTP POST that does three things: validate, publish to the message broker, persist to database. The user gets a 202 Accepted almost instantly — they don't wait for the comment to be broadcast to 5 million people.

The key insight: the response to the writer is DECOUPLED from the delivery to readers. "Your comment was accepted" happens in 50ms. "Your comment reached 5 million viewers" happens over the next 500ms via a completely separate system.`,
    detail: `THE WRITE FLOW — STEP BY STEP:

Step 1: USER SENDS COMMENT
  POST /v1/streams/stream-ipl-final/comments
  Headers: Authorization: Bearer <JWT>
  Body: {
    "text": "What a six!!!",
    "client_ts": 1234567890123
  }
  
  client_ts is the user's local timestamp. Useful for debugging latency but NOT used for ordering (clocks differ).

Step 2: API GATEWAY
  — TLS termination (decrypt HTTPS)
  — JWT validation (is this user authenticated?)
  — Rate limiting (max 1 comment per 2 seconds per user — prevents spam)
  — Route to Comment Service

Step 3: COMMENT SERVICE
  Validates:
    — Text length (max 280 chars? configurable)
    — Stream exists and is currently live
    — User isn't banned from this stream
  
  Assigns SERVER-SIDE timestamp:
    — This becomes the ordering key
    — Server's clock is the source of truth, not the client's
  
  Generates comment_id (UUID)

Step 4: TWO PARALLEL ACTIONS (this is key!)

  ACTION A — PUBLISH TO MESSAGE BROKER (fast, in-memory):
    Redis PUBLISH comments:stream-ipl-final {
      comment_id: "c-123",
      user_id: "virat_fan",
      username: "ViratFan99",
      text: "What a six!!!",
      timestamp: 1234567890456
    }
    
    This is the REAL-TIME path. The moment this publish happens, the SSE gateways subscribed to this topic receive it and start pushing to viewers. Takes <1ms.

  ACTION B — PERSIST TO DATABASE (slower, but durable):
    INSERT INTO comments (stream_id, timestamp, comment_id, user_id, username, comment_text)
    VALUES ('stream-ipl-final', NOW(), 'c-123', 'virat_fan', 'ViratFan99', 'What a six!!!');
    
    This is for PLAYBACK and DURABILITY. Happens asynchronously. Takes 5-50ms but the user doesn't wait for it.

Step 5: RETURN 202 ACCEPTED
  Response: { "comment_id": "c-123", "ts": 1234567890456, "status": "accepted" }
  
  Why 202 and not 200?
  — 200 means "request completed successfully"
  — 202 means "request ACCEPTED for processing"
  
  The comment has been received and published to the broker, but it hasn't been persisted to the database yet (that's happening async). 202 is semantically correct and tells the client "we got it, don't worry."

WHY PUBLISH BEFORE PERSIST?

In WhatsApp, we said "persist BEFORE delivering." Because if the message is lost, it's gone forever and one person misses a critical message.

In live comments, the priorities are different:
  — Speed matters more (sub-500ms delivery)
  — A single lost comment in a stream of thousands is acceptable
  — The broker publish is the time-critical path
  — Database write can happen async
  
So we publish to Redis first (fast, real-time) and persist to Cassandra second (slower, durable). If the DB write fails, we retry. If a rare comment is lost from the DB, the live viewers already saw it — only playback would miss it.

This is a conscious tradeoff: LATENCY over STRICT DURABILITY. Appropriate for live comments. NOT appropriate for banking transactions.

THE DATABASE — CASSANDRA:

Why Cassandra?
  — Write-heavy: 5,000 writes/sec sustained
  — Simple queries: "get comments for stream X sorted by time"
  — Horizontal scaling: add nodes for more capacity
  — Time-series friendly: clustering key on timestamp = sorted on disk

Schema:
  Partition key: stream_id (all comments for one stream on same nodes)
  Clustering key: timestamp (sorted chronologically within partition)

DENORMALIZATION — username in comments table:
  Notice we store username directly in the comments table, not just user_id. In a normalized design, you'd JOIN with a users table. But:
  — Cassandra doesn't support JOINs
  — Looking up username on every read adds latency
  — Username rarely changes
  — Storing it with the comment means one read = all data needed
  
  This is intentional denormalization. Trade storage for speed.

RATE LIMITING:
  Critical for live comments. Without it:
  — A bot could flood 1000 comments/second
  — A troll could spam the entire stream
  
  Token bucket per user: max 1 comment every 2 seconds.
  Implemented at the API Gateway level using Redis INCR + TTL.
  
  429 Too Many Requests returned if exceeded.`,
    analogy: `📝 Imagine a live cricket match at a stadium. You write a message on a piece of paper and hand it to the "Comment Booth" (API Gateway). 

The attendant (Comment Service) checks your ticket (auth), checks the paper isn't too long (validation), then does TWO things simultaneously:
  1. Hands a COPY to the announcer (Redis pub/sub) who immediately reads it over the PA system (real-time delivery to all viewers)
  2. Files the ORIGINAL in a cabinet (Cassandra) for the replay later

You get a thumbs up (202 Accepted) before the announcer even starts reading. Your job is done. The delivery to 5 million listeners is someone else's problem.

The filing cabinet (database) is for the TV replay crew who will sync comments with the recorded footage later.`
  },
  // ============ READ PATH ============
  {
    id: 3, section: "read",
    phase: "READ PATH",
    title: "Receiving Comments — The Hard Part",
    icon: "📡",
    color: "#50C878",
    concepts: ["Connection Gateway", "SSE Servers", "Redis Subscribe", "Fan-out"],
    actors: ["Redis Pub/Sub", "Connection Gateway (SSE)", "5M Viewers"],
    simple: `The write path publishes a comment to Redis. Now what? 5 million viewers need to see it within 500ms. This is the read path — the hardest part of the entire system.

The key component is the CONNECTION GATEWAY — a fleet of servers whose ONLY job is holding open SSE connections with viewers and pushing comments to them. They don't do validation, don't write to databases, don't process anything. They just listen to Redis and push to connected clients. This extreme specialization is what makes them fast.`,
    detail: `THE CONNECTION GATEWAY ARCHITECTURE:

Each Connection Gateway server:
  — Maintains ~50,000 persistent SSE connections
  — Subscribes to Redis pub/sub topics for the streams its users are watching
  — When a message arrives from Redis, pushes to all relevant connected clients

For 5 million viewers: 5,000,000 / 50,000 = 100 gateway servers minimum.
With redundancy: ~150-200 gateway servers.

DYNAMIC SUBSCRIPTION — only subscribe to what you need:

Each gateway maintains a local map:
  {
    "stream-ipl-final": [user_1_conn, user_2_conn, ..., user_35000_conn],
    "stream-music-fest": [user_35001_conn, ..., user_42000_conn]
  }

When the FIRST user watching "stream-ipl-final" connects to Gateway-7:
  → Gateway-7 subscribes to Redis topic: comments:stream-ipl-final

When the LAST user watching "stream-ipl-final" disconnects from Gateway-7:
  → Gateway-7 unsubscribes from that topic

This means gateways ONLY receive messages for streams they have active viewers for. A gateway with zero IPL viewers doesn't receive any IPL comments. Zero wasted work.

THE READ FLOW — STEP BY STEP:

Step 1: VIEWER CONNECTS
  User opens the livestream page.
  Browser creates EventSource:
    const source = new EventSource('/v1/streams/stream-ipl-final/comments/subscribe');
  
  This HTTP GET request arrives at the load balancer, which routes to a Gateway server.
  Gateway opens the SSE stream (Content-Type: text/event-stream).
  Gateway adds this connection to its local subscriber list for stream-ipl-final.
  If this is the first subscriber for this stream on this gateway, subscribe to Redis topic.

Step 2: COMMENT ARRIVES AT REDIS
  Comment Service publishes to Redis: comments:stream-ipl-final
  Redis delivers to all subscribed gateways. Let's say 100 gateways are subscribed.

Step 3: GATEWAY RECEIVES FROM REDIS
  Gateway-7 receives the comment from Redis.
  Looks up local subscribers for stream-ipl-final: 35,000 connections.
  
  For each connection, writes the SSE event:
    event: new_comment
    data: {"user":"ViratFan99","text":"What a six!!!","ts":1234567890}
    
  35,000 writes in a tight loop. This is I/O-bound (writing to network sockets), not CPU-bound. Well-tuned servers handle this in milliseconds using epoll/kqueue (non-blocking I/O).

Step 4: CLIENT RECEIVES
  Browser's EventSource fires the 'new_comment' event.
  JavaScript handler receives the data, parses JSON, renders in UI.
  User sees "ViratFan99: What a six!!!" appear on screen.

TOTAL LATENCY BREAKDOWN:
  Writer → API Gateway → Comment Service → Redis PUBLISH: ~10ms
  Redis → Gateway servers: ~1-5ms
  Gateway → Client browsers: ~5-50ms (depends on network)
  Client parsing + rendering: ~5ms
  TOTAL: ~20-70ms for same-region viewers
  
  Well under the 500ms target!

HANDLING RECONNECTION:

Mobile user enters subway. SSE connection drops.
After 30 seconds, exits subway. Browser's EventSource auto-reconnects.
Sends header: Last-Event-ID: 12345

Gateway handles:
  IF Last-Event-ID present:
    Fetch comments from database where id > 12345 for this stream
    Send missed comments first
    Then resume real-time stream
  ELSE:
    Send last 50 comments as initial batch
    Then real-time stream

This catch-up mechanism uses the DATABASE (not Redis, which doesn't retain messages). This is why we persist to Cassandra — it's the safety net for reconnecting clients and playback.

CONNECTION HEALTH:

Gateways send periodic "heartbeat" events to keep the connection alive:
  event: heartbeat
  data: {}

If the client doesn't receive a heartbeat within 30 seconds:
  — Assume connection is dead
  — EventSource triggers auto-reconnect

SSE OVER HTTP/2:

HTTP/2 multiplexes multiple streams over a single TCP connection. This means:
  — Multiple SSE connections from the same client share one TCP connection
  — Less overhead, fewer file descriptors, better battery on mobile
  — Most modern browsers and servers support this automatically

This is another advantage of SSE over WebSocket — SSE naturally benefits from HTTP/2 improvements.`,
    analogy: `📻 Imagine 100 radio transmitter towers across the country, each serving 50,000 listeners. The radio station (Redis pub/sub) broadcasts once. Each tower picks up the signal and retransmits to its local listeners.

When a new listener tunes in, the tower adds them to its frequency. When they tune out, the tower removes them. If NO listener in Mumbai is tuned to Channel 5, the Mumbai tower doesn't even receive Channel 5's broadcast — saves resources.

If someone loses signal (enters a tunnel), when they re-tune, the tower replays what they missed from a recorded tape (database catch-up). Then seamlessly resumes live broadcast.

100 towers × 50,000 listeners each = 5 million total listeners. One broadcast from the station reaches everyone within milliseconds. That's the Connection Gateway architecture.`
  },
  // ============ FANOUT ============
  {
    id: 4, section: "fanout",
    phase: "SCALING FANOUT",
    title: "When Redis Isn't Enough — Tiered Fanout",
    icon: "📢",
    color: "#E74C3C",
    concepts: ["Geo-Distribution", "Regional Redis", "Tiered Fanout", "Message Batching"],
    actors: ["Kafka (global)", "Regional Aggregators", "Regional Redis", "Local Gateways"],
    simple: `Our basic architecture works: Redis pub/sub → 100 gateways → 5M users. But what about the BIGGEST events? World Cup final with 50 million viewers? Or viewers scattered across 6 continents?

Two problems emerge:
1. A single Redis instance can't handle 500+ gateway subscribers efficiently
2. A gateway in Mumbai receiving messages from a Redis in Virginia adds 200ms of latency

The solution: TIERED FANOUT with geo-distribution. Instead of one Redis broadcasting to all gateways globally, we create a hierarchy: central Kafka → regional aggregators → regional Redis → local gateways. Each layer amplifies the signal closer to the end users.`,
    detail: `PROBLEM 1: SINGLE REDIS BOTTLENECK

At extreme scale (50M+ viewers), we might have 1000 gateway servers. Redis pub/sub delivering to 1000 subscribers per message means:
  — 5000 comments/sec × 1000 subscribers = 5,000,000 Redis deliveries/sec
  — Redis can handle this, but we're pushing limits
  — Any Redis issue = total outage for all viewers

PROBLEM 2: GEOGRAPHIC LATENCY

Viewer in Mumbai. Redis in Virginia. Round trip: ~200ms.
Even at the speed of light, you can't beat physics.
If all gateways connect to one Redis, distant regions always have high latency.

SOLUTION: TIERED FANOUT ARCHITECTURE

Layer 1 — CENTRAL BUS (Kafka):
  Comment Service publishes to Kafka (durable, replicated, reliable).
  Kafka is the global source of truth.
  One write, globally durable.

Layer 2 — REGIONAL AGGREGATORS:
  In each region (Mumbai, Singapore, Frankfurt, Virginia, São Paulo):
  A small fleet of Aggregator services subscribe to Kafka.
  They consume new comments and re-publish to the REGIONAL Redis.

Layer 3 — REGIONAL REDIS:
  Each region has its own Redis instance.
  The regional Redis receives comments from the local aggregator.
  Local gateways subscribe to the LOCAL Redis (same datacenter, <1ms latency).

Layer 4 — LOCAL GATEWAYS:
  SSE gateways in Mumbai subscribe to Mumbai Redis.
  SSE gateways in Frankfurt subscribe to Frankfurt Redis.
  Final push to viewers: <5ms within the same region.

THE FLOW:

User in India posts "WHAT A SIX!!!"
  → Comment Service (Virginia) publishes to Kafka
  → Kafka replicates to all regions
  → Mumbai Aggregator picks up from Kafka → publishes to Mumbai Redis
  → Singapore Aggregator → Singapore Redis
  → Frankfurt Aggregator → Frankfurt Redis
  → Mumbai gateways receive from Mumbai Redis → push to Indian viewers
  → Frankfurt gateways receive from Frankfurt Redis → push to European viewers

Total latency for Indian viewer (comment from India):
  Post → Virginia Kafka: ~100ms
  Kafka → Mumbai Aggregator: ~100ms
  Aggregator → Mumbai Redis: ~1ms
  Redis → Mumbai Gateway: ~1ms
  Gateway → Indian viewer: ~5ms
  TOTAL: ~210ms ✅ (under 500ms target)

Total latency for European viewer (comment from India):
  Post → Virginia Kafka: ~100ms
  Kafka → Frankfurt Aggregator: ~80ms
  Aggregator → Frankfurt Redis: ~1ms
  Redis → Frankfurt Gateway: ~1ms
  Gateway → European viewer: ~10ms
  TOTAL: ~195ms ✅

Without geo-distribution:
  Indian viewer → Virginia Redis → Virginia Gateway? NO!
  Indian viewer connects to Mumbai Gateway → Mumbai Gateway subscribes to Virginia Redis: ~200ms per message delivery. Plus the initial post latency. Could exceed 500ms.

WHY KAFKA FOR THE GLOBAL BUS?

Redis pub/sub is fire-and-forget. If a regional aggregator is temporarily down, messages are LOST.

Kafka is durable. Messages persist for hours/days. If the Mumbai aggregator crashes for 30 seconds, when it restarts it reads from where it left off. No missed comments.

For the GLOBAL bus connecting regions: durability matters (don't lose comments crossing regions).
For the REGIONAL fanout to gateways: speed matters (Redis pub/sub is fine, losing one comment is acceptable).

━━━ MESSAGE BATCHING (the last mile optimization) ━━━

During peak moments (Kohli hits a six), 200 comments arrive per second. Sending each as a separate SSE event:
  — 200 TCP writes per second per connection
  — 200 browser wake-ups per second per client
  — Client UI tries to render 200 times per second → "render thrashing"
  — Mobile battery drains rapidly

SOLUTION: Gateway BATCHES comments.

Instead of sending each comment immediately:
  Gateway buffers comments for 100-200ms.
  Every 100ms, bundles all accumulated comments into ONE SSE event:
  
  event: comment_batch
  data: [
    {"user":"fan1","text":"SIX!!!","ts":100},
    {"user":"fan2","text":"WHAT A SHOT","ts":101},
    {"user":"fan3","text":"GOAT 🐐","ts":102},
    {"user":"fan4","text":"Incredible!!!","ts":103}
  ]

Instead of 200 events/second: ~10 batched events/second.
Each batch contains ~20 comments.

Client receives batch → renders all 20 at once with smooth animation.
Much better UX: comments appear in groups (like a real chat scrolling).
Much less network overhead: 1 TCP frame instead of 20.
Much better battery: browser wakes up 10 times/sec instead of 200.

THE TRADEOFF: Added 100-200ms latency. But:
  — 200ms is imperceptible to humans
  — Comments already have ~200ms of pipeline latency
  — Total latency goes from ~200ms to ~350ms — still well under 500ms target

This is a classic engineering trade: tiny latency increase for massive efficiency gain.

━━━ ADAPTIVE BATCHING ━━━

Not every moment has 200 comments/sec. During quiet moments (ad break), maybe 5 comments/sec. Batching with a 200ms window would mean each batch has ~1 comment. Unnecessary delay.

Smart gateways adapt:
  IF comments_in_buffer > 10: flush immediately (don't wait for timeout)
  IF buffer_age > 200ms: flush regardless of count
  IF comments_rate < 10/sec: reduce buffer window to 50ms

This ensures:
  — High activity: efficient batching (10-50 comments per batch)
  — Low activity: minimal latency (comments sent almost immediately)`,
    analogy: `🏟️ Imagine broadcasting a cricket match commentary across India.

Without tiered fanout: one announcer in Delhi shouts into a megaphone. People in Mumbai (1400km away) hear it late and faintly.

With tiered fanout: the Delhi announcer speaks into a microphone (Kafka). The signal goes to regional relay stations in Mumbai, Chennai, Kolkata (regional aggregators). Each station broadcasts to local PA systems (regional Redis). Each PA system serves nearby neighborhoods (gateways → viewers).

Message batching: instead of announcing every run individually ("ONE run! TWO runs! FOUR! SIX!"), the announcer groups: "Excellent over — 1, 2, 4, 6! Fifteen runs!" Same information, less noise, easier to process.

The crowd hears everything with minimal delay, regardless of where they're sitting across the country.`
  },
  // ============ PLAYBACK ============
  {
    id: 5, section: "playback",
    phase: "PLAYBACK",
    title: "Replaying Comments with Recorded Video",
    icon: "⏪",
    color: "#9B59B6",
    concepts: ["Playback Sync", "Paginated Chunks", "Client-Side Timer", "Seek Handling"],
    actors: ["Video Player", "Comment Buffer", "Chunked API", "Client Sync Loop"],
    simple: `The match is over. A user missed it and wants to watch the recording with the original live comments — seeing "WHAT A SIX!!!" appear at the exact moment Kohli hit the six, just like they would have during the live broadcast.

This is PLAYBACK — replaying comments synchronized with recorded video. The challenge: an hour-long stream might have 100,000+ comments. You can't download them all at once (too much data, too slow). And when the user seeks to the 45-minute mark, comments from the 10-minute mark are useless.

The solution: CHUNKED FETCHING + CLIENT-SIDE SYNC. Fetch comments in small time windows (3-5 minutes worth at a time) and display them in sync with the video player's clock.`,
    detail: `WHY NOT FETCH ALL COMMENTS AT ONCE?

A 2-hour cricket match with 5000 comments/sec = ~36 million comments.
Each comment ~150 bytes = ~5.4 GB of data.

Even for a 1-hour stream with lower activity (1000 comments/sec):
  3.6 million comments × 150 bytes = ~540 MB

Loading 540 MB before the video starts? User waits minutes. Unacceptable.
And if they only watch 5 minutes? 535 MB wasted.

━━━ THE CHUNKED FETCH API ━━━

Endpoint: GET /v1/streams/{stream_id}/comments

Query Parameters:
  start_time: offset in seconds from stream start (e.g., 900 = 15 min mark)
  duration: how many seconds of comments to fetch (e.g., 180 = 3 minutes)
  limit: max comments per response (e.g., 500)
  pagination_token: for getting next page if > limit comments in the window

Example:
  GET /v1/streams/ipl-final/comments?start_time=900&duration=180

  Returns: all comments between 15:00 and 18:00 of the stream.

Response:
  {
    "comments": [
      {"id":"c-1","user":"fan1","text":"Great over!","offset_sec":901.2},
      {"id":"c-2","user":"fan2","text":"SIX!!!","offset_sec":932.5},
      ...
    ],
    "has_more": false,
    "next_token": null
  }

The offset_sec field is key — it's the comment's timestamp relative to the stream's start time. This makes synchronization with the video player straightforward.

WHY THIS IS FAST:

Remember our Cassandra schema?
  Partition key: stream_id
  Clustering key: timestamp

The query "comments for stream X between time A and time B" is a RANGE SCAN on the clustering key. Cassandra returns these in order, from disk, without sorting. Blazing fast even with millions of total comments.

━━━ CLIENT-SIDE SYNCHRONIZATION ━━━

The client (browser/app) runs a SYNC LOOP:

Step 1: INITIAL LOAD
  Video starts at 0:00.
  Client fetches first chunk: GET ...?start_time=0&duration=180
  Comments for 0:00 to 3:00 loaded into an in-memory BUFFER.

Step 2: THE RENDER LOOP (runs every 100ms)
  
  Every 100ms:
    currentTime = videoPlayer.currentTime  // e.g., 32.5 seconds
    
    while (buffer.peek().offset_sec <= currentTime):
      comment = buffer.dequeue()
      renderComment(comment)  // show on screen with animation
    
  This loop checks: "are there any buffered comments whose time has come?" If yes, render them. If no, do nothing. Simple.

Step 3: PROACTIVE PREFETCHING
  When currentTime approaches the end of the current chunk:
    e.g., current chunk covers 0:00-3:00, currentTime = 2:30
    → Fetch next chunk: GET ...?start_time=180&duration=180
    → Comments for 3:00-6:00 loaded into buffer
  
  By the time the video reaches 3:00, comments are already buffered. No stutter.

━━━ HANDLING USER INTERACTIONS ━━━

PAUSE:
  Video pauses at 15:32.
  Sync loop checks: currentTime = 15.32 (not changing).
  No new comments pass the threshold. Loop does nothing.
  Resume → currentTime starts increasing → comments resume appearing.

SEEK FORWARD (user jumps from 10:00 to 45:00):
  1. DISCARD entire buffer (10:00-13:00 comments are useless now)
  2. Fetch new chunk: GET ...?start_time=2700&duration=180
  3. Populate buffer with 45:00-48:00 comments
  4. Sync loop resumes with new buffer
  
  There might be a brief moment (200-500ms) where no comments show while the fetch completes. UI shows a loading indicator. Acceptable UX.

SEEK BACKWARD (user jumps from 45:00 to 10:00):
  Same process. Discard buffer, fetch new chunk for 10:00-13:00.

PLAYBACK SPEED (1.5x, 2x):
  The video player's currentTime advances faster.
  The sync loop doesn't need any changes — it just checks currentTime.
  At 2x speed, comments appear twice as fast. Natural behavior.

━━━ THE OFFSET_SEC CALCULATION ━━━

When storing comments during the live event:
  stream_start_time = 1234560000 (Unix timestamp when stream went live)
  comment_timestamp = 1234560932 (when comment was posted)
  offset_sec = 1234560932 - 1234560000 = 932.0 seconds = 15 min 32 sec

This offset is computed when storing the comment (or at query time). It tells the playback client: "show this comment when the video reaches 15:32."

━━━ ADAPTIVE CHUNK SIZE ━━━

Not all parts of a stream have equal comment density. The moment Kohli hits a six might have 500 comments/second. The drinks break might have 2 comments/second.

Smart chunking:
  IF chunk has > 1000 comments: use smaller duration next time (60s instead of 180s)
  IF chunk has < 50 comments: use larger duration (300s instead of 180s)

This keeps each API response reasonably sized regardless of activity spikes.

━━━ CACHING PLAYBACK RESPONSES ━━━

Once a stream is over, the comments don't change. The API responses for playback are IMMUTABLE.

This means they're perfect for CDN caching:
  GET /v1/streams/ipl-final/comments?start_time=900&duration=180
  → CDN caches this response forever
  → Second viewer requesting the same window gets it from CDN, not from Cassandra
  
  This dramatically reduces database load for popular replays.`,
    analogy: `📼 Imagine re-watching a cricket match recording with a friend who has the original live chat logs printed on paper, page by page.

You don't hand them the entire 500-page printout at once (too much paper, most goes unread). Instead, you have a bookmark system:
  — At the 15-minute mark, hand them pages 47-62 (comments from 15:00-18:00)
  — When they're nearing page 62, proactively prepare pages 63-78
  — If they fast-forward to the 45-minute mark, throw away the current pages and grab pages 201-216
  — If they pause, just stop turning pages; when they resume, continue from where you stopped

The video player's clock is the "when to turn the next page" signal. The chunked API is the "page delivery system." The client buffer is the "stack of prepared pages on the coffee table."

Simple concept, elegant execution. Works for 100 comments or 36 million.`
  },
  // ============ BIG PICTURE ============
  {
    id: 6, section: "bigpicture",
    phase: "FULL PICTURE",
    title: "Everything Connected — IPL Final Night",
    icon: "🗺️",
    color: "#1ABC9C",
    concepts: ["Complete Architecture", "Write + Read Paths", "Tiered Fanout", "Playback"],
    actors: ["50M Viewers", "Comment Service", "Kafka", "Regional Redis", "SSE Gateways"],
    simple: `Let's trace one complete journey through the entire system — from a fan posting a comment during the IPL final to 50 million viewers seeing it, and then a friend replaying it the next day.`,
    detail: `THE COMPLETE ARCHITECTURE:

EDGE LAYER:
  — CDN / Load Balancer (routes to nearest region)
  — API Gateway (auth, rate limiting)

WRITE PATH:
  — Comment Service fleet (stateless, HTTP, validates + publishes)
  — Kafka (global durable bus)
  — Cassandra (persistent storage)

DISTRIBUTION LAYER:
  — Regional Aggregators (Kafka → regional Redis)
  — Regional Redis instances (Mumbai, Singapore, Frankfurt, Virginia, São Paulo)

READ PATH:
  — Connection Gateway fleet (SSE servers, 50K connections each)
  — 1000+ gateway servers across 5+ regions

PLAYBACK PATH:
  — Cassandra (source of truth for historical comments)
  — CDN (caches immutable playback responses)
  — Chunked REST API

━━━ SCENARIO: IPL FINAL, LAST OVER ━━━

8:45 PM IST. Kohli faces the last ball. 50 million viewers watching globally.
Comment rate: 10,000 comments/second during this moment.

PHASE 1: RAHUL POSTS A COMMENT (Mumbai, India)

  Rahul types "COME ON VIRAT!!!" and hits send.
  
  1. Phone sends POST to API Gateway (Mumbai region)
  2. API Gateway validates JWT, checks rate limit (Rahul's last comment was 3 sec ago → OK)
  3. Routes to Comment Service instance in Mumbai
  4. Comment Service:
     — Validates text length ✅
     — Assigns server timestamp: 1234567890.456
     — Assigns comment_id: c-789
  5. PARALLEL:
     a) PUBLISH to Kafka topic "comments:ipl-final"
     b) INSERT to Cassandra (async)
  6. Returns 202 Accepted to Rahul's phone in ~30ms
  
  Rahul sees his comment appear on HIS screen immediately (optimistic UI — client adds it locally before server confirms).

PHASE 2: DISTRIBUTION TO 50 MILLION VIEWERS

  Kafka receives Rahul's comment.
  
  Mumbai region:
    Mumbai Aggregator reads from Kafka → publishes to Mumbai Redis
    Mumbai Redis → 300 Mumbai gateways receive it
    300 gateways × 50K connections = 15M Indian viewers see it in ~50ms
  
  Singapore region:
    Singapore Aggregator → Singapore Redis → 100 gateways
    5M Southeast Asian viewers see it in ~150ms
  
  Frankfurt region:
    Frankfurt Aggregator → Frankfurt Redis → 80 gateways
    4M European viewers see it in ~200ms
  
  Virginia region:
    Virginia Aggregator → Virginia Redis → 120 gateways
    6M American viewers see it in ~250ms
  
  São Paulo region:
    São Paulo Aggregator → São Paulo Redis → 50 gateways
    2M South American viewers see it in ~300ms

  Total: 50 million viewers saw "COME ON VIRAT!!!" within 300ms.

PHASE 3: BATCHING IN ACTION

  During this over, 10,000 comments/sec are flowing.
  
  Each gateway batches:
    Every 100ms, bundle ~100 comments into one SSE event.
    Push batch to 50K connections.
    
  Client receives batch of 100 comments → renders with smooth scroll animation.
  New batch 100ms later → another 100 comments scroll in.
  
  Viewer sees a rapid, exciting stream of comments — feels live, not choppy.

PHASE 4: KOHLI HITS A SIX — PEAK MOMENT

  Comment rate spikes to 50,000 comments/sec for 5 seconds.
  
  Rate limiting prevents individual spam (max 1 comment/2 sec/user).
  But 50K users all commenting at once is legitimate traffic.
  
  Kafka handles the spike (designed for millions/sec).
  Aggregators briefly lag but catch up within 1-2 seconds.
  Gateways batch larger batches (200+ comments per batch).
  
  Viewers experience: a FLOOD of "SIX!!!", "GOAT 🐐", "INDIA WINS!!!" — 
  exactly the excitement of a live event.
  
  Comment rate drops back to 5000/sec within 10 seconds.
  System returns to normal operation.

PHASE 5: STREAM ENDS — COMMENTS ARCHIVED

  Stream status changes to "ended."
  Gateways send final SSE event: { event: "stream_ended" }
  Clients close SSE connections.
  
  All comments are safely in Cassandra.
  Playback API is immediately available.
  CDN starts caching popular playback chunks.

PHASE 6: NEXT DAY — PRIYA WATCHES THE REPLAY

  Priya opens the app. Sees "IPL Final Replay."
  Starts watching at the beginning.
  
  1. Video player loads. Starts at 0:00.
  2. Client fetches: GET /comments?start_time=0&duration=180
     → CDN cache HIT (someone else already fetched this chunk)
     → Returns 500 comments for 0:00-3:00 in ~20ms
  3. Comments appear in sync with the video.
  
  At 2:30 in the video:
  4. Client prefetches: GET /comments?start_time=180&duration=180
     → CDN cache HIT → returns comments for 3:00-6:00
  
  Priya fast-forwards to the last over (time = 2:45:00):
  5. Client discards buffer, fetches: GET /comments?start_time=9900&duration=180
     → CDN cache HIT → comments for last 3 minutes
  6. Priya sees the exact same flood of "SIX!!!" and "INDIA WINS!!!" 
     that viewers saw live, perfectly synchronized with Kohli's six in the video.

━━━ THE TECHNOLOGY STACK ━━━

  Write path: HTTP/REST → Comment Service → Kafka + Cassandra
  Distribution: Kafka → Regional Aggregators → Regional Redis Pub/Sub
  Read path: SSE from Connection Gateways
  Playback: REST API backed by Cassandra, cached by CDN
  
  Auth: JWT tokens, validated at API Gateway
  Rate limiting: Redis token bucket at API Gateway
  Monitoring: Prometheus metrics on every gateway
  
  Latency targets:
    Write acknowledgment: <50ms
    Live comment delivery (same region): <200ms
    Live comment delivery (cross-region): <500ms
    Playback chunk fetch: <100ms (CDN hit)

━━━ KEY DESIGN DECISIONS ━━━

  SSE over WebSocket → simpler, CDN-friendly, sufficient for unidirectional push
  Redis pub/sub over Kafka for regional fanout → lower latency, fire-and-forget acceptable
  Kafka for global bus → durability across regions, handles spikes
  Cassandra over PostgreSQL → write-heavy, time-series, horizontal scaling
  Publish before persist → latency over strict durability (appropriate for comments)
  Tiered fanout → handles any scale, geo-distributed
  Message batching → efficiency vs imperceptible latency increase
  Chunked playback → "just-in-time" loading, CDN-cacheable, handles seeks

━━━ COMPARISON WITH WHATSAPP AND SLACK ━━━

                    WhatsApp          Slack              Live Comments
Connection:         WebSocket         WebSocket          SSE (read) + HTTP (write)
Fanout:             1 (DM) / 500 (grp) 50-10K (channel)  5,000,000+ (stream)
Ordering:           Strict            Strict per-ch      Approximate
Persistence:        Always first      Always first       Publish first (speed)
Offline handling:   Per-user queue    last_read_ts       Playback API (later)
Message broker:     Kafka (queuing)   Redis pub/sub      Kafka (global) + Redis (regional)
Search:             Basic             Elasticsearch      Not needed (ephemeral)
Multi-tenancy:      No (global)       Yes (workspaces)   Per-stream isolation
Batching:           No                No                 Yes (100-200ms windows)

Each system optimizes for its unique constraint:
  WhatsApp → reliability (messages never lost, delivered to specific people)
  Slack → organization (channels, threads, search, workspace isolation)  
  Live Comments → scale of fanout (millions of simultaneous recipients)

The same distributed systems fundamentals (pub/sub, sharding, caching, async processing) appear in all three, but applied differently based on the core challenge.`,
    analogy: `🏟️ The complete picture is like broadcasting a World Cup final:

The commentator booth (Comment Service) receives messages from the crowd.
The production truck (Kafka) records everything and sends signals to satellite uplinks.
Satellites (Regional Aggregators) beam the signal to regional relay towers.
Regional towers (Regional Redis) broadcast to local antenna arrays.
Local antennas (SSE Gateways) deliver to individual TVs and radios (viewers).
Message batching: instead of transmitting each shout individually, the production truck bundles 5 seconds of crowd noise into smooth audio chunks.

For the replay: the master tape (Cassandra) stores everything. The DVD release (Playback API) lets you watch with original crowd reactions, chapter by chapter (chunked), skipping to your favorite moments (seek). Popular moments are pre-loaded on streaming servers (CDN cache).

One shout from the crowd → heard by 50 million people worldwide within 300ms. That's the engineering of live comments at scale.`
  }
];

// ====== UI COMPONENTS ======
function Tag({ label }) {
  return <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: "100px", fontSize: "10.5px", fontWeight: 700, letterSpacing: ".5px", background: "rgba(255,255,255,.07)", color: "rgba(255,255,255,.65)", border: "1px solid rgba(255,255,255,.1)", marginRight: 5, marginBottom: 4, textTransform: "uppercase" }}>{label}</span>;
}

function Chain({ actors, color }) {
  if (!actors?.length) return null;
  return <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 4, marginTop: 10, marginBottom: 6 }}>{actors.map((a, i) => <span key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ padding: "3px 9px", borderRadius: 6, fontSize: "10.5px", fontWeight: 600, background: i === 0 ? color + "20" : "rgba(255,255,255,.04)", color: i === 0 ? color : "rgba(255,255,255,.55)", border: `1px solid ${i === 0 ? color + "40" : "rgba(255,255,255,.07)"}`, whiteSpace: "nowrap" }}>{a}</span>{i < actors.length - 1 && <span style={{ color: "rgba(255,255,255,.2)", fontSize: 11 }}>→</span>}</span>)}</div>;
}

function App() {
  const [activeStep, setActiveStep] = useState(0);
  const [showDetail, setShowDetail] = useState(false);
  const [showAnalogy, setShowAnalogy] = useState(false);
  const [activeSection, setActiveSection] = useState("intro");
  const contentRef = useRef(null);

  const step = STEPS[activeStep];
  const sectionSteps = STEPS.filter(s => s.section === activeSection);
  const curSec = SECTIONS.find(s => s.id === activeSection);
  const gi = STEPS.indexOf(step);
  const canP = gi > 0, canN = gi < STEPS.length - 1;

  useEffect(() => { setShowDetail(false); setShowAnalogy(false); if (contentRef.current) contentRef.current.scrollTop = 0; }, [activeStep]);
  useEffect(() => { const f = STEPS.findIndex(s => s.section === activeSection); if (f >= 0) setActiveStep(f); }, [activeSection]);

  const nav = (d) => { const n = gi + d; if (n >= 0 && n < STEPS.length) { setActiveSection(STEPS[n].section); setActiveStep(STEPS[n].id); } };

  return (
    <div style={{ minHeight: "100vh", background: "#0A0D12", color: "#E6EDF3", fontFamily: "'IBM Plex Sans',-apple-system,sans-serif", display: "flex", flexDirection: "column" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600&display=swap');*{box-sizing:border-box;margin:0;padding:0}::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:rgba(255,255,255,.12);border-radius:10px}`}</style>

      <div style={{ padding: "14px 18px 10px", borderBottom: "1px solid rgba(255,255,255,.05)" }}>
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: "rgba(255,255,255,.25)", marginBottom: 3, fontFamily: "'IBM Plex Mono',monospace" }}>Design Live Comments</div>
        <div style={{ fontSize: 17, fontWeight: 800, color: "#fff", lineHeight: 1.3 }}>Broadcasting to Millions in Real-Time</div>
        <div style={{ fontSize: 11.5, color: "rgba(255,255,255,.35)", marginTop: 3 }}>SSE, tiered fanout, geo-distribution & playback sync</div>
      </div>

      <div style={{ padding: "8px 18px", borderBottom: "1px solid rgba(255,255,255,.05)", overflowX: "auto" }}>
        <div style={{ display: "flex", gap: 3, minWidth: "fit-content" }}>
          {SECTIONS.map(sec => <button key={sec.id} onClick={() => setActiveSection(sec.id)} style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 10px", borderRadius: 7, border: activeSection === sec.id ? `1.5px solid ${sec.color}50` : "1.5px solid transparent", background: activeSection === sec.id ? sec.color + "14" : "rgba(255,255,255,.025)", color: activeSection === sec.id ? sec.color : "rgba(255,255,255,.35)", cursor: "pointer", fontSize: 10.5, fontWeight: activeSection === sec.id ? 700 : 500, fontFamily: "'IBM Plex Sans',sans-serif", whiteSpace: "nowrap" }}><span style={{ fontSize: 11 }}>{sec.icon}</span><span>{sec.label}</span></button>)}
        </div>
      </div>

      <div style={{ padding: "7px 18px", borderBottom: "1px solid rgba(255,255,255,.04)", overflowX: "auto" }}>
        <div style={{ display: "flex", gap: 3, minWidth: "fit-content" }}>
          {sectionSteps.map(s => <button key={s.id} onClick={() => setActiveStep(s.id)} style={{ padding: "5px 9px", borderRadius: 6, border: activeStep === s.id ? `1px solid ${s.color}40` : "1px solid transparent", background: activeStep === s.id ? s.color + "10" : "transparent", color: activeStep === s.id ? s.color : "rgba(255,255,255,.3)", cursor: "pointer", fontSize: 10.5, fontWeight: activeStep === s.id ? 700 : 500, fontFamily: "'IBM Plex Sans',sans-serif", whiteSpace: "nowrap" }}>{s.icon} {s.phase}</button>)}
        </div>
      </div>

      <div style={{ height: 2, background: "rgba(255,255,255,.03)" }}><div style={{ height: "100%", width: `${((gi + 1) / STEPS.length) * 100}%`, background: `linear-gradient(90deg,${step.color}88,${step.color})`, transition: "all .4s ease" }} /></div>

      <div ref={contentRef} style={{ flex: 1, overflow: "auto", padding: "14px 18px 110px" }}>
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 7 }}>
            <span style={{ fontSize: 9, fontWeight: 800, color: curSec.color, background: curSec.color + "18", padding: "2px 7px", borderRadius: 4, fontFamily: "'IBM Plex Mono',monospace", letterSpacing: 1 }}>{curSec.label.toUpperCase()}</span>
            <span style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,.25)", fontFamily: "'IBM Plex Mono',monospace" }}>{gi + 1} / {STEPS.length}</span>
          </div>
          <h2 style={{ fontSize: 19, fontWeight: 800, color: "#fff", lineHeight: 1.3, marginBottom: 7 }}>{step.icon} {step.title}</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 2 }}>{step.concepts.map((c, i) => <Tag key={i} label={c} />)}</div>
        </div>
        <div style={{ fontSize: 9.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "rgba(255,255,255,.22)", marginBottom: 1 }}>Who's involved</div>
        <Chain actors={step.actors} color={step.color} />
        <div style={{ background: "rgba(255,255,255,.025)", borderRadius: 11, padding: 15, border: "1px solid rgba(255,255,255,.055)", marginTop: 12, fontSize: 13.5, lineHeight: 1.75, color: "rgba(255,255,255,.78)", whiteSpace: "pre-wrap" }}>{step.simple}</div>

        <button onClick={() => setShowDetail(!showDetail)} style={{ display: "flex", alignItems: "center", gap: 7, width: "100%", padding: "11px 15px", marginTop: 7, borderRadius: 10, border: `1px solid ${step.color}30`, background: showDetail ? step.color + "10" : "transparent", color: step.color, cursor: "pointer", fontSize: 12.5, fontWeight: 700, fontFamily: "'IBM Plex Sans',sans-serif" }}>
          <span style={{ transform: showDetail ? "rotate(90deg)" : "rotate(0deg)", transition: "transform .2s", fontSize: 13 }}>▶</span>{showDetail ? "Hide" : "Show"} Technical Deep Dive
        </button>
        {showDetail && <div style={{ background: "rgba(0,0,0,.3)", borderRadius: 10, padding: 16, border: `1px solid ${step.color}20`, marginTop: 3, fontSize: 12, lineHeight: 1.85, color: "rgba(255,255,255,.7)", fontFamily: "'IBM Plex Mono',monospace", whiteSpace: "pre-wrap" }}>{step.detail}</div>}

        <button onClick={() => setShowAnalogy(!showAnalogy)} style={{ display: "flex", alignItems: "center", gap: 7, width: "100%", padding: "11px 15px", marginTop: 5, borderRadius: 10, border: "1px solid rgba(255,255,255,.08)", background: showAnalogy ? "rgba(255,255,255,.04)" : "transparent", color: "rgba(255,255,255,.6)", cursor: "pointer", fontSize: 12.5, fontWeight: 700, fontFamily: "'IBM Plex Sans',sans-serif" }}>
          <span style={{ transform: showAnalogy ? "rotate(90deg)" : "rotate(0deg)", transition: "transform .2s", fontSize: 13 }}>▶</span>{showAnalogy ? "Hide" : "Show"} Real-World Analogy
        </button>
        {showAnalogy && <div style={{ background: "rgba(255,255,255,.025)", borderRadius: 10, padding: 15, border: "1px solid rgba(255,255,255,.07)", marginTop: 3, fontSize: 13.5, lineHeight: 1.75, color: "rgba(255,255,255,.6)", whiteSpace: "pre-wrap" }}>{step.analogy}</div>}
      </div>

      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, padding: "10px 18px 16px", background: "linear-gradient(transparent,#0A0D12 30%)", display: "flex", gap: 8 }}>
        <button onClick={() => nav(-1)} disabled={!canP} style={{ flex: 1, padding: 12, borderRadius: 10, border: "1px solid rgba(255,255,255,.08)", background: "rgba(255,255,255,.04)", color: canP ? "rgba(255,255,255,.65)" : "rgba(255,255,255,.18)", cursor: canP ? "pointer" : "default", fontSize: 13, fontWeight: 700, fontFamily: "'IBM Plex Sans',sans-serif" }}>← Back</button>
        <button onClick={() => nav(1)} disabled={!canN} style={{ flex: 2, padding: 12, borderRadius: 10, border: "none", background: canN ? `linear-gradient(135deg,${step.color},${step.color}99)` : "rgba(255,255,255,.08)", color: canN ? "#fff" : "rgba(255,255,255,.25)", cursor: canN ? "pointer" : "default", fontSize: 13, fontWeight: 700, fontFamily: "'IBM Plex Sans',sans-serif" }}>{canN ? "Next →" : "Live comments mastered!"}</button>
      </div>
    </div>
  );
}
