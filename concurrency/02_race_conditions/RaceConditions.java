/**
 * PROBLEM 2: Race Conditions
 *
 * When two+ threads read-modify-write shared state without synchronization,
 * the result depends on execution order → non-deterministic bugs.
 *
 * INTERVIEW TIP: If asked "what can go wrong with shared mutable state?" →
 * demonstrate lost updates, then fix with synchronized/lock/atomic.
 *
 * RUN THIS MULTIPLE TIMES — you'll get different wrong answers each time.
 */
public class RaceConditions {

    // ---- BROKEN: Classic race condition ----
    static int unsafeCounter = 0;

    static void brokenIncrement() throws InterruptedException {
        unsafeCounter = 0;
        Runnable task = () -> {
            for (int i = 0; i < 100_000; i++) {
                unsafeCounter++; // read-modify-write is NOT atomic
            }
        };

        Thread t1 = new Thread(task);
        Thread t2 = new Thread(task);
        t1.start();
        t2.start();
        t1.join();
        t2.join();

        System.out.println("Expected: 200000");
        System.out.println("Got:      " + unsafeCounter + " (BROKEN — lost updates)");
    }

    // ---- FIX 1: synchronized ----
    static int syncCounter = 0;
    static final Object lock = new Object();

    static void fixWithSynchronized() throws InterruptedException {
        syncCounter = 0;
        Runnable task = () -> {
            for (int i = 0; i < 100_000; i++) {
                synchronized (lock) {
                    syncCounter++;
                }
            }
        };

        Thread t1 = new Thread(task);
        Thread t2 = new Thread(task);
        t1.start();
        t2.start();
        t1.join();
        t2.join();

        System.out.println("Synchronized: " + syncCounter + " (CORRECT)");
    }

    // ---- FIX 2: AtomicInteger (lock-free) ----
    static java.util.concurrent.atomic.AtomicInteger atomicCounter =
            new java.util.concurrent.atomic.AtomicInteger(0);

    static void fixWithAtomic() throws InterruptedException {
        atomicCounter.set(0);
        Runnable task = () -> {
            for (int i = 0; i < 100_000; i++) {
                atomicCounter.incrementAndGet(); // CAS under the hood
            }
        };

        Thread t1 = new Thread(task);
        Thread t2 = new Thread(task);
        t1.start();
        t2.start();
        t1.join();
        t2.join();

        System.out.println("Atomic:       " + atomicCounter.get() + " (CORRECT)");
    }

    // ---- Check-then-act race (common in interviews) ----
    static void checkThenActRace() throws InterruptedException {
        System.out.println("\n--- Check-then-act race ---");

        // Simulating a lazy singleton race
        final String[] instance = {null};

        Runnable creator = () -> {
            if (instance[0] == null) {       // CHECK
                // context switch can happen here!
                try { Thread.sleep(1); } catch (InterruptedException e) {}
                instance[0] = Thread.currentThread().getName(); // ACT
                System.out.println(Thread.currentThread().getName() + " created instance");
            }
        };

        Thread t1 = new Thread(creator, "Thread-A");
        Thread t2 = new Thread(creator, "Thread-B");
        t1.start();
        t2.start();
        t1.join();
        t2.join();

        System.out.println("Final instance created by: " + instance[0]);
        System.out.println("Both threads may have 'created' it — that's the bug.");
    }

    public static void main(String[] args) throws InterruptedException {
        System.out.println("=== Race Condition Demo ===\n");

        System.out.println("--- Lost update race ---");
        brokenIncrement();
        System.out.println();
        fixWithSynchronized();
        fixWithAtomic();

        checkThenActRace();

        System.out.println("\n=== Key takeaway: shared mutable state + no sync = bugs ===");
    }
}
