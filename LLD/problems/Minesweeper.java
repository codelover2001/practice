/*
 * DESIGN: MINESWEEPER (medium)
 *
 * 30 MINUTES. SOLVE IT YOURSELF FIRST.
 *
 * Requirements:
 *   - Grid of cells (e.g., 9x9), some contain mines
 *   - Player can reveal a cell or flag a cell (suspected mine)
 *   - Reveal a mine → game over (lose)
 *   - Reveal an empty cell → shows count of adjacent mines (0-8)
 *   - If count is 0 → auto-reveal all adjacent cells (recursive flood fill)
 *   - Reveal all non-mine cells → win
 *   - Flag count should not exceed mine count
 *
 * Your 7 questions:
 *   1. What can a user DO?        →
 *   2. What THINGS exist?         →
 *   3. What STATES exist?         →
 *   4. Who OWNS what?             →
 *   5. What can GO WRONG?         →
 *   6. What CHANGES at runtime?   →
 *   7. What if they ask to ADD?   →
 *
 * YOUR ENTITIES (fill in):
 *
 *
 * YOUR SERVICE METHODS (fill in):
 *
 *
 * CODE BELOW:
 */

enum CellState{
    HIDDEN, 
    FLAGGED, 
    REVEALED
}

enum GameStatus{
    IN_PROGRESS,
    WON,
    LOST
}

class Player{
    private String name;

    public Player(String name){
        this.name=name;
    }

    public String getName() {
        return name;
    }
}

class Cell{
    private boolean isMine;
    private int adjacentBombs;
    private CellState state;

    public Cell(){
        isMine=false;
        adjacentBombs=0;
        state=CellState.HIDDEN;
    }

    public int getAdjacentBombs() {
        return adjacentBombs;
    }

    public CellState getState() {
        return state;
    }

    public boolean isCellMine(){
        return isMine;
    }

}

class Board{
    private int rows; 
    private int cols; 
    private Cell[][] grid;
    private int totalMines; 
    private int revealedCells;

    public Board(int rows,int cols, int[][] mines){
        this.rows= rows; 
        this.cols=cols;


    }

    public void place(int row,int col){}

    public void reveal(int row,int col){}

    public void flag(int row,int col){}

    public void unflag(int row,int col){}

    public boolean isWon(){
        return revealedCells == (rows*cols - totalMines);
    }
}

class Game{
    private Board board; 
    private GameStatus gameStatus; 
    private Player player; 

    public Game(int rows,int cols, Player p, int[][] mines){
        board = new Board(rows, cols,mines);
    }

}

public class Minesweeper {
    public static void main(String[] args) {
        System.out.println("Minesweeper - implement me!");

        Player p = new Player("himanshu");

        int[][] mines = new int[5][2];

        Game game = new Game(5,5,p, mines);

    }
}

/*
Requirements: 
1. Given a n size board 
2. There will a list of bombs 
3. Player can reveal a cell 
4. Player can flag a cell 
5. Player can unflag a cell 
6. If revealed cell is a bomb then game will be over 
7. If not then All the connecting cells which does not have any adjacent cell which has bomb will be revealed recursively 
8. It's a single player game 


GameStatus: 
- NOT_STARTED
- IN_PROGRESS
- WON 
- LOST 

CellState: 
- NOT_REVEALED
- REVEALED
- FLAGGED
- UNFLAGGED

Player: 
- name 

Cell: 
- adjacentBombs: int (default -1)
- state: CellState (default state NOT_REVEALED)

Board: 
- size: int 
- grid: Cell[][] 
- bombs: Map<int[2], boolean>

- reveal(int row, int col): void 
- flag(int row,int col): void
- unflag(int row,int col): void 


Game: 
- player: Player
- board: Board

- makeTurn(int row,int col): void 
- takeInput(): int[2]
- checkWinner(int row,int col): boolean 

MineSweeperGame: 
1. Create a game 
2. game.makeTurn(row,col)

Relationships: 
1. Game owns the board - composition 
2. Board owns the cells - composition 
3. Game uses Player - Association 












*/