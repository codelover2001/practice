// M-Coloring Problem (GFG)
// Difficulty: Medium | Priority: P1
// Determine if graph can be colored with at most m colors so adjacent vertices differ.
// Example: Adjacency matrix + m → boolean.
// Approach: Backtracking assign colors to vertices.
// Time: O(m^n), Space: O(n)

class Solution {
    public boolean graphColoring(boolean[][] g, int m, int n) {
        // TODO: Implement
    }
    boolean bt(boolean[][] g,int m,int n,int v,int[] col){
        if(v==n) return true;
        for(int c=1;c<=m;c++) if(safe(g,v,c,col,n)){col[v]=c; if(bt(g,m,n,v+1,col)) return true; col[v]=0;}
        return false;
    }
    boolean safe(boolean[][] g,int v,int c,int[] col,int n){
        for(int k=0;k<n;k++) if(g[v][k]&&col[k]==c) return false;
        return true;
    }
}
