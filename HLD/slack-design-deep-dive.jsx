const { useState, useEffect, useRef } = React;

const SECTIONS = [
  { id: "intro", label: "What is Slack", icon: "💼", color: "#E8B931" },
  { id: "messaging", label: "Real-time Messaging", icon: "💬", color: "#4A90D9" },
  { id: "fanout", label: "Large Channels", icon: "📢", color: "#E74C3C" },
  { id: "search", label: "Search", icon: "🔍", color: "#50C878" },
  { id: "threads", label: "Threads", icon: "🧵", color: "#9B59B6" },
  { id: "deepdive", label: "Deep Dive", icon: "🔬", color: "#F39C12" },
  { id: "bigpicture", label: "Full Picture", icon: "🗺️", color: "#1ABC9C" },
];

const STEPS = [
  // ============ INTRO ============
  {
    id: 0, section: "intro",
    phase: "WHAT IS SLACK",
    title: "Slack vs WhatsApp — The Key Differences",
    icon: "💼",
    color: "#E8B931",
    concepts: ["Workspaces", "Channels", "Multi-tenancy"],
    actors: ["Workspace", "Channels", "Users", "DMs"],
    simple: `You already understand WhatsApp design. Slack looks similar at first glance — both deliver messages in real-time, both have group chats. But they're actually solving different problems.

WhatsApp is built around USERS having conversations. You message people you know.

Slack is built around WORKSPACES (organizations) where TEAMS communicate. Your company "Acme Corp" is a workspace. Inside it, there are channels: #general, #engineering, #random. Different teams use different channels. The whole structure is hierarchical: Workspace → Channels → Messages.

This single difference changes EVERYTHING about the design — how you store data, how you handle search, how you isolate one company's data from another. Let me show you why.`,
    detail: `THREE FUNDAMENTAL DIFFERENCES FROM WHATSAPP:

1. CHANNEL MODEL (not 1-on-1):
   WhatsApp: User A messages User B. Direct.
   Slack: User A posts to #engineering channel → 50 people see it.
   
   Channels can have:
   — 5 members (your team standup)
   — 50 members (your engineering org)
   — 10,000 members (#announcements at a big company)
   — 100,000 members (Enterprise Grid all-hands)
   
   This creates the "variable fanout problem" — the same message might reach 5 people or 100,000. The system needs different strategies for different channel sizes.

2. WORKSPACE ISOLATION (multi-tenancy):
   WhatsApp: One global system. Anyone can message anyone.
   Slack: 500,000 separate workspaces, each completely isolated.
   
   "Acme Corp" workspace data must NEVER be visible to "Globex Corp" workspace, even though both run on the same Slack infrastructure. This is multi-tenancy — multiple "tenants" (companies) sharing infrastructure but with strict data isolation.
   
   This isn't just a feature — it's a legal and security requirement. Bug → company sees competitor's confidential data → lawsuit, lost contracts, business destroyed.

3. SEARCH IS A FIRST-CLASS FEATURE:
   WhatsApp: Search is basic. People scroll back through history.
   Slack: Search is critical. "Find the discussion about Q3 budget from last March."
   
   Slack users frequently search through MONTHS of message history across many channels. Search must be fast (seconds, not minutes) and accurate. This requires a separate search infrastructure (Elasticsearch) running alongside the main system.

THE SCALE:
   10 million daily active users
   500,000 workspaces (companies)
   Average workspace: 20 users (some are 10, some are 100,000+)
   500 million messages per day
   ~17,500 messages per second at peak
   
   Smaller scale than WhatsApp (which had 230,000/sec), but with COMPLEXITY in different places.

WHAT WE'RE BUILDING:
   1. Channels (public/private) and Direct Messages
   2. Threaded replies (so #general doesn't get cluttered)
   3. Search across the whole workspace
   4. Mentions and notifications (@user, @channel, @here)
   5. Presence (online/away/DND status)
   6. File sharing
   7. Strict workspace isolation

We'll build this incrementally, just like we did for WhatsApp.`,
    analogy: `🏢 WhatsApp is like personal phone calls. You call people you know directly.

Slack is like a corporate office building. The building (workspace) belongs to "Acme Corp." Inside, there are conference rooms (channels). #engineering is one room, #marketing is another. Conversations happen in rooms, not 1-on-1. The building security guard (workspace isolation) ensures employees from "Globex Corp" can never enter "Acme Corp's" building.

Now imagine 500,000 such buildings, all managed by the same property company (Slack), each completely isolated from the others. That's the engineering challenge.`
  },
  // ============ REAL-TIME MESSAGING ============
  {
    id: 1, section: "messaging",
    phase: "REAL-TIME",
    title: "Real-time Channel Messaging — Pub/Sub Pattern",
    icon: "💬",
    color: "#4A90D9",
    concepts: ["WebSocket", "Pub/Sub", "Channel Subscription", "Real-time Servers"],
    actors: ["User A", "Real-time Server", "Pub/Sub (Redis)", "Channel Members"],
    simple: `User A posts "Good morning!" to #general (50 members). All 50 members who are online should see it instantly. How?

In WhatsApp design, we used a Session Service to find each user's chat server, then forwarded the message directly. That works for 1-on-1.

For channels, we use a different pattern: PUB/SUB (Publish/Subscribe). Instead of looking up each member individually, the message is "published" to the channel's topic, and every server that has subscribers for that channel receives it automatically. Each server then pushes to its connected users.

It's like a radio broadcast — you don't call each listener individually; you broadcast on a frequency and everyone tuned in receives it.`,
    detail: `THE SETUP:

When User A connects to Slack via WebSocket, they connect to one of many Real-time Servers. Let's say Server 1.

When User A connects, the server does:
   1. Fetches User A's channels: [#general, #engineering, #random]
   2. SUBSCRIBES to Redis pub/sub topics: 
      — channel:general
      — channel:engineering
      — channel:random
   
   Now Server 1 is "listening" for any messages published to these channels.

Other users connect to other servers (Server 2, Server 3, ...). Each server subscribes to channels for its connected users. So #general's pub/sub topic might be subscribed to by 50 different servers (one per server holding at least one #general member).

THE MESSAGE FLOW:

User A types "Good morning!" in #general.

Step 1: User A's client sends message via WebSocket to Server 1.

Step 2: Server 1 calls Message Service: "save this message"
   Message Service writes to database.
   Returns a timestamp (ts) — this is the message's unique ID and ordering key.

Step 3: Server 1 PUBLISHES to Redis topic "channel:general":
   { ts: "1234567890.123456", user: "A", content: "Good morning!" }

Step 4: Redis broadcasts this to ALL servers subscribed to "channel:general":
   — Server 1 (User A is here, but doesn't need to see own message twice)
   — Server 2 (Users B and C are here)
   — Server 47 (User D is here)
   ...

Step 5: Each server pushes to its connected users via WebSocket:
   Server 2 → User B's WebSocket
   Server 2 → User C's WebSocket
   Server 47 → User D's WebSocket

Total time: 50-150ms from User A pressing Enter to all 50 users seeing the message.

WHY PUB/SUB INSTEAD OF DIRECT FORWARDING?

Imagine without pub/sub. Server 1 would need to:
   1. Look up all 50 channel members
   2. Look up where each member is connected (Server 2? Server 47?)
   3. Forward the message individually to each server
   
That's 50 lookups + 50 forwards. For #general with 50 members it works. For #announcements with 10,000 members? 10,000 lookups + 10,000 forwards from a single server. The sender's server becomes a bottleneck.

With pub/sub, the sender's server does ONE publish. Redis handles the broadcast. The "fanout" is distributed across the Redis infrastructure rather than concentrated at the sender.

THE KEY DATA STRUCTURE — THE SUBSCRIPTION MAP:

Each Real-time Server maintains:
   subscriptions = {
     "channel:general": [User_A_socket, User_B_socket, ...],
     "channel:engineering": [User_A_socket, User_E_socket],
     ...
   }

When a Redis pub/sub message arrives for "channel:general", the server looks up all the local sockets subscribed and pushes to them.

DYNAMIC SUBSCRIPTIONS:

When a user joins a channel, the server subscribes to that channel's topic.
When a user leaves a channel, the server unsubscribes (if no other connected user needs it).
When a user disconnects, the server removes them from all channels.

This is dynamic. The subscription list changes constantly as users connect, disconnect, and switch channels.`,
    analogy: `🎙️ Pub/Sub is like a radio station. The DJ (Slack server) broadcasts on frequency 91.5 FM (channel:general). Anyone tuned to 91.5 FM hears the broadcast — whether they're in their car, at home, or at the office. The DJ doesn't call each listener individually.

When you "join" a channel in Slack, your server tunes its radio to that frequency. When you "leave," it tunes out. The DJ never knows or cares who's listening — they just broadcast.

Compare this to making 50 individual phone calls (direct forwarding) — much slower and the caller becomes overwhelmed.`
  },
  {
    id: 2, section: "messaging",
    phase: "OFFLINE USERS",
    title: "Handling Offline Users in Channels",
    icon: "📭",
    color: "#9B59B6",
    concepts: ["Catch-up Pull", "Last Read Timestamp", "Unread Counts"],
    actors: ["Offline User", "Database", "Reconnect", "Unread Counter"],
    simple: `In WhatsApp, offline messages went into a per-user message queue (Kafka). When User B came back online, we delivered the queued messages.

Slack does it differently — and simpler. Channels already store every message in the database, sorted by timestamp. When User B comes online, the client tells the server: "the last message I read was timestamp 1234567890." The server queries the database: "give me everything in my channels newer than that timestamp." Done.

No queue per user. The database itself is the source of truth.`,
    detail: `THE LAST_READ_TS PATTERN:

Slack tracks what each user has read in each channel:

User Channel State Table:
   user_id | channel_id | last_read_ts          | mention_count | is_muted
   --------|------------|------------------------|---------------|----------
   user_B  | general    | 1234567890.000000      | 0             | false
   user_B  | engineering| 1234500000.000000      | 3             | false
   user_B  | random     | 1234450000.000000      | 0             | true

When User B is online and reading #general:
   — Each new message arrives via WebSocket
   — Client updates last_read_ts to the latest message they viewed
   — Server saves this to the database

When User B goes offline (laptop closed, app backgrounded):
   — last_read_ts is preserved

When User B comes back online (tomorrow morning):
   — Client connects to a Real-time Server
   — Client sends current state: "last_read_ts for general is 1234567890"
   — Server queries database:
     SELECT * FROM messages 
     WHERE channel_id = 'general' AND ts > '1234567890'
     ORDER BY ts ASC
     LIMIT 100
   — Returns all messages User B missed
   — Client displays them, marks as unread

WHY THIS IS BETTER THAN PER-USER QUEUES:

In WhatsApp, we needed per-user queues because messages flow point-to-point. Each user has their own pending messages.

In Slack, channels are SHARED. The same message exists once in #general, viewed by 50 people. If we had per-user queues, we'd duplicate every message 50 times — massive waste.

By querying the channel's history with a timestamp, every member uses the same source of truth (the channel's messages in the database). Only their last_read_ts differs.

UNREAD COUNTS:

To show "3 unread" badges efficiently, the system maintains:
   mention_count: how many @mentions for User B
   unread_count: derived from messages where ts > last_read_ts

Computing unread counts in real-time for many channels would be expensive. Slack uses a clever trick: the COUNT is computed lazily when the user opens the channel list, OR maintained as a counter that increments when messages arrive while the user is offline.

NOTIFICATION HANDLING:

Even though we don't queue messages per-user, we DO send push notifications for important events:
   — Direct mentions (@user)
   — DMs
   — Keyword alerts
   
This is a separate system (which we'll cover in the deep dive section). The push notification doesn't carry the message — it just wakes up the user's phone, and when the app opens, it does the catch-up pull.

EFFICIENT INDEXING:

The query SELECT * FROM messages WHERE channel_id = X AND ts > Y must be fast. The Messages table has an index on (channel_id, ts). With this composite index, the database can:
   1. Jump directly to channel_id = X (no scanning)
   2. Within that channel, jump to ts > Y (sorted, so this is a range scan)
   3. Return results in order

Even with billions of messages, this query runs in milliseconds.`,
    analogy: `📰 Imagine a workplace bulletin board. Anyone can post. Everyone shares the same board.

When you arrive Monday morning, you don't get a personal copy of every notice that was posted Friday-Sunday. You just walk to the bulletin board and read what's new. You remember that "I last checked it on Friday at 5 PM." Anything posted after that is new to you.

Compare to WhatsApp: messages are PRIVATE letters delivered to your mailbox. Your mailbox has a queue. Slack: messages are PUBLIC notices on a shared board. The board is the queue, viewed differently by different people based on when they last looked.

This shared-state model is more efficient when many people see the same content — exactly what channels are.`
  },
  // ============ FANOUT ============
  {
    id: 3, section: "fanout",
    phase: "PROBLEM",
    title: "The Large Channel Problem",
    icon: "📢",
    color: "#E74C3C",
    concepts: ["Variable Fanout", "Hot Partitions", "Pub/Sub Limits"],
    actors: ["10,000 Member Channel", "Single Server", "Bottleneck"],
    simple: `Pub/sub works beautifully for small channels (10-100 members). But Slack has channels with 10,000+ members — like #general at a big company. When the CEO posts an announcement, every employee should see it.

This is the LARGE CHANNEL PROBLEM. The pub/sub approach we just covered breaks down at scale. Let me show you why, then show you the fix.`,
    detail: `WHY SIMPLE PUB/SUB BREAKS AT SCALE:

Imagine #announcements has 10,000 members. They're scattered across 500 Real-time Servers (~20 members per server).

When the CEO posts a message:
   Server 1 publishes to "channel:announcements"
   Redis broadcasts to all 500 subscribed servers
   Each server pushes to its 20 connected members
   
Sounds fine? Let's look at the problems:

PROBLEM 1: REDIS BROADCAST OVERHEAD
   Redis has to deliver the message to 500 servers. Each delivery is a separate network operation. Redis does this fast, but it's not free.
   
   Now imagine 100 popular channels each with 10,000 members. If the CEO posts in 5 channels at once → 5 × 500 = 2500 broadcasts. Redis CPU starts spiking.

PROBLEM 2: WASTED DELIVERIES
   A server might only have 20 connected #announcements members. But it RECEIVES every message published to #announcements. If #announcements has 100 messages per minute, the server processes 100 incoming pub/sub events even though it only has 20 connections that care.
   
   With 100 such large channels active, servers are drowning in pub/sub messages, most of which are for "I have very few connected members in this channel."

PROBLEM 3: HOT PARTITION
   A few popular channels (#general, #announcements, #random) carry the majority of traffic. They're "hot." Every server is subscribed to them. Every server sees every message in them.
   
   Meanwhile, smaller channels (#design-team, #project-x) are cold — only a few servers care about them.
   
   Pub/sub doesn't scale uniformly — popular channels create "hot partitions" that limit total throughput.

PROBLEM 4: THE SENDER'S SERVER BOTTLENECK (in alternative designs)
   What if instead of pub/sub, we directly forward? The sender's server would need to:
   — Look up all 10,000 channel members
   — Group them by their connected server
   — Forward to each (let's say 500 different servers)
   
   That's 500 outgoing TCP connections from one server, all happening synchronously. The sender's server becomes a bottleneck. If 5 people post in #announcements at the same moment, that one server is overloaded.

BOTH approaches break: pub/sub overloads Redis, direct forwarding overloads the sender's server.

THE INSIGHT:

The fanout work is fundamental. For 10,000 recipients, SOMEONE has to deliver 10,000 times. The question is: WHO does the work, and HOW is it distributed?

The solution: tiered fanout. Small channels keep using pub/sub (it works fine for them). Large channels use a different path — a queue with worker processes that distribute the fanout across many machines.

This is a classic pattern in distributed systems: don't use ONE solution for ALL cases. Use the right tool for each scale.`,
    analogy: `📢 A small office has 30 employees. Announcements work via the intercom system — one person speaks, everyone hears. Simple.

A massive corporate campus has 10,000 employees across 50 buildings. The intercom system can't handle this — too much background noise, signal degradation, system overload.

For the campus, you need a different system: print 10,000 copies of the announcement, give them to a team of 50 runners, each runner delivers 200 copies to their assigned section. The work is distributed.

The same principle: small group → broadcast directly. Massive group → distribute the work.`
  },
  {
    id: 4, section: "fanout",
    phase: "SOLUTION",
    title: "Tiered Fanout Architecture",
    icon: "🎯",
    color: "#1ABC9C",
    concepts: ["Tiered Fanout", "Kafka Workers", "Hybrid Strategy"],
    actors: ["Message", "Kafka Topic", "Fanout Workers", "Real-time Servers"],
    simple: `The solution: TIERED FANOUT. We use different strategies based on channel size.

Small channels (<500 members): direct pub/sub. It works fine, low latency, no need for complexity.

Large channels (500+): queue-based fanout with workers. Slower but scales to any size without hot partitions.

The system inspects the channel size when a message is posted and routes through the appropriate path. Best of both worlds: low latency for the common case (small channels are 90%+ of traffic) and scalability for the edge cases (large channels with thousands of members).`,
    detail: `THE TIERED FANOUT FLOW:

When a message is posted, the system checks:
   IF channel.member_count < 500:
     → Direct pub/sub (Redis) — same as before
   ELSE:
     → Queue-based fanout (Kafka workers)

LET'S TRACE A LARGE CHANNEL MESSAGE:

User A posts in #announcements (10,000 members).

Step 1: PUBLISH TO KAFKA TOPIC
   Message Service writes the message to database (as always).
   Then publishes to Kafka topic: "fanout:large-channel:announcements"
   
   Kafka is durable — even if downstream fails, the message is safely queued.

Step 2: FANOUT WORKERS CONSUME
   We have a fleet of Fanout Worker processes (let's say 20 workers).
   Each worker is a Kafka consumer in a consumer group.
   Kafka distributes incoming messages across the workers.
   
   Worker 1 picks up our #announcements message.

Step 3: WORKER LOOKS UP MEMBERS
   Worker 1 queries: "Who are the members of #announcements?"
   Returns 10,000 user IDs.

Step 4: WORKER GROUPS BY SERVER
   For each user, Worker 1 looks up: "Which Real-time Server holds this user's connection?" (similar to WhatsApp's Session Service).
   
   Result: a map like:
   { Server_1: [user_1, user_5, user_9, ...], 
     Server_2: [user_2, user_3, ...], 
     ... }

Step 5: WORKER FORWARDS TO SERVERS
   Worker 1 sends ONE message per server (containing the list of recipients on that server).
   Each receiving server pushes to its connected users.
   
   Note: Worker 1 doesn't push directly to users — that's still the Real-time Servers' job. Worker 1 just orchestrates which servers need to know.

PARALLELISM:

If 5 large-channel messages arrive at the same moment:
   Worker 1 picks up message 1 for #announcements
   Worker 2 picks up message 2 for #engineering-all
   Worker 3 picks up message 3 for #general (different workspace)
   ...
   
   They process in parallel. Each takes a few seconds (looking up 10K members, grouping, forwarding). Total throughput: 5 × messages per worker per second.

FOR EVEN LARGER CHANNELS — SHARDED WORKERS:

What if a channel has 100,000 members? Even one worker doing all the lookups takes too long.

Solution: shard the work.
   Worker 1 handles members 1-25,000
   Worker 2 handles members 25,001-50,000
   Worker 3 handles members 50,001-75,000
   Worker 4 handles members 75,001-100,000
   
   Kafka topic with 4 partitions, 4 workers in the consumer group. Each gets 1/4 of the work.

WHY KAFKA INSTEAD OF REDIS PUB/SUB?

Redis pub/sub: fire-and-forget. If a subscriber is slow or down, messages are lost.
Kafka: durable queue. Messages persist until consumed. If Worker 1 crashes mid-fanout, another worker picks up where it left off.

For large channels with critical messages (CEO announcements, all-hands invites), durability matters. Kafka guarantees no message is lost during fanout.

THE TRADEOFF:

Latency: Kafka path adds 100-500ms vs direct pub/sub. For large channels, this is acceptable — when CEO posts in #announcements, employees seeing it 500ms later vs 50ms doesn't matter.

Reliability: Kafka path is more reliable. No lost messages if a worker crashes.

Throughput: Kafka path can handle any scale by adding more workers. Pub/sub is limited by Redis throughput.

THE THRESHOLD CHOICE:

Why 500? It's tunable. The right number depends on:
   — Your Redis capacity
   — Your typical channel size distribution
   — Your latency tolerance for large channels
   
500 is a reasonable default. If most channels are small (<100), pub/sub handles them with very low latency. The few large ones (>500) take the slower-but-scalable path.`,
    analogy: `📬 Small office: the boss walks down the hallway and announces in person. Direct, fast, works for 30 people.

Big corporation: the CEO writes one email, sends it to "Announcements Distribution List." A mail server (Kafka) holds it. A team of mail clerks (workers) split the work — Clerk 1 delivers to floors 1-10, Clerk 2 to floors 11-20, etc. Slower than the hallway shout (mail takes a few minutes vs instant), but it actually works at 10,000 people.

The genius: USE BOTH. Small teams keep the hallway shout (fast). Large announcements use the mail system (scales). The system picks the right method based on the audience size.`
  },
  // ============ SEARCH ============
  {
    id: 5, section: "search",
    phase: "SEARCH",
    title: "Search — Elasticsearch & Indexing Pipeline",
    icon: "🔍",
    color: "#50C878",
    concepts: ["Elasticsearch", "Search Index", "Indexing Pipeline", "Inverted Index"],
    actors: ["User Query", "Search Service", "Elasticsearch", "Indexing Pipeline"],
    simple: `Slack users search constantly: "Find that conversation about Q3 budget from March." Searching billions of messages must take seconds, not minutes.

Your main database (Vitess/MySQL) is great at "fetch messages by channel and timestamp" but TERRIBLE at "find messages containing the word 'budget'." For text search, you need a different tool: ELASTICSEARCH.

Elasticsearch is a search engine that builds a special data structure called an INVERTED INDEX. It maps every word to the messages containing it, enabling sub-second full-text search across billions of documents.`,
    detail: `THE PROBLEM WITH SQL FOR SEARCH:

If you ran this in PostgreSQL/MySQL:
   SELECT * FROM messages 
   WHERE content LIKE '%quarterly budget%'
   AND workspace_id = 'acme';

The database has to SCAN every single message in the workspace, checking each one for the substring. With millions of messages per workspace, this takes minutes. Unusable.

Even with PostgreSQL's full-text search features, it's slow at Slack's scale. You need a tool built specifically for text search.

ELASTICSEARCH AND THE INVERTED INDEX:

A normal database index (B+ tree) maps:
   key → row location
   "1234" → message at offset X

An inverted index maps:
   word → list of documents containing that word
   "budget" → [msg_001, msg_847, msg_2134, msg_5829, ...]
   "quarterly" → [msg_002, msg_847, msg_2134, ...]

When you search "quarterly budget":
   1. Look up "quarterly" → list A
   2. Look up "budget" → list B
   3. INTERSECT A and B → messages containing BOTH words
   4. Rank by relevance, return top results

This intersection happens in milliseconds even on billions of documents. Elasticsearch is built around this.

THE INDEXING PIPELINE:

Elasticsearch can't search a message that hasn't been indexed. So we need to INDEX every new message. But indexing is expensive (computing terms, updating the index). Doing it synchronously would slow down message sending.

Solution: ASYNCHRONOUS INDEXING via Kafka.

Step 1: Message is sent
   User A posts in #engineering.
   Message Service writes to main database (fast).
   Returns success to User A. They see their message.

Step 2: Message is also published to Kafka
   Topic: "messages-to-index"
   This happens in parallel with the database write.
   The user doesn't wait for indexing.

Step 3: Indexing Pipeline consumes from Kafka
   A separate fleet of workers reads from "messages-to-index".
   For each message:
     — Tokenize the content (split into words, normalize)
     — Add metadata (workspace_id, channel_id, user_id, timestamp)
     — Write to Elasticsearch
   
   This happens "eventually" — usually within 1-5 seconds of the message being sent.

WHY ASYNC?
   — Doesn't block the message send path
   — Indexing can be slow (a few hundred ms per message) without affecting users
   — If indexing fails temporarily, messages aren't lost — they wait in Kafka
   — Indexing pipeline can be scaled independently

USER EXPERIENCE:
   — Send message → instantly visible in channel ✓
   — Search for that message → available 1-5 seconds later ✓
   
   For Slack's use case, this is fine. People search OLD messages (days/weeks/months ago), not what they typed 1 second ago.

THE SEARCH FLOW:

User searches "quarterly budget from:@john in:#finance"

Step 1: Search Service parses the query
   Free text: "quarterly budget"
   Filter: user_id = john's_id
   Filter: channel_id = finance_id
   Filter: workspace_id = current_workspace (always added for isolation)

Step 2: Access control check
   Is user a member of #finance? 
   Does user have permission to search this workspace?
   Build the list of channels user can access.

Step 3: Build Elasticsearch query
   {
     query: { match: "quarterly budget" },
     filter: [
       { term: { workspace_id: "acme" } },
       { term: { user_id: "john" } },
       { term: { channel_id: "finance" } }
     ]
   }

Step 4: Execute against Elasticsearch
   Returns top 20 most relevant messages.
   Highlights matching terms.

Step 5: Return to client
   With message snippets, links to jump to the conversation.

MULTI-TENANCY IN SEARCH:

Critical: User from Workspace A must NEVER see results from Workspace B. Slack uses two layers of defense:

LAYER 1: Application-level filtering
   Every search query MUST include workspace_id filter.
   If a developer forgets, the application enforces it.

LAYER 2: Index-level isolation (or shared index with strict filtering)
   Approach A: One Elasticsearch index per workspace. Strong isolation but inefficient for small workspaces.
   Approach B: Shared index with workspace_id field. More efficient. ALL queries must filter on workspace_id (enforced at the application gateway).

Slack uses Approach B (shared index) because they have 500,000 workspaces — having 500,000 indexes is unmanageable.

INDEX SIZE:

Elasticsearch indexes typically take 50-100% of the raw data size.
36 TB/year of messages → 18-36 TB of search index per year.
This is split across many Elasticsearch nodes, sharded by workspace.

WHEN MESSAGES ARE EDITED OR DELETED:

When a user edits a message:
   — Update main database
   — Publish "message updated" event to Kafka
   — Indexing pipeline updates Elasticsearch

When a user deletes:
   — Same flow, but DELETE from Elasticsearch

These updates also happen async, taking 1-5 seconds to propagate to search.`,
    analogy: `📚 Imagine a library with 10 million books. Someone asks: "Find books mentioning 'photosynthesis'."

Without an index: walk through every book, page by page, checking each. Take a year.

With an inverted index (the library's catalog): a master card file where every word ever used in any book is listed alphabetically, with all the books containing that word. "Photosynthesis" → cards point to 8,432 books. Instantly retrievable.

Elasticsearch IS this catalog system, automated for billions of documents. The "indexing pipeline" is the librarian quietly updating the catalog every time a new book arrives, never blocking the readers from doing their thing.`
  },
  // ============ THREADS ============
  {
    id: 6, section: "threads",
    phase: "THREADS",
    title: "Threaded Replies — Without Cluttering the Channel",
    icon: "🧵",
    color: "#9B59B6",
    concepts: ["Thread", "Parent Message", "thread_ts", "Reply Count"],
    actors: ["Parent Message", "Thread Replies", "Channel View", "Thread View"],
    simple: `In #engineering with 200 members, someone asks: "Anyone know how to fix this bug?" Without threads, the next 50 replies clutter the main channel — everyone else's conversations get drowned out.

Slack solves this with THREADS. Replies to a specific message form a sub-conversation that doesn't appear in the main channel timeline. The parent message just shows "20 replies" with the avatars of who replied. Clicking it opens the thread view.

How is this implemented at the data level? Surprisingly simple — just one extra column on the messages table.`,
    detail: `THE THREAD DATA MODEL:

The Messages table has a column called thread_ts:

For a regular message (or thread parent):
   thread_ts = NULL

For a thread reply:
   thread_ts = the timestamp of the PARENT message

Example state of #general:

   message_id | ts          | thread_ts   | content
   -----------|-------------|-------------|---------------------------
   msg_001    | 1001.0      | NULL        | "Hi team!"
   msg_002    | 1002.0      | NULL        | "Anyone know how to fix the deploy bug?"
   msg_003    | 1003.0      | 1002.0      | "I think it's the env variable"
   msg_004    | 1004.0      | 1002.0      | "Yes! Just confirmed"
   msg_005    | 1005.0      | 1002.0      | "Thanks! Working now"
   msg_006    | 1006.0      | NULL        | "Lunch in 5 min"

Notice:
   — msg_002 is a thread parent. thread_ts is NULL (it's not a reply).
   — msg_003, msg_004, msg_005 are replies to msg_002. Their thread_ts = 1002.0
   — msg_006 is a regular channel message (not in any thread).

QUERYING:

Query 1: "Show #general's main timeline (no threads)":
   SELECT * FROM messages 
   WHERE channel_id = 'general' AND thread_ts IS NULL
   ORDER BY ts;
   
   Returns: msg_001, msg_002, msg_006
   The replies (msg_003-005) are hidden from the main view.

Query 2: "Show the thread for msg_002":
   SELECT * FROM messages
   WHERE channel_id = 'general' AND thread_ts = '1002.0'
   ORDER BY ts;
   
   Returns: msg_003, msg_004, msg_005
   The parent (msg_002) plus all its replies.

Query 3: "How many replies does msg_002 have?"
   In a normalized world: SELECT COUNT(*) FROM messages WHERE thread_ts = '1002.0'
   But COUNT queries are slow at scale.
   
   SOLUTION: denormalize. Add a reply_count column to messages.
   When a reply is posted, increment the parent's reply_count.

THE INDEX YOU NEED:

Composite index on (channel_id, thread_ts, ts):
   — channel_id filters to one channel
   — thread_ts filters to a specific thread (or NULL for main timeline)
   — ts orders the results

This makes both queries (main timeline and thread view) fast.

THREAD POSTING FLOW:

User C replies to msg_002 in the thread.

Step 1: Client sends:
   { channel_id: 'general', content: "Yes! Just confirmed", thread_ts: '1002.0' }

Step 2: Message Service stores the reply
   INSERT INTO messages (channel_id, ts, thread_ts, content, ...)

Step 3: Increment parent's reply_count
   UPDATE messages SET reply_count = reply_count + 1 WHERE ts = '1002.0'
   (Done in same transaction as the insert.)

Step 4: NOTIFICATION FANOUT — but smarter
   This is the clever part. We DON'T notify the entire channel. We notify:
     — The original poster (msg_002 author)
     — Anyone who has previously replied to this thread
     — Anyone @mentioned in the new reply
     — Anyone who explicitly "follows" the thread
   
   For #general's other 195 members? They just see the parent message's reply count tick up. No notification, no main channel disruption.

WHY THIS DESIGN IS BRILLIANT:

The whole thread feature requires:
   — One additional column (thread_ts)
   — One additional counter column (reply_count)
   — One composite index
   — Smart notification rules

That's it. No separate threads table. No separate fanout system. The same messages table holds everything. The thread_ts column elegantly creates a hierarchical structure within a flat table.

This is good database design — minimal schema changes, maximal flexibility.

UI BEHAVIOR:

In the channel view, you see:
   ┌─────────────────────────────────────┐
   │ Alice: Anyone know how to fix...    │
   │ 👤👤👤 3 replies · last 2 min ago    │
   └─────────────────────────────────────┘

Clicking opens the thread side panel:
   ┌─────────────────────────────────────┐
   │ Alice: Anyone know how to fix...    │
   ├─────────────────────────────────────┤
   │ Bob: I think it's the env variable  │
   │ Carol: Yes! Just confirmed          │
   │ Dave: Thanks! Working now           │
   ├─────────────────────────────────────┤
   │ [Reply in thread...]                │
   └─────────────────────────────────────┘

Two views, one underlying data structure.`,
    analogy: `📌 Imagine a corkboard in the office break room. People pin notices to it.

Without threads: when someone asks "Anyone got a meeting room key?" the next 20 people pin replies right next to it, pushing all OTHER notices off the board. The board becomes useless.

With threads: you ask the question by pinning a notice. People respond by stapling sticky notes ON your notice. The board only shows the original notices. To see the conversation, you walk up to a notice and read its sticky notes.

In data terms: the corkboard = main channel timeline (only shows messages with thread_ts IS NULL). The sticky notes = thread replies (have thread_ts = parent's id). One physical structure, two viewing modes.`
  },
  // ============ DEEP DIVE ============
  {
    id: 7, section: "deepdive",
    phase: "PRESENCE",
    title: "Presence System — Online/Away/DND",
    icon: "🟢",
    color: "#50C878",
    concepts: ["Heartbeats", "TTL", "Lazy Presence", "Workspace Scope"],
    actors: ["Client", "Heartbeat", "Redis", "Subscribers"],
    simple: `That little green dot showing colleagues are online — surprisingly hard to build at scale. The naive approach broadcasts every status change to all your contacts. With 10,000 users in a workspace, each status change = 10,000 notifications. Multiplied by frequent changes (people coming and going) = millions of broadcasts per second. Unsustainable.

Slack uses a smarter approach: HEARTBEATS + LAZY QUERIES. Clients send heartbeats every 30 seconds. Status is stored in Redis with an automatic expiration. Other users only QUERY presence when they need it (when viewing a channel/DM), not via constant broadcasts.`,
    detail: `THE STATES:

   ACTIVE 🟢: User is connected AND interacting (recent click/typing)
   AWAY ⚪: User is connected but idle (no interaction in 10+ min)
   DND 💤: User explicitly enabled "Do Not Disturb"
   OFFLINE ⚫: No active connection

THE HEARTBEAT MECHANISM:

Every 30 seconds, the connected client sends a heartbeat over WebSocket:
   { type: "heartbeat", interaction_recent: true }
   
The "interaction_recent" flag is true if user has clicked, typed, or scrolled in the last few minutes.

The Real-time Server receives the heartbeat:
   IF interaction_recent: 
     SET presence:user_123 = "active" (TTL: 60 seconds)
   ELSE:
     SET presence:user_123 = "away" (TTL: 60 seconds)

The TTL (Time To Live) is the magic. If heartbeats stop coming (user closed app, lost connection, phone died), the Redis key expires automatically after 60 seconds. No explicit "user went offline" message needed — silence becomes offline status.

WHY 60s TTL FOR 30s HEARTBEATS?
   — Allow one missed heartbeat (network blip) without falsely marking offline
   — Two missed = ~60 seconds of silence → user is genuinely offline

LAZY PRESENCE QUERIES:

When User B wants to know if User A is online, the client doesn't subscribe to a continuous stream. It just queries:
   GET presence:user_a → "active"

When User B opens a DM with User A, the client requests presence at that moment. While the DM is open, the client subscribes to changes (in case A goes offline mid-conversation). When B closes the DM, unsubscribe.

This drastically reduces traffic. We only track presence for users you're ACTIVELY VIEWING.

OPTIMIZATIONS FOR FANOUT:

When User A's status DOES change, only people viewing A's profile/DM at that moment need to know. Not all of A's contacts.

The smart implementation uses Redis Pub/Sub for these specific subscribers:
   — User A goes offline → publish "presence:user_a" change event
   — Only the few users currently subscribed receive it
   — Their UI updates in real-time
   — Everyone else sees A as "active" until they next query (which will return "offline")

This eventual consistency is acceptable. If you don't have a chat with User A open, does it matter that you see them as "active" for 30 more seconds before discovering they're offline? No. When you open the chat, you'll see the truth.

WORKSPACE-SCOPED PRESENCE:

A user can be in multiple workspaces. Their presence is per-workspace.
   user_id "rahul" in workspace "acme" → active
   user_id "rahul" in workspace "personal-project" → away
   user_id "rahul" in workspace "freelance-client" → offline

Why? Maybe Rahul is actively working in his Acme tab but his personal-project tab is in the background. Different presence per workspace makes sense.

The Redis key includes workspace:
   presence:workspace_acme:user_rahul = "active"

LAST SEEN TIMESTAMP:

For offline users, Slack shows "last seen 2 hours ago." This requires storing the last activity timestamp:
   last_seen:user_rahul = 1234567890

Updated on every heartbeat with interaction_recent=true. When queried for an offline user, return this timestamp and the client formats it as relative time.

THE 4 MILLION CONNECTIONS PROBLEM:

At peak, Slack has ~4 million concurrent connections sending heartbeats every 30 seconds = 130,000 heartbeats per second hitting the system.

Solution: 
   — Heartbeats only update Redis (fast, in-memory)
   — Don't write to main database on every heartbeat
   — Aggregate "last seen" updates and batch-write to DB every minute
   — This reduces DB load by 30x while keeping presence near-real-time

PRESENCE PREFERENCES:

Users can hide their presence. If a user enables "Don't show my activity":
   — Their actual presence is still tracked (Slack needs it for notifications)
   — But when others query, return "(unavailable)"
   — Privacy without complex logic

DO NOT DISTURB:

DND is different from Away. DND is explicitly chosen ("don't notify me from 9 PM to 8 AM").
   — Stored separately: dnd:user_rahul = { enabled: true, until: "2024-01-15 08:00" }
   — Notifications are suppressed during DND
   — Other users see DND icon but can still send messages (delivered, just no push)`,
    analogy: `🚪 Imagine a co-working office with name tags on each door. When you arrive, you flip your tag to "IN." When you leave, you flip to "OUT."

But this requires you to actively flip the tag. Slack's heartbeat is automatic — every 30 seconds, the system asks "is the door still showing IN?" If you forget to flip back to OUT (closed laptop without going to "Offline"), the system notices the question goes unanswered for 60+ seconds and assumes you've left, automatically updating to OUT.

Lazy presence: instead of broadcasting "Rahul flipped his tag!" to all 200 colleagues, the system just leaves the tag on the door. People who care walk by and check. Quieter, more efficient. Privacy-friendly too — only colleagues who NEED to know your status look it up.`
  },
  {
    id: 8, section: "deepdive",
    phase: "MULTI-TENANCY",
    title: "Workspace Isolation — The Multi-Tenant Challenge",
    icon: "🔒",
    color: "#E74C3C",
    concepts: ["Multi-tenancy", "Workspace Isolation", "Sharding", "JWT Claims"],
    actors: ["Workspace A", "Workspace B", "Database Shards", "Auth Layer"],
    simple: `Slack hosts 500,000 workspaces (companies) on shared infrastructure. The cardinal rule: a user from "Acme Corp" must NEVER see "Globex Corp" data. Not by accident, not from a bug, never.

This isn't just a feature. It's a legal and trust requirement. A bug here ends companies.

Slack uses MULTIPLE LAYERS of isolation: at the database level (sharding), application level (every query carries workspace_id), and authentication level (JWT tokens enforce workspace context). Defense in depth — even if one layer fails, others protect against data leaks.`,
    detail: `THE THREAT MODEL:

What we're protecting against:
   1. Code bugs — developer forgets to filter by workspace_id
   2. SQL injection — attacker tries to query other workspaces
   3. Privilege escalation — user gains admin access in their workspace, tries to expand
   4. Misconfigured caching — Workspace A's data cached against Workspace B's key
   5. Cross-tenant timing attacks — measuring response times to infer other workspaces' data

Each requires its own defense.

LAYER 1: AUTHENTICATION

When a user logs into "Acme Corp" workspace:
   — JWT token is issued with workspace_id claim
   — Token: { user_id: "rahul", workspace_id: "acme", role: "member", exp: ... }
   — All API requests include this token
   — Backend validates: workspace_id in token must match workspace_id in URL/request

If a request has workspace_id=globex but the token says acme → 403 Forbidden.

This means even if a Acme user gets the URL of a Globex resource, their token won't work.

LAYER 2: APPLICATION LAYER

Every service is workspace-aware. Every query, every operation includes workspace_id:
   — Get messages: WHERE workspace_id = ? AND channel_id = ?
   — Search: filter on workspace_id always
   — Channel membership: check user is in workspace_id
   
The application gateway can ENFORCE this — reject any internal query that doesn't include workspace_id.

Code example (pseudo):
   def get_messages(workspace_id, channel_id, user):
     assert user.workspace_id == workspace_id, "Unauthorized"
     return db.query("SELECT * FROM messages WHERE workspace_id=? AND channel_id=?", workspace_id, channel_id)

The assert is a sanity check. If this assertion ever fails in production, an alert fires immediately — it means there's a security bug being exploited.

LAYER 3: DATABASE LAYER (SHARDING)

The Messages table is SHARDED by workspace_id. This means:
   — Workspace "acme" data lives on Shard 1
   — Workspace "globex" data lives on Shard 7
   — Different physical databases entirely
   
A query for workspace "acme" goes to Shard 1. Even if a hacker somehow injects a query to read workspace "globex" while in shard 1's connection, the data ISN'T THERE. Shard 1 doesn't have globex's messages.

This is physical isolation as a defense layer. It's the strongest form — the data isn't even on the machine being queried.

SHARDING STRATEGY:

   shard_id = hash(workspace_id) % num_shards

   Workspace "acme" → hash → 5 → goes to Shard 5
   Workspace "globex" → hash → 12 → goes to Shard 12
   Workspace "small-startup" → hash → 5 → also goes to Shard 5 (with acme)

Multiple workspaces share a shard, but they're isolated from each other by the application layer (workspace_id filter on every query).

WHY VITESS / COCKROACHDB:

These are sharded relational databases. They handle the sharding logic for you:
   — Application sends query with workspace_id
   — Vitess routes to the right shard
   — Shard returns results
   — Application doesn't know or care about sharding details

This abstraction means developers write normal SQL, and the sharding is invisible.

LAYER 4: SEARCH ISOLATION

Elasticsearch shared index (the recommended approach):
   — Every document has workspace_id field
   — Every search query MUST include workspace_id filter
   — Application gateway enforces this

Defense: even if a developer writes a buggy search query without workspace_id, the gateway adds it before the query reaches Elasticsearch.

LAYER 5: CACHING ISOLATION

When you cache, the cache key MUST include workspace_id:
   ❌ BAD:  cache.get("user_profile_rahul")  → Could return wrong workspace's Rahul!
   ✅ GOOD: cache.get("workspace_acme:user_profile_rahul")

Different workspaces might have users with similar names/IDs. The cache key prevents cross-tenant pollution.

USERS IN MULTIPLE WORKSPACES:

A user can be in multiple workspaces. Slack handles this elegantly:
   — Global user identity (email-based)
   — Workspace-specific user_id (different in each workspace)
   — Workspace-specific profile (display name, avatar, status)
   — Workspace-specific permissions
   
Rahul in Acme: user_id "u_acme_123", display name "Rahul Kumar"
Rahul in Globex: user_id "u_globex_456", display name "Rahul"
   
They're the SAME PERSON (same email) but treated as different entities in each workspace. Each workspace's data references that workspace's user_id.

When Rahul switches workspaces:
   — Frontend gets a NEW JWT for the new workspace
   — Old workspace context is dropped
   — All queries now use the new workspace's context

This means switching workspaces is essentially "logging out and into a different account."

WHY ALL THESE LAYERS?

Defense in depth. If only the application layer enforced isolation:
   — One bug in code → cross-tenant data leak
   — One missed test case → breach
   — Catastrophic single point of failure

With multiple layers:
   — Application bug → caught by JWT validation
   — JWT bypass → caught by sharding (data isn't on that shard)
   — Sharding miscalculation → caught by application-layer filter
   
A breach requires bugs at MULTIPLE layers simultaneously. Statistically near-impossible.

This is why enterprise SaaS like Slack, Salesforce, Workday can claim compliance with strict regulations (SOC 2, HIPAA, GDPR). Their architecture has multiple audit-able isolation boundaries.`,
    analogy: `🏢 Imagine a 100-story skyscraper housing 500 different companies.

Layer 1 (Authentication): At the lobby, your badge says "Acme Corp, Floor 23." You can only enter if your badge matches the destination floor.

Layer 2 (Application): At every elevator, a guard checks your badge against the floor you pressed. Mismatch = doors don't open.

Layer 3 (Database/Sharding): Acme Corp's offices are PHYSICALLY on different floors than Globex Corp's. Even if you somehow get past lobbies and elevator guards, you'd be in the wrong building entirely.

Layer 4 (Search): Each company's filing cabinets are locked. Only that company's keys open them.

Layer 5 (Caching): The mailroom has separate slots for each company. Mail for Acme can never end up in Globex's slot because the slots are labeled and physically separated.

A spy trying to access Globex's data has to defeat ALL layers simultaneously. Lobby badge AND elevator guard AND get to the right physical floor AND have the right keys AND the mailroom labels AND... not happening.

That's defense in depth. Slack uses exactly this architecture.`
  },
  {
    id: 9, section: "deepdive",
    phase: "NOTIFICATIONS",
    title: "Notification System — Smart, Not Loud",
    icon: "🔔",
    color: "#F39C12",
    concepts: ["Mention Resolver", "DND", "Push Notifications", "Notification Rules"],
    actors: ["Message", "Notification Processor", "Mention Rules", "APNs/FCM"],
    simple: `In WhatsApp, every message → notification. Simple.

In Slack, NOT every message generates a notification. If every message in #general (50 people, hundreds of messages/day) sent push notifications, your phone would explode. The notification system has to be smart.

The rule: notifications are for ATTENTION, not awareness. You see all messages in the app. Notifications interrupt your day. They should only happen for things that MATTER to you specifically: someone @mentioned you, a DM, a keyword you care about.`,
    detail: `THE NOTIFICATION RULES:

   Event                    | Who Gets Notified
   -------------------------|-------------------------
   DM message               | All DM participants
   @user mention            | Just the mentioned user
   @channel mention         | All channel members
   @here mention            | Online channel members only
   Keyword match            | Users who configured that keyword
   Regular channel message  | Nobody (badge update only)
   Thread reply             | Thread participants + mentioned users

Most messages don't trigger notifications! They just update unread badges in the sidebar. The user sees them when they open the app, but isn't actively interrupted.

THE NOTIFICATION FLOW:

User A posts in #engineering: "@bob can you review the PR? Also @here, important release tomorrow"

Step 1: Message Service stores the message (as always).

Step 2: Message published to Kafka topic "notifications-to-process"

Step 3: Notification Processor consumes the event
   — Parses content for mentions: @bob, @here
   — Looks up bob's user_id
   — Identifies @here means "online channel members"
   — Checks each user's notification preferences

Step 4: For each potential recipient, applies rules:
   For Bob:
     — Is Bob in DND mode? Check.
     — Is #engineering muted by Bob? Check.
     — Bob has notifications enabled for @mentions? Yes.
     → Send notification to Bob.
   
   For Carol (channel member, online):
     — @here applies (she's online)
     — Is she in DND? No.
     — Is #engineering muted? No.
     — Notifications enabled for @here? Yes.
     → Send notification to Carol.
   
   For Dave (channel member, offline):
     — @here applies only to online users.
     — Dave is offline, so @here doesn't notify him.
     → No notification.
   
   For Eve (channel member, offline, with @mention preferences "always"):
     — Was she @mentioned? No (only @bob was named).
     — @here didn't apply (she's offline).
     → No notification. She'll see the message when she comes back online (badge will indicate unread).

Step 5: For users to notify, deliver via:
   — If user is online with active WebSocket: in-app notification
   — If user is offline or backgrounded: push notification (APNs for iOS, FCM for Android)

NOTIFICATION PREFERENCES:

Users have granular control:
   — Global: All / DMs only / Mentions only / Nothing
   — Per-channel: Override global setting (mute a noisy channel)
   — DND hours: 9 PM - 8 AM
   — Keywords: "release", "deploy", "incident" → notify on these words anywhere
   — Thread following: notify me on any reply to this specific thread

The notification processor checks ALL these before sending. Each check is fast (in-memory or Redis lookups) but the COMBINATION can be complex.

PUSH NOTIFICATION INFRASTRUCTURE:

For mobile push:
   — APNs (Apple Push Notification Service) for iOS
   — FCM (Firebase Cloud Messaging) for Android
   
Slack's notification service:
   1. Determines who to notify
   2. For each, looks up their device tokens (each phone has a unique APNs/FCM token)
   3. Constructs the notification payload (title, body, badge count, sound)
   4. Sends to APNs/FCM
   5. Apple/Google's servers deliver to the actual phones

If a user has multiple devices (phone + iPad + work phone), all their device tokens are stored, and notifications are sent to all of them.

DEDUPLICATION:

A user might have Slack open on web AND have their phone in pocket. We don't want to notify them twice for the same mention.

Strategy:
   — When user is "actively using web client" (recent interaction), don't send mobile push
   — They'll see the in-app notification, no need for redundant phone buzz
   
This requires the notification service to know presence + activity. Hence the close coupling between presence system and notification system.

QUIET FAILURE MODES:

What if APNs is temporarily down? Slack still:
   — Stored the message in DB
   — Updated unread badges
   — Showed in-app notification on web/desktop
   
Push notifications are an ENHANCEMENT to the system, not a critical path. The system degrades gracefully — you just won't get a mobile buzz, but everything else works.

NOTIFICATION SCALE:

500M messages/day → maybe 10% trigger notifications (most are channel messages with no @mentions) → 50M notifications/day → ~600 per second peak.

Smaller scale than messages, but still requires its own dedicated infrastructure (the Notification Processor fleet) to handle without slowing down message delivery.`,
    analogy: `📬 Imagine an office with two communication systems:

The bulletin board (channels) — anyone can post anything. You glance at it during breaks. Most posts don't require your attention; you'll catch up later.

The intercom (notifications) — only used for things that need your attention RIGHT NOW. "Rahul, you have a visitor at reception." "All hands meeting in 5 minutes."

If everything went over the intercom, you'd never get work done. The system smartly distinguishes:
   — Bulletin board: see when convenient, no interruption (regular messages)
   — Intercom: interrupts you (mentions, DMs, urgent keywords)

Slack's notification system is the intercom — selective, contextual, respectful of your attention. The unread badge in the sidebar is the bulletin board catching your eye when you're already looking.`
  },
  // ============ BIG PICTURE ============
  {
    id: 10, section: "bigpicture",
    phase: "FULL PICTURE",
    title: "Everything Connected — Complete Slack Architecture",
    icon: "🗺️",
    color: "#1ABC9C",
    concepts: ["Complete Architecture", "All Components", "Real-world Flow"],
    actors: ["User", "Real-time Servers", "Services", "Data Layer", "Async Processing"],
    simple: `Let's zoom out. Here's everything we've built, working together. We'll trace one realistic scenario: a user named Sarah at Acme Corp posts in #engineering at 9 AM, mentioning her teammate.`,
    detail: `THE COMPLETE ARCHITECTURE LAYERS:

EDGE LAYER:
   — Load Balancer (sticky sessions for WebSocket persistence)
   — API Gateway (auth, rate limiting, routing)

REAL-TIME LAYER:
   — Real-time Servers (1000+ servers, each holding ~50K WebSocket connections)
   — Manage subscriptions to Redis channel topics

APPLICATION SERVICES:
   — Message Service (persistence, retrieval)
   — Channel Service (membership, permissions)
   — User Service (profiles, preferences)
   — Search Service (Elasticsearch queries with workspace filtering)
   — Notification Service (mention resolution, push)

ASYNC PROCESSING:
   — Kafka (message queues for fanout, indexing, notifications)
   — Fanout Workers (large channel distribution)
   — Indexing Pipeline (Elasticsearch updates)

DATA LAYER:
   — Vitess/CockroachDB (sharded by workspace_id, primary message storage)
   — Redis (pub/sub for small channels, presence, caching)
   — Elasticsearch (search index, sharded)
   — S3 (file storage)

━━━ THE COMPLETE FLOW: SARAH'S MESSAGE ━━━

9:00 AM. Sarah opens Slack on her laptop.

PHASE 1: CONNECTION
   1. Browser establishes WebSocket connection
   2. Load Balancer (consistent hash on user_id) → routes to Real-time Server 47
   3. Server 47 receives Sarah's JWT, validates: workspace=acme, user_id=sarah
   4. Server fetches Sarah's channel memberships: [#general, #engineering, #design, DM with Mike]
   5. Server subscribes to Redis topics:
      channel:acme:general
      channel:acme:engineering
      channel:acme:design
      dm:acme:mike-sarah
   6. Server registers in Session Service: "sarah is on Server 47"
   7. Sarah's UI loads with unread counts and last 50 messages per channel

PHASE 2: SARAH POSTS IN #ENGINEERING
   Sarah types: "Hey @bob, can you review my PR? It's blocking the release."
   
   1. Client sends WebSocket message:
      { channel_id: 'engineering', content: '...', mentions: ['bob'] }
   
   2. Server 47 forwards to Message Service
   
   3. Message Service:
      - Validates Sarah is a member of #engineering ✓
      - Generates server timestamp ts = "1234567890.123456"
      - INSERTs into messages table (sharded on workspace_id=acme):
        INSERT INTO messages (workspace_id, channel_id, ts, user_id, content, ...)
      - Returns success with ts
   
   4. Server 47 publishes to Kafka topic "messages":
      { workspace: 'acme', channel: 'engineering', ts: '...', content: '...', mentions: ['bob'] }
      (This is for downstream services)
   
   5. Server 47 also publishes to Redis pub/sub:
      "channel:acme:engineering" → broadcast to all subscribed servers
   
   6. All servers with #engineering members receive it (let's say 30 servers):
      - Server 47 (Sarah is here, plus 5 others) — pushes to those users
      - Server 12 (Bob is here, plus 3 others) — pushes to those users
      - Server 89 (8 other members) — pushes
      - ... etc
   
   7. All online channel members see the message in their UI within 100ms.

PHASE 3: ASYNC PROCESSING (parallel to above)
   The Kafka message gets consumed by multiple services:
   
   A) Notification Processor consumes:
      - Parses content, finds mention of @bob
      - Looks up bob's user info
      - Checks bob's preferences: notifications on for @mentions ✓
      - Bob is currently online (Server 12) → in-app notification
      - Bob's mobile is also active → also send push notification
      - Sends to APNs/FCM with Bob's device token
      - Bob's iPhone buzzes within 1-2 seconds
   
   B) Indexing Pipeline consumes:
      - Tokenizes content: ["hey", "bob", "review", "pr", "blocking", "release"]
      - Adds metadata: workspace_id=acme, channel=engineering, user=sarah, ts=...
      - Writes to Elasticsearch
      - Now searchable within 1-3 seconds
   
   C) Analytics Pipeline consumes:
      - Updates message count metrics
      - Updates channel activity stats
      - Updates user engagement metrics
      - Feeds dashboards for Slack's analytics product

PHASE 4: BOB RESPONDS IN A THREAD
   Bob sees the notification, opens Slack, reads Sarah's message.
   
   Bob clicks "Reply in thread" and types: "On it, give me 10 min."
   
   1. Client sends:
      { channel_id: 'engineering', content: '...', thread_ts: '1234567890.123456' }
   
   2. Message Service stores the reply with thread_ts pointing to Sarah's message
   3. Increments parent message's reply_count
   4. Publishes to Kafka
   5. Notification Processor identifies thread participants:
      - Sarah (original poster) → notify
      - Anyone else who replied? No one yet.
      → Only Sarah gets notified
   6. The 200 other #engineering members? Just see "1 reply" appear on Sarah's message. No notification.

PHASE 5: SEARCH LATER
   At 3 PM, Sarah remembers she discussed something with Mike about deployment.
   She types in search: "deployment from:@mike"
   
   1. Search Service receives query
   2. Validates: Sarah belongs to workspace acme, has access to channels
   3. Builds Elasticsearch query:
      query: "deployment"
      filter: workspace_id=acme AND user_id=mike AND channel_id IN [sarah's accessible channels]
   4. Elasticsearch returns 12 matches in 80ms
   5. Sarah sees results, clicks one, jumps to that channel and timestamp
   6. Channel view loads, scrolls to that message

PHASE 6: SARAH GOES OFFLINE
   6 PM, Sarah closes laptop.
   
   1. WebSocket closes (graceful or sudden)
   2. Server 47 detects disconnect
   3. Server unsubscribes Redis topics for Sarah's channels (if no other connected user needs them)
   4. Removes Sarah from Session Service: presence:sarah TTL expires in 60s
   5. Updates last_seen timestamp in DB
   6. Other users querying Sarah's presence will get "offline, last seen 2 minutes ago" after the TTL expires

PHASE 7: NEXT MORNING
   Sarah opens Slack at 9 AM next day.
   
   1. Connection re-established (Step 1-7 of Phase 1)
   2. Server fetches: "messages newer than Sarah's last_read_ts in each channel"
   3. Returns messages from overnight in #engineering, #general, etc.
   4. Sarah sees badges: "23 unread in #engineering, 5 mentions"
   5. Notifications she missed are reflected in unread counts
   6. She catches up

━━━ WHAT MADE THIS WORK ━━━

   Real-time delivery: WebSockets + Redis pub/sub + sticky load balancing
   Channel scaling: Tiered fanout (small=pubsub, large=workers)
   Search: Async indexing pipeline → Elasticsearch
   Threading: Single thread_ts column in messages table
   Multi-tenancy: Sharding + JWT + workspace_id filters on every query
   Notifications: Smart rules to avoid spam, async processing
   Presence: Heartbeats with TTL, lazy queries
   Offline catchup: last_read_ts pattern for shared-state model
   File handling: S3 with presigned URLs for direct upload
   Reliability: Database is source of truth, async pipelines are eventually consistent

━━━ THE NUMBERS ━━━

   10M DAU
   500K workspaces
   500M messages/day
   17,500 messages/sec at peak
   4M concurrent WebSockets at peak
   1000+ Real-time Servers
   500+ Application Service instances
   Sharded data across hundreds of database nodes
   PB of message storage, indexed in Elasticsearch
   Sub-200ms message delivery globally`,
    analogy: `🏢 Slack is a global office building service. 500,000 companies (workspaces) lease space in their virtual building.

The lobby (Load Balancer) directs you to your floor.
The receptionists (Real-time Servers) connect you to coworkers.
The intercom (Pub/Sub) broadcasts to small meeting rooms.
The mail room (Kafka workers) distributes announcements to large auditoriums.
The library (Elasticsearch) lets you search any document ever filed.
The security guards (Multi-tenancy) ensure Acme employees can never enter Globex's offices.
The mailroom catches your mail (Database) when you're out, ready when you return.
The intercom system (Notifications) only interrupts you for things that matter.

All of this orchestrated, distributed, durable, isolated across continents. Every message Sarah sends to her team takes a journey through this entire infrastructure — but to her, it just feels like sending a chat message that appears instantly. That invisible complexity, made simple for the user, is the art of system design.`
  }
];

// ====== UI COMPONENTS ======

function Tag({ label }) {
  return (
    <span style={{
      display: "inline-block", padding: "3px 10px", borderRadius: "100px",
      fontSize: "10.5px", fontWeight: 700, letterSpacing: "0.5px",
      background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.65)",
      border: "1px solid rgba(255,255,255,0.1)", marginRight: 5, marginBottom: 4,
      textTransform: "uppercase",
    }}>{label}</span>
  );
}

function Chain({ actors, color }) {
  if (!actors || actors.length === 0) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 4, marginTop: 10, marginBottom: 6 }}>
      {actors.map((actor, i) => (
        <span key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{
            padding: "3px 9px", borderRadius: 6, fontSize: "10.5px", fontWeight: 600,
            background: i === 0 ? color + "20" : "rgba(255,255,255,0.04)",
            color: i === 0 ? color : "rgba(255,255,255,0.55)",
            border: `1px solid ${i === 0 ? color + "40" : "rgba(255,255,255,0.07)"}`,
            whiteSpace: "nowrap",
          }}>{actor}</span>
          {i < actors.length - 1 && <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 11 }}>→</span>}
        </span>
      ))}
    </div>
  );
}

function App() {
  const [activeStep, setActiveStep] = useState(0);
  const [showDetail, setShowDetail] = useState(false);
  const [showAnalogy, setShowAnalogy] = useState(false);
  const [activeSection, setActiveSection] = useState("intro");
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

  const navigate = (dir) => {
    const next = globalIndex + dir;
    if (next >= 0 && next < STEPS.length) {
      setActiveSection(STEPS[next].section);
      setActiveStep(STEPS[next].id);
    }
  };

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

      <div style={{ padding: "14px 18px 10px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: "rgba(255,255,255,0.25)", marginBottom: 3, fontFamily: "'IBM Plex Mono', monospace" }}>
          Design Slack
        </div>
        <div style={{ fontSize: 17, fontWeight: 800, color: "#fff", lineHeight: 1.3 }}>
          Workspaces, Channels & Search at Scale
        </div>
        <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.35)", marginTop: 3 }}>
          From WhatsApp's 1-on-1 model to Slack's hierarchical workspace architecture
        </div>
      </div>

      <div style={{ padding: "8px 18px", borderBottom: "1px solid rgba(255,255,255,0.05)", overflowX: "auto" }}>
        <div style={{ display: "flex", gap: 3, minWidth: "fit-content" }}>
          {SECTIONS.map(sec => (
            <button key={sec.id} onClick={() => setActiveSection(sec.id)} style={{
              display: "flex", alignItems: "center", gap: 4,
              padding: "6px 10px", borderRadius: 7,
              border: activeSection === sec.id ? `1.5px solid ${sec.color}50` : "1.5px solid transparent",
              background: activeSection === sec.id ? sec.color + "14" : "rgba(255,255,255,0.025)",
              color: activeSection === sec.id ? sec.color : "rgba(255,255,255,0.35)",
              cursor: "pointer", fontSize: 10.5, fontWeight: activeSection === sec.id ? 700 : 500,
              fontFamily: "'IBM Plex Sans', sans-serif", whiteSpace: "nowrap",
            }}>
              <span style={{ fontSize: 11 }}>{sec.icon}</span>
              <span>{sec.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: "7px 18px", borderBottom: "1px solid rgba(255,255,255,0.04)", overflowX: "auto" }}>
        <div style={{ display: "flex", gap: 3, minWidth: "fit-content" }}>
          {sectionSteps.map((s) => (
            <button key={s.id} onClick={() => setActiveStep(s.id)} style={{
              padding: "5px 9px", borderRadius: 6,
              border: activeStep === s.id ? `1px solid ${s.color}40` : "1px solid transparent",
              background: activeStep === s.id ? s.color + "10" : "transparent",
              color: activeStep === s.id ? s.color : "rgba(255,255,255,0.3)",
              cursor: "pointer", fontSize: 10.5, fontWeight: activeStep === s.id ? 700 : 500,
              fontFamily: "'IBM Plex Sans', sans-serif", whiteSpace: "nowrap",
            }}>
              {s.icon} {s.phase}
            </button>
          ))}
        </div>
      </div>

      <div style={{ height: 2, background: "rgba(255,255,255,0.03)" }}>
        <div style={{
          height: "100%", width: `${((globalIndex + 1) / STEPS.length) * 100}%`,
          background: `linear-gradient(90deg, ${step.color}88, ${step.color})`,
          transition: "all 0.4s ease",
        }} />
      </div>

      <div ref={contentRef} style={{ flex: 1, overflow: "auto", padding: "14px 18px 110px" }}>
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 7 }}>
            <span style={{ fontSize: 9, fontWeight: 800, color: currentSection.color, background: currentSection.color + "18", padding: "2px 7px", borderRadius: 4, fontFamily: "'IBM Plex Mono', monospace", letterSpacing: 1 }}>
              {currentSection.label.toUpperCase()}
            </span>
            <span style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.25)", fontFamily: "'IBM Plex Mono', monospace" }}>
              {globalIndex + 1} / {STEPS.length}
            </span>
          </div>
          <h2 style={{ fontSize: 19, fontWeight: 800, color: "#fff", lineHeight: 1.3, marginBottom: 7 }}>
            {step.icon} {step.title}
          </h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
            {step.concepts.map((c, i) => <Tag key={i} label={c} />)}
          </div>
        </div>

        <div style={{ fontSize: 9.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "rgba(255,255,255,0.22)", marginBottom: 1 }}>Who's involved</div>
        <Chain actors={step.actors} color={step.color} />

        <div style={{
          background: "rgba(255,255,255,0.025)", borderRadius: 11, padding: 15,
          border: "1px solid rgba(255,255,255,0.055)", marginTop: 12,
          fontSize: 13.5, lineHeight: 1.75, color: "rgba(255,255,255,0.78)",
          whiteSpace: "pre-wrap",
        }}>{step.simple}</div>

        <button onClick={() => setShowDetail(!showDetail)} style={{
          display: "flex", alignItems: "center", gap: 7, width: "100%",
          padding: "11px 15px", marginTop: 7, borderRadius: 10,
          border: `1px solid ${step.color}30`,
          background: showDetail ? step.color + "10" : "transparent",
          color: step.color, cursor: "pointer", fontSize: 12.5, fontWeight: 700,
          fontFamily: "'IBM Plex Sans', sans-serif",
        }}>
          <span style={{ transform: showDetail ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s", fontSize: 13 }}>▶</span>
          {showDetail ? "Hide" : "Show"} Technical Deep Dive
        </button>
        {showDetail && (
          <div style={{
            background: "rgba(0,0,0,0.3)", borderRadius: 10, padding: 16,
            border: `1px solid ${step.color}20`, marginTop: 3,
            fontSize: 12, lineHeight: 1.85, color: "rgba(255,255,255,0.7)",
            fontFamily: "'IBM Plex Mono', monospace", whiteSpace: "pre-wrap",
          }}>{step.detail}</div>
        )}

        <button onClick={() => setShowAnalogy(!showAnalogy)} style={{
          display: "flex", alignItems: "center", gap: 7, width: "100%",
          padding: "11px 15px", marginTop: 5, borderRadius: 10,
          border: "1px solid rgba(255,255,255,0.08)",
          background: showAnalogy ? "rgba(255,255,255,0.04)" : "transparent",
          color: "rgba(255,255,255,0.6)", cursor: "pointer", fontSize: 12.5, fontWeight: 700,
          fontFamily: "'IBM Plex Sans', sans-serif",
        }}>
          <span style={{ transform: showAnalogy ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s", fontSize: 13 }}>▶</span>
          {showAnalogy ? "Hide" : "Show"} Real-World Analogy
        </button>
        {showAnalogy && (
          <div style={{
            background: "rgba(255,255,255,0.025)", borderRadius: 10, padding: 15,
            border: "1px solid rgba(255,255,255,0.07)", marginTop: 3,
            fontSize: 13.5, lineHeight: 1.75, color: "rgba(255,255,255,0.6)",
            whiteSpace: "pre-wrap",
          }}>{step.analogy}</div>
        )}
      </div>

      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        padding: "10px 18px 16px",
        background: "linear-gradient(transparent, #0A0D12 30%)",
        display: "flex", gap: 8,
      }}>
        <button onClick={() => navigate(-1)} disabled={!canPrev} style={{
          flex: 1, padding: 12, borderRadius: 10,
          border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)",
          color: canPrev ? "rgba(255,255,255,0.65)" : "rgba(255,255,255,0.18)",
          cursor: canPrev ? "pointer" : "default", fontSize: 13, fontWeight: 700,
          fontFamily: "'IBM Plex Sans', sans-serif",
        }}>← Back</button>
        <button onClick={() => navigate(1)} disabled={!canNext} style={{
          flex: 2, padding: 12, borderRadius: 10, border: "none",
          background: canNext ? `linear-gradient(135deg, ${step.color}, ${step.color}99)` : "rgba(255,255,255,0.08)",
          color: canNext ? "#fff" : "rgba(255,255,255,0.25)",
          cursor: canNext ? "pointer" : "default", fontSize: 13, fontWeight: 700,
          fontFamily: "'IBM Plex Sans', sans-serif",
        }}>{canNext ? "Next →" : "Slack design mastered!"}</button>
      </div>
    </div>
  );
}
