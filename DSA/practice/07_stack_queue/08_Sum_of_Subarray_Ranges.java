// Sum of Subarray Ranges (LC 2104)
// Difficulty: Hard | Priority: P1
// Sum of (max-min) over every subarray in index range [left,right].
// Example: See LC (bounded indices).
// Approach: Sum of subarray maximums minus sum of subarray minimums (monotonic stacks).
// Time: O(n), Space: O(n)

class Solution {
    public long subArrayRanges(int[] a) { return f(a,true)-f(a,false); }
    long f(int[] a,boolean mx){ int n=a.length; long r=0; java.util.ArrayDeque<Integer> d=new java.util.ArrayDeque<>(); for(int i=0;i<=n;i++){ int v=i<n?a[i]:mx?Integer.MAX_VALUE:Integer.MIN_VALUE; while(!d.isEmpty()&&(mx?a[d.peekLast()]<v:a[d.peekLast()]>v)){ int j=d.pollLast(),L=d.isEmpty()?-1:d.peekLast(),R=i; r+=1L*a[j]*(j-L)*(R-j);} d.addLast(i);} return r; }
}
