// Celebrity Problem (GFG)
// Difficulty: Medium | Priority: P1
// Find celebrity who knows nobody and everyone knows them.
// Example: n=3 matrix
// Approach: Elimination then verify in O(n).
// Time: O(n), Space: O(1)

class Solution {
    public int celebrity(int n, int[][] M) { int c=0; for(int i=1;i<n;i++) if(M[c][i]==1) c=i; for(int i=0;i<n;i++) if(i!=c&&(M[c][i]==1||M[i][c]==0)) return -1; return c; }
}
