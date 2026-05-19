import java.util.*;

enum Symbol {
    X, O, EMPTY
}

enum GameStatus {
    IN_PROGRESS, WON, DRAW
}

class Cell {
    private Symbol symbol;

    Cell() {
        this.symbol = Symbol.EMPTY;
    }

    Symbol getSymbol() { return symbol; }

    boolean isEmpty() { return symbol == Symbol.EMPTY; }

    void place(Symbol symbol) { this.symbol = symbol; }

    void clear() { this.symbol = Symbol.EMPTY; }
}

interface MoveProvider {
    int[] getMove(Board board);
}

class HumanMoveProvider implements MoveProvider {
    private final Scanner scanner;

    HumanMoveProvider(Scanner scanner) {
        this.scanner = scanner;
    }

    public int[] getMove(Board board) {
        while (true) {
            System.out.print("Enter row col: ");
            int r = scanner.nextInt();
            int c = scanner.nextInt();
            if (r >= 0 && r < board.getSize() && c >= 0 && c < board.getSize()
                    && board.getCell(r, c).isEmpty()) {
                return new int[]{r, c};
            }
            System.out.println("Invalid move, try again.");
        }
    }
}

class RandomBotMoveProvider implements MoveProvider {
    private final Random random = new Random();

    public int[] getMove(Board board) {
        int size = board.getSize();
        while (true) {
            int r = random.nextInt(size);
            int c = random.nextInt(size);
            if (board.getCell(r, c).isEmpty()) {
                return new int[]{r, c};
            }
        }
    }
}

class Player {
    private final String name;
    private final Symbol symbol;
    private final MoveProvider moveProvider;

    Player(String name, Symbol symbol, MoveProvider moveProvider) {
        this.name = name;
        this.symbol = symbol;
        this.moveProvider = moveProvider;
    }

    String getName() { return name; }
    Symbol getSymbol() { return symbol; }
    MoveProvider getMoveProvider() { return moveProvider; }
}

class Move {
    final int row;
    final int col;
    final Symbol symbol;

    Move(int row, int col, Symbol symbol) {
        this.row = row;
        this.col = col;
        this.symbol = symbol;
    }
}

// ==========================================
// O(1) WINNER CHECK + UNDO + N-PLAYER BOARD
// ==========================================
//
// Instead of int[size][2] with magic indices:
//   rowCount[row][0]  ← what is 0? need symbolIndex() to decode
//
// Use Map<Symbol, Integer>:
//   rowCounts[row].get(Symbol.X)  ← self-documenting, extensible to N symbols

class Board {
    private final int size;
    private final Cell[][] grid;
    private int filledCells;

    // Map approach: rowCounts[row] = {X: 2, O: 1} means row has 2 X's and 1 O
    private final Map<Symbol, Integer>[] rowCounts;
    private final Map<Symbol, Integer>[] colCounts;
    private final Map<Symbol, Integer> diagCounts;
    private final Map<Symbol, Integer> antiDiagCounts;

    @SuppressWarnings("unchecked")
    Board(int size) {
        this.size = size;
        this.grid = new Cell[size][size];
        this.filledCells = 0;

        for (int i = 0; i < size; i++)
            for (int j = 0; j < size; j++)
                grid[i][j] = new Cell();

        this.rowCounts = new HashMap[size];
        this.colCounts = new HashMap[size];
        for (int i = 0; i < size; i++) {
            rowCounts[i] = new HashMap<>();
            colCounts[i] = new HashMap<>();
        }
        this.diagCounts = new HashMap<>();
        this.antiDiagCounts = new HashMap<>();
    }

    int getSize() { return size; }

    Cell getCell(int row, int col) { return grid[row][col]; }

    // Returns winning Symbol or Symbol.EMPTY if no winner yet
    Symbol place(int row, int col, Symbol symbol) {
        if (row < 0 || row >= size || col < 0 || col >= size)
            throw new RuntimeException("Out of bounds: " + row + "," + col);
        if (!grid[row][col].isEmpty())
            throw new RuntimeException("Cell already occupied");

        grid[row][col].place(symbol);
        filledCells++;

        increment(rowCounts[row], symbol);
        increment(colCounts[col], symbol);
        if (row == col) increment(diagCounts, symbol);
        if (row + col == size - 1) increment(antiDiagCounts, symbol);

        if (getCount(rowCounts[row], symbol) == size
                || getCount(colCounts[col], symbol) == size
                || getCount(diagCounts, symbol) == size
                || getCount(antiDiagCounts, symbol) == size) {
            return symbol;
        }
        return Symbol.EMPTY;
    }

    void undo(int row, int col, Symbol symbol) {
        grid[row][col].clear();
        filledCells--;

        decrement(rowCounts[row], symbol);
        decrement(colCounts[col], symbol);
        if (row == col) decrement(diagCounts, symbol);
        if (row + col == size - 1) decrement(antiDiagCounts, symbol);
    }

    boolean isFull() { return filledCells == size * size; }

    void printBoard() {
        for (int i = 0; i < size; i++) {
            for (int j = 0; j < size; j++) {
                String d = grid[i][j].isEmpty() ? "." : grid[i][j].getSymbol().toString();
                System.out.print(d);
                if (j < size - 1) System.out.print(" | ");
            }
            System.out.println();
            if (i < size - 1) System.out.println("-".repeat(size * 4 - 3));
        }
        System.out.println();
    }

    private void increment(Map<Symbol, Integer> map, Symbol symbol) {
        map.put(symbol, map.getOrDefault(symbol, 0) + 1);
    }

    private void decrement(Map<Symbol, Integer> map, Symbol symbol) {
        map.put(symbol, map.getOrDefault(symbol, 0) - 1);
    }

    private int getCount(Map<Symbol, Integer> map, Symbol symbol) {
        return map.getOrDefault(symbol, 0);
    }
}

class Game {
    private final Board board;
    private final List<Player> players;
    private int currentPlayerIndex;
    private GameStatus status;
    private final Deque<Move> moveHistory;

    Game(List<Player> players, int boardSize) {
        this.board = new Board(boardSize);
        this.players = players;
        this.currentPlayerIndex = 0;
        this.status = GameStatus.IN_PROGRESS;
        this.moveHistory = new ArrayDeque<>();
    }

    Player getCurrentPlayer() {
        return players.get(currentPlayerIndex);
    }

    void makeMove(int row, int col) {
        if (status != GameStatus.IN_PROGRESS)
            throw new RuntimeException("Game is already over");

        Player current = getCurrentPlayer();
        Symbol winner = board.place(row, col, current.getSymbol());
        moveHistory.push(new Move(row, col, current.getSymbol()));

        System.out.println(current.getName() + " places " + current.getSymbol()
                + " at (" + row + "," + col + ")");
        board.printBoard();

        if (winner != Symbol.EMPTY) {
            status = GameStatus.WON;
            System.out.println(current.getName() + " wins!");
            return;
        }
        if (board.isFull()) {
            status = GameStatus.DRAW;
            System.out.println("It's a draw!");
            return;
        }
        currentPlayerIndex = (currentPlayerIndex + 1) % players.size();
    }

    boolean undo() {
        if (moveHistory.isEmpty()) return false;

        Move last = moveHistory.pop();
        board.undo(last.row, last.col, last.symbol);
        status = GameStatus.IN_PROGRESS;
        currentPlayerIndex = (currentPlayerIndex - 1 + players.size()) % players.size();

        System.out.println("Undid " + last.symbol + " at (" + last.row + "," + last.col + ")");
        board.printBoard();
        return true;
    }

    void play() {
        while (status == GameStatus.IN_PROGRESS) {
            Player current = getCurrentPlayer();
            int[] move = current.getMoveProvider().getMove(board);
            makeMove(move[0], move[1]);
        }
    }

    GameStatus getStatus() { return status; }
    Board getBoard() { return board; }
}

// ==========================================
// DEMO
// ==========================================
public class TicTacToeFollowUps {
    public static void main(String[] args) {

        MoveProvider bot = new RandomBotMoveProvider();

        // === DEMO 1: Bot vs Bot (fully automated) ===
        System.out.println("=== Bot vs Bot on 3x3 ===\n");

        List<Player> bots = List.of(
            new Player("BotAlice", Symbol.X, bot),
            new Player("BotBob", Symbol.O, bot)
        );
        Game game1 = new Game(bots, 3);
        game1.play();

        // === DEMO 2: Undo ===
        System.out.println("\n=== Undo Demo ===\n");

        Game game2 = new Game(bots, 3);
        game2.makeMove(0, 0);
        game2.makeMove(1, 1);
        game2.makeMove(0, 1);
        game2.undo();
        game2.makeMove(2, 2);

        // === DEMO 3: Human vs Bot (uncomment to play) ===
        // Scanner scanner = new Scanner(System.in);
        // List<Player> mixed = List.of(
        //     new Player("You", Symbol.X, new HumanMoveProvider(scanner)),
        //     new Player("Bot", Symbol.O, bot)
        // );
        // Game game3 = new Game(mixed, 3);
        // game3.play();
        // scanner.close();
    }
}
