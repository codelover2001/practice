// Spiral Matrix (LC 54)
// Difficulty: Medium | Priority: P1
// Return all elements in spiral order.
// Example: [[1,2,3],[4,5,6],[7,8,9]] → [1,2,3,6,9,8,7,4,5]
// Approach: Layer simulation with four boundaries.
// Time: O(m*n), Space: O(1) excl. output

class Solution {
    public java.util.List<Integer> spiralOrder(int[][] m) { java.util.List<Integer> r=new java.util.ArrayList<>(); if(m.length==0)return r; int t=0,b=m.length-1,l=0,rt=m[0].length-1; while(true){ for(int j=l;j<=rt;j++) r.add(m[t][j]); if(++t>b)break; for(int i=t;i<=b;i++) r.add(m[i][rt]); if(--rt<l)break; for(int j=rt;j>=l;j--) r.add(m[b][j]); if(--b<t)break; for(int i=b;i>=t;i--) r.add(m[i][l]); if(++l>rt)break; } return r; }
}
