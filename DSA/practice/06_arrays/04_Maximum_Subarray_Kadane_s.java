// Maximum Subarray (Kadane's) (LC 53)
// Difficulty: Medium | Priority: P0
// Find contiguous subarray with largest sum.
// Example: [-2,1,-3,4,-1,2,1,-5,4] → 6
// Approach: Kadane: cur=max(x,cur+x), ans=max(ans,cur).
// Time: O(n), Space: O(1)

class Solution {
    public int maxSubArray(int[] a) { int s=0,b=Integer.MIN_VALUE; for(int x:a){ s=Math.max(x,s+x); b=Math.max(b,s); } return b; }
}
