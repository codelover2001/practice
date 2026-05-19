/*
 * ============================================================
 * LLD Practice Plan - AlgoMaster (45 Problems, 9 Sections)
 * ============================================================
 *
 * STRATEGY: Learn pattern → Code pattern from scratch → Solve 2-3 problems using it → Next pattern
 * DO NOT: "Learn all patterns first, then solve" — you'll forget everything.
 *
 * ============================================================
 * PHASE 0: DESIGN PATTERNS (Days 1-3)
 * Code each pattern as a small standalone example BEFORE touching problems.
 * ============================================================
 *
 * Day 1 - Creational + Structural:
 *   [ ] Singleton        → (enum-based + double-checked locking) — used in: ATM, Cache, Config
 *   [ ] Factory Method   → create objects without specifying class — used in: Notification, Vehicle
 *   [ ] Abstract Factory → family of related objects — used in: UI themes, cross-platform
 *   [ ] Builder          → complex object construction — used in: Query builders, Order
 *   [ ] Decorator        → add behavior dynamically — used in: Pizza toppings, Stream wrappers
 *   [ ] Adapter          → incompatible interface bridge — used in: Payment gateways
 *
 * Day 2 - Behavioral (the heavy hitters for LLD):
 *   [ ] Strategy         → swap algorithms at runtime — used in: Payment, Pricing, Sorting
 *   [ ] Observer         → event notification — used in: Notifications, Stock price, Pub-Sub
 *   [ ] State            → object changes behavior with state — used in: Vending Machine, Elevator, ATM
 *   [ ] Command          → encapsulate request as object — used in: Undo/Redo, Task queue
 *   [ ] Chain of Resp.   → pass request along chain — used in: Logging, ATM dispenser, Middleware
 *
 * Day 3 - More Behavioral + Practice:
 *   [ ] Template Method  → skeleton algorithm, subclass fills steps — used in: Game flow, Report gen
 *   [ ] Iterator         → traverse collection without exposing internals — used in: File system
 *   [ ] Mediator         → centralize communication — used in: Chat room, Air traffic control
 *   [ ] Prototype        → clone objects — used in: Config copies, Game state snapshots
 *   [ ] Flyweight        → share common state — used in: Chess pieces, Character rendering
 *
 * ============================================================
 * PHASE 1: PROBLEMS BY SECTION (Days 4-10)
 * ============================================================
 *
 * --- Section 1: Games & Puzzles ---
 * Patterns: State, Strategy, Factory, Observer
 *   [ ] Tic Tac Toe                    [easy]
 *   [ ] Snake and Ladder               [easy]
 *   [ ] Minesweeper                    [medium]
 *   [ ] Chess Game                     [hard]
 *
 * --- Section 2: Data Structures & Search ---
 * Patterns: Singleton, Strategy, Iterator
 *   [ ] LRU Cache                      [easy]
 *   [ ] Bloom Filter                   [easy]
 *   [ ] Search Autocomplete            [easy]
 *   [ ] Simple Search Engine           [medium]
 *
 * --- Section 3: Managing States ---
 * Patterns: State (CRITICAL), Chain of Responsibility, Strategy
 *   [ ] ATM                            [medium]
 *   [ ] Vending Machine                [medium]
 *   [ ] Elevator System                [medium]
 *   [ ] Traffic Control System         [medium]
 *   [ ] Coffee Vending Machine         [hard]
 *
 * --- Section 4: Management Systems ---
 * Patterns: Strategy, Factory, Observer, Singleton
 *   [ ] Parking Lot                    [easy]
 *   [ ] Task Management System         [easy]
 *   [ ] Inventory Management           [medium]
 *   [ ] Library Management             [medium]
 *   [ ] Restaurant Management          [hard]
 *
 * --- Section 5: Social & Content Platforms ---
 * Patterns: Observer, Strategy, Factory, Decorator
 *   [ ] Stack Overflow                 [medium]
 *   [ ] Social Network                 [medium]
 *   [ ] Learning Platform              [medium]
 *   [ ] Cricinfo                       [hard]
 *   [ ] LinkedIn                       [hard]
 *   [ ] Spotify                        [hard]
 *
 * --- Section 6: Communication & Messaging ---
 * Patterns: Observer (CRITICAL), Mediator, Command
 *   [ ] Notification System            [easy]
 *   [ ] Pub Sub System                 [medium]
 *   [ ] Chat Application               [medium]
 *
 * --- Section 7: Financial & Payment Systems ---
 * Patterns: Strategy (CRITICAL), Observer, State, Chain of Resp
 *   [ ] Splitwise                      [medium]
 *   [ ] Payment Gateway                [medium]
 *   [ ] Online Stock Exchange          [hard]
 *
 * --- Section 8: E-commerce & Booking Systems ---
 * Patterns: Strategy, Observer, State, Factory, Builder
 *   [ ] Amazon                         [hard]
 *   [ ] Movie Booking System           [hard]
 *   [ ] Online Auction System          [hard]
 *   [ ] Food Delivery Service          [hard]
 *   [ ] Ride Hailing Service           [hard]
 *   [ ] Amazon Locker                  [medium]
 *   [ ] Shopping Cart                  [medium]
 *   [ ] Car Rental System              [hard]
 *   [ ] Meeting Scheduler              [hard]
 *
 * --- Section 9: Developer Tools & Infrastructure ---
 * Patterns: Singleton, Strategy, Chain of Resp, Command, Observer
 *   [ ] URL Shortener                  [medium]
 *   [ ] Logging Framework              [medium]
 *   [ ] Rate Limiter                   [medium]
 *   [ ] In Memory File System          [hard]
 *   [ ] Version Control System         [hard]
 *   [ ] Task Scheduler                 [hard]
 *
 * ============================================================
 * HOW TO USE CURSOR FOR EACH PROBLEM
 * ============================================================
 * 1. Create file: ParkingLot.java (all classes in one file for practice)
 * 2. YOU write: enums, class names, fields, method signatures
 * 3. CURSOR helps: constructors, getters, toString, imports
 * 4. YOU write: business logic inside methods
 * 5. When done, ask: "Review this like an LLD interviewer"
 * 6. .cursor/rules/lld-practice.mdc enforces this balance
 */
