import java.util.*;

// ==========================================
// FOLLOW-UP 1: MULTIPLE / CUSTOM DICE
// ==========================================

enum GameStatus {
    IN_PROGRESS, WON
}

interface DiceStrategy {
    int roll();
    int getMaxRoll();
}

class StandardDice implements DiceStrategy {
    private final Random random = new Random();
    private final int faces;

    StandardDice(int faces) { this.faces = faces; }
    StandardDice() { this(6); }

    public int roll() { return random.nextInt(faces) + 1; }
    public int getMaxRoll() { return faces; }
}

class MultipleDice implements DiceStrategy {
    private final Random random = new Random();
    private final int count;
    private final int facesPerDie;

    MultipleDice(int count, int facesPerDie) {
        this.count = count;
        this.facesPerDie = facesPerDie;
    }

    public int roll() {
        int total = 0;
        for (int i = 0; i < count; i++)
            total += random.nextInt(facesPerDie) + 1;
        return total;
    }

    public int getMaxRoll() { return count * facesPerDie; }
}

class CrookedDice implements DiceStrategy {
    private final Random random = new Random();

    public int roll() {
        return (random.nextInt(3) + 1) * 2;
    }

    public int getMaxRoll() { return 6; }
}

// ==========================================
// FOLLOW-UP 2: OBSERVER PATTERN (Game Events)
// ==========================================

interface GameObserver {
    void onMove(Player player, int from, int to, int diceRoll);
    void onWin(Player player);
}

class ConsoleObserver implements GameObserver {
    public void onMove(Player player, int from, int to, int diceRoll) {
        System.out.println(player.getName() + " rolled " + diceRoll
                + " | " + from + " → " + to);
    }

    public void onWin(Player player) {
        System.out.println("*** " + player.getName() + " WON! ***");
    }
}

class ScoreboardObserver implements GameObserver {
    private final Map<String, Integer> moveCount = new HashMap<>();

    public void onMove(Player player, int from, int to, int diceRoll) {
        moveCount.put(player.getName(),
                moveCount.getOrDefault(player.getName(), 0) + 1);
    }

    public void onWin(Player player) {
        System.out.println("\n=== SCOREBOARD ===");
        for (Map.Entry<String, Integer> entry : moveCount.entrySet()) {
            System.out.println(entry.getKey() + ": " + entry.getValue() + " moves");
        }
    }
}

// ==========================================
// CORE CLASSES
// ==========================================

class Player {
    private final String name;
    private int position;

    Player(String name) {
        this.name = name;
        this.position = 0;
    }

    String getName() { return name; }
    int getPosition() { return position; }
    void moveTo(int pos) { this.position = pos; }
}

class Board {
    private final int size;
    private final Map<Integer, Integer> snakes;
    private final Map<Integer, Integer> ladders;

    Board(int size) {
        this.size = size;
        this.snakes = new HashMap<>();
        this.ladders = new HashMap<>();
    }

    void addSnake(int head, int tail) {
        if (head <= tail) throw new RuntimeException("Snake head must be above tail");
        if (head == size) throw new RuntimeException("Snake can't be at winning position");
        if (snakes.containsKey(head) || ladders.containsKey(head))
            throw new RuntimeException("Position " + head + " already occupied");
        snakes.put(head, tail);
    }

    void addLadder(int bottom, int top) {
        if (bottom >= top) throw new RuntimeException("Ladder bottom must be below top");
        if (snakes.containsKey(bottom) || ladders.containsKey(bottom))
            throw new RuntimeException("Position " + bottom + " already occupied");
        ladders.put(bottom, top);
    }

    int getNextPosition(int position) {
        while (true) {
            if (snakes.containsKey(position)) {
                System.out.println("  Bitten by snake! " + position + " → " + snakes.get(position));
                position = snakes.get(position);
            } else if (ladders.containsKey(position)) {
                System.out.println("  Climbed ladder! " + position + " → " + ladders.get(position));
                position = ladders.get(position);
            } else {
                break;
            }
        }
        return position;
    }

    int getSize() { return size; }
}

class Game {
    private final Board board;
    private final DiceStrategy dice;
    private final List<Player> players;
    private final List<GameObserver> observers;
    private int currentIndex;
    private GameStatus gameStatus;

    Game(List<Player> players, int boardSize, DiceStrategy dice) {
        this.players = players;
        this.board = new Board(boardSize);
        this.dice = dice;
        this.observers = new ArrayList<>();
        this.currentIndex = 0;
        this.gameStatus = GameStatus.IN_PROGRESS;
    }

    Game(List<Player> players, int boardSize) {
        this(players, boardSize, new StandardDice());
    }

    Board getBoard() { return board; }

    void addObserver(GameObserver observer) {
        observers.add(observer);
    }

    Player start() {
        while (gameStatus == GameStatus.IN_PROGRESS) {
            Player current = players.get(currentIndex);
            int diceRoll = dice.roll();
            int oldPos = current.getPosition();
            int newPos = oldPos + diceRoll;

            if (newPos > board.getSize()) {
                System.out.println(current.getName() + " rolled " + diceRoll
                        + " | Overshoots from " + oldPos);
            } else {
                newPos = board.getNextPosition(newPos);
                current.moveTo(newPos);

                for (GameObserver obs : observers)
                    obs.onMove(current, oldPos, newPos, diceRoll);

                if (newPos == board.getSize()) {
                    gameStatus = GameStatus.WON;
                    for (GameObserver obs : observers)
                        obs.onWin(current);
                    return current;
                }
            }

            if (diceRoll == dice.getMaxRoll()) {
                System.out.println("  " + current.getName() + " gets extra turn!\n");
            } else {
                currentIndex = (currentIndex + 1) % players.size();
                System.out.println();
            }
        }
        return null;
    }

    GameStatus getGameStatus() { return gameStatus; }
}

// ==========================================
// DEMO
// ==========================================
public class SnakeAndLadderFollowUps {
    public static void main(String[] args) {

        Player p1 = new Player("Alice");
        Player p2 = new Player("Bob");

        // Standard dice
        Game game = new Game(List.of(p1, p2), 100);

        // Uncomment for 2 dice:
        // Game game = new Game(List.of(p1, p2), 100, new MultipleDice(2, 6));

        game.getBoard().addSnake(99, 10);
        game.getBoard().addSnake(55, 3);
        game.getBoard().addSnake(33, 5);
        game.getBoard().addLadder(6, 34);
        game.getBoard().addLadder(15, 72);
        game.getBoard().addLadder(40, 64);

        game.addObserver(new ConsoleObserver());
        game.addObserver(new ScoreboardObserver());

        game.start();
    }
}
