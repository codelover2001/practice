import java.util.Map;
import java.util.Set;
import java.util.HashSet;
import java.util.Random;
import java.util.List;
import java.util.ArrayList;
import java.util.HashMap;

enum GameStatus {
    IN_PROGRESS, WON
}

// =======================================================
// RELATIONSHIP: Independent entity (no owner)
// Players exist before the game and after it ends.
// Game holds a REFERENCE to players, not ownership.
// =======================================================
class Player {
    private final String name;
    private int position;

    public Player(String name) {
        this.name = name;
        this.position = 0;
    }

    public String getName() { return name; }
    public int getPosition() { return position; }

    void moveTo(int newPosition) {
        this.position = newPosition;
    }
}

class Dice {
    private final Random random = new Random();
    private final int faces;

    public Dice(int faces) {
        this.faces = faces;
    }

    public Dice() {
        this(6);
    }

    public int roll() {
        return random.nextInt(faces) + 1;
    }

    public int getFaces() { return faces; }
}

// =======================================================
// RELATIONSHIP: Board OWNS snakes & ladders (COMPOSITION)
//
// Snakes and ladders are created INSIDE the Board.
// They don't exist outside the Board. If Board is destroyed,
// snakes and ladders go with it.
//
// In code, composition = the owner CREATES the data internally 
// ,
// and doesn't expose it for external modification.
// =======================================================
class Board {
    private final int size;
    private final Map<Integer, Integer> snakes;
    private final Map<Integer, Integer> ladders;

    public Board(int size) {
        this.size = size;
        this.snakes = new HashMap<>();
        this.ladders = new HashMap<>();
    }

    public void addSnake(int head, int tail) {
        validate(head, tail, "Snake");
        if (head <= tail)
            throw new RuntimeException("Snake head (" + head + ") must be above tail (" + tail + ")");
        if (head == size)
            throw new RuntimeException("Snake can't be at winning position " + size);
        snakes.put(head, tail);
    }

    public void addLadder(int bottom, int top) {
        validate(bottom, top, "Ladder");
        if (bottom >= top)
            throw new RuntimeException("Ladder bottom (" + bottom + ") must be below top (" + top + ")");
        ladders.put(bottom, top);
    }

    private void validate(int start, int end, String type) {
        if (start < 1 || start > size || end < 1 || end > size)
            throw new RuntimeException(type + " positions must be between 1 and " + size);
        if (snakes.containsKey(start) || ladders.containsKey(start))
            throw new RuntimeException("Position " + start + " already has a snake or ladder");
    }

    int getNextPosition(int position) {
        // Chaining: a snake's tail could land on a ladder's bottom (or vice versa)
        int prev = position;
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

    public int getSize() { return size; }
}

// =======================================================
// RELATIONSHIP: Game COMPOSES Board & Dice (COMPOSITION)
//
// Game creates Board and Dice INSIDE itself.
// They can't exist meaningfully without a Game.
//
// Game ASSOCIATES with Players (ASSOCIATION)
// Players are passed in — they exist independently.
//
// HOW TO TELL THE DIFFERENCE IN CODE:
//   Composition → "new" inside the constructor (Game creates it)
//   Association → parameter passed into constructor (Game receives it)
// =======================================================
class Game {
    private final Board board;        // COMPOSITION: created inside Game
    private final Dice dice;          // COMPOSITION: created inside Game
    private final List<Player> players; // ASSOCIATION: received from outside
    private int currentIndex;
    private GameStatus gameStatus;

    public Game(List<Player> players, int boardSize) {
        this.players = players;
        this.board = new Board(boardSize);   // Game CREATES board → composition
        this.dice = new Dice();              // Game CREATES dice  → composition
        this.currentIndex = 0;
        this.gameStatus = GameStatus.IN_PROGRESS;
    }

    public Board getBoard() { return board; }

    public Player start() {
        while (gameStatus == GameStatus.IN_PROGRESS) {
            Player current = players.get(currentIndex);
            int diceRoll = dice.roll();
            int oldPos = current.getPosition();
            int newPos = oldPos + diceRoll;

            System.out.println(current.getName() + " rolled " + diceRoll
                    + " | position: " + oldPos);

            if (newPos > board.getSize()) {
                System.out.println("  Overshoots! Stays at " + oldPos);
            } else {
                newPos = board.getNextPosition(newPos);
                current.moveTo(newPos);
                System.out.println("  Moved to " + newPos);

                if (newPos == board.getSize()) {
                    gameStatus = GameStatus.WON;
                    System.out.println(current.getName() + " WON the game!");
                    return current;
                }
            }

            if (diceRoll == dice.getFaces()) {
                System.out.println("  Rolled max! Extra turn.");
            } else {
                currentIndex = (currentIndex + 1) % players.size();
            }
            System.out.println();
        }
        return null;
    }

    public GameStatus getGameStatus() { return gameStatus; }
}

public class SnakeAndLadder {
    public static void main(String[] args) {

        // Players exist INDEPENDENTLY — created before Game
        Player p1 = new Player("Alice");
        Player p2 = new Player("Bob");
        Player p3 = new Player("Charlie");
        List<Player> players = List.of(p1, p2, p3);

        // Game creates Board and Dice internally (composition)
        // Game receives players (association)
        Game game = new Game(players, 100);

        // Board config via Game — snakes/ladders are Board's internal data
        game.getBoard().addSnake(99, 10);
        game.getBoard().addSnake(55, 3);
        game.getBoard().addSnake(33, 5);
        game.getBoard().addLadder(6, 34);
        game.getBoard().addLadder(15, 92);
        game.getBoard().addLadder(40, 64);

        game.start();
    }
}

/*

=== HOW RELATIONSHIPS SHOW IN CODE ===

1. COMPOSITION (Game → Board, Game → Dice)
   ┌─────────────────────────────────────────────────┐
   │ class Game {                                     │
   │     Game(List<Player> players, int boardSize) {  │
   │         this.board = new Board(boardSize); ← NEW │
   │         this.dice = new Dice();            ← NEW │
   │     }                                            │
   │ }                                                │
   └─────────────────────────────────────────────────┘
   The "new" keyword INSIDE the constructor = composition.
   Game controls the lifecycle. Board/Dice are born with Game,
   die with Game. No one else holds a reference to them.

2. COMPOSITION (Board → snakes/ladders)
   ┌──────────────────────────────────────────────────┐
   │ class Board {                                     │
   │     Board(int size) {                             │
   │         this.snakes = new HashMap<>();   ← NEW    │
   │         this.ladders = new HashMap<>();  ← NEW    │
   │     }                                             │
   │     public void addSnake(int h, int t) { ... }    │
   │ }                                                 │
   └──────────────────────────────────────────────────┘
   Board creates the maps internally. External code can ADD
   snakes via addSnake(), but can't replace the map itself.

3. ASSOCIATION (Game → Players)
   ┌──────────────────────────────────────────────────┐
   │ // main()                                         │
   │ Player p1 = new Player("Alice");  ← created OUTSIDE│
   │ Game game = new Game(players, 100);               │
   │                                                   │
   │ // Game constructor                               │
   │ this.players = players;  ← just stores reference  │
   └──────────────────────────────────────────────────┘
   Game didn't create the players. They were born outside.
   If Game is garbage collected, players still exist.

QUICK RULE:
  - See "new X()" inside a constructor? → Composition
  - See "this.x = x" (parameter assignment)? → Association/Aggregation

*/
