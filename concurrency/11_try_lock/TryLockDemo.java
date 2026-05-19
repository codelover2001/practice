import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.locks.ReentrantLock;

/**
 * PROBLEM 11: Try-Lock
 *
 * Attempt to acquire a lock without blocking. If busy → do other work and retry later.
 * Great for reducing contention in hot paths.
 *
 * tryLock()                  → immediate, returns true/false
 * tryLock(timeout, unit)     → waits up to timeout, then gives up
 *
 * INTERVIEW TIP: tryLock is how you avoid deadlock in lock-ordering problems.
 * If you can't get both locks, release what you have and retry.
 */
public class TryLockDemo {

    // --- Cache with tryLock: return stale data if write lock is busy ---
    static class TryLockCache<K, V> {
        private final Map<K, V> cache = new ConcurrentHashMap<>();
        private final ReentrantLock writeLock = new ReentrantLock();
        private int staleHits = 0;
        private int freshHits = 0;

        public V getOrCompute(K key, java.util.function.Function<K, V> compute) {
            V cached = cache.get(key);
            if (cached != null) return cached;

            // Cache miss — try to compute and store
            if (writeLock.tryLock()) {
                try {
                    // Double-check after acquiring lock
                    cached = cache.get(key);
                    if (cached != null) return cached;

                    V value = compute.apply(key);
                    cache.put(key, value);
                    freshHits++;
                    return value;
                } finally {
                    writeLock.unlock();
                }
            } else {
                // Lock is busy — return null (stale/miss) instead of blocking
                staleHits++;
                System.out.println("  [" + Thread.currentThread().getName() +
                        "] Lock busy, returning null (stale miss)");
                return null;
            }
        }

        public void printStats() {
            System.out.println("Fresh computes: " + freshHits + ", Stale misses: " + staleHits);
        }
    }

    // --- Deadlock avoidance with tryLock ---
    static class Account {
        private final ReentrantLock lock = new ReentrantLock();
        private final String name;
        private int balance;

        Account(String name, int balance) {
            this.name = name;
            this.balance = balance;
        }

        // Transfer that avoids deadlock using tryLock
        static boolean transfer(Account from, Account to, int amount) {
            while (true) {
                boolean gotFrom = false;
                boolean gotTo = false;
                try {
                    gotFrom = from.lock.tryLock(50, TimeUnit.MILLISECONDS);
                    gotTo = to.lock.tryLock(50, TimeUnit.MILLISECONDS);

                    if (gotFrom && gotTo) {
                        if (from.balance >= amount) {
                            from.balance -= amount;
                            to.balance += amount;
                            System.out.printf("  Transferred %d: %s(%d) → %s(%d)%n",
                                    amount, from.name, from.balance, to.name, to.balance);
                            return true;
                        } else {
                            System.out.println("  Insufficient funds");
                            return false;
                        }
                    }
                    // Didn't get both locks — retry
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    return false;
                } finally {
                    if (gotTo) to.lock.unlock();
                    if (gotFrom) from.lock.unlock();
                }
                // Back off before retrying
                try {
                    Thread.sleep((long) (Math.random() * 10));
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    return false;
                }
            }
        }
    }

    public static void main(String[] args) throws InterruptedException {
        System.out.println("=== Try-Lock Demo ===\n");

        // --- Cache with tryLock ---
        System.out.println("--- Cache with tryLock (non-blocking writes) ---");
        TryLockCache<String, Integer> cache = new TryLockCache<>();

        Thread[] threads = new Thread[10];
        for (int i = 0; i < 10; i++) {
            threads[i] = new Thread(() -> {
                for (int j = 0; j < 5; j++) {
                    String key = "key-" + (j % 3);
                    Integer val = cache.getOrCompute(key, k -> {
                        try { Thread.sleep(50); } catch (InterruptedException e) {}
                        return k.hashCode();
                    });
                }
            }, "Worker-" + i);
            threads[i].start();
        }
        for (Thread t : threads) t.join();
        cache.printStats();

        // --- Deadlock avoidance ---
        System.out.println("\n--- Deadlock Avoidance with tryLock ---");
        System.out.println("Without tryLock: T1 locks A then B, T2 locks B then A → DEADLOCK");
        System.out.println("With tryLock: if can't get both, release and retry → no deadlock\n");

        Account alice = new Account("Alice", 1000);
        Account bob = new Account("Bob", 1000);

        // These would deadlock with regular lock() but are safe with tryLock
        Thread t1 = new Thread(() -> {
            for (int i = 0; i < 5; i++) Account.transfer(alice, bob, 100);
        });
        Thread t2 = new Thread(() -> {
            for (int i = 0; i < 5; i++) Account.transfer(bob, alice, 100);
        });

        t1.start(); t2.start();
        t1.join(); t2.join();

        System.out.println("Alice: " + alice.balance + ", Bob: " + bob.balance);
        System.out.println("Total: " + (alice.balance + bob.balance) + " (should be 2000)");

        System.out.println("\n=== Key: tryLock = non-blocking. Use for contention avoidance + deadlock prevention. ===");
    }
}
