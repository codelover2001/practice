/*
 * OBSERVER PATTERN
 * ================
 * Intent: Define a one-to-many dependency so that when one object changes state,
 * all its dependents are notified and updated automatically.
 *
 * When to use: Notifications, event systems, stock price alerts, pub-sub, 
 * any "when X happens, notify Y, Z, W" scenario.
 *
 * Structure:
 *   - Subject (interface/class): maintains list of observers, notifies them
 *   - Observer (interface): defines update() method
 *   - ConcreteSubject: the thing being watched (e.g., StockMarket)
 *   - ConcreteObserver: the thing that reacts (e.g., Investor, NewsChannel)
 *
 * YOUR TASK:
 *   Build a StockMarket that notifies Investors when a stock price changes.
 *   1. Define Observer interface with update(String stockName, double price)
 *   2. Define Subject interface with register(), unregister(), notifyObservers()
 *   3. Implement StockMarket (ConcreteSubject) that tracks stock prices
 *   4. Implement Investor (ConcreteObserver) that prints alerts
 *   5. Demo in main(): register investors, change price, see notifications
 *
 * BONUS: Add a NewsChannel observer that formats the alert differently.
 */

import java.util.Map;
import java.util.HashMap;
import java.util.List;
import java.util.ArrayList;

// Step 1: Define the Observer interface

interface Observer {
    void update(String stockName, double price);
}


// Step 2: Define the Subject interface
// YOUR CODE HERE

interface Subject {
    void register(Observer observer);

    void unregister(Observer observer);

    void notifyObservers(String stockName, double price);
}


// Step 3: Implement ConcreteSubject — StockMarket
// YOUR CODE HERE — maintains a Map<String, Double> of stock prices
//                  when setStockPrice() is called, notify all observers

class StockMarket implements Subject {
    private Map<String, Double> stockPrices = new HashMap<>();
    private List<Observer> observers = new ArrayList<>();

    @Override
    public void register(Observer observer) {
        observers.add(observer);
    }

    @Override
    public void unregister(Observer observer) {
        observers.remove(observer);
    }

    @Override
    public void notifyObservers(String stockName, double price) {
        for (Observer observer : observers) {
            observer.update(stockName, price);
        }
    }

    public void setStockPrice(String stockName, double price) {
        stockPrices.put(stockName, price);
        notifyObservers(stockName, price);
    }
}


// Step 4: Implement ConcreteObservers
// YOUR CODE HERE — Investor (prints: "Investor X notified: STOCK is now $PRICE")
class Investor implements Observer {
    @Override 
    public void update(String stockName, double price) {
        System.out.println("Investor " + stockName + " notified: " + stockName + " is now " + price);
    }
}


class NewsChannel implements Observer {
    @Override
    public void update(String stockName, double price) {
        System.out.println("[NEWS] " + stockName + " updated to " + price);
    }
}

// YOUR CODE HERE — NewsChannel (prints: "[NEWS] STOCK updated to $PRICE")


// Step 5: Main class to test
public class ObserverPattern {
    public static void main(String[] args) {
        // TODO: Create a StockMarket
        // TODO: Create 2 Investors and 1 NewsChannel
        // TODO: Register all observers
        // TODO: Change stock price — all should be notified
        // TODO: Unregister one investor, change price again

        StockMarket stockMarket = new StockMarket();
        Investor investor1 = new Investor();
        Investor investor2 = new Investor();
        NewsChannel newsChannel = new NewsChannel();
        stockMarket.register(investor1);
        stockMarket.register(investor2);
        stockMarket.register(newsChannel);
        stockMarket.setStockPrice("AAPL", 150.0);


        System.out.println("Observer Pattern - implement me!");
    }
}
