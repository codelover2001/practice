import java.util.LinkedList;
import java.util.Queue;
import java.util.concurrent.locks.Condition;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;

/**
 * PROBLEM 8: Condition Variables
 *
 * Thread waits on a condition until another thread signals it.
 * The "wake me up when ready" primitive.
 *
 * Lock.newCondition() → creates a condition bound to that lock.
 * await()   → releases lock + sleeps (atomically)
 * signal()  → wakes ONE waiting thread
 * signalAll() → wakes ALL waiting threads
 *
 * INTERVIEW TIP: Multiple conditions on one lock is the killer feature.
 * With synchronized, you only get ONE wait set (wait/notify).
 * With Lock + Condition, you can have separate "notFull" and "notEmpty" conditions.
 */
public class ConditionVariablesDemo {

    // --- Producer-Consumer with explicit Conditions ---
    static class BoundedBuffer<T> {
        private final Queue<T> queue = new LinkedList<>();
        private final int capacity;
        private final Lock lock = new ReentrantLock();
        private final Condition notFull = lock.newCondition();
        private final Condition notEmpty = lock.newCondition();

        BoundedBuffer(int capacity) {
            this.capacity = capacity;
        }

        public void put(T item) throws InterruptedException {
            lock.lock();
            try {
                while (queue.size() == capacity) {
                    System.out.println("  [Producer] Buffer full, waiting...");
                    notFull.await(); // release lock + sleep until signaled
                }
                queue.add(item);
                System.out.println("  [Producer] Added: " + item + " (size: " + queue.size() + ")");
                notEmpty.signal(); // wake a consumer
            } finally {
                lock.unlock();
            }
        }

        public T take() throws InterruptedException {
            lock.lock();
            try {
                while (queue.isEmpty()) {
                    System.out.println("  [Consumer] Buffer empty, waiting...");
                    notEmpty.await();
                }
                T item = queue.poll();
                System.out.println("  [Consumer] Took: " + item + " (size: " + queue.size() + ")");
                notFull.signal(); // wake a producer
                return item;
            } finally {
                lock.unlock();
            }
        }
    }

    // --- Condition as a gate/barrier ---
    static class Gate {
        private final Lock lock = new ReentrantLock();
        private final Condition opened = lock.newCondition();
        private boolean isOpen = false;

        public void await_gate() throws InterruptedException {
            lock.lock();
            try {
                while (!isOpen) {
                    opened.await();
                }
            } finally {
                lock.unlock();
            }
        }

        public void open() {
            lock.lock();
            try {
                isOpen = true;
                opened.signalAll(); // wake ALL waiting threads
            } finally {
                lock.unlock();
            }
        }
    }

    public static void main(String[] args) throws InterruptedException {
        System.out.println("=== Condition Variables Demo ===\n");

        // --- Producer-Consumer ---
        System.out.println("--- Producer-Consumer with 2 Conditions ---");
        BoundedBuffer<Integer> buffer = new BoundedBuffer<>(3);

        Thread producer = new Thread(() -> {
            try {
                for (int i = 1; i <= 8; i++) {
                    buffer.put(i);
                    Thread.sleep(100);
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }, "Producer");

        Thread consumer = new Thread(() -> {
            try {
                for (int i = 0; i < 8; i++) {
                    buffer.take();
                    Thread.sleep(250); // consumer is slower
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }, "Consumer");

        producer.start();
        consumer.start();
        producer.join();
        consumer.join();

        // --- Gate pattern ---
        System.out.println("\n--- Gate Pattern ---");
        Gate gate = new Gate();

        for (int i = 0; i < 5; i++) {
            final int id = i;
            new Thread(() -> {
                try {
                    System.out.println("Thread-" + id + " waiting at gate");
                    gate.await_gate();
                    System.out.println("Thread-" + id + " passed the gate!");
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            }).start();
        }

        Thread.sleep(500);
        System.out.println(">>> Opening the gate! <<<");
        gate.open();

        Thread.sleep(500);
        System.out.println("\n=== Key: await() in a WHILE loop. signal() wakes one, signalAll() wakes all. ===");
        System.out.println("=== Conditions let you separate wait sets (notFull vs notEmpty). ===");
    }
}
