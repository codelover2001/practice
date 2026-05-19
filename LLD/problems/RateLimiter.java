import java.util.Map;
import java.util.HashMap;
import java.util.Queue;
import java.util.LinkedList;

/*
 * DESIGN: RATE LIMITER (medium)
 * ==============================
 *
 * WHAT IT DOES:
 *   - Limits how many requests a user/client can make in a time window
 *   - Returns true (allowed) or false (rejected) for each request
 *
 * NOUNS: RateLimiter, Request, User/ClientId, TimeWindow
 * VERBS: isAllowed(clientId), configure(maxRequests, windowSize)
 *
 * PATTERNS USED:
 *   - Strategy → different rate limiting algorithms are interchangeable
 *       • Token Bucket: tokens refill at fixed rate, each request consumes a token
 *       • Sliding Window Log: store timestamps of each request, count within window
 *       • Fixed Window Counter: simple counter that resets each window
 *
 * KEY DESIGN DECISIONS:
 *   1. Per-client limiting (each client has their own counter/bucket)
 *   2. Which algorithm? Start with Sliding Window Log (easiest to understand)
 *   3. Thread safety? For now, ignore it. Mention it in interview.
 *
 * CLASSES TO BUILD:
 *   1. RateLimitStrategy (interface) — boolean isAllowed(String clientId)
 *   2. SlidingWindowLog — stores Queue<Long> of timestamps per client
 *   3. TokenBucket — stores token count + last refill time per client
 *   4. RateLimiter — context that uses a strategy
 *
 * ALGORITHM — Sliding Window Log:
 *   For each request:
 *   1. Get current timestamp
 *   2. Get client's request queue
 *   3. Remove all timestamps older than (now - windowSize)
 *   4. If queue.size() < maxRequests → add timestamp, return true
 *   5. Else → return false (rate limited)
 *
 * ALGORITHM — Token Bucket:
 *   For each request:
 *   1. Calculate tokens to add since last refill: (now - lastRefill) / refillInterval
 *   2. Update tokens (cap at maxTokens)
 *   3. If tokens >= 1 → consume one token, return true
 *   4. Else → return false
 *
 * START WITH Sliding Window Log. Then implement Token Bucket as a second strategy.
 */

// Step 1: Define the strategy interface
// YOUR CODE HERE — RateLimitStrategy with boolean isAllowed(String clientId)
interface RateLimitStrategy{
    boolean isAllowed(String clientId);
}


// Step 2: Implement SlidingWindowLog
// Fields:
//   - int maxRequests
//   - long windowSizeMs (window size in milliseconds)
//   - Map<String, Queue<Long>> clientRequestLogs
//
// HINT: Queue stores timestamps. For each request, clean old entries first.
// YOUR CODE HERE

class SlidingWindowLog implements RateLimitStrategy{
    private int maxRequests;
    private long windowSizeMs;
    private Map<String, Queue<Long>> clientRequestLogs;
    public SlidingWindowLog(int maxRequests, long windowSizeMs) {
        this.maxRequests = maxRequests;
        this.windowSizeMs = windowSizeMs;
        this.clientRequestLogs = new HashMap<>();
    }
    @Override
    public boolean isAllowed(String clientId) {
        if(!clientRequestLogs.containsKey(clientId)){
            clientRequestLogs.put(clientId, new LinkedList<>());
        }
        Queue<Long> requestTimes = clientRequestLogs.get(clientId);
        long currentTime = System.currentTimeMillis();
        while(!requestTimes.isEmpty() && currentTime - requestTimes.peek() > windowSizeMs){
            requestTimes.poll();
        }
        if(requestTimes.size() < maxRequests){
            requestTimes.offer(currentTime);
            return true;
        }
        return false;
    }
}
// Step 3: Implement TokenBucket (BONUS — do this after SlidingWindowLog works)
// Fields:
//   - int maxTokens
//   - int refillRate (tokens per second)
//   - Map<String, double[]> clientBuckets (stores [currentTokens, lastRefillTimestamp])
// YOUR CODE HERE

class TokenBucket implements RateLimitStrategy{
    private int maxTokens;
    private int refillRate;
    private Map<String, double[]> clientBuckets;
    public TokenBucket(int maxTokens, int refillRate) {
        this.maxTokens = maxTokens;
        this.refillRate = refillRate;
        this.clientBuckets = new HashMap<>();
    }
    @Override
    public boolean isAllowed(String clientId) {
        if(!clientBuckets.containsKey(clientId)){
            clientBuckets.put(clientId, new double[]{maxTokens, System.currentTimeMillis()});
        }
        double[] bucket = clientBuckets.get(clientId);
        double currentTokens = bucket[0];
        long lastRefillTime = bucket[1];
        long now = System.currentTimeMillis();
        long timeSinceLastRefill = now - lastRefillTime;
        double tokensToAdd = timeSinceLastRefill / 1000.0 * refillRate;
        currentTokens = Math.min(currentTokens + tokensToAdd, maxTokens);
        if(currentTokens >= 1){
            currentTokens--;
            bucket[0] = currentTokens;
            bucket[1] = now;
            return true;
        }
        return false;
    }
}   
// Step 4: Build RateLimiter context  
// YOUR CODE HERE — holds a RateLimitStrategy, delegates isAllowed()
class RateLimiterClass{
    private RateLimitStrategy strategy;
    public RateLimiterClass(RateLimitStrategy strategy) {
        this.strategy = strategy;
    }
    public boolean isAllowed(String clientId) {
        return strategy.isAllowed(clientId);
    }
}
// Step 5: Main class to test
public class RateLimiter {
    public static void main(String[] args) throws InterruptedException {
        // TODO: Create RateLimiter with SlidingWindowLog (max 3 requests per 1000ms)
        // TODO: Make 3 requests from "user1" → all should be allowed
        // TODO: Make 4th request immediately → should be REJECTED
        // TODO: Wait 1 second, try again → should be allowed
        // TODO: Test with a different client "user2" → should have its own limit
        System.out.println("Rate Limiter - implement me!");
        RateLimiterClass rateLimiter = new RateLimiterClass(new SlidingWindowLog(3, 1000));
        System.out.println(rateLimiter.isAllowed("user1"));
        System.out.println(rateLimiter.isAllowed("user1"));
        System.out.println(rateLimiter.isAllowed("user1"));
        System.out.println(rateLimiter.isAllowed("user1"));
        System.out.println(rateLimiter.isAllowed("user1"));
        System.out.println(rateLimiter.isAllowed("user1"));
    }
}
