/*
 * STRATEGY PATTERN
 * ================
 * Intent: Define a family of algorithms, encapsulate each one, and make them interchangeable.
 * 
 * When to use: When you have multiple ways to do the same thing (payment methods, 
 * sorting algorithms, pricing strategies, ride matching).
 *
 * Structure:
 *   - Strategy (interface): declares the method all strategies must implement
 *   - ConcreteStrategy (classes): each implements the algorithm differently
 *   - Context (class): holds a reference to a Strategy, delegates work to it
 *
 * YOUR TASK:
 *   Build a PaymentProcessor that supports CreditCard, UPI, and Wallet payments.
 *   1. Define the PaymentStrategy interface
 *   2. Implement 3 concrete strategies
 *   3. Create a PaymentContext that uses the strategy
 *   4. Demo switching strategies in main()
 *
 * BONUS: Add a new strategy (e.g., NetBanking) WITHOUT modifying existing code. 
 *        That's the whole point — Open/Closed Principle.
 */

// Step 1: Define the Strategy interface
// YOUR CODE HERE


// Step 2: Implement ConcreteStrategy classes
// YOUR CODE HERE — CreditCardPayment


// YOUR CODE HERE — UPIPayment


// YOUR CODE HERE — WalletPayment


// Step 3: Create the Context class
// YOUR CODE HERE — PaymentContext (holds a strategy, can switch it, delegates pay())


// Step 4: Main class to test
public class StrategyPattern {
    public static void main(String[] args) {
        // TODO: Create a PaymentContext
        // TODO: Pay with CreditCard
        // TODO: Switch to UPI, pay again
        // TODO: Switch to Wallet, pay again
        System.out.println("Strategy Pattern - implement me!");
    }
}
