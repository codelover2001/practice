/*
 * WEBSOCKET — Java (Spring Boot) Implementation
 *
 * HOW TO RUN:
 *   Add spring-boot-starter-websocket to your Spring Boot project.
 *   mvn spring-boot:run  →  open http://localhost:8080
 *
 *   Or just READ this — same logic as server.js, in Java.
 *
 * KEY DIFFERENCES FROM NODE.JS:
 *
 *   Node.js (ws library):
 *     - Event-driven. wss.on("connection", callback).
 *     - Single thread handles all connections via event loop.
 *     - Dead simple API: ws.send(), ws.on("message"), ws.on("close").
 *     - Most WebSocket tutorials, libraries, and production systems (Socket.IO,
 *       Pusher, Discord) use Node.js.
 *
 *   Java (Spring WebSocket):
 *     - Extends TextWebSocketHandler, override handleTextMessage().
 *     - Each message gets a WebSocketSession object (similar to ws in Node).
 *     - Thread model depends on the container (Tomcat uses a thread per connection
 *       for the blocking upgrade, but the actual message handling can be async).
 *     - More boilerplate: need a config class, a handler class, register paths.
 *     - Spring also supports STOMP (higher-level messaging protocol over WebSocket)
 *       which adds pub/sub semantics, but that's a layer on top.
 *
 *   SCALING (same problem in both languages):
 *     WebSocket connections are STATEFUL. User A is connected to Server 1.
 *     If Order Service sends an update to Server 2, how does User A get it?
 *     → Redis Pub/Sub: all servers subscribe to Redis. Update goes to Redis,
 *       Redis fans out to all servers, each server pushes to its local clients.
 *     → This is identical in Node and Java.
 *
 * STRUCTURE:
 *   1. WebSocketConfig.java    — registers the WebSocket endpoint
 *   2. OrderWebSocketHandler   — handles connections, messages, disconnects
 *   3. OrderController         — REST endpoint for server-side status push
 */


// ═══════════════════════════════════════════════════════════════════════════════
// FILE 1: WebSocketConfig.java
// ═══════════════════════════════════════════════════════════════════════════════

/*
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    private final OrderWebSocketHandler handler;

    public WebSocketConfig(OrderWebSocketHandler handler) {
        this.handler = handler;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        // Register our handler at the "/ws" path.
        // setAllowedOrigins("*") lets any frontend connect (restrict in production).
        registry.addHandler(handler, "/ws")
                .setAllowedOrigins("*");
    }
}
*/


// ═══════════════════════════════════════════════════════════════════════════════
// FILE 2: OrderWebSocketHandler.java
// ═══════════════════════════════════════════════════════════════════════════════

/*
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Component
public class OrderWebSocketHandler extends TextWebSocketHandler {

    // orderId → list of connected sessions
    // ConcurrentHashMap + CopyOnWriteArrayList for thread safety
    private final Map<String, List<WebSocketSession>> orderConnections =
            new ConcurrentHashMap<>();

    private final ObjectMapper mapper = new ObjectMapper();

    // ── New client connects ──
    // Equivalent to: wss.on("connection", (ws, req) => { ... })
    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String orderId = extractOrderId(session);

        orderConnections
                .computeIfAbsent(orderId, k -> new CopyOnWriteArrayList<>())
                .add(session);

        int count = orderConnections.get(orderId).size();
        System.out.println("Client connected to order " + orderId + " (" + count + " watchers)");

        // Send confirmation
        send(session, Map.of("type", "connected", "orderId", orderId, "watchers", count));

        // Notify others
        broadcast(orderId, Map.of("type", "watcher_count", "count", count), session);
    }

    // ── Client sends a message ──
    // Equivalent to: ws.on("message", (raw) => { ... })
    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String orderId = extractOrderId(session);
        Map<String, Object> data = mapper.readValue(message.getPayload(), Map.class);
        System.out.println("Client (order " + orderId + "): " + data);

        if ("chat".equals(data.get("type"))) {
            Map<String, Object> outgoing = Map.of(
                    "type", "chat",
                    "text", data.getOrDefault("text", ""),
                    "from", data.getOrDefault("from", "anonymous"),
                    "timestamp", System.currentTimeMillis()
            );
            broadcast(orderId, outgoing, session);
        }
    }

    // ── Client disconnects ──
    // Equivalent to: ws.on("close", () => { ... })
    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        String orderId = extractOrderId(session);

        List<WebSocketSession> conns = orderConnections.get(orderId);
        if (conns != null) {
            conns.remove(session);
            int remaining = conns.size();
            System.out.println("Client disconnected from order " + orderId + " (" + remaining + " left)");
            broadcast(orderId, Map.of("type", "watcher_count", "count", remaining), null);
        }
    }

    // ── Called by the REST controller to push status updates ──
    public void pushStatusUpdate(String orderId, Map<String, Object> data) {
        broadcast(orderId, data, null);
    }

    // ── Broadcast to all watchers of an order, optionally excluding one ──
    private void broadcast(String orderId, Map<String, Object> data, WebSocketSession exclude) {
        List<WebSocketSession> conns = orderConnections.getOrDefault(orderId, List.of());
        for (WebSocketSession s : conns) {
            if (s != exclude && s.isOpen()) {
                send(s, data);
            }
        }
    }

    private void send(WebSocketSession session, Map<String, Object> data) {
        try {
            session.sendMessage(new TextMessage(mapper.writeValueAsString(data)));
        } catch (IOException e) {
            System.err.println("Failed to send: " + e.getMessage());
        }
    }

    // Extract orderId from the query string: ws://host/ws?orderId=456
    private String extractOrderId(WebSocketSession session) {
        String query = session.getUri().getQuery();
        if (query != null && query.contains("orderId=")) {
            return query.split("orderId=")[1].split("&")[0];
        }
        return "456";
    }
}
*/


// ═══════════════════════════════════════════════════════════════════════════════
// FILE 3: OrderController.java (REST endpoint for server-side push)
// ═══════════════════════════════════════════════════════════════════════════════

/*
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
public class OrderController {

    private final OrderWebSocketHandler wsHandler;

    public OrderController(OrderWebSocketHandler wsHandler) {
        this.wsHandler = wsHandler;
    }

    // REST endpoint that backend services call to push status to clients.
    // curl -X POST http://localhost:8080/update-order \
    //   -H "Content-Type: application/json" \
    //   -d '{"orderId":"456","status":"PREPARING"}'
    @PostMapping("/update-order")
    public Map<String, Object> updateOrder(@RequestBody Map<String, Object> body) {
        String orderId = (String) body.getOrDefault("orderId", "456");
        String status = (String) body.get("status");

        Map<String, Object> payload = Map.of(
                "type", "status_update",
                "status", status,
                "timestamp", System.currentTimeMillis()
        );

        wsHandler.pushStatusUpdate(orderId, payload);
        System.out.println("Pushed \"" + status + "\" to clients on order " + orderId);

        return Map.of("ok", true);
    }
}
*/


// ═══════════════════════════════════════════════════════════════════════════════
// NODE.JS vs JAVA — SIDE-BY-SIDE COMPARISON
// ═══════════════════════════════════════════════════════════════════════════════
//
//   CONCEPT              NODE.JS (ws)                   JAVA (Spring WebSocket)
//   ─────────────────────────────────────────────────────────────────────────────
//   Setup                const wss = new WebSocket      @EnableWebSocket +
//                        .Server({ server })             WebSocketConfigurer
//
//   On connect           wss.on("connection", ws => {}) afterConnectionEstablished()
//
//   On message           ws.on("message", raw => {})    handleTextMessage(session, msg)
//
//   On close             ws.on("close", () => {})       afterConnectionClosed()
//
//   Send to client       ws.send(JSON.stringify(data))  session.sendMessage(new TextMessage(...))
//
//   Track connections    Plain JS object/Map             ConcurrentHashMap + CopyOnWriteArrayList
//
//   Thread safety        Not needed (single thread)     REQUIRED (multiple threads)
//
//   Boilerplate          ~40 lines total                ~120 lines across 3 files
//
//   Scaling (both same)  Redis Pub/Sub to fan out       Redis Pub/Sub to fan out
//                        across server instances         across server instances
//
//
// INTERVIEW TAKEAWAY:
//   "WebSocket starts as an HTTP request with an Upgrade header. The server
//    responds 101 Switching Protocols and the same TCP connection now speaks
//    WebSocket frames. It's full-duplex — either side sends anytime. In Node.js,
//    the event loop handles all connections on one thread. In Java, Spring's
//    TextWebSocketHandler gives you lifecycle callbacks. The hard part isn't the
//    protocol — it's scaling: connections are stateful, so you need Redis Pub/Sub
//    or a similar broadcast mechanism when you have multiple server instances."
