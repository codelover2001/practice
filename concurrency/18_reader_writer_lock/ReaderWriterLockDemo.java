import java.util.*;
import java.util.concurrent.locks.ReadWriteLock;
import java.util.concurrent.locks.ReentrantReadWriteLock;

/**
 * PROBLEM 18: Reader-Writer Lock
 *
 * Multiple readers allowed at once, but only one writer (exclusive).
 * Writer blocks all readers and other writers.
 *
 * Perfect when reads >> writes (caches, config, routing tables).
 *
 * Rules:
 *   - Read lock: shared — any number of readers concurrently
 *   - Write lock: exclusive — blocks everyone
 *   - You CANNOT upgrade read → write (deadlock). Must release read first.
 *   - You CAN downgrade write → read (hold write, acquire read, release write).
 *
 * INTERVIEW TIP: Know when RWLock beats regular lock (read-heavy),
 * and when it doesn't (write-heavy — RWLock overhead makes it slower).
 */
public class ReaderWriterLockDemo {

    // --- Thread-safe config store with RWLock ---
    static class ConfigStore {
        private final Map<String, String> config = new HashMap<>();
        private final ReadWriteLock rwLock = new ReentrantReadWriteLock();

        public String get(String key) {
            rwLock.readLock().lock();
            try {
                return config.get(key);
            } finally {
                rwLock.readLock().unlock();
            }
        }

        public Map<String, String> getAll() {
            rwLock.readLock().lock();
            try {
                return new HashMap<>(config); // defensive copy
            } finally {
                rwLock.readLock().unlock();
            }
        }

        public void put(String key, String value) {
            rwLock.writeLock().lock();
            try {
                config.put(key, value);
            } finally {
                rwLock.writeLock().unlock();
            }
        }

        public void putAll(Map<String, String> entries) {
            rwLock.writeLock().lock();
            try {
                config.putAll(entries);
            } finally {
                rwLock.writeLock().unlock();
            }
        }

        public int size() {
            rwLock.readLock().lock();
            try {
                return config.size();
            } finally {
                rwLock.readLock().unlock();
            }
        }
    }

    // --- Benchmark: ReadWriteLock vs regular Lock ---
    static void benchmark() throws InterruptedException {
        System.out.println("--- Benchmark: RWLock vs synchronized ---\n");

        int numReaders = 8;
        int numWriters = 2;
        int opsPerThread = 100_000;

        // With ReadWriteLock
        ConfigStore rwStore = new ConfigStore();
        rwStore.put("key", "value");

        long start = System.nanoTime();
        Thread[] threads = new Thread[numReaders + numWriters];

        for (int i = 0; i < numReaders; i++) {
            threads[i] = new Thread(() -> {
                for (int j = 0; j < opsPerThread; j++) rwStore.get("key");
            });
        }
        for (int i = 0; i < numWriters; i++) {
            threads[numReaders + i] = new Thread(() -> {
                for (int j = 0; j < opsPerThread / 10; j++) rwStore.put("key", "val" + j);
            });
        }
        for (Thread t : threads) t.start();
        for (Thread t : threads) t.join();
        long rwTime = System.nanoTime() - start;

        // With synchronized (coarse lock)
        Map<String, String> syncMap = Collections.synchronizedMap(new HashMap<>());
        syncMap.put("key", "value");

        start = System.nanoTime();
        for (int i = 0; i < numReaders; i++) {
            threads[i] = new Thread(() -> {
                for (int j = 0; j < opsPerThread; j++) syncMap.get("key");
            });
        }
        for (int i = 0; i < numWriters; i++) {
            threads[numReaders + i] = new Thread(() -> {
                for (int j = 0; j < opsPerThread / 10; j++) syncMap.put("key", "val" + j);
            });
        }
        for (Thread t : threads) t.start();
        for (Thread t : threads) t.join();
        long syncTime = System.nanoTime() - start;

        System.out.printf("ReadWriteLock:  %d ms%n", rwTime / 1_000_000);
        System.out.printf("synchronized:   %d ms%n", syncTime / 1_000_000);
        System.out.printf("Ratio: %.2fx %s%n",
                (double) syncTime / rwTime,
                rwTime < syncTime ? "(RWLock wins — read heavy)" : "(synchronized wins — overhead)");
    }

    // --- Write lock downgrade pattern ---
    static void downgradeDemo() {
        System.out.println("\n--- Write → Read Downgrade ---");
        ReentrantReadWriteLock rwl = new ReentrantReadWriteLock();
        Map<String, String> cache = new HashMap<>();

        // Downgrade: write lock → read lock without releasing exclusivity in between
        rwl.writeLock().lock();
        try {
            cache.put("result", "computed-value");
            // Downgrade: acquire read WHILE holding write
            rwl.readLock().lock();
        } finally {
            rwl.writeLock().unlock(); // release write, still hold read
        }
        try {
            System.out.println("Downgraded to read lock, value: " + cache.get("result"));
        } finally {
            rwl.readLock().unlock();
        }

        System.out.println("Downgrade complete — no window for another writer to sneak in.");
    }

    public static void main(String[] args) throws InterruptedException {
        System.out.println("=== Reader-Writer Lock Demo ===\n");

        // --- Concurrent readers, exclusive writers ---
        System.out.println("--- Config Store (8 readers, 2 writers) ---");
        ConfigStore store = new ConfigStore();
        store.put("db.host", "localhost");
        store.put("db.port", "5432");

        Thread[] readers = new Thread[8];
        Thread[] writers = new Thread[2];

        for (int i = 0; i < 8; i++) {
            final int id = i;
            readers[i] = new Thread(() -> {
                for (int j = 0; j < 5; j++) {
                    Map<String, String> snapshot = store.getAll();
                    System.out.printf("  Reader-%d: %s%n", id, snapshot);
                    try { Thread.sleep(50); } catch (InterruptedException e) {}
                }
            });
        }

        for (int i = 0; i < 2; i++) {
            final int id = i;
            writers[i] = new Thread(() -> {
                for (int j = 0; j < 3; j++) {
                    store.put("writer" + id + ".key" + j, "val" + j);
                    System.out.printf("  Writer-%d: updated key%d%n", id, j);
                    try { Thread.sleep(100); } catch (InterruptedException e) {}
                }
            });
        }

        for (Thread t : readers) t.start();
        for (Thread t : writers) t.start();
        for (Thread t : readers) t.join();
        for (Thread t : writers) t.join();

        System.out.println("Final config: " + store.getAll());

        benchmark();
        downgradeDemo();

        System.out.println("\n=== Key: Readers share, writers exclude. Best when reads >> writes. ===");
    }
}
