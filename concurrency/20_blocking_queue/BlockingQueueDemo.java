import java.util.LinkedList;
import java.util.Queue;
import java.util.concurrent.*;
import java.util.concurrent.locks.Condition;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;

/**
 * PROBLEM 20: Blocking Queue
 *
 * Thread-safe queue that blocks producers when full and consumers when empty.
 * The backbone of producer-consumer and thread pools.
 *
 * Two implementations:
 *   1. From scratch (Lock + 2 Conditions) — for interviews
 *   2. Java's BlockingQueue variants — for production
 *
 * Java BlockingQueue implementations:
 *   - ArrayBlockingQueue:   bounded, backed by array, fair option
 *   - LinkedBlockingQueue:  optionally bounded, higher throughput
 *   - PriorityBlockingQueue: unbounded, priority ordering
 *   - SynchronousQueue:     zero capacity, direct handoff
 *   - DelayQueue:           elements available after a delay
 *
 * INTERVIEW TIP: Build it from scratch, then explain which Java variant you'd pick
 * and why. That shows you understand both the internals and the ecosystem.
 */
public class BlockingQueueDemo {

    // --- Build from scratch ---
    static class MyBlockingQueue<T> {
        private final Queue<T> queue = new LinkedList<>();
        private final int capacity;
        private final Lock lock = new ReentrantLock();
        private final Condition notFull = lock.newCondition();
        private final Condition notEmpty = lock.newCondition();

        MyBlockingQueue(int capacity) {
            this.capacity = capacity;
        }

        // Blocks until space available
        public void put(T item) throws InterruptedException {
            lock.lock();
            try {
                while (queue.size() == capacity) {
                    notFull.await();
                }
                queue.add(item);
                notEmpty.signal();
            } finally {
                lock.unlock();
            }
        }

        // Blocks until item available
        public T take() throws InterruptedException {
            lock.lock();
            try {
                while (queue.isEmpty()) {
                    notEmpty.await();
                }
                T item = queue.poll();
                notFull.signal();
                return item;
            } finally {
                lock.unlock();
            }
        }

        // Non-blocking: returns null if empty
        public T poll() {
            lock.lock();
            try {
                if (queue.isEmpty()) return null;
                T item = queue.poll();
                notFull.signal();
                return item;
            } finally {
                lock.unlock();
            }
        }

        // Non-blocking: returns false if full
        public boolean offer(T item) {
            lock.lock();
            try {
                if (queue.size() == capacity) return false;
                queue.add(item);
                notEmpty.signal();
                return true;
            } finally {
                lock.unlock();
            }
        }

        // Timed: waits up to timeout
        public T poll(long timeout, TimeUnit unit) throws InterruptedException {
            long nanos = unit.toNanos(timeout);
            lock.lock();
            try {
                while (queue.isEmpty()) {
                    if (nanos <= 0) return null;
                    nanos = notEmpty.awaitNanos(nanos);
                }
                T item = queue.poll();
                notFull.signal();
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

    // --- Test our implementation ---
    static void testCustomQueue() throws InterruptedException {
        System.out.println("--- Custom BlockingQueue ---");
        MyBlockingQueue<Integer> queue = new MyBlockingQueue<>(5);

        int numItems = 20;

        Thread producer = new Thread(() -> {
            try {
                for (int i = 0; i < numItems; i++) {
                    queue.put(i);
                    System.out.printf("  Put: %d (size: %d)%n", i, queue.size());
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });

        Thread consumer = new Thread(() -> {
            try {
                for (int i = 0; i < numItems; i++) {
                    int item = queue.take();
                    System.out.printf("  Take: %d (size: %d)%n", item, queue.size());
                    Thread.sleep(50); // slower consumer
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });

        producer.start();
        consumer.start();
        producer.join();
        consumer.join();
        System.out.println("Custom queue test passed.\n");
    }

    // --- Compare Java's BlockingQueue variants ---
    static void compareVariants() throws InterruptedException {
        System.out.println("--- Java BlockingQueue Variants ---\n");

        // 1. ArrayBlockingQueue: fixed size, fair option
        ArrayBlockingQueue<String> array = new ArrayBlockingQueue<>(10, true);
        array.put("item1");
        System.out.println("ArrayBlockingQueue: " + array.take());

        // 2. LinkedBlockingQueue: optionally bounded, two-lock (higher throughput)
        LinkedBlockingQueue<String> linked = new LinkedBlockingQueue<>(10);
        linked.put("item2");
        System.out.println("LinkedBlockingQueue: " + linked.take());

        // 3. SynchronousQueue: zero capacity, direct handoff
        SynchronousQueue<String> sync = new SynchronousQueue<>();
        new Thread(() -> {
            try { sync.put("item3"); } catch (InterruptedException e) {}
        }).start();
        System.out.println("SynchronousQueue: " + sync.take());

        // 4. PriorityBlockingQueue: unbounded, sorted
        PriorityBlockingQueue<Integer> priority = new PriorityBlockingQueue<>();
        priority.put(3);
        priority.put(1);
        priority.put(2);
        System.out.println("PriorityBlockingQueue: " + priority.take() + ", " +
                priority.take() + ", " + priority.take());

        // 5. DelayQueue
        System.out.println("\nDelayQueue: elements become available after delay");

        System.out.println("\n--- When to use which? ---");
        System.out.println("| Queue                 | Use Case                                    |");
        System.out.println("|-----------------------|---------------------------------------------|");
        System.out.println("| ArrayBlockingQueue    | Bounded, fairness needed, predictable memory |");
        System.out.println("| LinkedBlockingQueue   | Higher throughput, separate put/take locks   |");
        System.out.println("| SynchronousQueue      | Direct handoff (thread pool with 0 queue)   |");
        System.out.println("| PriorityBlockingQueue | Priority-ordered processing                 |");
        System.out.println("| DelayQueue            | Scheduled tasks, retry with backoff         |");
    }

    // --- BlockingQueue as the backbone of a thread pool ---
    static void threadPoolBackbone() throws InterruptedException {
        System.out.println("\n--- BlockingQueue as Thread Pool Backbone ---\n");

        // This is literally how ThreadPoolExecutor works internally
        BlockingQueue<Runnable> taskQueue = new ArrayBlockingQueue<>(10);
        int numWorkers = 3;
        Thread[] workers = new Thread[numWorkers];
        volatile boolean[] running = {true};

        for (int i = 0; i < numWorkers; i++) {
            final int id = i;
            workers[i] = new Thread(() -> {
                while (running[0] || !taskQueue.isEmpty()) {
                    try {
                        Runnable task = taskQueue.poll(100, TimeUnit.MILLISECONDS);
                        if (task != null) {
                            System.out.printf("  Worker-%d executing task%n", id);
                            task.run();
                        }
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                        break;
                    }
                }
                System.out.printf("  Worker-%d shutting down%n", id);
            }, "Worker-" + i);
            workers[i].start();
        }

        // Submit tasks
        for (int i = 0; i < 10; i++) {
            final int taskId = i;
            taskQueue.put(() -> {
                try { Thread.sleep(100); } catch (InterruptedException e) {}
            });
        }

        Thread.sleep(2000);
        running[0] = false;
        for (Thread w : workers) w.join(2000);
        System.out.println("Mini thread pool shut down.");
    }

    public static void main(String[] args) throws InterruptedException {
        System.out.println("=== Blocking Queue Demo ===\n");

        testCustomQueue();
        compareVariants();
        threadPoolBackbone();

        System.out.println("\n=== Key: put/take block. offer/poll don't. Build it once, use BlockingQueue forever. ===");
    }
}
