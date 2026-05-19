import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;

/**
 * PROBLEM 3: Mutex (Mutual Exclusion)
 *
 * Only ONE thread can hold the mutex at a time. Everyone else blocks until it's released.
 * In Java: ReentrantLock is the explicit mutex. synchronized is the implicit one.
 *
 * INTERVIEW TIP: Know Lock vs synchronized trade-offs:
 *   - Lock: tryLock, timed lock, interruptible, multiple conditions, fair ordering
 *   - synchronized: simpler syntax, auto-release, no forgetting unlock
 */
public class MutexDemo {

    private final Lock mutex = new ReentrantLock();
    private int balance = 1000;

    // Guarded by mutex — only one thread modifies balance at a time
    public void withdraw(String who, int amount) {
        mutex.lock();
        try {
            if (balance >= amount) {
                System.out.printf("[%s] Balance: %d, withdrawing %d%n", who, balance, amount);
                Thread.sleep(50); // simulate processing
                balance -= amount;
                System.out.printf("[%s] New balance: %d%n", who, balance);
            } else {
                System.out.printf("[%s] Insufficient funds. Balance: %d, wanted: %d%n",
                        who, balance, amount);
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        } finally {
            mutex.unlock(); // ALWAYS in finally — forgetting this = deadlock
        }
    }

    public void deposit(String who, int amount) {
        mutex.lock();
        try {
            System.out.printf("[%s] Balance: %d, depositing %d%n", who, balance, amount);
            balance += amount;
            System.out.printf("[%s] New balance: %d%n", who, balance);
        } finally {
            mutex.unlock();
        }
    }

    public int getBalance() {
        mutex.lock();
        try {
            return balance;
        } finally {
            mutex.unlock();
        }
    }

    // Without mutex — demonstrates the problem
    static class UnsafeBankAccount {
        int balance = 1000;

        void withdraw(int amount) throws InterruptedException {
            if (balance >= amount) {
                Thread.sleep(1); // widen the race window
                balance -= amount;
            }
        }
    }

    public static void main(String[] args) throws InterruptedException {
        System.out.println("=== Mutex (Lock) Demo ===\n");

        // --- Safe version with mutex ---
        System.out.println("--- With Mutex ---");
        MutexDemo account = new MutexDemo();

        Thread t1 = new Thread(() -> {
            for (int i = 0; i < 5; i++) account.withdraw("Alice", 150);
        });
        Thread t2 = new Thread(() -> {
            for (int i = 0; i < 5; i++) account.withdraw("Bob", 150);
        });
        Thread t3 = new Thread(() -> account.deposit("Charlie", 500));

        t1.start(); t2.start(); t3.start();
        t1.join(); t2.join(); t3.join();

        System.out.println("Final balance (safe): " + account.getBalance());

        // --- Unsafe version without mutex ---
        System.out.println("\n--- Without Mutex ---");
        UnsafeBankAccount unsafe = new UnsafeBankAccount();

        Thread[] threads = new Thread[10];
        for (int i = 0; i < 10; i++) {
            threads[i] = new Thread(() -> {
                try { unsafe.withdraw(200); } catch (InterruptedException e) {}
            });
            threads[i].start();
        }
        for (Thread t : threads) t.join();

        System.out.println("Final balance (unsafe): " + unsafe.balance);
        System.out.println("Expected ≥ 0, but can go negative without mutex!");

        System.out.println("\n=== Key: Lock in try, unlock in finally. Always. ===");
    }
}
