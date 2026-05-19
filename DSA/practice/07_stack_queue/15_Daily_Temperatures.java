// Daily Temperatures (LC 739)
// Difficulty: Medium | Priority: P1
// Days until warmer temperature.
// Example: [73,74,75,71,69,72,76,73]
// Approach: Monotonic decreasing stack of indices.
// Time: O(n), Space: O(n)

class Solution {
    public int[] dailyTemperatures(int[] t) { int n=t.length,r[]=new int[n]; java.util.ArrayDeque<Integer> s=new java.util.ArrayDeque<>(); for(int i=0;i<n;i++){ while(!s.isEmpty()&&t[s.peek()]<t[i]){ int j=s.pop(); r[j]=i-j;} s.push(i);} return r; }
}
