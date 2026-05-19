import java.util.concurrent.locks.ReentrantLock;
import java.util.concurrent.TimeUnit;

/**
 * PROBLEM 13: Deadlock
 *
 * Two+ threads each hold a lock the other needs → permanent stall.
 *
 * 4 Coffman Conditions (ALL must hold for deadlock):
 *   1. Mutual Exclusion — resource held exclusively
 *   2. Hold and Wait — thread holds one resource, waits for another
 *   3. No Preemption — locks can't be forcibly taken
 *   4. Circular Wait — T1 → T2 → ... → T1
 *
 * Break ANY ONE condition → no deadlock.
 *
 * INTERVIEW TIP: Know how to detect, prevent, and resolve deadlock.
 *   - Detect: jstack, ThreadMXBean, thread dump
 *   - Prevent: lock ordering, tryLock with timeout, single lock
 *   - Resolve: kill one thread, timeout + rollback
 */
public class DeadlockDemo {

    static final Object lockA = new Object();
    static final Object lockB = new Object();

    // --- Create a deadlock ---
    static void createDeadlock() {
        System.out.println("--- Creating Deadlock (will hang for 3 seconds, then we detect it) ---\n");

        Thread t1 = new Thread(() -> {
            synchronized (lockA) {
                System.out.println("T1: holds lockA, waiting for lockB...");
                try { Thread.sleep(100); } catch (InterruptedException e) {}
                synchronized (lockB) {
                    System.out.println("T1: got both locks (NEVER PRINTS)");
                }
            }
        }, "Thread-1");

        Thread t2 = new Thread(() -> {
            synchronized (lockB) {
                System.out.println("T2: holds lockB, waiting for lockA...");
                try { Thread.sleep(100); } catch (InterruptedException e) {}
                synchronized (lockA) {
                    System.out.println("T2: got both locks (NEVER PRINTS)");
                }
            }
        }, "Thread-2");

        t1.start();
        t2.start();

        // Detect deadlock programmatically
        try { Thread.sleep(3000); } catch (InterruptedException e) {}

        java.lang.management.ThreadMXBean mxBean =
                java.lang.management.ManagementFactory.getThreadMXBean();
        long[] deadlockedIds = mxBean.findDeadlockedThreads();

        if (deadlockedIds != null) {
            System.out.println("\nDEADLOCK DETECTED! Threads:");
            for (java.lang.management.ThreadInfo info : mxBean.getThreadInfo(deadlockedIds, true, true)) {
                System.out.println("  " + info.getThreadName() +
                        " blocked on " + info.getLockName() +
                        " held by " + info.getLockOwnerName());
            }
        }

        // Clean up: interrupt deadlocked threads
        t1.interrupt();
        t2.interrupt();
    }

    // --- Fix 1: Consistent lock ordering ---
    static void fixWithOrdering() throws InterruptedException {
        System.out.println("\n--- Fix 1: Lock Ordering (always A before B) ---");

        Thread t1 = new Thread(() -> {
            synchronized (lockA) {
                synchronized (lockB) {
                    System.out.println("T1: got both locks (A → B)");
                }
            }
        });

        Thread t2 = new Thread(() -> {
            synchronized (lockA) { // same order as T1!
                synchronized (lockB) {
                    System.out.println("T2: got both locks (A → B)");
                }
            }
        });

        t1.start(); t2.start();
        t1.join(); t2.join();
        System.out.println("No deadlock!");
    }

    // --- Fix 2: tryLock with timeout ---
    static void fixWithTryLock() throws InterruptedException {
        System.out.println("\n--- Fix 2: tryLock with Timeout ---");

        ReentrantLock lock1 = new ReentrantLock();
        ReentrantLock lock2 = new ReentrantLock();

        Runnable task1 = () -> {
            try {
                if (lock1.tryLock(1, TimeUnit.SECONDS)) {
                    try {
                        Thread.sleep(50);
                        if (lock2.tryLock(1, TimeUnit.SECONDS)) {
                            try {
                                System.out.println("T1: got both locks");
                            } finally { lock2.unlock(); }
                        } else {
                            System.out.println("T1: couldn't get lock2, backing off");
                        }
                    } finally { lock1.unlock(); }
                }
            } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
        };

        Runnable task2 = () -> {
            try {
                if (lock2.tryLock(1, TimeUnit.SECONDS)) {
                    try {
                        Thread.sleep(50);
                        if (lock1.tryLock(1, TimeUnit.SECONDS)) {
                            try {
                                System.out.println("T2: got both locks");
                            } finally { lock1.unlock(); }
                        } else {
                            System.out.println("T2: couldn't get lock1, backing off");
                        }
                    } finally { lock2.unlock(); }
                }
            } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
        };

        Thread t1 = new Thread(task1);
        Thread t2 = new Thread(task2);
        t1.start(); t2.start();
        t1.join(); t2.join();
        System.out.println("Completed without deadlock (one thread backed off).");
    }

    // --- Dining Philosophers: classic deadlock scenario ---
    static void diningPhilosophers() throws InterruptedException {
        System.out.println("\n--- Dining Philosophers (Fixed with ordering) ---");
        int N = 5;
        ReentrantLock[] forks = new ReentrantLock[N];
        for (int i = 0; i < N; i++) forks[i] = new ReentrantLock();

        Thread[] philosophers = new Thread[N];
        for (int i = 0; i < N; i++) {
            final int id = i;
            // Fix: always pick up lower-numbered fork first
            final int first = Math.min(id, (id + 1) % N);
            final int second = Math.max(id, (id + 1) % N);

            philosophers[i] = new Thread(() -> {
                for (int meal = 0; meal < 3; meal++) {
                    forks[first].lock();
                    forks[second].lock();
                    try {
                        System.out.printf("  Philosopher %d eating (meal %d)%n", id, meal);
                    } finally {
                        forks[second].unlock();
                        forks[first].unlock();
                    }
                }
            }, "Phil-" + i);
            philosophers[i].start();
        }

        for (Thread p : philosophers) p.join();
        System.out.println("All philosophers ate without deadlock!");
    }

    public static void main(String[] args) throws InterruptedException {
        System.out.println("=== Deadlock Demo ===\n");

        createDeadlock();
        fixWithOrdering();
        fixWithTryLock();
        diningPhilosophers();

        System.out.println("\n=== Key: Break any Coffman condition. Lock ordering is the simplest fix. ===");
    }
}
