/*
 * CHAIN OF RESPONSIBILITY PATTERN
 * ================================
 * Intent: Pass a request along a chain of handlers. Each handler decides either 
 * to process the request or pass it to the next handler in the chain.
 *
 * When to use: Logging (DEBUG → INFO → ERROR), ATM cash dispensing (2000 → 500 → 100),
 * middleware chains, request validation, approval workflows.
 *
 * Structure:
 *   - Handler (abstract class/interface): has a 'next' reference and handle() method
 *   - ConcreteHandler (classes): each handles specific cases, passes rest to next
 *   - Client: builds the chain and sends the request to the first handler
 *
 * YOUR TASK:
 *   Build an ATM Dispenser that dispenses cash using denominations: 2000, 500, 100.
 *   1. Define abstract CashHandler with: next handler reference, dispense(int amount)
 *   2. Implement TwoThousandHandler, FiveHundredHandler, HundredHandler
 *   3. Each handler dispenses as many notes of its denomination as possible, passes remainder
 *   4. Chain them: 2000 → 500 → 100
 *   5. Demo in main(): dispense 4600, 1300, 2500
 *
 * KEY INSIGHT: No single handler knows about the full chain. Each only knows its job 
 * and the next handler. Easy to add new denominations.
 *
 * BONUS: Add a 200 denomination handler. Where do you insert it in the chain?
 */

// Step 1: Define the abstract Handler
// YOUR CODE HERE — CashHandler
//   Fields: CashHandler nextHandler, int denomination
//   Methods: setNext(CashHandler), dispense(int amount)
//   In dispense(): handle what you can, pass remainder to next


// Step 2: Implement ConcreteHandlers
// YOUR CODE HERE — TwoThousandHandler (denomination = 2000)


// YOUR CODE HERE — FiveHundredHandler (denomination = 500)


// YOUR CODE HERE — HundredHandler (denomination = 100)


// Step 3: Main class to test
public class ChainOfResponsibilityPattern {
    public static void main(String[] args) {
        // TODO: Create handlers
        // TODO: Chain them: 2000 → 500 → 100
        // TODO: Dispense 4600  (expected: 2x2000 + 1x500 + 1x100)
        // TODO: Dispense 1300  (expected: 0x2000 + 2x500 + 3x100)
        // TODO: Dispense 2500  (expected: 1x2000 + 1x500)
        System.out.println("Chain of Responsibility Pattern - implement me!");
    }
}
