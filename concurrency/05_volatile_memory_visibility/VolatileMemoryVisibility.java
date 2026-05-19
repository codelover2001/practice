/**
 * PROBLEM 5: Volatile & Memory Visibility
 *
 * Without volatile, one thread's write may never be seen by another thread
 * (JIT can cache the variable in a CPU register). volatile forces reads/writes
 * to go through main memory, establishing a happens-before relationship.
 *
 * INTERVIEW TIP: volatile does NOT make compound operations atomic.
 *   volatile int x; x++ is STILL a race condition (read + modify + write).
 *   volatile guarantees visibility, not atomicity.
 *
 * USE volatile for: flags, status variables, single-writer scenarios.
 * DON'T use volatile for: counters, accumulators (use AtomicInteger instead).
 */
public class VolatileMemoryVisibility {

    // --- Without volatile: thread may run forever ---
    static boolean stopFlag = false; // BUG: not volatile

    static void withoutVolatile() throws InterruptedException {
        System.out.println("--- Without volatile (may hang!) ---");

        Thread worker = new Thread(() -> {
            int iterations = 0;
            while (!stopFlag) {
                iterations++;
            }
            System.out.println("Worker stopped after " + iterations + " iterations");
        });

        worker.start();
        Thread.sleep(100);
        stopFlag = true;
        System.out.println("Main set stopFlag = true");

        worker.join(2000); // wait max 2 seconds
        if (worker.isAlive()) {
            System.out.println("STUCK! Worker never saw the flag change.");
            System.out.println("(Interrupting to continue demo)");
            worker.interrupt();
        }
    }

    // --- With volatile: guaranteed visibility ---
    static volatile boolean volatileStopFlag = false;

    static void withVolatile() throws InterruptedException {
        System.out.println("\n--- With volatile ---");

        Thread worker = new Thread(() -> {
            int iterations = 0;
            while (!volatileStopFlag) {
                iterations++;
            }
            System.out.println("Worker stopped after " + iterations + " iterations");
        });

        worker.start();
        Thread.sleep(100);
        volatileStopFlag = true;
        System.out.println("Main set volatileStopFlag = true");
        worker.join(2000);
        System.out.println("Worker exited cleanly.");
    }

    // --- volatile does NOT help with compound operations ---
    static volatile int volatileCounter = 0;

    static void volatileCounterRace() throws InterruptedException {
        System.out.println("\n--- volatile counter (STILL BROKEN) ---");
        volatileCounter = 0;

        Runnable task = () -> {
            for (int i = 0; i < 100_000; i++) {
                volatileCounter++; // NOT atomic even with volatile
            }
        };

        Thread t1 = new Thread(task);
        Thread t2 = new Thread(task);
        t1.start(); t2.start();
        t1.join(); t2.join();

        System.out.println("Expected: 200000");
        System.out.println("Got:      " + volatileCounter + " (volatile doesn't make ++ atomic)");
    }

    // --- Double-checked locking: correct use of volatile ---
    static class Singleton {
        private static volatile Singleton instance; // volatile is REQUIRED here

        private Singleton() {}

        public static Singleton getInstance() {
            if (instance == null) {                    // first check (no lock)
                synchronized (Singleton.class) {
                    if (instance == null) {             // second check (with lock)
                        instance = new Singleton();
                        // Without volatile, another thread might see a
                        // partially constructed object due to reordering
                    }
                }
            }
            return instance;
        }
    }

    public static void main(String[] args) throws InterruptedException {
        System.out.println("=== Volatile & Memory Visibility Demo ===\n");

        withoutVolatile();
        withVolatile();
        volatileCounterRace();

        System.out.println("\n--- Double-checked locking singleton ---");
        Singleton s1 = Singleton.getInstance();
        Singleton s2 = Singleton.getInstance();
        System.out.println("Same instance? " + (s1 == s2));

        System.out.println("\n=== Key: volatile = visibility. Atomic = atomicity. They're different. ===");
    }
}
