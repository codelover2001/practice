const { useState, useEffect, useRef } = React;

const SECTIONS = [
  { id: "intro", label: "What & Why", icon: "📹", color: "#E8B931" },
  { id: "webrtc", label: "WebRTC", icon: "🔗", color: "#4A90D9" },
  { id: "media", label: "Media Servers", icon: "🖥️", color: "#E74C3C" },
  { id: "scale", label: "Large Meetings", icon: "📢", color: "#50C878" },
  { id: "network", label: "Network", icon: "📶", color: "#9B59B6" },
  { id: "extras", label: "Record & Security", icon: "🔐", color: "#F39C12" },
  { id: "bigpicture", label: "Full Picture", icon: "🗺️", color: "#1ABC9C" },
];

const STEPS = [
  // ============ INTRO ============
  {
    id: 0, section: "intro", phase: "WHAT IS IT", title: "Video Conferencing — Why It's the Hardest Real-Time System", icon: "📹", color: "#E8B931",
    concepts: ["Video Streaming", "Sub-200ms Latency", "Bidirectional Media", "50M Concurrent"],
    actors: ["50M Participants", "10M Meetings", "SFU Servers", "UDP/RTP Streams"],
    simple: `You've designed WhatsApp (text messages), Slack (channel messages), Live Comments (broadcast text), and Google Docs (collaborative editing). Now Zoom — real-time VIDEO and AUDIO between multiple people.

This is harder than everything else combined. Here's why:

In WhatsApp, a message is a few hundred bytes, sent once, stored once. Latency of 100ms is fine.

In Zoom, VIDEO is a continuous stream of data — 1.5 megabits per second, EVERY second, from EVERY participant, sent to EVERY other participant. And if the total end-to-end latency exceeds 200ms, the conversation becomes awkward ("no, you go ahead..."). If it exceeds 400ms, it's unusable.

The scale: 10 million concurrent meetings, 50 million concurrent participants, each streaming HD video. The naive bandwidth calculation (50M × 7.5 Mbps) gives 375 Petabits per second — roughly 500x the entire internet's bandwidth. Obviously, we need to be much smarter than the naive approach.`,
    detail: `HOW VIDEO CONFERENCING DIFFERS FROM EVERYTHING ELSE:

                   WhatsApp      Live Comments    Google Docs     Zoom
Data type:         Text (bytes)  Text (bytes)     JSON tree       VIDEO + AUDIO (megabits)
Data per sec:      ~0            ~750 KB          ~few KB         1.5-6 Mbps PER PERSON
Direction:         Bidirectional Mostly one-way   Bidirectional   Bidirectional CONTINUOUS
Latency target:    <100ms        <500ms           <100ms          <200ms (HARD requirement)
Protocol:          WebSocket     SSE              WebSocket       WebRTC (UDP/RTP)
Transport:         TCP           TCP              TCP             UDP (lossy but fast!)
Loss tolerance:    Zero          Some OK          Zero            Some OK (skip frames)
Connection:        Persistent    Persistent       Persistent      Persistent + media streams

THE CRITICAL DIFFERENCE: TCP vs UDP

Everything we've built before uses TCP — reliable, ordered delivery. If a packet is lost, TCP retransmits it. This is essential for text ("Hello" without the "l" is corrupted).

Video uses UDP — unreliable, unordered. If a packet is lost, UDP does NOT retransmit it. The video continues without that packet (maybe a brief glitch).

Why? Because in real-time video, a LATE packet is USELESS. If you're watching me speak and my video frame from 500ms ago arrives now, you don't want to see 500ms-old footage. You want the CURRENT frame. Retransmission wastes time showing you the past instead of the present.

This is why video conferencing uses WebRTC (built on UDP), not WebSocket (built on TCP).

THE SCALE:

  10 million concurrent meetings
  50 million concurrent participants
  Average meeting: 5 people
  Large meetings (100+ people): ~100,000 simultaneous
  
  Bandwidth per participant (720p, 5-person meeting):
    Upload: 1.5 Mbps (own stream)
    Download: 6 Mbps (4 others × 1.5 Mbps)
    Total: 7.5 Mbps per person
  
  Media servers needed: 50M / 500 per server = 100,000 servers
  Recording storage (10% of meetings): ~22 PB per month

WHAT WE'RE BUILDING:

  1. Join/leave meetings (meeting management — the easy part)
  2. Real-time audio/video streaming (WebRTC — the hard part)
  3. Screen sharing (reuses video infrastructure)
  4. In-meeting chat (reuses signaling infrastructure)
  5. Meeting recording (specialized capture service)
  6. Security (passwords, waiting rooms, encryption)`,
    analogy: `📞 WhatsApp = passing notes in class. Small, infrequent, can wait.
Slack = an intercom system. Frequent announcements, text-based.
Live Comments = a stadium PA system. One-way broadcast to millions.
Google Docs = a shared whiteboard. Collaborative but static (no motion).
Zoom = a LIVE VIDEO CONFERENCE CALL. Continuous, bidirectional, real-time streams of video and audio.

Imagine 50 million people all on conference calls simultaneously, each one streaming live video to everyone else in their call, all needing to hear each other without delay. That's the engineering challenge. It's like running 10 million live TV stations simultaneously, each with multiple cameras.`
  },
  // ============ WEBRTC ============
  {
    id: 1, section: "webrtc", phase: "WEBRTC", title: "WebRTC — How Browsers Do Video", icon: "🔗", color: "#4A90D9",
    concepts: ["WebRTC", "STUN", "TURN", "ICE", "SDP", "NAT Traversal"],
    actors: ["Browser", "STUN Server", "TURN Server", "ICE Framework", "SFU"],
    simple: `WebRTC (Web Real-Time Communication) is the technology that makes video calls work in your browser without installing anything. Chrome, Firefox, Safari — they all have WebRTC built in. When you click "Join Meeting" on Google Meet or Zoom Web, WebRTC handles everything: capturing your camera, encoding the video, encrypting it, finding a network path to the server, and streaming it over UDP.

But there's a big problem: your laptop doesn't have a public IP address. You're behind a router/NAT that hides your real address. Other participants can't send video TO you because they don't know your actual address. WebRTC's STUN and TURN servers solve this "NAT traversal" problem.`,
    detail: `THE NAT TRAVERSAL PROBLEM:

Your laptop's IP: 192.168.1.42 (private, not routable on internet)
Your router's public IP: 203.0.113.55 (this is what the internet sees)

When Alice wants to send video to you, she can't send to 192.168.1.42 — that address doesn't exist outside your home network. She needs to know 203.0.113.55 AND which port your router mapped for you.

This is what STUN and TURN solve.

━━━ STUN (Session Traversal Utilities for NAT) ━━━

STUN helps you discover YOUR OWN public address.

Your browser: "Hey STUN server, what address do you see me as?"
STUN server: "I see you as 203.0.113.55:49152"
Your browser: "OK! That's my public address. I'll share this with others."

Now Alice knows to send video to 203.0.113.55:49152. Your router sees incoming packets on that port and forwards them to your laptop. Connection established!

STUN is FREE and lightweight. Google runs free STUN servers (stun:stun.l.google.com:19302).

But STUN fails when:
  — Corporate firewalls block UDP entirely
  — Symmetric NATs (common in offices) create unpredictable port mappings
  — The router drops packets from unknown sources

In ~10-15% of cases, STUN alone doesn't work.

━━━ TURN (Traversal Using Relays around NAT) ━━━

TURN is the fallback. When direct connection fails, TURN RELAYS your video through a server.

Instead of: Alice → directly to Bob
It becomes: Alice → TURN server → Bob

The TURN server has a public IP. Both Alice and Bob can reach it (outbound connections work even through strict firewalls). The TURN server forwards packets between them.

Downsides:
  — Adds latency (extra network hop)
  — Costs money (server bandwidth for every stream relayed)
  — Increases server load

But: a slightly delayed call is infinitely better than NO call. TURN guarantees connectivity.

━━━ ICE (Interactive Connectivity Establishment) ━━━

ICE ties STUN and TURN together. It tries MULTIPLE connection paths simultaneously:

  1. Direct connection (best: lowest latency)
  2. STUN-assisted connection (good: discovered public address)
  3. TURN relay (last resort: guaranteed to work)

ICE tests all paths in parallel and picks the BEST one that works. This is why video calls usually connect within 1-2 seconds even on tricky networks — ICE is racing multiple paths and going with whoever wins first.

━━━ SDP (Session Description Protocol) ━━━

Before video can flow, both sides need to agree on HOW to communicate. SDP is the format for this negotiation.

Alice's SDP offer (simplified):
  "I support video codecs: H.264, VP8
   I support audio codec: Opus
   I want to send video at up to 1080p
   Here are my ICE candidates (network addresses)
   Here are my encryption keys"

Server's SDP answer:
  "I'll accept H.264 for video
   I'll accept Opus for audio
   Max resolution: 720p
   Here are MY ICE candidates
   Here are MY encryption keys"

Once both sides exchange SDPs and ICE finds a working path, encrypted media starts flowing. The entire setup (WebSocket connect + SDP exchange + ICE negotiation) takes about 1-3 seconds.

━━━ THE COMPLETE CONNECTION FLOW ━━━

Phase 1 — SIGNALING (WebSocket, TCP):
  Client → Signaling Server: "I want to join meeting XYZ"
  Server → Client: "OK, here are the current participants"
  Client creates a WebRTC PeerConnection
  Client generates SDP offer (capabilities)
  Client → Server: SDP offer
  Server → Client: SDP answer from SFU

Phase 2 — ICE NEGOTIATION (trying all paths):
  Client discovers own public address via STUN
  Client → Server: ICE candidates (possible addresses)
  Server → Client: SFU's ICE candidates
  Both sides test all candidate pairs
  Best working path selected

Phase 3 — MEDIA FLOW (UDP, continuous):
  Video from camera → encoded → encrypted → UDP packets → SFU
  SFU → encrypted UDP packets → client → decoded → displayed
  This continues for the entire meeting duration

Phase 1 takes 1-2 seconds. Phase 2 takes 0.5-2 seconds. Phase 3 is the entire meeting.`,
    analogy: `📮 Imagine you live in a gated community (NAT/firewall). Your house number is 42 (private IP), but the community gate has address 555 Main St (public IP).

STUN = You call the post office: "What address do packages sent FROM me show?" Post office: "They show 555 Main St, Gate 7." Now you can tell friends: "Send packages to 555 Main St, Gate 7."

TURN = The post office itself. If the gate guard won't accept packages from strangers, you tell the sender: "Send to the post office instead. They'll forward to me." Slower but always works.

ICE = Your assistant who tries ALL delivery methods simultaneously — direct courier, gate delivery, and post office — and picks whichever actually gets through first.

SDP = The order form where you and the sender agree on package size, wrapping style, and labels before anything ships.`
  },
  // ============ MEDIA SERVERS ============
  {
    id: 2, section: "media", phase: "MESH vs MCU vs SFU", title: "Media Server Architectures — The Most Important Decision", icon: "🖥️", color: "#E74C3C",
    concepts: ["Mesh", "MCU", "SFU", "Selective Forwarding", "Transcoding"],
    actors: ["Participants", "Media Server", "Upload Streams", "Download Streams"],
    simple: `When 5 people are in a video call, each person's video needs to reach the other 4. HOW do we route these video streams? This is the single most important architectural decision in video conferencing. There are three approaches:

MESH: Everyone sends directly to everyone else. No server needed. Simple but doesn't scale.

MCU: One server receives all streams, decodes them, mixes them into ONE combined video, re-encodes, and sends that single stream to everyone. Low client bandwidth but insanely expensive server CPU.

SFU: One server receives all streams and FORWARDS them without decoding. No transcoding, just packet routing. This is what Zoom, Google Meet, and Teams all use. It's the sweet spot.`,
    detail: `━━━ MESH (Peer-to-Peer) ━━━

Every participant sends their stream to every other participant directly.

4-person meeting:
  Each person: uploads 3 streams (to the other 3 people)
  Each person: downloads 3 streams
  Total connections: 4 × 3 = 12 (or 6 bidirectional pairs)
  
  Upload per person at 720p: 3 × 1.5 Mbps = 4.5 Mbps
  Download per person: 3 × 1.5 Mbps = 4.5 Mbps

10-person meeting:
  Upload: 9 × 1.5 = 13.5 Mbps per person
  Connections: 10 × 9 = 90 (45 pairs)
  
  Most home internet can't sustain 13.5 Mbps upload. Breaks at 5-6 people.

✅ Lowest latency (direct peer-to-peer)
✅ No server costs
❌ Doesn't scale past 4-5 people
❌ Bandwidth explodes: O(N²) connections

Used for: 1-on-1 calls only (even Zoom uses mesh for 2-person calls)

━━━ MCU (Multipoint Control Unit) ━━━

Central server does ALL the heavy lifting.

Each person uploads 1 stream to the MCU.
MCU DECODES all streams, COMPOSITES them into a single grid video, RE-ENCODES, sends ONE stream to each person.

4-person meeting:
  Upload per person: 1.5 Mbps (just their own stream)
  Download per person: 1.5 Mbps (one combined stream)
  
  Fantastic for clients! Same bandwidth whether it's 5 or 500 people.

But the SERVER:
  Must decode N video streams simultaneously
  Must render a composite video (like a TV production)
  Must encode the composite for each recipient
  Video transcoding is THE most CPU-intensive operation in computing
  
  One MCU server can handle maybe 10-20 simultaneous streams before CPU maxes out.
  For 50M participants: need millions of MCU servers. Insane cost.

✅ Minimal client bandwidth (always just 1 stream up + 1 down)
✅ Works on weak devices
❌ Extremely high server CPU (decode → compose → encode = expensive)
❌ Adds 100-300ms latency (processing pipeline)
❌ Unscalable and expensive

Used for: Legacy video systems, TV broadcast production (where quality matters more than cost)

━━━ SFU (Selective Forwarding Unit) — THE WINNER ━━━

Server receives streams and FORWARDS them. No decoding. No encoding. Just packet routing.

The SFU looks at packet headers (which stream is this? where should it go?) and forwards the packet. It NEVER looks at the video content inside. This is cheap — network routing, not video processing.

4-person meeting:
  Upload per person: 1.5 Mbps (their stream to SFU)
  Download per person: 3 × 1.5 = 4.5 Mbps (3 streams from SFU)
  
  More download than MCU (multiple streams instead of one composite), 
  but dramatically less server CPU.

The "SELECTIVE" part is the genius:

The SFU doesn't blindly forward ALL streams to ALL participants. It makes SMART decisions:

1. ACTIVE SPEAKER: Currently speaking person → high quality to everyone.
   Other 4 people → low quality thumbnails.
   
2. VISIBILITY: Gallery shows 9 people per page? Only forward those 9.
   The other 91 people in the meeting? Don't send their video at all.
   
3. BANDWIDTH ADAPTATION: Bob has bad WiFi? Send him 480p instead of 720p.
   Alice has fiber? Send her 1080p.

Result: a 100-person meeting might actually require each participant to receive only 5-10 streams instead of 99.

One SFU server handles 200-500 concurrent participants (just routing packets, not transcoding). Compare to MCU's 10-20. That's 20-50x more efficient.

✅ Low server CPU (no transcoding)
✅ Low latency (~10ms added)
✅ Scales to hundreds of participants per server
✅ "Selective" forwarding saves massive bandwidth
❌ Higher client bandwidth than MCU (multiple streams)
❌ Higher client CPU (decode multiple streams)

Used by: Zoom, Google Meet, Microsoft Teams, Webex — literally everyone.

━━━ COMPARISON TABLE ━━━

              Mesh        MCU         SFU
Server CPU:   None        Very High   Low
Server BW:    None        Low         High
Client BW:    Very High   Low         Medium
Client CPU:   High        Low         Medium
Latency:      Lowest      High(+200ms) Low(+10ms)
Max people:   4-5         50+         500+
Cost:         Free        Very High   Moderate
Used by:      1-on-1 calls Legacy     EVERYONE

RECOMMENDATION: SFU. Always SFU. The entire rest of this design is built around SFU architecture.`,
    analogy: `📺 Imagine a TV production for a panel discussion with 5 guests.

MESH = Each guest has their own camera and 4 monitors. Each camera feeds directly to the other 4 guests' monitors. Works for 5 guests. Try it with 100 guests? 9,900 cable connections. The studio collapses.

MCU = One production crew receives all 5 camera feeds, creates a single "Brady Bunch" grid view on ONE monitor, and sends that combined feed to all guests. Great picture but the production crew (MCU server) needs enormous equipment and adds delay.

SFU = A switchboard operator receives all 5 camera feeds and just routes them. "Guest A is talking? Send their camera to everyone's main screen. Send the other 4 as tiny previews." The operator doesn't edit the video — just decides where each cable goes. Cheap, fast, scalable.

Zoom IS this switchboard operator. That's the SFU.`
  },
  // ============ LARGE MEETINGS ============
  {
    id: 3, section: "scale", phase: "SCALING", title: "Large Meetings — Cascading SFUs & Simulcast", icon: "📢", color: "#50C878",
    concepts: ["Cascading SFU", "Simulcast", "Selective Subscription", "Geo-distribution"],
    actors: ["500+ Participants", "SFU-US", "SFU-EU", "SFU-Asia", "Simulcast Layers"],
    simple: `One SFU handles 200-500 people. What about the company all-hands with 1,000 employees? Or a webinar with 10,000 attendees?

Three techniques work together:

CASCADING SFUs: Connect multiple SFUs across regions. Users connect to their nearest SFU. SFUs exchange only the necessary streams between themselves.

SIMULCAST: Each sender encodes their video at 3 quality levels simultaneously (1080p, 720p, 360p). The SFU picks which level to forward to each recipient based on their needs.

SELECTIVE SUBSCRIPTION: In a 100-person meeting, you only ACTUALLY see 25 people (one page of gallery view). Don't send the other 75. ~90% bandwidth saved.`,
    detail: `━━━ CASCADING SFUs ━━━

1,000-person company all-hands. Employees in US, Europe, and Asia.

Without cascading:
  All 1,000 connect to ONE SFU in Virginia.
  Asia employees: 200ms latency to Virginia. Barely acceptable.
  European employees: 100ms. OK but not great.
  Virginia SFU: handling 1,000 participants = overloaded (max is ~500).

With cascading:
  SFU-US (Virginia): 400 US employees connect here
  SFU-EU (Frankfurt): 350 European employees connect here
  SFU-Asia (Singapore): 250 Asian employees connect here
  
  Each SFU handles its LOCAL participants normally.
  SFUs exchange streams with each other:
    CEO is speaking in US → SFU-US sends CEO's stream to SFU-EU and SFU-Asia
    SFU-EU and SFU-Asia distribute to their local users
  
  Key optimization: SFUs only exchange RELEVANT streams.
  If only the CEO is speaking, only 1 stream crosses between SFUs.
  Not 1,000 streams. Just 1.
  
  If 5 people are in a Q&A, 5 streams cross between SFUs. Still manageable.

Result:
  US employees: <50ms latency to their SFU ✅
  EU employees: <50ms to their SFU ✅
  Asia employees: <50ms to their SFU ✅
  Cross-region latency (US speaker → Asia viewer): ~200ms (acceptable for large meetings)

Adding capacity = adding SFU nodes. Linear scaling.

━━━ SIMULCAST ━━━

The problem: Alice is the active speaker. Bob wants to see her in 1080p (he's on the main screen). Carol's gallery shows Alice as a tiny thumbnail — she only needs 360p. Dave has bad WiFi — 720p would buffer, 360p is fine.

Three different recipients need three different qualities of the SAME stream.

Without simulcast: the SFU would have to TRANSCODE Alice's 1080p down to 720p and 360p for different recipients. That's MCU-level CPU work. Defeats the purpose of SFU.

With simulcast: Alice's client encodes THREE copies simultaneously:

  High: 1080p at 2.5 Mbps
  Medium: 720p at 1 Mbps  
  Low: 360p at 300 Kbps

Alice uploads all three to the SFU. Cost: ~3.8 Mbps total upload.

SFU receives all three and SELECTS which to forward:
  → Bob (main speaker view, good network): forward HIGH (1080p)
  → Carol (tiny thumbnail in gallery): forward LOW (360p)
  → Dave (bad WiFi): forward LOW (360p)

Layer switching is INSTANT. When Dave's network improves:
  SFU switches from forwarding LOW → MEDIUM for Dave.
  No re-encoding. Just start forwarding different packets.
  Happens in milliseconds.

When someone else becomes the active speaker:
  Their HIGH layer goes to everyone's main view.
  The previous speaker drops to LOW (now a thumbnail).
  Switch happens in <100ms. Feels seamless.

TRADEOFF:
  Alice uploads 3.8 Mbps instead of 1.5 Mbps (2.5x more)
  Alice's CPU encodes 3 resolutions instead of 1 (more CPU)
  But: the SFU does ZERO transcoding. Just packet routing. Scales massively.

━━━ SELECTIVE SUBSCRIPTION ━━━

100-person meeting. Gallery shows 25 people per page. You're on page 1.

WITHOUT selective subscription:
  SFU forwards 99 video streams to you (everyone except yourself).
  99 × 300 Kbps (thumbnail) = ~30 Mbps download. Too much.

WITH selective subscription:
  SFU only forwards streams for participants VISIBLE in your view:
    Active speaker: 1 stream at HIGH (1080p) = 2.5 Mbps
    Gallery page 1: 24 streams at LOW (360p) = 24 × 300 Kbps = 7.2 Mbps
    Page 2-4 (off-screen): 0 streams = 0 Mbps
    Total: ~10 Mbps
  
  When you scroll to page 2:
    SFU stops forwarding page 1 thumbnails
    Starts forwarding page 2 thumbnails
    Switch takes ~200ms (need to request + receive new streams)

  Bandwidth saved: ~67% vs sending everything.

For audio: SFU mixes the top 3-4 speakers into one audio stream. You don't hear 99 separate audio tracks (that would be cacophony). Just the loudest speakers.

━━━ ALL THREE TOGETHER ━━━

1,000-person all-hands:
  Cascading: 3 regional SFUs serve 300-400 local users each
  Simulcast: Each participant uploads 3 quality layers
  Selective subscription: Each viewer receives ~25 video streams total
  
  Per viewer bandwidth: ~10 Mbps (not 1,500 Mbps if naive)
  Per SFU: handles ~400 local participants efficiently
  Cross-SFU: only active speaker streams exchanged
  
  Result: feels like one unified meeting despite being distributed across 3 data centers on 3 continents.`,
    analogy: `📺 Imagine broadcasting the Olympics to the world.

Cascading SFUs = Regional broadcast centers. The Tokyo feed goes to local stations in Mumbai, London, New York. Each local station serves its viewers. Only the live footage crosses between stations, not individual viewer connections.

Simulcast = The cameraman records in 4K, 1080p, and 480p simultaneously. Big-screen TVs get 4K. Laptops get 1080p. Phones get 480p. No one has to re-edit the footage — just pick the right tape.

Selective subscription = Your TV shows ONE camera angle at a time. You're not receiving all 50 camera feeds simultaneously. Switch to a different camera? The broadcast center switches your feed instantly.

Result: billions of viewers, reasonable bandwidth, everyone sees the right quality for their device.`
  },
  // ============ NETWORK ============
  {
    id: 4, section: "network", phase: "NETWORK", title: "Handling Bad Networks — Jitter, Loss & Adaptation", icon: "📶", color: "#9B59B6",
    concepts: ["Jitter Buffer", "FEC", "Adaptive Bitrate", "NACK", "Packet Loss"],
    actors: ["Sender", "Unreliable Network", "Jitter Buffer", "Receiver"],
    simple: `Real networks are messy. Packets get lost (1-5% on WiFi). They arrive at irregular intervals (jitter). Bandwidth fluctuates when someone else on your WiFi starts a download. A video conferencing system that only works on perfect networks is useless.

Four strategies handle this: JITTER BUFFER (smooth out irregular packet timing), FEC (send redundant data to recover from losses), ADAPTIVE BITRATE (reduce quality when network degrades), and NACK (request retransmission of critical lost packets).`,
    detail: `━━━ STRATEGY 1: JITTER BUFFER ━━━

THE PROBLEM:
Video playback expects frames every 33ms (for 30fps). But packets arrive irregularly:
  Packet 1: arrives at 0ms
  Packet 2: arrives at 50ms (late!)
  Packet 3: arrives at 52ms (almost same time as 2)
  Packet 4: arrives at 120ms (very late!)
  Packet 5: arrives at 122ms

If you play each packet as it arrives, the video stutters — fast, slow, fast, freeze, fast.

THE SOLUTION:
Buffer incoming packets for a short time (e.g., 50ms) before playing them.

  Network:      P1----P2-P3-----------P4-P5
                (irregular, bursty)
  
  Jitter Buffer: [P1, P2, P3, P4, P5] → buffer for 50ms
  
  Playback:     P1....P2....P3....P4....P5
                (smooth, regular intervals)

The buffer absorbs timing variations and plays packets at regular intervals.

TRADEOFF: 
  50ms buffer = 50ms added latency. Total latency: network(80ms) + buffer(50ms) = 130ms.
  100ms buffer = smoother but 100ms more delay. Total: 180ms. Getting close to the 200ms limit.

ADAPTIVE JITTER BUFFER:
  Start with 20ms buffer.
  If jitter increases → grow buffer (smoother, more latency)
  If jitter decreases → shrink buffer (less smooth, less latency)
  Always minimizes latency while keeping playback smooth.

━━━ STRATEGY 2: FEC (Forward Error Correction) ━━━

THE PROBLEM:
Packet 3 is lost in transit. Without it, the video has a glitch — a corrupted frame or a brief freeze. Requesting retransmission (NACK) takes one round-trip (~100ms). Can we avoid the wait?

THE SOLUTION:
Send REDUNDANT data alongside the original packets. If any packet is lost, the receiver can reconstruct it mathematically from the redundant data.

  For every 4 data packets, generate 1 FEC packet:
  Send: P1, P2, P3, P4, FEC(1-4)
  
  P3 lost? Receiver uses P1 + P2 + P4 + FEC → reconstructs P3.
  No retransmission needed. No extra latency.

TRADEOFF:
  25% extra bandwidth (sending 5 packets instead of 4).
  If no packets are lost → FEC packets are wasted bandwidth.
  If >1 packet lost in the group → FEC can't recover. Need NACK as fallback.

WHEN TO USE:
  1-5% packet loss: FEC is perfect. Recovers most losses instantly.
  >5% loss: FEC alone isn't enough. Also reduce bitrate.
  <0.5% loss: FEC isn't worth the bandwidth overhead.

━━━ STRATEGY 3: ADAPTIVE BITRATE ━━━

THE PROBLEM:
Alice has great WiFi (50 Mbps). She can receive 1080p. Bob is on 4G in a subway (2 Mbps). If we send Bob 1080p, his connection can't keep up → buffering → freezing.

THE SOLUTION:
Continuously monitor each recipient's network and adjust quality:

  Monitoring signals:
    Packet loss rate: >5% → network is congested
    Round-trip time (RTT): >200ms → congested or far away
    Available bandwidth estimate: based on how fast ACKs come back

  Adaptation ladder:
    Network great (loss <1%, RTT <100ms): 1080p @ 2.5 Mbps
    Network good (loss 1-3%, RTT <150ms): 720p @ 1 Mbps
    Network OK (loss 3-5%, RTT <200ms): 480p @ 500 Kbps
    Network bad (loss >5%, RTT >200ms): 360p @ 300 Kbps
    Network terrible: Audio only @ 100 Kbps

With SIMULCAST, adaptation is instant. SFU switches which layer it forwards:
  Bob's network degrades → SFU switches from forwarding HIGH to LOW.
  No re-encoding. Just different packet routing. Happens in milliseconds.
  Bob sees the video degrade from HD to blurry, but it KEEPS PLAYING.
  Much better than freezing.

Without simulcast: the sender's encoder has to change its settings → takes 1-2 seconds to adjust → noticeable quality oscillation.

━━━ STRATEGY 4: NACK (Retransmission) ━━━

When FEC fails to recover a lost packet:

  Receiver: "I got packets 1, 2, 4, 5... where's packet 3?"
  Receiver → Sender: NACK message "Please resend packet 3"
  Sender resends packet 3.
  
  Cost: at least 1 RTT of delay (e.g., 100ms).

WHEN NACK IS WORTH IT:
  — Lost packet is a KEYFRAME (full video frame that other frames depend on)
    Without the keyframe, the next 30+ frames can't be decoded. Worth the 100ms wait.
  — Lost packet is a regular frame and RTT is low (<50ms)
    50ms delay is acceptable for a single frame recovery.

WHEN NACK IS NOT WORTH IT:
  — RTT is high (>150ms). By the time the retransmitted packet arrives, it's too old.
  — Lost packet is not critical (just a predicted frame). Skip it, next keyframe fixes everything.

━━━ ALL FOUR TOGETHER ━━━

In a real video call, ALL strategies work simultaneously:

  1. Jitter buffer smooths packet timing (always active)
  2. FEC recovers most packet losses instantly (always active, ratio adjusted by loss rate)
  3. Adaptive bitrate matches quality to network capacity (continuous monitoring)
  4. NACK recovers critical lost packets when FEC fails (on-demand)

The system constantly monitors and adapts. Your experience:
  Good network: crisp 1080p, low latency, smooth
  Degrading: imperceptible shift to 720p, slightly more jitter absorbed
  Bad: noticeable 480p, occasional brief artifacts
  Terrible: blurry 360p but still usable, or audio-only
  
  At no point does the call just FREEZE. The system degrades gracefully.`,
    analogy: `📻 Imagine listening to a cricket match on a car radio while driving through mountains.

Jitter buffer = Your radio has a 2-second buffer. If the signal flickers for 1 second, you don't hear static — the buffer covers it. But commentary is 2 seconds behind live.

FEC = The radio station sends each word twice on two frequencies. If one frequency gets blocked by a mountain, you hear it on the other. Uses double the airwaves but you never miss a word.

Adaptive bitrate = Signal getting weak? The station automatically switches from FM stereo (high quality) to AM mono (lower quality but more reliable). You hear the commentary, just not in perfect quality.

NACK = "I missed the score! Could you repeat?" The commentator says it again. But you had to wait for the next pause. Works for critical info, not every word.

All four: you hear continuous commentary regardless of mountain tunnels, weather, or distance. Quality varies, but it never stops.`
  },
  // ============ EXTRAS ============
  {
    id: 5, section: "extras", phase: "RECORDING", title: "Recording & Screen Sharing", icon: "⏺️", color: "#F39C12",
    concepts: ["Recording Bot", "Server-Side Recording", "Screen Sharing", "S3 Storage"],
    actors: ["Recording Bot", "SFU", "Processing Pipeline", "S3"],
    simple: `Recording: When the host clicks "Record," the system spins up a RECORDING BOT — an invisible participant that joins the meeting through the SFU like anyone else. It receives all audio/video streams, writes them to disk, and after the meeting, a processing pipeline combines them into a single MP4 file.

Screen sharing: Reuses the SAME WebRTC infrastructure as video. Instead of capturing from the camera, the browser captures from the screen using getDisplayMedia(). A new video track is sent to the SFU as an additional stream. The SFU forwards it to all viewers. No special infrastructure needed.`,
    detail: `━━━ SERVER-SIDE RECORDING ━━━

WHY NOT CLIENT-SIDE?
  You could have the host's device record locally. But:
  — Host's laptop crashes? Recording lost.
  — Host has weak hardware? Recording quality suffers.
  — Host has limited storage? Can't record long meetings.
  — Only captures what the HOST sees (their layout, their speaker view).
  
  Server-side is the production approach.

THE RECORDING BOT APPROACH:

Step 1: Host clicks "Record"
  Backend spins up a recording bot (a headless process on a server).

Step 2: Bot joins the meeting
  The bot joins the SFU like any other participant.
  It subscribes to ALL audio and video streams.
  From the SFU's perspective, it's just another client.
  (Other participants see "Recording has started" notification.)

Step 3: Bot captures streams
  Audio: receives mixed audio stream → writes to disk
  Video: receives individual video streams → writes to disk
  Stored on fast local SSD (100+ MB/s write speed needed for multiple HD streams).

Step 4: Meeting ends, bot disconnects
  Raw audio + video files uploaded to processing queue (SQS/RabbitMQ).

Step 5: Post-processing pipeline
  Combine multiple audio tracks into single mixed track
  Create video layouts:
    — Active speaker view (main speaker large, others small)
    — Gallery view (grid of participants)
    — Or both, letting the viewer choose during playback
  Transcode to standard format: MP4 with H.264 + AAC
  Generate thumbnails for preview
  Tool: FFmpeg (the standard for video processing)

Step 6: Final recording stored in S3
  Host receives notification: "Your recording is ready"
  Download link provided
  S3 lifecycle policies:
    First 30 days: standard storage (hot)
    30-90 days: Infrequent Access (cheaper)
    90+ days: Glacier (archival, very cheap)

STORAGE MATH:
  1 hour of 720p recording ≈ 1 GB
  Average meeting: 45 min ≈ 750 MB
  10% of meetings recorded: 1M recordings/day
  Storage per month: ~22 PB
  
  Without lifecycle policies: astronomical cost.
  With Glacier for old recordings: manageable.

━━━ SCREEN SHARING ━━━

Surprisingly simple because it reuses everything we already built.

  1. User clicks "Share Screen"
  2. Browser shows system picker: "Share entire screen / window / tab?"
  3. Browser calls getDisplayMedia() → captures screen as a video stream
  4. This stream is added as a NEW track to the existing WebRTC connection
  5. SFU receives it as an additional stream (tagged as "screen share")
  6. SFU forwards to all participants
  7. Clients display it prominently (main view area)

KEY DIFFERENCE FROM CAMERA VIDEO:
  — Screen content needs HIGHER resolution (text must be readable)
  — Screen content needs LOWER framerate (a slide deck doesn't change 30 times/sec)
  — Dynamic adjustment: showing a static document? 5 fps is fine, saves bandwidth.
    Playing a video in shared tab? Need 30 fps for smooth playback.

Some systems encode screen shares differently:
  — Use a codec optimized for screen content (sharp text, not smooth motion)
  — VP9 and AV1 have screen content coding tools built in
  — H.264 can be tuned for screen content mode

━━━ IN-MEETING CHAT ━━━

Also simple — reuses the signaling WebSocket:

  Alice types "Link: https://..." in chat
  Message sent via WebSocket to signaling server
  Signaling server broadcasts to all participants in the meeting
  (Or just the recipient for private messages)
  
  Optionally persisted in Cassandra for meeting history.
  Same schema as Slack/WhatsApp: meeting_id as partition key, timeuuid as clustering key.
  
Chat is a SOLVED PROBLEM at this point. We built this in the WhatsApp and Slack chapters.`,
    analogy: `📹 Recording bot = an invisible stenographer who joins the meeting. They sit silently, listen to everyone, write everything down. After the meeting, they go to the editing room, compile their notes into a polished document (video), and send it to the host.

Screen sharing = instead of pointing your camera at your face, you point it at your monitor. Same transmission infrastructure, different source. Like switching which camera is live on a TV show — the broadcast equipment doesn't change, just which camera feed it's carrying.

Chat = passing notes during a meeting. The same WebSocket that carries "Alice muted herself" also carries "Alice: here's the link." Tiny messages alongside the massive video streams.`
  },
  {
    id: 6, section: "extras", phase: "SECURITY", title: "Security — Passwords, Waiting Rooms & Encryption", icon: "🔐", color: "#E74C3C",
    concepts: ["Meeting Password", "Waiting Room", "E2EE", "DTLS-SRTP"],
    actors: ["Participant", "Host", "Waiting Room", "Encryption Layer"],
    simple: `Remember "Zoom-bombing" in 2020? Random people joining meetings and showing inappropriate content. Security isn't optional — it's critical.

Three layers of access control: PASSWORD (first barrier), WAITING ROOM (human verification), MEETING LOCK (nuclear option). Plus encryption at two levels: encryption in transit (standard — SFU can see packets) and end-to-end encryption (optional — even the SFU can't see content).`,
    detail: `━━━ ACCESS CONTROL ━━━

LAYER 1: MEETING PASSWORD
  When creating a meeting, system generates a random password (or host sets one).
  Password is bcrypt-hashed before storage (never stored in plaintext).
  Anyone joining must enter the password.
  
  Stops: casual intruders who find a meeting link.
  Doesn't stop: someone who received the password from a legitimate participant.

LAYER 2: WAITING ROOM
  Even with correct password, new participants enter a "lobby."
  Host sees: "John wants to join — Admit / Deny"
  Host can see the person's name and optionally a video preview.
  Only after host clicks "Admit" does the participant enter the meeting.
  
  Stops: uninvited guests even if they have the password.
  
  Flow:
    Participant → enters password ✓ → placed in waiting room
    Host reviews → clicks "Admit" → participant enters meeting
    Or: Host clicks "Deny" → participant kicked out

LAYER 3: MEETING LOCK
  Once all expected participants have joined, host can LOCK the meeting.
  No new participants can join, period. Even with password + host approval.
  Until host explicitly unlocks.
  
  Stops: absolutely everyone, including latecomers.
  Used for: sensitive meetings where you need certainty about who's present.

━━━ ENCRYPTION ━━━

LEVEL 1: ENCRYPTION IN TRANSIT (default, always on)

  All signaling: over TLS (HTTPS) or WSS (WebSocket Secure)
  All media: encrypted via DTLS-SRTP (built into WebRTC)
  
  What this means:
    Your ISP can't see your video. ✅
    A hacker at the coffee shop can't eavesdrop. ✅
    The SFU server CAN decrypt the media. ⚠️
  
  The SFU needs to see packet headers for:
    — Active speaker detection (whose audio is loudest?)
    — Simulcast layer switching (which quality to forward?)
    — Recording (capture the content)
  
  If someone hacks the SFU server itself → could access media.
  For most meetings, this level is perfectly adequate.

LEVEL 2: END-TO-END ENCRYPTION (E2EE) (optional)

  Media encrypted on sender's device with keys only participants have.
  SFU forwards encrypted packets it CANNOT decrypt.
  
  Even if:
    — SFU is hacked → encrypted data, useless
    — Company receives a legal warrant → can only provide encrypted data
    — Zoom/Google employee goes rogue → can't access content
  
  The SFU becomes a "dumb pipe" — just routing encrypted packets.
  
  TRADEOFFS OF E2EE:
    ❌ No server-side active speaker detection (can't inspect audio levels)
    ❌ No server-side recording (can't decrypt streams)
    ❌ No simulcast layer switching (can't inspect video content)
    ❌ Key management complexity (how to share keys when someone joins mid-meeting?)
    ❌ Performance features limited
    
    ✅ Maximum privacy
    ✅ Compliance with strict security requirements
    ✅ Protection against server compromise
  
  Most systems: E2EE is optional, off by default.
  Everyday meetings: standard encryption is fine.
  Sensitive meetings (legal, medical, board meetings): enable E2EE.

━━━ AUTHENTICATION & AUTHORIZATION ━━━

AUTHENTICATION (who are you?):
  OAuth integration (Google, Microsoft SSO)
  Enterprise: SAML/OIDC via corporate IdP (Okta, Azure AD)
  JWT tokens for session management

AUTHORIZATION (what can you do?):
  Roles: Host, Co-Host, Participant
  
  Host can: mute anyone, remove anyone, enable/disable screen sharing, start/stop recording, lock meeting
  Co-Host can: mute, admit from waiting room (delegated by host)
  Participant can: mute self, toggle own camera, share screen (if allowed), send chat

Role checked on every action. Participant tries to mute someone else → 403 Forbidden.`,
    analogy: `🏢 Imagine a secure corporate meeting room.

Password = the door has a keypad lock. Only people with the code can enter.

Waiting room = even with the code, you enter a lobby. The receptionist (host) checks your name against the guest list and buzzes you in. No list, no entry.

Meeting lock = once everyone's seated, the receptionist locks the outer door. Nobody else comes in, even with the code.

Encryption in transit = the meeting room has soundproof walls. People outside can't hear. But the building's security cameras (SFU) can see inside.

E2EE = the meeting room has OPAQUE walls. Even the security cameras can't see inside. Only people in the room know what's discussed. But the security cameras also can't alert you if there's a fire (server features disabled).`
  },
  // ============ BIG PICTURE ============
  {
    id: 7, section: "bigpicture", phase: "FULL PICTURE", title: "Everything Connected — A 500-Person All-Hands Meeting", icon: "🗺️", color: "#1ABC9C",
    concepts: ["Complete Architecture", "End-to-End Flow", "All Components"],
    actors: ["Host", "500 Participants", "3 Regional SFUs", "Signaling", "Recording"],
    simple: `Let's trace one complete scenario: a 500-person company all-hands meeting, with employees in 3 continents, the CEO speaking, an engineer asking a question, screen sharing, chat, and recording. Every component we've designed shows up.`,
    detail: `THE COMPLETE ARCHITECTURE:

MANAGEMENT LAYER:
  — API Gateway (auth, rate limiting, routing)
  — Meeting Service (CRUD, scheduling, permissions) → PostgreSQL
  — Presence Service (who's in which meeting) → Redis

SIGNALING LAYER:
  — Signaling Servers (WebSocket, session negotiation)
  — Redis Pub/Sub (cross-server message distribution)

MEDIA LAYER:
  — SFU-US (Virginia): handles US participants
  — SFU-EU (Frankfurt): handles European participants
  — SFU-Asia (Singapore): handles Asian participants
  — TURN Servers (relay for participants behind strict firewalls)

SUPPORT LAYER:
  — Recording Bot (invisible participant capturing streams)
  — Processing Pipeline (FFmpeg, transcoding) → S3
  — Chat (via signaling WebSocket) → Cassandra

━━━ THE SCENARIO: COMPANY ALL-HANDS ━━━

9:00 AM EST — Host (CEO, in New York) creates the meeting.

  POST /meetings → Meeting Service → PostgreSQL stores metadata
  Returns: meeting_id, join_url, host_key
  CEO shares the link in Slack #general

9:25 AM — 500 employees click the join link.

  Each employee:
  1. POST /meetings/{id}/join → validates password/access
  2. Response includes: signaling_server_url (nearest region), ice_servers, token
  3. Client connects to NEAREST signaling server via WebSocket
     — US employees → US signaling server
     — EU employees → EU signaling server  
     — Asia employees → Asia signaling server
  4. SDP exchange: client sends offer, SFU sends answer
  5. ICE negotiation: STUN discovers public address, best path found
     (10% of corporate users need TURN relay)
  6. WebRTC media connection established to NEAREST SFU

  Result: 500 connections distributed:
    SFU-US: 200 participants
    SFU-EU: 180 participants
    SFU-Asia: 120 participants

  Each participant uploads their video in 3 simulcast layers:
    High (1080p), Medium (720p), Low (360p)

9:30 AM — CEO starts speaking.

  SFU-US detects CEO is the active speaker (loudest audio).
  
  For US participants (200 people):
    CEO's HIGH layer (1080p) → forwarded as main speaker view
    Other 24 visible in gallery → LOW layer (360p) thumbnails
    Remaining 175 → no video forwarded (off-screen)
    Audio: top 3 speakers mixed into one stream
  
  For EU/Asia participants:
    SFU-US → CEO's HIGH stream → SFU-EU and SFU-Asia (cascading)
    Each regional SFU distributes locally
    Total cross-region bandwidth: just 1 stream (CEO's) = 2.5 Mbps
    
  Per participant download: ~10 Mbps (1 HD + 24 thumbnails)
  Without optimizations: would be 500 × 1.5 = 750 Mbps. We saved ~99%.

9:35 AM — CEO enables recording.

  Backend spins up Recording Bot.
  Bot joins SFU-US as invisible participant.
  Bot subscribes to ALL audio + video streams.
  Writes raw streams to local SSD.
  Other participants see: "This meeting is being recorded" notification.

9:40 AM — Engineer in London asks a question.

  Engineer unmutes (media state update via WebSocket → broadcast to all).
  Engineer speaks → SFU-EU detects new active speaker.
  
  SFU-EU forwards engineer's HIGH stream to SFU-US and SFU-Asia.
  All regional SFUs update: CEO + engineer are both active speakers.
  Participants see: CEO in main view, engineer in secondary view.
  
  CEO responds → both audio streams mixed, delivered to all.

9:45 AM — CEO shares screen to show quarterly results.

  CEO clicks "Share Screen" → browser shows picker → selects slides.
  getDisplayMedia() captures screen → new WebRTC track to SFU-US.
  SFU-US tags it as screen share, forwards to all (high res, low framerate).
  SFU-US cascades to SFU-EU, SFU-Asia.
  All participants see slides in main view, CEO in corner.
  
  Screen share encoded at 1080p, 5fps (static slides don't need 30fps).
  Bandwidth per viewer: ~1 Mbps for screen + CEO's video.

9:50 AM — Engineer in Tokyo has bad WiFi.

  SFU-Asia detects: packet loss 8%, RTT 250ms for this participant.
  Adaptive bitrate kicks in:
    — Switch from forwarding MEDIUM to LOW layer for all streams
    — Reduce from 24 gallery thumbnails to 9 (smaller gallery)
    — Enable extra FEC (30% redundancy)
    — Grow jitter buffer from 50ms to 100ms
  
  Tokyo engineer: sees blurrier video but call CONTINUES.
  Other participants: unaffected (each gets independent quality decisions).

10:00 AM — Meeting ends.

  CEO clicks "End Meeting for All."
  Signaling servers broadcast "meeting ended" to all 500 WebSocket connections.
  All WebRTC connections closed.
  SFUs release resources.
  Redis presence cleared.
  
  Recording Bot disconnects.
  Raw recording uploaded to processing queue.
  Processing pipeline:
    — Mix audio tracks → single track
    — Create active-speaker layout video
    — Transcode to H.264 MP4
    — Generate thumbnails
    — Upload to S3
  CEO receives email: "Your recording is ready" (takes 30-60 min to process)

━━━ TECHNOLOGY STACK ━━━

  Signaling: WebSocket (TCP) via custom servers + Redis Pub/Sub
  Media: WebRTC (UDP/RTP/SRTP) via SFU servers (mediasoup/Janus/LiveKit)
  NAT Traversal: STUN (free) + TURN (coturn, for ~10% of users)
  Meeting data: PostgreSQL (ACID, relational)
  Chat: Cassandra (append-only, time-series)
  Presence: Redis (ephemeral, sub-ms)
  Recording: FFmpeg + S3 with lifecycle policies
  Auth: JWT + OAuth/SAML

━━━ COMPARISON WITH PREVIOUS SYSTEMS ━━━

               WhatsApp    Slack       Live Comments  Google Docs   Zoom
Data:          Text        Text        Text           JSON tree     VIDEO+AUDIO
Transport:     TCP         TCP         TCP            TCP           UDP
Protocol:      WebSocket   WebSocket   SSE            WebSocket     WebRTC
Server:        Chat server Real-time   SSE Gateway    Collab Svc    SFU
Bandwidth/user: ~1 Kbps   ~1 Kbps     ~1 Kbps        ~1 Kbps      1-10 Mbps
Latency:       <100ms     <200ms      <500ms          <100ms        <200ms
Core challenge: Delivery   Channels    Fanout to 5M   Conflict res  Media routing
Conflict:      None       None        None            OT/CRDT       None (streams independent)
Offline:       Queue      last_read   Playback API    Full edit     N/A (real-time only)

Each system optimizes for its unique constraint:
  WhatsApp → reliability (never lose a message)
  Slack → organization (channels, search, workspaces)
  Live Comments → scale of fanout (millions of recipients)
  Google Docs → conflict resolution (OT/CRDT for shared state)
  Zoom → MEDIA DELIVERY (continuous HD video with <200ms latency)

The progression: text → structured text → real-time text → collaborative editing → real-time video. Each step adds an order of magnitude of complexity. And the same distributed systems fundamentals (sharding, caching, pub/sub, replication, adaptive quality) appear in every single one.`,
    analogy: `📺 The complete Zoom system is like a live international TV broadcast:

Meeting Service = the production office that schedules the show and manages credentials.
Signaling Servers = the production director telling each camera operator what to do.
SFU = the video switcher — routes camera feeds to monitors without editing the footage.
Cascading SFUs = satellite relay stations beaming the show to different continents.
Simulcast = filming in 4K, 1080p, and 480p simultaneously for different viewers.
Selective subscription = your TV only receives the camera feed you're currently watching.
TURN = if satellite fails, route through a ground relay (slower but works).
Jitter buffer = the 2-second broadcast delay that makes live TV smooth.
Adaptive bitrate = automatically switching to standard-def if your signal weakens.
Recording bot = the tape machine in the control room, silently capturing everything.
Waiting room = the green room where guests wait before going on air.

500 employees across 3 continents, each seeing crisp video and hearing clear audio, with recording for those who missed it. Behind the scenes: thousands of servers routing millions of packets per second across global infrastructure. To the user: "I just clicked a link and I'm in a meeting." That seamless simplicity, hiding enormous complexity, is the art of system design.`
  }
];

// ====== UI ======
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
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: "rgba(255,255,255,.25)", marginBottom: 3, fontFamily: "'IBM Plex Mono',monospace" }}>Design Zoom</div>
        <div style={{ fontSize: 17, fontWeight: 800, color: "#fff", lineHeight: 1.3 }}>Real-Time Video at Planetary Scale</div>
        <div style={{ fontSize: 11.5, color: "rgba(255,255,255,.35)", marginTop: 3 }}>WebRTC, SFU architecture, simulcast, network adaptation & security</div>
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
        <button onClick={() => nav(1)} disabled={!canN} style={{ flex: 2, padding: 12, borderRadius: 10, border: "none", background: canN ? `linear-gradient(135deg,${step.color},${step.color}99)` : "rgba(255,255,255,.08)", color: canN ? "#fff" : "rgba(255,255,255,.25)", cursor: canN ? "pointer" : "default", fontSize: 13, fontWeight: 700, fontFamily: "'IBM Plex Sans',sans-serif" }}>{canN ? "Next →" : "Zoom design mastered!"}</button>
      </div>
    </div>
  );
}
