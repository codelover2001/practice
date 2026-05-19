import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicReference;

/**
 * PROBLEM 12: CAS (Compare-And-Swap)
 *
 * Atomic operation: "If value is still X, change it to Y".
 * The foundation of lock-free algorithms. CPU-level instruction (CMPXCHG on x86).
 *
 * Pseudocode:
 *   boolean CAS(address, expectedValue, newValue) {
 *       if (*address == expectedValue) {
 *           *address = newValue;
 *           return true;
 *       }
 *       return false;
 *   }
 *
 * INTERVIEW TIP: Know the CAS retry loop pattern. It's how all Atomic* classes work.
 * Also know the ABA problem and when CAS is better vs worse than locks.
 */
public class CASDemo {

    // --- Manual CAS loop: increment without locks ---
    static class CASCounter {
        private final AtomicInteger value = new AtomicInteger(0);

        public void increment() {
            int expected, newVal;
            do {
                expected = value.get();         // read current
                newVal = expected + 1;          // compute new
            } while (!value.compareAndSet(expected, newVal)); // CAS: set if unchanged
            // If another thread modified value between get() and CAS → retry
        }

        public int get() { return value.get(); }
    }

    // --- Lock-free max: atomically update to max of current and new ---
    static class AtomicMax {
        private final AtomicInteger max = new AtomicInteger(Integer.MIN_VALUE);

        public void update(int newVal) {
            int current;
            do {
                current = max.get();
                if (newVal <= current) return; // no update needed
            } while (!max.compareAndSet(current, newVal));
        }

        public int get() { return max.get(); }
    }

    // --- Lock-free linked list append (simplified) ---
    static class LockFreeList {
        static class Node {
            final int value;
            final AtomicReference<Node> next = new AtomicReference<>(null);
            Node(int value) { this.value = value; }
        }

        private final AtomicReference<Node> head = new AtomicReference<>(null);

        public void prepend(int value) {
            Node newNode = new Node(value);
            Node oldHead;
            do {
                oldHead = head.get();
                newNode.next.set(oldHead);
            } while (!head.compareAndSet(oldHead, newNode));
        }

        public int size() {
            int count = 0;
            Node curr = head.get();
            while (curr != null) {
                count++;
                curr = curr.next.get();
            }
            return count;
        }
    }

    // --- Show how AtomicInteger.incrementAndGet works internally ---
    static void showInternals() {
        System.out.println("--- How AtomicInteger works under the hood ---\n");
        System.out.println("public final int incrementAndGet() {");
        System.out.println("    int prev, next;");
        System.out.println("    do {");
        System.out.println("        prev = get();              // volatile read");
        System.out.println("        next = prev + 1;");
        System.out.println("    } while (!compareAndSet(prev, next)); // CAS");
        System.out.println("    return next;");
        System.out.println("}");
        System.out.println();
        System.out.println("The CAS maps to a single CPU instruction (LOCK CMPXCHG on x86).");
        System.out.println("No kernel-level lock, no context switch — just a hardware retry.\n");
    }

    public static void main(String[] args) throws InterruptedException {
        System.out.println("=== CAS (Compare-And-Swap) Demo ===\n");

        showInternals();

        // --- CAS Counter ---
        System.out.println("--- CAS Counter (lock-free) ---");
        CASCounter counter = new CASCounter();

        Thread[] threads = new Thread[10];
        for (int i = 0; i < 10; i++) {
            threads[i] = new Thread(() -> {
                for (int j = 0; j < 100_000; j++) counter.increment();
            });
            threads[i].start();
        }
        for (Thread t : threads) t.join();
        System.out.println("Expected: 1000000, Got: " + counter.get());

        // --- Atomic Max ---
        System.out.println("\n--- CAS Atomic Max ---");
        AtomicMax atomicMax = new AtomicMax();
        for (int i = 0; i < 10; i++) {
            final int base = i * 100;
            threads[i] = new Thread(() -> {
                for (int j = 0; j < 100; j++) {
                    atomicMax.update(base + j);
                }
            });
            threads[i].start();
        }
        for (Thread t : threads) t.join();
        System.out.println("Max value: " + atomicMax.get() + " (expected: 999)");

        // --- Lock-free list ---
        System.out.println("\n--- Lock-free Prepend List ---");
        LockFreeList list = new LockFreeList();
        for (int i = 0; i < 10; i++) {
            threads[i] = new Thread(() -> {
                for (int j = 0; j < 1000; j++) list.prepend(j);
            });
            threads[i].start();
        }
        for (Thread t : threads) t.join();
        System.out.println("List size: " + list.size() + " (expected: 10000)");

        // --- CAS vs Locks trade-off ---
        System.out.println("\n--- When to use CAS vs Locks ---");
        System.out.println("CAS wins: low contention, simple operations, read-heavy");
        System.out.println("Locks win: high contention (CAS spin wastes CPU), complex critical sections");
        System.out.println("Rule: if your critical section is > 2-3 lines, use a lock.");

        System.out.println("\n=== Key: CAS = optimistic. Read → compute → attempt write → retry if stale. ===");
    }
}
