import java.util.PriorityQueue;
import java.util.List;
import java.util.ArrayList;
import java.util.concurrent.atomic.AtomicInteger;

/*
 * DESIGN: TASK SCHEDULER (hard)
 * ==============================
 *
 * WHAT IT DOES:
 *   - Schedule tasks to run at specific times or after a delay
 *   - Support priorities — higher priority tasks run first
 *   - Support recurring tasks (run every N seconds)
 *   - A thread pool of workers picks up tasks and executes them
 *
 * NOUNS: Task, TaskScheduler, Worker/Executor, TaskQueue
 * VERBS: schedule(task, delay), scheduleRecurring(task, interval), cancel(taskId), execute()
 *
 * PATTERNS USED:
 *   - Strategy  → different scheduling policies (FIFO, Priority, Round-Robin)
 *   - Observer  → notify when task completes/fails
 *   - Command   → Task itself is a command (encapsulates the action to execute)
 *
 * KEY DESIGN DECISIONS:
 *   1. Task has: id, priority, scheduledTime, Runnable action, isRecurring, interval
 *   2. PriorityQueue ordered by scheduledTime (earliest first), then priority
 *   3. Worker threads poll from queue, check if it's time to execute
 *   4. For practice: simulate time instead of real threading (simpler, same design)
 *
 * CLASSES TO BUILD:
 *   1. Task — id, name, priority, scheduledTimeMs, Runnable action, recurring flag, interval
 *   2. TaskScheduler — task queue (PriorityQueue), schedule/cancel methods
 *   3. (Bonus) TaskExecutor — worker that picks tasks and runs them
 *
 * API:
 *   scheduler.schedule("backup-db", () -> doBackup(), delayMs, priority)
 *   scheduler.scheduleRecurring("health-check", () -> ping(), intervalMs, priority)
 *   scheduler.cancel(taskId)
 *   scheduler.run()   → simulate execution: process all due tasks in order
 *
 * SIMPLIFICATION FOR PRACTICE:
 *   Instead of real threads, simulate time:
 *   - scheduler.tick(currentTimeMs) → execute all tasks where scheduledTime <= currentTime
 *   - Recurring tasks re-add themselves with scheduledTime += interval
 *   This tests the exact same design without multithreading complexity.
 */

// Step 1: Create Task class (implements Comparable for PriorityQueue)
// Fields: String id, String name, int priority, long scheduledTimeMs, 
//         Runnable action, boolean recurring, long intervalMs, boolean cancelled
// Comparable: compare by scheduledTimeMs first, then by priority (higher = first)
// YOUR CODE HERE


// Step 2: Build TaskScheduler
// Fields:
//   - PriorityQueue<Task> taskQueue
//   - Map<String, Task> taskMap (for cancel by ID)
//   - AtomicInteger idCounter
//
// Methods:
//   - String schedule(String name, Runnable action, long delayMs, int priority)
//       → create Task with scheduledTime = currentTime + delay, add to queue, return id
//   - String scheduleRecurring(String name, Runnable action, long intervalMs, int priority)
//       → same but mark as recurring
//   - void cancel(String taskId)
//       → mark task as cancelled (don't remove from queue — lazy deletion)
//   - void tick(long currentTimeMs)
//       → poll all tasks where scheduledTime <= currentTime
//       → skip cancelled tasks
//       → execute task's action
//       → if recurring: create new task with scheduledTime += interval, re-add
//   - int pendingTasks() → queue size
// YOUR CODE HERE


// Step 3: Main class to test
public class TaskScheduler {
    public static void main(String[] args) {
        // TODO: Create scheduler
        // TODO: Schedule "Send Email" at t=1000, priority 1
        // TODO: Schedule "DB Backup" at t=500, priority 2 (runs first — earlier time)
        // TODO: Schedule recurring "Health Check" every 1000ms, priority 0
        // TODO: tick(500) → DB Backup should run
        // TODO: tick(1000) → Send Email + Health Check should run
        // TODO: tick(2000) → Health Check again (recurring)
        // TODO: Cancel Health Check, tick(3000) → nothing runs
        System.out.println("Task Scheduler - implement me!");
    }
}
