import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicReference;
import java.util.concurrent.atomic.AtomicStampedReference;
import java.util.concurrent.atomic.LongAdder;

/**
 * PROBLEM 6: Atomic Variables
 *
 * Lock-free thread safety using CAS (Compare-And-Swap) under the hood.
 * Way faster than synchronized for simple operations on single variables.
 *
 * INTERVIEW TIP: Know these classes and when to use them:
 *   - AtomicInteger/Long: counters, accumulators
 *   - AtomicReference: lock-free data structure nodes, singleton
 *   - AtomicStampedReference: solves ABA problem
 *   - LongAdder: high-contention counters (striped, much faster than AtomicLong)
 */
public class AtomicVariablesDemo {

    // --- AtomicInteger: basic lock-free counter ---
    static void atomicIntegerDemo() throws InterruptedException {
        System.out.println("--- AtomicInteger ---");
        AtomicInteger counter = new AtomicInteger(0);

        Thread[] threads = new Thread[10];
        for (int i = 0; i < 10; i++) {
            threads[i] = new Thread(() -> {
                for (int j = 0; j < 100_000; j++) {
                    counter.incrementAndGet(); // atomic CAS loop internally
                }
            });
            threads[i].start();
        }
        for (Thread t : threads) t.join();

        System.out.println("Expected: 1000000, Got: " + counter.get());

        // Useful atomic operations
        System.out.println("getAndAdd(5):      " + counter.getAndAdd(5));
        System.out.println("compareAndSet:     " + counter.compareAndSet(1000005, 0));
        System.out.println("After CAS reset:   " + counter.get());
        System.out.println("updateAndGet(*2):  " + counter.updateAndGet(v -> v * 2));
    }

    // --- AtomicReference: lock-free stack (Treiber stack) ---
    static class LockFreeStack<T> {
        private final AtomicReference<Node<T>> head = new AtomicReference<>(null);

        static class Node<T> {
            final T value;
            Node<T> next;
            Node(T value, Node<T> next) {
                this.value = value;
                this.next = next;
            }
        }

        public void push(T value) {
            Node<T> newHead;
            Node<T> oldHead;
            do {
                oldHead = head.get();
                newHead = new Node<>(value, oldHead);
            } while (!head.compareAndSet(oldHead, newHead)); // CAS retry loop
        }

        public T pop() {
            Node<T> oldHead;
            Node<T> newHead;
            do {
                oldHead = head.get();
                if (oldHead == null) return null;
                newHead = oldHead.next;
            } while (!head.compareAndSet(oldHead, newHead));
            return oldHead.value;
        }
    }

    static void lockFreeStackDemo() throws InterruptedException {
        System.out.println("\n--- Lock-Free Stack (Treiber Stack) ---");
        LockFreeStack<Integer> stack = new LockFreeStack<>();

        Thread pusher1 = new Thread(() -> {
            for (int i = 0; i < 1000; i++) stack.push(i);
        });
        Thread pusher2 = new Thread(() -> {
            for (int i = 1000; i < 2000; i++) stack.push(i);
        });

        pusher1.start(); pusher2.start();
        pusher1.join(); pusher2.join();

        int count = 0;
        while (stack.pop() != null) count++;
        System.out.println("Pushed 2000, popped: " + count);
    }

    // --- LongAdder: high-contention counter ---
    static void longAdderDemo() throws InterruptedException {
        System.out.println("\n--- LongAdder vs AtomicInteger (performance) ---");

        AtomicInteger atomicInt = new AtomicInteger(0);
        LongAdder longAdder = new LongAdder();
        int numThreads = 10;
        int opsPerThread = 1_000_000;

        // Benchmark AtomicInteger
        long start = System.nanoTime();
        Thread[] threads = new Thread[numThreads];
        for (int i = 0; i < numThreads; i++) {
            threads[i] = new Thread(() -> {
                for (int j = 0; j < opsPerThread; j++) atomicInt.incrementAndGet();
            });
            threads[i].start();
        }
        for (Thread t : threads) t.join();
        long atomicTime = System.nanoTime() - start;

        // Benchmark LongAdder
        start = System.nanoTime();
        for (int i = 0; i < numThreads; i++) {
            threads[i] = new Thread(() -> {
                for (int j = 0; j < opsPerThread; j++) longAdder.increment();
            });
            threads[i].start();
        }
        for (Thread t : threads) t.join();
        long adderTime = System.nanoTime() - start;

        System.out.printf("AtomicInteger: %d ms (value: %d)%n", atomicTime / 1_000_000, atomicInt.get());
        System.out.printf("LongAdder:     %d ms (value: %d)%n", adderTime / 1_000_000, longAdder.sum());
        System.out.println("LongAdder wins under high contention (striped cells).");
    }

    // --- ABA Problem demo with AtomicStampedReference ---
    static void abaDemo() {
        System.out.println("\n--- ABA Problem ---");

        // AtomicReference can't detect A → B → A changes
        AtomicReference<String> ref = new AtomicReference<>("A");
        // Thread 1 reads "A", gets preempted
        // Thread 2 changes A → B → A
        // Thread 1 wakes, CAS succeeds (value is "A") but state has changed!

        // Fix: AtomicStampedReference tracks a version stamp
        AtomicStampedReference<String> stamped = new AtomicStampedReference<>("A", 0);

        int[] stampHolder = new int[1];
        String current = stamped.get(stampHolder);
        int stamp = stampHolder[0];

        System.out.println("Initial: value=" + current + ", stamp=" + stamp);

        stamped.compareAndSet("A", "B", 0, 1);
        stamped.compareAndSet("B", "A", 1, 2);

        // Original thread tries CAS with old stamp — fails!
        boolean success = stamped.compareAndSet("A", "C", stamp, stamp + 1);
        System.out.println("CAS with old stamp (0): " + success + " (correctly FAILS)");

        current = stamped.get(stampHolder);
        success = stamped.compareAndSet("A", "C", stampHolder[0], stampHolder[0] + 1);
        System.out.println("CAS with current stamp (" + stampHolder[0] + "): " + success);
    }

    public static void main(String[] args) throws InterruptedException {
        System.out.println("=== Atomic Variables Demo ===\n");

        atomicIntegerDemo();
        lockFreeStackDemo();
        longAdderDemo();
        abaDemo();

        System.out.println("\n=== Key: Atomics = CAS loops, no locks. Use LongAdder for hot counters. ===");
    }
}
