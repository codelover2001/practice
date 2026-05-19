// Minimum Insertion Steps to Make a String Palindrome (LC 1312)
// Difficulty: Hard | Priority: P1
// Min insertions for palindrome.
// Example: leetcode→5
// Approach: n - LPS(s).
// Time: O(n²), Space: O(n)

class Solution {
    public int minInsertions(String s) {
        // TODO: Implement
    }
    int lps(String s) {
        int n = s.length();
        int[] dp = new int[n + 1];
        String r = new StringBuilder(s).reverse().toString();
        for (int i = 1; i <= n; i++) {
            int prev = 0;
            for (int j = 1; j <= n; j++) {
                int t = dp[j];
                if (s.charAt(i - 1) == r.charAt(j - 1)) dp[j] = prev + 1;
                else dp[j] = Math.max(dp[j], dp[j - 1]);
                prev = t;
            }
        }
        return dp[n];
    }
}
