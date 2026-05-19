// Best Time to Buy and Sell Stock (LC 121)
// Difficulty: Easy | Priority: P0
// One transaction: max profit.
// Example: [7,1,5,3,6,4] → 5
// Approach: Track min price so far, profit = price-min.
// Time: O(n), Space: O(1)

class Solution {
    public int maxProfit(int[] p) { int mn=p[0],b=0; for(int i=1;i<p.length;i++){ b=Math.max(b,p[i]-mn); mn=Math.min(mn,p[i]); } return b; }
}
