/**
 * PROBLEM 4: Synchronized / Monitor
 *
 * Every Java object has an intrinsic lock (monitor). synchronized acquires it automatically.
 * wait()/notify()/notifyAll() are the monitor's condition mechanism.
 *
 * INTERVIEW TIP: "What's the difference between synchronized method and synchronized block?"
 *   - Method locks `this` (or Class object for static). Block lets you choose the lock object.
 *   - Block is more flexible → lock only the critical section, not the entire method.
 */
public class SynchronizedMonitor {

    // --- Synchronized method: locks on `this` ---
    static class Counter {
        private int count = 0;

        public synchronized void increment() {
            count++;
        }

        public synchronized int getCount() {
            return count;
        }
    }

    // --- Synchronized block: finer control ---
    static class FineGrainedCounter {
        private int count = 0;
        private final Object lock = new Object(); // dedicated lock object

        public void increment() {
            // non-critical work can happen here without holding the lock
            synchronized (lock) {
                count++;
            }
        }

        public int getCount() {
            synchronized (lock) {
                return count;
            }
        }
    }

    // --- wait() / notify() — the monitor pattern ---
    static class BoundedBuffer {
        private final int[] buffer;
        private int count = 0;
        private int putIdx = 0;
        private int takeIdx = 0;

        BoundedBuffer(int capacity) {
            buffer = new int[capacity];
        }

        public synchronized void put(int value) throws InterruptedException {
            while (count == buffer.length) {
                wait(); // release lock, sleep until notified
            }
            buffer[putIdx] = value;
            putIdx = (putIdx + 1) % buffer.length;
            count++;
            notifyAll(); // wake up waiting consumers
        }

        public synchronized int take() throws InterruptedException {
            while (count == 0) {
                wait(); // release lock, sleep until notified
            }
            int value = buffer[takeIdx];
            takeIdx = (takeIdx + 1) % buffer.length;
            count--;
            notifyAll(); // wake up waiting producers
            return value;
        }

        public synchronized int size() {
            return count;
        }
    }

    // --- Static synchronized: locks on the Class object ---
    static class GlobalLogger {
        // All threads share one lock: GlobalLogger.class
        public static synchronized void log(String msg) {
            System.out.println("[" + Thread.currentThread().getName() + "] " + msg);
        }
    }

    public static void main(String[] args) throws InterruptedException {
        System.out.println("=== Synchronized / Monitor Demo ===\n");

        // 1. Basic synchronized counter
        System.out.println("--- Synchronized Counter ---");
        Counter counter = new Counter();
        Thread[] threads = new Thread[10];
        for (int i = 0; i < 10; i++) {
            threads[i] = new Thread(() -> {
                for (int j = 0; j < 10_000; j++) counter.increment();
            });
            threads[i].start();
        }
        for (Thread t : threads) t.join();
        System.out.println("Expected: 100000, Got: " + counter.getCount());

        // 2. wait/notify with BoundedBuffer
        System.out.println("\n--- wait() / notify() with BoundedBuffer ---");
        BoundedBuffer buf = new BoundedBuffer(5);

        Thread producer = new Thread(() -> {
            try {
                for (int i = 1; i <= 10; i++) {
                    buf.put(i);
                    System.out.println("Produced: " + i);
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });

        Thread consumer = new Thread(() -> {
            try {
                for (int i = 0; i < 10; i++) {
                    int val = buf.take();
                    System.out.println("Consumed: " + val);
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });

        producer.start();
        consumer.start();
        producer.join();
        consumer.join();

        // 3. Static synchronized
        System.out.println("\n--- Static Synchronized Logger ---");
        for (int i = 0; i < 5; i++) {
            final int idx = i;
            new Thread(() -> GlobalLogger.log("Message " + idx), "Worker-" + i).start();
        }

        Thread.sleep(500);

        System.out.println("\n=== Key: wait() releases the lock, notify() wakes ONE, notifyAll() wakes ALL ===");
        System.out.println("=== Always call wait() in a WHILE loop, never IF ===");
    }
}
