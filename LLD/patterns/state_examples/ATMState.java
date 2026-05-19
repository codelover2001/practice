/*
 * STATE PATTERN — ATM Machine
 *
 * States: Idle → CardInserted → Authenticated → TransactionComplete → Idle
 *
 * This one is DIRECTLY on your AlgoMaster problem list.
 * Study this, then try to build it yourself with more features 
 * (balance check, withdrawal limits, multiple transaction types).
 */

interface ATMStateInterface {
    void insertCard(ATM atm);
    void enterPin(ATM atm, int pin);
    void withdraw(ATM atm, double amount);
    void ejectCard(ATM atm);
}

class ATM {
    private ATMStateInterface currentState;
    private double balance;
    private int correctPin;

    ATM(double balance, int correctPin) {
        this.balance = balance;
        this.correctPin = correctPin;
        this.currentState = new IdleATMState();
    }

    void setState(ATMStateInterface state) {
        this.currentState = state;
    }

    int getCorrectPin() { return correctPin; }
    double getBalance() { return balance; }

    void deductBalance(double amount) {
        this.balance -= amount;
    }

    void insertCard() { currentState.insertCard(this); }
    void enterPin(int pin) { currentState.enterPin(this, pin); }
    void withdraw(double amount) { currentState.withdraw(this, amount); }
    void ejectCard() { currentState.ejectCard(this); }
}

class IdleATMState implements ATMStateInterface {
    @Override
    public void insertCard(ATM atm) {
        System.out.println("Card inserted. Please enter PIN.");
        atm.setState(new CardInsertedState());
    }

    @Override
    public void enterPin(ATM atm, int pin) {
        System.out.println("Insert card first.");
    }

    @Override
    public void withdraw(ATM atm, double amount) {
        System.out.println("Insert card first.");
    }

    @Override
    public void ejectCard(ATM atm) {
        System.out.println("No card inserted.");
    }
}

class CardInsertedState implements ATMStateInterface {
    @Override
    public void insertCard(ATM atm) {
        System.out.println("Card already inserted.");
    }

    @Override
    public void enterPin(ATM atm, int pin) {
        if (pin == atm.getCorrectPin()) {
            System.out.println("PIN correct. You may now withdraw.");
            atm.setState(new AuthenticatedState());
        } else {
            System.out.println("Wrong PIN. Card ejected.");
            atm.setState(new IdleATMState());
        }
    }

    @Override
    public void withdraw(ATM atm, double amount) {
        System.out.println("Enter PIN first.");
    }

    @Override
    public void ejectCard(ATM atm) {
        System.out.println("Card ejected.");
        atm.setState(new IdleATMState());
    }
}

class AuthenticatedState implements ATMStateInterface {
    @Override
    public void insertCard(ATM atm) {
        System.out.println("Card already inserted.");
    }

    @Override
    public void enterPin(ATM atm, int pin) {
        System.out.println("Already authenticated.");
    }

    @Override
    public void withdraw(ATM atm, double amount) {
        if (amount > atm.getBalance()) {
            System.out.println("Insufficient balance. Available: $" + atm.getBalance());
        } else {
            atm.deductBalance(amount);
            System.out.println("Dispensing $" + amount + ". Remaining: $" + atm.getBalance());
        }
        System.out.println("Please take your card.");
        atm.setState(new IdleATMState());
    }

    @Override
    public void ejectCard(ATM atm) {
        System.out.println("Card ejected. Transaction cancelled.");
        atm.setState(new IdleATMState());
    }
}

public class ATMState {
    public static void main(String[] args) {
        ATM atm = new ATM(10000, 1234);

        // Happy path: insert → pin → withdraw
        System.out.println("=== Successful Withdrawal ===");
        atm.insertCard();
        atm.enterPin(1234);
        atm.withdraw(3000);

        // Wrong pin
        System.out.println("\n=== Wrong PIN ===");
        atm.insertCard();
        atm.enterPin(9999);

        // Eject mid-flow
        System.out.println("\n=== Cancel Transaction ===");
        atm.insertCard();
        atm.enterPin(1234);
        atm.ejectCard();

        // Insufficient balance
        System.out.println("\n=== Insufficient Balance ===");
        atm.insertCard();
        atm.enterPin(1234);
        atm.withdraw(50000);

        // Invalid actions in wrong state
        System.out.println("\n=== Invalid Actions ===");
        atm.withdraw(100);      // no card
        atm.enterPin(1234);     // no card
        atm.ejectCard();        // no card
    }
}
