// Word Search (LC 79)
// Difficulty: Medium | Priority: P0
// Determine if word exists in grid by moving to adjacent cells without reuse.
// Example: board contains 'ABCCED' path.
// Approach: DFS from each cell; mark visited with sentinel.
// Time: O(m*n*4^L), Space: O(L)

class Solution {
    public boolean exist(char[][] b, String w) {
        // TODO: Implement
    }
    boolean dfs(char[][] b,int i,int j,int k,String w){
        if(k==w.length()) return true;
        if(i<0||i>=b.length||j<0||j>=b[0].length||b[i][j]!=w.charAt(k)) return false;
        char t=b[i][j]; b[i][j]='#';
        boolean ok=dfs(b,i+1,j,k+1,w)||dfs(b,i-1,j,k+1,w)||dfs(b,i,j+1,k+1,w)||dfs(b,i,j-1,k+1,w);
        b[i][j]=t; return ok;
    }
}
