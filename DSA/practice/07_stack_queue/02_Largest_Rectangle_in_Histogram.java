// Largest Rectangle in Histogram (LC 84)
// Difficulty: Hard | Priority: P0
// Largest rectangle area in histogram.
// Example: [2,1,5,6,2,3] → 10
// Approach: Monotonic stack of indices; compute width on pop.
// Time: O(n), Space: O(n)

class Solution {
    public int largestRectangleArea(int[] a) { java.util.ArrayDeque<Integer> s=new java.util.ArrayDeque<>(); int b=0,n=a.length; for(int i=0;i<=n;i++){ int h=i<n?a[i]:0; while(!s.isEmpty()&&a[s.peek()]>h){ int j=s.pop(),w=s.isEmpty()?i:i-s.peek()-1; b=Math.max(b,a[j]*w);} s.push(i);} return b; }
}
