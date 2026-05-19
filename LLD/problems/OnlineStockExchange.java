import java.util.Map;
import java.util.HashMap;
import java.util.List;
import java.util.ArrayList;
import java.util.PriorityQueue;

/*
 * DESIGN: ONLINE STOCK EXCHANGE (hard)
 * ======================================
 *
 * WHAT IT DOES:
 *   - Users can place BUY and SELL orders for stocks
 *   - Order matching engine matches buy/sell orders by price and time
 *   - Supports MARKET and LIMIT orders
 *   - Maintains order book per stock
 *   - Notifies users when orders are executed
 *
 * NOUNS: Order, OrderBook, Stock, User, Trade, Portfolio
 * VERBS: placeOrder(), cancelOrder(), matchOrders(), getPortfolio()
 *
 * PATTERNS USED:
 *   - Observer → notify users when their orders are matched
 *   - Strategy → different order types (market, limit)
 *   - Singleton → exchange instance
 *
 * KEY CONCEPT — ORDER MATCHING:
 *   Buy orders sorted by HIGHEST price first (buyer willing to pay most gets matched first)
 *   Sell orders sorted by LOWEST price first (seller asking least gets matched first)
 *   If buy price >= sell price → trade happens at sell price
 *
 * CLASSES TO BUILD:
 *   1. OrderType (enum) — BUY, SELL
 *   2. Order — id, userId, stock, type, price, quantity, timestamp
 *   3. OrderBook — per stock, maintains buy heap (max) and sell heap (min)
 *   4. Trade — buyOrder, sellOrder, price, quantity, timestamp
 *   5. StockExchange — manages order books, matches orders, tracks portfolios
 *
 * API:
 *   exchange.placeOrder("user1", "AAPL", OrderType.BUY, 150.0, 10)
 *   exchange.placeOrder("user2", "AAPL", OrderType.SELL, 148.0, 5)
 *   → auto-match: trade happens at $148 for 5 shares
 */

// YOUR CODE HERE — build it step by step

public class OnlineStockExchange {
    public static void main(String[] args) {
        System.out.println("Online Stock Exchange - implement me!");
    }
}
