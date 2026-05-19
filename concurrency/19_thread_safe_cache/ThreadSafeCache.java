import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.locks.ReadWriteLock;
import java.util.concurrent.locks.ReentrantReadWriteLock;

/**
 * PROBLEM 19: Thread-Safe Cache (LRU)
 *
 * Multiple threads can read safely while writes stay consistent.
 * Key challenges: eviction under concurrency, cache stampede, consistency.
 *
 * Two implementations:
 *   1. ReadWriteLock-based LRU (full control)
 *   2. ConcurrentHashMap-based (simpler, no strict LRU)
 *
 * INTERVIEW TIP: This is a very common interview question. Know:
 *   - LinkedHashMap for LRU ordering (accessOrder=true)
 *   - ReadWriteLock for reader-friendly concurrency
 *   - Cache stampede: multiple threads compute same missing key simultaneously
 */
public class ThreadSafeCache {

    // --- Implementation 1: LRU Cache with ReadWriteLock ---
    static class LRUCache<K, V> {
        private final int capacity;
        private final LinkedHashMap<K, V> map;
        private final ReadWriteLock rwLock = new ReentrantReadWriteLock();
        private int hits = 0;
        private int misses = 0;

        LRUCache(int capacity) {
            this.capacity = capacity;
            // accessOrder=true makes it LRU (most recently accessed → tail)
            this.map = new LinkedHashMap<>(capacity, 0.75f, true) {
                @Override
                protected boolean removeEldestEntry(Map.Entry<K, V> eldest) {
                    boolean shouldRemove = size() > capacity;
                    if (shouldRemove) {
                        System.out.println("    Evicting: " + eldest.getKey());
                    }
                    return shouldRemove;
                }
            };
        }

        public V get(K key) {
            rwLock.readLock().lock();
            try {
                V value = map.get(key);
                if (value != null) hits++;
                else misses++;
                return value;
            } finally {
                rwLock.readLock().unlock();
            }
        }

        public void put(K key, V value) {
            rwLock.writeLock().lock();
            try {
                map.put(key, value);
            } finally {
                rwLock.writeLock().unlock();
            }
        }

        // Atomic get-or-compute: prevents cache stampede
        public V getOrCompute(K key, java.util.function.Function<K, V> compute) {
            // Try read lock first (fast path)
            rwLock.readLock().lock();
            try {
                V value = map.get(key);
                if (value != null) {
                    hits++;
                    return value;
                }
            } finally {
                rwLock.readLock().unlock();
            }

            // Miss — upgrade to write lock
            rwLock.writeLock().lock();
            try {
                // Double-check after acquiring write lock (another thread may have computed)
                V value = map.get(key);
                if (value != null) {
                    hits++;
                    return value;
                }
                misses++;
                value = compute.apply(key);
                map.put(key, value);
                return value;
            } finally {
                rwLock.writeLock().unlock();
            }
        }

        public int size() {
            rwLock.readLock().lock();
            try { return map.size(); }
            finally { rwLock.readLock().unlock(); }
        }

        public String stats() {
            return String.format("hits=%d, misses=%d, hitRate=%.1f%%",
                    hits, misses, hits + misses > 0 ? 100.0 * hits / (hits + misses) : 0);
        }
    }

    // --- Implementation 2: ConcurrentHashMap-based (simpler) ---
    static class ConcurrentCache<K, V> {
        private final ConcurrentHashMap<K, V> map = new ConcurrentHashMap<>();
        private final int maxSize;

        ConcurrentCache(int maxSize) {
            this.maxSize = maxSize;
        }

        public V get(K key) {
            return map.get(key);
        }

        // computeIfAbsent is atomic — prevents cache stampede
        public V getOrCompute(K key, java.util.function.Function<K, V> compute) {
            V value = map.computeIfAbsent(key, compute);

            // Simple eviction: remove random entry if over capacity
            if (map.size() > maxSize) {
                Iterator<K> it = map.keySet().iterator();
                if (it.hasNext()) {
                    K evictKey = it.next();
                    map.remove(evictKey);
                }
            }
            return value;
        }

        public void invalidate(K key) {
            map.remove(key);
        }

        public void invalidateAll() {
            map.clear();
        }

        public int size() {
            return map.size();
        }
    }

    public static void main(String[] args) throws InterruptedException {
        System.out.println("=== Thread-Safe Cache Demo ===\n");

        // --- LRU Cache ---
        System.out.println("--- LRU Cache (capacity=5) ---");
        LRUCache<String, Integer> lru = new LRUCache<>(5);

        Thread[] threads = new Thread[10];
        for (int i = 0; i < 10; i++) {
            final int id = i;
            threads[i] = new Thread(() -> {
                for (int j = 0; j < 20; j++) {
                    String key = "key-" + (j % 8); // 8 keys, capacity 5 → evictions
                    lru.getOrCompute(key, k -> {
                        System.out.printf("    [Thread-%d] Computing %s%n", id, k);
                        try { Thread.sleep(10); } catch (InterruptedException e) {}
                        return k.hashCode();
                    });
                }
            });
            threads[i].start();
        }
        for (Thread t : threads) t.join();

        System.out.println("Cache size: " + lru.size() + " (max 5)");
        System.out.println("Stats: " + lru.stats());

        // --- Cache stampede prevention ---
        System.out.println("\n--- Cache Stampede Prevention ---");
        LRUCache<String, String> stampede = new LRUCache<>(10);

        Thread[] stampThreads = new Thread[5];
        for (int i = 0; i < 5; i++) {
            stampThreads[i] = new Thread(() -> {
                // All 5 threads request the same key at the same time
                String result = stampede.getOrCompute("expensive-key", k -> {
                    System.out.println("  COMPUTING " + k + " on " + Thread.currentThread().getName());
                    try { Thread.sleep(200); } catch (InterruptedException e) {}
                    return "expensive-result";
                });
                System.out.println("  " + Thread.currentThread().getName() + " got: " + result);
            });
        }
        for (Thread t : stampThreads) t.start();
        for (Thread t : stampThreads) t.join();
        System.out.println("Only ONE thread should have computed (double-check locking).");
        System.out.println("Stats: " + stampede.stats());

        // --- ConcurrentHashMap-based ---
        System.out.println("\n--- ConcurrentHashMap Cache ---");
        ConcurrentCache<String, Integer> chm = new ConcurrentCache<>(100);
        for (int i = 0; i < 10; i++) {
            threads[i] = new Thread(() -> {
                for (int j = 0; j < 100; j++) {
                    chm.getOrCompute("k" + (j % 50), String::hashCode);
                }
            });
            threads[i].start();
        }
        for (Thread t : threads) t.join();
        System.out.println("ConcurrentCache size: " + chm.size());

        System.out.println("\n=== Key: getOrCompute with double-check prevents stampede. ===");
        System.out.println("=== Use LinkedHashMap(accessOrder=true) for LRU, RWLock for concurrency. ===");
    }
}
