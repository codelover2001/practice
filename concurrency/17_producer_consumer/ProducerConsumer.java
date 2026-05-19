import java.util.LinkedList;
import java.util.Queue;
import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.locks.Condition;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;

/**
 * PROBLEM 17: Producer-Consumer
 *
 * Producers add to a shared buffer, consumers remove.
 * Buffer full → producers block. Buffer empty → consumers block.
 *
 * Two implementations:
 *   1. Manual: Lock + Conditions (understand the mechanics)
 *   2. BlockingQueue: Java's built-in (use in production)
 *
 * INTERVIEW TIP: They'll ask you to implement it manually first,
 * then ask "what would you use in production?" → BlockingQueue.
 * Know BOTH approaches cold.
 */
public class ProducerConsumer {

    // --- Implementation 1: Manual with Lock + Conditions ---
    static class ManualBuffer<T> {
        private final Queue<T> queue = new LinkedList<>();
        private final int capacity;
        private final Lock lock = new ReentrantLock();
        private final Condition notFull = lock.newCondition();
        private final Condition notEmpty = lock.newCondition();

        ManualBuffer(int capacity) {
            this.capacity = capacity;
        }

        public void produce(T item) throws InterruptedException {
            lock.lock();
            try {
                while (queue.size() == capacity) {
                    notFull.await(); // buffer full, wait
                }
                queue.add(item);
                notEmpty.signal(); // wake a consumer
            } finally {
                lock.unlock();
            }
        }

        public T consume() throws InterruptedException {
            lock.lock();
            try {
                while (queue.isEmpty()) {
                    notEmpty.await(); // buffer empty, wait
                }
                T item = queue.poll();
                notFull.signal(); // wake a producer
                return item;
            } finally {
                lock.unlock();
            }
        }

        public int size() {
            lock.lock();
            try { return queue.size(); }
            finally { lock.unlock(); }
        }
    }

    // --- Implementation 2: synchronized with wait/notify ---
    static class SyncBuffer<T> {
        private final Queue<T> queue = new LinkedList<>();
        private final int capacity;

        SyncBuffer(int capacity) {
            this.capacity = capacity;
        }

        public synchronized void produce(T item) throws InterruptedException {
            while (queue.size() == capacity) wait();
            queue.add(item);
            notifyAll(); // must use notifyAll (not notify) — multiple consumers
        }

        public synchronized T consume() throws InterruptedException {
            while (queue.isEmpty()) wait();
            T item = queue.poll();
            notifyAll();
            return item;
        }
    }

    public static void main(String[] args) throws InterruptedException {
        System.out.println("=== Producer-Consumer Demo ===\n");

        // --- Manual implementation ---
        System.out.println("--- Manual (Lock + Conditions) ---");
        ManualBuffer<Integer> manual = new ManualBuffer<>(5);
        runDemo(manual::produce, manual::consume, 3, 2, 20);

        // --- BlockingQueue (production-grade) ---
        System.out.println("\n--- BlockingQueue (production) ---");
        BlockingQueue<Integer> bq = new ArrayBlockingQueue<>(5);
        runDemo(bq::put, bq::take, 3, 2, 20);

        // --- Multi-producer, multi-consumer ---
        System.out.println("\n--- Multi-producer (5), multi-consumer (3) ---");
        BlockingQueue<String> workQueue = new ArrayBlockingQueue<>(10);

        int numProducers = 5;
        int numConsumers = 3;
        int itemsPerProducer = 10;

        Thread[] producers = new Thread[numProducers];
        Thread[] consumers = new Thread[numConsumers];

        for (int i = 0; i < numProducers; i++) {
            final int pid = i;
            producers[i] = new Thread(() -> {
                try {
                    for (int j = 0; j < itemsPerProducer; j++) {
                        String item = "P" + pid + "-item" + j;
                        workQueue.put(item);
                    }
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            }, "Producer-" + i);
            producers[i].start();
        }

        // Poison pill termination
        final String POISON = "POISON";
        java.util.concurrent.atomic.AtomicInteger consumed = new java.util.concurrent.atomic.AtomicInteger(0);

        for (int i = 0; i < numConsumers; i++) {
            consumers[i] = new Thread(() -> {
                try {
                    while (true) {
                        String item = workQueue.take();
                        if (item.equals(POISON)) return;
                        consumed.incrementAndGet();
                    }
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            }, "Consumer-" + i);
            consumers[i].start();
        }

        for (Thread p : producers) p.join();

        // Send poison pills to terminate consumers
        for (int i = 0; i < numConsumers; i++) {
            workQueue.put(POISON);
        }
        for (Thread c : consumers) c.join();

        System.out.println("Total produced: " + (numProducers * itemsPerProducer));
        System.out.println("Total consumed: " + consumed.get());

        System.out.println("\n=== Key: Manual for interviews, BlockingQueue for production. ===");
        System.out.println("=== Always await() in a while loop. Use poison pill for shutdown. ===");
    }

    // Helper to run producer-consumer demo with any buffer implementation
    interface Producer { void produce(Integer item) throws InterruptedException; }
    interface Consumer { Integer consume() throws InterruptedException; }

    static void runDemo(Producer producer, Consumer consumer,
                        int numProducers, int numConsumers, int totalItems) throws InterruptedException {

        java.util.concurrent.atomic.AtomicInteger produced = new java.util.concurrent.atomic.AtomicInteger(0);
        java.util.concurrent.atomic.AtomicInteger consumed = new java.util.concurrent.atomic.AtomicInteger(0);
        int itemsPerProducer = totalItems / numProducers;

        Thread[] pThreads = new Thread[numProducers];
        Thread[] cThreads = new Thread[numConsumers];

        for (int i = 0; i < numProducers; i++) {
            pThreads[i] = new Thread(() -> {
                try {
                    for (int j = 0; j < itemsPerProducer; j++) {
                        int item = produced.incrementAndGet();
                        producer.produce(item);
                        System.out.println("  Produced: " + item);
                    }
                } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
            });
            pThreads[i].start();
        }

        for (int i = 0; i < numConsumers; i++) {
            cThreads[i] = new Thread(() -> {
                try {
                    while (consumed.get() < totalItems) {
                        Integer item = consumer.consume();
                        if (item != null) {
                            consumed.incrementAndGet();
                            System.out.println("  Consumed: " + item);
                        }
                    }
                } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
            });
            cThreads[i].start();
        }

        for (Thread t : pThreads) t.join();
        for (Thread t : cThreads) t.join(2000);
        System.out.println("Produced: " + produced.get() + ", Consumed: " + consumed.get());
    }
}
