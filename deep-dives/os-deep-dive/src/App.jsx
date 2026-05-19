import { useState, useEffect, useRef } from "react";

const SECTIONS = [
  { id: "intro", label: "What is an OS", icon: "🖥️", color: "#E8B931" },
  { id: "process", label: "Processes", icon: "⚙️", color: "#4A90D9" },
  { id: "memory", label: "Memory", icon: "🧠", color: "#50C878" },
  { id: "filesystem", label: "File Systems", icon: "📁", color: "#E74C3C" },
  { id: "io", label: "I/O & Storage", icon: "💾", color: "#9B59B6" },
  { id: "bigpicture", label: "Full Picture", icon: "🗺️", color: "#F39C12" },
];

const STEPS = [
  // ============ INTRO ============
  {
    id: 0, section: "intro",
    phase: "WHAT IS AN OS",
    title: "The OS — Your Computer's Manager",
    icon: "🖥️",
    color: "#E8B931",
    concepts: ["Operating System", "Kernel", "User Space"],
    actors: ["You", "Applications", "Operating System", "Hardware (CPU, RAM, Disk)"],
    simple: `You deploy your food delivery app's Node.js server on a Linux machine. You also run PostgreSQL, Redis, Nginx, and maybe a log collector on the SAME machine. All of these need the CPU to run their code, RAM to store their data, disk to read/write files, and the network card to send/receive data.

But there's only ONE CPU (with maybe 8 cores), 32GB of RAM, one SSD, and one network card. Five programs all want these resources simultaneously. Who decides who gets what? Who prevents PostgreSQL from reading Node.js's memory? Who makes sure one crashed program doesn't bring down the entire machine?

The Operating System. That's its entire job — managing shared resources (CPU, RAM, disk, network) and keeping programs isolated from each other. Without an OS, only one program could run at a time, and a bug in any program could corrupt everything.`,
    detail: `THE OS HAS THREE CORE JOBS:

1. RESOURCE MANAGEMENT
   — CPU: Which program runs right now? For how long? Then who's next?
   — RAM: Which program gets how much memory? Where in physical RAM?
   — Disk: Which program can read/write which files?
   — Network: Which program owns which port? Who gets incoming packets?

2. ISOLATION / PROTECTION
   — Node.js can't read PostgreSQL's memory (process isolation)
   — A regular user can't delete system files (permission system)
   — A crashed Redis doesn't crash your whole server (fault containment)

3. ABSTRACTION
   — Programs don't need to know which brand of SSD you have
   — Programs don't care if RAM is DDR4 or DDR5
   — Programs just say "open file X" and the OS handles the details
   — This abstraction layer is why the same Node.js code runs on any Linux machine

THE OS STRUCTURE:

┌──────────────────────────────────────┐
│  USER SPACE (Ring 3 — restricted)    │
│  ┌─────┐ ┌──────┐ ┌─────┐ ┌─────┐  │
│  │Node │ │Postgr│ │Redis│ │Nginx│  │
│  │.js  │ │SQL   │ │     │ │     │  │
│  └──┬──┘ └──┬───┘ └──┬──┘ └──┬──┘  │
│     │       │        │       │      │
│─────┼───────┼────────┼───────┼──────│
│  KERNEL SPACE (Ring 0 — full power)  │
│  ┌─────────────────────────────────┐ │
│  │ Process Scheduler               │ │
│  │ Memory Manager                  │ │
│  │ File System                     │ │
│  │ Device Drivers                  │ │
│  │ Network Stack                   │ │
│  └─────────────────────────────────┘ │
│─────────────────────────────────────│
│  HARDWARE                            │
│  CPU    RAM    SSD    Network Card   │
└──────────────────────────────────────┘

KERNEL vs USER SPACE — the critical divide:

The KERNEL is the core of the OS. It runs with full hardware access (Ring 0 in x86 terminology). It can access any memory address, talk to any hardware device, and execute any CPU instruction. If the kernel crashes, the entire machine crashes (that's a "kernel panic" on Linux, "blue screen" on Windows).

USER SPACE is where your programs run. They're restricted (Ring 3). They CANNOT directly access hardware, other programs' memory, or kernel data structures. If they want to do anything involving hardware (read a file, send a network packet, allocate memory), they must ASK the kernel via a SYSTEM CALL.

KERNEL MODE vs USER MODE:
The CPU itself has a mode bit. When running kernel code, the bit is set to "kernel mode" — all instructions allowed. When running your Node.js code, the bit is set to "user mode" — privileged instructions blocked.

If Node.js tries to directly access a hardware register, the CPU raises a "protection fault" and the kernel terminates Node.js. This is how isolation is ENFORCED by hardware, not just by convention.

TYPES OF OS:

BATCH OS (1950s-60s): One job at a time. Submit a stack of punch cards, wait hours for results. No interaction. Like submitting homework and getting it back next week.

MULTIPROGRAMMING OS: Multiple programs loaded in memory. When one waits for I/O (disk read), another runs. CPU is never idle. But no user interaction while running.

MULTITASKING OS (what we use today): Multiple programs share the CPU by rapidly switching between them. Each gets a tiny time slice (milliseconds). APPEARS like everything runs simultaneously. This is what Linux, macOS, Windows do.

REAL-TIME OS (RTOS): Used in cars, medical devices, rockets. Guarantees response within a strict time limit. Your car's braking system can't afford to wait because the OS is busy with something else.

Your Linux server runs a MULTITASKING OS — Node.js, PostgreSQL, Redis, Nginx all share the CPU by taking tiny turns, thousands of times per second.`,
    analogy: `🍕 The OS is the manager of a restaurant kitchen. There's one stove (CPU), limited counter space (RAM), one walk-in fridge (disk), and one delivery window (network). Five chefs (programs) all need these resources. The manager decides: "Chef A uses the stove for 10 seconds, then Chef B gets it. Chef C gets this section of counter space, Chef D gets that section. Nobody touches another chef's ingredients (memory isolation)." Without the manager, it's chaos — chefs fighting over the stove, contaminating each other's dishes.`
  },
  {
    id: 1, section: "intro",
    phase: "SYSTEM CALLS",
    title: "System Calls — How Programs Talk to the OS",
    icon: "📞",
    color: "#F39C12",
    concepts: ["System Call", "User Mode", "Kernel Mode", "Trap"],
    actors: ["Node.js (User Space)", "System Call Interface", "Kernel", "Hardware"],
    simple: `Your Node.js server wants to read a file (restaurant menu data from disk). But Node.js runs in user space — it can't touch the disk directly. So it makes a SYSTEM CALL — a formal request to the kernel: "Hey OS, please read file /data/menu.json and give me the contents."

A system call is like a government service counter. You (the citizen/program) can't walk into the government vault yourself. You fill out a form at the counter (system call), the government employee (kernel) goes into the vault (hardware), gets what you need, and hands it to you at the counter.

Every time your program does ANYTHING involving hardware — reading files, sending network packets, allocating memory, creating processes — it's making a system call, even if the programming language hides it from you.`,
    detail: `WHAT HAPPENS DURING A SYSTEM CALL:

When Node.js calls: fs.readFile("/data/menu.json")

Step 1: Node.js (user space) calls a library function (libc's read())

Step 2: The library puts the system call NUMBER and arguments into CPU registers:
   Register: syscall number = 0 (read)
   Register: file descriptor = 3 
   Register: buffer address = 0x7fff5abc
   Register: bytes to read = 4096

Step 3: Execute the TRAP instruction (also called "int 0x80" or "syscall")
   — This is a special CPU instruction that:
   — Switches CPU from user mode to kernel mode
   — Jumps to the kernel's system call handler
   — Like pressing the "service bell" at the government counter

Step 4: Kernel takes over:
   — Reads the syscall number from register → "ah, it's a read() call"
   — Validates: "Does this process have permission to read this file?"
   — Calls the file system code to locate the file on disk
   — Issues disk I/O commands to the SSD controller
   — Waits for data (or puts the process to sleep while waiting)
   — Copies data from kernel buffer to the user's buffer address

Step 5: Kernel switches CPU back to user mode, returns result to Node.js

Step 6: Node.js continues running with the file data

NORMAL FUNCTION CALL vs SYSTEM CALL:

NORMAL FUNCTION CALL (e.g., sorting an array):
   — Stays in user space entirely
   — Just jumps to another code address in your program
   — Fast (~1 nanosecond)
   — No mode switch, no kernel involvement

SYSTEM CALL (e.g., reading a file):
   — Crosses from user space to kernel space and back
   — CPU mode switch (user → kernel → user)
   — Kernel validates permissions, accesses hardware
   — Slow (~1000 nanoseconds = 1 microsecond)
   — ~1000x slower than a normal function call!

This is why system calls are expensive and programs try to minimize them. Reading a file 1 byte at a time = 1 million system calls for 1MB. Reading 4KB at a time = 256 system calls. That's why I/O buffers exist.

CATEGORIES OF SYSTEM CALLS:

PROCESS CONTROL:
   fork()  — Create a new process (copy of current one)
   exec()  — Replace current process with a new program
   exit()  — Terminate current process
   wait()  — Wait for a child process to finish
   
   When you run "node server.js" in terminal:
   Terminal calls fork() → creates child process
   Child calls exec("node", "server.js") → becomes Node.js

FILE OPERATIONS:
   open()  — Open a file, get a file descriptor (a number)
   read()  — Read bytes from a file descriptor
   write() — Write bytes to a file descriptor
   close() — Close a file descriptor
   
   Node.js reading menu.json:
   fd = open("/data/menu.json") → returns 3 (file descriptor)
   data = read(fd, buffer, 4096) → reads 4096 bytes
   close(fd) → done

MEMORY:
   mmap()  — Map a file or memory region into the process's address space
   brk()   — Expand the heap (where malloc gets memory)

NETWORK:
   socket()  — Create a network endpoint
   bind()    — Assign an address/port to the socket
   listen()  — Start listening for connections
   accept()  — Accept an incoming connection
   send()    — Send data
   recv()    — Receive data
   
   Nginx listening on port 80:
   s = socket() → create a TCP socket
   bind(s, port=80) → claim port 80
   listen(s) → start accepting connections
   conn = accept(s) → wait for a client
   data = recv(conn) → read the HTTP request

When you type "ls" in terminal:
   Terminal: fork() → exec("ls") → ls calls opendir(".") → readdir() → write() to terminal → exit()
   That simple "ls" made ~10 system calls.`,
    analogy: `🍕 A system call is like ordering at a restaurant counter. You (Node.js in user mode) can't enter the kitchen (kernel/hardware). You submit an order at the counter (system call), the kitchen staff (kernel) prepares it using their equipment (hardware), and slides the result back to you. A normal function call is like talking to your friend at the same table — no counter visit needed, instant. Every trip to the counter (system call) costs time, so smart programs batch their orders (buffered I/O) instead of asking for one thing at a time.`
  },
  // ============ PROCESSES ============
  {
    id: 2, section: "process",
    phase: "PROCESSES",
    title: "Processes and Their States",
    icon: "🔄",
    color: "#4A90D9",
    concepts: ["Process", "PCB", "Process States", "Context Switch"],
    actors: ["Node.js Process", "PostgreSQL Process", "CPU Scheduler", "CPU Core"],
    simple: `When you run "node server.js", the OS creates a PROCESS. A process is a running instance of a program. It's not just the code — it includes the code, the data the program is working with, the program counter (which line is executing), registers, open files, network connections, and its own isolated chunk of memory.

Your server machine has these processes running simultaneously: Node.js (PID 1234), PostgreSQL (PID 1235), Redis (PID 1236), Nginx (PID 1237), and dozens of system processes. But you have maybe 8 CPU cores. How do 50+ processes "run simultaneously" on 8 cores? They don't — they TAKE TURNS so fast (thousands of switches per second) that it LOOKS simultaneous.`,
    detail: `PROCESS CONTROL BLOCK (PCB) — the OS's record for each process:

For your Node.js process, the OS maintains:
   Process ID (PID): 1234
   State: RUNNING / READY / WAITING / etc.
   Program Counter: Which instruction to execute next
   CPU Registers: Saved register values
   Memory Info: Where this process's memory is (page table)
   Open Files: [fd 0: stdin, fd 1: stdout, fd 3: menu.json, fd 4: socket:3000]
   Owner: user "deploy", group "webapps"
   Priority: 20 (normal)
   CPU time used: 45.3 seconds
   Parent PID: 1100 (the terminal that started it)

THE 5 PROCESS STATES:

                    ┌──────────────┐
    fork()          │              │
   ───────────────→ │     NEW      │
                    │  (created)   │
                    └──────┬───────┘
                           │ admitted to ready queue
                           ▼
                    ┌──────────────┐     scheduled by CPU     ┌──────────────┐
                    │              │ ─────────────────────────→│              │
                    │    READY     │                           │   RUNNING    │
                    │ (waiting for │ ←─────────────────────────│ (on the CPU) │
                    │  CPU turn)   │    preempted / time       │              │
                    └──────────────┘    slice expired          └──────┬───────┘
                           ▲                                          │
                           │                                          │
                           │    I/O complete                          │ waiting for I/O
                           │    or event                              │ (disk read, network,
                           │                                          │  user input, sleep)
                    ┌──────┴───────┐                                  │
                    │              │ ←────────────────────────────────┘
                    │   WAITING    │
                    │  (blocked)   │
                    └──────────────┘

    RUNNING → exit() → TERMINATED (process done, resources freed)

Real example on your server:

Node.js process lifecycle:
   NEW: You type "node server.js" → OS creates process
   READY: Process loaded, waiting for CPU to schedule it
   RUNNING: CPU executes Node.js code (handling HTTP request)
   WAITING: Node.js calls read() to read from disk → process BLOCKED
           while disk fetches data (can't use CPU anyway, just waiting)
           OS switches CPU to PostgreSQL (which was READY)
   READY: Disk read complete! Node.js moves back to ready queue
   RUNNING: CPU schedules Node.js again, continues processing

This RUNNING → WAITING → READY → RUNNING cycle happens thousands of times per second. Every disk read, network recv, or sleep causes a process to enter WAITING state, freeing the CPU for someone else.

CONTEXT SWITCH — the expensive handoff:

When the CPU switches from Node.js to PostgreSQL:
1. Save Node.js's state (registers, program counter) into its PCB
2. Load PostgreSQL's state from its PCB into CPU registers
3. Switch memory mapping (page table) to PostgreSQL's memory
4. CPU starts executing PostgreSQL's code

This takes ~1-10 microseconds. Sounds tiny, but if you context-switch 10,000 times per second, that's 10-100ms of pure overhead — the CPU is spending time switching instead of doing useful work.

This is why Redis is single-threaded. One thread = zero context switches = more time doing actual work. For Redis's use case (simple memory operations), the overhead of multiple threads switching would outweigh the benefit.

PROCESS SCHEDULING ALGORITHMS:

FCFS (First Come First Served):
   Run each process to completion, in arrival order.
   Problem: One long process blocks everything (convoy effect).
   Imagine a print queue where one 1000-page job blocks everyone.

ROUND ROBIN (what modern OSes use):
   Each process gets a TIME QUANTUM (e.g., 10ms).
   After 10ms, the OS PREEMPTS (forcibly pauses) the process and gives the CPU to the next.
   Process A (10ms) → Process B (10ms) → Process C (10ms) → back to A
   Fair! Everyone gets a turn. But lots of context switches.

PRIORITY SCHEDULING:
   Each process has a priority. Higher priority runs first.
   Problem: STARVATION — low priority processes may NEVER run if high priority processes keep arriving.
   Solution: AGING — gradually increase the priority of waiting processes. A process that's been waiting for a long time eventually gets high enough priority to run.

MULTILEVEL FEEDBACK QUEUE (what Linux actually uses):
   Multiple queues with different priorities.
   New processes start in high-priority queue (short time quantum).
   If a process uses its ENTIRE time quantum (CPU-bound), it gets demoted to a lower queue.
   If a process blocks for I/O before quantum expires (I/O-bound), it stays in high queue.
   This naturally prioritizes interactive/I/O-bound processes (like your web server) over CPU-heavy batch jobs (like video encoding).

STARVATION AND AGING:
   Starvation: Low-priority process never runs because high-priority processes keep coming.
   Example: Redis (high priority) gets all the CPU. Your log rotation script (low priority) never runs. Eventually logs fill the disk and crash everything.
   Aging: The OS gradually increases waiting processes' priority. After waiting 5 minutes, the log script's priority has increased enough to finally get CPU time. Problem solved.`,
    analogy: `🍕 Imagine 5 chefs (processes) sharing 1 stove (CPU). The kitchen manager (scheduler) says "Chef A, you get the stove for 30 seconds. Time's up! Chef B, your turn. Time's up! Chef C..." (Round Robin). If a chef is waiting for delivery (I/O), they step aside (WAITING state) and the next chef uses the stove immediately. Starvation = the head chef keeps cutting the line and the apprentice never gets stove time. Aging = after waiting 30 minutes, the manager says "Enough! The apprentice gets the stove NOW."`
  },
  {
    id: 3, section: "process",
    phase: "SYNC",
    title: "Process Synchronization, Semaphores & Deadlocks",
    icon: "🔒",
    color: "#D63384",
    concepts: ["Race Condition", "Mutex", "Semaphore", "Deadlock", "Banker's Algorithm"],
    actors: ["Thread A", "Thread B", "Shared Resource (Counter)", "Lock"],
    simple: `Your food delivery app's Node.js server has a variable: available_drivers = 10. Two requests arrive simultaneously — both checking if a driver is available and assigning one. Both see available_drivers = 10 and both decrement it: 10 - 1 = 9. But two drivers were assigned! The count should be 8, not 9. You just assigned a phantom driver.

This is a RACE CONDITION — two processes/threads accessing shared data simultaneously without coordination. The result depends on WHO runs first (the "race"). Process synchronization is how you prevent this.`,
    detail: `THE RACE CONDITION IN DETAIL:

Shared variable: available_drivers = 10

Thread A (Request 1):              Thread B (Request 2):
1. Read available_drivers → 10
                                   2. Read available_drivers → 10
3. Decrement: 10 - 1 = 9
                                   4. Decrement: 10 - 1 = 9
5. Write available_drivers = 9
                                   6. Write available_drivers = 9

Final: available_drivers = 9 (WRONG! Should be 8)
Two drivers assigned but count only decremented once.

THE CRITICAL SECTION:
Lines 1+3+5 and 2+4+6 are "critical sections" — code that accesses shared data. The rule: ONLY ONE thread can be in the critical section at a time.

━━━ MUTEX (Mutual Exclusion Lock) ━━━

A mutex is a lock. Before entering the critical section, acquire the lock. When done, release it. Only one thread can hold the lock.

mutex lock;

Thread A:                          Thread B:
1. acquire(lock) ✅ (got it!)
                                   2. acquire(lock) ❌ BLOCKED (waits)
3. Read drivers → 10
4. Decrement → 9
5. Write drivers = 9
6. release(lock)
                                   7. acquire(lock) ✅ (now gets it!)
                                   8. Read drivers → 9
                                   9. Decrement → 8
                                   10. Write drivers = 8
                                   11. release(lock)

Final: available_drivers = 8 ✅ CORRECT!

This is exactly what Redis's single-threaded model gives you for free. Since Redis processes one command at a time, INCR and DECR are automatically atomic — no locks needed.

━━━ SEMAPHORE ━━━

A mutex allows exactly ONE thread in. A semaphore allows N threads in.

Two types:

BINARY SEMAPHORE (same as mutex): value is 0 or 1.
   wait(sem): if value > 0, decrement and enter. If 0, block.
   signal(sem): increment value, wake up a blocked thread.

COUNTING SEMAPHORE: value can be any non-negative number.
   Example: Your database connection pool has 5 connections.
   
   semaphore db_connections = 5;
   
   Thread 1: wait(db_connections) → value=4 → gets a connection ✅
   Thread 2: wait(db_connections) → value=3 → gets a connection ✅
   Thread 3: wait(db_connections) → value=2 → gets a connection ✅
   Thread 4: wait(db_connections) → value=1 → gets a connection ✅
   Thread 5: wait(db_connections) → value=0 → gets a connection ✅
   Thread 6: wait(db_connections) → value=0 → BLOCKED! Waits for someone to finish.
   
   Thread 2 finishes: signal(db_connections) → value=1 → Thread 6 unblocked!

This is literally how connection pooling works at the OS level.

━━━ DEADLOCK ━━━

The most feared concurrency problem:

Node.js needs: Lock A (file) then Lock B (database)
PostgreSQL needs: Lock B (database) then Lock A (file)

   Node.js: acquire(Lock_A) ✅ → tries acquire(Lock_B) → BLOCKED (PostgreSQL has it)
   PostgreSQL: acquire(Lock_B) ✅ → tries acquire(Lock_A) → BLOCKED (Node.js has it)

Both processes are waiting for each other FOREVER. Neither can proceed. The system is STUCK.

FOUR CONDITIONS FOR DEADLOCK (ALL must be true):
1. MUTUAL EXCLUSION: Resources can only be held by one process
2. HOLD AND WAIT: Process holds resources while waiting for more
3. NO PREEMPTION: Can't forcibly take a resource from a process
4. CIRCULAR WAIT: A → waits for B → waits for C → waits for A

Break ANY one condition = no deadlock.

DEADLOCK PREVENTION:
— Break "Hold and Wait": Request ALL resources at once (before starting work)
— Break "Circular Wait": Always acquire locks in the SAME ORDER
   Rule: "Always acquire Lock A before Lock B"
   Now both processes try Lock A first → one gets it, other waits → no cycle

— Break "No Preemption": If you can't get all locks, release what you have and retry

BANKER'S ALGORITHM (deadlock avoidance):
Named after a banker who must decide loan requests without going bankrupt.

The OS knows:
   — Total resources available (e.g., 10 drivers)
   — Maximum each process could EVER need
   — What each process currently holds

Before granting a resource request, the OS simulates: "If I give this resource, can ALL processes still finish?" If yes → grant. If no → deny (make the process wait).

Example:
   Total drivers: 10
   Node.js: holds 3, max needs 6 (needs 3 more)
   PostgreSQL: holds 2, max needs 5 (needs 3 more)
   Redis: holds 2, max needs 4 (needs 2 more)
   Available: 10 - 3 - 2 - 2 = 3

   Node.js requests 2 more drivers. Should we grant?
   If we grant: Available = 1. Can everyone still finish?
   — Redis needs 2 more, available = 1. Can't finish. UNSAFE!
   → Deny the request. Make Node.js wait.

   Redis requests 2 more. Grant?
   If we grant: Available = 1. 
   — Redis finishes, releases 4. Available = 5.
   — Node.js gets its 3. Available = 2. 
   — PostgreSQL gets its 3. Wait — only 2 available... 
   Actually: Node.js finishes, releases 6. Available = 8. PostgreSQL gets 3. Done!
   → Safe! Grant Redis's request.

The banker's algorithm ensures the system never enters an unsafe state.`,
    analogy: `🍕 Race condition = two waiters simultaneously checking "is the last biryani available?" Both see yes, both promise it to their customer. One customer gets nothing. Mutex = a sign that flips to "OCCUPIED" — only one waiter can check at a time. Semaphore = a parking lot with 5 spaces and a counter at the entrance. Deadlock = two chefs in a narrow kitchen, each blocking the other's path, both refusing to step back. Banker's algorithm = the kitchen manager checks before giving out knives: "If I give this knife to Chef A, will there still be enough for everyone to finish their dishes?"`
  },
  // ============ MEMORY ============
  {
    id: 4, section: "memory",
    phase: "MEMORY MGMT",
    title: "Memory Management — RAM is Limited and Shared",
    icon: "📦",
    color: "#50C878",
    concepts: ["Physical vs Virtual Memory", "Paging", "Page Table", "Memory Allocation"],
    actors: ["Node.js (wants 2GB)", "PostgreSQL (wants 8GB)", "Redis (wants 4GB)", "OS (32GB Physical RAM)"],
    simple: `Your server has 32GB of physical RAM. Node.js wants 2GB, PostgreSQL configured for 8GB shared buffers, Redis has 4GB of cached data, Nginx needs 512MB, and the OS itself needs 2GB. That's 16.5GB — fits fine.

But what if PostgreSQL grows to 16GB and Redis to 8GB? Now you need 28.5GB. Close to the limit. What if it goes over 32GB?

Memory management is how the OS allocates RAM to processes, prevents them from accessing each other's memory, and handles the situation when total demand exceeds physical RAM. The key technique: VIRTUAL MEMORY — giving each process the ILLUSION of having its own private, contiguous, massive memory space, even though physical RAM is shared and limited.`,
    detail: `PHYSICAL vs VIRTUAL MEMORY:

WITHOUT virtual memory (old systems):
   Process A gets RAM addresses 0-1000
   Process B gets RAM addresses 1001-2000
   Process A has a bug that writes to address 1500 → CORRUPTS Process B!
   Also, Process A must know its exact position in RAM. Move it? All addresses break.

WITH virtual memory (modern systems):
   Every process thinks it has addresses 0 to 2^48 (256TB of address space!)
   Process A's address 500 → maps to physical RAM address 7284
   Process B's address 500 → maps to physical RAM address 19302
   Same virtual address, different physical locations!
   Process A can NEVER access Process B's physical RAM. Hardware enforced.

HOW VIRTUAL → PHYSICAL MAPPING WORKS (Paging):

Memory is divided into fixed-size PAGES (typically 4KB).
Virtual address space: Page 0, Page 1, Page 2, ...
Physical RAM: Frame 0, Frame 1, Frame 2, ...

The PAGE TABLE maps virtual pages to physical frames:
   Node.js's page table:
   Virtual Page 0 → Physical Frame 42
   Virtual Page 1 → Physical Frame 7
   Virtual Page 2 → Physical Frame 189
   Virtual Page 3 → NOT IN RAM (on disk!)

When Node.js accesses virtual address 8192 (= page 2, offset 0):
   CPU checks page table → Page 2 → Frame 189
   Physical address = Frame 189 × 4096 + offset 0 = 774144
   CPU reads physical address 774144. Node.js has no idea.

The Translation Lookaside Buffer (TLB) is a CACHE for page table lookups:
   — Page table is in RAM (slow to access)
   — TLB is in CPU (blazing fast, ~1ns)
   — 90%+ of translations hit the TLB (cache hit!)
   — This is "associative mapping" — TLB maps virtual pages to frames

MEMORY ALLOCATION TECHNIQUES:

When a new process asks for memory, the OS finds free frames:

FIRST FIT: Scan from beginning, use the first free block that's big enough.
   Free: [10KB] [4KB] [20KB] [8KB]
   Request: 7KB → uses the 10KB block (3KB wasted)
   ✅ Fast (stops at first match)
   ❌ Fragmentation at the beginning

BEST FIT: Scan ALL free blocks, use the smallest one that fits.
   Free: [10KB] [4KB] [20KB] [8KB]
   Request: 7KB → uses the 8KB block (1KB wasted)
   ✅ Least waste per allocation
   ❌ Slow (scans everything), creates tiny unusable fragments

WORST FIT: Use the LARGEST free block.
   Free: [10KB] [4KB] [20KB] [8KB]
   Request: 7KB → uses the 20KB block (13KB leftover — still usable!)
   ✅ Leftover is big enough to be useful
   ❌ Quickly fragments large blocks

DYNAMIC BINDING:
A program doesn't know which physical addresses it'll get until runtime. The compiler generates code using virtual addresses. At runtime, the OS and hardware translate these to physical addresses. This means the same compiled program can run regardless of where in physical RAM it's loaded. You can even MOVE a process's physical pages without the process knowing — just update the page table.`,
    analogy: `🍕 Virtual memory is like hotel rooms. Every guest (process) gets room "101" on their key card. But Guest A's "room 101" is physically room 3042 on floor 30, and Guest B's "room 101" is physically room 1207 on floor 12. The front desk (page table) maps room numbers to physical locations. Guests never know their real room number and can never accidentally enter another guest's room. First Fit = take the first available room. Best Fit = find the room that's closest in size to what you need. Worst Fit = give them the biggest suite (leaves the most space for others later).`
  },
  {
    id: 5, section: "memory",
    phase: "VIRTUAL MEMORY",
    title: "Page Faults, Thrashing & Belady's Anomaly",
    icon: "💥",
    color: "#E74C3C",
    concepts: ["Page Fault", "Swapping", "Thrashing", "Belady's Anomaly", "Cache"],
    actors: ["Process", "Page Table", "Physical RAM (full!)", "Swap Space (disk)"],
    simple: `Your server has 32GB RAM. Total memory demand from all processes: 48GB. 16GB more than available! Does everything crash?

No. The OS uses VIRTUAL MEMORY's second superpower: SWAPPING. It keeps the most-used 32GB in RAM and puts the rarely-used 16GB on disk (in a "swap" file/partition). When a process accesses swapped-out data, the OS brings it back into RAM (swapping out something else). This gives the illusion of 48GB of memory on a 32GB machine.

The catch? Disk is 1000x slower than RAM. If the OS swaps too aggressively, the system slows to a crawl. That's THRASHING.`,
    detail: `PAGE FAULT — what happens when data isn't in RAM:

Node.js accesses virtual page 47.
CPU checks page table: Page 47 → "NOT IN RAM" (valid bit = 0)
CPU raises a PAGE FAULT interrupt.

The OS page fault handler:
1. Is this a valid address? (Is page 47 within Node.js's allocated space?)
   — If invalid → SEGMENTATION FAULT. Kill the process. This is the famous "segfault."
   — If valid but not in RAM → it's been swapped to disk.

2. Find a free frame in RAM.
   — If free frame exists → use it.
   — If RAM is full → EVICT a page from RAM to make space.
     Which page to evict? This is where page replacement algorithms come in.

3. Read the needed page from disk (swap) into the free frame. (~5-10ms — SLOW!)

4. Update the page table: Page 47 → Frame 201 (valid bit = 1)

5. Restart the instruction that caused the fault. Node.js continues, never knowing.

PAGE REPLACEMENT ALGORITHMS (which page to evict?):

LRU (Least Recently Used):
   Evict the page accessed longest ago.
   RAM: [Page 3 (used 1ms ago)] [Page 7 (used 50ms ago)] [Page 12 (used 500ms ago)]
   Evict Page 12 — hasn't been used in 500ms, probably not needed soon.
   ✅ Usually the best choice in practice.
   ❌ Expensive to track exact usage times.

FIFO (First In First Out):
   Evict the page that's been in RAM the longest.
   Simple, but a page loaded long ago might still be heavily used (like kernel code).

OPTIMAL (theoretical):
   Evict the page that won't be used for the longest time IN THE FUTURE.
   ✅ Provably the best possible algorithm.
   ❌ Impossible to implement (requires predicting the future).
   Used as a benchmark to compare other algorithms against.

BELADY'S ANOMALY — a counterintuitive surprise:

You'd think: "More RAM frames = fewer page faults. Always."
With FIFO replacement, this is NOT always true!

Example with pages accessed in order: 1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5

With 3 frames: 9 page faults
With 4 frames: 10 page faults ← MORE faults with MORE memory!

This ONLY happens with FIFO. LRU doesn't have this anomaly.
It's called Belady's Anomaly and it's a classic interview question.
The takeaway: FIFO is a bad page replacement algorithm. Use LRU.

THRASHING — when virtual memory backfires:

Scenario: 50 processes all actively using their memory. Total working set: 48GB. Physical RAM: 32GB.

Process A page faults → evicts Process B's page
Process B page faults → evicts Process C's page
Process C page faults → evicts Process A's page
Process A page faults → evicts Process B's page
... ENDLESS CYCLE

The system spends 99% of its time swapping pages in and out, 1% doing actual work. CPU utilization drops to nearly 0% even though the machine is "busy."

This is THRASHING. Your server becomes completely unresponsive.

Signs: disk I/O at 100%, CPU usage near 0%, everything is frozen.

Solutions:
— Add more RAM (the real fix)
— Kill some processes to reduce memory demand
— Set memory limits (cgroups/Docker) so one process can't consume everything
— Use OOM Killer: Linux automatically kills the process using the most memory

This is why you set max memory limits for Redis (maxmemory 4gb) and PostgreSQL (shared_buffers 8GB). Without limits, one process could eat all RAM and thrash the entire server.

CACHE (the memory hierarchy, tying it all together):

CPU Registers:     <1ns        ~1KB     (fastest, smallest)
L1 Cache:          ~1ns        ~64KB
L2 Cache:          ~4ns        ~256KB
L3 Cache:          ~10ns       ~8MB
RAM:               ~100ns      ~32GB
SSD:               ~100,000ns  ~500GB
HDD:               ~10,000,000ns ~2TB   (slowest, largest)

Each level is a CACHE for the level below it:
— L1 caches frequently used RAM data
— RAM caches frequently used disk data (page cache)
— The OS page cache keeps recently-read file data in RAM
  so the next read() doesn't hit the disk

Redis itself IS a cache — it keeps DB data in RAM so your app doesn't hit the slow database.

The entire computer is a hierarchy of caches, each level trading size for speed.`,
    analogy: `🍕 Page fault = you need an ingredient that's in the walk-in fridge (disk), not on the counter (RAM). You stop cooking, walk to the fridge, get it, put it on the counter (evicting something else to the fridge to make room). Slow but works. Thrashing = you keep walking to the fridge 100 times per minute because your counter is too small. You spend all your time walking and zero time cooking. Belady's anomaly = giving you a slightly bigger counter somehow makes you walk to the fridge MORE often (only with a specific organization method). Cache = keeping the most-used ingredients right next to the stove. Salt, oil, garlic — always within arm's reach.`
  },
  // ============ FILE SYSTEMS ============
  {
    id: 6, section: "filesystem",
    phase: "FILE SYSTEM",
    title: "File Systems — Organizing Data on Disk",
    icon: "📁",
    color: "#E74C3C",
    concepts: ["File System", "Inode", "Directory", "Allocation", "Fragmentation"],
    actors: ["Application", "File System (ext4)", "Disk Blocks"],
    simple: `Your SSD is just a grid of billions of storage cells, each holding 0 or 1. There's no concept of "files" or "folders" at the hardware level. The FILE SYSTEM is the OS component that creates this illusion — organizing raw disk blocks into a structured hierarchy of directories and files that humans and programs can work with.

When Node.js says open("/data/menu.json"), the file system translates that human-readable path into specific disk locations where the file's bytes are stored.`,
    detail: `HOW FILES ARE STORED — THE INODE:

Every file on Linux has an INODE (index node) — a data structure that stores everything ABOUT the file EXCEPT its name:

Inode #4521 (for menu.json):
   Size: 24,576 bytes (24KB)
   Owner: user "deploy"
   Group: "webapps"
   Permissions: rw-r--r-- (owner can read/write, others can only read)
   Created: 2024-01-15 09:00:00
   Modified: 2024-01-15 12:30:00
   Link count: 1
   Data block pointers:
      Block 0: disk block #8042 (4KB of file data)
      Block 1: disk block #8043 (4KB)
      Block 2: disk block #9701 (4KB)
      Block 3: disk block #9702 (4KB)
      Block 4: disk block #12004 (4KB)
      Block 5: disk block #12005 (4KB)
   (6 blocks × 4KB = 24KB total)

The file NAME ("menu.json") is stored in the DIRECTORY, not in the inode. A directory is just a special file that contains a list of (name → inode number) mappings:

Directory /data/ (inode #300):
   "menu.json"     → inode #4521
   "config.yaml"   → inode #4522
   "restaurants/"   → inode #4523 (another directory)

When Node.js opens "/data/menu.json":
1. Start at root directory "/" (inode #2, always)
2. Find "data" in root → inode #300
3. Read inode #300 (it's a directory) → find "menu.json" → inode #4521
4. Read inode #4521 → get data block pointers
5. Read disk blocks 8042, 8043, 9701, 9702, 12004, 12005
6. Concatenate → that's the file content!

FILE ALLOCATION METHODS:

CONTIGUOUS ALLOCATION:
   File occupies consecutive disk blocks: blocks 100, 101, 102, 103
   ✅ Super fast sequential read (disk head moves straight)
   ❌ Finding a large enough contiguous space is hard
   ❌ File can't grow (next block might be taken)
   Used by: Older systems, CD-ROMs

LINKED ALLOCATION:
   Each block contains a pointer to the next block:
   Block 100 → "data + pointer to block 205"
   Block 205 → "data + pointer to block 89"
   Block 89  → "data + pointer to null (end)"
   ✅ File can grow easily (just add a block anywhere)
   ❌ Random access is SLOW (to read byte 10,000, follow the chain from start)
   ❌ One corrupted pointer loses the rest of the file
   Used by: FAT file system (USB drives)

INDEXED ALLOCATION (what modern systems use):
   An index block stores ALL the block pointers:
   Index block: [100, 205, 89, 507, 1042]
   ✅ Fast random access (jump to any block directly)
   ✅ File can grow (add to the index)
   ❌ Small overhead for the index block
   Used by: ext4 (Linux), NTFS (Windows)

This is exactly what inodes do — they store the index of block pointers.

FRAGMENTATION:

EXTERNAL FRAGMENTATION:
   Free space exists but is scattered in small pieces.
   Free blocks: [2 blocks here] [1 block there] [3 blocks here]
   Total free: 6 blocks. But you can't allocate a 5-block contiguous file!
   Solution: Defragmentation (rearrange files to consolidate free space)
   SSDs don't suffer as much (no physical head movement penalty)

INTERNAL FRAGMENTATION:
   Block size is 4KB. Your file is 5KB. Needs 2 blocks (8KB).
   3KB is wasted inside the second block.
   Solution: Nothing really — it's a fixed cost of block-based storage.

FILE SYSTEM TYPES:
— ext4: Default Linux. Journaling, extents, 1 exabyte max. Your server uses this.
— XFS: High-performance, great for large files. Often used for databases.
— NTFS: Windows. ACLs, encryption, compression built-in.
— FAT32: Simple, universal. USB drives, SD cards. 4GB file size limit.
— ZFS: Advanced. Checksums every block, snapshots, built-in RAID. Used for storage servers.

JOURNALING (how ext4 prevents corruption):
What if power fails WHILE writing a file? File half-written = corrupted.

Journal (like a database WAL):
1. Before writing file data, write the INTENT to the journal: "About to write blocks 100-103"
2. Write the actual data blocks
3. Mark journal entry as complete

If power fails during step 2:
   On reboot, OS reads journal → "unfinished write to blocks 100-103"
   → Undo the partial write or redo it. File system stays consistent.

This is the same Write-Ahead Log concept from our database chapter! Databases and file systems solve the durability problem the same way.

DEALLOCATION:
When you delete a file (rm menu.json):
   — Directory entry removed (name no longer in /data/)
   — Inode's link count decremented
   — If link count = 0: inode marked as free, data blocks marked as free
   — The actual data on disk is NOT erased! Just marked as "available to overwrite"
   — This is why deleted files can sometimes be recovered (data is still there until overwritten)`,
    analogy: `🍕 A file system is like a warehouse's organization system. The raw warehouse (disk) is just empty shelf space. The file system creates: a master catalog (inode table) listing every item's shelf locations, labeled aisles (directories) with signs pointing to items, and a system for marking which shelf spaces are free. Contiguous allocation = item must be on consecutive shelves. Linked = each shelf has a note saying "next part on shelf 205." Indexed = one master card lists all shelf numbers for each item. Fragmentation = empty shelf spaces scattered everywhere, no contiguous run large enough for a new big item. Journaling = writing your plan on a sticky note before actually moving items, so if the power goes out, you know what was half-done.`
  },
  // ============ I/O ============
  {
    id: 7, section: "io",
    phase: "I/O & SECURITY",
    title: "I/O Systems & Security Threats",
    icon: "🔌",
    color: "#9B59B6",
    concepts: ["I/O Scheduling", "DMA", "Buffering", "Security Threats"],
    actors: ["Application", "OS I/O Scheduler", "Device Driver", "Hardware (Disk, Network)"],
    simple: `Every time Node.js reads a file, sends a network response, or writes a log, it's doing I/O (Input/Output). I/O is the SLOWEST part of computing — disk reads take millions of CPU cycles. The OS has sophisticated systems to manage I/O efficiently, and also security mechanisms to prevent processes from accessing resources they shouldn't.`,
    detail: `HOW I/O WORKS:

When Node.js writes a response to a client:

1. Node.js calls write(socket_fd, response_data, length)
2. System call → kernel takes over
3. Kernel copies data from user buffer to kernel buffer
4. Kernel passes data to the NETWORK DRIVER
5. Network driver programs the NETWORK CARD to send the data
6. DMA (Direct Memory Access) takes over:
   — The network card reads data directly from RAM
   — CPU is FREE during this time — it can run other processes!
   — When transfer is complete, network card raises an INTERRUPT
7. CPU handles interrupt: "network send complete"
8. Kernel marks the write() system call as done
9. Node.js continues

DMA (Direct Memory Access) — WHY IT'S CRUCIAL:

WITHOUT DMA:
   CPU reads one byte from RAM → writes to network card.
   CPU reads another byte → writes to network card.
   Repeat for every byte. CPU is 100% busy doing data copying. Can't run any other process.

WITH DMA:
   CPU tells DMA controller: "Copy 4096 bytes from RAM address X to network card"
   DMA controller handles the transfer independently.
   CPU goes and runs PostgreSQL queries or handles other requests.
   DMA: "Done!" (interrupt) → CPU quickly acknowledges, continues.

DMA is why your server can handle 10,000 network connections simultaneously. The CPU sets up each transfer and then does other work while hardware handles the data movement.

I/O BUFFERING:

Without buffering:
   App writes 1 byte → system call → kernel → disk write → return.
   1 million bytes = 1 million system calls = extremely slow.

With buffering:
   App writes 1 byte → goes to user buffer (memory)
   ...writes more bytes to buffer...
   Buffer full (4KB) → ONE system call → kernel → disk write
   1 million bytes = ~244 system calls = fast!

THREE LEVELS OF BUFFERING:
1. User buffer (in your app's memory — e.g., Node.js Buffer)
2. Kernel buffer (OS collects writes, flushes efficiently)
3. Device buffer (disk/network card has its own small buffer)

This is why fflush() / fsync() exists — it forces the kernel to actually write to disk instead of just holding data in the kernel buffer.

I/O SCHEDULING (for disk):
Multiple processes want to read from disk simultaneously. Order matters because disk seek time depends on head position (for HDDs).

FCFS: First come, first served. Simple but inefficient.
SSTF (Shortest Seek Time First): Handle the request closest to current head position.
   ✅ Minimizes seek time
   ❌ Starvation (far-away requests may never be served)
SCAN (Elevator algorithm): Head moves in one direction, serving requests along the way, then reverses.
   Like an elevator: goes up serving all floors, then down.
   ✅ Fair, no starvation
   ✅ Used by modern Linux I/O schedulers

SSDs don't need seek scheduling (no physical head), but the OS still batches and orders I/O for efficiency.

━━━ SECURITY THREATS AND PROTECTION ━━━

The OS is responsible for protecting processes and data:

MEMORY PROTECTION:
   — Virtual memory prevents Process A from accessing Process B's RAM
   — Stack canaries detect buffer overflow attacks
   — ASLR (Address Space Layout Randomization): randomize where code/data is loaded in memory, making exploits harder

FILE PROTECTION:
   — Permission bits: rwxr-xr-- (owner/group/others)
   — Every file has an owner (user) and group
   — root user can bypass all permissions (that's why you don't run servers as root!)
   
   Your Node.js server runs as user "deploy":
   /data/menu.json: rw-r----- (deploy can read/write, group can read, others: nothing)
   /etc/passwd: r--r--r-- (everyone can read, nobody can write except root)
   /var/log/app.log: rw------- (only deploy can read/write)

PROCESS ISOLATION:
   — Each process has its own virtual address space
   — Processes can only communicate through OS-mediated channels (pipes, sockets, shared memory with explicit permission)
   — Docker containers add another layer: cgroups (resource limits) + namespaces (visibility isolation)

COMMON THREATS:
   — Buffer overflow: Writing past the end of a buffer to overwrite return addresses and execute malicious code. Prevented by stack canaries, ASLR, and non-executable stack.
   — Privilege escalation: Exploiting a bug to gain root access. Prevented by principle of least privilege (run as non-root) and security updates.
   — Fork bomb: :(){ :|:& };: — a process that infinitely forks copies of itself, consuming all process slots. Prevented by ulimit (max processes per user).
   — Denial of service: Consuming all resources (CPU, RAM, disk, network). Prevented by cgroups, rate limiting, and monitoring.`,
    analogy: `🍕 I/O is like the restaurant's service window. The chef (CPU) prepares the dish and puts it on the counter (buffer). A runner (DMA) takes it to the customer. The chef doesn't walk to every table — they keep cooking while runners deliver. I/O scheduling is like the elevator in a mall food court — it doesn't go to each floor randomly, it sweeps from bottom to top, then reverses (SCAN algorithm). Security = the kitchen has restricted access. Only authorized staff enter. Each chef can only access their station's ingredients. The head chef (root) can access everything.`
  },
  // ============ BIG PICTURE ============
  {
    id: 8, section: "bigpicture",
    phase: "FULL PICTURE",
    title: "Everything Connected — Your Server, One Request",
    icon: "🗺️",
    color: "#F39C12",
    concepts: ["Process", "Memory", "File System", "I/O", "System Calls", "Scheduling"],
    actors: ["Rahul's Request", "Nginx Process", "Node.js Process", "PostgreSQL Process", "Linux Kernel", "CPU", "RAM", "SSD", "Network Card"],
    simple: `Let's trace ONE HTTP request through the entire operating system — from Rahul's phone to the response appearing on his screen. Every OS concept we've covered will appear in its natural place.`,
    detail: `RAHUL SEARCHES "BIRYANI" — THE OS-LEVEL JOURNEY:

━━━ NETWORK PACKET ARRIVES ━━━

Rahul's phone sends an HTTP request. It arrives at your server's network card as electrical signals.

1. HARDWARE INTERRUPT:
   Network card receives packet → raises INTERRUPT to CPU
   CPU pauses whatever it's running (say, a Redis command)
   CPU saves current process state (context save)
   CPU jumps to the INTERRUPT HANDLER in kernel space

2. KERNEL NETWORK STACK:
   Interrupt handler → network driver reads packet from network card buffer (DMA)
   Kernel's TCP/IP stack reassembles the packet
   Kernel checks: which process is listening on port 80?
   → Nginx (PID 1237) has called accept() on port 80
   Kernel places the data in Nginx's socket buffer
   Nginx's process state: WAITING → READY (data arrived!)

━━━ NGINX PROCESSES THE REQUEST ━━━

3. CPU SCHEDULER:
   Nginx is now READY. Scheduler picks it (high priority, I/O-bound process stays in high queue — multilevel feedback queue).
   CONTEXT SWITCH: Save current process state → Load Nginx state from PCB
   Nginx is now RUNNING.

4. NGINX READS THE REQUEST:
   Nginx calls recv(socket_fd) → SYSTEM CALL → user mode → kernel mode
   Kernel copies data from socket buffer to Nginx's user buffer
   Kernel returns → kernel mode → user mode
   Nginx reads: "GET /api/restaurants?q=biryani"
   Nginx reverse-proxies to Node.js → connect() + send() to localhost:3000

━━━ NODE.JS HANDLES THE REQUEST ━━━

5. NODE.JS RECEIVES:
   Node.js was WAITING (blocked on epoll, waiting for events)
   Kernel: "Data on Node.js's socket!" → Node.js: WAITING → READY → RUNNING

6. NODE.JS CHECKS REDIS CACHE:
   Node.js calls connect() to Redis socket → SYSTEM CALL
   Sends "GET search:biryani:bangalore" → write() SYSTEM CALL
   Waits for response → WAITING state (process yields CPU!)
   
   CPU SCHEDULER: Node.js is waiting → switch to PostgreSQL (which had pending work)
   PostgreSQL runs for a few milliseconds (its own queries)
   
   Redis responds (in-memory, <1ms)
   Node.js: WAITING → READY → RUNNING
   Cache miss! Must query PostgreSQL.

7. NODE.JS QUERIES POSTGRESQL:
   Sends SQL query over local socket → write() SYSTEM CALL
   Node.js → WAITING state again (waiting for PostgreSQL)
   
   PostgreSQL: READY → RUNNING
   PostgreSQL needs to read from disk:

8. POSTGRESQL READS FROM DISK:
   PostgreSQL calls read() on the database file → SYSTEM CALL
   Kernel checks: is this file data in the PAGE CACHE (RAM)?
   
   PAGE CACHE HIT (data recently read, still in RAM):
      Copy from page cache to PostgreSQL's buffer → fast! (~0.1ms)
   
   PAGE CACHE MISS (need to read from SSD):
      Kernel sends read command to SSD via device driver
      DMA controller: "I'll handle the transfer"
      PostgreSQL → WAITING (blocked on disk I/O)
      CPU SCHEDULER: runs something else while disk works
      
      SSD completes read (~0.1ms for SSD, ~10ms for HDD)
      HARDWARE INTERRUPT → kernel → data transferred via DMA
      Data put in page cache (so next read is faster)
      Data copied to PostgreSQL's buffer
      PostgreSQL: WAITING → READY → RUNNING

9. POSTGRESQL RETURNS RESULTS:
   PostgreSQL processes the query (using its B+ Tree indexes!)
   Writes results to the socket → write() SYSTEM CALL
   Node.js: WAITING → READY → RUNNING

━━━ RESPONSE GOES BACK ━━━

10. NODE.JS BUILDS RESPONSE:
    Node.js processes PostgreSQL results (in user space, just CPU + RAM, no system calls)
    
    But wait — Node.js needs to cache in Redis:
    write() to Redis socket → SYSTEM CALL
    Redis processes (single-threaded, in-memory) → response
    
    Node.js also writes a log line:
    write() to log file fd → SYSTEM CALL
    Kernel BUFFERS this in kernel buffer (doesn't flush to disk immediately)
    Kernel will batch-flush to disk later (BUFFERED I/O)

11. NODE.JS SENDS RESPONSE:
    write(nginx_socket, response_json) → SYSTEM CALL
    Kernel copies to kernel network buffer
    Network card picks it up via DMA
    Packet sent to Rahul's phone

━━━ THE OS CONCEPT MAP ━━━

PROCESS MANAGEMENT:
   — 5 processes (Nginx, Node, PostgreSQL, Redis, logger) all sharing 8 CPU cores
   — Round Robin / Multilevel Feedback Queue scheduling
   — Context switches between processes ~1000s/second
   — Each process has its own PCB with saved state
   — I/O-bound processes (Node.js, Nginx) get high priority
   — Process states: RUNNING ↔ READY ↔ WAITING cycling constantly

MEMORY MANAGEMENT:
   — Each process has its own virtual address space (isolated)
   — Node.js thinks it has 256TB of space, uses ~2GB of physical RAM
   — Page tables map virtual pages to physical frames
   — TLB caches frequent mappings (99% hit rate)
   — Page cache keeps recently-read file data in RAM
   — If RAM is full: LRU page replacement, swap least-used pages to disk
   — If swapping becomes excessive: THRASHING

PROCESS SYNCHRONIZATION:
   — PostgreSQL uses locks (mutexes) on database rows during transactions
   — Redis avoids locks entirely (single-threaded)
   — Connection pool uses semaphore (5 connections, 6th request waits)
   — Deadlock prevention: PostgreSQL acquires locks in consistent order

FILE SYSTEM:
   — PostgreSQL data files stored in /var/lib/postgresql/
   — Inodes track file metadata + block locations
   — ext4 journaling prevents corruption on crash
   — Log files: Node.js writes → kernel buffer → batched flush to disk

I/O SYSTEMS:
   — DMA handles disk ↔ RAM and network card ↔ RAM transfers
   — CPU is freed to run processes during DMA transfers
   — Kernel buffers I/O for efficiency (batch small writes)
   — I/O scheduler orders disk reads for minimal seek time

SECURITY:
   — Processes can't read each other's memory (virtual memory isolation)
   — File permissions prevent unauthorized access
   — Node.js runs as non-root user "deploy"
   — System calls are the ONLY way to access hardware (enforced by CPU hardware)

SYSTEM CALLS in this one request:
   recv(), connect(), write(), read(), send() — at least 15-20 system calls
   Each one: user mode → kernel mode → user mode (~1 microsecond each)

TOTAL TIME: ~5-50ms for this entire journey
   Most of that time: processes in WAITING state while I/O happens
   CPU actual work: <1ms total across all processes
   The OS made it APPEAR like all 5 programs ran simultaneously and responded instantly.

That's what an operating system does. It's the invisible conductor of an orchestra — you hear beautiful music (fast app responses), but behind the scenes, it's managing a hundred musicians (processes), sharing instruments (hardware), reading sheet music (files), and ensuring nobody plays out of turn (synchronization).`,
    analogy: `🍕 One customer order flowing through the full restaurant:

Network interrupt = doorbell rings (customer arrived)
Nginx = the host who greets and seats
Context switch = manager telling one chef to pause and another to start
Node.js = the waiter taking the order
System call = waiter going to the kitchen counter (crossing from dining room to kitchen)
Redis cache = waiter checking "we already made biryani 5 minutes ago, it's on the warmer"
PostgreSQL = the actual chef cooking from scratch
Disk read = chef going to the walk-in fridge (slow!)
Page cache = ingredients already on the counter (fast!)
DMA = the dumbwaiter that moves plates between floors without the chef walking
Buffered I/O = waiter collecting 5 tables' orders before walking to the kitchen once
Page fault = ingredient not in the kitchen, must be ordered (very slow!)
Thrashing = kitchen constantly restocking from the warehouse, no actual cooking gets done
Process isolation = each chef's station is separate, can't contaminate another's food
File permissions = only the head chef can open the recipe book
Semaphore = 5 burners on the stove, 6th chef waits for an open one
Deadlock = two chefs each blocking the other in the narrow aisle
Scheduling = manager deciding which chef gets stove time and for how long

Every single OS concept has a direct, physical analog in this restaurant. And just like a well-run restaurant, a well-tuned OS makes everything look effortless to the customer — even though it's orchestrated chaos behind the kitchen door.`
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

export default function App() {
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
        <div style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "2px", color: "rgba(255,255,255,0.25)", marginBottom: "3px", fontFamily: "'IBM Plex Mono', monospace" }}>
          Operating Systems Deep Dive
        </div>
        <div style={{ fontSize: "17px", fontWeight: 800, color: "#fff", lineHeight: 1.3 }}>
          OS: What Happens Inside Your Server
        </div>
        <div style={{ fontSize: "11.5px", color: "rgba(255,255,255,0.35)", marginTop: "3px" }}>
          Processes, memory, files, I/O — traced through one HTTP request to your food app
        </div>
      </div>

      <div style={{ padding: "8px 18px", borderBottom: "1px solid rgba(255,255,255,0.05)", overflowX: "auto" }}>
        <div style={{ display: "flex", gap: "3px", minWidth: "fit-content" }}>
          {SECTIONS.map(sec => (
            <button key={sec.id} onClick={() => setActiveSection(sec.id)} style={{
              display: "flex", alignItems: "center", gap: "4px",
              padding: "6px 10px", borderRadius: "7px",
              border: activeSection === sec.id ? `1.5px solid ${sec.color}50` : "1.5px solid transparent",
              background: activeSection === sec.id ? sec.color + "14" : "rgba(255,255,255,0.025)",
              color: activeSection === sec.id ? sec.color : "rgba(255,255,255,0.35)",
              cursor: "pointer", fontSize: "10.5px", fontWeight: activeSection === sec.id ? 700 : 500,
              fontFamily: "'IBM Plex Sans', sans-serif", whiteSpace: "nowrap",
            }}>
              <span style={{ fontSize: "11px" }}>{sec.icon}</span>
              <span>{sec.label}</span>
            </button>
          ))}
        </div>
      </div>

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

      <div style={{ height: "2px", background: "rgba(255,255,255,0.03)" }}>
        <div style={{
          height: "100%", width: `${((globalIndex + 1) / STEPS.length) * 100}%`,
          background: `linear-gradient(90deg, ${step.color}88, ${step.color})`,
          transition: "all 0.4s ease",
        }} />
      </div>

      <div ref={contentRef} style={{ flex: 1, overflow: "auto", padding: "14px 18px 110px" }}>
        <div style={{ marginBottom: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "7px" }}>
            <span style={{ fontSize: "9px", fontWeight: 800, color: currentSection.color, background: currentSection.color + "18", padding: "2px 7px", borderRadius: "4px", fontFamily: "'IBM Plex Mono', monospace", letterSpacing: "1px" }}>
              {currentSection.label.toUpperCase()}
            </span>
            <span style={{ fontSize: "9px", fontWeight: 700, color: "rgba(255,255,255,0.25)", fontFamily: "'IBM Plex Mono', monospace" }}>
              {globalIndex + 1} / {STEPS.length}
            </span>
          </div>
          <h2 style={{ fontSize: "19px", fontWeight: 800, color: "#fff", lineHeight: 1.3, marginBottom: "7px" }}>
            {step.icon} {step.title}
          </h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "2px" }}>
            {step.concepts.map((c, i) => <ConceptTag key={i} label={c} />)}
          </div>
        </div>

        <div style={{ fontSize: "9.5px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: "rgba(255,255,255,0.22)", marginBottom: "1px" }}>Who's involved</div>
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
        }}>{canNext ? "Next →" : "OS mastered!"}</button>
      </div>
    </div>
  );
}
