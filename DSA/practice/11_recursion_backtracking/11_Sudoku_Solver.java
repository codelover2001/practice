// Sudoku Solver (LC 37)
// Difficulty: Hard | Priority: P1
// Fill empty cells so each row/col/box has digits 1-9 exactly once.
// Example: Partial board → unique valid completion.
// Approach: Backtracking: try digits for '.' cells with validity checks.
// Time: O(9^m), Space: O(1)

class Solution {
    public void solveSudoku(char[][] b) { solve(b); }
    boolean solve(char[][] b){
        for(int i=0;i<9;i++) for(int j=0;j<9;j++) if(b[i][j]=='.'){
            for(char c='1';c<='9';c++) if(ok(b,i,j,c)){b[i][j]=c;if(solve(b))return true;b[i][j]='.';}
            return false;}
        return true;
    }
    boolean ok(char[][] b,int r,int c,char ch){
        for(int k=0;k<9;k++) if(b[r][k]==ch||b[k][c]==ch) return false;
        int br=3*(r/3),bc=3*(c/3);
        for(int i=0;i<3;i++) for(int j=0;j<3;j++) if(b[br+i][bc+j]==ch) return false;
        return true;
    }
}
