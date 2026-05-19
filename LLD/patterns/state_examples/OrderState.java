/*
 * STATE PATTERN — Order Lifecycle
 *
 * States: Placed → Confirmed → Shipped → Delivered
 *                → Cancelled (from Placed or Confirmed only)
 *
 * This is interesting because Cancelled is a TERMINAL state (no transitions out),
 * and you can only cancel from certain states (not after shipping).
 * Shows that state transitions don't have to be linear.
 */

interface OrderStateInterface {
    void confirm(Order order);
    void ship(Order order);
    void deliver(Order order);
    void cancel(Order order);
}

class Order {
    private String orderId;
    private OrderStateInterface currentState;

    Order(String orderId) {
        this.orderId = orderId;
        this.currentState = new PlacedState();
        System.out.println("Order " + orderId + " placed.");
    }

    void setState(OrderStateInterface state) {
        this.currentState = state;
    }

    String getOrderId() { return orderId; }

    void confirm() { currentState.confirm(this); }
    void ship() { currentState.ship(this); }
    void deliver() { currentState.deliver(this); }
    void cancel() { currentState.cancel(this); }
}

class PlacedState implements OrderStateInterface {
    @Override
    public void confirm(Order order) {
        System.out.println("Order " + order.getOrderId() + " confirmed by seller.");
        order.setState(new ConfirmedState());
    }

    @Override
    public void ship(Order order) {
        System.out.println("Cannot ship — order not confirmed yet.");
    }

    @Override
    public void deliver(Order order) {
        System.out.println("Cannot deliver — order not even confirmed.");
    }

    @Override
    public void cancel(Order order) {
        System.out.println("Order " + order.getOrderId() + " cancelled.");
        order.setState(new CancelledState());
    }
}

class ConfirmedState implements OrderStateInterface {
    @Override
    public void confirm(Order order) {
        System.out.println("Already confirmed.");
    }

    @Override
    public void ship(Order order) {
        System.out.println("Order " + order.getOrderId() + " shipped!");
        order.setState(new ShippedState());
    }

    @Override
    public void deliver(Order order) {
        System.out.println("Cannot deliver — not shipped yet.");
    }

    @Override
    public void cancel(Order order) {
        System.out.println("Order " + order.getOrderId() + " cancelled (was confirmed, refund initiated).");
        order.setState(new CancelledState());
    }
}

class ShippedState implements OrderStateInterface {
    @Override
    public void confirm(Order order) {
        System.out.println("Already shipped.");
    }

    @Override
    public void ship(Order order) {
        System.out.println("Already shipped.");
    }

    @Override
    public void deliver(Order order) {
        System.out.println("Order " + order.getOrderId() + " delivered! Thank you.");
        order.setState(new DeliveredState());
    }

    @Override
    public void cancel(Order order) {
        System.out.println("Cannot cancel — already shipped. Request a return after delivery.");
    }
}

class DeliveredState implements OrderStateInterface {
    @Override
    public void confirm(Order order) {
        System.out.println("Order already delivered.");
    }

    @Override
    public void ship(Order order) {
        System.out.println("Order already delivered.");
    }

    @Override
    public void deliver(Order order) {
        System.out.println("Already delivered.");
    }

    @Override
    public void cancel(Order order) {
        System.out.println("Cannot cancel a delivered order. Initiate return instead.");
    }
}

class CancelledState implements OrderStateInterface {
    @Override
    public void confirm(Order order) {
        System.out.println("Order is cancelled. No further actions.");
    }

    @Override
    public void ship(Order order) {
        System.out.println("Order is cancelled. No further actions.");
    }

    @Override
    public void deliver(Order order) {
        System.out.println("Order is cancelled. No further actions.");
    }

    @Override
    public void cancel(Order order) {
        System.out.println("Already cancelled.");
    }
}

public class OrderState {
    public static void main(String[] args) {
        // Happy path
        System.out.println("=== Happy Path ===");
        Order order1 = new Order("ORD-001");
        order1.confirm();
        order1.ship();
        order1.deliver();
        order1.cancel();  // should fail — already delivered

        // Cancel early
        System.out.println("\n=== Early Cancel ===");
        Order order2 = new Order("ORD-002");
        order2.cancel();
        order2.confirm(); // should fail — cancelled

        // Cancel after confirm but before ship
        System.out.println("\n=== Cancel After Confirm ===");
        Order order3 = new Order("ORD-003");
        order3.confirm();
        order3.cancel();  // refund initiated

        // Try to cancel after shipping
        System.out.println("\n=== Try Cancel After Ship ===");
        Order order4 = new Order("ORD-004");
        order4.confirm();
        order4.ship();
        order4.cancel();  // should fail — already shipped

        // Skip steps
        System.out.println("\n=== Invalid Transitions ===");
        Order order5 = new Order("ORD-005");
        order5.ship();     // can't ship without confirming
        order5.deliver();  // can't deliver without shipping
    }
}
