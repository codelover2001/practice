// Subset Sum Equal to Target (GFG)
// Difficulty: Medium | Priority: P1
// Exists subset summing to k.
// Example: Var
// Approach: Boolean knapsack.
// Time: O(n*k), Space: O(k)

class Solution {
    static boolean isSubsetSum(int n, int[] a, int t) {
        boolean[] dp = new boolean[t + 1];
        dp[0] = true;
        for (int x : a)
            for (int j = t; j >= x; j--) dp[j] |= dp[j - x];
        return dp[t];
    }
}
