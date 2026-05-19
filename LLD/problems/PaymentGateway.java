import java.util.Map;
import java.util.HashMap;
import java.util.List;
import java.util.ArrayList;

/*
 * DESIGN: PAYMENT GATEWAY (medium)
 * ==================================
 *
 * WHAT IT DOES:
 *   - Process payments through different payment methods (Credit Card, UPI, Net Banking, Wallet)
 *   - Track transaction status (PENDING, SUCCESS, FAILED, REFUNDED)
 *   - Support refunds
 *   - Maintain transaction history per user
 *
 * NOUNS: Payment, Transaction, PaymentMethod, User, Merchant
 * VERBS: processPayment(), refund(), getTransactionHistory(), getStatus()
 *
 * PATTERNS USED:
 *   - Strategy → different payment methods
 *   - State → transaction status lifecycle
 *   - Factory → create payment method instances
 *
 * CLASSES TO BUILD:
 *   1. PaymentMethod (interface) — pay(double amount), validate()
 *   2. CreditCardPayment, UPIPayment, WalletPayment — concrete methods
 *   3. TransactionStatus (enum) — PENDING, SUCCESS, FAILED, REFUNDED
 *   4. Transaction — id, amount, payer, payee, method, status, timestamp
 *   5. PaymentGatewayService — processPayment(), refund(), getHistory()
 *
 * API:
 *   gateway.processPayment("user1", "merchant1", 500.0, PaymentMethodType.CREDIT_CARD, cardDetails)
 *   gateway.refund(transactionId)
 *   gateway.getHistory("user1")
 */

// YOUR CODE HERE — build it step by step like the other problems

public class PaymentGateway {
    public static void main(String[] args) {
        System.out.println("Payment Gateway - implement me!");
    }
}
