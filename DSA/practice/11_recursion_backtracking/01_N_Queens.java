// N-Queens (LC 51)
// Difficulty: Hard | Priority: P0
// Return all distinct solutions to n-queens.
// Example: n=4 → two boards with Q placements.
// Approach: Backtracking rows; check cols and diagonals.
// Time: O(n!), Space: O(n^2)

class Solution {
    public List<List<String>> solveNQueens(int n) {
        // TODO: Implement
    }
    void bt(char[][] b,int r,List<List<String>> res){
        // TODO: Implement
    }
    boolean ok(char[][] b,int r,int c){
        for(int i=0;i<r;i++) if(b[i][c]=='Q') return false;
        for(int i=r-1,j=c-1;i>=0&&j>=0;i--,j--) if(b[i][j]=='Q') return false;
        for(int i=r-1,j=c+1;i>=0&&j<b.length;i--,j++) if(b[i][j]=='Q') return false;
        return true;
    }
}
