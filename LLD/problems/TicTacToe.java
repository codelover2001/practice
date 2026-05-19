import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Deque;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.Scanner;


enum Symbol {
    X, O,K, EMPTY
}

enum GameStatus {
    IN_PROGRESS, WON, DRAW
}

class Move{
    private int row;
    private int col; 
    private Symbol symbol; 

    public Move(int row, int col, Symbol symbol){
        this.row= row;
        this.col = col;
        this.symbol = symbol;
    }

    public int getRow(){
        return row;
    }

    public int getCol(){
        return col;
    }

    public Symbol getSymbol(){
        return symbol;

    
}

class Player {
    private String name;
    private Symbol symbol;
    private InputProvider inputProvider;

    Player(String name, Symbol symbol, InputProvider inputProvider) {
        this.name = name;
        this.symbol = symbol;
        this.inputProvider = inputProvider;
    }

    String getName() { return name; }
    Symbol getSymbol() { return symbol; }
    InputProvider getInputProvider() { return inputProvider; }
}

class Cell {
    private Symbol symbol; 
    
    public Cell(){
        this.symbol=Symbol.EMPTY;
    }

    public void place(Symbol symbol){
        this.symbol = symbol;
    }

    public void clear(){
        this.symbol = Symbol.EMPTY;
    }

    public boolean isEmpty(){
        return symbol == Symbol.EMPTY;
    }

    public Symbol getSymbol(){
        return symbol;
    }
}

interface WinningStrategy{
    public boolean win(Board board, Symbol symbol);
}

class RowWinningStrategy implements WinningStrategy{
    public boolean win(Board board, Symbol symbol){
        for(int i=0;i<board.getSize();i++){
            boolean rowMatch = true;

            for(int j=0;j<board.getSize();j++){
                if(board.getCell(i, j).getSymbol() != symbol){
                    rowMatch = false;
                    break;
                }
            }
            if(rowMatch == true)
                return true;
        }
        return false;
    }
}

class ColWinningStrategy implements WinningStrategy{
    public boolean win(Board board, Symbol symbol){
        for(int i=0;i<board.getSize();i++){
            boolean rowMatch = true;

            for(int j=0;j<board.getSize();j++){
                if(board.getCell(j, i).getSymbol() != symbol){
                    rowMatch = false;
                    break;
                }
            }
            if(rowMatch == true)
                return true;
        }
        return false;
    }
}

class DiagWinningStrategy implements WinningStrategy{
    public boolean win(Board board, Symbol symbol){
        for(int i=0;i<board.getSize();i++){
            if(board.getCell(i, i).getSymbol() != symbol){
                    return false;
            }
        }
        return true;
    }
}

class AntiDiagWinningStrategy implements WinningStrategy{
    public boolean win(Board board, Symbol symbol){
        for(int i=0;i<board.getSize();i++){
            if(board.getCell(i, board.getSize()-1-i).getSymbol() != symbol){
                    return false;
            }
        }
        return true;
    }
}

interface InputProvider{
    public int[] getMove(Board board, int size);
}

class HumanProvider implements InputProvider{
    private Scanner s;

    public HumanProvider(){
        s=new Scanner(System.in);
    }
    public int[] getMove(Board board, int size){
        int[] input = new int[2];
        int row = s.nextInt();
        int col = s.nextInt();

        input[0]=row;
        input[1]=col;
        
        return input;
    }
}

class BotProvider implements InputProvider{
    private Random random= new Random();

    public int[] getMove(Board board, int size){

        int[] input=new int[2];

        while(true){
            int row = random.nextInt(size);
            int col = random.nextInt(size);

            if(board.isEmpty(row, col)){
                input[0]=row;
                input[1]=col;
                return input;
            }

        }

    }
}






class Board {
    private Cell[][] grid; 
    private int size; 
    private Map<Symbol, Integer>[] rowCount;
    private Map<Symbol, Integer>[] colCount;
    private Map<Symbol, Integer> diagCount;
    private Map<Symbol, Integer> antiDiagCount;

    @SuppressWarnings("unchecked")
    public Board(int size){
        this.size = size;
        this.grid = new Cell[size][size];
        this.rowCount = new HashMap[size];
        this.colCount = new HashMap[size];
        this.diagCount = new HashMap<>();
        this.antiDiagCount = new HashMap<>();
        for(int i=0;i<size;i++){
            rowCount[i] = new HashMap<>();
            colCount[i] = new HashMap<>();
        }
        this.diagCount = new HashMap<>();
        this.antiDiagCount = new HashMap<>();
    }
    public int getSize(){
        return size;
    }   

    public Cell getCell(int row, int col){
        return grid[row][col];
    }

    public Board(int size){
        this.size = size;

        grid = new Cell[size][size];

        for(int i=0;i<size;i++){
            for(int j=0;j<size;j++){
                grid[i][j] = new Cell();
            }
        }
    }

    public void place(int row, int col, Symbol symbol){
        if(!grid[row][col].isEmpty())
            throw new RuntimeException("Cell is occupied");
        grid[row][col].place(symbol);

        rowCount[row][symbol]++;
        colCount[col]++;

        if(row == col){
            diagCount[row]++;
        }
        if(row+col=size-1){
            antiDiagCount[row]++;
        }
    }

    public boolean checkWinner( Symbol symbol){

        for(WinningStrategy strategy: strategies){
            if(strategy.win(this, symbol)){
                return true;                
            }
        }
        return false;

    }


    public void increment(Map<Symbol,Integer> counter, Symbol symbol){
        counter.put(symbol, counter.getOrDefault(symbol, 0) + 1);
    }

    public void decrement(Map<Symbol, Integer> counter, Symbol symbol){
        counter.put(symbol, counter.get(symbol)-1);
    }

    public boolean checkWinnerCondition(Map<Symbol, Integer> counter, Symbol symbol){
        return counter.get(symbol) == size;
    }

    public boolean isFull(){
        for(int i=0;i<size;i++){
            for(int j=0;j<size;j++){
                if(grid[i][j].isEmpty())
                    return false;
            }
        }

        return true;
    }

    public boolean isEmpty(int row, int col){
        return grid[row][col].isEmpty();
    }

    public void clear(int row, int col){
        grid[row][col].clear();
    }

}

class Game {
    private List<Player> players;
    private int currentIndex;
    private Board board;
    private List<WinningStrategy> strategies;
    private GameStatus gameStatus; 
    private Deque<Move> history; 


    public Game(List<Player> players, int boardSize, InputProvider inputProvider){
        this.players = players;
        this.currentIndex = 0;
        this.board = new Board(boardSize);
        strategies = new ArrayList<WinningStrategy>();
        strategies.add(new RowWinningStrategy());
        strategies.add(new ColWinningStrategy());
        strategies.add(new DiagWinningStrategy());
        strategies.add(new AntiDiagWinningStrategy());
        gameStatus = GameStatus.IN_PROGRESS;
        history= new ArrayDeque<>();
    }

    public int[] takeInput(){
        return players.get(currentIndex).getInputProvider().getMove(board, board.getSize());
    }

    public Symbol makeMove(int row , int col){
        if(gameStatus != GameStatus.IN_PROGRESS){
            throw new RuntimeException("Game has been ended");
        }

        if(row <0 || row >=board.getSize() || col< 0 || col>=board.getSize()){
            throw new RuntimeException("Invalid Move");
        }

        System.out.println(row+" "+col);

        Symbol currSymbol = getCurrentSymbol();

        board.place(row, col, currSymbol);
        history.push(new Move(row, col, currSymbol));

        if(board.checkWinner(strategies, currSymbol)){
            gameStatus = GameStatus.WON;
            System.out.println("Game has been won by "+ currSymbol.toString() );
            return currSymbol;
        }

        if(board.isFull()){
            gameStatus = GameStatus.DRAW;
            return Symbol.EMPTY;
        }

        currentIndex = (currentIndex + 1)%players.size();

        return Symbol.EMPTY;
    }

    public void undo(){
        if(history.size()<=0){
            throw new RuntimeException("Nothing to undo");
        }

        Move lastMove = history.peek();

        history.pop();

        board.clear(lastMove.getRow(),lastMove.getCol());

        currentIndex = (currentIndex-1+players.size())%players.size();
        System.out.println(history.size());


    }

    private Symbol getCurrentSymbol(){
        return players.get(currentIndex).getSymbol();
    }

    public GameStatus getGameStatus(){
        return gameStatus;
    }
}




public class TicTacToe {

    static public void main(String[] args){
        Player p1= new Player("himanshu", Symbol.X, new HumanProvider());
        Player p2= new Player("Sudhanshu", Symbol.O, new HumanProvider());
        Player p3= new Player("a", Symbol.K, new BotProvider());
        List<Player> players = new ArrayList<>();

        players.add(p1);
        players.add(p2);
        players.add(p3);

        InputProvider bot = new BotProvider();
        

        Game game= new Game(players, 4, bot);

        while(game.getGameStatus() != GameStatus.WON && game.getGameStatus() != GameStatus.DRAW){
            int[] input = game.takeInput();
            game.makeMove(input[0],input[1]);
        }



    
    }
}
