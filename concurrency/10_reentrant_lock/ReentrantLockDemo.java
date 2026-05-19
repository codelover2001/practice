import java.util.concurrent.locks.ReentrantLock;

/**
 * PROBLEM 10: Reentrant Lock
 *
 * Same thread can acquire the same lock multiple times without deadlocking itself.
 * Hold count increments on each lock(), decrements on each unlock().
 * Lock is truly released when hold count reaches 0.
 *
 * INTERVIEW TIP: Both synchronized and ReentrantLock are reentrant in Java.
 * A non-reentrant lock would deadlock on: lock(); lock(); // same thread
 * Critical for recursive calls or methods that call other synchronized methods on same object.
 */
public class ReentrantLockDemo {

    // --- Reentrant: same thread can acquire multiple times ---
    static class SafeRecursive {
        private final ReentrantLock lock = new ReentrantLock();
        private int value = 0;

        public void recursiveIncrement(int depth) {
            lock.lock();
            try {
                value++;
                System.out.printf("  depth=%d, holdCount=%d, value=%d%n",
                        depth, lock.getHoldCount(), value);
                if (depth > 0) {
                    recursiveIncrement(depth - 1); // acquires same lock again — no deadlock
                }
            } finally {
                lock.unlock(); // decrements hold count
            }
        }

        public int getValue() { return value; }
    }

    // --- Non-reentrant lock (simulated): would deadlock ---
    static class NonReentrantLock {
        private boolean isLocked = false;
        private Thread lockedBy = null;

        public synchronized void lock() throws InterruptedException {
            while (isLocked) {
                // A reentrant lock would check: lockedBy == currentThread
                // This one doesn't, so same thread calling lock() twice → deadlock
                wait();
            }
            isLocked = true;
            lockedBy = Thread.currentThread();
        }

        public synchronized void unlock() {
            if (Thread.currentThread() != lockedBy) {
                throw new IllegalStateException("Not the lock holder");
            }
            isLocked = false;
            lockedBy = null;
            notify();
        }
    }

    // --- Method calling another method on same lock ---
    static class BankAccount {
        private final ReentrantLock lock = new ReentrantLock();
        private double balance;

        BankAccount(double initial) { this.balance = initial; }

        public void deposit(double amount) {
            lock.lock();
            try {
                balance += amount;
            } finally {
                lock.unlock();
            }
        }

        public void withdraw(double amount) {
            lock.lock();
            try {
                balance -= amount;
            } finally {
                lock.unlock();
            }
        }

        // This method calls withdraw + deposit which both acquire the lock
        // Without reentrancy, this would deadlock
        public void transfer(BankAccount target, double amount) {
            lock.lock();
            try {
                if (balance >= amount) {
                    withdraw(amount);            // acquires lock AGAIN (reentrant!)
                    target.deposit(amount);
                    System.out.printf("Transferred %.0f. My balance: %.0f%n", amount, balance);
                }
            } finally {
                lock.unlock();
            }
        }

        public double getBalance() { return balance; }
    }

    // --- Fair lock demo ---
    static void fairnessDemo() throws InterruptedException {
        System.out.println("\n--- Fair vs Unfair Lock ---");

        ReentrantLock unfairLock = new ReentrantLock(false); // default: unfair (barging allowed)
        ReentrantLock fairLock = new ReentrantLock(true);     // FIFO ordering

        System.out.println("Unfair lock: threads can 'barge' — faster but unfair");
        System.out.println("Fair lock:   strict FIFO — no starvation but ~2x slower");

        // Demonstrate fair ordering
        Runnable task = () -> {
            fairLock.lock();
            try {
                System.out.println("  " + Thread.currentThread().getName() + " acquired fair lock");
            } finally {
                fairLock.unlock();
            }
        };

        fairLock.lock();
        for (int i = 0; i < 5; i++) {
            new Thread(task, "Thread-" + i).start();
            Thread.sleep(50); // ensure they queue in order
        }
        Thread.sleep(100);
        System.out.println("Releasing lock — threads should wake in FIFO order:");
        fairLock.unlock();
        Thread.sleep(500);
    }

    public static void main(String[] args) throws InterruptedException {
        System.out.println("=== Reentrant Lock Demo ===\n");

        // 1. Recursive acquisition
        System.out.println("--- Recursive Lock Acquisition ---");
        SafeRecursive sr = new SafeRecursive();
        sr.recursiveIncrement(3);
        System.out.println("Final value: " + sr.getValue());

        // 2. Method calling locked method
        System.out.println("\n--- Transfer (lock re-acquisition) ---");
        BankAccount alice = new BankAccount(1000);
        BankAccount bob = new BankAccount(500);
        alice.transfer(bob, 300);
        System.out.println("Alice: " + alice.getBalance() + ", Bob: " + bob.getBalance());

        // 3. Fairness
        fairnessDemo();

        // 4. Useful inspection methods
        System.out.println("\n--- Lock Inspection ---");
        ReentrantLock lock = new ReentrantLock();
        lock.lock();
        System.out.println("isLocked:       " + lock.isLocked());
        System.out.println("isHeldByMe:     " + lock.isHeldByCurrentThread());
        System.out.println("holdCount:      " + lock.getHoldCount());
        lock.lock(); // reentrant
        System.out.println("holdCount (2x): " + lock.getHoldCount());
        lock.unlock();
        lock.unlock();

        System.out.println("\n=== Key: Reentrancy prevents self-deadlock. unlock() must match lock() count. ===");
    }
}
