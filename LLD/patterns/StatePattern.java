/*
 * STATE PATTERN
 * =============
 * Intent: Allow an object to alter its behavior when its internal state changes.
 * The object will appear to change its class.
 *
 * When to use: Vending machines, elevators, ATMs, order lifecycles, traffic lights —
 * anything where behavior depends on the current state, and states transition to each other.
 *
 * Structure:
 *   - State (interface): declares methods for all possible actions
 *   - ConcreteState (classes): each state implements the actions differently
 *   - Context (class): holds current state, delegates actions to it, allows state transitions
 *
 * YOUR TASK:
 *   Build a simple VendingMachine with 3 states: IdleState, HasMoneyState, DispensingState.
 *   1. Define the VendingMachineState interface with: insertMoney(), selectProduct(), dispense()
 *   2. Implement 3 concrete states — each method either performs action or prints "invalid in this state"
 *   3. Create VendingMachine context that holds currentState and allows transitions
 *   4. Demo the full flow in main()
 *
 * KEY INSIGHT: Each state knows which state to transition to. The context doesn't have
 * giant if-else chains — that's the whole point.
 *
 * BONUS: Add a "ReturnMoney" action and handle it in each state.
 */

interface VendingMachineState{
    void insertMoney();
    void selectProduct();
    void dispense();
}

class IdleState implements VendingMachineState {
    private VendingMachine vendingMachine;
    public IdleState(VendingMachine vendingMachine) {
        this.vendingMachine = vendingMachine;
    }
    @Override
    public void insertMoney() {
        System.out.println("Money inserted");
        vendingMachine.setCurrentState(new HasMoneyState(vendingMachine));
    }
    @Override
    public void selectProduct() {
        System.out.println("Select a product first");
    }
    @Override
    public void dispense() {
        System.out.println("Select a product first");
    }
}

class HasMoneyState implements VendingMachineState {
    private VendingMachine vendingMachine; 

    public HasMoneyState(VendingMachine vendingMachine) {
        this.vendingMachine = vendingMachine;
    }
    @Override
    public void insertMoney() {
        System.out.println("Money already inserted");
    }
    @Override
    public void selectProduct() {
        System.out.println("Product selected");
        vendingMachine.setCurrentState(new DispensingState(vendingMachine));
    }
    @Override
    public void dispense() {
        System.out.println("Select a product first");
    }
}

class DispensingState implements VendingMachineState {
    private VendingMachine vendingMachine;
    public DispensingState(VendingMachine vendingMachine) {
        this.vendingMachine = vendingMachine;
    }
    @Override
    public void insertMoney() {
        System.out.println("Please wait, dispensing");
    }
    @Override
    public void selectProduct() {
        System.out.println("Already dispensing");   
    }
    @Override
    public void dispense() {
        System.out.println("Dispensing product");
        vendingMachine.setCurrentState(new IdleState(vendingMachine));
    }
}


class VendingMachine {
    private VendingMachineState currentState;
    public VendingMachine() {
        currentState = new IdleState(this);
    }
    public void setCurrentState(VendingMachineState state) {
        currentState = state;
    }
    public void insertMoney() {
        currentState.insertMoney();
    }
    public void selectProduct() {
        currentState.selectProduct();
    }
    public void dispense() {
        currentState.dispense();
    }
}

class StatePattern{
    public static void main(String[] args){

        VendingMachine vendingMachine = new VendingMachine();
        vendingMachine.insertMoney();
        vendingMachine.selectProduct();
        vendingMachine.dispense();
        vendingMachine.insertMoney();
        vendingMachine.selectProduct();
        vendingMachine.dispense();
        vendingMachine.insertMoney();
        vendingMachine.selectProduct();
        vendingMachine.dispense();
        vendingMachine.insertMoney();
        vendingMachine.selectProduct();
        vendingMachine.dispense();
    }
}