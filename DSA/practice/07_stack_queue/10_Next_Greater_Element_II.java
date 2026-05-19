// Next Greater Element II (LC 503)
// Difficulty: Medium | Priority: P1
// Next greater for circular array.
// Example: [1,2,1] → [2,-1,2]
// Approach: Monotonic stack, traverse 2n.
// Time: O(n), Space: O(n)

class Solution {
    public int[] nextGreaterElements(int[] a) { int n=a.length,r[]=new int[n]; java.util.Arrays.fill(r,-1); java.util.ArrayDeque<Integer> s=new java.util.ArrayDeque<>(); for(int i=0;i<2*n;i++){ int v=a[i%n]; while(!s.isEmpty()&&a[s.peek()]<v) r[s.pop()]=v; if(i<n) s.push(i);} return r; }
}
