/**
 * PROBLEM 1: Threads & Runnable
 *
 * Foundation of all concurrency. Know the 3 ways to create threads,
 * lifecycle states, and why you should prefer Runnable/Callable over extending Thread.
 *
 * INTERVIEW TIP: "Extend Thread vs implement Runnable?" — Always Runnable.
 * Java is single-inheritance; Runnable decouples task from execution mechanism.
 */
public class ThreadsAndRunnable {

    // Way 1: Extend Thread (avoid in real code)
    static class MyThread extends Thread {
        @Override
        public void run() {
            System.out.println("[ExtendThread] Running on: " + Thread.currentThread().getName());
            try {
                Thread.sleep(500);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
            System.out.println("[ExtendThread] Done on: " + Thread.currentThread().getName());
        }
    }

    // Way 2: Implement Runnable (preferred)
    static class MyRunnable implements Runnable {
        @Override
        public void run() {
            System.out.println("[Runnable] Running on: " + Thread.currentThread().getName());
            try {
                Thread.sleep(500);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
            System.out.println("[Runnable] Done on: " + Thread.currentThread().getName());
        }
    }

    // Way 3: Lambda (cleanest for simple tasks)
    static Runnable lambdaTask = () -> {
        System.out.println("[Lambda] Running on: " + Thread.currentThread().getName());
        try {
            Thread.sleep(500);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        System.out.println("[Lambda] Done on: " + Thread.currentThread().getName());
    };

    // Demonstrates thread lifecycle: NEW → RUNNABLE → TIMED_WAITING → TERMINATED
    static void demonstrateLifecycle() throws InterruptedException {
        Thread t = new Thread(() -> {
            try {
                Thread.sleep(1000);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }, "lifecycle-thread");

        System.out.println("\n--- Thread Lifecycle ---");
        System.out.println("After new:    " + t.getState());   // NEW

        t.start();
        System.out.println("After start:  " + t.getState());   // RUNNABLE

        Thread.sleep(200);
        System.out.println("During sleep: " + t.getState());   // TIMED_WAITING

        t.join();
        System.out.println("After join:   " + t.getState());   // TERMINATED
    }

    // join() — caller waits until the target thread finishes
    static void demonstrateJoin() throws InterruptedException {
        System.out.println("\n--- join() Demo ---");
        Thread slow = new Thread(() -> {
            try {
                Thread.sleep(1000);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
            System.out.println("Slow thread finished");
        });

        slow.start();
        System.out.println("Waiting for slow thread...");
        slow.join(); // blocks until slow is done
        System.out.println("Main continues after slow thread");
    }

    // interrupt() — cooperative cancellation
    static void demonstrateInterrupt() throws InterruptedException {
        System.out.println("\n--- interrupt() Demo ---");
        Thread worker = new Thread(() -> {
            while (!Thread.currentThread().isInterrupted()) {
                System.out.println("Working...");
                try {
                    Thread.sleep(300);
                } catch (InterruptedException e) {
                    System.out.println("Interrupted! Cleaning up...");
                    Thread.currentThread().interrupt(); // restore flag
                    break;
                }
            }
            System.out.println("Worker exiting gracefully");
        });

        worker.start();
        Thread.sleep(800);
        worker.interrupt();
        worker.join();
    }

    public static void main(String[] args) throws InterruptedException {
        System.out.println("=== 3 Ways to Create Threads ===\n");

        Thread t1 = new MyThread();
        Thread t2 = new Thread(new MyRunnable());
        Thread t3 = new Thread(lambdaTask);

        t1.start();
        t2.start();
        t3.start();

        t1.join();
        t2.join();
        t3.join();

        demonstrateLifecycle();
        demonstrateJoin();
        demonstrateInterrupt();

        System.out.println("\n=== All demos complete ===");
    }
}
