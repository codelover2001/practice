// Set Matrix Zeros (LC 73)
// Difficulty: Medium | Priority: P0
// If cell is 0, set its whole row and column to 0 in-place.
// Example: [[1,1,1],[1,0,1],[1,1,1]]
// Approach: Use first row/col as markers; handle overlaps.
// Time: O(m*n), Space: O(1)

class Solution {
    public void setZeroes(int[][] m) { int r=m.length,c=m[0].length,f1=0,f2=0; for(int j=0;j<c;j++) if(m[0][j]==0)f1=1; for(int i=0;i<r;i++) if(m[i][0]==0)f2=1; for(int i=1;i<r;i++) for(int j=1;j<c;j++) if(m[i][j]==0){m[i][0]=m[0][j]=0;} for(int i=1;i<r;i++) for(int j=1;j<c;j++) if(m[i][0]==0||m[0][j]==0)m[i][j]=0; if(f1==1) for(int j=0;j<c;j++)m[0][j]=0; if(f2==1) for(int i=0;i<r;i++)m[i][0]=0; }
}
