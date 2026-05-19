import java.util.concurrent.*;
import java.util.ArrayList;
import java.util.List;

/**
 * PROBLEM 16: Thread Pool
 *
 * Reuse a fixed set of threads instead of creating/destroying them constantly.
 * Massive performance win + controls concurrency level.
 *
 * Java's ExecutorService hierarchy:
 *   Executor → ExecutorService → ThreadPoolExecutor
 *                               → ScheduledThreadPoolExecutor
 *
 * Key parameters of ThreadPoolExecutor:
 *   corePoolSize    — minimum threads always alive
 *   maximumPoolSize — maximum threads under load
 *   keepAliveTime   — idle time before extra threads die
 *   workQueue       — where tasks wait (LinkedBlockingQueue, SynchronousQueue, etc.)
 *   rejectionPolicy — what happens when queue is full (AbortPolicy, CallerRunsPolicy, etc.)
 *
 * INTERVIEW TIP: Never use Executors.newCachedThreadPool() in production — unbounded thread creation.
 * Always specify queue bounds and rejection policy explicitly.
 */
public class ThreadPoolDemo {

    // --- Compare: Thread-per-task vs Pool ---
    static void threadPerTaskVsPool() throws Exception {
        System.out.println("--- Thread-per-task vs Thread Pool ---\n");
        int numTasks = 1000;

        // Thread per task
        long start = System.nanoTime();
        Thread[] threads = new Thread[numTasks];
        for (int i = 0; i < numTasks; i++) {
            threads[i] = new Thread(() -> {
                try { Thread.sleep(1); } catch (InterruptedException e) {}
            });
            threads[i].start();
        }
        for (Thread t : threads) t.join();
        long threadPerTask = System.nanoTime() - start;

        // Thread pool
        ExecutorService pool = Executors.newFixedThreadPool(10);
        start = System.nanoTime();
        CountDownLatch latch = new CountDownLatch(numTasks);
        for (int i = 0; i < numTasks; i++) {
            pool.submit(() -> {
                try { Thread.sleep(1); } catch (InterruptedException e) {}
                latch.countDown();
            });
        }
        latch.await();
        long poolTime = System.nanoTime() - start;
        pool.shutdown();

        System.out.printf("Thread-per-task (1000 threads): %d ms%n", threadPerTask / 1_000_000);
        System.out.printf("Thread pool (10 threads):       %d ms%n", poolTime / 1_000_000);
        System.out.printf("Pool is %.1fx faster%n\n", (double) threadPerTask / poolTime);
    }

    // --- Custom ThreadPoolExecutor with all parameters ---
    static void customPoolDemo() throws InterruptedException {
        System.out.println("--- Custom ThreadPoolExecutor ---\n");

        ThreadPoolExecutor pool = new ThreadPoolExecutor(
                2,                                   // corePoolSize
                4,                                   // maximumPoolSize
                60L, TimeUnit.SECONDS,               // keepAliveTime
                new ArrayBlockingQueue<>(5),          // bounded work queue
                new ThreadFactory() {                 // custom thread factory
                    private int count = 0;
                    @Override
                    public Thread newThread(Runnable r) {
                        return new Thread(r, "custom-worker-" + count++);
                    }
                },
                new ThreadPoolExecutor.CallerRunsPolicy() // rejection: caller runs the task
        );

        // Submit more tasks than pool + queue can hold
        for (int i = 0; i < 15; i++) {
            final int id = i;
            try {
                pool.submit(() -> {
                    System.out.printf("  [%s] Task %d (pool: %d active, %d queued)%n",
                            Thread.currentThread().getName(), id,
                            pool.getActiveCount(), pool.getQueue().size());
                    try { Thread.sleep(500); } catch (InterruptedException e) {}
                });
            } catch (RejectedExecutionException e) {
                System.out.println("  Task " + id + " REJECTED");
            }
        }

        pool.shutdown();
        pool.awaitTermination(30, TimeUnit.SECONDS);

        System.out.println("\nPool stats:");
        System.out.println("  Completed tasks: " + pool.getCompletedTaskCount());
        System.out.println("  Largest pool size: " + pool.getLargestPoolSize());
    }

    // --- Callable + Future: getting results back ---
    static void futureDemo() throws Exception {
        System.out.println("\n--- Callable + Future ---\n");

        ExecutorService pool = Executors.newFixedThreadPool(3);
        List<Future<String>> futures = new ArrayList<>();

        for (int i = 0; i < 5; i++) {
            final int id = i;
            Future<String> future = pool.submit(() -> {
                Thread.sleep(id * 200);
                return "Result-" + id;
            });
            futures.add(future);
        }

        for (Future<String> f : futures) {
            System.out.println("Got: " + f.get()); // blocks until result ready
        }

        // invokeAll: submit batch, wait for all
        List<Callable<Integer>> batch = List.of(
                () -> { Thread.sleep(300); return 1; },
                () -> { Thread.sleep(100); return 2; },
                () -> { Thread.sleep(200); return 3; }
        );

        System.out.println("\ninvokeAll results:");
        for (Future<Integer> f : pool.invokeAll(batch)) {
            System.out.println("  " + f.get());
        }

        // invokeAny: first result wins
        int fastest = pool.invokeAny(batch);
        System.out.println("invokeAny (first to finish): " + fastest);

        pool.shutdown();
    }

    // --- ScheduledExecutorService ---
    static void scheduledDemo() throws InterruptedException {
        System.out.println("\n--- Scheduled Executor ---\n");

        ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(2);

        // One-shot delay
        scheduler.schedule(
                () -> System.out.println("  Delayed task ran!"),
                500, TimeUnit.MILLISECONDS
        );

        // Repeated at fixed rate
        ScheduledFuture<?> periodic = scheduler.scheduleAtFixedRate(
                () -> System.out.println("  Periodic tick at " + System.currentTimeMillis() % 10000),
                0, 300, TimeUnit.MILLISECONDS
        );

        Thread.sleep(1500);
        periodic.cancel(false);
        scheduler.shutdown();
        scheduler.awaitTermination(5, TimeUnit.SECONDS);
        System.out.println("Scheduler shut down.");
    }

    public static void main(String[] args) throws Exception {
        System.out.println("=== Thread Pool Demo ===\n");

        threadPerTaskVsPool();
        customPoolDemo();
        futureDemo();
        scheduledDemo();

        System.out.println("\n=== Key: Always bound your pool AND queue. Know the rejection policies. ===");
    }
}
