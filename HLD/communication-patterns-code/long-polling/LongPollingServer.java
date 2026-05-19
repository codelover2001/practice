/*
 * LONG POLLING — Java (Spring Boot) Implementation
 *
 * HOW TO RUN:
 *   If you have Spring Boot set up:
 *     1. Add this to a Spring Boot project with spring-boot-starter-web dependency.
 *     2. mvn spring-boot:run  or  ./gradlew bootRun
 *     3. Open http://localhost:8080
 *
 *   Or just READ this — it's the same logic as server.js, translated to Java.
 *
 * KEY DIFFERENCE FROM NODE.JS:
 *   - Node.js: Single-threaded event loop. Holding a connection open costs almost nothing
 *     because the event loop moves on to other work during the `await sleep(500)`.
 *     One Node process can hold 10,000+ idle connections easily.
 *
 *   - Java (Spring MVC, thread-per-request): Each long poll request occupies a THREAD
 *     that sits there sleeping in a while loop. With a default thread pool of 200 threads,
 *     you can only handle ~200 concurrent long poll clients before running out.
 *
 *   - Java (Spring WebFlux / DeferredResult): This is the fix. DeferredResult releases
 *     the thread back to the pool and completes the response later when the data is ready.
 *     This is what production Java apps use for long polling.
 *
 * BELOW: Both approaches — naive (thread-blocking) and production (DeferredResult).
 */

// ─────────────────────────────────────────────────────────────────────────────
// APPROACH 1: Naive (thread-blocking) — Easy to understand, bad for scale
// ─────────────────────────────────────────────────────────────────────────────

/*
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.*;

@SpringBootApplication
@RestController
public class LongPollingServer {

    // Simulates the database
    private volatile String orderStatus = "PLACED";

    // Long polling endpoint — holds the thread until status changes or timeout
    @GetMapping("/poll/order/{id}")
    public Map<String, Object> pollOrder(
            @PathVariable String id,
            @RequestParam(required = false) String lastStatus) throws InterruptedException {

        long startTime = System.currentTimeMillis();
        long timeout = 30000; // 30 seconds

        // THIS IS THE SAME LOGIC AS NODE.JS:
        // Sit in a loop, checking every 500ms if status changed.
        // The difference: in Java this BLOCKS A THREAD. In Node it doesn't.
        while (System.currentTimeMillis() - startTime < timeout) {
            if (!orderStatus.equals(lastStatus)) {
                return Map.of("status", orderStatus, "changed", true);
            }
            Thread.sleep(500); // Thread is BLOCKED here — doing nothing, wasting resources
        }

        return Map.of("status", orderStatus, "changed", false);
    }

    // Status update endpoint
    @PostMapping("/update-order")
    public Map<String, Object> updateOrder(@RequestBody Map<String, String> body) {
        String prev = orderStatus;
        orderStatus = body.get("status");
        System.out.println("Status changed: " + prev + " → " + orderStatus);
        return Map.of("ok", true, "previous", prev, "current", orderStatus);
    }

    public static void main(String[] args) {
        SpringApplication.run(LongPollingServer.class, args);
    }
}
*/


// ─────────────────────────────────────────────────────────────────────────────
// APPROACH 2: DeferredResult — Production-grade, non-blocking
// ─────────────────────────────────────────────────────────────────────────────
//
// DeferredResult releases the HTTP thread immediately. When the status changes,
// we complete the response from a DIFFERENT thread. This way 10,000 clients
// can be waiting and you only use a handful of threads.

/*
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.context.request.async.DeferredResult;

import java.util.List;
import java.util.Map;
import java.util.concurrent.CopyOnWriteArrayList;

@SpringBootApplication
@RestController
public class LongPollingServer {

    private volatile String orderStatus = "PLACED";

    // All currently waiting long-poll clients
    // Each entry is a DeferredResult that hasn't been responded to yet
    private final List<DeferredResult<Map<String, Object>>> waitingClients =
            new CopyOnWriteArrayList<>();

    @GetMapping("/poll/order/{id}")
    public DeferredResult<Map<String, Object>> pollOrder(
            @PathVariable String id,
            @RequestParam(required = false) String lastStatus) {

        // DeferredResult = "I'll respond later, release the thread NOW"
        DeferredResult<Map<String, Object>> result = new DeferredResult<>(30000L);

        // If status already changed from what client knows, respond immediately
        if (lastStatus != null && !orderStatus.equals(lastStatus)) {
            result.setResult(Map.of("status", orderStatus, "changed", true));
            return result;
        }

        // Otherwise, park this client — thread is released back to the pool
        waitingClients.add(result);

        // When 30s timeout hits with no update
        result.onTimeout(() -> {
            waitingClients.remove(result);
            result.setResult(Map.of("status", orderStatus, "changed", false));
        });

        // If client disconnects early
        result.onCompletion(() -> waitingClients.remove(result));

        return result;
        // Thread is FREE now. No thread blocked. No while loop.
    }

    @PostMapping("/update-order")
    public Map<String, Object> updateOrder(@RequestBody Map<String, String> body) {
        String prev = orderStatus;
        orderStatus = body.get("status");
        System.out.println("Status changed: " + prev + " → " + orderStatus);

        // Wake up ALL waiting clients — their long polls complete instantly
        for (DeferredResult<Map<String, Object>> client : waitingClients) {
            client.setResult(Map.of("status", orderStatus, "changed", true));
        }
        waitingClients.clear();

        return Map.of("ok", true, "previous", prev, "current", orderStatus);
    }

    public static void main(String[] args) {
        SpringApplication.run(LongPollingServer.class, args);
    }
}
*/


// ─────────────────────────────────────────────────────────────────────────────
// WHY DEFERRED RESULT IS BETTER — THE NUMBERS
// ─────────────────────────────────────────────────────────────────────────────
//
//   Scenario: 5,000 users watching their order status via long polling.
//
//   NAIVE (Thread.sleep in a loop):
//     - 5,000 threads blocked, each using ~1MB stack memory
//     - 5GB RAM just for idle threads doing nothing
//     - Default Tomcat thread pool = 200. You'd need to crank it to 5000+.
//     - Context switching overhead between 5,000 threads = CPU waste.
//
//   DEFERRED RESULT:
//     - 5,000 DeferredResult objects parked in a list (~few KB each)
//     - 0 threads blocked
//     - When status changes: one thread loops through the list, completes all 5,000
//     - Total memory: ~50MB vs 5GB
//     - Thread pool stays at default 200, handles all 5,000 clients fine.
//
//   NODE.JS equivalent:
//     - Similar to DeferredResult — the event loop holds callback references,
//       no threads blocked. That's why Node is naturally good at this.
//
//
// INTERVIEW TAKEAWAY:
//   "In Java, naive long polling blocks a thread per client, which doesn't scale.
//    Production systems use DeferredResult (Spring MVC) or reactive streams
//    (Spring WebFlux) to release the thread and complete the response
//    asynchronously when data arrives. This is conceptually the same as
//    Node.js's event loop — park the callback, resume when there's data."
