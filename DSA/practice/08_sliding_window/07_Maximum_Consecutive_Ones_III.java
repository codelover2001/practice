// Maximum Consecutive Ones III (LC 1004)
// Difficulty: Medium | Priority: P1
// Flip at most k zeros; longest 1-window.
// Example: [0,0,1,1,0,0,1,1,1,1,0], k=2 → 6
// Approach: Sliding window with zero count.
// Time: O(n), Space: O(1)

class Solution {
    public int longestOnes(int[] a, int k) { int l=0,z=0,b=0; for(int r=0;r<a.length;r++){ if(a[r]==0) z++; while(z>k) if(a[l++]==0) z--; b=Math.max(b,r-l+1);} return b; }
}
