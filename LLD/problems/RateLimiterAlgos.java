import java.util.Map;
import java.util.HashMap;
import java.util.Queue;
import java.util.LinkedList;

/*
 * ALL 3 RATE LIMITING ALGORITHMS — explained line by line
 * Run this file to see each algorithm in action with traced output.
 */

interface RateLimitStrategy {
    boolean isAllowed(String clientId);
}

// ====================================================================
// ALGORITHM 1: FIXED WINDOW COUNTER (Simplest)
// ====================================================================
//
// Data stored per client: [requestCount, windowStartTime]
//
// How it works:
//   - Divide time into fixed windows (e.g., every 1000ms)
//   - Each client gets a counter that resets when the window expires
//   - If counter < max → allow. If counter >= max → reject.
//
class FixedWindowCounter implements RateLimitStrategy {
    private int maxRequests;
    private long windowSizeMs;

    // Each client stores: [count, windowStart]
    // count = how many requests so far in this window
    // windowStart = when the current window began
    private Map<String, long[]> clientWindows;

    FixedWindowCounter(int maxRequests, long windowSizeMs) {
        this.maxRequests = maxRequests;
        this.windowSizeMs = windowSizeMs;
        this.clientWindows = new HashMap<>();
    }

    @Override
    public boolean isAllowed(String clientId) {
        long now = System.currentTimeMillis();

        // First time seeing this client? Create their window
        if (!clientWindows.containsKey(clientId)) {
            clientWindows.put(clientId, new long[]{0, now});
            // long[] → [count=0, windowStart=now]
        }

        long[] window = clientWindows.get(clientId);
        long count = window[0];
        long windowStart = window[1];

        // Has the window expired? If yes, reset.
        if (now - windowStart >= windowSizeMs) {
            // New window! Reset counter to 0, update window start.
            window[0] = 0;
            window[1] = now;
            count = 0;
        }

        // Check: is there room?
        if (count < maxRequests) {
            window[0] = count + 1;  // increment counter
            return true;
        }

        return false;  // at limit, rejected
    }
}

// ====================================================================
// ALGORITHM 2: SLIDING WINDOW LOG (Most Accurate)
// ====================================================================
//
// Data stored per client: Queue<Long> — a queue of timestamps
//
// How it works:
//   - For every request, store its timestamp in a queue
//   - Before checking, remove all timestamps older than (now - windowSize)
//   - Count remaining timestamps. If < max → allow. Else → reject.
//
// Why Queue?
//   - Timestamps are added in chronological order (oldest first in queue)
//   - We always remove from the FRONT (oldest first) → that's what Queue does
//   - peek() = look at oldest without removing
//   - poll() = remove oldest
//   - offer() = add to end (newest)
//
class SlidingWindowLog implements RateLimitStrategy {
    private int maxRequests;
    private long windowSizeMs;

    // Each client has a Queue of timestamps (milliseconds)
    // Queue = FIFO (First In, First Out)
    // LinkedList implements Queue in Java
    private Map<String, Queue<Long>> clientLogs;

    SlidingWindowLog(int maxRequests, long windowSizeMs) {
        this.maxRequests = maxRequests;
        this.windowSizeMs = windowSizeMs;
        this.clientLogs = new HashMap<>();
    }

    @Override
    public boolean isAllowed(String clientId) {
        long now = System.currentTimeMillis();

        // First time? Create empty queue for this client
        if (!clientLogs.containsKey(clientId)) {
            clientLogs.put(clientId, new LinkedList<>());
        }

        Queue<Long> timestamps = clientLogs.get(clientId);

        // CLEANUP: Remove all timestamps older than the window
        // peek() = look at the OLDEST timestamp (front of queue)
        // If oldest is outside the window → remove it with poll()
        // Keep removing until oldest is within window or queue is empty
        while (!timestamps.isEmpty() && now - timestamps.peek() > windowSizeMs) {
            timestamps.poll();  // remove the expired timestamp
        }

        // After cleanup, queue only contains timestamps within the window
        if (timestamps.size() < maxRequests) {
            timestamps.offer(now);  // offer() = add to end of queue
            return true;
        }

        return false;  // too many requests in window
    }
}

// ====================================================================
// ALGORITHM 3: TOKEN BUCKET (Industry Standard)
// ====================================================================
//
// Data stored per client: [currentTokens, lastRefillTime]
//
// How it works:
//   - Each client starts with a full bucket of tokens (e.g., 5 tokens)
//   - Each request consumes 1 token
//   - Tokens refill at a constant rate (e.g., 1 token per second)
//   - If tokens >= 1 → allow (consume one). If tokens < 1 → reject.
//
// KEY TRICK: We don't actually refill tokens every second with a timer.
//   Instead, when a request comes in, we CALCULATE how many tokens
//   should have been added since the last request. This is called
//   "lazy refill" — refill only when needed.
//
class TokenBucket implements RateLimitStrategy {
    private int maxTokens;         // bucket capacity
    private double refillRate;     // tokens added per second

    // Each client stores: [currentTokens, lastRefillTimeMs]
    // Using double[] because tokens can be fractional
    //   (e.g., 0.5 seconds elapsed at 2 tokens/sec = 1.0 tokens to add)
    private Map<String, double[]> clientBuckets;

    TokenBucket(int maxTokens, double refillRate) {
        this.maxTokens = maxTokens;
        this.refillRate = refillRate;
        this.clientBuckets = new HashMap<>();
    }

    @Override
    public boolean isAllowed(String clientId) {
        long now = System.currentTimeMillis();

        // First time? Start with full bucket
        if (!clientBuckets.containsKey(clientId)) {
            clientBuckets.put(clientId, new double[]{maxTokens, now});
            // double[] → [tokens=5.0, lastRefill=now]
        }

        double[] bucket = clientBuckets.get(clientId);
        double currentTokens = bucket[0];     // how many tokens right now
        double lastRefillTime = bucket[1];     // when we last calculated refill

        // LAZY REFILL: Calculate how many tokens to add since last check
        double elapsedSeconds = (now - lastRefillTime) / 1000.0;
        // elapsedSeconds: e.g., 500ms → 0.5 seconds

        double tokensToAdd = elapsedSeconds * refillRate;
        // tokensToAdd: e.g., 0.5 seconds * 2 tokens/sec = 1.0 token

        currentTokens = Math.min(currentTokens + tokensToAdd, maxTokens);
        // Math.min caps it at maxTokens — bucket can't overflow
        // e.g., if we have 4.5 tokens + 3.0 to add = 7.5, but max is 5 → cap at 5.0

        // ALWAYS update refill time and token count, even if rejected
        bucket[0] = currentTokens;
        bucket[1] = now;

        // Check: do we have at least 1 token?
        if (currentTokens >= 1.0) {
            bucket[0] = currentTokens - 1.0;  // consume one token
            return true;
        }

        return false;  // no tokens, rejected
    }
}

// ====================================================================
// DEMO: Run all 3 algorithms with traced output
// ====================================================================
public class RateLimiterAlgos {
    public static void main(String[] args) throws InterruptedException {

        System.out.println("╔══════════════════════════════════════╗");
        System.out.println("║   ALGORITHM 1: FIXED WINDOW COUNTER ║");
        System.out.println("╚══════════════════════════════════════╝");
        System.out.println("Config: max 3 requests per 1000ms window\n");

        FixedWindowCounter fixed = new FixedWindowCounter(3, 1000);
        System.out.println("Request 1: " + fixed.isAllowed("alice"));  // true
        System.out.println("Request 2: " + fixed.isAllowed("alice"));  // true
        System.out.println("Request 3: " + fixed.isAllowed("alice"));  // true
        System.out.println("Request 4: " + fixed.isAllowed("alice"));  // FALSE — at limit
        System.out.println("Request 5: " + fixed.isAllowed("alice"));  // FALSE

        System.out.println("\nWaiting 1.1 seconds for window to reset...");
        Thread.sleep(1100);

        System.out.println("Request 6: " + fixed.isAllowed("alice"));  // true — new window!
        System.out.println("Bob req 1: " + fixed.isAllowed("bob"));    // true — separate counter

        // ─────────────────────────────────────────────────────────────

        System.out.println("\n╔══════════════════════════════════════╗");
        System.out.println("║   ALGORITHM 2: SLIDING WINDOW LOG   ║");
        System.out.println("╚══════════════════════════════════════╝");
        System.out.println("Config: max 3 requests per 1000ms sliding window\n");

        SlidingWindowLog sliding = new SlidingWindowLog(3, 1000);
        System.out.println("Request 1: " + sliding.isAllowed("alice"));  // true
        System.out.println("Request 2: " + sliding.isAllowed("alice"));  // true
        System.out.println("Request 3: " + sliding.isAllowed("alice"));  // true
        System.out.println("Request 4: " + sliding.isAllowed("alice"));  // FALSE

        System.out.println("\nWaiting 1.1 seconds for timestamps to expire...");
        Thread.sleep(1100);

        System.out.println("Request 5: " + sliding.isAllowed("alice"));  // true — old ones cleaned
        System.out.println("Request 6: " + sliding.isAllowed("alice"));  // true
        System.out.println("Request 7: " + sliding.isAllowed("alice"));  // true
        System.out.println("Request 8: " + sliding.isAllowed("alice"));  // FALSE

        // ─────────────────────────────────────────────────────────────

        System.out.println("\n╔══════════════════════════════════════╗");
        System.out.println("║   ALGORITHM 3: TOKEN BUCKET          ║");
        System.out.println("╚══════════════════════════════════════╝");
        System.out.println("Config: bucket=3 tokens, refill=2 tokens/sec\n");

        TokenBucket bucket = new TokenBucket(3, 2.0);
        System.out.println("Request 1: " + bucket.isAllowed("alice"));  // true  (3→2 tokens)
        System.out.println("Request 2: " + bucket.isAllowed("alice"));  // true  (2→1 tokens)
        System.out.println("Request 3: " + bucket.isAllowed("alice"));  // true  (1→0 tokens)
        System.out.println("Request 4: " + bucket.isAllowed("alice"));  // FALSE (0 tokens)

        System.out.println("\nWaiting 0.5 seconds (should refill 1 token: 0.5s × 2/sec = 1)...");
        Thread.sleep(500);

        System.out.println("Request 5: " + bucket.isAllowed("alice"));  // true  (1→0 tokens)
        System.out.println("Request 6: " + bucket.isAllowed("alice"));  // FALSE (0 tokens, no time to refill)

        System.out.println("\nWaiting 2 seconds (should refill to max 3: 2s × 2/sec = 4, capped at 3)...");
        Thread.sleep(2000);

        System.out.println("Request 7: " + bucket.isAllowed("alice"));  // true  (3→2)
        System.out.println("Request 8: " + bucket.isAllowed("alice"));  // true  (2→1)
        System.out.println("Request 9: " + bucket.isAllowed("alice"));  // true  (1→0)
        System.out.println("Request 10: " + bucket.isAllowed("alice")); // FALSE (0)
    }
}
