import java.util.concurrent.locks.ReentrantLock;
import java.util.concurrent.TimeUnit;

/**
 * PROBLEM 14: Livelock
 *
 * Threads keep responding to each other but make no actual progress.
 * Like two people stepping aside in a corridor — both move, neither passes.
 *
 * Difference from deadlock:
 *   - Deadlock: threads are BLOCKED (sleeping)
 *   - Livelock: threads are RUNNING (burning CPU) but accomplishing nothing
 *
 * INTERVIEW TIP: Fix with random backoff or asymmetric behavior.
 * Less common than deadlock but equally frustrating (and harder to detect).
 */
public class LivelockDemo {

    // --- Corridor Problem: two people keep stepping aside ---
    static class Person {
        private final String name;
        private boolean movingLeft;

        Person(String name, boolean movingLeft) {
            this.name = name;
            this.movingLeft = movingLeft;
        }

        // Polite: if other person is coming, step aside
        public void stepAside(Person other) {
            while (this.movingLeft == other.movingLeft) {
                System.out.println(name + ": \"Oh, after you!\" (steps " +
                        (movingLeft ? "right" : "left") + ")");
                movingLeft = !movingLeft;

                try { Thread.sleep(100); } catch (InterruptedException e) { return; }
            }
            System.out.println(name + ": finally passed!");
        }
    }

    static void corridorLivelock() throws InterruptedException {
        System.out.println("--- Corridor Livelock (will stop after 2 seconds) ---\n");

        Person alice = new Person("Alice", true);
        Person bob = new Person("Bob", true);

        Thread t1 = new Thread(() -> alice.stepAside(bob));
        Thread t2 = new Thread(() -> bob.stepAside(alice));

        t1.start();
        t2.start();

        Thread.sleep(2000);
        t1.interrupt();
        t2.interrupt();
        t1.join();
        t2.join();
        System.out.println("(Interrupted — they'd loop forever)\n");
    }

    // --- Fix: Random backoff ---
    static class SmartPerson {
        private final String name;
        private volatile boolean movingLeft;

        SmartPerson(String name, boolean movingLeft) {
            this.name = name;
            this.movingLeft = movingLeft;
        }

        public void stepAside(SmartPerson other) {
            int attempts = 0;
            while (this.movingLeft == other.movingLeft) {
                // Random backoff breaks the symmetry
                long backoff = (long) (Math.random() * 100);
                try {
                    Thread.sleep(backoff);
                } catch (InterruptedException e) { return; }

                movingLeft = !movingLeft;
                attempts++;
                System.out.println(name + " stepped aside (attempt " + attempts +
                        ", backoff " + backoff + "ms)");
            }
            System.out.println(name + ": PASSED after " + attempts + " attempts!");
        }
    }

    static void fixedWithBackoff() throws InterruptedException {
        System.out.println("--- Fix: Random Backoff ---\n");

        SmartPerson alice = new SmartPerson("Alice", true);
        SmartPerson bob = new SmartPerson("Bob", true);

        Thread t1 = new Thread(() -> alice.stepAside(bob));
        Thread t2 = new Thread(() -> bob.stepAside(alice));

        t1.start(); t2.start();
        t1.join(5000); t2.join(5000);
    }

    // --- Lock-based livelock: tryLock + immediate retry ---
    static void lockLivelock() throws InterruptedException {
        System.out.println("\n--- Lock Livelock (tryLock without backoff) ---\n");

        ReentrantLock lock1 = new ReentrantLock();
        ReentrantLock lock2 = new ReentrantLock();

        Runnable task1 = () -> {
            int attempts = 0;
            while (attempts < 20) {
                try {
                    if (lock1.tryLock(10, TimeUnit.MILLISECONDS)) {
                        try {
                            if (lock2.tryLock(10, TimeUnit.MILLISECONDS)) {
                                try {
                                    System.out.println("Task1: got both locks!");
                                    return;
                                } finally { lock2.unlock(); }
                            } else {
                                System.out.println("Task1: can't get lock2, releasing lock1 (attempt " + attempts + ")");
                            }
                        } finally { lock1.unlock(); }
                    }
                } catch (InterruptedException e) { return; }
                attempts++;
                // FIX: Add exponential backoff here to break the cycle
                try {
                    Thread.sleep((long) (Math.random() * 50 * attempts));
                } catch (InterruptedException e) { return; }
            }
        };

        Runnable task2 = () -> {
            int attempts = 0;
            while (attempts < 20) {
                try {
                    if (lock2.tryLock(10, TimeUnit.MILLISECONDS)) {
                        try {
                            if (lock1.tryLock(10, TimeUnit.MILLISECONDS)) {
                                try {
                                    System.out.println("Task2: got both locks!");
                                    return;
                                } finally { lock1.unlock(); }
                            } else {
                                System.out.println("Task2: can't get lock1, releasing lock2 (attempt " + attempts + ")");
                            }
                        } finally { lock2.unlock(); }
                    }
                } catch (InterruptedException e) { return; }
                attempts++;
                try {
                    Thread.sleep((long) (Math.random() * 50 * attempts));
                } catch (InterruptedException e) { return; }
            }
        };

        Thread t1 = new Thread(task1);
        Thread t2 = new Thread(task2);
        t1.start(); t2.start();
        t1.join(); t2.join();
    }

    public static void main(String[] args) throws InterruptedException {
        System.out.println("=== Livelock Demo ===\n");

        corridorLivelock();
        fixedWithBackoff();
        lockLivelock();

        System.out.println("\n=== Key: Livelock = active threads, zero progress. Fix with random backoff. ===");
        System.out.println("=== Deadlock = stuck. Livelock = spinning. Both are bad. ===");
    }
}
