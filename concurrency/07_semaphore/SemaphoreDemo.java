import java.util.concurrent.Semaphore;

/**
 * PROBLEM 7: Semaphore
 *
 * Generalization of mutex. Allows N threads to access a resource at once (counting semaphore).
 * Binary semaphore (permits=1) behaves like a mutex.
 *
 * acquire() → decrements permits (blocks if 0)
 * release() → increments permits (wakes a blocked thread)
 *
 * INTERVIEW TIP: Classic use case = connection pool, rate limiting, resource throttling.
 * Know the difference: Mutex has ownership (only holder can release). Semaphore does not.
 */
public class SemaphoreDemo {

    // --- Connection Pool with Semaphore ---
    static class ConnectionPool {
        private final Semaphore semaphore;
        private final String[] connections;
        private final boolean[] inUse;

        ConnectionPool(int size) {
            semaphore = new Semaphore(size, true); // fair = FIFO ordering
            connections = new String[size];
            inUse = new boolean[size];
            for (int i = 0; i < size; i++) {
                connections[i] = "Connection-" + i;
            }
        }

        public String acquire() throws InterruptedException {
            semaphore.acquire(); // blocks if all connections are in use
            return getNextAvailable();
        }

        public void release(String connection) {
            markAvailable(connection);
            semaphore.release(); // wake up a waiting thread
        }

        private synchronized String getNextAvailable() {
            for (int i = 0; i < connections.length; i++) {
                if (!inUse[i]) {
                    inUse[i] = true;
                    return connections[i];
                }
            }
            throw new IllegalStateException("Bug: semaphore should prevent this");
        }

        private synchronized void markAvailable(String connection) {
            for (int i = 0; i < connections.length; i++) {
                if (connections[i].equals(connection)) {
                    inUse[i] = false;
                    return;
                }
            }
        }

        public int availablePermits() {
            return semaphore.availablePermits();
        }

        public int queueLength() {
            return semaphore.getQueueLength();
        }
    }

    public static void main(String[] args) throws InterruptedException {
        System.out.println("=== Semaphore Demo: Connection Pool ===\n");

        ConnectionPool pool = new ConnectionPool(5); // max 5 concurrent connections

        // Hammer it with 20 threads
        Thread[] threads = new Thread[20];
        for (int i = 0; i < 20; i++) {
            final int id = i;
            threads[i] = new Thread(() -> {
                try {
                    System.out.printf("Thread-%02d: waiting for connection... (available: %d, queued: %d)%n",
                            id, pool.availablePermits(), pool.queueLength());

                    String conn = pool.acquire();
                    System.out.printf("Thread-%02d: GOT %s%n", id, conn);

                    // simulate work
                    Thread.sleep((long) (Math.random() * 500 + 100));

                    pool.release(conn);
                    System.out.printf("Thread-%02d: RELEASED %s%n", id, conn);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            });
            threads[i].start();

            Thread.sleep(50); // stagger starts to see queueing
        }

        for (Thread t : threads) t.join();

        System.out.println("\nAll 20 threads completed with only 5 connections.");
        System.out.println("Final available permits: " + pool.availablePermits());

        // --- tryAcquire demo ---
        System.out.println("\n--- tryAcquire (non-blocking) ---");
        Semaphore sem = new Semaphore(2);
        sem.acquire();
        sem.acquire();
        System.out.println("Both permits taken.");
        System.out.println("tryAcquire: " + sem.tryAcquire()); // false, doesn't block
        sem.release();
        System.out.println("Released one. tryAcquire: " + sem.tryAcquire()); // true

        System.out.println("\n=== Key: Semaphore = mutex with N permits. No ownership. ===");
    }
}
