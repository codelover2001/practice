/*
 * STATE PATTERN — Traffic Light
 *
 * States: Red → Green → Yellow → Red (cyclic)
 * Each state defines: what cars do, what pedestrians do, and what the next state is.
 *
 * Notice how adding a new state (e.g., FlashingYellow for night mode)
 * means just creating a new class — no if-else changes anywhere.
 */

interface TrafficState {
    void handleCar();
    void handlePedestrian();
    void nextState(TrafficLight light);
}

class TrafficLight {
    private TrafficState currentState;
    private String intersection;

    TrafficLight(String intersection) {
        this.intersection = intersection;
        this.currentState = new RedState();
    }

    void setState(TrafficState state) {
        this.currentState = state;
    }

    void carArrives() {
        System.out.print("[" + intersection + "] ");
        currentState.handleCar();
    }

    void pedestrianWaiting() {
        System.out.print("[" + intersection + "] ");
        currentState.handlePedestrian();
    }

    void tick() {
        currentState.nextState(this);
    }
}

class RedState implements TrafficState {
    @Override
    public void handleCar() {
        System.out.println("RED — Cars STOP");
    }

    @Override
    public void handlePedestrian() {
        System.out.println("RED — Pedestrians may CROSS");
    }

    @Override
    public void nextState(TrafficLight light) {
        System.out.println("  Switching: RED → GREEN");
        light.setState(new GreenState());
    }
}

class GreenState implements TrafficState {
    @Override
    public void handleCar() {
        System.out.println("GREEN — Cars GO");
    }

    @Override
    public void handlePedestrian() {
        System.out.println("GREEN — Pedestrians WAIT");
    }

    @Override
    public void nextState(TrafficLight light) {
        System.out.println("  Switching: GREEN → YELLOW");
        light.setState(new YellowState());
    }
}

class YellowState implements TrafficState {
    @Override
    public void handleCar() {
        System.out.println("YELLOW — Cars SLOW DOWN");
    }

    @Override
    public void handlePedestrian() {
        System.out.println("YELLOW — Pedestrians WAIT");
    }

    @Override
    public void nextState(TrafficLight light) {
        System.out.println("  Switching: YELLOW → RED");
        light.setState(new RedState());
    }
}

public class TrafficLightState {
    public static void main(String[] args) {
        TrafficLight light = new TrafficLight("Main St & 5th Ave");

        // Full cycle: Red → Green → Yellow → Red
        light.carArrives();
        light.pedestrianWaiting();

        light.tick(); // Red → Green
        light.carArrives();
        light.pedestrianWaiting();

        light.tick(); // Green → Yellow
        light.carArrives();

        light.tick(); // Yellow → Red
        light.carArrives();
        light.pedestrianWaiting();
    }
}
