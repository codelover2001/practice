// Maximal Rectangle (LC 85)
// Difficulty: Hard | Priority: P0
// Largest 1 rectangle in binary matrix.
// Example: See LC
// Approach: Heights per row + histogram stack.
// Time: O(m*n), Space: O(n)

class Solution {
    public int maximalRectangle(char[][] m) { if(m.length==0)return 0; int c=m[0].length,h[]=new int[c+1],b=0; for(char[] r:m){ for(int j=0;j<c;j++) h[j]=r[j]=='1'?h[j]+1:0; java.util.ArrayDeque<Integer> s=new java.util.ArrayDeque<>(); for(int i=0;i<=c;i++){ while(!s.isEmpty()&&h[s.peek()]>h[i]){ int j=s.pop(),w=s.isEmpty()?i:i-s.peek()-1; b=Math.max(b,h[j]*w);} s.push(i);} } return b; }
}
