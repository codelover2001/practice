import java.util.*;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;

/**
 * PROBLEM 9: Coarse vs Fine-Grained Locking
 *
 * Coarse lock = one big lock for everything (simple but poor performance).
 * Fine-grained lock = many small locks (more parallelism but higher complexity & deadlock risk).
 *
 * INTERVIEW TIP: When asked "how would you scale this?", the answer often involves
 * moving from coarse to fine-grained locking. Know the trade-offs:
 *   - Coarse: simple, correct, but serial under contention
 *   - Fine: parallel, fast, but complex and deadlock-prone
 *   - Striped: middle ground (ConcurrentHashMap uses 16 segments)
 */
public class LockingGranularity {

    // --- Coarse-grained: one lock for the entire map ---
    static class CoarseHashMap<K, V> {
        private final Map<K, V> map = new HashMap<>();
        private final Lock lock = new ReentrantLock();

        public V get(K key) {
            lock.lock();
            try {
                return map.get(key);
            } finally {
                lock.unlock();
            }
        }

        public void put(K key, V value) {
            lock.lock();
            try {
                map.put(key, value);
            } finally {
                lock.unlock();
            }
        }
    }

    // --- Fine-grained: lock striping (like ConcurrentHashMap) ---
    static class StripedHashMap<K, V> {
        private static final int NUM_STRIPES = 16;
        private final Lock[] locks;
        private final List<Map<K, V>> buckets;

        StripedHashMap() {
            locks = new ReentrantLock[NUM_STRIPES];
            buckets = new ArrayList<>(NUM_STRIPES);
            for (int i = 0; i < NUM_STRIPES; i++) {
                locks[i] = new ReentrantLock();
                buckets.add(new HashMap<>());
            }
        }

        private int stripeFor(K key) {
            return Math.abs(key.hashCode() % NUM_STRIPES);
        }

        public V get(K key) {
            int stripe = stripeFor(key);
            locks[stripe].lock();
            try {
                return buckets.get(stripe).get(key);
            } finally {
                locks[stripe].unlock();
            }
        }

        public void put(K key, V value) {
            int stripe = stripeFor(key);
            locks[stripe].lock();
            try {
                buckets.get(stripe).put(key, value);
            } finally {
                locks[stripe].unlock();
            }
        }

        // Global operation requires ALL locks — expensive but rare
        public int size() {
            int total = 0;
            for (int i = 0; i < NUM_STRIPES; i++) locks[i].lock();
            try {
                for (Map<K, V> bucket : buckets) total += bucket.size();
            } finally {
                for (int i = NUM_STRIPES - 1; i >= 0; i--) locks[i].unlock();
            }
            return total;
        }
    }

    public static void main(String[] args) throws InterruptedException {
        System.out.println("=== Coarse vs Fine-Grained Locking ===\n");

        int numThreads = 8;
        int opsPerThread = 100_000;

        // --- Benchmark Coarse ---
        CoarseHashMap<Integer, Integer> coarse = new CoarseHashMap<>();
        long start = System.nanoTime();
        Thread[] threads = new Thread[numThreads];
        for (int i = 0; i < numThreads; i++) {
            final int offset = i * opsPerThread;
            threads[i] = new Thread(() -> {
                for (int j = 0; j < opsPerThread; j++) {
                    coarse.put(offset + j, j);
                }
            });
            threads[i].start();
        }
        for (Thread t : threads) t.join();
        long coarseTime = System.nanoTime() - start;

        // --- Benchmark Striped ---
        StripedHashMap<Integer, Integer> striped = new StripedHashMap<>();
        start = System.nanoTime();
        for (int i = 0; i < numThreads; i++) {
            final int offset = i * opsPerThread;
            threads[i] = new Thread(() -> {
                for (int j = 0; j < opsPerThread; j++) {
                    striped.put(offset + j, j);
                }
            });
            threads[i].start();
        }
        for (Thread t : threads) t.join();
        long stripedTime = System.nanoTime() - start;

        System.out.printf("Coarse-grained: %d ms%n", coarseTime / 1_000_000);
        System.out.printf("Striped (16):   %d ms%n", stripedTime / 1_000_000);
        System.out.printf("Speedup:        %.2fx%n", (double) coarseTime / stripedTime);
        System.out.println("Striped entries: " + striped.size());

        System.out.println("\n--- Trade-off Summary ---");
        System.out.println("| Approach     | Parallelism | Complexity | Deadlock Risk |");
        System.out.println("|--------------|-------------|------------|---------------|");
        System.out.println("| Coarse       | Low         | Low        | Low           |");
        System.out.println("| Fine-grained | High        | High       | High          |");
        System.out.println("| Striped      | Medium-High | Medium     | Medium        |");

        System.out.println("\n=== Key: Start coarse. Profile. Stripe when you prove contention. ===");
    }
}
