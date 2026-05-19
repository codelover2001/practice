import java.util.LinkedList;
import java.util.Queue;
import java.util.concurrent.Semaphore;
import java.util.concurrent.locks.Condition;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;

/**
 * PROBLEM 15: Signaling Pattern (Producer-Consumer variant)
 *
 * One thread does work and signals another via condition variable or semaphore.
 * The heartbeat of most concurrent systems.
 *
 * Patterns shown:
 *   1. Condition-based signaling (wait/signal)
 *   2. Semaphore-based signaling (acquire/release)
 *   3. Task queue with poison pill termination
 *
 * INTERVIEW TIP: This is the building block. If you can implement this cleanly,
 * you can build thread pools, event loops, and actor systems.
 */
public class SignalingPattern {

    // --- Pattern 1: Condition-based task queue ---
    static class TaskQueue {
        private final Queue<Runnable> queue = new LinkedList<>();
        private final Lock lock = new ReentrantLock();
        private final Condition hasWork = lock.newCondition();
        private volatile boolean shutdown = false;

        public void submit(Runnable task) {
            lock.lock();
            try {
                queue.add(task);
                hasWork.signal(); // wake ONE consumer
            } finally {
                lock.unlock();
            }
        }

        public Runnable take() throws InterruptedException {
            lock.lock();
            try {
                while (queue.isEmpty() && !shutdown) {
                    hasWork.await(); // sleep until signaled
                }
                return queue.poll(); // null if shutdown + empty
            } finally {
                lock.unlock();
            }
        }

        public void shutdown() {
            lock.lock();
            try {
                shutdown = true;
                hasWork.signalAll(); // wake all consumers so they can exit
            } finally {
                lock.unlock();
            }
        }
    }

    // --- Pattern 2: Semaphore-based signaling ---
    static class SemaphoreSignal {
        private final Semaphore signal = new Semaphore(0);
        private volatile String result;

        public void waitForResult() throws InterruptedException {
            System.out.println("[Consumer] Waiting for result...");
            signal.acquire(); // blocks until producer calls release()
            System.out.println("[Consumer] Got result: " + result);
        }

        public void produceResult(String value) {
            System.out.println("[Producer] Computing...");
            try { Thread.sleep(500); } catch (InterruptedException e) { return; }
            result = value;
            System.out.println("[Producer] Result ready, signaling consumer");
            signal.release(); // wake the consumer
        }
    }

    // --- Pattern 3: Multi-consumer task queue with graceful shutdown ---
    static class WorkerPool {
        private final TaskQueue queue = new TaskQueue();
        private final Thread[] workers;

        WorkerPool(int numWorkers) {
            workers = new Thread[numWorkers];
            for (int i = 0; i < numWorkers; i++) {
                final int id = i;
                workers[i] = new Thread(() -> {
                    System.out.println("Worker-" + id + " started");
                    while (true) {
                        try {
                            Runnable task = queue.take();
                            if (task == null) break; // shutdown signal
                            task.run();
                        } catch (InterruptedException e) {
                            Thread.currentThread().interrupt();
                            break;
                        }
                    }
                    System.out.println("Worker-" + id + " stopped");
                }, "Worker-" + id);
                workers[i].start();
            }
        }

        public void submit(Runnable task) {
            queue.submit(task);
        }

        public void shutdown() throws InterruptedException {
            queue.shutdown();
            for (Thread w : workers) w.join();
        }
    }

    public static void main(String[] args) throws InterruptedException {
        System.out.println("=== Signaling Pattern Demo ===\n");

        // --- Semaphore signaling ---
        System.out.println("--- Semaphore Signaling ---");
        SemaphoreSignal signal = new SemaphoreSignal();
        Thread consumer = new Thread(() -> {
            try { signal.waitForResult(); } catch (InterruptedException e) {}
        });
        Thread producer = new Thread(() -> signal.produceResult("42"));
        consumer.start();
        producer.start();
        consumer.join();
        producer.join();

        // --- Worker pool with signaling ---
        System.out.println("\n--- Worker Pool (3 consumers, 10 tasks) ---");
        WorkerPool pool = new WorkerPool(3);

        for (int i = 0; i < 10; i++) {
            final int taskId = i;
            pool.submit(() -> {
                System.out.printf("  [%s] Processing task %d%n",
                        Thread.currentThread().getName(), taskId);
                try { Thread.sleep(200); } catch (InterruptedException e) {}
            });
        }

        Thread.sleep(1000);
        System.out.println("\nShutting down...");
        pool.shutdown();
        System.out.println("All workers stopped.");

        System.out.println("\n=== Key: Signal = \"wake up, there's work\". The glue of concurrent systems. ===");
    }
}
