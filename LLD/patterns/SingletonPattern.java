/*
 * SINGLETON PATTERN
 * =================
 * Intent: Ensure a class has only one instance and provide a global point of access to it.
 *
 * When to use: Configuration managers, connection pools, caches, logging, thread pools —
 * anything where having multiple instances would cause bugs or waste resources.
 *
 * YOUR TASK:
 *   Implement Singleton THREE different ways. Yes, three. Interviewers ask about trade-offs.
 *
 *   1. EAGER initialization (simplest, thread-safe by default)
 *   2. LAZY with double-checked locking (classic interview answer)
 *   3. ENUM-based (Josh Bloch's recommended, handles serialization)
 *
 *   For each: create a ConfigManager that stores key-value pairs (Map<String, String>).
 *   It should have: get(key), set(key, value), and getInstance().
 *
 * KNOW THESE TRADE-OFFS:
 *   - Eager: Simple, but wastes memory if never used
 *   - Double-checked locking: Lazy, but verbose and easy to get wrong
 *   - Enum: Best in Java, but can't extend classes, looks weird to some
 */


// === VERSION 1: Eager Initialization ===
// YOUR CODE HERE — EagerSingleton


// === VERSION 2: Double-Checked Locking (Lazy) ===
// YOUR CODE HERE — LazySingleton
// HINT: You need 'volatile' on the instance. Do you know why?


// === VERSION 3: Enum-Based ===
// YOUR CODE HERE — EnumSingleton
// HINT: enum instances are inherently singleton and thread-safe in Java


// Main class to test all three
public class SingletonPattern {
    public static void main(String[] args) {
        // TODO: Test EagerSingleton — set a value, get it, verify same instance
        // TODO: Test LazySingleton — same test
        // TODO: Test EnumSingleton — same test
        // TODO: Verify that getInstance() returns the SAME object both times (use ==)
        System.out.println("Singleton Pattern - implement me!");
    }
}
