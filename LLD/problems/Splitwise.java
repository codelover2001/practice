import java.util.Map;
import java.util.HashMap;
import java.util.List;
import java.util.ArrayList;

/*
 * DESIGN: SPLITWISE (medium)
 * ===========================
 *
 * WHAT IT DOES:
 *   - Users can add expenses and split them among a group
 *   - Tracks who owes whom and how much
 *   - Supports different split types: EQUAL, EXACT, PERCENTAGE
 *   - Shows balances between users
 *
 * NOUNS: User, Expense, Split, Group, Balance
 * VERBS: addExpense(), getBalance(), settle(), showBalances()
 *
 * PATTERNS USED:
 *   - Strategy → different split algorithms (equal, exact, percentage)
 *
 * KEY DESIGN DECISIONS:
 *   1. Balance stored as Map<String, Map<String, Double>>
 *      → balances["Alice"]["Bob"] = 50.0 means Alice is OWED $50 by Bob
 *      → balances["Bob"]["Alice"] = -50.0 (Bob OWES Alice $50)
 *   2. SplitType as enum or Strategy interface
 *   3. Expense stores: paidBy, amount, list of splits
 *
 * CLASSES TO BUILD:
 *   1. User — id, name, email
 *   2. Split (abstract) — userId, amount (calculated differently per type)
 *   3. EqualSplit, ExactSplit, PercentSplit — concrete split types
 *   4. Expense — paidBy (User), amount, List<Split>, description
 *   5. SplitwiseService — manages users, expenses, balances
 *
 * API:
 *   service.addUser("alice", "Alice", "alice@email.com")
 *   service.addExpense("alice", 300, ["alice","bob","charlie"], SplitType.EQUAL, ...)
 *   service.showBalances("alice")
 *   service.showAllBalances()
 *
 * HOW BALANCE TRACKING WORKS:
 *   Alice pays $300 for dinner, split EQUAL among Alice, Bob, Charlie.
 *   Each person's share = 300 / 3 = $100.
 *   Alice paid $300 but owes only $100 → she's owed $200.
 *     Bob owes Alice $100:    balances[bob][alice] += 100
 *     Charlie owes Alice $100: balances[charlie][alice] += 100
 *
 *   General rule:
 *     For each participant (except payer):
 *       balances[participant][payer] += participant's share
 */

// Step 1: Create User class
// Fields: String id, String name, String email
// YOUR CODE HERE


// Step 2: Create SplitType enum
// YOUR CODE HERE — EQUAL, EXACT, PERCENT


// Step 3: Create Split classes
// Abstract Split: userId, double amount
// EqualSplit: amount is calculated later (total / numPeople)
// ExactSplit: amount is set explicitly
// PercentSplit: stores percentage, amount calculated as (total * percent / 100)
// YOUR CODE HERE


// Step 4: Create Expense class
// Fields: String paidBy, double amount, List<Split> splits, String description
// YOUR CODE HERE


// Step 5: Build SplitwiseService
// Fields:
//   - Map<String, User> users
//   - Map<String, Map<String, Double>> balances
//       → balances.get("bob").get("alice") = how much bob owes alice
//
// Methods:
//   - addUser(String id, String name, String email)
//   - addExpense(String paidBy, double amount, List<String> participants, 
//                SplitType type, List<Double> shares)
//       → if EQUAL: calculate each share = amount / participants.size()
//       → if EXACT: shares list has exact amounts
//       → if PERCENT: shares list has percentages
//       → validate: sum of shares must equal total amount
//       → update balances
//   - showBalance(String userId) → print what this user owes/is owed
//   - showAllBalances() → print everything
// YOUR CODE HERE


// Step 6: Main class to test
public class Splitwise {
    public static void main(String[] args) {
        // TODO: Create service, add 3 users
        // TODO: Alice pays $300, split EQUAL among Alice, Bob, Charlie
        //       → Bob owes Alice $100, Charlie owes Alice $100
        // TODO: Show balances
        // TODO: Bob pays $200, split EXACT: Alice=$50, Bob=$100, Charlie=$50
        //       → Alice owes Bob $50, Charlie owes Bob $50
        // TODO: Show balances again — some debts should partially cancel out
        System.out.println("Splitwise - implement me!");
    }
}
