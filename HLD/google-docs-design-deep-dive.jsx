const { useState, useEffect, useRef } = React;

const SECTIONS = [
  { id: "intro", label: "What & Why", icon: "📝", color: "#E8B931" },
  { id: "architecture", label: "Architecture", icon: "🏗️", color: "#4A90D9" },
  { id: "storage", label: "Storage", icon: "💾", color: "#50C878" },
  { id: "conflict", label: "Conflict Resolution", icon: "⚔️", color: "#E74C3C" },
  { id: "version", label: "Version History", icon: "📜", color: "#9B59B6" },
  { id: "offline", label: "Offline & Sync", icon: "✈️", color: "#F39C12" },
  { id: "bigpicture", label: "Full Picture", icon: "🗺️", color: "#1ABC9C" },
];

const STEPS = [
  // ============ INTRO ============
  {
    id: 0, section: "intro",
    phase: "WHAT IS IT",
    title: "Google Docs — A Completely Different Beast",
    icon: "📝",
    color: "#E8B931",
    concepts: ["Real-time Collaboration", "Conflict Resolution", "Document State"],
    actors: ["User A (typing)", "User B (deleting)", "User C (formatting)", "Shared Document"],
    simple: `You've now designed WhatsApp (messaging), Slack (channels), and Live Comments (broadcast). Google Docs is fundamentally different from ALL of them.

In messaging systems, messages are APPEND-ONLY. User A sends "Hello," it goes to the end of the conversation. User B sends "Hi back," it goes after that. Messages never modify each other. Simple.

In Google Docs, users are MODIFYING THE SAME OBJECT simultaneously. User A inserts a word at position 10. User B deletes a word at position 8. User C bolds a sentence that overlaps with what A and B are changing. All at the same millisecond. On the same document.

This creates a problem that doesn't exist in any messaging system: CONFLICT. If A inserts at position 10 and B deletes at position 8, B's delete shifts everything — A's "position 10" no longer means what it meant. If we apply both operations naively, the document becomes corrupted.

The core challenge of Google Docs isn't delivering messages fast. It's making sure that when 5 people type simultaneously, everyone ends up with EXACTLY the same document. No lost characters, no duplicated text, no garbled formatting.`,
    detail: `HOW GOOGLE DOCS DIFFERS FROM EVERYTHING ELSE:

                  WhatsApp       Slack          Live Comments   Google Docs
Data model:       Messages       Messages       Comments        ONE shared document
Operations:       Append-only    Append-only    Append-only     Insert/Delete/Format ANYWHERE
Conflicts:        None           None           None            CONSTANT
Consistency:      Per-message    Per-channel    Approximate     EXACT (all see same doc)
Connection:       WebSocket      WebSocket      SSE             WebSocket
Protocol:         Simple push    Pub/Sub        Pub/Sub         OT or CRDT
Offline:          Queue msgs     last_read_ts   Playback API    Full offline editing + merge

THE CORE INSIGHT:

In chat, operations are INDEPENDENT. My message doesn't affect yours.
In Docs, operations are INTERDEPENDENT. My insert at position 5 shifts your cursor at position 10 to position 11. My delete at position 3 means your "position 5" is now "position 4."

Every operation changes the MEANING of every other concurrent operation. This is what makes collaborative editing the hardest real-time problem in system design.

THE SCALE:

  100 million monthly active users
  50 million daily active users
  2 billion documents stored
  ~100,000 active collaborative sessions at peak
  ~167,000 keystrokes per second at peak
  Each keystroke = a separate operation sent to the server
  
  Total document storage: ~200 TB
  Version history: ~100 TB (50 versions per doc × billions of docs)

WHAT WE'RE BUILDING:

  1. Create and edit documents (basic CRUD)
  2. Real-time collaborative editing (multiple users, same doc, simultaneously)
  3. Conflict resolution (the hard part — OT or CRDT)
  4. Rich text support (bold, italic, headings, lists — not just plain text)
  5. Live cursors and presence (see where others are typing)
  6. Version history (browse and restore past versions)
  7. Offline editing with sync on reconnect
  8. Access control (view / comment / edit permissions)`,
    analogy: `📝 Messaging systems are like people writing letters and mailing them. Each letter is independent. One person's letter doesn't affect another's.

Google Docs is like 5 people standing around ONE whiteboard, all writing with markers simultaneously. Person A writes "Hello" in the middle. Person B erases a word on the left — now everything shifts. Person C underlines a sentence that Person A is still writing.

The whiteboard must look IDENTICAL from every person's perspective, at every moment, despite all of them modifying it at the same time. If even one person sees a different version, the collaboration breaks.

That's the engineering challenge: keeping a single shared state perfectly synchronized across multiple simultaneous editors, with every keystroke arriving in potentially different orders.`
  },
  // ============ ARCHITECTURE ============
  {
    id: 1, section: "architecture",
    phase: "FLOW",
    title: "How a Single Keystroke Flows Through the System",
    icon: "⌨️",
    color: "#4A90D9",
    concepts: ["WebSocket", "Message Queue", "Collaboration Service", "Broadcast"],
    actors: ["Client", "WebSocket Server", "Kafka", "Collaboration Service", "Other Clients"],
    simple: `Let's trace what happens when you press the letter "A" in a shared document. This one keystroke triggers a chain of events across 6 different components.

The key insight: unlike messaging where you send and forget, in Docs the server must TRANSFORM your operation against everyone else's concurrent edits before broadcasting. The Collaboration Service is the "brain" that does this transformation.`,
    detail: `THE 6-STEP FLOW OF A SINGLE KEYSTROKE:

STEP 1: CLIENT GENERATES AN OPERATION

You press "A" while your cursor is at position 5. The document you see is at version 42.

Your client creates a structured operation:
  {
    type: "insert",
    character: "A",
    position: 5,
    base_version: 42,
    user_id: "alice",
    client_ts: 1234567890
  }

"base_version: 42" means "when I made this edit, my document was at version 42."
This is critical for conflict resolution later.

The client IMMEDIATELY applies this locally. You see the "A" appear on your screen instantly. This is called "optimistic UI" or "local echo" — the same pattern WhatsApp uses for sent messages. You don't wait for the server.

STEP 2: CLIENT SENDS VIA WEBSOCKET

The operation is sent to the WebSocket Server over the persistent connection.

Why WebSocket and not HTTP?
  — Every keystroke is an operation (~100 keystrokes per minute per user)
  — HTTP would mean 100 TCP connections per minute = wasteful
  — WebSocket: one connection, bidirectional, always open
  — Also needed for receiving OTHER people's edits in real-time

STEP 3: WEBSOCKET SERVER FORWARDS TO MESSAGE QUEUE (KAFKA)

The WebSocket Server doesn't process the edit itself. It drops it into Kafka.

Why the queue?
  — Decouples ingestion from processing
  — During traffic spikes (100 people editing at once), Kafka buffers operations
  — Ensures ordering within a document (same partition key = same partition)
  — Collaboration Service can process at its own pace

Kafka topic: "document-operations"
Partition key: document_id (ensures all ops for one doc go to same partition → same consumer → sequential processing)

STEP 4: COLLABORATION SERVICE PROCESSES THE OPERATION

This is the BRAIN. A dedicated service consumes from Kafka.

It does:
  a) TRANSFORM: If other operations arrived since version 42 (say versions 43 and 44 were already applied), the service transforms your insert against those operations to adjust the position.
  
  Example: If version 43 was "insert 'X' at position 3" by Bob, that shifted everything after position 3 by 1. Your position 5 should now be position 6.
  
  Original: Insert("A", pos=5, base_ver=42)
  After transform against v43: Insert("A", pos=6, base_ver=44)

  b) APPLY: Update the document state in the cache and database.
  
  c) LOG: Append the transformed operation to the version history (Cassandra).
  
  d) ACKNOWLEDGE: Tell the WebSocket Server "operation accepted as version 45."

STEP 5: WEBSOCKET SERVER BROADCASTS TO OTHER CLIENTS

The WebSocket Server receives the transformed operation from the Collaboration Service.

It broadcasts to ALL other clients connected to this document:
  {
    type: "insert",
    character: "A",
    position: 6,    ← NOTE: transformed position, not original 5!
    version: 45,
    user_id: "alice"
  }

STEP 6: OTHER CLIENTS APPLY THE UPDATE

Bob's client receives the operation. But Bob might have his OWN unacknowledged edits that the server hasn't seen yet.

Bob's client transforms the incoming operation against his local pending edits, then applies it. This is CLIENT-SIDE OT — the same algorithm runs on both server and client.

Result: Bob sees Alice's "A" appear in the right place, even though he was typing at the same time.

ALL OF THIS HAPPENS IN <100ms.

Your keystroke → server → transform → broadcast → other users see it. Under 100 milliseconds. That's why typing in Google Docs with collaborators feels seamless.

━━━ KEY ARCHITECTURAL DECISIONS ━━━

WHY ALL EDITORS ON THE SAME WEBSOCKET SERVER?

For a given document, we try to route all connected users to the SAME WebSocket server. This simplifies broadcasting — the server just iterates through its local connections instead of forwarding across servers.

How? When a user opens a document:
  — Consistent hashing on document_id assigns a specific WebSocket server
  — All users opening doc_123 connect to Server 7
  — Server 7 handles all real-time traffic for doc_123

If Server 7 has too many documents, the load balancer can redistribute. But the principle is: one document = one server.

WHY THE COLLABORATION SERVICE IS SEPARATE FROM WEBSOCKET SERVER?

  — WebSocket servers are I/O bound (managing connections)
  — Collaboration Service is CPU bound (running OT transforms)
  — Different scaling profiles: you might need 100 WebSocket servers but only 20 Collaboration servers
  — Separation of concerns: WebSocket handles connections, Collaboration handles logic

WHY KAFKA BETWEEN THEM?

  — Buffering: if the Collaboration Service is slow, operations queue safely
  — Ordering: partition by document_id guarantees sequential processing per document
  — Durability: if Collaboration Service crashes, operations aren't lost
  — Replay: can reconstruct document state by replaying Kafka log`,
    analogy: `📞 Imagine a conference call where everyone is simultaneously editing a shared whiteboard.

You draw a circle (local echo — you see it immediately on YOUR screen).
Your phone sends "drew circle at position X" to the operator (WebSocket → Kafka).
The operator (Collaboration Service) checks: "Did anyone else draw something that shifts position X?" If Bob drew a square that moved things around, the operator adjusts your circle's position.
The operator broadcasts the adjusted drawing instruction to everyone else on the call.
Everyone's whiteboard now shows the circle in the correct position.

The operator is the critical piece — without them, everyone's whiteboard would diverge. The operator sees ALL changes, resolves conflicts, and tells everyone the authoritative result.`
  },
  {
    id: 2, section: "architecture",
    phase: "PRESENCE",
    title: "Live Cursors & Presence",
    icon: "👆",
    color: "#9B59B6",
    concepts: ["Live Cursors", "Presence", "Session State", "Redis TTL"],
    actors: ["Cursor Position", "Redis Session", "WebSocket Broadcast"],
    simple: `When you're editing a Google Doc with colleagues, you see their colored cursors jumping around the document, with their name labels. This feature seems simple but requires its own real-time system.

Unlike messages or edits, cursor positions are EPHEMERAL — they change hundreds of times per minute and don't need to be stored permanently. If the system crashes, losing cursor positions is fine. This makes Redis (in-memory, with TTL expiry) the perfect storage choice.`,
    detail: `HOW LIVE CURSORS WORK:

Every time Alice moves her cursor or selects text, her client sends:
  {
    type: "cursor_update",
    document_id: "doc_123",
    user_id: "alice",
    cursor_position: { line: 5, column: 12 },
    selection: { start: { line: 5, col: 8 }, end: { line: 5, col: 15 } }
  }

This does NOT go through Kafka or the Collaboration Service. Why?
  — Cursor updates don't modify the document
  — They don't need conflict resolution
  — They don't need persistence
  — They need SPEED (cursor movement must feel instant)

Instead: WebSocket Server directly broadcasts to other connected clients. Skip the queue entirely.

STORAGE IN REDIS:

Each active session (user + document) is stored as:
  Key: session:doc_123:alice
  Value: {
    user_id: "alice",
    display_name: "Alice Kumar",
    cursor_color: "#FF6B6B",
    cursor_position: { line: 5, column: 12 },
    selection: null,
    last_activity: 1234567890,
    role: "editor"
  }
  TTL: 120 seconds

WHY TTL?

If Alice closes her laptop without properly disconnecting:
  — No explicit "I'm leaving" message is sent
  — The Redis key expires after 120 seconds of no updates
  — Other users stop seeing Alice's cursor
  — Her presence dot goes gray
  
This is the same heartbeat/TTL pattern from the Slack and WhatsApp presence systems.

PRESENCE STATES:

  Active (green dot): cursor updated in last 30 seconds
  Idle (yellow dot): no cursor updates for 30-300 seconds, but session exists
  Offline: session expired from Redis

When Bob opens the document, the client:
  1. Fetches all active sessions from Redis for doc_123
  2. Renders each user's cursor at their stored position
  3. Subscribes to cursor updates via WebSocket
  4. As updates arrive, animates cursors moving smoothly

CURSOR TRANSFORM:

Here's a subtle issue. Alice's cursor is at position 10. Bob inserts text at position 5. Now Alice's cursor should shift to position 11 (everything after position 5 moved right by 1).

Cursor positions are transformed using the SAME OT logic as document operations. When an edit arrives:
  — Update the document content
  — Transform all visible cursor positions against the edit
  — Animate cursors to their new positions

This is why cursors seem to "jump" when someone types above where you're looking — the positions are being recalculated.

OPTIMIZATION — THROTTLING:

A user moves their cursor ~200 times per minute. Broadcasting 200 cursor updates per minute per user to all collaborators would be noisy.

Solution: throttle cursor updates to max 10 per second. Human eyes can't perceive faster cursor movement anyway.

The client buffers cursor movements and sends the latest position every 100ms, not on every pixel change.`,
    analogy: `👆 Imagine a shared Google Maps where multiple people are pointing at locations. You see little colored arrows with name labels, each moving around independently.

The arrows don't affect the map itself (cursor doesn't modify the document). They're just visual indicators of where each person is looking. If someone's arrow disappears (they left), nothing on the map changes.

The arrows are stored on sticky notes that dissolve after 2 minutes (Redis TTL). If someone stops moving their arrow, the sticky note dissolves and their arrow vanishes. Simple, ephemeral, disposable.`
  },
  // ============ STORAGE ============
  {
    id: 3, section: "storage",
    phase: "DOCUMENT STORAGE",
    title: "How Documents Are Actually Stored",
    icon: "📄",
    color: "#50C878",
    concepts: ["Structured JSON", "Tree Representation", "Rich Text", "MongoDB"],
    actors: ["Document", "JSON Tree", "Nodes (Paragraph, Heading)", "Inline Marks (Bold)"],
    simple: `A Google Doc is NOT stored as plain text like "Hello World." It's stored as a TREE of structured nodes, similar to how HTML represents a web page. Each paragraph is a node. Each heading is a node. Text inside a paragraph can have marks (bold, italic, links).

Why? Because you can't represent "the word 'Hello' is bold and the word 'World' is italic" in plain text. You need structure: which range of characters has which formatting. The tree representation solves this elegantly.`,
    detail: `WHAT THE USER SEES:

  Welcome to our Q3 Report
  
  Revenue grew by 15% this quarter.
  Key highlights:
  • Record user growth
  • Improved retention

WHAT THE DATABASE STORES (MongoDB):

{
  "document_id": "doc_123",
  "current_version": 87,
  "last_saved_at": "2024-01-15T12:00:00Z",
  "content_blob": {
    "type": "doc",
    "content": [
      {
        "type": "heading",
        "attrs": { "level": 1 },
        "content": [
          { "type": "text", "text": "Welcome to our Q3 Report" }
        ]
      },
      {
        "type": "paragraph",
        "content": [
          { "type": "text", "text": "Revenue grew by " },
          {
            "type": "text",
            "text": "15%",
            "marks": [{ "type": "bold" }]
          },
          { "type": "text", "text": " this quarter." }
        ]
      },
      {
        "type": "bullet_list",
        "content": [
          {
            "type": "list_item",
            "content": [
              { "type": "text", "text": "Record user growth" }
            ]
          },
          {
            "type": "list_item",
            "content": [
              {
                "type": "text",
                "text": "Improved retention",
                "marks": [{ "type": "italic" }]
              }
            ]
          }
        ]
      }
    ]
  }
}

THE TREE STRUCTURE:

  doc
  ├── heading (level 1)
  │   └── text: "Welcome to our Q3 Report"
  ├── paragraph
  │   ├── text: "Revenue grew by "
  │   ├── text: "15%" [bold]
  │   └── text: " this quarter."
  └── bullet_list
      ├── list_item
      │   └── text: "Record user growth"
      └── list_item
          └── text: "Improved retention" [italic]

WHY THIS STRUCTURE?

1. PARTIAL UPDATES: When someone edits paragraph 2, we only update that node. We don't rewrite the entire document. MongoDB supports updating nested fields directly.

2. FORMATTING AS MARKS: The "marks" array on text nodes handles formatting. "15%" is bold because it has marks: [{type: "bold"}]. To make it also italic, add {type: "italic"} to the marks array. Clean and composable.

3. WORKS WITH OT/CRDT: Operations reference positions in this tree. "Insert text 'X' at paragraph 2, position 5" maps cleanly to the tree structure.

4. SCHEMA-LESS: MongoDB doesn't require a fixed schema. Different documents can have different structures (one has tables, another has images, another is all text). The JSON-like document storage handles this naturally.

WHY MONGODB (NOT POSTGRESQL)?

  — Document content is deeply nested JSON → MongoDB stores this natively
  — No JOINs needed (one document = one MongoDB document)
  — Schema evolves (new node types like "video embed" don't require migration)
  — Efficient partial updates on nested fields

BUT: User metadata, document permissions, and sharing settings ARE in PostgreSQL because they need JOINs and ACID transactions.

THE THREE-DATABASE ARCHITECTURE:

  PostgreSQL: users, documents (metadata), permissions
    → Relational, ACID, complex queries
  
  MongoDB: document CONTENT (the JSON tree)
    → Flexible schema, nested documents, partial updates
  
  Cassandra: version history / operation log
    → Append-only, time-series, massive scale
  
  Redis: live session state (cursors, presence)
    → Ephemeral, sub-ms latency, TTL expiry

Each database chosen for what it does best. No one database handles all of Google Docs' needs well.

IMAGE AND NON-TEXT CONTENT:

Images, videos, and embedded files are NOT stored in MongoDB. The document tree references them:

  {
    "type": "image",
    "attrs": {
      "src": "gs://docs-media/img_abc123.png",
      "width": 600,
      "height": 400,
      "alt": "Q3 Revenue Chart"
    }
  }

The actual image file lives in blob storage (Google Cloud Storage / S3). The document just holds a reference. This keeps the document tree small and fast to load.`,
    analogy: `📄 Think of a Word document as a building blueprint.

Plain text storage = writing "3 bedroom house" on a napkin. You know what it IS, but you can't build from it.

Structured JSON tree = a proper architectural blueprint. Each room is a defined element with properties (size, color, fixtures). The kitchen has sub-elements (sink, stove, fridge). You can modify the kitchen without redrawing the whole house. You can add a new room type (home theater) without changing the blueprint format.

MongoDB stores these blueprints naturally. PostgreSQL would force you to flatten the blueprint into rigid rows and columns — losing the natural hierarchy. That's why document content goes in MongoDB.`
  },
  // ============ CONFLICT RESOLUTION ============
  {
    id: 4, section: "conflict",
    phase: "THE PROBLEM",
    title: "Why Concurrent Editing Breaks Things",
    icon: "💥",
    color: "#E74C3C",
    concepts: ["Concurrent Edits", "Position Shifting", "Divergent State"],
    actors: ["Alice (insert)", "Bob (delete)", "Document State", "Corruption Risk"],
    simple: `Here's the fundamental problem. Document starts as "BC" (2 characters).

Alice inserts "A" at position 0. Her screen shows "ABC."
Bob inserts "D" at position 2. His screen shows "BCD."

Both edits are valid. The final document should be "ABCD." But without coordination:

If we apply Alice's edit first: "BC" → "ABC" → Bob's "insert D at position 2" gives "ABDC." WRONG.
If we apply Bob's edit first: "BC" → "BCD" → Alice's "insert A at position 0" gives "ABCD." CORRECT... by luck.

The order matters. And with network latency, edits arrive in unpredictable order. Without a conflict resolution algorithm, the document becomes corrupted. This is the problem that OT and CRDT solve.`,
    detail: `LET'S SEE MORE DANGEROUS CONFLICTS:

━━━ CONFLICT 1: Insert vs Insert at same position ━━━

Document: "Hello World"
Alice: Insert "Beautiful " at position 6 → "Hello Beautiful World"
Bob: Insert "Big " at position 6 → "Hello Big World"

Both sent at the same time. Both based on version where position 6 is between "Hello " and "World".

Without resolution: one overwrites the other, or they interleave randomly.
With OT: server decides an order (say Alice first), transforms Bob's insert to position 16 (after "Beautiful "). Result: "Hello Beautiful Big World" — both edits preserved.

━━━ CONFLICT 2: Insert vs Delete overlapping ━━━

Document: "Hello World"
Alice: Delete positions 5-10 (delete " World") → "Hello"
Bob: Insert "Beautiful" at position 6 → "Hello Beautiful World"

Bob inserts INTO the range Alice is deleting. What should happen?

Option A: Delete wins. Bob's insert is absorbed by the delete. Result: "Hello". Bob's edit is lost.
Option B: Insert wins. The delete is split around the insert. Result: "HelloBeautiful". Weird but preserves both intents.
Option C: The system keeps Bob's insert and adjusts the delete. Result: "HelloBeautiful". 

OT defines transformation rules for each pair of operation types:
  insert vs insert, insert vs delete, delete vs delete, format vs insert, etc.
  Each pair has a specific transformation function.

━━━ CONFLICT 3: The classic "shifting positions" problem ━━━

Document: "ABCDEF" (positions 0-5)
Alice: Insert "X" at position 2 → "ABXCDEF"
Bob: Insert "Y" at position 4 → "ABCDYEF"

Both based on original "ABCDEF". If both arrive at server:

Apply Alice first: "ABCDEF" → "ABXCDEF"
Now Bob's "position 4" in original was "E". In the new string, "E" is at position 5.
Transform Bob: Insert "Y" at position 5 (shifted by 1 because Alice inserted before position 4).
Final: "ABXCDYEF" ✅

Apply Bob first: "ABCDEF" → "ABCDYEF"
Now Alice's "position 2" is still "C". No shift needed (Bob inserted after).
Apply Alice: Insert "X" at position 2.
Final: "ABXCDYEF" ✅

SAME RESULT regardless of order! That's the magic of OT — the transformation functions are designed so that the final state is identical no matter which operation is applied first.

━━━ WHY NOT JUST LOCK THE DOCUMENT? ━━━

Option: "When Alice is typing, lock the document. Bob waits."

Problems:
  — Locks destroy the collaborative experience (the whole point of Google Docs)
  — What if Alice's connection drops while holding a lock? Deadlock.
  — With 5 users typing simultaneously, everyone is constantly blocked
  — Google Docs would feel like "taking turns" instead of "working together"

OT and CRDT solve this WITHOUT locks. Everyone types freely. The algorithm ensures consistency.

━━━ WHY NOT GIT-STYLE MERGING? ━━━

Git works for code (merge, resolve conflicts manually). But:
  — Git merges are MANUAL (human resolves conflicts)
  — In Docs, conflicts happen every second — you can't show a merge dialog every keystroke
  — Git merges are at file level; Docs needs character-level precision
  — Git is asynchronous (commit, then merge later); Docs is real-time

OT provides AUTOMATIC, CHARACTER-LEVEL, REAL-TIME conflict resolution. No human intervention needed.`,
    analogy: `✏️ Two artists painting on the same canvas from opposite sides (they can't see each other).

Artist A paints a red circle in the top-left.
Artist B paints a blue square in the center.

No conflict — different locations. Both appear on the canvas.

But what if both try to paint in the same spot? Without coordination: the colors mix into ugly brown. One artist's work is ruined.

OT is like a coordinator standing in the middle who sees both artists' intentions and says: "A, paint your circle here. B, I'll shift your square 2 inches right so both fit." The coordinator transforms each instruction relative to the other, and both artists' intentions are preserved.

Without the coordinator (OT), the canvas diverges — each artist sees a different painting. With the coordinator, they always see the same result.`
  },
  {
    id: 5, section: "conflict",
    phase: "OT",
    title: "Operational Transformation — How Google Docs Actually Works",
    icon: "🔄",
    color: "#4A90D9",
    concepts: ["OT", "Transform Function", "Server Authority", "Client OT"],
    actors: ["Client A", "Client B", "Server (Transform Engine)", "Version Log"],
    simple: `Operational Transformation is the algorithm Google Docs uses to keep everyone's document in sync. The core idea: when two operations conflict, TRANSFORM one against the other so that applying both (in either order) produces the same final document.

The server is the AUTHORITY. It receives operations, transforms them against each other, assigns a global version number, and broadcasts the transformed result. Clients also run OT locally to keep their UI responsive while waiting for server confirmation.`,
    detail: `THE OT ALGORITHM — STEP BY STEP:

SETUP: Document is "BC" (version 10). Alice and Bob both have version 10.

Alice types "A" at position 0:
  Operation: Insert("A", pos=0)
  Base version: 10
  Alice's local doc: "ABC" (applied optimistically)
  Sends to server.

Bob types "D" at position 2:
  Operation: Insert("D", pos=2)
  Base version: 10
  Bob's local doc: "BCD" (applied optimistically)
  Sends to server.

SERVER RECEIVES ALICE FIRST (arrives at server first):

  Server state: "BC" (version 10)
  Alice's op: Insert("A", pos=0), base_ver=10
  Server's current version: 10 → matches! No transform needed.
  Apply: "BC" → "ABC"
  Assign version 11.
  Broadcast to all clients: Insert("A", pos=0), ver=11

SERVER RECEIVES BOB NEXT:

  Server state: "ABC" (version 11)
  Bob's op: Insert("D", pos=2), base_ver=10
  Bob's base is 10, but server is at 11. There's a GAP.
  
  Server must TRANSFORM Bob's operation against everything that happened since version 10.
  
  What happened since v10? Alice's Insert("A", pos=0).
  
  Transform: Bob wants to insert at position 2. Alice inserted at position 0 (before position 2). So everything at position 0+ shifted right by 1.
  
  Original: Insert("D", pos=2)
  After transform: Insert("D", pos=3)  ← shifted by 1
  
  Apply: "ABC" → "ABCD"
  Assign version 12.
  Broadcast: Insert("D", pos=3), ver=12

CLIENT-SIDE OT (what happens on Alice's and Bob's screens):

ALICE'S CLIENT:
  Alice's local doc: "ABC" (she applied her own insert)
  Alice's unacknowledged ops: [Insert("A", pos=0)]
  
  Server broadcasts: Insert("A", pos=0), ver=11 — this is HER OWN op!
  Alice recognizes it (matches her pending op) → just acknowledges, no visual change.
  
  Server broadcasts: Insert("D", pos=3), ver=12 — this is Bob's transformed op.
  Alice applies it: "ABC" → "ABCD" ✅

BOB'S CLIENT:
  Bob's local doc: "BCD" (he applied his own insert)
  Bob's unacknowledged ops: [Insert("D", pos=2)]
  
  Server broadcasts: Insert("A", pos=0), ver=11 — Alice's op.
  But Bob has an unacknowledged local op! He must transform the incoming op against his local ops.
  
  Transform Alice's Insert("A", pos=0) against Bob's Insert("D", pos=2):
    Alice inserts at 0, which is before Bob's insert at 2. No shift needed for Alice's op.
  
  Bob applies: Insert "A" at position 0 on his local "BCD" → "ABCD"
  But wait — Bob already had "BCD" locally. Applying "A" at position 0 → "ABCD" ✅
  
  Then server broadcasts: Insert("D", pos=3), ver=12 — Bob's own op!
  Bob recognizes it → acknowledges, removes from pending queue.

FINAL STATE:
  Server: "ABCD" (version 12) ✅
  Alice: "ABCD" ✅
  Bob: "ABCD" ✅
  
  ALL THREE ARE IDENTICAL. Despite operations arriving in different orders, despite each client having a different local state at intermediate moments, OT guarantees convergence.

━━━ THE TRANSFORM FUNCTION ━━━

OT requires a transform function for every pair of operation types:

transform(Insert, Insert):
  If op1.pos <= op2.pos: shift op2.pos by op1.length
  If op1.pos > op2.pos: shift op1.pos by op2.length
  Tiebreaker (same position): use user_id or timestamp

transform(Insert, Delete):
  If insert.pos <= delete.pos: shift delete.pos by insert.length
  If insert.pos > delete.pos + delete.length: shift insert.pos by -delete.length
  If insert.pos is within delete range: ... (complex — split the delete)

transform(Delete, Delete):
  If ranges don't overlap: shift positions
  If ranges overlap: merge the deletes, adjust ranges

transform(Format, Insert):
  If insert is within format range: extend format range
  If insert is before format range: shift format start/end

Each pair is a small function. Together they handle every possible conflict.

━━━ WHY GOOGLE USES OT (not CRDT) ━━━

1. Google HAS the server infrastructure. OT needs a central server for ordering. Google can easily provide this.

2. OT has lower overhead. CRDT attaches unique IDs to every character (metadata overhead). OT just uses positions.

3. Strong consistency. OT guarantees all clients see the same state at each version. CRDT guarantees "eventual" consistency — there might be brief divergence.

4. Small collaboration groups. Most Google Docs have 2-10 editors. OT handles this perfectly. CRDT shines when you have hundreds of peers with no central server.

5. Simpler garbage collection. CRDT tombstones (deleted characters still stored) accumulate. OT doesn't have this problem.`,
    analogy: `🎵 Imagine two musicians improvising over the same music sheet simultaneously.

Musician A adds a note at measure 5.
Musician B adds a different note at measure 3.

The conductor (server) receives both additions. B's note at measure 3 shifts everything after it — so A's "measure 5" is now "measure 6."

The conductor transforms A's instruction: "Actually, put your note at measure 6 (because B added one before you)." Both musicians get the corrected sheet. The final music sounds exactly right.

If the conductor received A's note first instead: B's note at measure 3 doesn't need shifting (A's was after), but A's original position is still correct. Same final result, different order of processing.

OT is the conductor ensuring all musicians play from the same, correct sheet — regardless of who sent their notes first.`
  },
  {
    id: 6, section: "conflict",
    phase: "CRDT",
    title: "CRDTs — The Decentralized Alternative",
    icon: "🌐",
    color: "#1ABC9C",
    concepts: ["CRDT", "No Central Server", "Offline-First", "Tombstones"],
    actors: ["Peer A", "Peer B", "No Server", "Eventual Convergence"],
    simple: `CRDTs (Conflict-Free Replicated Data Types) are the alternative to OT. The key difference: CRDTs don't need a central server. Every client can edit independently — even offline for days — and when they sync, the documents automatically merge without conflicts.

Google Docs uses OT (central server). But Figma uses CRDTs. Understanding both is important for interviews because the interviewer might ask "why OT over CRDT?" and you need to explain the tradeoffs.`,
    detail: `HOW CRDT WORKS FOR TEXT:

Instead of position-based operations ("insert at position 5"), CRDTs assign a UNIQUE ID to every character. These IDs never change, even when surrounding characters are inserted or deleted.

Document: "BC"
  Character "B" has ID: (user_1, seq_1)
  Character "C" has ID: (user_1, seq_2)

Alice inserts "A" before "B":
  New character "A" with ID: (alice, seq_5)
  Placement: BEFORE (user_1, seq_1)
  
  Alice's doc: A(alice,5) → B(user1,1) → C(user1,2)

Bob inserts "D" after "C":
  New character "D" with ID: (bob, seq_3)
  Placement: AFTER (user_1, seq_2)
  
  Bob's doc: B(user1,1) → C(user1,2) → D(bob,3)

MERGING (no server needed):

When Alice and Bob sync:
  — Alice's insert: A goes BEFORE B. ID-based, not position-based.
  — Bob's insert: D goes AFTER C. ID-based.
  — No conflict! IDs are globally unique, placement references specific characters.
  
  Merged: A(alice,5) → B(user1,1) → C(user1,2) → D(bob,3)
  = "ABCD" ✅

THE KEY INSIGHT:

OT uses POSITIONS (insert at position 5). Positions shift when other edits happen. Requires transformation.

CRDT uses IDS (insert after character with ID xyz). IDs never change. No transformation needed.

━━━ DELETION IN CRDT — TOMBSTONES ━━━

When you delete a character in CRDT, you can't physically remove it. Why? Because other clients might have references to it ("insert AFTER character X"). If X is removed, the reference breaks.

Instead: MARK it as deleted (tombstone). The character stays in the data structure but is invisible to the user.

Document: "ABCD"
  A(alice,5) → B(user1,1) → C(user1,2) → D(bob,3)

Alice deletes "B":
  B(user1,1) gets a tombstone flag: { deleted: true }
  
  Visible document: "ACD"
  Internal structure: A(alice,5) → B̶(user1,1,deleted) → C(user1,2) → D(bob,3)

The deleted "B" still exists in memory. After millions of edits, thousands of tombstones accumulate. This is CRDT's biggest practical problem — memory bloat.

━━━ OT vs CRDT COMPARISON ━━━

                        OT                          CRDT
Central server:         Required                    Not required
Offline editing:        Limited (queue ops)         Full support (merge later)
Consistency:            Strong (server authority)   Eventual (convergence)
Memory overhead:        Low (just positions)        High (unique IDs per char + tombstones)
Implementation:         Complex transforms          Complex data structures
Google Docs:            ✅ Uses this                ❌
Figma:                  ❌                          ✅ Uses this
Notion:                 ❌                          ✅ Uses this

WHEN TO USE EACH:

Use OT when:
  — You have reliable server infrastructure (Google, Microsoft)
  — Collaboration groups are small (2-10 people)
  — You need strong consistency (everyone sees same state)
  — Memory efficiency matters

Use CRDT when:
  — Offline-first is critical (mobile apps, unreliable networks)
  — No central server available (peer-to-peer)
  — Eventually consistent is acceptable
  — You're building local-first software

INTERVIEW ANSWER:

"Google Docs uses OT because Google has the server infrastructure to act as a central coordinator, collaboration groups are small, and strong consistency is important for the user experience. CRDT would be better if we needed offline-first editing or peer-to-peer sync without a server, like in Figma or a note-taking app designed for airplane mode."`,
    analogy: `📮 OT is like a post office (central server). Everyone sends their letters to the post office. The post office sorts, adjusts, and delivers in the right order. Efficient when the post office works.

CRDT is like each person keeping their own diary and periodically sharing pages. Each diary entry has a unique serial number. When diaries are compared, entries are merged by serial number — no conflicts possible because no two entries have the same number. Works even if the postal service is down for weeks. But each diary gets thick (tombstones of deleted entries still take pages).

Google Docs has a reliable "post office" (Google's servers), so OT wins. An app designed for submarines (no internet for months) would need CRDT.`
  },
  // ============ VERSION HISTORY ============
  {
    id: 7, section: "version",
    phase: "VERSION HISTORY",
    title: "Version History — Snapshots + Operation Replay",
    icon: "📜",
    color: "#9B59B6",
    concepts: ["Operation Log", "Snapshots", "Delta Replay", "Restore"],
    actors: ["Operation Log (Cassandra)", "Snapshots (MongoDB/S3)", "Reconstruction"],
    simple: `Google Docs keeps a history of every edit ever made. You can click "Version History," see who changed what and when, and restore any previous version.

Under the hood, this uses TWO complementary storage mechanisms: an OPERATION LOG (every single edit as a delta) and periodic SNAPSHOTS (full copy of the document at a point in time). Together, they enable fast reconstruction of any version without storing a complete copy for each one.`,
    detail: `THE TWO STORAGE MECHANISMS:

━━━ 1. OPERATION LOG (Cassandra) ━━━

Every keystroke, deletion, and formatting change is stored as an immutable delta:

  Partition key: document_id
  Clustering key: version_number

  doc_123 | ver 1   | Insert("H", pos=0)      | alice | 12:00:01
  doc_123 | ver 2   | Insert("e", pos=1)      | alice | 12:00:01
  doc_123 | ver 3   | Insert("l", pos=2)      | alice | 12:00:02
  doc_123 | ver 4   | Insert("l", pos=3)      | alice | 12:00:02
  doc_123 | ver 5   | Insert("o", pos=4)      | alice | 12:00:02
  doc_123 | ver 6   | Insert(" ", pos=5)      | bob   | 12:00:03
  doc_123 | ver 7   | Insert("W", pos=6)      | bob   | 12:00:03
  ...
  doc_123 | ver 5000 | Format(bold, 0-4)      | carol | 14:30:15

A heavily edited document might have MILLIONS of operations.

Why Cassandra?
  — Append-only writes (perfect for logs)
  — Time-series friendly (clustering key = version, sequential reads)
  — Scales horizontally to billions of rows
  — Fast range scans: "give me ops 4500-5000 for doc_123"

━━━ 2. SNAPSHOTS (MongoDB + S3) ━━━

Reconstructing a document from version 0 by replaying 5000 operations takes time. Instead, the system periodically saves SNAPSHOTS — a full copy of the document at a specific version.

  snapshot_id | doc_id  | version | content_blob (full JSON tree) | created_at
  snap_001    | doc_123 | 100     | { "type": "doc", ... }        | 12:05:00
  snap_002    | doc_123 | 200     | { "type": "doc", ... }        | 12:10:00
  snap_003    | doc_123 | 500     | { "type": "doc", ... }        | 12:25:00
  snap_004    | doc_123 | 1000    | { "type": "doc", ... }        | 13:00:00

Snapshot frequency: every 100 operations, OR every 5 minutes, OR when log exceeds 1MB.

Recent snapshots: stored in MongoDB (fast access, frequently needed).
Older snapshots: moved to S3/GCS (cheap, cold storage).

━━━ RECONSTRUCTING A VERSION ━━━

User wants to view version 870:

Step 1: Find nearest snapshot ≤ 870.
  → Snapshot at version 800 (snap_004 isn't right, it's at 1000. Use snap_003 at 500? No, check again... snap at 800 if it exists, or 500 otherwise.)
  
  Let's say nearest snapshot is at version 800.

Step 2: Load snapshot content (version 800 of the document). This is a full JSON tree — the document as it was at version 800.

Step 3: Load operations from Cassandra: versions 801 through 870.
  SELECT * FROM document_versions 
  WHERE document_id = 'doc_123' 
  AND version_number >= 801 AND version_number <= 870;
  
  Returns 70 operations.

Step 4: Apply operations 801-870 sequentially to the snapshot.
  Each operation transforms the document tree step by step.

Step 5: Result = the document exactly as it was at version 870.

Total cost: load 1 snapshot + replay 70 operations.
Without snapshots: replay ALL 870 operations from scratch. Much slower.

━━━ RESTORING A PAST VERSION ━━━

User says "restore version 870 as the current document."

WRONG approach: roll back the version history to 870, deleting versions 871-5000.
  — Destroys history
  — Confuses other collaborators
  — Can't undo the restore

RIGHT approach: the restore IS a new operation.

Step 1: Reconstruct version 870 (as above).
Step 2: Generate a "replace_all" operation:
  {
    type: "replace_all",
    content: <full document tree from version 870>,
    restored_from: 870,
    created_by: "alice",
    created_at: NOW()
  }
Step 3: Apply as version 5001.
Step 4: Broadcast to all connected clients.
Step 5: Everyone sees the document snap to version 870's content.
Step 6: If someone wants to undo the restore, they can restore version 5000.

The restore is AUDITABLE. It appears in version history as "Alice restored version 870." No data is ever lost.

━━━ DISPLAYING VERSION HISTORY IN THE UI ━━━

The version history panel shows a list of versions. But showing every single keystroke (version 1, 2, 3...) would be useless — thousands of entries like "inserted 'a'".

Instead, the system GROUPS operations into meaningful chunks:
  — Group by author + time window (e.g., all of Alice's edits within 5 minutes = one entry)
  — Label: "Alice Kumar — Jan 15, 2:30 PM"
  — Show diff highlights (green = added, red = deleted) when selected

This grouping is computed on-the-fly from the operation log, not stored separately.`,
    analogy: `📸 Version history is like a security camera system.

The operation log is the continuous video feed — every frame (keystroke) is recorded. But rewinding to yesterday at 3:47 PM by playing the entire day's footage from midnight would take hours.

Snapshots are like hourly photos taken by the security system. Want to see 3:47 PM? Load the 3:00 PM photo, then fast-forward through 47 minutes of footage. Much faster than starting from midnight.

Restoring a version is like printing a photo from yesterday and taping it over today's whiteboard. Yesterday's whiteboard isn't "brought back" — today's whiteboard gets a new layer that looks like yesterday. The old versions are all still in the vault.`
  },
  // ============ OFFLINE ============
  {
    id: 8, section: "offline",
    phase: "OFFLINE EDITING",
    title: "Offline Access — Edit Without Internet",
    icon: "✈️",
    color: "#F39C12",
    concepts: ["IndexedDB", "Service Worker", "Offline Queue", "Sync on Reconnect"],
    actors: ["Offline Client", "IndexedDB", "Operation Queue", "Server (on reconnect)"],
    simple: `You're on a flight. No WiFi. You open Google Docs on your laptop and... it works. You can edit the document, format text, even create new documents. When you land and reconnect, all your offline changes sync automatically, merging with any edits others made while you were away.

How? The browser caches the document and your edits locally. When you reconnect, the same OT algorithm resolves conflicts between your offline edits and everyone else's online edits.`,
    detail: `HOW OFFLINE MODE WORKS:

━━━ PHASE 1: PREPARATION (while online) ━━━

When you open a document while connected:

1. SERVICE WORKER registers in your browser
   — Caches the app's UI (HTML, CSS, JavaScript)
   — Future visits load the app even without internet

2. DOCUMENT CACHED in IndexedDB
   — Full document content (the JSON tree) stored locally
   — Document metadata (title, permissions) cached
   — Current version number stored

3. When you go offline, the browser doesn't even notice initially
   — The cached app loads
   — The cached document renders
   — You see the last-known state

━━━ PHASE 2: EDITING OFFLINE ━━━

You type "Important update:" at the top of the document.

Each keystroke creates an operation, just like when online:
  { type: "insert", char: "I", pos: 0, base_ver: 500 }
  { type: "insert", char: "m", pos: 1, base_ver: 500 }
  { type: "insert", char: "p", pos: 2, base_ver: 500 }
  ...

But there's no WebSocket to send these to. Instead:

1. Operations are applied to the LOCAL document immediately (you see your edits).
2. Operations are QUEUED in IndexedDB:
   offline_queue: [
     { op: Insert("I", 0), base_ver: 500, ts: 12:00:01 },
     { op: Insert("m", 1), base_ver: 500, ts: 12:00:01 },
     { op: Insert("p", 2), base_ver: 500, ts: 12:00:01 },
     ... (maybe 500 operations during a 2-hour flight)
   ]

3. The local version counter increments: 500 → 501 → 502 → ...
   But these are LOCAL versions, not acknowledged by the server.

━━━ PHASE 3: RECONNECTION AND SYNC ━━━

You land. WiFi connects. The browser detects connectivity.

Step 1: RE-ESTABLISH WebSocket connection.

Step 2: PULL server state.
  Client: "I last saw version 500. What's happened since?"
  Server: "Versions 501-520 have been applied (Bob and Carol edited while you were away)."
  Server sends: operations 501-520.

Step 3: CLIENT-SIDE OT — the critical step.
  Your 500 offline operations were all based on version 500.
  But the server is now at version 520.
  
  Your client must TRANSFORM all 500 offline operations against the 20 server operations.
  
  This is the same OT algorithm, just applied to a larger batch:
  — Take your first offline op: Insert("I", pos=0, base_ver=500)
  — Transform against server ops 501-520 (which might have shifted positions)
  — Transformed: Insert("I", pos=3) (if 3 characters were inserted before position 0)
  — Repeat for all 500 operations

Step 4: PUSH transformed offline operations to server.
  Your 500 transformed operations are sent to the server.
  Server applies them as versions 521-1020.
  Server broadcasts to other connected clients.

Step 5: OTHER CLIENTS receive your offline edits.
  Bob and Carol see your "Important update:" appear, character by character (or batched).
  Their documents update to include your edits.

Step 6: CONVERGENCE.
  Server: version 1020 with all edits from everyone.
  Your client: version 1020, identical to server.
  Bob's client: version 1020, identical to server.
  All three documents are identical. ✅

━━━ CONFLICT EXAMPLE ━━━

While you were offline, you deleted paragraph 3.
Meanwhile, Bob added a sentence to paragraph 3.

OT handles this:
  — Your delete operation references paragraph 3's position
  — Bob's insert modified paragraph 3 (adding content)
  — When your delete is transformed against Bob's insert:
    — Option 1: Your delete wins, Bob's sentence is absorbed (lost)
    — Option 2: The system preserves Bob's sentence and adjusts the delete
  
  Google Docs typically: preserves all content and lets users sort it out. It won't silently delete content someone else just added. The merge might look slightly odd, but no data is lost.

━━━ EDGE CASES ━━━

What if you were offline for a WEEK?
  — Potentially thousands of server operations to transform against
  — OT might take several seconds to process
  — UI shows "Syncing your changes..." progress indicator
  — Once complete, document updates

What if two people edited the same document offline simultaneously?
  — Person A reconnects first → their ops become versions 501-600
  — Person B reconnects later → transforms against 501-600 + whatever else happened
  — Both sets of edits are preserved
  — Same OT guarantees apply

What if you created a NEW document offline?
  — Document stored in IndexedDB with a temporary local ID
  — On reconnect: POST /documents to create server-side
  — Server assigns real document_id
  — Client updates local references`,
    analogy: `✈️ Imagine a shared whiteboard where you take a PHOTO before getting on a flight.

During the flight, you draw on the photo (your offline edits).
Meanwhile, your colleagues draw on the real whiteboard (their online edits).

When you land, you compare your photo-with-edits to the current whiteboard.
A coordinator (OT) figures out: "You added X. They added Y and Z. Let me adjust your X to fit with Y and Z." Then applies everything to the whiteboard.

If you and a colleague both drew in the same area: the coordinator doesn't throw away either drawing. It adjusts positions so both fit, even if the result looks a bit crowded. No work is lost.

The photo (IndexedDB cache) is what makes offline possible. The coordinator (OT) is what makes the merge seamless.`
  },
  // ============ BIG PICTURE ============
  {
    id: 9, section: "bigpicture",
    phase: "FULL PICTURE",
    title: "Everything Connected — Alice, Bob & Carol Editing Together",
    icon: "🗺️",
    color: "#1ABC9C",
    concepts: ["Complete Architecture", "End-to-End Flow", "All Components"],
    actors: ["Alice", "Bob", "Carol (offline)", "Complete Infrastructure"],
    simple: `Three colleagues are working on a Q3 report. Alice and Bob are online. Carol is on a flight. Let's trace 30 minutes of collaboration through every component of the system.`,
    detail: `THE COMPLETE ARCHITECTURE:

CLIENT LAYER:
  — Browser with Service Worker (offline support)
  — IndexedDB (local document cache + offline queue)
  — WebSocket client (real-time connection)
  — Local OT engine (transforms incoming ops against pending local ops)

REAL-TIME LAYER:
  — WebSocket Servers (sticky sessions per document)
  — All editors of doc_123 connect to same WebSocket Server

PROCESSING LAYER:
  — Kafka (message queue, partitioned by document_id)
  — Collaboration Service (OT transform engine, the brain)

STORAGE LAYER:
  — PostgreSQL: users, document metadata, permissions
  — MongoDB: document content (JSON tree)
  — Cassandra: operation log (version history)
  — Redis: live session state (cursors, presence)
  — S3/GCS: snapshots (periodic), media files

━━━ THE SCENARIO ━━━

9:00 AM — Alice creates the document.
  1. Alice clicks "New Document"
  2. POST /documents → PostgreSQL creates metadata row
  3. MongoDB creates empty content document: { type: "doc", content: [] }
  4. Alice's browser opens WebSocket to Server 7 (consistent hash on doc_id)
  5. Alice types "Q3 Revenue Report" as the title
  6. Each keystroke → operation → WebSocket → Kafka → Collaboration Service → persist to Cassandra + update MongoDB + broadcast

9:05 AM — Alice shares with Bob and Carol.
  1. POST /documents/doc_123/share → PostgreSQL inserts permission rows
  2. Bob gets a notification (via separate notification system)

9:10 AM — Bob opens the document.
  1. GET /documents/doc_123/content → MongoDB returns JSON tree
  2. Bob's browser opens WebSocket to Server 7 (same server as Alice!)
  3. Redis stores Bob's session: cursor position, presence
  4. Alice sees Bob's colored cursor appear (Bob's name label)

9:11 AM — Simultaneous editing begins.
  
  Alice types in paragraph 1: "Revenue grew by 15%"
  Bob types in paragraph 3: "Key initiatives included..."
  
  Different paragraphs → no conflict. Simple case.
  
  Both operations flow: client → WebSocket → Kafka → Collaboration Service
  Collaboration Service: both ops have same base version, but target different positions. Transform is trivial (no shift needed).
  Both ops applied, both broadcast.
  Alice sees Bob's text appear. Bob sees Alice's text appear. <100ms.

9:15 AM — CONFLICT! Both edit the same sentence.
  
  Document (v50): "Revenue grew by 15% this quarter"
  
  Alice: selects "15%" and types "20%" (delete 3 chars + insert 3 chars at position 16)
  Bob: inserts "approximately " before "15%" (insert at position 16)
  
  Both based on v50. Both sent to server nearly simultaneously.
  
  Collaboration Service receives Alice's first:
    v51: Delete(pos=16, len=3) + Insert("20%", pos=16)
    Document: "Revenue grew by 20% this quarter"
  
  Collaboration Service receives Bob's (base_ver=50, but server is at v51):
    Transform Bob's Insert("approximately ", pos=16) against Alice's ops:
    — Alice deleted 3 chars at 16 and inserted 3 at 16 (net change: 0 at position 16)
    — Bob's insert position stays at 16
    v52: Insert("approximately ", pos=16)
    Document: "Revenue grew by approximately 20% this quarter"
  
  Result: "Revenue grew by approximately 20% this quarter"
  Both edits preserved! Alice changed the number, Bob added a qualifier. ✅

9:20 AM — Carol's plane takes off. She goes offline.
  
  Carol had the document open at version 55.
  Her browser has the document cached in IndexedDB.
  WebSocket disconnects.
  
  Carol keeps editing offline:
    — Adds a new section "Regional Breakdown"
    — Formats several headings
    — Types 3 paragraphs
    — ~200 operations queued in IndexedDB
  
  Meanwhile Alice and Bob continue:
    — Versions 56-80 applied on server
    — Carol's browser doesn't know about these

10:00 AM — Snapshot triggered.
  
  Collaboration Service: "Document doc_123 has 100 operations since last snapshot."
  → Take snapshot of current state (v80) → store in MongoDB
  → Move previous snapshot to S3 (cold storage)
  
  This ensures future version reconstruction is fast.

11:30 AM — Carol's plane lands. WiFi reconnects.
  
  1. Carol's browser detects connectivity
  2. Re-establishes WebSocket to Server 7
  3. Client: "I'm at version 55. What did I miss?"
  4. Server: "Versions 56-80 happened. Here are the operations."
  5. Carol's client receives 25 operations from server
  6. CLIENT-SIDE OT: transforms Carol's 200 offline ops against 25 server ops
     — Most are in different sections → minimal conflict
     — A few position adjustments where Alice/Bob edited near Carol's sections
  7. Carol's 200 transformed operations sent to server
  8. Server applies as v81-v280
  9. Server broadcasts to Alice and Bob
  10. Alice and Bob see Carol's "Regional Breakdown" section appear
  11. All three clients converge on version 280. ✅

2:00 PM — Alice checks version history.
  
  1. GET /documents/doc_123/versions → Cassandra returns version metadata
  2. UI groups versions by author and time:
     — "Alice Kumar — 9:00 AM" (created document, wrote intro)
     — "Bob Sharma — 9:10 AM" (added key initiatives)
     — "Alice & Bob — 9:15 AM" (edited revenue figures)
     — "Carol Patel — 9:20 AM-11:30 AM" (added regional breakdown, synced from offline)
  3. Alice clicks on "Bob Sharma — 9:10 AM"
  4. System reconstructs version at that point:
     — Load snapshot ≤ that version
     — Replay operations up to that version
  5. Alice sees the document as it was at 9:10 AM (read-only)
  6. Diff view highlights what changed

3:00 PM — Bob restores an earlier version.
  
  Bob realizes paragraph 4 was better before Carol's edits.
  
  1. Bob clicks "Restore this version" on version 55
  2. System reconstructs version 55 (snapshot + replay)
  3. Creates a "replace_all" operation as version 281
  4. Broadcasts to all clients
  5. Alice and Carol see the document change
  6. Version history shows: "Bob Sharma restored version 55 — 3:00 PM"
  7. Carol can see her work is gone but can restore version 280 if needed

━━━ WHAT MAKES THIS WORK ━━━

  WebSocket: persistent connection for real-time keystroke delivery
  Kafka: decouples ingestion from processing, ensures ordering per document
  OT: resolves conflicts between concurrent edits automatically
  MongoDB: stores document content as flexible JSON tree
  Cassandra: stores every operation ever made (version history)
  Snapshots: enable fast reconstruction of any past version
  Redis: ephemeral session state for cursors and presence
  IndexedDB: enables full offline editing with local queue
  Service Worker: caches the app for offline loading
  PostgreSQL: manages users, permissions, sharing (relational data)

All of these components work together to create the illusion that 3 people are simultaneously writing on the same piece of paper — even when one of them is on an airplane. That illusion, made seamless for the user, is the art of system design.`,
    analogy: `📝 The complete Google Docs system is like a collaborative art studio with 3 artists:

The canvas (document) is in a central gallery (server).
Each artist has a portable easel (local client) with a copy of the canvas.
A coordinator (Collaboration Service) stands in the gallery, watching all changes.

When Alice paints at the gallery → coordinator immediately tells Bob.
When Bob paints at the gallery → coordinator tells Alice.
When Carol takes a photo of the canvas and paints on the plane → she brings back her photo-with-edits, the coordinator merges it with what happened while she was gone.

The coordinator's job: make sure all three easels always show the same painting, regardless of who painted when, where, or in what order.

The gallery keeps a time-lapse camera (version history) and hourly photographs (snapshots), so anyone can see the painting at any point in its creation.

Simple to use. Incredibly complex to build. That's Google Docs.`
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
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: "rgba(255,255,255,.25)", marginBottom: 3, fontFamily: "'IBM Plex Mono',monospace" }}>Design Google Docs</div>
        <div style={{ fontSize: 17, fontWeight: 800, color: "#fff", lineHeight: 1.3 }}>Real-Time Collaborative Editing at Scale</div>
        <div style={{ fontSize: 11.5, color: "rgba(255,255,255,.35)", marginTop: 3 }}>OT, CRDTs, version history, offline sync & conflict resolution</div>
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
        <button onClick={() => nav(1)} disabled={!canN} style={{ flex: 2, padding: 12, borderRadius: 10, border: "none", background: canN ? `linear-gradient(135deg,${step.color},${step.color}99)` : "rgba(255,255,255,.08)", color: canN ? "#fff" : "rgba(255,255,255,.25)", cursor: canN ? "pointer" : "default", fontSize: 13, fontWeight: 700, fontFamily: "'IBM Plex Sans',sans-serif" }}>{canN ? "Next →" : "Google Docs mastered!"}</button>
      </div>
    </div>
  );
}
