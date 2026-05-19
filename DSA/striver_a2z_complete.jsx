import { useState, useRef, useEffect, useMemo } from "react";

// ─── COMPLETE STRIVER A2Z DSA SHEET DATA ───
// Topics ordered by SDE-2/SSE interview priority
// Auto-generated Striver A2Z DSA Sheet - 347 problems across 15 topics
// Sorted by topic priority (SDE-2/SSE interview frequency)
// Problems sorted by P0 > P1 > P2 > P3, then Hard > Medium > Easy

const topics = [
  {
    id: "dp",
    name: "Dynamic Programming",
    icon: "◈",
    topicPriority: 1,
    accent: "#f472b6",
    description: "Most asked topic in SDE-2 rounds. Master patterns, not individual problems.",
    problems: [
      { title: "Best Time to Buy and Sell Stock III", difficulty: "Hard", lc: "LC 123", priority: 0, statement: "At most two complete transactions; max profit.", example: "[3,3,5,0,0,3,1,4] → 6", approach: "Track buy1,sell1,buy2,sell2 in one pass.", time: "O(n)", space: "O(1)", code: `class Solution {
    public int maxProfit(int[] prices) {
        int b1 = Integer.MAX_VALUE, b2 = Integer.MAX_VALUE, s1 = 0, s2 = 0;
        for (int p : prices) {
            b1 = Math.min(b1, p);
            s1 = Math.max(s1, p - b1);
            b2 = Math.min(b2, p - s1);
            s2 = Math.max(s2, p - b2);
        }
        return s2;
    }
}` },
      { title: "Burst Balloons", difficulty: "Hard", lc: "LC 312", priority: 0, statement: "Burst balloons to maximize coins = left*val*right.", example: "[3,1,5,8] → 167", approach: "Interval DP: last balloon to burst in range.", time: "O(n³)", space: "O(n²)", code: `class Solution {
    public int maxCoins(int[] nums) {
        int n = nums.length;
        int[] a = new int[n + 2];
        a[0] = a[n + 1] = 1;
        for (int i = 0; i < n; i++) a[i + 1] = nums[i];
        int[][] dp = new int[n + 2][n + 2];
        for (int len = 1; len <= n; len++)
            for (int i = 1; i <= n - len + 1; i++) {
                int j = i + len - 1;
                for (int k = i; k <= j; k++)
                    dp[i][j] = Math.max(dp[i][j], dp[i][k - 1] + a[i - 1] * a[k] * a[j + 1] + dp[k + 1][j]);
            }
        return dp[1][n];
    }
}` },
      { title: "Matrix Chain Multiplication", difficulty: "Hard", lc: "GFG", priority: 0, statement: "Min scalar multiplications for matrix chain.", example: "[10,20,30,40,30] → 30000", approach: "Interval DP on dim array.", time: "O(n³)", space: "O(n²)", code: `class Solution {
    public int matrixMultiplication(int[] arr) {
        int n = arr.length;
        int[][] dp = new int[n][n];
        for (int len = 2; len < n; len++)
            for (int i = 1; i <= n - len; i++) {
                int j = i + len - 1;
                dp[i][j] = Integer.MAX_VALUE;
                for (int k = i; k < j; k++)
                    dp[i][j] = Math.min(dp[i][j], dp[i][k] + dp[k + 1][j] + arr[i - 1] * arr[k] * arr[j]);
            }
        return dp[1][n - 1];
    }
}` },
      { title: "Maximal Rectangle", difficulty: "Hard", lc: "LC 85", priority: 0, statement: "Max area rectangle of 1s in binary matrix.", example: "matrix→area", approach: "Histogram heights per row + stack.", time: "O(m*n)", space: "O(n)", code: `class Solution {
    public int maximalRectangle(char[][] matrix) {
        if (matrix.length == 0) return 0;
        int n = matrix[0].length;
        int[] h = new int[n];
        int max = 0;
        for (char[] row : matrix) {
            for (int j = 0; j < n; j++) h[j] = row[j] == '1' ? h[j] + 1 : 0;
            max = Math.max(max, largestRect(h));
        }
        return max;
    }
    int largestRect(int[] h) {
        java.util.Deque<Integer> s = new java.util.ArrayDeque<>();
        int mx = 0;
        for (int i = 0; i <= h.length; i++) {
            int c = i == h.length ? 0 : h[i];
            while (!s.isEmpty() && c < h[s.peek()]) {
                int ht = h[s.pop()];
                int w = s.isEmpty() ? i : i - s.peek() - 1;
                mx = Math.max(mx, ht * w);
            }
            s.push(i);
        }
        return mx;
    }
}` },
      { title: "Minimum Cost to Cut a Stick", difficulty: "Hard", lc: "LC 1547", priority: 0, statement: "Cut stick at positions; pay segment length per cut; minimize total.", example: "n=7, cuts=[1,3,4,5] → 16", approach: "Sort cuts; interval DP on extended array.", time: "O(m³)", space: "O(m²)", code: `class Solution {
    public int minCost(int n, int[] cuts) {
        java.util.Arrays.sort(cuts);
        int m = cuts.length;
        int[] a = new int[m + 2];
        a[0] = 0;
        a[m + 1] = n;
        for (int i = 0; i < m; i++) a[i + 1] = cuts[i];
        int[][] dp = new int[m + 2][m + 2];
        for (int l = 2; l <= m + 1; l++)
            for (int i = 0; i + l <= m + 1; i++) {
                int j = i + l;
                dp[i][j] = Integer.MAX_VALUE;
                for (int k = i + 1; k < j; k++)
                    dp[i][j] = Math.min(dp[i][j], dp[i][k] + dp[k][j] + a[j] - a[i]);
            }
        return dp[0][m + 1];
    }
}` },
      { title: "Wildcard Matching", difficulty: "Hard", lc: "LC 44", priority: 0, statement: "? = one char; * = any sequence including empty.", example: "s='adceb', p='*a*b' → true", approach: "1D boolean DP on pattern.", time: "O(m*n)", space: "O(n)", code: `class Solution {
    public boolean isMatch(String s, String p) {
        int m = s.length(), n = p.length();
        boolean[] dp = new boolean[n + 1];
        dp[0] = true;
        for (int j = 1; j <= n; j++) dp[j] = p.charAt(j - 1) == '*' && dp[j - 1];
        for (int i = 1; i <= m; i++) {
            boolean prev = dp[0];
            dp[0] = false;
            for (int j = 1; j <= n; j++) {
                boolean t = dp[j];
                if (p.charAt(j - 1) == '*') dp[j] = dp[j] || dp[j - 1];
                else dp[j] = prev && (p.charAt(j - 1) == '?' || s.charAt(i - 1) == p.charAt(j - 1));
                prev = t;
            }
        }
        return dp[n];
    }
}` },
      { title: "0/1 Knapsack", difficulty: "Medium", lc: "GFG", priority: 0, statement: "Max value with weight limit W; each item once.", example: "W=4 → 55", approach: "Reverse w loop per item.", time: "O(n*W)", space: "O(W)", code: `class Solution {
    public int knapsack(int W, int[] wt, int[] val, int n) {
        int[] dp = new int[W + 1];
        for (int i = 0; i < n; i++)
            for (int w = W; w >= wt[i]; w--)
                dp[w] = Math.max(dp[w], val[i] + dp[w - wt[i]]);
        return dp[W];
    }
}` },
      { title: "Best Time to Buy and Sell Stock II", difficulty: "Medium", lc: "LC 122", priority: 0, statement: "Unlimited txns.", example: "[7,1,5,3,6,4] → 7", approach: "Sum uphill segments.", time: "O(n)", space: "O(1)", code: `class Solution {
    public int maxProfit(int[] prices) {
        int p = 0;
        for (int i = 1; i < prices.length; i++) if (prices[i] > prices[i - 1]) p += prices[i] - prices[i - 1];
        return p;
    }
}` },
      { title: "Best Time to Buy and Sell Stock with Cooldown", difficulty: "Medium", lc: "LC 309", priority: 0, statement: "Sell then wait 1 day before buy.", example: "[1,2,3,0,2] → 3", approach: "hold/sold/rest.", time: "O(n)", space: "O(1)", code: `class Solution {
    public int maxProfit(int[] prices) {
        int hold = Integer.MIN_VALUE, sold = 0, rest = 0;
        for (int p : prices) {
            int ps = sold;
            sold = hold + p;
            hold = Math.max(hold, rest - p);
            rest = Math.max(rest, ps);
        }
        return Math.max(sold, rest);
    }
}` },
      { title: "Coin Change", difficulty: "Medium", lc: "LC 322", priority: 0, statement: "Min coins for amount; -1 if impossible.", example: "amount=15 → 3", approach: "Unbounded min DP.", time: "O(n*amt)", space: "O(amt)", code: `class Solution {
    public int coinChange(int[] coins, int amount) {
        int[] dp = new int[amount + 1];
        java.util.Arrays.fill(dp, amount + 1);
        dp[0] = 0;
        for (int c : coins)
            for (int i = c; i <= amount; i++) dp[i] = Math.min(dp[i], dp[i - c] + 1);
        return dp[amount] > amount ? -1 : dp[amount];
    }
}` },
      { title: "Coin Change II", difficulty: "Medium", lc: "LC 518", priority: 0, statement: "Count combinations for amount.", example: "5 with [1,2,5] → 4", approach: "Outer coin loop.", time: "O(n*amt)", space: "O(amt)", code: `class Solution {
    public int change(int amount, int[] coins) {
        int[] dp = new int[amount + 1];
        dp[0] = 1;
        for (int c : coins)
            for (int i = c; i <= amount; i++) dp[i] += dp[i - c];
        return dp[amount];
    }
}` },
      { title: "Edit Distance", difficulty: "Medium", lc: "LC 72", priority: 0, statement: "Min ops insert/delete/replace.", example: "horse→ros → 3", approach: "Rolling DP.", time: "O(m*n)", space: "O(n)", code: `class Solution {
    public int minDistance(String w1, String w2) {
        int m = w1.length(), n = w2.length();
        int[] dp = new int[n + 1];
        for (int j = 0; j <= n; j++) dp[j] = j;
        for (int i = 1; i <= m; i++) {
            int prev = dp[0];
            dp[0] = i;
            for (int j = 1; j <= n; j++) {
                int t = dp[j];
                if (w1.charAt(i - 1) == w2.charAt(j - 1)) dp[j] = prev;
                else dp[j] = 1 + Math.min(prev, Math.min(dp[j], dp[j - 1]));
                prev = t;
            }
        }
        return dp[n];
    }
}` },
      { title: "Longest Common Subsequence", difficulty: "Medium", lc: "LC 1143", priority: 0, statement: "LCS length.", example: "abcde, ace → 3", approach: "Rolling 1D.", time: "O(m*n)", space: "O(n)", code: `class Solution {
    public int longestCommonSubsequence(String s1, String s2) {
        int m = s1.length(), n = s2.length();
        int[] dp = new int[n + 1];
        for (int i = 1; i <= m; i++) {
            int prev = 0;
            for (int j = 1; j <= n; j++) {
                int t = dp[j];
                if (s1.charAt(i - 1) == s2.charAt(j - 1)) dp[j] = prev + 1;
                else dp[j] = Math.max(dp[j], dp[j - 1]);
                prev = t;
            }
        }
        return dp[n];
    }
}` },
      { title: "Longest Increasing Subsequence", difficulty: "Medium", lc: "LC 300", priority: 0, statement: "LIS length (patience / BS).", example: "→ 4", approach: "tails array + binary search.", time: "O(n log n)", space: "O(n)", code: `class Solution {
    public int lengthOfLIS(int[] nums) {
        int[] t = new int[nums.length];
        int sz = 0;
        for (int x : nums) {
            int lo = 0, hi = sz;
            while (lo < hi) {
                int m = (lo + hi) >>> 1;
                if (t[m] < x) lo = m + 1;
                else hi = m;
            }
            t[lo] = x;
            if (lo == sz) sz++;
        }
        return sz;
    }
}` },
      { title: "Longest Palindromic Subsequence", difficulty: "Medium", lc: "LC 516", priority: 0, statement: "LPS length.", example: "bbbab → 4", approach: "LCS(s, rev(s)).", time: "O(n²)", space: "O(n)", code: `class Solution {
    public int longestPalindromeSubseq(String s) {
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
}` },
      { title: "Longest Palindromic Substring", difficulty: "Medium", lc: "LC 5", priority: 0, statement: "Longest palindromic substring.", example: "babad", approach: "Expand centers.", time: "O(n²)", space: "O(1)", code: `class Solution {
    int st = 0, mx = 0;
    public String longestPalindrome(String s) {
        for (int i = 0; i < s.length(); i++) {
            expand(s, i, i);
            expand(s, i, i + 1);
        }
        return s.substring(st, st + mx);
    }
    void expand(String s, int l, int r) {
        while (l >= 0 && r < s.length() && s.charAt(l) == s.charAt(r)) {
            l--;
            r++;
        }
        if (r - l - 1 > mx) {
            st = l + 1;
            mx = r - l - 1;
        }
    }
}` },
      { title: "Partition Equal Subset Sum", difficulty: "Medium", lc: "LC 416", priority: 0, statement: "Split into two subsets of equal sum.", example: "[1,5,11,5] → true", approach: "Boolean subset-sum to total/2.", time: "O(n*sum)", space: "O(sum)", code: `class Solution {
    public boolean canPartition(int[] nums) {
        int sum = 0;
        for (int x : nums) sum += x;
        if ((sum & 1) == 1) return false;
        int t = sum / 2;
        boolean[] dp = new boolean[t + 1];
        dp[0] = true;
        for (int x : nums)
            for (int j = t; j >= x; j--) dp[j] = dp[j] || dp[j - x];
        return dp[t];
    }
}` },
      { title: "Target Sum", difficulty: "Medium", lc: "LC 494", priority: 0, statement: "Assign +/- to reach target; count ways.", example: "target=3 → 5", approach: "Subset sum (tot+target)/2.", time: "O(n*sum)", space: "O(sum)", code: `class Solution {
    public int findTargetSumWays(int[] nums, int target) {
        int sum = 0;
        for (int x : nums) sum += x;
        if ((sum + target) % 2 != 0 || sum < Math.abs(target)) return 0;
        int s = (sum + target) / 2;
        int[] dp = new int[s + 1];
        dp[0] = 1;
        for (int x : nums)
            for (int j = s; j >= x; j--) dp[j] += dp[j - x];
        return dp[s];
    }
}` },
      { title: "Unbounded Knapsack", difficulty: "Medium", lc: "GFG", priority: 0, statement: "Unlimited uses per item; max value.", example: "Classic", approach: "Forward w loop.", time: "O(n*W)", space: "O(W)", code: `class Solution {
    public int unboundedKnapsack(int W, int[] wt, int[] val, int n) {
        int[] dp = new int[W + 1];
        for (int i = 0; i < n; i++)
            for (int w = wt[i]; w <= W; w++) dp[w] = Math.max(dp[w], dp[w - wt[i]] + val[i]);
        return dp[W];
    }
}` },
      { title: "Word Break", difficulty: "Medium", lc: "LC 139", priority: 0, statement: "Segment string with dict words.", example: "leetcode", approach: "dp[i] reachable.", time: "O(n²·L)", space: "O(n)", code: `class Solution {
    public boolean wordBreak(String s, java.util.List<String> wordDict) {
        java.util.Set<String> st = new java.util.HashSet<>(wordDict);
        boolean[] dp = new boolean[s.length() + 1];
        dp[0] = true;
        for (int i = 1; i <= s.length(); i++)
            for (int j = 0; j < i; j++)
                if (dp[j] && st.contains(s.substring(j, i))) {
                    dp[i] = true;
                    break;
                }
        return dp[s.length()];
    }
}` },
      { title: "Best Time to Buy and Sell Stock I", difficulty: "Easy", lc: "LC 121", priority: 0, statement: "One txn max profit.", example: "→ 5", approach: "min prefix.", time: "O(n)", space: "O(1)", code: `class Solution {
    public int maxProfit(int[] prices) {
        int mn = Integer.MAX_VALUE, ans = 0;
        for (int p : prices) {
            mn = Math.min(mn, p);
            ans = Math.max(ans, p - mn);
        }
        return ans;
    }
}` },
      { title: "Best Time to Buy and Sell Stock IV", difficulty: "Hard", lc: "LC 188", priority: 1, statement: "At most k transactions.", example: "k=2", approach: "Generalize stock III.", time: "O(n*k)", space: "O(k)", code: `class Solution {
    public int maxProfit(int k, int[] prices) {
        int n = prices.length;
        if (k >= n / 2) {
            int p = 0;
            for (int i = 1; i < n; i++) if (prices[i] > prices[i - 1]) p += prices[i] - prices[i - 1];
            return p;
        }
        int[] buy = new int[k + 1], sell = new int[k + 1];
        java.util.Arrays.fill(buy, Integer.MAX_VALUE);
        for (int p : prices)
            for (int j = 1; j <= k; j++) {
                buy[j] = Math.min(buy[j], p - sell[j - 1]);
                sell[j] = Math.max(sell[j], p - buy[j]);
            }
        return sell[k];
    }
}` },
      { title: "Cherry Pickup II", difficulty: "Hard", lc: "LC 1463", priority: 1, statement: "Two robots TL→BR max cherries.", example: "→24", approach: "3D DP on row+c1+c2.", time: "O(mn²)", space: "O(n²)", code: `class Solution {
    public int cherryPickup(int[][] g) {
        int m = g.length, n = g[0].length;
        int[][] dp = new int[n][n];
        for (int[] r : dp) java.util.Arrays.fill(r, Integer.MIN_VALUE / 4);
        dp[0][n - 1] = g[0][0] + g[0][n - 1];
        for (int i = 1; i < m; i++) {
            int[][] nd = new int[n][n];
            for (int[] r : nd) java.util.Arrays.fill(r, Integer.MIN_VALUE / 4);
            for (int a = 0; a < n; a++)
                for (int b = 0; b < n; b++)
                    for (int da = -1; da <= 1; da++)
                        for (int db = -1; db <= 1; db++) {
                            int pa = a + da, pb = b + db;
                            if (pa < 0 || pb < 0 || pa >= n || pb >= n) continue;
                            int add = g[i][a] + (a == b ? 0 : g[i][b]);
                            nd[a][b] = Math.max(nd[a][b], dp[pa][pb] + add);
                        }
            dp = nd;
        }
        int ans = 0;
        for (int[] r : dp) for (int v : r) ans = Math.max(ans, v);
        return ans;
    }
}` },
      { title: "Distinct Subsequences", difficulty: "Hard", lc: "LC 115", priority: 1, statement: "Count subsequences of s equal to t.", example: "rabbbit,rabbit→3", approach: "1D DP on t.", time: "O(m*n)", space: "O(n)", code: `class Solution {
    public int numDistinct(String s, String t) {
        int n = t.length();
        long[] dp = new long[n + 1];
        dp[0] = 1;
        for (int i = 0; i < s.length(); i++)
            for (int j = n; j >= 1; j--)
                if (s.charAt(i) == t.charAt(j - 1)) dp[j] += dp[j - 1];
        return (int) dp[n];
    }
}` },
      { title: "Evaluate Boolean Expression to True", difficulty: "Hard", lc: "GFG", priority: 1, statement: "Count parenthesizations yielding true.", example: "T|F&T", approach: "Interval DP 3 states.", time: "O(n³)", space: "O(n²)", code: `class Solution {
    static int countWays(int n, String s) {
        return ways(s, 0, n - 1, true, new Integer[n][n][2]);
    }
    static int ways(String s, int i, int j, boolean T, Integer[][][] mem) {
        if (i > j) return T ? 0 : 1;
        if (i == j) return (T == (s.charAt(i) == 'T')) ? 1 : 0;
        int k0 = T ? 1 : 0;
        if (mem[i][j][k0] != null) return mem[i][j][k0];
        int c = 0, mod = 1003;
        for (int k = i + 1; k < j; k += 2) {
            char op = s.charAt(k);
            int lt = ways(s, i, k - 1, true, mem), lf = ways(s, i, k - 1, false, mem);
            int rt = ways(s, k + 1, j, true, mem), rf = ways(s, k + 1, j, false, mem);
            int tt = lt * rt, tf = lt * rf, ft = lf * rt, ff = lf * rf;
            if (op == '&') c += T ? tt : (tf + ft + ff);
            else if (op == '|') c += T ? (tt + tf + ft) : ff;
            else c += T ? (tf + ft) : (tt + ff);
            c %= mod;
        }
        mem[i][j][k0] = c;
        return c;
    }
}` },
      { title: "Minimum Insertion Steps to Make a String Palindrome", difficulty: "Hard", lc: "LC 1312", priority: 1, statement: "Min insertions for palindrome.", example: "leetcode→5", approach: "n - LPS(s).", time: "O(n²)", space: "O(n)", code: `class Solution {
    public int minInsertions(String s) {
        return s.length() - lps(s);
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
}` },
      { title: "Minimum/Maximum Falling Path Sum", difficulty: "Hard", lc: "LC 931, DP-12", priority: 1, statement: "Min (or max) sum falling path in n×n matrix.", example: "Var", approach: "Prev row min/max of 3 below.", time: "O(n²)", space: "O(n)", code: `class Solution {
    public int minFallingPathSum(int[][] m) {
        int n = m.length;
        for (int i = 1; i < n; i++)
            for (int j = 0; j < n; j++) {
                int v = m[i - 1][j];
                if (j > 0) v = Math.min(v, m[i - 1][j - 1]);
                if (j + 1 < n) v = Math.min(v, m[i - 1][j + 1]);
                m[i][j] += v;
            }
        int r = m[n - 1][0];
        for (int j = 1; j < n; j++) r = Math.min(r, m[n - 1][j]);
        return r;
    }
}` },
      { title: "Palindrome Partitioning II", difficulty: "Hard", lc: "LC 132", priority: 1, statement: "Min cuts for all palindrome parts.", example: "aab→1", approach: "pal table + dp.", time: "O(n²)", space: "O(n)", code: `class Solution {
    public int minCut(String s) {
        int n = s.length();
        boolean[][] pal = new boolean[n][n];
        for (int i = n - 1; i >= 0; i--)
            for (int j = i; j < n; j++)
                pal[i][j] = s.charAt(i) == s.charAt(j) && (j - i < 2 || pal[i + 1][j - 1]);
        int[] dp = new int[n];
        java.util.Arrays.fill(dp, Integer.MAX_VALUE);
        for (int i = 0; i < n; i++) {
            if (pal[0][i]) {
                dp[i] = 0;
                continue;
            }
            for (int j = 1; j <= i; j++) if (pal[j][i]) dp[i] = Math.min(dp[i], dp[j - 1] + 1);
        }
        return dp[n - 1];
    }
}` },
      { title: "Shortest Common Supersequence", difficulty: "Hard", lc: "LC 1092", priority: 1, statement: "Shortest string containing both as subseq.", example: "cabac", approach: "LCS traceback.", time: "O(m*n)", space: "O(m*n)", code: `class Solution {
    public String shortestCommonSupersequence(String s1, String s2) {
        int m = s1.length(), n = s2.length();
        int[][] dp = new int[m + 1][n + 1];
        for (int i = 1; i <= m; i++)
            for (int j = 1; j <= n; j++)
                dp[i][j] = s1.charAt(i - 1) == s2.charAt(j - 1) ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
        StringBuilder sb = new StringBuilder();
        int i = m, j = n;
        while (i > 0 && j > 0) {
            if (s1.charAt(i - 1) == s2.charAt(j - 1)) {
                sb.append(s1.charAt(i - 1));
                i--;
                j--;
            } else if (dp[i - 1][j] > dp[i][j - 1]) sb.append(s1.charAt(--i));
            else sb.append(s2.charAt(--j));
        }
        while (i > 0) sb.append(s1.charAt(--i));
        while (j > 0) sb.append(s2.charAt(--j));
        return sb.reverse().toString();
    }
}` },
      { title: "Best Time to Buy and Sell Stock with Transaction Fee", difficulty: "Medium", lc: "LC 714", priority: 1, statement: "Unlimited txns with fee.", example: "fee=2→8", approach: "hold/cash states.", time: "O(n)", space: "O(1)", code: `class Solution {
    public int maxProfit(int[] prices, int fee) {
        int hold = -prices[0], cash = 0;
        for (int p : prices) {
            cash = Math.max(cash, hold + p - fee);
            hold = Math.max(hold, cash - p);
        }
        return cash;
    }
}` },
      { title: "Count Partitions With Given Difference", difficulty: "Medium", lc: "GFG", priority: 1, statement: "Partitions with |S1-S2|=d.", example: "Var", approach: "Reduce to subset count.", time: "O(n*s2)", space: "O(s2)", code: `class Solution {
    public int countPartitions(int[] a, int d) {
        int s = 0;
        for (int x : a) s += x;
        if ((s + d) % 2 != 0 || s < d) return 0;
        int t = (s + d) / 2;
        int[] dp = new int[t + 1];
        dp[0] = 1;
        for (int x : a)
            for (int j = t; j >= x; j--) dp[j] += dp[j - x];
        return dp[t];
    }
}` },
      { title: "Count Square Submatrices With All Ones", difficulty: "Medium", lc: "LC 1277", priority: 1, statement: "Count all-1 squares.", example: "Var", approach: "dp side len.", time: "O(m*n)", space: "O(1)", code: `class Solution {
    public int countSquares(int[][] m) {
        int r = m.length, c = m[0].length, res = 0;
        for (int i = 0; i < r; i++)
            for (int j = 0; j < c; j++)
                if (m[i][j] == 1) {
                    if (i > 0 && j > 0)
                        m[i][j] += Math.min(m[i - 1][j - 1], Math.min(m[i - 1][j], m[i][j - 1]));
                    res += m[i][j];
                }
        return res;
    }
}` },
      { title: "Count Subsets With Sum K", difficulty: "Medium", lc: "GFG", priority: 1, statement: "Count subsets with exact sum.", example: "Var", approach: "1D count DP mod 1e9+7.", time: "O(n*k)", space: "O(k)", code: `class Solution {
    public int perfectSum(int[] a, int t) {
        int mod = 1000000007;
        int[] dp = new int[t + 1];
        dp[0] = 1;
        for (int x : a)
            for (int j = t; j >= x; j--) dp[j] = (dp[j] + dp[j - x]) % mod;
        return dp[t];
    }
}` },
      { title: "Decode Ways", difficulty: "Medium", lc: "LC 91", priority: 1, statement: "Ways to decode A..Z string.", example: "226→3", approach: "Fibonacci-like.", time: "O(n)", space: "O(1)", code: `class Solution {
    public int numDecodings(String s) {
        if (s.charAt(0) == '0') return 0;
        int a = 1, b = 1;
        for (int i = 1; i < s.length(); i++) {
            int c = 0;
            if (s.charAt(i) != '0') c = b;
            int two = (s.charAt(i - 1) - '0') * 10 + (s.charAt(i) - '0');
            if (two >= 10 && two <= 26) c += a;
            a = b;
            b = c;
        }
        return b;
    }
}` },
      { title: "House Robber", difficulty: "Medium", lc: "LC 198", priority: 1, statement: "Non-adjacent houses max sum.", example: "[2,7,9,3,1]→12", approach: "prev2/prev1", time: "O(n)", space: "O(1)", code: `class Solution {
    public int rob(int[] nums) {
        int a = 0, b = 0;
        for (int x : nums) {
            int c = Math.max(b, a + x);
            a = b;
            b = c;
        }
        return b;
    }
}` },
      { title: "House Robber II", difficulty: "Medium", lc: "LC 213", priority: 1, statement: "Circular street.", example: "[2,3,2]→3", approach: "Rob twice on ranges.", time: "O(n)", space: "O(1)", code: `class Solution {
    public int rob(int[] nums) {
        int n = nums.length;
        if (n == 1) return nums[0];
        return Math.max(rob(nums, 0, n - 2), rob(nums, 1, n - 1));
    }
    int rob(int[] a, int lo, int hi) {
        int p2 = 0, p1 = 0;
        for (int i = lo; i <= hi; i++) {
            int c = Math.max(p1, p2 + a[i]);
            p2 = p1;
            p1 = c;
        }
        return p1;
    }
}` },
      { title: "Largest Divisible Subset", difficulty: "Medium", lc: "LC 368", priority: 1, statement: "Largest subset with divisibility chain.", example: "Var", approach: "Sort + LIS variant.", time: "O(n²)", space: "O(n)", code: `class Solution {
    public java.util.List<Integer> largestDivisibleSubset(int[] nums) {
        java.util.Arrays.sort(nums);
        int n = nums.length;
        int[] dp = new int[n], par = new int[n];
        java.util.Arrays.fill(dp, 1);
        java.util.Arrays.fill(par, -1);
        int mx = 0, bi = 0;
        for (int i = 1; i < n; i++) {
            for (int j = 0; j < i; j++)
                if (nums[i] % nums[j] == 0 && dp[j] + 1 > dp[i]) {
                    dp[i] = dp[j] + 1;
                    par[i] = j;
                }
            if (dp[i] > mx) {
                mx = dp[i];
                bi = i;
            }
        }
        java.util.List<Integer> res = new java.util.ArrayList<>();
        for (int i = bi; i != -1; i = par[i]) res.add(0, nums[i]);
        return res;
    }
}` },
      { title: "Longest Common Substring", difficulty: "Medium", lc: "GFG", priority: 1, statement: "Longest contiguous common substring.", example: "Var", approach: "Rolling 2D.", time: "O(m*n)", space: "O(n)", code: `class Solution {
    public int longestCommonSubstr(String s1, String s2) {
        int m = s1.length(), n = s2.length(), mx = 0;
        int[] dp = new int[n + 1];
        for (int i = 1; i <= m; i++)
            for (int j = n; j >= 1; j--) {
                if (s1.charAt(i - 1) == s2.charAt(j - 1)) {
                    dp[j] = dp[j - 1] + 1;
                    mx = Math.max(mx, dp[j]);
                } else dp[j] = 0;
            }
        return mx;
    }
}` },
      { title: "Longest String Chain", difficulty: "Medium", lc: "LC 1048", priority: 1, statement: "Longest chain by one-char insert.", example: "Var", approach: "Sort len + map DP.", time: "O(nL²)", space: "O(n)", code: `class Solution {
    public int longestStrChain(String[] words) {
        java.util.Arrays.sort(words, (a, b) -> a.length() - b.length());
        java.util.Map<String, Integer> dp = new java.util.HashMap<>();
        int res = 1;
        for (String w : words) {
            int best = 1;
            for (int i = 0; i < w.length(); i++) {
                String pred = w.substring(0, i) + w.substring(i + 1);
                best = Math.max(best, dp.getOrDefault(pred, 0) + 1);
            }
            dp.put(w, best);
            res = Math.max(res, best);
        }
        return res;
    }
}` },
      { title: "Minimum Path Sum", difficulty: "Medium", lc: "LC 64", priority: 1, statement: "Min sum path TL→BR.", example: "→7", approach: "Rolling row.", time: "O(m*n)", space: "O(n)", code: `class Solution {
    public int minPathSum(int[][] g) {
        int m = g.length, n = g[0].length;
        int[] dp = new int[n];
        dp[0] = g[0][0];
        for (int j = 1; j < n; j++) dp[j] = dp[j - 1] + g[0][j];
        for (int i = 1; i < m; i++) {
            dp[0] += g[i][0];
            for (int j = 1; j < n; j++) dp[j] = Math.min(dp[j], dp[j - 1]) + g[i][j];
        }
        return dp[n - 1];
    }
}` },
      { title: "Number of Longest Increasing Subsequence", difficulty: "Medium", lc: "LC 673", priority: 1, statement: "Count LIS.", example: "Var", approach: "len+cnt arrays.", time: "O(n²)", space: "O(n)", code: `class Solution {
    public int findNumberOfLIS(int[] a) {
        int n = a.length, best = 0, ans = 0;
        int[] len = new int[n], cnt = new int[n];
        for (int i = 0; i < n; i++) {
            len[i] = cnt[i] = 1;
            for (int j = 0; j < i; j++)
                if (a[j] < a[i]) {
                    if (len[j] + 1 > len[i]) {
                        len[i] = len[j] + 1;
                        cnt[i] = cnt[j];
                    } else if (len[j] + 1 == len[i]) cnt[i] += cnt[j];
                }
            if (len[i] > best) {
                best = len[i];
                ans = cnt[i];
            } else if (len[i] == best) ans += cnt[i];
        }
        return ans;
    }
}` },
      { title: "Partition Array for Maximum Sum", difficulty: "Medium", lc: "LC 1043", priority: 1, statement: "Partition len≤k maximize sum of max*k.", example: "→84", approach: "dp[i] best prefix.", time: "O(n*k)", space: "O(n)", code: `class Solution {
    public int maxSumAfterPartitioning(int[] arr, int k) {
        int n = arr.length;
        int[] dp = new int[n + 1];
        for (int i = 1; i <= n; i++) {
            int mx = 0;
            for (int j = 1; j <= Math.min(i, k); j++) {
                mx = Math.max(mx, arr[i - j]);
                dp[i] = Math.max(dp[i], dp[i - j] + mx * j);
            }
        }
        return dp[n];
    }
}` },
      { title: "Partition Set Into Two Subsets With Min Absolute Sum Diff", difficulty: "Medium", lc: "GFG", priority: 1, statement: "Min |sum(S1)-sum(S2)|.", example: "Var", approach: "Subset sums up to sum/2.", time: "O(n*sum)", space: "O(sum)", code: `class Solution {
    public int minDifference(int[] a) {
        int s = 0;
        for (int x : a) s += x;
        int h = s / 2;
        boolean[] dp = new boolean[h + 1];
        dp[0] = true;
        for (int x : a)
            for (int j = h; j >= x; j--) dp[j] |= dp[j - x];
        int s1 = 0;
        for (int j = h; j >= 0; j--)
            if (dp[j]) {
                s1 = j;
                break;
            }
        return Math.abs(s - 2 * s1);
    }
}` },
      { title: "Print LIS", difficulty: "Medium", lc: "GFG", priority: 1, statement: "Print one LIS.", example: "Var", approach: "O(n²) + parent.", time: "O(n²)", space: "O(n)", code: `class Solution {
    public java.util.List<Integer> printLIS(int[] nums) {
        int n = nums.length;
        int[] dp = new int[n], par = new int[n];
        java.util.Arrays.fill(dp, 1);
        java.util.Arrays.fill(par, -1);
        int bi = 0;
        for (int i = 1; i < n; i++) {
            for (int j = 0; j < i; j++)
                if (nums[j] < nums[i] && dp[j] + 1 > dp[i]) {
                    dp[i] = dp[j] + 1;
                    par[i] = j;
                }
            if (dp[i] > dp[bi]) bi = i;
        }
        java.util.List<Integer> res = new java.util.ArrayList<>();
        for (int i = bi; i != -1; i = par[i]) res.add(0, nums[i]);
        return res;
    }
}` },
      { title: "Rod Cutting", difficulty: "Medium", lc: "GFG", priority: 1, statement: "Max revenue for rod cuts.", example: "n=8→22", approach: "Unbounded knapsack on lengths.", time: "O(n²)", space: "O(n)", code: `class Solution {
    public int cutRod(int[] price, int n) {
        int[] dp = new int[n + 1];
        for (int i = 1; i <= n; i++)
            for (int j = 1; j <= i; j++) dp[i] = Math.max(dp[i], price[j - 1] + dp[i - j]);
        return dp[n];
    }
}` },
      { title: "Subset Sum Equal to Target", difficulty: "Medium", lc: "GFG", priority: 1, statement: "Exists subset summing to k.", example: "Var", approach: "Boolean knapsack.", time: "O(n*k)", space: "O(k)", code: `class Solution {
    static boolean isSubsetSum(int n, int[] a, int t) {
        boolean[] dp = new boolean[t + 1];
        dp[0] = true;
        for (int x : a)
            for (int j = t; j >= x; j--) dp[j] |= dp[j - x];
        return dp[t];
    }
}` },
      { title: "Triangle", difficulty: "Medium", lc: "LC 120", priority: 1, statement: "Min path sum top→base.", example: "→11", approach: "Bottom-up 1D.", time: "O(n²)", space: "O(n)", code: `class Solution {
    public int minimumTotal(java.util.List<java.util.List<Integer>> tri) {
        int n = tri.size();
        int[] dp = new int[n];
        for (int j = 0; j < n; j++) dp[j] = tri.get(n - 1).get(j);
        for (int i = n - 2; i >= 0; i--)
            for (int j = 0; j <= i; j++) dp[j] = tri.get(i).get(j) + Math.min(dp[j], dp[j + 1]);
        return dp[0];
    }
}` },
      { title: "Unique Paths", difficulty: "Medium", lc: "LC 62", priority: 1, statement: "Grid right/down paths count.", example: "m=3,n=7→28", approach: "1D DP.", time: "O(m*n)", space: "O(n)", code: `class Solution {
    public int uniquePaths(int m, int n) {
        int[] dp = new int[n];
        java.util.Arrays.fill(dp, 1);
        for (int i = 1; i < m; i++)
            for (int j = 1; j < n; j++) dp[j] += dp[j - 1];
        return dp[n - 1];
    }
}` },
      { title: "Minimum Insertions/Deletions to Convert String a to b", difficulty: "Hard", lc: "GFG", priority: 2, statement: "Min ops a→b.", example: "Var", approach: "m+n-2*LCS.", time: "O(m*n)", space: "O(m*n)", code: `class Solution {
    public int minOperations(String str1, String str2) {
        // TODO: Implement
    }
}` },
      { title: "Longest Bitonic Subsequence", difficulty: "Medium", lc: "GFG", priority: 2, statement: "Longest bitonic subsequence length.", example: "Var", approach: "LIS from both ends.", time: "O(n²)", space: "O(n)", code: `class Solution {
    public int LongestBitonicSequence(int[] nums) {
        // TODO: Implement
    }
}` },
      { title: "Ninja Training", difficulty: "Medium", lc: "GFG", priority: 2, statement: "3 tasks per day; no same task consecutive; max points.", example: "Var", approach: "Grid DP.", time: "O(n*4)", space: "O(4)", code: `class Solution {
    public int maximumPoints(int[][] points, int n) {
        // TODO: Implement
    }
}` },
      { title: "Print LCS", difficulty: "Medium", lc: "GFG", priority: 2, statement: "Print any LCS string.", example: "Var", approach: "Backtrack LCS table.", time: "O(m*n)", space: "O(m*n)", code: `class Solution {
    public static String printLCS(int x, int y, String s1, String s2) {
        // TODO: Implement
    }
}` },
      { title: "Unique Paths II", difficulty: "Medium", lc: "LC 63", priority: 2, statement: "Paths with obstacles.", example: "Var", approach: "Grid DP skip 1.", time: "O(m*n)", space: "O(n)", code: `class Solution {
    public int uniquePathsWithObstacles(int[][] obstacleGrid) {
        // TODO: Implement
    }
}` },
      { title: "Climbing Stairs", difficulty: "Easy", lc: "LC 70", priority: 2, statement: "Ways to climb n with 1–2 steps.", example: "n=3→3", approach: "Fibonacci.", time: "O(n)", space: "O(1)", code: `class Solution {
    public int climbStairs(int n) {
        // TODO: Implement
    }
}` },
      { title: "Frog Jump", difficulty: "Easy", lc: "GFG", priority: 2, statement: "Min energy last stone; jumps 1–2.", example: "Var", approach: "dp[i]=min from i-1,i-2.", time: "O(n)", space: "O(1)", code: `class Solution {
    public int minimizeCost(int[] height, int n) {
        // TODO: Implement
    }
}` },
      { title: "Minimum Cost Climbing Stairs", difficulty: "Easy", lc: "LC 746", priority: 2, statement: "Min cost reach top from 0/1.", example: "[10,15,20]→15", approach: "dp[i]=min+step cost.", time: "O(n)", space: "O(1)", code: `class Solution {
    public int minCostClimbingStairs(int[] cost) {
        // TODO: Implement
    }
}` },
      { title: "Frog Jump With K Distances", difficulty: "Hard", lc: "GFG", priority: 3, statement: "Min cost last index; jump ≤k.", example: "Var", approach: "dp[i]=min over k preds.", time: "O(n*k)", space: "O(n)", code: `class Solution {
    public int minimizeCost(int[] height, int n, int k) {
        // TODO: Implement
    }
}` }
    ]
  },
  {
    id: "graphs",
    name: "Graphs",
    icon: "⬡",
    topicPriority: 2,
    accent: "#34d399",
    description: "BFS/DFS, topological sort, shortest paths, union-find. Very common at Google/Meta.",
    problems: [
      { title: "Alien Dictionary", difficulty: "Hard", lc: "LC 269/GFG", priority: 0, statement: "Lex order from sorted words.", example: "wertf", approach: "Graph + topo.", time: "O(C)", space: "O(1)", code: `class Solution {
    public String alienOrder(String[] words) {
        java.util.Map<Character, java.util.Set<Character>> adj = new java.util.HashMap<>();
        java.util.Map<Character, Integer> indeg = new java.util.HashMap<>();
        for (String w : words)
            for (char c : w.toCharArray()) {
                adj.putIfAbsent(c, new java.util.HashSet<>());
                indeg.putIfAbsent(c, 0);
            }
        for (int i = 0; i < words.length - 1; i++) {
            String w1 = words[i], w2 = words[i + 1];
            if (w1.length() > w2.length() && w1.startsWith(w2)) return "";
            for (int j = 0; j < Math.min(w1.length(), w2.length()); j++)
                if (w1.charAt(j) != w2.charAt(j)) {
                    if (adj.get(w1.charAt(j)).add(w2.charAt(j))) indeg.merge(w2.charAt(j), 1, Integer::sum);
                    break;
                }
        }
        java.util.Queue<Character> q = new java.util.LinkedList<>();
        for (java.util.Map.Entry<Character, Integer> e : indeg.entrySet()) if (e.getValue() == 0) q.offer(e.getKey());
        StringBuilder sb = new StringBuilder();
        while (!q.isEmpty()) {
            char c = q.poll();
            sb.append(c);
            for (char nb : adj.get(c)) if (indeg.merge(nb, -1, Integer::sum) == 0) q.offer(nb);
        }
        return sb.length() == indeg.size() ? sb.toString() : "";
    }
}` },
      { title: "Critical Connections in a Network", difficulty: "Hard", lc: "LC 1192", priority: 0, statement: "Bridges in undirected graph.", example: "Var", approach: "Tarjan disc/low.", time: "O(V+E)", space: "O(V)", code: `class Solution {
    int T = 0;
    public java.util.List<java.util.List<Integer>> criticalConnections(int n, java.util.List<java.util.List<Integer>> adj) {
        int[] disc = new int[n], low = new int[n];
        java.util.Arrays.fill(disc, -1);
        java.util.List<java.util.List<Integer>> res = new java.util.ArrayList<>();
        for (int i = 0; i < n; i++) if (disc[i] == -1) dfs(adj, i, -1, disc, low, res);
        return res;
    }
    void dfs(java.util.List<java.util.List<Integer>> adj, int u, int p, int[] disc, int[] low, java.util.List<java.util.List<Integer>> res) {
        disc[u] = low[u] = T++;
        for (int v : adj.get(u)) {
            if (v == p) continue;
            if (disc[v] == -1) {
                dfs(adj, v, u, disc, low, res);
                low[u] = Math.min(low[u], low[v]);
                if (low[v] > disc[u]) res.add(java.util.Arrays.asList(u, v));
            } else low[u] = Math.min(low[u], disc[v]);
        }
    }
}` },
      { title: "Making a Large Island", difficulty: "Hard", lc: "LC 827", priority: 0, statement: "Change at most one 0 to 1; max island.", example: "Var", approach: "DSU sizes + merge.", time: "O(n²)", space: "O(n²)", code: `class Solution {
    int[] p, sz;
    public int largestIsland(int[][] g) {
        int n = g.length, N = n * n;
        p = new int[N];
        sz = new int[N];
        for (int i = 0; i < N; i++) p[i] = -1;
        for (int i = 0; i < n; i++)
            for (int j = 0; j < n; j++)
                if (g[i][j] == 1) {
                    p[i * n + j] = i * n + j;
                    sz[i * n + j] = 1;
                }
        for (int i = 0; i < n; i++)
            for (int j = 0; j < n; j++)
                if (g[i][j] == 1) {
                    if (i + 1 < n && g[i + 1][j] == 1) union(i * n + j, (i + 1) * n + j);
                    if (j + 1 < n && g[i][j + 1] == 1) union(i * n + j, i * n + j + 1);
                }
        int best = 0;
        for (int i = 0; i < N; i++)
            if (p[i] == i) best = Math.max(best, sz[i]);
        for (int i = 0; i < n; i++)
            for (int j = 0; j < n; j++)
                if (g[i][j] == 0) {
                    java.util.Set<Integer> seen = new java.util.HashSet<>();
                    int sum = 1;
                    for (int[] d : new int[][] {{1, 0}, {-1, 0}, {0, 1}, {0, -1}}) {
                        int ni = i + d[0], nj = j + d[1];
                        if (ni >= 0 && ni < n && nj >= 0 && nj < n && g[ni][nj] == 1) {
                            int r = find(ni * n + nj);
                            if (seen.add(r)) sum += sz[r];
                        }
                    }
                    best = Math.max(best, sum);
                }
        return best;
    }
    int find(int x) {
        return p[x] == x ? x : (p[x] = find(p[x]));
    }
    void union(int a, int b) {
        a = find(a);
        b = find(b);
        if (a == b) return;
        if (sz[a] < sz[b]) {
            int t = a;
            a = b;
            b = t;
        }
        p[b] = a;
        sz[a] += sz[b];
    }
}` },
      { title: "Swim in Rising Water", difficulty: "Hard", lc: "LC 778", priority: 0, statement: "Min time reach BR when water rises uniformly.", example: "Var", approach: "Dijkstra on max-so-far.", time: "O(n² log n)", space: "O(n²)", code: `class Solution {
    public int swimInWater(int[][] g) {
        int n = g.length;
        boolean[][] v = new boolean[n][n];
        java.util.PriorityQueue<int[]> pq = new java.util.PriorityQueue<>((a, b) -> a[0] - b[0]);
        pq.offer(new int[] {g[0][0], 0, 0});
        v[0][0] = true;
        int[][] d = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
        while (!pq.isEmpty()) {
            int[] c = pq.poll();
            if (c[1] == n - 1 && c[2] == n - 1) return c[0];
            for (int[] t : d) {
                int ni = c[1] + t[0], nj = c[2] + t[1];
                if (ni >= 0 && ni < n && nj >= 0 && nj < n && !v[ni][nj]) {
                    v[ni][nj] = true;
                    pq.offer(new int[] {Math.max(c[0], g[ni][nj]), ni, nj});
                }
            }
        }
        return 0;
    }
}` },
      { title: "Word Ladder I", difficulty: "Hard", lc: "LC 127", priority: 0, statement: "Shortest transformation sequence length.", example: "hit→cog", approach: "BFS + neighbor gen.", time: "O(N·L²)", space: "O(N)", code: `class Solution {
    public int ladderLength(String beginWord, String endWord, java.util.List<String> wordList) {
        java.util.Set<String> dict = new java.util.HashSet<>(wordList);
        if (!dict.contains(endWord)) return 0;
        java.util.Queue<String> q = new java.util.LinkedList<>();
        q.offer(beginWord);
        int steps = 1;
        while (!q.isEmpty()) {
            int sz = q.size();
            for (int i = 0; i < sz; i++) {
                String w = q.poll();
                if (w.equals(endWord)) return steps;
                char[] ch = w.toCharArray();
                for (int j = 0; j < ch.length; j++) {
                    char o = ch[j];
                    for (char c = 'a'; c <= 'z'; c++) {
                        ch[j] = c;
                        String nw = new String(ch);
                        if (dict.contains(nw)) {
                            if (nw.equals(endWord)) return steps + 1;
                            dict.remove(nw);
                            q.offer(nw);
                        }
                    }
                    ch[j] = o;
                }
            }
            steps++;
        }
        return 0;
    }
}` },
      { title: "Word Ladder II", difficulty: "Hard", lc: "LC 126", priority: 0, statement: "All shortest transform sequences.", example: "hit→cog", approach: "BFS layers + backtrack.", time: "O(N·L²)", space: "O(N)", code: `class Solution {
    public java.util.List<java.util.List<String>> findLadders(String beginWord, String endWord, java.util.List<String> wordList) {
        java.util.Set<String> dict = new java.util.HashSet<>(wordList);
        java.util.List<java.util.List<String>> ans = new java.util.ArrayList<>();
        if (!dict.contains(endWord)) return ans;
        java.util.Map<String, java.util.Set<String>> from = new java.util.HashMap<>();
        java.util.Set<String> s1 = new java.util.HashSet<>(), s2 = new java.util.HashSet<>();
        s1.add(beginWord);
        s2.add(endWord);
        boolean rev = false, found = false;
        while (!s1.isEmpty() && !found) {
            if (s1.size() > s2.size()) {
                java.util.Set<String> t = s1;
                s1 = s2;
                s2 = t;
                rev = !rev;
            }
            dict.removeAll(s1);
            java.util.Set<String> s3 = new java.util.HashSet<>();
            for (String w : s1) {
                char[] ch = w.toCharArray();
                for (int i = 0; i < ch.length; i++) {
                    char o = ch[i];
                    for (char c = 'a'; c <= 'z'; c++) {
                        ch[i] = c;
                        String nw = new String(ch);
                        if (!s2.contains(nw) && !dict.contains(nw) && !s1.contains(nw)) continue;
                        if (s2.contains(nw)) {
                            found = true;
                            add(from, w, nw, rev);
                        } else if (dict.contains(nw)) {
                            s3.add(nw);
                            add(from, w, nw, rev);
                        }
                    }
                    ch[i] = o;
                }
            }
            s1 = s3;
        }
        java.util.List<String> path = new java.util.ArrayList<>();
        trace(ans, from, beginWord, endWord, path);
        return ans;
    }
    void add(java.util.Map<String, java.util.Set<String>> f, String a, String b, boolean rev) {
        if (rev) {
            String t = a;
            a = b;
            b = t;
        }
        f.computeIfAbsent(a, k -> new java.util.HashSet<>()).add(b);
    }
    void trace(java.util.List<java.util.List<String>> ans, java.util.Map<String, java.util.Set<String>> f, String b, String e, java.util.List<String> p) {
        p.add(b);
        if (b.equals(e)) ans.add(new java.util.ArrayList<>(p));
        else if (f.containsKey(b)) for (String x : f.get(b)) trace(ans, f, x, e, p);
        p.remove(p.size() - 1);
    }
}` },
      { title: "Accounts Merge", difficulty: "Medium", lc: "LC 721", priority: 0, statement: "Merge emails by shared names.", example: "Var", approach: "DSU on email indices.", time: "O(N log N)", space: "O(N)", code: `class Solution {
    public java.util.List<java.util.List<String>> accountsMerge(java.util.List<java.util.List<String>> ac) {
        java.util.Map<String, java.util.List<Integer>> em = new java.util.HashMap<>();
        int[] p = new int[ac.size()];
        for (int i = 0; i < p.length; i++) p[i] = i;
        for (int i = 0; i < ac.size(); i++)
            for (int j = 1; j < ac.get(i).size(); j++) em.computeIfAbsent(ac.get(i).get(j), k -> new java.util.ArrayList<>()).add(i);
        for (java.util.List<Integer> ids : em.values())
            for (int k = 1; k < ids.size(); k++) {
                int a = ids.get(0), b = ids.get(k);
                while (p[a] != a) a = p[a];
                while (p[b] != b) b = p[b];
                if (a != b) p[b] = a;
            }
        java.util.Map<Integer, java.util.TreeSet<String>> mp = new java.util.HashMap<>();
        for (int i = 0; i < ac.size(); i++) {
            int r = i;
            while (p[r] != r) r = p[r];
            mp.computeIfAbsent(r, k -> new java.util.TreeSet<>());
            for (int j = 1; j < ac.get(i).size(); j++) mp.get(r).add(ac.get(i).get(j));
        }
        java.util.List<java.util.List<String>> ans = new java.util.ArrayList<>();
        for (java.util.Map.Entry<Integer, java.util.TreeSet<String>> e : mp.entrySet()) {
            java.util.List<String> row = new java.util.ArrayList<>();
            row.add(ac.get(e.getKey()).get(0));
            row.addAll(e.getValue());
            ans.add(row);
        }
        return ans;
    }
}` },
      { title: "Cheapest Flights Within K Stops", difficulty: "Medium", lc: "LC 787", priority: 0, statement: "Min price src→dst with ≤K edges.", example: "Var", approach: "Relax k+1 rounds.", time: "O(K*E)", space: "O(V)", code: `class Solution {
    public int findCheapestPrice(int n, int[][] f, int src, int dst, int K) {
        int[] d = new int[n];
        java.util.Arrays.fill(d, Integer.MAX_VALUE);
        d[src] = 0;
        for (int i = 0; i <= K; i++) {
            int[] nd = d.clone();
            for (int[] e : f) if (d[e[0]] != Integer.MAX_VALUE && (long) d[e[0]] + e[2] < nd[e[1]]) nd[e[1]] = d[e[0]] + e[2];
            d = nd;
        }
        return d[dst] == Integer.MAX_VALUE ? -1 : d[dst];
    }
}` },
      { title: "Clone Graph", difficulty: "Medium", lc: "LC 133", priority: 0, statement: "Deep copy undirected graph.", example: "Var", approach: "HashMap + DFS.", time: "O(V+E)", space: "O(V)", code: `class Solution {
    java.util.Map<Node, Node> mp = new java.util.HashMap<>();
    public Node cloneGraph(Node node) {
        if (node == null) return null;
        if (mp.containsKey(node)) return mp.get(node);
        Node c = new Node(node.val);
        mp.put(node, c);
        for (Node n : node.neighbors) c.neighbors.add(cloneGraph(n));
        return c;
    }
}` },
      { title: "Course Schedule I", difficulty: "Medium", lc: "LC 207", priority: 0, statement: "Finish all courses? (no cycle)", example: "Var", approach: "Kahn topo.", time: "O(V+E)", space: "O(V+E)", code: `class Solution {
    public boolean canFinish(int n, int[][] pre) {
        java.util.List<java.util.List<Integer>> adj = new java.util.ArrayList<>();
        int[] in = new int[n];
        for (int i = 0; i < n; i++) adj.add(new java.util.ArrayList<>());
        for (int[] e : pre) {
            adj.get(e[1]).add(e[0]);
            in[e[0]]++;
        }
        java.util.Queue<Integer> q = new java.util.LinkedList<>();
        for (int i = 0; i < n; i++) if (in[i] == 0) q.offer(i);
        int done = 0;
        while (!q.isEmpty()) {
            int u = q.poll();
            done++;
            for (int v : adj.get(u)) if (--in[v] == 0) q.offer(v);
        }
        return done == n;
    }
}` },
      { title: "Course Schedule II", difficulty: "Medium", lc: "LC 210", priority: 0, statement: "Topological order of courses.", example: "Var", approach: "Kahn BFS.", time: "O(V+E)", space: "O(V+E)", code: `class Solution {
    public int[] findOrder(int n, int[][] pre) {
        java.util.List<java.util.List<Integer>> adj = new java.util.ArrayList<>();
        int[] in = new int[n];
        for (int i = 0; i < n; i++) adj.add(new java.util.ArrayList<>());
        for (int[] e : pre) {
            adj.get(e[1]).add(e[0]);
            in[e[0]]++;
        }
        java.util.Queue<Integer> q = new java.util.LinkedList<>();
        for (int i = 0; i < n; i++) if (in[i] == 0) q.offer(i);
        int[] res = new int[n];
        int k = 0;
        while (!q.isEmpty()) {
            int u = q.poll();
            res[k++] = u;
            for (int v : adj.get(u)) if (--in[v] == 0) q.offer(v);
        }
        return k == n ? res : new int[0];
    }
}` },
      { title: "Dijkstra's Algorithm", difficulty: "Medium", lc: "GFG/LC 743", priority: 0, statement: "SSSP non-negative weights.", example: "Var", approach: "Min-heap relax.", time: "O((V+E)logV)", space: "O(V+E)", code: `class Solution {
    public int[] dijkstra(java.util.List<int[]>[] adj, int src, int V) {
        int[] d = new int[V];
        java.util.Arrays.fill(d, Integer.MAX_VALUE);
        d[src] = 0;
        java.util.PriorityQueue<int[]> pq = new java.util.PriorityQueue<>((a, b) -> a[1] - b[1]);
        pq.offer(new int[] {src, 0});
        while (!pq.isEmpty()) {
            int[] c = pq.poll();
            if (c[1] > d[c[0]]) continue;
            for (int[] e : adj[c[0]]) {
                int v = e[0], w = e[1];
                if ((long) d[c[0]] + w < d[v]) {
                    d[v] = d[c[0]] + w;
                    pq.offer(new int[] {v, d[v]});
                }
            }
        }
        return d;
    }
}` },
      { title: "Number of Islands", difficulty: "Medium", lc: "LC 200", priority: 0, statement: "Count connected components of 1s.", example: "Var", approach: "DFS flood.", time: "O(m*n)", space: "O(m*n)", code: `class Solution {
    public int numIslands(char[][] g) {
        int c = 0;
        for (int i = 0; i < g.length; i++)
            for (int j = 0; j < g[0].length; j++)
                if (g[i][j] == '1') {
                    c++;
                    dfs(g, i, j);
                }
        return c;
    }
    void dfs(char[][] g, int i, int j) {
        if (i < 0 || i >= g.length || j < 0 || j >= g[0].length || g[i][j] != '1') return;
        g[i][j] = '0';
        dfs(g, i + 1, j);
        dfs(g, i - 1, j);
        dfs(g, i, j + 1);
        dfs(g, i, j - 1);
    }
}` },
      { title: "Rotten Oranges", difficulty: "Medium", lc: "LC 994", priority: 0, statement: "Minutes until all fresh rot.", example: "Var", approach: "Multi-source BFS.", time: "O(m*n)", space: "O(m*n)", code: `class Solution {
    public int orangesRotting(int[][] g) {
        java.util.Queue<int[]> q = new java.util.LinkedList<>();
        int f = 0;
        for (int i = 0; i < g.length; i++)
            for (int j = 0; j < g[0].length; j++) {
                if (g[i][j] == 2) q.offer(new int[] {i, j});
                if (g[i][j] == 1) f++;
            }
        int[][] d = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
        int t = 0;
        while (!q.isEmpty() && f > 0) {
            t++;
            int sz = q.size();
            for (int k = 0; k < sz; k++) {
                int[] a = q.poll();
                for (int[] x : d) {
                    int ni = a[0] + x[0], nj = a[1] + x[1];
                    if (ni >= 0 && ni < g.length && nj >= 0 && nj < g[0].length && g[ni][nj] == 1) {
                        g[ni][nj] = 2;
                        f--;
                        q.offer(new int[] {ni, nj});
                    }
                }
            }
        }
        return f == 0 ? t : -1;
    }
}` },
      { title: "Number of Islands II", difficulty: "Hard", lc: "LC 305", priority: 1, statement: "Dynamic island count after adds.", example: "Var", approach: "DSU on grid.", time: "O(k α(n))", space: "O(n²)", code: `class Solution {
    int[] p, sz;
    public java.util.List<Integer> numIslands2(int m, int n, int[][] pos) {
        java.util.List<Integer> ans = new java.util.ArrayList<>();
        p = new int[m * n];
        sz = new int[m * n];
        java.util.Arrays.fill(p, -1);
        int cnt = 0;
        for (int[] q : pos) {
            int i = q[0] * n + q[1];
            p[i] = i;
            sz[i] = 1;
            cnt++;
            for (int[] d : new int[][] {{1, 0}, {-1, 0}, {0, 1}, {0, -1}}) {
                int ni = q[0] + d[0], nj = q[1] + d[1];
                if (ni >= 0 && ni < m && nj >= 0 && nj < n && p[ni * n + nj] != -1) if (union(i, ni * n + nj)) cnt--;
            }
            ans.add(cnt);
        }
        return ans;
    }
    int find(int x) {
        return p[x] == x ? x : (p[x] = find(p[x]));
    }
    boolean union(int a, int b) {
        a = find(a);
        b = find(b);
        if (a == b) return false;
        if (sz[a] < sz[b]) {
            int t = a;
            a = b;
            b = t;
        }
        p[b] = a;
        sz[a] += sz[b];
        return true;
    }
}` },
      { title: "01 Matrix", difficulty: "Medium", lc: "LC 542", priority: 1, statement: "Distance of each cell to nearest 0.", example: "Var", approach: "Multi-source BFS.", time: "O(m*n)", space: "O(m*n)", code: `class Solution {
    public int[][] updateMatrix(int[][] m) {
        int r = m.length, c = m[0].length, INF = r + c;
        int[][] d = new int[r][c];
        java.util.Queue<int[]> q = new java.util.LinkedList<>();
        for (int i = 0; i < r; i++)
            for (int j = 0; j < c; j++) {
                if (m[i][j] == 0) {
                    d[i][j] = 0;
                    q.offer(new int[] {i, j});
                } else d[i][j] = INF;
            }
        int[][] dirs = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
        while (!q.isEmpty()) {
            int[] a = q.poll();
            for (int[] t : dirs) {
                int ni = a[0] + t[0], nj = a[1] + t[1];
                if (ni >= 0 && ni < r && nj >= 0 && nj < c && d[ni][nj] > d[a[0]][a[1]] + 1) {
                    d[ni][nj] = d[a[0]][a[1]] + 1;
                    q.offer(new int[] {ni, nj});
                }
            }
        }
        return d;
    }
}` },
      { title: "Articulation Points", difficulty: "Medium", lc: "GFG", priority: 1, statement: "Cut vertices in undirected graph.", example: "Var", approach: "Tarjan disc/low + root rule.", time: "O(V+E)", space: "O(V)", code: `class Solution {
    int T = 0;
    public java.util.ArrayList<Integer> articulationPoints(int V, java.util.ArrayList<java.util.ArrayList<Integer>> adj) {
        int[] disc = new int[V], low = new int[V], par = new int[V];
        boolean[] ap = new boolean[V], vis = new boolean[V];
        java.util.Arrays.fill(disc, -1);
        java.util.Arrays.fill(par, -1);
        for (int i = 0; i < V; i++) if (disc[i] == -1) dfs(adj, i, -1, disc, low, par, ap, vis);
        java.util.ArrayList<Integer> ans = new java.util.ArrayList<>();
        for (int i = 0; i < V; i++) if (ap[i]) ans.add(i);
        return ans;
    }
    void dfs(java.util.ArrayList<java.util.ArrayList<Integer>> adj, int u, int p, int[] disc, int[] low, int[] par, boolean[] ap, boolean[] vis) {
        disc[u] = low[u] = T++;
        vis[u] = true;
        int child = 0;
        for (int v : adj.get(u)) {
            if (v == p) continue;
            if (disc[v] == -1) {
                par[v] = u;
                child++;
                dfs(adj, v, u, disc, low, par, ap, vis);
                low[u] = Math.min(low[u], low[v]);
                if (par[u] == -1 && child > 1) ap[u] = true;
                if (par[u] != -1 && low[v] >= disc[u]) ap[u] = true;
            } else low[u] = Math.min(low[u], disc[v]);
        }
    }
}` },
      { title: "Bellman-Ford Algorithm", difficulty: "Medium", lc: "GFG", priority: 1, statement: "SSSP with negative edges; detect neg cycle.", example: "Var", approach: "Relax V-1 times.", time: "O(V*E)", space: "O(V)", code: `class Solution {
    public int[] bellmanFord(int V, int[][] edges, int src) {
        int[] d = new int[V];
        java.util.Arrays.fill(d, (int) 1e9);
        d[src] = 0;
        for (int i = 0; i < V - 1; i++)
            for (int[] e : edges) if (d[e[0]] != 1e9 && d[e[0]] + e[2] < d[e[1]]) d[e[1]] = d[e[0]] + e[2];
        for (int[] e : edges) if (d[e[0]] != 1e9 && d[e[0]] + e[2] < d[e[1]]) return new int[] {-1};
        return d;
    }
}` },
      { title: "Bipartite Graph", difficulty: "Medium", lc: "LC 785", priority: 1, statement: "2-colorable?", example: "Var", approach: "BFS coloring.", time: "O(V+E)", space: "O(V)", code: `class Solution {
    public boolean isBipartite(int[][] g) {
        int n = g.length;
        int[] col = new int[n];
        java.util.Arrays.fill(col, -1);
        for (int s = 0; s < n; s++)
            if (col[s] == -1) {
                java.util.Queue<Integer> q = new java.util.LinkedList<>();
                q.offer(s);
                col[s] = 0;
                while (!q.isEmpty()) {
                    int u = q.poll();
                    for (int v : g[u]) {
                        if (col[v] == -1) {
                            col[v] = 1 - col[u];
                            q.offer(v);
                        } else if (col[v] == col[u]) return false;
                    }
                }
            }
        return true;
    }
}` },
      { title: "Cycle Detection in Directed Graph", difficulty: "Medium", lc: "GFG", priority: 1, statement: "Directed cycle?", example: "Var", approach: "3-color DFS.", time: "O(V+E)", space: "O(V)", code: `class Solution {
    public boolean isCyclic(int V, java.util.List<java.util.List<Integer>> adj) {
        int[] c = new int[V];
        for (int i = 0; i < V; i++) if (c[i] == 0 && dfs(adj, i, c)) return true;
        return false;
    }
    boolean dfs(java.util.List<java.util.List<Integer>> adj, int u, int[] c) {
        c[u] = 1;
        for (int v : adj.get(u)) {
            if (c[v] == 1) return true;
            if (c[v] == 0 && dfs(adj, v, c)) return true;
        }
        c[u] = 2;
        return false;
    }
}` },
      { title: "Cycle Detection in Undirected Graph", difficulty: "Medium", lc: "GFG", priority: 1, statement: "Any cycle?", example: "Var", approach: "DFS parent skip.", time: "O(V+E)", space: "O(V)", code: `class Solution {
    public boolean isCycle(int V, java.util.List<java.util.List<Integer>> adj) {
        boolean[] vis = new boolean[V];
        for (int i = 0; i < V; i++) if (!vis[i] && dfs(adj, i, -1, vis)) return true;
        return false;
    }
    boolean dfs(java.util.List<java.util.List<Integer>> adj, int u, int p, boolean[] vis) {
        vis[u] = true;
        for (int v : adj.get(u)) {
            if (!vis[v]) {
                if (dfs(adj, v, u, vis)) return true;
            } else if (v != p) return true;
        }
        return false;
    }
}` },
      { title: "Disjoint Set Union (Union-Find)", difficulty: "Medium", lc: "GFG", priority: 1, statement: "Union by rank + path compression.", example: "Var", approach: "Classic DSU.", time: "O(α(n))", space: "O(n)", code: `class DSU {
    int[] p, r;
    DSU(int n) {
        p = new int[n];
        r = new int[n];
        for (int i = 0; i < n; i++) p[i] = i;
    }
    int find(int x) {
        return p[x] == x ? x : (p[x] = find(p[x]));
    }
    boolean union(int a, int b) {
        a = find(a);
        b = find(b);
        if (a == b) return false;
        if (r[a] < r[b]) p[a] = b;
        else if (r[a] > r[b]) p[b] = a;
        else {
            p[b] = a;
            r[a]++;
        }
        return true;
    }
}` },
      { title: "Find Eventual Safe States", difficulty: "Medium", lc: "LC 802", priority: 1, statement: "Nodes only in acyclic paths from.", example: "Var", approach: "3-color / terminal DFS.", time: "O(V+E)", space: "O(V)", code: `class Solution {
    public java.util.List<Integer> eventualSafeNodes(int[][] g) {
        int n = g.length;
        int[] c = new int[n];
        java.util.List<Integer> ans = new java.util.ArrayList<>();
        for (int i = 0; i < n; i++) if (dfs(g, i, c)) ans.add(i);
        return ans;
    }
    boolean dfs(int[][] g, int u, int[] c) {
        if (c[u] > 0) return c[u] == 2;
        c[u] = 1;
        for (int v : g[u]) if (!dfs(g, v, c)) return false;
        c[u] = 2;
        return true;
    }
}` },
      { title: "Floyd-Warshall Algorithm", difficulty: "Medium", lc: "GFG", priority: 1, statement: "All-pairs shortest paths.", example: "Var", approach: "Triple loop k,i,j.", time: "O(V³)", space: "O(V²)", code: `class Solution {
    public void floydWarshall(int[][] dist) {
        int V = dist.length;
        for (int k = 0; k < V; k++)
            for (int i = 0; i < V; i++)
                for (int j = 0; j < V; j++)
                    if (dist[i][k] != Integer.MAX_VALUE && dist[k][j] != Integer.MAX_VALUE)
                        dist[i][j] = Math.min(dist[i][j], dist[i][k] + dist[k][j]);
    }
}` },
      { title: "Kosaraju's Algorithm (Strongly Connected Components)", difficulty: "Medium", lc: "GFG", priority: 1, statement: "Count/print SCCs.", example: "Var", approach: "Two-pass DFS.", time: "O(V+E)", space: "O(V+E)", code: `class Solution {
    public int kosaraju(int V, java.util.ArrayList<java.util.ArrayList<Integer>> adj) {
        boolean[] vis = new boolean[V];
        java.util.Stack<Integer> st = new java.util.Stack<>();
        for (int i = 0; i < V; i++) if (!vis[i]) order(adj, i, vis, st);
        java.util.ArrayList<java.util.ArrayList<Integer>> rev = new java.util.ArrayList<>();
        for (int i = 0; i < V; i++) rev.add(new java.util.ArrayList<>());
        for (int u = 0; u < V; u++) for (int v : adj.get(u)) rev.get(v).add(u);
        java.util.Arrays.fill(vis, false);
        int c = 0;
        while (!st.isEmpty()) {
            int u = st.pop();
            if (!vis[u]) {
                dfs2(rev, u, vis);
                c++;
            }
        }
        return c;
    }
    void order(java.util.ArrayList<java.util.ArrayList<Integer>> adj, int u, boolean[] vis, java.util.Stack<Integer> st) {
        vis[u] = true;
        for (int v : adj.get(u)) if (!vis[v]) order(adj, v, vis, st);
        st.push(u);
    }
    void dfs2(java.util.ArrayList<java.util.ArrayList<Integer>> adj, int u, boolean[] vis) {
        vis[u] = true;
        for (int v : adj.get(u)) if (!vis[v]) dfs2(adj, v, vis);
    }
}` },
      { title: "Kruskal's MST", difficulty: "Medium", lc: "GFG", priority: 1, statement: "MST via sorting edges + DSU.", example: "Var", approach: "Kruskal template.", time: "O(E log E)", space: "O(V)", code: `class Solution {
    int[] p, r;
    public int kruskalMST(int V, int[][] edges) {
        java.util.Arrays.sort(edges, (a, b) -> a[2] - b[2]);
        p = new int[V];
        r = new int[V];
        for (int i = 0; i < V; i++) p[i] = i;
        int mst = 0, c = 0;
        for (int[] e : edges) {
            if (union(e[0], e[1])) {
                mst += e[2];
                if (++c == V - 1) break;
            }
        }
        return mst;
    }
    int find(int x) {
        return p[x] == x ? x : (p[x] = find(p[x]));
    }
    boolean union(int a, int b) {
        a = find(a);
        b = find(b);
        if (a == b) return false;
        if (r[a] < r[b]) p[a] = b;
        else if (r[a] > r[b]) p[b] = a;
        else {
            p[b] = a;
            r[a]++;
        }
        return true;
    }
}` },
      { title: "Minimum Spanning Tree (Prim's)", difficulty: "Medium", lc: "LC 1584 / GFG", priority: 1, statement: "MST / min cost connect all points.", example: "Var", approach: "Prim with dist[] to tree.", time: "O(V²)", space: "O(V)", code: `class Solution {
    public int minCostConnectPoints(int[][] pts) {
        int n = pts.length;
        boolean[] vis = new boolean[n];
        int[] d = new int[n];
        java.util.Arrays.fill(d, Integer.MAX_VALUE);
        d[0] = 0;
        int res = 0;
        for (int t = 0; t < n; t++) {
            int u = -1;
            for (int i = 0; i < n; i++) if (!vis[i] && (u == -1 || d[i] < d[u])) u = i;
            vis[u] = true;
            res += d[u] == Integer.MAX_VALUE ? 0 : d[u];
            for (int v = 0; v < n; v++)
                if (!vis[v]) {
                    int w = Math.abs(pts[u][0] - pts[v][0]) + Math.abs(pts[u][1] - pts[v][1]);
                    d[v] = Math.min(d[v], w);
                }
        }
        return res;
    }
}` },
      { title: "Most Stones Removed with Same Row or Column", difficulty: "Medium", lc: "LC 947", priority: 1, statement: "Max removals sharing row/col.", example: "Var", approach: "DSU on row/col ids.", time: "O(n α(n))", space: "O(n)", code: `class Solution {
    int[] p;
    public int removeStones(int[][] s) {
        java.util.Map<Integer, Integer> R = new java.util.HashMap<>(), C = new java.util.HashMap<>();
        int n = s.length;
        p = new int[n];
        for (int i = 0; i < n; i++) p[i] = i;
        for (int i = 0; i < n; i++) {
            int ri = s[i][0], ci = s[i][1] + 10001;
            if (R.containsKey(ri)) union(i, R.get(ri));
            else R.put(ri, i);
            if (C.containsKey(ci)) union(i, C.get(ci));
            else C.put(ci, i);
        }
        java.util.Set<Integer> roots = new java.util.HashSet<>();
        for (int i = 0; i < n; i++) roots.add(find(i));
        return n - roots.size();
    }
    int find(int x) {
        return p[x] == x ? x : (p[x] = find(p[x]));
    }
    void union(int a, int b) {
        a = find(a);
        b = find(b);
        if (a != b) p[a] = b;
    }
}` },
      { title: "Network Delay Time", difficulty: "Medium", lc: "LC 743", priority: 1, statement: "Time for signal to reach all nodes from k.", example: "Var", approach: "Dijkstra from k.", time: "O(E log V)", space: "O(V+E)", code: `class Solution {
    public int networkDelayTime(int[][] times, int n, int k) {
        java.util.List<int[]>[] g = new java.util.ArrayList[n + 1];
        for (int i = 0; i <= n; i++) g[i] = new java.util.ArrayList<>();
        for (int[] t : times) g[t[0]].add(new int[] {t[1], t[2]});
        int[] d = new int[n + 1];
        java.util.Arrays.fill(d, Integer.MAX_VALUE);
        d[k] = 0;
        java.util.PriorityQueue<int[]> pq = new java.util.PriorityQueue<>((a, b) -> a[1] - b[1]);
        pq.offer(new int[] {k, 0});
        while (!pq.isEmpty()) {
            int[] c = pq.poll();
            if (c[1] > d[c[0]]) continue;
            for (int[] e : g[c[0]]) {
                int v = e[0], w = e[1];
                if ((long) d[c[0]] + w < d[v]) {
                    d[v] = d[c[0]] + w;
                    pq.offer(new int[] {v, d[v]});
                }
            }
        }
        int mx = 0;
        for (int i = 1; i <= n; i++) {
            if (d[i] == Integer.MAX_VALUE) return -1;
            mx = Math.max(mx, d[i]);
        }
        return mx;
    }
}` },
      { title: "Number of Operations to Make Network Connected", difficulty: "Medium", lc: "LC 1319", priority: 1, statement: "Min extra cables to connect all.", example: "Var", approach: "Count components vs edges.", time: "O(n α(n))", space: "O(n)", code: `class Solution {
    int[] p, r;
    public int makeConnected(int n, int[][] c) {
        if (c.length < n - 1) return -1;
        p = new int[n];
        r = new int[n];
        for (int i = 0; i < n; i++) p[i] = i;
        int comp = n;
        for (int[] e : c) if (union(e[0], e[1])) comp--;
        return comp - 1;
    }
    int find(int x) {
        return p[x] == x ? x : (p[x] = find(p[x]));
    }
    boolean union(int a, int b) {
        a = find(a);
        b = find(b);
        if (a == b) return false;
        if (r[a] < r[b]) p[a] = b;
        else if (r[a] > r[b]) p[b] = a;
        else {
            p[b] = a;
            r[a]++;
        }
        return true;
    }
}` },
      { title: "Number of Provinces", difficulty: "Medium", lc: "LC 547", priority: 1, statement: "Connected components in adjacency matrix.", example: "Var", approach: "DFS count.", time: "O(n²)", space: "O(n)", code: `class Solution {
    public int findCircleNum(int[][] M) {
        int n = M.length;
        boolean[] vis = new boolean[n];
        int c = 0;
        for (int i = 0; i < n; i++)
            if (!vis[i]) {
                c++;
                dfs(M, i, vis);
            }
        return c;
    }
    void dfs(int[][] M, int i, boolean[] vis) {
        vis[i] = true;
        for (int j = 0; j < M.length; j++) if (M[i][j] == 1 && !vis[j]) dfs(M, j, vis);
    }
}` },
      { title: "Number of Ways to Arrive at Destination", difficulty: "Medium", lc: "LC 1976", priority: 1, statement: "Count shortest paths mod 1e9+7.", example: "Var", approach: "Dijkstra + ways array.", time: "O((V+E)logV)", space: "O(V+E)", code: `class Solution {
    public int countPaths(int n, int[][] roads) {
        java.util.List<int[]>[] g = new java.util.ArrayList[n];
        for (int i = 0; i < n; i++) g[i] = new java.util.ArrayList<>();
        for (int[] r : roads) {
            g[r[0]].add(new int[] {r[1], r[2]});
            g[r[1]].add(new int[] {r[0], r[2]});
        }
        long[] d = new long[n];
        java.util.Arrays.fill(d, Long.MAX_VALUE);
        d[0] = 0;
        int[] ways = new int[n];
        ways[0] = 1;
        int mod = 1000000007;
        java.util.PriorityQueue<long[]> pq = new java.util.PriorityQueue<>((a, b) -> Long.compare(a[1], b[1]));
        pq.offer(new long[] {0, 0});
        while (!pq.isEmpty()) {
            long[] c = pq.poll();
            int u = (int) c[0];
            if (c[1] > d[u]) continue;
            for (int[] e : g[u]) {
                int v = e[0], w = e[1];
                long nd = d[u] + w;
                if (nd < d[v]) {
                    d[v] = nd;
                    ways[v] = ways[u];
                    pq.offer(new long[] {v, nd});
                } else if (nd == d[v]) ways[v] = (ways[v] + ways[u]) % mod;
            }
        }
        return ways[n - 1];
    }
}` },
      { title: "Path With Minimum Effort", difficulty: "Medium", lc: "LC 1631", priority: 1, statement: "Minimize max abs diff along path.", example: "Var", approach: "Dijkstra on max-edge cost.", time: "O(mn log(mn))", space: "O(mn)", code: `class Solution {
    public int minimumEffortPath(int[][] h) {
        int m = h.length, n = h[0].length;
        int[][] e = new int[m][n];
        for (int[] r : e) java.util.Arrays.fill(r, Integer.MAX_VALUE);
        e[0][0] = 0;
        java.util.PriorityQueue<int[]> pq = new java.util.PriorityQueue<>((a, b) -> a[2] - b[2]);
        pq.offer(new int[] {0, 0, 0});
        int[][] d = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
        while (!pq.isEmpty()) {
            int[] c = pq.poll();
            if (c[2] > e[c[0]][c[1]]) continue;
            if (c[0] == m - 1 && c[1] == n - 1) return c[2];
            for (int[] t : d) {
                int ni = c[0] + t[0], nj = c[1] + t[1];
                if (ni >= 0 && ni < m && nj >= 0 && nj < n) {
                    int ne = Math.max(c[2], Math.abs(h[c[0]][c[1]] - h[ni][nj]));
                    if (ne < e[ni][nj]) {
                        e[ni][nj] = ne;
                        pq.offer(new int[] {ni, nj, ne});
                    }
                }
            }
        }
        return 0;
    }
}` },
      { title: "Shortest Path in Binary Matrix", difficulty: "Medium", lc: "LC 1091", priority: 1, statement: "Shortest clear path corner to corner (8-dir).", example: "Var", approach: "BFS marking visited.", time: "O(n²)", space: "O(n²)", code: `class Solution {
    public int shortestPathBinaryMatrix(int[][] g) {
        int n = g.length;
        if (g[0][0] == 1 || g[n - 1][n - 1] == 1) return -1;
        java.util.Queue<int[]> q = new java.util.LinkedList<>();
        q.offer(new int[] {0, 0, 1});
        g[0][0] = 1;
        int[][] dirs = {{-1, -1}, {-1, 0}, {-1, 1}, {0, -1}, {0, 1}, {1, -1}, {1, 0}, {1, 1}};
        while (!q.isEmpty()) {
            int[] a = q.poll();
            if (a[0] == n - 1 && a[1] == n - 1) return a[2];
            for (int[] t : dirs) {
                int ni = a[0] + t[0], nj = a[1] + t[1];
                if (ni >= 0 && ni < n && nj >= 0 && nj < n && g[ni][nj] == 0) {
                    g[ni][nj] = 1;
                    q.offer(new int[] {ni, nj, a[2] + 1});
                }
            }
        }
        return -1;
    }
}` },
      { title: "Shortest Path in DAG", difficulty: "Medium", lc: "GFG", priority: 1, statement: "Single-source shortest in DAG.", example: "Var", approach: "Topo + relax.", time: "O(V+E)", space: "O(V+E)", code: `class Solution {
    public int[] shortestPath(int V, int src, java.util.List<int[]>[] adj) {
        int[] in = new int[V];
        for (int u = 0; u < V; u++) for (int[] e : adj[u]) in[e[0]]++;
        java.util.Queue<Integer> q = new java.util.LinkedList<>();
        for (int i = 0; i < V; i++) if (in[i] == 0) q.offer(i);
        int[] ord = new int[V];
        int k = 0;
        while (!q.isEmpty()) {
            int u = q.poll();
            ord[k++] = u;
            for (int[] e : adj[u]) if (--in[e[0]] == 0) q.offer(e[0]);
        }
        int[] d = new int[V];
        java.util.Arrays.fill(d, (int) 1e9);
        d[src] = 0;
        for (int u : ord) if (d[u] != 1e9) for (int[] e : adj[u]) d[e[0]] = Math.min(d[e[0]], d[u] + e[1]);
        return d;
    }
}` },
      { title: "Surrounded Regions", difficulty: "Medium", lc: "LC 130", priority: 1, statement: "Capture Os not connected to border.", example: "Var", approach: "DFS from border Os.", time: "O(m*n)", space: "O(m*n)", code: `class Solution {
    public void solve(char[][] b) {
        int m = b.length, n = b[0].length;
        for (int i = 0; i < m; i++) {
            dfs(b, i, 0);
            dfs(b, i, n - 1);
        }
        for (int j = 0; j < n; j++) {
            dfs(b, 0, j);
            dfs(b, m - 1, j);
        }
        for (int i = 0; i < m; i++)
            for (int j = 0; j < n; j++) {
                if (b[i][j] == 'O') b[i][j] = 'X';
                if (b[i][j] == 'S') b[i][j] = 'O';
            }
    }
    void dfs(char[][] b, int i, int j) {
        if (i < 0 || i >= b.length || j < 0 || j >= b[0].length || b[i][j] != 'O') return;
        b[i][j] = 'S';
        dfs(b, i + 1, j);
        dfs(b, i - 1, j);
        dfs(b, i, j + 1);
        dfs(b, i, j - 1);
    }
}` },
      { title: "Topological Sort", difficulty: "Medium", lc: "GFG", priority: 1, statement: "Linear ordering respecting edges.", example: "Var", approach: "Kahn.", time: "O(V+E)", space: "O(V+E)", code: `class Solution {
    static int[] topoSort(int V, java.util.ArrayList<java.util.ArrayList<Integer>> adj) {
        int[] in = new int[V];
        for (int u = 0; u < V; u++) for (int v : adj.get(u)) in[v]++;
        java.util.Queue<Integer> q = new java.util.LinkedList<>();
        for (int i = 0; i < V; i++) if (in[i] == 0) q.offer(i);
        int[] ord = new int[V];
        int k = 0;
        while (!q.isEmpty()) {
            int u = q.poll();
            ord[k++] = u;
            for (int v : adj.get(u)) if (--in[v] == 0) q.offer(v);
        }
        return k == V ? ord : new int[0];
    }
}` },
      { title: "City With Smallest Number of Neighbors at a Threshold Distance", difficulty: "Medium", lc: "LC 1334", priority: 2, statement: "Floyd or multi-source.", example: "Var", approach: "Floyd-Warshall.", time: "O(n³)", space: "O(n²)", code: `class Solution {
    public int findTheCity(int n, int[][] edges, int distanceThreshold) {
        // TODO: Implement
    }
}` },
      { title: "Number of Distinct Islands", difficulty: "Medium", lc: "GFG", priority: 2, statement: "Count shapes up to translation.", example: "Var", approach: "DFS + canonical key.", time: "O(m*n)", space: "O(m*n)", code: `class Solution {
    public int countDistinctIslands(int[][] grid) {
        // TODO: Implement
    }
}` },
      { title: "Number of Enclaves", difficulty: "Medium", lc: "LC 1020", priority: 2, statement: "1s not reachable from boundary.", example: "Var", approach: "Flood from border.", time: "O(m*n)", space: "O(m*n)", code: `class Solution {
    public int numEnclaves(int[][] grid) {
        // TODO: Implement
    }
}` },
      { title: "Shortest Path in Undirected Graph (Unit Weights)", difficulty: "Medium", lc: "GFG", priority: 2, statement: "BFS shortest from src.", example: "Var", approach: "Level BFS.", time: "O(V+E)", space: "O(V)", code: `class Solution {
    public int[] shortestPath(ArrayList<ArrayList<Integer>> adj, int src, int V) {
        // TODO: Implement
    }
}` },
      { title: "Flood Fill", difficulty: "Easy", lc: "LC 733", priority: 2, statement: "Replace connected same-color region.", example: "Var", approach: "DFS/BFS.", time: "O(m*n)", space: "O(m*n)", code: `class Solution {
    public int[][] floodFill(int[][] image, int sr, int sc, int color) {
        // TODO: Implement
    }
}` }
    ]
  },
  {
    id: "trees",
    name: "Binary Trees",
    icon: "⌬",
    topicPriority: 3,
    accent: "#a78bfa",
    description: "Traversals, construction, LCA, path problems. Foundation for many graph problems.",
    problems: [
      { title: "Maximum Path Sum", difficulty: "Hard", lc: "LC 124", priority: 0, statement: "Max sum along any path between any two nodes (path may not pass root).", example: "[-10,9,20,null,null,15,7] → 42", approach: "Postorder: return max chain up; update global with val+max(0,l)+max(0,r).", time: "O(n)", space: "O(h)", code: `class Solution {
    int maxSum = Integer.MIN_VALUE;
    public int maxPathSum(TreeNode root) { dfs(root); return maxSum; }
    int dfs(TreeNode n) {
        if (n == null) return 0;
        int l = Math.max(0, dfs(n.left)), r = Math.max(0, dfs(n.right));
        maxSum = Math.max(maxSum, n.val + l + r);
        return n.val + Math.max(l, r);
    }
}` },
      { title: "Serialize & Deserialize Binary Tree", difficulty: "Hard", lc: "LC 297", priority: 0, statement: "Design encode/decode so tree can be serialized to string and reconstructed.", example: "Preorder with null markers.", approach: "Preorder DFS; deserialize with queue of tokens.", time: "O(n)", space: "O(n)", code: `public class Codec {
    public String serialize(TreeNode root) {
        if (root == null) return "#";
        return root.val + "," + serialize(root.left) + "," + serialize(root.right);
    }
    public TreeNode deserialize(String data) {
        return build(new java.util.LinkedList<>(java.util.Arrays.asList(data.split(","))));
    }
    TreeNode build(java.util.Queue<String> q) {
        String s = q.poll();
        if ("#".equals(s)) return null;
        TreeNode n = new TreeNode(Integer.parseInt(s));
        n.left = build(q); n.right = build(q);
        return n;
    }
}` },
      { title: "Level Order Traversal", difficulty: "Medium", lc: "LC 102", priority: 0, statement: "Return values level by level (left to right).", example: "[3,9,20] → [[3],[9,20]]", approach: "BFS queue; process size of each level.", time: "O(n)", space: "O(n)", code: `class Solution {
    public List<List<Integer>> levelOrder(TreeNode root) {
        List<List<Integer>> res = new ArrayList<>();
        if (root == null) return res;
        Queue<TreeNode> q = new LinkedList<>();
        q.offer(root);
        while (!q.isEmpty()) {
            int sz = q.size();
            List<Integer> level = new ArrayList<>();
            for (int i = 0; i < sz; i++) {
                TreeNode n = q.poll();
                level.add(n.val);
                if (n.left != null) q.offer(n.left);
                if (n.right != null) q.offer(n.right);
            }
            res.add(level);
        }
        return res;
    }
}` },
      { title: "Lowest Common Ancestor", difficulty: "Medium", lc: "LC 236", priority: 0, statement: "LCA of two nodes p and q in a binary tree (not BST).", example: "Nodes 5 and 1 → 3", approach: "Postorder: if root is p or q return it; else bubble first non-null from subtrees.", time: "O(n)", space: "O(h)", code: `class Solution {
    public TreeNode lowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q) {
        if (root == null || root == p || root == q) return root;
        TreeNode L = lowestCommonAncestor(root.left, p, q);
        TreeNode R = lowestCommonAncestor(root.right, p, q);
        if (L != null && R != null) return root;
        return L != null ? L : R;
    }
}` },
      { title: "All Nodes Distance K in Binary Tree", difficulty: "Medium", lc: "LC 863", priority: 0, statement: "Return values of all nodes at distance k from target node.", example: "Treat tree as undirected graph via parent links; BFS from target.", approach: "DFS build undirected adjacency; BFS k layers from target.", time: "O(n)", space: "O(n)", code: `class Solution {
    Map<TreeNode, List<TreeNode>> g = new HashMap<>();
    public List<Integer> distanceK(TreeNode root, TreeNode target, int k) {
        build(root, null);
        List<Integer> res = new ArrayList<>();
        Set<TreeNode> vis = new HashSet<>();
        Queue<TreeNode> q = new LinkedList<>();
        q.add(target); vis.add(target);
        int d = 0;
        while (!q.isEmpty()) {
            if (d == k) { for (TreeNode n : q) res.add(n.val); break; }
            int sz = q.size();
            for (int i = 0; i < sz; i++) {
                TreeNode n = q.poll();
                for (TreeNode nb : g.getOrDefault(n, java.util.Collections.emptyList()))
                    if (vis.add(nb)) q.add(nb);
            }
            d++;
        }
        return res;
    }
    void build(TreeNode n, TreeNode p) {
        if (n == null) return;
        if (p != null) {
            g.computeIfAbsent(n, x -> new ArrayList<>()).add(p);
            g.computeIfAbsent(p, x -> new ArrayList<>()).add(n);
        }
        build(n.left, n); build(n.right, n);
    }
}` },
      { title: "Diameter of Binary Tree", difficulty: "Easy", lc: "LC 543", priority: 0, statement: "Length of longest path between any two nodes (edges count).", example: "[1,2,3,4,5] → 3", approach: "DFS height; ans = max(ans, leftH + rightH).", time: "O(n)", space: "O(h)", code: `class Solution {
    int ans = 0;
    public int diameterOfBinaryTree(TreeNode root) { height(root); return ans; }
    int height(TreeNode n) {
        if (n == null) return 0;
        int l = height(n.left), r = height(n.right);
        ans = Math.max(ans, l + r);
        return 1 + Math.max(l, r);
    }
}` },
      { title: "Vertical Order Traversal", difficulty: "Hard", lc: "LC 987", priority: 1, statement: "Column order left→right; same (col,row) sorted by value.", example: "Use (col,row,val) list then sort.", approach: "DFS collect positions; sort by col, row, val; group by col.", time: "O(n log n)", space: "O(n)", code: `class Solution {
    static class T { int c, r, v; T(int c,int r,int v){this.c=c;this.r=r;this.v=v;} }
    public List<List<Integer>> verticalTraversal(TreeNode root) {
        List<T> list = new ArrayList<>();
        dfs(root, 0, 0, list);
        list.sort((a,b) -> a.c != b.c ? Integer.compare(a.c,b.c) : a.r != b.r ? Integer.compare(a.r,b.r) : Integer.compare(a.v,b.v));
        List<List<Integer>> res = new ArrayList<>();
        int prev = Integer.MIN_VALUE;
        for (T t : list) {
            if (t.c != prev) { res.add(new ArrayList<>()); prev = t.c; }
            res.get(res.size() - 1).add(t.v);
        }
        return res;
    }
    void dfs(TreeNode n, int c, int r, List<T> list) {
        if (n == null) return;
        list.add(new T(c, r, n.val));
        dfs(n.left, c - 1, r + 1, list);
        dfs(n.right, c + 1, r + 1, list);
    }
}` },
      { title: "Minimum Time to Burn Tree", difficulty: "Hard", lc: "GFG", priority: 1, statement: "From a starting node, fire spreads to parent and children each unit time; min time to burn whole tree.", example: "Build parent map + BFS layers from start.", approach: "Map parent pointers; BFS counting waves until all visited.", time: "O(n)", space: "O(n)", code: `class Solution {
    TreeNode src;
    public int minBurnTime(TreeNode root, int start) {
        Map<TreeNode, TreeNode> par = new HashMap<>();
        src = null;
        dfs(root, null, par, start);
        if (src == null) src = root;
        Set<TreeNode> vis = new HashSet<>();
        Queue<TreeNode> q = new LinkedList<>();
        q.add(src);
        vis.add(src);
        int t = 0;
        while (!q.isEmpty()) {
            int sz = q.size();
            for (int i = 0; i < sz; i++) {
                TreeNode n = q.poll();
                if (n.left != null && vis.add(n.left)) q.add(n.left);
                if (n.right != null && vis.add(n.right)) q.add(n.right);
                TreeNode p = par.get(n);
                if (p != null && vis.add(p)) q.add(p);
            }
            if (!q.isEmpty()) t++;
        }
        return t;
    }
    void dfs(TreeNode n, TreeNode p, Map<TreeNode, TreeNode> par, int start) {
        if (n == null) return;
        par.put(n, p);
        if (n.val == start) src = n;
        dfs(n.left, n, par, start);
        dfs(n.right, n, par, start);
    }
}` },
      { title: "Morris Inorder Traversal", difficulty: "Medium", lc: "LC 94", priority: 1, statement: "Inorder traversal O(1) extra space using threaded tree.", example: "Thread predecessor's right to current when going left first time.", approach: "Morris threading; when predecessor.right==null link, else unlink and visit.", time: "O(n)", space: "O(1)", code: `class Solution {
    public List<Integer> inorderTraversal(TreeNode root) {
        List<Integer> res = new ArrayList<>();
        TreeNode cur = root;
        while (cur != null) {
            if (cur.left == null) { res.add(cur.val); cur = cur.right; }
            else {
                TreeNode pred = cur.left;
                while (pred.right != null && pred.right != cur) pred = pred.right;
                if (pred.right == null) { pred.right = cur; cur = cur.left; }
                else { pred.right = null; res.add(cur.val); cur = cur.right; }
            }
        }
        return res;
    }
}` },
      { title: "Zigzag Level Order Traversal", difficulty: "Medium", lc: "LC 103", priority: 1, statement: "Level order alternating L→R then R→L.", example: "Reverse every other level or deque.", approach: "BFS; Collections.reverse on odd levels.", time: "O(n)", space: "O(n)", code: `class Solution {
    public List<List<Integer>> zigzagLevelOrder(TreeNode root) {
        List<List<Integer>> res = new ArrayList<>();
        if (root == null) return res;
        Queue<TreeNode> q = new LinkedList<>();
        q.offer(root);
        boolean rev = false;
        while (!q.isEmpty()) {
            int sz = q.size();
            List<Integer> level = new ArrayList<>();
            for (int i = 0; i < sz; i++) {
                TreeNode n = q.poll();
                level.add(n.val);
                if (n.left != null) q.offer(n.left);
                if (n.right != null) q.offer(n.right);
            }
            if (rev) java.util.Collections.reverse(level);
            res.add(level); rev = !rev;
        }
        return res;
    }
}` },
      { title: "Boundary Traversal", difficulty: "Medium", lc: "GFG", priority: 1, statement: "Anti-clockwise boundary: left boundary (no leaves), leaves, right boundary upward.", example: "Exclude duplicate corner nodes.", approach: "Three passes: left edge, leaves inorder, right edge reversed.", time: "O(n)", space: "O(h)", code: `class Solution {
    public List<Integer> boundary(TreeNode root) {
        List<Integer> res = new ArrayList<>();
        if (root == null) return res;
        res.add(root.val);
        leftB(root.left, res);
        leaves(root.left, res);
        leaves(root.right, res);
        Deque<Integer> dq = new ArrayDeque<>();
        rightB(root.right, dq);
        while (!dq.isEmpty()) res.add(dq.removeLast());
        return res;
    }
    void leftB(TreeNode n, List<Integer> res) {
        while (n != null) {
            if (n.left != null || n.right != null) res.add(n.val);
            n = n.left != null ? n.left : n.right;
        }
    }
    void rightB(TreeNode n, Deque<Integer> dq) {
        while (n != null) {
            if (n.left != null || n.right != null) dq.addLast(n.val);
            n = n.right != null ? n.right : n.left;
        }
    }
    void leaves(TreeNode n, List<Integer> res) {
        if (n == null) return;
        if (n.left == null && n.right == null) { res.add(n.val); return; }
        leaves(n.left, res);
        leaves(n.right, res);
    }
}` },
      { title: "Top View of Binary Tree", difficulty: "Medium", lc: "GFG", priority: 1, statement: "Nodes visible from top when projected on vertical lines (first per column).", example: "Level-order tracking first at each horizontal distance.", approach: "BFS (col, node); TreeMap keep min col first seen at top.", time: "O(n log n)", space: "O(n)", code: `class Solution {
    public List<Integer> topView(TreeNode root) {
        if (root == null) return new ArrayList<>();
        Map<Integer, Integer> first = new TreeMap<>();
        Queue<TreeNode> q = new LinkedList<>();
        Queue<Integer> qc = new LinkedList<>();
        q.add(root);
        qc.add(0);
        while (!q.isEmpty()) {
            TreeNode n = q.poll();
            int c = qc.poll();
            first.putIfAbsent(c, n.val);
            if (n.left != null) { q.add(n.left); qc.add(c - 1); }
            if (n.right != null) { q.add(n.right); qc.add(c + 1); }
        }
        return new ArrayList<>(first.values());
    }
}` },
      { title: "Bottom View of Binary Tree", difficulty: "Medium", lc: "GFG", priority: 1, statement: "Last node per vertical column in level order (deepest wins ties by value rules per GFG).", example: "BFS/DFS with column index; map col→last value at max depth.", approach: "DFS with (col, depth); update map when deeper or same depth smaller index.", time: "O(n log n)", space: "O(n)", code: `class Solution {
    static class Info { int val, d; Info(int v,int d){val=v;this.d=d;} }
    public List<Integer> bottomView(TreeNode root) {
        Map<Integer, Info> map = new TreeMap<>();
        dfs(root, 0, 0, map);
        List<Integer> res = new ArrayList<>();
        for (Info i : map.values()) res.add(i.val);
        return res;
    }
    void dfs(TreeNode n, int c, int d, Map<Integer, Info> map) {
        if (n == null) return;
        if (!map.containsKey(c) || d >= map.get(c).d) map.put(c, new Info(n.val, d));
        dfs(n.left, c - 1, d + 1, map);
        dfs(n.right, c + 1, d + 1, map);
    }
}` },
      { title: "Right Side View", difficulty: "Medium", lc: "LC 199", priority: 1, statement: "Values visible from the right of the tree.", example: "Last node of each level in level-order.", approach: "BFS take last of each level, or preorder depth-first preferring right.", time: "O(n)", space: "O(n)", code: `class Solution {
    public List<Integer> rightSideView(TreeNode root) {
        List<Integer> res = new ArrayList<>();
        if (root == null) return res;
        Queue<TreeNode> q = new LinkedList<>();
        q.offer(root);
        while (!q.isEmpty()) {
            int sz = q.size();
            for (int i = 0; i < sz; i++) {
                TreeNode n = q.poll();
                if (i == sz - 1) res.add(n.val);
                if (n.left != null) q.offer(n.left);
                if (n.right != null) q.offer(n.right);
            }
        }
        return res;
    }
}` },
      { title: "Root to Node Path", difficulty: "Medium", lc: "GFG", priority: 1, statement: "Return path from root to node with given value (if exists).", example: "DFS backtrack when target found.", approach: "DFS with list; remove on backtrack if path fails.", time: "O(n)", space: "O(h)", code: `class Solution {
    public List<Integer> pathToNode(TreeNode root, int x) {
        List<Integer> path = new ArrayList<>();
        dfs(root, x, path);
        return path;
    }
    boolean dfs(TreeNode n, int x, List<Integer> path) {
        if (n == null) return false;
        path.add(n.val);
        if (n.val == x) return true;
        if (dfs(n.left, x, path) || dfs(n.right, x, path)) return true;
        path.remove(path.size() - 1);
        return false;
    }
}` },
      { title: "Maximum Width of Binary Tree", difficulty: "Medium", lc: "LC 662", priority: 1, statement: "Max width between any two nodes at same level (nulls count as positions).", example: "Assign indices like heap: left=2*i, right=2*i+1.", approach: "BFS store (node,index); width = last-first+1 per level.", time: "O(n)", space: "O(n)", code: `class Solution {
    public int widthOfBinaryTree(TreeNode root) {
        if (root == null) return 0;
        long ans = 0;
        Queue<TreeNode> q = new LinkedList<>();
        Queue<Long> qi = new LinkedList<>();
        q.offer(root);
        qi.offer(0L);
        while (!q.isEmpty()) {
            int sz = q.size();
            long lo = qi.peek();
            long hi = lo;
            for (int i = 0; i < sz; i++) {
                TreeNode n = q.poll();
                long idx = qi.poll();
                hi = idx;
                if (n.left != null) { q.offer(n.left); qi.offer(2 * idx); }
                if (n.right != null) { q.offer(n.right); qi.offer(2 * idx + 1); }
            }
            ans = Math.max(ans, hi - lo + 1);
        }
        return (int) ans;
    }
}` },
      { title: "Construct BT from Inorder & Preorder", difficulty: "Medium", lc: "LC 105", priority: 1, statement: "Unique tree from preorder and inorder arrays.", example: "Root = preorder[0]; split inorder at root.", approach: "HashMap inorder index + recurse on ranges.", time: "O(n)", space: "O(n)", code: `class Solution {
    int preIdx = 0;
    Map<Integer, Integer> inMap = new HashMap<>();
    public TreeNode buildTree(int[] preorder, int[] inorder) {
        for (int i = 0; i < inorder.length; i++) inMap.put(inorder[i], i);
        return build(preorder, 0, inorder.length - 1);
    }
    TreeNode build(int[] pre, int lo, int hi) {
        if (lo > hi) return null;
        TreeNode root = new TreeNode(pre[preIdx++]);
        int mid = inMap.get(root.val);
        root.left = build(pre, lo, mid - 1);
        root.right = build(pre, mid + 1, hi);
        return root;
    }
}` },
      { title: "Construct BT from Inorder & Postorder", difficulty: "Medium", lc: "LC 106", priority: 1, statement: "Unique tree from inorder and postorder.", example: "Root = postorder[last]; mirror of preorder build.", approach: "PostIdx from end; right subtree then left.", time: "O(n)", space: "O(n)", code: `class Solution {
    int postIdx;
    Map<Integer, Integer> inMap = new HashMap<>();
    public TreeNode buildTree(int[] inorder, int[] postorder) {
        postIdx = postorder.length - 1;
        for (int i = 0; i < inorder.length; i++) inMap.put(inorder[i], i);
        return build(inorder, postorder, 0, inorder.length - 1);
    }
    TreeNode build(int[] in, int[] post, int lo, int hi) {
        if (lo > hi) return null;
        TreeNode root = new TreeNode(post[postIdx--]);
        int mid = inMap.get(root.val);
        root.right = build(in, post, mid + 1, hi);
        root.left = build(in, post, lo, mid - 1);
        return root;
    }
}` },
      { title: "Flatten BT to Linked List", difficulty: "Medium", lc: "LC 114", priority: 1, statement: "In-place preorder flatten to right-skewed linked list.", example: "Morris-like or reverse postorder stack.", approach: "Reverse postorder: right, left, root — thread prev.right = root.", time: "O(n)", space: "O(1)", code: `class Solution {
    TreeNode prev = null;
    public void flatten(TreeNode root) {
        if (root == null) return;
        flatten(root.right);
        flatten(root.left);
        root.right = prev;
        root.left = null;
        prev = root;
    }
}` },
      { title: "Postorder Traversal Iterative", difficulty: "Hard", lc: "LC 145", priority: 2, statement: "Postorder left-right-root using explicit stack.", example: "Two stacks or one stack with prev pointer.", approach: "Push root; pop to output stack; push left then right; reverse output.", time: "O(n)", space: "O(n)", code: `class Solution {
    public List<Integer> postorderTraversal(TreeNode root) {
        // TODO: Implement
        return new ArrayList<>();
    }
}` },
      { title: "Preorder Traversal Iterative", difficulty: "Medium", lc: "LC 144", priority: 2, statement: "Preorder root-left-right without recursion.", example: "Stack: push right then left.", approach: "Classic stack simulation.", time: "O(n)", space: "O(n)", code: `class Solution {
    public List<Integer> preorderTraversal(TreeNode root) {
        // TODO: Implement
        return new ArrayList<>();
    }
}` },
      { title: "Inorder Traversal Iterative", difficulty: "Medium", lc: "LC 94", priority: 2, statement: "Inorder with stack (alternative to Morris).", example: "Go left until null; pop; go right.", approach: "Push all left; pop visit; move to right child.", time: "O(n)", space: "O(h)", code: `class Solution {
    public List<Integer> inorderTraversal(TreeNode root) {
        // TODO: Implement
        return new ArrayList<>();
    }
}` },
      { title: "Morris Preorder Traversal", difficulty: "Medium", lc: "GFG", priority: 2, statement: "Preorder O(1) space via threading (similar to Morris inorder).", example: "Visit before threading when creating link.", approach: "When left null visit and go right; else find predecessor and thread.", time: "O(n)", space: "O(1)", code: `class Solution {
    public List<Integer> preorderMorris(TreeNode root) {
        // TODO: Implement
        return new ArrayList<>();
    }
}` },
      { title: "Left Side View", difficulty: "Medium", lc: "GFG", priority: 2, statement: "First node of each level from left (mirror of right view).", example: "BFS first element per level.", approach: "Same as right view but take index 0 each level.", time: "O(n)", space: "O(n)", code: `class Solution {
    public List<Integer> leftView(TreeNode root) {
        // TODO: Implement
        return new ArrayList<>();
    }
}` },
      { title: "Children Sum Property", difficulty: "Medium", lc: "GFG", priority: 2, statement: "Convert tree so each node's value equals sum of children (increment only).", example: "Postorder: set children then adjust parent.", approach: "DFS; increase child values to satisfy property before leaving.", time: "O(n)", space: "O(h)", code: `class Solution {
    public void changeTree(TreeNode root) {
        // TODO: Implement
    }
}` },
      { title: "Count Complete Tree Nodes", difficulty: "Medium", lc: "LC 222", priority: 2, statement: "Count nodes in complete binary tree in less than O(n).", example: "Use perfect subtree height check.", approach: "If left height == right height, left perfect else right perfect.", time: "O(log² n)", space: "O(log n)", code: `class Solution {
    public int countNodes(TreeNode root) {
        // TODO: Implement
        return 0;
    }
}` },
      { title: "Check Balanced Binary Tree", difficulty: "Easy", lc: "LC 110", priority: 2, statement: "For every node, |height(left)-height(right)| ≤ 1.", example: "Return height or -1 if unbalanced.", approach: "Postorder return -1 if imbalance.", time: "O(n)", space: "O(h)", code: `class Solution {
    public boolean isBalanced(TreeNode root) {
        // TODO: Implement
        return false;
    }
}` },
      { title: "Height of Binary Tree", difficulty: "Easy", lc: "LC 104", priority: 2, statement: "Max depth / number of edges or nodes along longest path.", example: "Single node → 1 (nodes) or 0 (edges) per problem statement.", approach: "max(left, right) + 1.", time: "O(n)", space: "O(h)", code: `class Solution {
    public int maxDepth(TreeNode root) {
        // TODO: Implement
        return 0;
    }
}` },
      { title: "Symmetric Binary Tree", difficulty: "Easy", lc: "LC 101", priority: 2, statement: "Tree is mirror of itself around root.", example: "[1,2,2,3,4,4,3] → true", approach: "Compare left.right with right.left recursively.", time: "O(n)", space: "O(h)", code: `class Solution {
    public boolean isSymmetric(TreeNode root) {
        // TODO: Implement
        return false;
    }
}` },
      { title: "Check if Two Trees are Identical", difficulty: "Easy", lc: "LC 100", priority: 3, statement: "Same structure and values for p and q.", example: "Both null → identical.", approach: "Recursion: same val and identical subtrees.", time: "O(n)", space: "O(h)", code: `class Solution {
    public boolean isSameTree(TreeNode p, TreeNode q) {
        // TODO: Implement
        return false;
    }
}` }
    ]
  },
  {
    id: "bst",
    name: "Binary Search Trees",
    icon: "⧫",
    topicPriority: 4,
    accent: "#818cf8",
    description: "BST properties, floor/ceil, construction. Builds on binary tree knowledge.",
    problems: [
      { title: "Largest BST in Binary Tree", difficulty: "Hard", lc: "GFG", priority: 0, statement: "Size of largest subtree that is a valid BST (can be whole tree or part).", example: "Postorder return min,max,size,isBST for each node.", approach: "If both children BST and val in (L.max, R.min), merge; else propagate invalid.", time: "O(n)", space: "O(h)", code: `class Solution {
    static class Info {
        int min, max, size; boolean isBST;
        Info(int mn, int mx, int sz, boolean b) { min = mn; max = mx; size = sz; isBST = b; }
    }
    int best = 0;
    public int largestBSTSubtree(TreeNode root) { dfs(root); return best; }
    Info dfs(TreeNode n) {
        if (n == null) return new Info(Integer.MAX_VALUE, Integer.MIN_VALUE, 0, true);
        Info L = dfs(n.left), R = dfs(n.right);
        if (L.isBST && R.isBST && n.val > L.max && n.val < R.min) {
            int sz = L.size + R.size + 1;
            best = Math.max(best, sz);
            return new Info(Math.min(n.val, L.min), Math.max(n.val, R.max), sz, true);
        }
        return new Info(0, 0, Math.max(L.size, R.size), false);
    }
}` },
      { title: "Validate BST", difficulty: "Medium", lc: "LC 98", priority: 0, statement: "Check BST property: left < root < right for all nodes.", example: "Pass (min,max) bounds or inorder strictly increasing.", approach: "DFS with long bounds to handle Integer edge cases.", time: "O(n)", space: "O(h)", code: `class Solution {
    public boolean isValidBST(TreeNode root) { return valid(root, Long.MIN_VALUE, Long.MAX_VALUE); }
    boolean valid(TreeNode n, long lo, long hi) {
        if (n == null) return true;
        if (n.val <= lo || n.val >= hi) return false;
        return valid(n.left, lo, n.val) && valid(n.right, n.val, hi);
    }
}` },
      { title: "Recover BST", difficulty: "Medium", lc: "LC 99", priority: 0, statement: "Exactly two nodes swapped by mistake; restore BST in-place.", example: "Inorder should be sorted; find two violations.", approach: "Track prev in inorder; first drop at first violation, second at last.", time: "O(n)", space: "O(h)", code: `class Solution {
    TreeNode first, second, prev;
    public void recoverTree(TreeNode root) {
        dfs(root);
        int t = first.val; first.val = second.val; second.val = t;
    }
    void dfs(TreeNode r) {
        if (r == null) return;
        dfs(r.left);
        if (prev != null && prev.val > r.val) {
            if (first == null) { first = prev; second = r; }
            else second = r;
        }
        prev = r;
        dfs(r.right);
    }
}` },
      { title: "Delete Node in BST", difficulty: "Medium", lc: "LC 450", priority: 1, statement: "Delete key and keep BST property.", example: "0/1/2 children cases: replace with inorder successor or merge subtrees.", approach: "Recursive find; if two children replace with min of right subtree.", time: "O(h)", space: "O(h)", code: `class Solution {
    public TreeNode deleteNode(TreeNode root, int key) {
        if (root == null) return null;
        if (key < root.val) root.left = deleteNode(root.left, key);
        else if (key > root.val) root.right = deleteNode(root.right, key);
        else {
            if (root.left == null) return root.right;
            if (root.right == null) return root.left;
            TreeNode min = root.right;
            while (min.left != null) min = min.left;
            root.val = min.val;
            root.right = deleteNode(root.right, min.val);
        }
        return root;
    }
}` },
      { title: "Kth Smallest in BST", difficulty: "Medium", lc: "LC 230", priority: 1, statement: "Return kth smallest (1-indexed) in BST.", example: "Inorder is sorted.", approach: "Iterative inorder until k pops.", time: "O(H+k)", space: "O(H)", code: `class Solution {
    public int kthSmallest(TreeNode root, int k) {
        Deque<TreeNode> st = new ArrayDeque<>();
        TreeNode cur = root;
        while (cur != null || !st.isEmpty()) {
            while (cur != null) { st.push(cur); cur = cur.left; }
            cur = st.pop();
            if (--k == 0) return cur.val;
            cur = cur.right;
        }
        return -1;
    }
}` },
      { title: "Construct BST from Preorder", difficulty: "Medium", lc: "LC 1008", priority: 1, statement: "Construct BST from preorder traversal (unique BST).", example: "Bound: next element must lie in (min,max).", approach: "Idx + recursion with upper bound; or monotone stack.", time: "O(n)", space: "O(h)", code: `class Solution {
    int i = 0;
    public TreeNode bstFromPreorder(int[] preorder) {
        return build(preorder, Integer.MAX_VALUE);
    }
    TreeNode build(int[] pre, int bound) {
        if (i == pre.length || pre[i] > bound) return null;
        TreeNode root = new TreeNode(pre[i++]);
        root.left = build(pre, root.val);
        root.right = build(pre, bound);
        return root;
    }
}` },
      { title: "Inorder Successor in BST", difficulty: "Medium", lc: "LC 285/GFG", priority: 1, statement: "Successor of node p in BST (next larger).", example: "If p.right exists, min of right; else first ancestor where we came from left.", approach: "One pass from root tracking candidate.", time: "O(h)", space: "O(1)", code: `class Solution {
    public TreeNode inorderSuccessor(TreeNode root, TreeNode p) {
        TreeNode succ = null;
        while (root != null) {
            if (p.val >= root.val) root = root.right;
            else { succ = root; root = root.left; }
        }
        return succ;
    }
}` },
      { title: "Merge Two BSTs", difficulty: "Medium", lc: "GFG", priority: 1, statement: "Merge two BSTs into sorted list or balanced structure.", example: "Inorder both → merge sorted arrays → rebuild, or iterative merge.", approach: "Stack iterators on both trees like merge sorted lists.", time: "O(m+n)", space: "O(h1+h2)", code: `class Solution {
    public List<Integer> merge(TreeNode r1, TreeNode r2) {
        List<Integer> res = new ArrayList<>();
        Deque<TreeNode> s1 = new ArrayDeque<>(), s2 = new ArrayDeque<>();
        TreeNode a = r1, b = r2;
        while (!s1.isEmpty() || !s2.isEmpty() || a != null || b != null) {
            while (a != null) { s1.push(a); a = a.left; }
            while (b != null) { s2.push(b); b = b.left; }
            if (s2.isEmpty() || (!s1.isEmpty() && s1.peek().val <= s2.peek().val)) {
                TreeNode n = s1.pop(); res.add(n.val); a = n.right;
            } else {
                TreeNode n = s2.pop(); res.add(n.val); b = n.right;
            }
        }
        return res;
    }
}` },
      { title: "Two Sum in BST", difficulty: "Medium", lc: "LC 653", priority: 1, statement: "Exists two nodes with values summing to k?", example: "HashSet while traversing or BST two-pointer with deque.", approach: "Inorder to list + two pointers, or HashSet O(n).", time: "O(n)", space: "O(n)", code: `class Solution {
    public boolean findTarget(TreeNode root, int k) {
        Set<Integer> seen = new HashSet<>();
        return dfs(root, k, seen);
    }
    boolean dfs(TreeNode n, int k, Set<Integer> s) {
        if (n == null) return false;
        if (s.contains(k - n.val)) return true;
        s.add(n.val);
        return dfs(n.left, k, s) || dfs(n.right, k, s);
    }
}` },
      { title: "LCA in BST", difficulty: "Easy", lc: "LC 235", priority: 1, statement: "Lowest common ancestor where both p and q in BST.", example: "Walk from root: if both < root go left; both > go right; else root.", approach: "Single pass using BST ordering.", time: "O(h)", space: "O(1)", code: `class Solution {
    public TreeNode lowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q) {
        int a = Math.min(p.val, q.val), b = Math.max(p.val, q.val);
        while (root != null) {
            if (root.val > b) root = root.left;
            else if (root.val < a) root = root.right;
            else return root;
        }
        return null;
    }
}` },
      { title: "Ceil in BST", difficulty: "Medium", lc: "GFG", priority: 2, statement: "Smallest node value ≥ x (or -1 if none).", example: "Walk: go right if val < x else track ans and go left.", approach: "Iterative BST search variant.", time: "O(h)", space: "O(1)", code: `class Solution {
    public int ceil(TreeNode root, int x) {
        // TODO: Implement
        return -1;
    }
}` },
      { title: "Floor in BST", difficulty: "Medium", lc: "GFG", priority: 2, statement: "Largest node value ≤ x.", example: "Mirror of ceil walk.", approach: "If val <= x update ans and go right; else go left.", time: "O(h)", space: "O(1)", code: `class Solution {
    public int floor(TreeNode root, int x) {
        // TODO: Implement
        return -1;
    }
}` },
      { title: "Insert in BST", difficulty: "Medium", lc: "LC 701", priority: 2, statement: "Insert val keeping BST; return root.", example: "Leaf attach or iterative parent chase.", approach: "Recursive: if null new node; else left or right.", time: "O(h)", space: "O(h)", code: `class Solution {
    public TreeNode insertIntoBST(TreeNode root, int val) {
        // TODO: Implement
        return root;
    }
}` },
      { title: "Search in BST", difficulty: "Easy", lc: "LC 700", priority: 3, statement: "Search value in BST.", example: "Standard BST descent.", approach: "Compare val with root.", time: "O(h)", space: "O(1)", code: `class Solution {
    public TreeNode searchBST(TreeNode root, int val) {
        // TODO: Implement
        return null;
    }
}` }
    ]
  },
  {
    id: "bs",
    name: "Binary Search",
    icon: "⊘",
    topicPriority: 5,
    accent: "#60a5fa",
    description: "BS on answers is the most important pattern. Master the template.",
    problems: [
      { title: "Median of Two Sorted Arrays", difficulty: "Hard", lc: "LC 4", priority: 0, statement: "Median of two sorted arrays in O(log(min(m,n))).", example: "Partition smaller array so left halves contain (m+n+1)/2 elements.", approach: "Binary search cut in A; derive cut in B; adjust by l1 vs r2.", time: "O(log(min(m,n)))", space: "O(1)", code: `class Solution {
    public double findMedianSortedArrays(int[] a, int[] b) {
        if (a.length > b.length) return findMedianSortedArrays(b, a);
        int m = a.length, n = b.length, lo = 0, hi = m;
        while (lo <= hi) {
            int c1 = (lo + hi) / 2, c2 = (m + n + 1) / 2 - c1;
            int l1 = c1 == 0 ? Integer.MIN_VALUE : a[c1 - 1], l2 = c2 == 0 ? Integer.MIN_VALUE : b[c2 - 1];
            int r1 = c1 == m ? Integer.MAX_VALUE : a[c1], r2 = c2 == n ? Integer.MAX_VALUE : b[c2];
            if (l1 <= r2 && l2 <= r1)
                return (m + n) % 2 == 0 ? (Math.max(l1, l2) + Math.min(r1, r2)) / 2.0 : Math.max(l1, l2);
            if (l1 > r2) hi = c1 - 1; else lo = c1 + 1;
        }
        return 0;
    }
}` },
      { title: "Split Array Largest Sum", difficulty: "Hard", lc: "LC 410", priority: 0, statement: "Split into k non-empty subarrays minimizing largest subarray sum.", example: "BS on answer between max element and sum.", approach: "Feasible if subarray count ≤ k for mid cap.", time: "O(n * log(sum-max))", space: "O(1)", code: `class Solution {
    public int splitArray(int[] nums, int k) {
        int lo = 0, hi = 0;
        for (int n : nums) { lo = Math.max(lo, n); hi += n; }
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2, cnt = 1, s = 0;
            for (int n : nums) {
                s += n;
                if (s > mid) { cnt++; s = n; }
            }
            if (cnt <= k) hi = mid; else lo = mid + 1;
        }
        return lo;
    }
}` },
      { title: "Aggressive Cows", difficulty: "Hard", lc: "SPOJ/GFG", priority: 0, statement: "Maximize minimum distance between c cows in stalls.", example: "BS on distance; greedy placement from sorted stalls.", approach: "Check(mid): count cows with last position rule.", time: "O(n log range)", space: "O(1)", code: `class Solution {
    public int aggressiveCows(int[] stalls, int c) {
        java.util.Arrays.sort(stalls);
        int lo = 1, hi = stalls[stalls.length - 1] - stalls[0];
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2, cnt = 1, last = stalls[0];
            for (int i = 1; i < stalls.length; i++)
                if (stalls[i] - last >= mid) { cnt++; last = stalls[i]; }
            if (cnt >= c) lo = mid + 1; else hi = mid - 1;
        }
        return hi;
    }
}` },
      { title: "Book Allocation", difficulty: "Hard", lc: "GFG", priority: 0, statement: "Minimize maximum pages allocated to m students (contiguous books).", example: "Same feasibility as split array / ship packages.", approach: "BS on max pages; greedy count students.", time: "O(n * log(sum-max))", space: "O(1)", code: `class Solution {
    public int findPages(int[] a, int m) {
        if (m > a.length) return -1;
        int lo = 0, hi = 0;
        for (int x : a) { lo = Math.max(lo, x); hi += x; }
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2, st = 1, s = 0;
            for (int x : a) {
                s += x;
                if (s > mid) { st++; s = x; }
            }
            if (st <= m) hi = mid; else lo = mid + 1;
        }
        return lo;
    }
}` },
      { title: "Search in Rotated Sorted Array I", difficulty: "Medium", lc: "LC 33", priority: 0, statement: "Find index of target in rotated distinct sorted array.", example: "Identify sorted half; check if target in range.", approach: "Binary search with nums[lo]<=nums[mid] branch.", time: "O(log n)", space: "O(1)", code: `class Solution {
    public int search(int[] nums, int target) {
        int lo = 0, hi = nums.length - 1;
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;
            if (nums[mid] == target) return mid;
            if (nums[lo] <= nums[mid]) {
                if (target >= nums[lo] && target < nums[mid]) hi = mid - 1;
                else lo = mid + 1;
            } else {
                if (target > nums[mid] && target <= nums[hi]) lo = mid + 1;
                else hi = mid - 1;
            }
        }
        return -1;
    }
}` },
      { title: "Search in Rotated Sorted Array II", difficulty: "Medium", lc: "LC 81", priority: 0, statement: "Rotated array with duplicates; return if target exists.", example: "When nums[lo]==nums[mid]==nums[hi], shrink window.", approach: "LC 33 + linear shrink on ambiguity.", time: "O(log n) avg", space: "O(1)", code: `class Solution {
    public boolean search(int[] nums, int target) {
        int lo = 0, hi = nums.length - 1;
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;
            if (nums[mid] == target) return true;
            if (nums[lo] == nums[mid] && nums[mid] == nums[hi]) { lo++; hi--; continue; }
            if (nums[lo] <= nums[mid]) {
                if (target >= nums[lo] && target < nums[mid]) hi = mid - 1;
                else lo = mid + 1;
            } else {
                if (target > nums[mid] && target <= nums[hi]) lo = mid + 1;
                else hi = mid - 1;
            }
        }
        return false;
    }
}` },
      { title: "Find Minimum in Rotated Sorted Array", difficulty: "Medium", lc: "LC 153", priority: 0, statement: "Min element in rotated sorted array without duplicates.", example: "nums[mid] > nums[hi] → min in right half.", approach: "Binary search comparing mid to right bound.", time: "O(log n)", space: "O(1)", code: `class Solution {
    public int findMin(int[] nums) {
        int lo = 0, hi = nums.length - 1;
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;
            if (nums[mid] > nums[hi]) lo = mid + 1;
            else hi = mid;
        }
        return nums[lo];
    }
}` },
      { title: "Minimize Max Distance to Gas Station", difficulty: "Hard", lc: "LC 774", priority: 1, statement: "Add k stations to minimize maximum gap between adjacent stations.", example: "BS on real-valued answer; count needed stations per gap.", approach: "Feasible if sum floor((gap-1)/mid) <= k for distance mid.", time: "O(n log(range/eps))", space: "O(1)", code: `class Solution {
    public double minmaxGasDist(int[] st, int k) {
        double lo = 0, hi = 0;
        for (int i = 1; i < st.length; i++) hi = Math.max(hi, st[i] - st[i - 1]);
        while (hi - lo > 1e-6) {
            double mid = (lo + hi) / 2;
            int cnt = 0;
            for (int i = 1; i < st.length; i++)
                cnt += (int) ((st[i] - st[i - 1]) / mid);
            if (cnt <= k) hi = mid; else lo = mid;
        }
        return hi;
    }
}` },
      { title: "Kth Element of Two Sorted Arrays", difficulty: "Hard", lc: "GFG", priority: 1, statement: "kth smallest in union of two sorted arrays (1-indexed).", example: "Partition A and B so left has k elements and max(left) <= min(right).", approach: "Binary search smaller array cut position.", time: "O(log(min(m,n)))", space: "O(1)", code: `class Solution {
    public int kthElement(int[] a, int[] b, int k) {
        if (a.length > b.length) return kthElement(b, a, k);
        int m = a.length, n = b.length, lo = Math.max(0, k - n), hi = Math.min(k, m);
        while (lo <= hi) {
            int c1 = (lo + hi) / 2, c2 = k - c1;
            int l1 = c1 == 0 ? Integer.MIN_VALUE : a[c1 - 1], l2 = c2 == 0 ? Integer.MIN_VALUE : b[c2 - 1];
            int r1 = c1 == m ? Integer.MAX_VALUE : a[c1], r2 = c2 == n ? Integer.MAX_VALUE : b[c2];
            if (l1 <= r2 && l2 <= r1) return Math.max(l1, l2);
            if (l1 > r2) hi = c1 - 1; else lo = c1 + 1;
        }
        return -1;
    }
}` },
      { title: "Find Peak Element in 2D Matrix", difficulty: "Medium", lc: "LC 1901", priority: 1, statement: "Any peak: strictly greater than 4-neighbors (boundary -inf).", example: "BS on row index using max column in mid row.", approach: "Compare mid row max with neighbors below; move to larger side.", time: "O(n log m)", space: "O(1)", code: `class Solution {
    public int[] findPeakGrid(int[][] mat) {
        int lo = 0, hi = mat.length - 1;
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;
            int j = maxCol(mat[mid]);
            if (mat[mid][j] < mat[mid + 1][j]) lo = mid + 1;
            else hi = mid;
        }
        return new int[] { lo, maxCol(mat[lo]) };
    }
    int maxCol(int[] r) {
        int j = 0;
        for (int c = 1; c < r.length; c++) if (r[c] > r[j]) j = c;
        return j;
    }
}` },
      { title: "Find First and Last Position", difficulty: "Medium", lc: "LC 34", priority: 1, statement: "First and last index of target in sorted array.", example: "Lower bound + upper bound style BS.", approach: "Two binary searches for leftmost and rightmost.", time: "O(log n)", space: "O(1)", code: `class Solution {
    public int[] searchRange(int[] nums, int target) {
        return new int[] { lb(nums, target, true), lb(nums, target, false) };
    }
    int lb(int[] a, int t, boolean first) {
        int lo = 0, hi = a.length - 1, ans = -1;
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;
            if (a[mid] == t) { ans = mid; if (first) hi = mid - 1; else lo = mid + 1; }
            else if (a[mid] < t) lo = mid + 1; else hi = mid - 1;
        }
        return ans;
    }
}` },
      { title: "Single Element in Sorted Array", difficulty: "Medium", lc: "LC 540", priority: 1, statement: "Every element appears twice except one; array is sorted.", example: "BS on even index pairing before single.", approach: "Align mid to even; compare pair to decide side.", time: "O(log n)", space: "O(1)", code: `class Solution {
    public int singleNonDuplicate(int[] nums) {
        int lo = 0, hi = nums.length - 1;
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;
            if (mid % 2 == 1) mid--;
            if (nums[mid] == nums[mid + 1]) lo = mid + 2;
            else hi = mid;
        }
        return nums[lo];
    }
}` },
      { title: "Find Peak Element", difficulty: "Medium", lc: "LC 162", priority: 1, statement: "Any index i where nums[i] > neighbors (assume -inf outside).", example: "Binary search: if nums[mid] < nums[mid+1] go right.", approach: "Always move toward larger neighbor.", time: "O(log n)", space: "O(1)", code: `class Solution {
    public int findPeakElement(int[] nums) {
        int lo = 0, hi = nums.length - 1;
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;
            if (nums[mid] < nums[mid + 1]) lo = mid + 1;
            else hi = mid;
        }
        return lo;
    }
}` },
      { title: "Search in 2D Matrix", difficulty: "Medium", lc: "LC 74", priority: 1, statement: "Matrix sorted row-wise and first of row > last of previous row.", example: "Flatten index binary search.", approach: "mid maps to (mid/n, mid%n).", time: "O(log(mn))", space: "O(1)", code: `class Solution {
    public boolean searchMatrix(int[][] mat, int target) {
        int m = mat.length, n = mat[0].length, lo = 0, hi = m * n - 1;
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2, v = mat[mid / n][mid % n];
            if (v == target) return true;
            if (v < target) lo = mid + 1; else hi = mid - 1;
        }
        return false;
    }
}` },
      { title: "Search in Row-Col Sorted Matrix", difficulty: "Medium", lc: "LC 240", priority: 1, statement: "Each row and column sorted ascending.", example: "Start top-right.", approach: "Eliminate row or column each step.", time: "O(m+n)", space: "O(1)", code: `class Solution {
    public boolean searchMatrix(int[][] mat, int target) {
        int r = 0, c = mat[0].length - 1;
        while (r < mat.length && c >= 0) {
            if (mat[r][c] == target) return true;
            if (mat[r][c] > target) c--; else r++;
        }
        return false;
    }
}` },
      { title: "Koko Eating Bananas", difficulty: "Medium", lc: "LC 875", priority: 1, statement: "Min integer eating speed to finish all piles in h hours.", example: "BS on speed; hours = sum ceil(pile/speed).", approach: "Monotone feasibility.", time: "O(n log max)", space: "O(1)", code: `class Solution {
    public int minEatingSpeed(int[] piles, int h) {
        int lo = 1, hi = 0;
        for (int p : piles) hi = Math.max(hi, p);
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;
            long hrs = 0;
            for (int p : piles) hrs += (p + mid - 1) / mid;
            if (hrs <= h) hi = mid; else lo = mid + 1;
        }
        return lo;
    }
}` },
      { title: "Minimum Days to Make M Bouquets", difficulty: "Medium", lc: "LC 1482", priority: 1, statement: "Need m bouquets of k adjacent bloomed flowers; min day?", example: "BS on day; greedy count bouquets.", approach: "Feasible if bouquets >= m.", time: "O(n log(max-min))", space: "O(1)", code: `class Solution {
    public int minDays(int[] bd, int m, int k) {
        if ((long) m * k > bd.length) return -1;
        int lo = Integer.MAX_VALUE, hi = Integer.MIN_VALUE;
        for (int d : bd) { lo = Math.min(lo, d); hi = Math.max(hi, d); }
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2, bq = 0, fl = 0;
            for (int d : bd) {
                if (d <= mid) { fl++; if (fl == k) { bq++; fl = 0; } }
                else fl = 0;
            }
            if (bq >= m) hi = mid; else lo = mid + 1;
        }
        return lo;
    }
}` },
      { title: "Smallest Divisor Given Threshold", difficulty: "Medium", lc: "LC 1283", priority: 1, statement: "Smallest d such that sum ceil(nums[i]/d) <= threshold.", example: "BS d in [1, max(nums)].", approach: "Sum decreases as d increases.", time: "O(n log max)", space: "O(1)", code: `class Solution {
    public int smallestDivisor(int[] nums, int t) {
        int lo = 1, hi = 0;
        for (int n : nums) hi = Math.max(hi, n);
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2, s = 0;
            for (int n : nums) s += (n + mid - 1) / mid;
            if (s <= t) hi = mid; else lo = mid + 1;
        }
        return lo;
    }
}` },
      { title: "Capacity to Ship Packages", difficulty: "Medium", lc: "LC 1011", priority: 1, statement: "Min ship capacity to ship within days days.", example: "Same as split array / book allocation.", approach: "BS on capacity + greedy days.", time: "O(n log sum)", space: "O(1)", code: `class Solution {
    public int shipWithinDays(int[] w, int days) {
        int lo = 0, hi = 0;
        for (int x : w) { lo = Math.max(lo, x); hi += x; }
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2, d = 1, s = 0;
            for (int x : w) {
                s += x;
                if (s > mid) { d++; s = x; }
            }
            if (d <= days) hi = mid; else lo = mid + 1;
        }
        return lo;
    }
}` },
      { title: "Matrix Median", difficulty: "Hard", lc: "GFG", priority: 2, statement: "Median of n x m matrix (each row sorted).", example: "BS on value counting <= mid in each row.", approach: "Count numbers <= mid via row BS.", time: "O(n * m * log(max))", space: "O(1)", code: `class Solution {
    public int median(int[][] mat) {
        // TODO: Implement
        return 0;
    }
}` },
      { title: "Lower Bound / Upper Bound", difficulty: "Medium", lc: "GFG", priority: 2, statement: "First index with a[i] >= x (lower); first with a[i] > x (upper).", example: "Classic half-open interval BS.", approach: "lo<hi mid in [lo,hi).", time: "O(log n)", space: "O(1)", code: `class Solution {
    public int lowerBound(int[] a, int x) {
        // TODO: Implement
        return 0;
    }
}` },
      { title: "Floor/Ceil in Sorted Array", difficulty: "Medium", lc: "GFG", priority: 2, statement: "Floor and ceil of x in sorted array (duplicates allowed).", example: "BS variants or two passes.", approach: "Floor = last < x; ceil = first >= x.", time: "O(log n)", space: "O(1)", code: `class Solution {
    public int[] floorCeil(int[] a, int x) {
        // TODO: Implement
        return new int[] { -1, -1 };
    }
}` },
      { title: "Count Occurrences in Sorted Array", difficulty: "Medium", lc: "GFG", priority: 2, statement: "Count frequency of x in sorted array.", example: "upperBound(x) - lowerBound(x).", approach: "Two BS for first and last occurrence.", time: "O(log n)", space: "O(1)", code: `class Solution {
    public int count(int[] a, int x) {
        // TODO: Implement
        return 0;
    }
}` },
      { title: "Find How Many Times Array Rotated", difficulty: "Medium", lc: "GFG", priority: 2, statement: "Count rotations = index of minimum in rotated sorted array.", example: "Same as find pivot / min index.", approach: "BS comparing mid to hi for min in no-dup case.", time: "O(log n)", space: "O(1)", code: `class Solution {
    public int rotationCount(int[] nums) {
        // TODO: Implement
        return 0;
    }
}` },
      { title: "Row with Maximum 1s", difficulty: "Medium", lc: "GFG", priority: 2, statement: "Binary matrix sorted rows; row with most 1s.", example: "Start top-right; move down/left.", approach: "O(n+m) walk or BS each row.", time: "O(n+m)", space: "O(1)", code: `class Solution {
    public int rowWithMax1s(int[][] mat) {
        // TODO: Implement
        return -1;
    }
}` },
      { title: "Search Insert Position", difficulty: "Easy", lc: "LC 35", priority: 2, statement: "Index to insert target to keep sorted order.", example: "Lower bound.", approach: "first position with val >= target.", time: "O(log n)", space: "O(1)", code: `class Solution {
    public int searchInsert(int[] nums, int target) {
        // TODO: Implement
        return 0;
    }
}` },
      { title: "Sqrt(x)", difficulty: "Easy", lc: "LC 69", priority: 2, statement: "Integer square root floor.", example: "BS on [0,x].", approach: "mid*mid compare with x (long).", time: "O(log x)", space: "O(1)", code: `class Solution {
    public int mySqrt(int x) {
        // TODO: Implement
        return 0;
    }
}` },
      { title: "Kth Missing Positive Number", difficulty: "Easy", lc: "LC 1539", priority: 2, statement: "kth positive integer missing from strictly increasing arr.", example: "BS on count missing before index.", approach: "arr[mid]-(mid+1) < k → go right.", time: "O(log n)", space: "O(1)", code: `class Solution {
    public int findKthPositive(int[] arr, int k) {
        // TODO: Implement
        return 0;
    }
}` },
      { title: "Binary Search", difficulty: "Easy", lc: "LC 704", priority: 3, statement: "Classic search in sorted array for target index or -1.", example: "lo<=hi mid comparison.", approach: "Standard half-interval invariant.", time: "O(log n)", space: "O(1)", code: `class Solution {
    public int search(int[] nums, int target) {
        // TODO: Implement
        return -1;
    }
}` }
    ]
  },
  {
    id: "arrays",
    name: "Arrays",
    icon: "▤",
    topicPriority: 6,
    accent: "#fb923c",
    description: "Foundation topic. Two pointers, prefix sums, Kadane's. Easy to warm up on.",
    problems: [
      { title: "Reverse Pairs", difficulty: "Hard", lc: "LC 493", priority: 0, statement: "Count pairs i<j with nums[i]>2*nums[j].", example: "[1,3,2,3,1] → 2", approach: "Merge sort: count cross pairs before merge, then merge sorted halves.", time: "O(n log n)", space: "O(n)", code: `class Solution {
    public int reversePairs(int[] a) { return sort(a,0,a.length-1); }
    int sort(int[] a,int l,int r){ if(l>=r)return 0; int m=(l+r)/2,c=sort(a,l,m)+sort(a,m+1,r),j=m+1; for(int i=l;i<=m;i++){ while(j<=r&&(long)a[i]>2L*a[j]) j++; c+=j-(m+1); } merge(a,l,m,r); return c; }
    void merge(int[] a,int l,int m,int r){ int[] t=java.util.Arrays.copyOfRange(a,l,r+1); int i=0,j=m-l+1,k=l; while(i<=m-l&&j<=r-l) a[k++]=(t[i]<=t[j])?t[i++]:t[j++]; while(i<=m-l)a[k++]=t[i++]; while(j<=r-l)a[k++]=t[j++]; }
}` },
      { title: "Count Inversions", difficulty: "Hard", lc: "GFG", priority: 0, statement: "Count pairs (i,j) with i<j and arr[i]>arr[j].", example: "[2,4,1,3,5] → 3", approach: "Merge sort; add mid-right inversions when merging.", time: "O(n log n)", space: "O(n)", code: `class Solution {
    long inv=0; public long inversionCount(long[] a,int n){ mergeSort(a,0,n-1); return inv; }
    void mergeSort(long[] a,int l,int r){ if(l>=r)return; int m=l+r>>1; mergeSort(a,l,m); mergeSort(a,m+1,r); merge(a,l,m,r); }
    void merge(long[] a,int l,int m,int r){ int i=l,j=m+1,k=0; long[] t=new long[r-l+1]; while(i<=m&&j<=r) if(a[i]<=a[j]) t[k++]=a[i++]; else { inv+=m-i+1; t[k++]=a[j++]; } while(i<=m)t[k++]=a[i++]; while(j<=r)t[k++]=a[j++]; System.arraycopy(t,0,a,l,r-l+1); }
}` },
      { title: "Sort Colors", difficulty: "Medium", lc: "LC 75", priority: 0, statement: "Sort array of 0,1,2 in-place.", example: "[2,0,2,1,1,0] → [0,0,1,1,2,2]", approach: "Dutch national flag: three pointers low, mid, high.", time: "O(n)", space: "O(1)", code: `class Solution {
    public void sortColors(int[] n) { int l=0,m=0,h=n.length-1; while(m<=h) if(n[m]==0){ int t=n[l];n[l]=n[m];n[m]=t; l++;m++; } else if(n[m]==1) m++; else { int t=n[m];n[m]=n[h];n[h]=t; h--; } }
}` },
      { title: "Maximum Subarray (Kadane's)", difficulty: "Medium", lc: "LC 53", priority: 0, statement: "Find contiguous subarray with largest sum.", example: "[-2,1,-3,4,-1,2,1,-5,4] → 6", approach: "Kadane: cur=max(x,cur+x), ans=max(ans,cur).", time: "O(n)", space: "O(1)", code: `class Solution {
    public int maxSubArray(int[] a) { int s=0,b=Integer.MIN_VALUE; for(int x:a){ s=Math.max(x,s+x); b=Math.max(b,s); } return b; }
}` },
      { title: "Next Permutation", difficulty: "Medium", lc: "LC 31", priority: 0, statement: "Rearrange to lexicographically next greater permutation; if none, smallest.", example: "[1,2,3]→[1,3,2]", approach: "Find pivot from right, swap with next larger on right, reverse suffix.", time: "O(n)", space: "O(1)", code: `class Solution {
    public void nextPermutation(int[] a) { int i=a.length-2; while(i>=0&&a[i]>=a[i+1]) i--; if(i>=0){ int j=a.length-1; while(a[j]<=a[i]) j--; swap(a,i,j); } rev(a,i+1,a.length-1); }
    void swap(int[]a,int i,int j){int t=a[i];a[i]=a[j];a[j]=t;}
    void rev(int[]a,int l,int r){ while(l<r) swap(a,l++,r--); }
}` },
      { title: "Longest Consecutive Sequence", difficulty: "Medium", lc: "LC 128", priority: 0, statement: "Length of longest consecutive elements sequence (unsorted).", example: "[100,4,200,1,3,2] → 4", approach: "HashSet: start count only from sequence starts.", time: "O(n)", space: "O(n)", code: `class Solution {
    public int longestConsecutive(int[] a) { java.util.HashSet<Integer> s=new java.util.HashSet<>(); for(int x:a)s.add(x); int b=0; for(int x:s) if(!s.contains(x-1)){ int c=1; while(s.contains(x+c)) c++; b=Math.max(b,c);} return b; }
}` },
      { title: "Set Matrix Zeros", difficulty: "Medium", lc: "LC 73", priority: 0, statement: "If cell is 0, set its whole row and column to 0 in-place.", example: "[[1,1,1],[1,0,1],[1,1,1]]", approach: "Use first row/col as markers; handle overlaps.", time: "O(m*n)", space: "O(1)", code: `class Solution {
    public void setZeroes(int[][] m) { int r=m.length,c=m[0].length,f1=0,f2=0; for(int j=0;j<c;j++) if(m[0][j]==0)f1=1; for(int i=0;i<r;i++) if(m[i][0]==0)f2=1; for(int i=1;i<r;i++) for(int j=1;j<c;j++) if(m[i][j]==0){m[i][0]=m[0][j]=0;} for(int i=1;i<r;i++) for(int j=1;j<c;j++) if(m[i][0]==0||m[0][j]==0)m[i][j]=0; if(f1==1) for(int j=0;j<c;j++)m[0][j]=0; if(f2==1) for(int i=0;i<r;i++)m[i][0]=0; }
}` },
      { title: "Subarray Sum Equals K", difficulty: "Medium", lc: "LC 560", priority: 0, statement: "Count contiguous subarrays with sum k.", example: "[1,1,1], k=2 → 2", approach: "Prefix sum + HashMap count of prefix sums.", time: "O(n)", space: "O(n)", code: `class Solution {
    public int subarraySum(int[] a, int k) { java.util.Map<Integer,Integer> m=new java.util.HashMap<>(); m.put(0,1); int s=0,c=0; for(int x:a){ s+=x; c+=m.getOrDefault(s-k,0); m.merge(s,1,Integer::sum); } return c; }
}` },
      { title: "3Sum", difficulty: "Medium", lc: "LC 15", priority: 0, statement: "Return all unique triplets that sum to 0.", example: "[-1,0,1,2,-1,-4] → [[-1,-1,2],[-1,0,1]]", approach: "Sort, fix i, two pointers for j,k; skip duplicates.", time: "O(n²)", space: "O(1) excl. output", code: `class Solution {
    public java.util.List<java.util.List<Integer>> threeSum(int[] a) { java.util.Arrays.sort(a); java.util.List<java.util.List<Integer>> r=new java.util.ArrayList<>(); int n=a.length; for(int i=0;i<n;i++){ if(i>0&&a[i]==a[i-1]) continue; int j=i+1,k=n-1; while(j<k){ int s=a[i]+a[j]+a[k]; if(s==0){ r.add(java.util.List.of(a[i],a[j],a[k])); while(j<k&&a[j]==a[j+1]) j++; while(j<k&&a[k]==a[k-1]) k--; j++; k--; } else if(s<0) j++; else k--; } } return r; }
}` },
      { title: "Merge Overlapping Intervals", difficulty: "Medium", lc: "LC 56", priority: 0, statement: "Merge all overlapping intervals.", example: "[[1,3],[2,6],[8,10],[15,18]] → [[1,6],[8,10],[15,18]]", approach: "Sort by start; merge if cur.start<=prev.end.", time: "O(n log n)", space: "O(n)", code: `class Solution {
    public int[][] merge(int[][] x) { java.util.Arrays.sort(x,(a,b)->a[0]-b[0]); java.util.List<int[]> r=new java.util.ArrayList<>(); for(int[] t:x){ if(r.isEmpty()||r.get(r.size()-1)[1]<t[0]) r.add(t); else r.get(r.size()-1)[1]=Math.max(r.get(r.size()-1)[1],t[1]); } return r.toArray(new int[0][]); }
}` },
      { title: "Maximum Product Subarray", difficulty: "Medium", lc: "LC 152", priority: 0, statement: "Maximum product of contiguous subarray.", example: "[2,3,-2,4] → 6", approach: "Track min and max ending here (negatives swap roles).", time: "O(n)", space: "O(1)", code: `class Solution {
    public int maxProduct(int[] a) { int mx=a[0],mn=a[0],b=a[0]; for(int i=1;i<a.length;i++){ int x=a[i]; if(x<0){ int t=mx; mx=mn; mn=t; } mx=Math.max(x,mx*x); mn=Math.min(x,mn*x); b=Math.max(b,mx); } return b; }
}` },
      { title: "Best Time to Buy and Sell Stock", difficulty: "Easy", lc: "LC 121", priority: 0, statement: "One transaction: max profit.", example: "[7,1,5,3,6,4] → 5", approach: "Track min price so far, profit = price-min.", time: "O(n)", space: "O(1)", code: `class Solution {
    public int maxProfit(int[] p) { int mn=p[0],b=0; for(int i=1;i<p.length;i++){ b=Math.max(b,p[i]-mn); mn=Math.min(mn,p[i]); } return b; }
}` },
      { title: "Rotate Image", difficulty: "Medium", lc: "LC 48", priority: 1, statement: "Rotate n×n matrix 90° clockwise in-place.", example: "[[1,2,3],[4,5,6],[7,8,9]]", approach: "Transpose then reverse each row.", time: "O(n²)", space: "O(1)", code: `class Solution {
    public void rotate(int[][] m) { int n=m.length; for(int i=0;i<n;i++) for(int j=i+1;j<n;j++){ int t=m[i][j];m[i][j]=m[j][i];m[j][i]=t;} for(int[] r:m) for(int i=0,j=n-1;i<j;i++,j--){ int t=r[i];r[i]=r[j];r[j]=t;} }
}` },
      { title: "Spiral Matrix", difficulty: "Medium", lc: "LC 54", priority: 1, statement: "Return all elements in spiral order.", example: "[[1,2,3],[4,5,6],[7,8,9]] → [1,2,3,6,9,8,7,4,5]", approach: "Layer simulation with four boundaries.", time: "O(m*n)", space: "O(1) excl. output", code: `class Solution {
    public java.util.List<Integer> spiralOrder(int[][] m) { java.util.List<Integer> r=new java.util.ArrayList<>(); if(m.length==0)return r; int t=0,b=m.length-1,l=0,rt=m[0].length-1; while(true){ for(int j=l;j<=rt;j++) r.add(m[t][j]); if(++t>b)break; for(int i=t;i<=b;i++) r.add(m[i][rt]); if(--rt<l)break; for(int j=rt;j>=l;j--) r.add(m[b][j]); if(--b<t)break; for(int i=b;i>=t;i--) r.add(m[i][l]); if(++l>rt)break; } return r; }
}` },
      { title: "Majority Element II", difficulty: "Medium", lc: "LC 229", priority: 1, statement: "Elements appearing > n/3 times (at most two).", example: "[3,2,3] → [3]", approach: "Boyer–Moore voting for two candidates + verify.", time: "O(n)", space: "O(1)", code: `class Solution {
    public java.util.List<Integer> majorityElement(int[] a) { int c1=0,c2=0,n1=0,n2=0; for(int x:a){ if(x==n1)c1++; else if(x==n2)c2++; else if(c1==0){n1=x;c1=1;} else if(c2==0){n2=x;c2=1;} else {c1--;c2--;} } c1=c2=0; for(int x:a){ if(x==n1)c1++; else if(x==n2)c2++; } java.util.List<Integer> r=new java.util.ArrayList<>(); if(c1>a.length/3) r.add(n1); if(c2>a.length/3) r.add(n2); return r; }
}` },
      { title: "4Sum", difficulty: "Medium", lc: "LC 18", priority: 1, statement: "Unique quadruplets summing to target.", example: "[1,0,-1,0,-2,2], target=0", approach: "Sort, fix i,j, two pointers; skip duplicates.", time: "O(n³)", space: "O(1) excl. output", code: `class Solution {
    public java.util.List<java.util.List<Integer>> fourSum(int[] a, int t) { java.util.Arrays.sort(a); java.util.List<java.util.List<Integer>> r=new java.util.ArrayList<>(); int n=a.length; for(int i=0;i<n;i++){ if(i>0&&a[i]==a[i-1]) continue; for(int j=i+1;j<n;j++){ if(j>i+1&&a[j]==a[j-1]) continue; int x=j+1,y=n-1; while(x<y){ long s=(long)a[i]+a[j]+a[x]+a[y]; if(s==t){ r.add(java.util.List.of(a[i],a[j],a[x],a[y])); while(x<y&&a[x]==a[x+1]) x++; while(x<y&&a[y]==a[y-1]) y--; x++; y--; } else if(s<t) x++; else y--; } } } return r; }
}` },
      { title: "Count Subarrays with XOR K", difficulty: "Medium", lc: "GFG", priority: 1, statement: "Count subarrays whose XOR equals K.", example: "arr=[4,2,2,6,4], k=6 → 4", approach: "Prefix XOR + map freq of prefix; cur^K seen before.", time: "O(n)", space: "O(n)", code: `class Solution {
    public long subarrayXor(int[] a, int k) { java.util.Map<Integer,Integer> m=new java.util.HashMap<>(); m.put(0,1); int x=0; long c=0; for(int v:a){ x^=v; c+=m.getOrDefault(x^k,0); m.merge(x,1,Integer::sum); } return c; }
}` },
      { title: "Merge Sorted Arrays (In-Place)", difficulty: "Medium", lc: "LC 88", priority: 1, statement: "Merge nums2 into nums1 in-place (nums1 has trailing zeros).", example: "nums1=[1,2,3,0,0,0], m=3, nums2=[2,5,6], n=3", approach: "Fill from the end to avoid overwrite.", time: "O(m+n)", space: "O(1)", code: `class Solution {
    public void merge(int[] a, int m, int[] b, int n) { int i=m-1,j=n-1,k=m+n-1; while(j>=0) a[k--]=i>=0&&a[i]>b[j]?a[i--]:b[j--]; }
}` },
      { title: "Find Repeating and Missing Number", difficulty: "Medium", lc: "GFG", priority: 1, statement: "Array 1..n with one duplicate and one missing.", example: "arr=[3,1,3] → repeating 3, missing 2", approach: "Let A=m-r, B=m+r from sum and sum of squares.", time: "O(n)", space: "O(1)", code: `class Solution {
    public int[] findTwoElement(int[] a, int n) { long S=1L*n*(n+1)/2,S2=1L*n*(n+1)*(2L*n+1)/6,s=0,s2=0; for(int x:a){ s+=x; s2+=1L*x*x;} long A=S-s,B=(S2-s2)/A; int m=(int)((A+B)/2),r=(int)((B-A)/2); return new int[]{r,m}; }
}` },
      { title: "Two Sum", difficulty: "Easy", lc: "LC 1", priority: 1, statement: "Return indices of two numbers summing to target.", example: "[2,7,11,15], target=9 → [0,1]", approach: "HashMap value→index while scanning.", time: "O(n)", space: "O(n)", code: `class Solution {
    public int[] twoSum(int[] a, int t) { java.util.Map<Integer,Integer> m=new java.util.HashMap<>(); for(int i=0;i<a.length;i++){ int x=t-a[i]; if(m.containsKey(x)) return new int[]{m.get(x),i}; m.put(a[i],i); } return null; }
}` },
      { title: "Majority Element", difficulty: "Easy", lc: "LC 169", priority: 1, statement: "Element appearing > n/2 times.", example: "[2,2,1,1,1,2,2] → 2", approach: "Boyer–Moore voting.", time: "O(n)", space: "O(1)", code: `class Solution {
    public int majorityElement(int[] a) { int c=0,x=0; for(int v:a){ if(c==0){x=v;c=1;} else c+=v==x?1:-1; } return x; }
}` },
      { title: "Pascal's Triangle", difficulty: "Easy", lc: "LC 118", priority: 1, statement: "First numRows of Pascal's triangle.", example: "numRows=3 → [[1],[1,1],[1,2,1]]", approach: "Each row from previous: C(n,k)=C(n,k-1)*(n-k+1)/k.", time: "O(n²)", space: "O(n²)", code: `class Solution {
    public java.util.List<java.util.List<Integer>> generate(int r) { java.util.List<java.util.List<Integer>> o=new java.util.ArrayList<>(); for(int i=0;i<r;i++){ java.util.List<Integer> row=new java.util.ArrayList<>(i+1); row.add(1); for(int j=1;j<i;j++) row.add(o.get(i-1).get(j-1)+o.get(i-1).get(j)); if(i>0) row.add(1); o.add(row); } return o; }
}` },
      { title: "Longest Subarray with Sum K (Positives)", difficulty: "Medium", lc: "GFG", priority: 2, statement: "Longest subarray with sum exactly K (positive elements).", example: "[1,2,3,4,5], K=5 → length 2 ([2,3])", approach: "Sliding window with positive numbers only.", time: "O(n)", space: "O(1)", code: `class Solution {
    public int lenOfLongSubarr(int[] a, int n, int k) {
        // TODO: Implement
    }
}` },
      { title: "Rearrange Array Alternating Positive and Negative", difficulty: "Medium", lc: "LC 2149", priority: 2, statement: "Rearrange so positives and negatives alternate (extras at end).", example: "See LC", approach: "Two-pass placement or extra array with two pointers.", time: "O(n)", space: "O(n)", code: `class Solution {
    public int[] rearrangeArray(int[] a) {
        // TODO: Implement
    }
}` },
      { title: "Leaders in an Array", difficulty: "Medium", lc: "GFG", priority: 2, statement: "Elements >= everything to their right.", example: "[16,17,4,3,5,2] → [17,5,2]", approach: "Scan from right, track running max.", time: "O(n)", space: "O(1) excl. output", code: `class Solution {
    public java.util.ArrayList<Integer> leaders(int n, int[] a) {
        // TODO: Implement
    }
}` },
      { title: "Find Missing Number", difficulty: "Easy", lc: "LC 268", priority: 2, statement: "Missing number in [0..n] permutation.", example: "[3,0,1] → 2", approach: "XOR or Gauss sum.", time: "O(n)", space: "O(1)", code: `class Solution {
    public int missingNumber(int[] a) {
        // TODO: Implement
    }
}` },
      { title: "Single Number", difficulty: "Easy", lc: "LC 136", priority: 2, statement: "Every element appears twice except one.", example: "[4,1,2,1,2] → 4", approach: "XOR all.", time: "O(n)", space: "O(1)", code: `class Solution {
    public int singleNumber(int[] a) {
        // TODO: Implement
    }
}` },
      { title: "Check if Array Is Sorted and Rotated", difficulty: "Medium", lc: "LC 1752", priority: 3, statement: "Non-decreasing after at most one rotation?", example: "[3,4,5,1,2] → true", approach: "Count drops; valid if drops<=1 and wrap ok.", time: "O(n)", space: "O(1)", code: `class Solution {
    public boolean check(int[] a) {
        // TODO: Implement
    }
}` },
      { title: "Largest Element in Array", difficulty: "Easy", lc: "GFG", priority: 3, statement: "Return maximum value.", example: "[1,8,7,6,5] → 8", approach: "Linear scan.", time: "O(n)", space: "O(1)", code: `class Solution {
    public int largest(int[] a, int n) {
        // TODO: Implement
    }
}` },
      { title: "Second Largest Element", difficulty: "Easy", lc: "GFG", priority: 3, statement: "Second distinct maximum.", example: "[1,2,3,4] → 3", approach: "Track max and second in one pass.", time: "O(n)", space: "O(1)", code: `class Solution {
    public int print2largest(int[] a, int n) {
        // TODO: Implement
    }
}` },
      { title: "Remove Duplicates from Sorted Array", difficulty: "Easy", lc: "LC 26", priority: 3, statement: "In-place remove duplicates; return new length.", example: "[1,1,2] → length 2", approach: "Slow pointer for write position.", time: "O(n)", space: "O(1)", code: `class Solution {
    public int removeDuplicates(int[] a) {
        // TODO: Implement
    }
}` },
      { title: "Rotate Array", difficulty: "Easy", lc: "LC 189", priority: 3, statement: "Rotate right by k steps.", example: "[1,2,3,4,5,6,7], k=3", approach: "Reverse three segments.", time: "O(n)", space: "O(1)", code: `class Solution {
    public void rotate(int[] a, int k) {
        // TODO: Implement
    }
}` },
      { title: "Move Zeroes", difficulty: "Easy", lc: "LC 283", priority: 3, statement: "Move all 0s to end preserving order of non-zeros.", example: "[0,1,0,3,12]", approach: "Two pointers / snowball.", time: "O(n)", space: "O(1)", code: `class Solution {
    public void moveZeroes(int[] a) {
        // TODO: Implement
    }
}` },
      { title: "Max Consecutive Ones", difficulty: "Easy", lc: "LC 485", priority: 3, statement: "Longest run of 1s.", example: "[1,1,0,1,1,1] → 3", approach: "Single pass streak counter.", time: "O(n)", space: "O(1)", code: `class Solution {
    public int findMaxConsecutiveOnes(int[] a) {
        // TODO: Implement
    }
}` }
    ]
  },
  {
    id: "stack",
    name: "Stack & Queues",
    icon: "▥",
    topicPriority: 7,
    accent: "#f87171",
    description: "Monotonic stack is a top pattern. Next greater element template applies everywhere.",
    problems: [
      { title: "Trapping Rain Water", difficulty: "Hard", lc: "LC 42", priority: 0, statement: "Water trapped between bars after raining.", example: "[0,1,0,2,1,0,1,3,2,1,2,1] → 6", approach: "Two pointers with left/right max heights.", time: "O(n)", space: "O(1)", code: `class Solution {
    public int trap(int[] h) { int l=0,r=h.length-1,lm=0,rm=0,w=0; while(l<r) if(h[l]<h[r]){ if(h[l]>=lm) lm=h[l]; else w+=lm-h[l]; l++; } else { if(h[r]>=rm) rm=h[r]; else w+=rm-h[r]; r--; } return w; }
}` },
      { title: "Largest Rectangle in Histogram", difficulty: "Hard", lc: "LC 84", priority: 0, statement: "Largest rectangle area in histogram.", example: "[2,1,5,6,2,3] → 10", approach: "Monotonic stack of indices; compute width on pop.", time: "O(n)", space: "O(n)", code: `class Solution {
    public int largestRectangleArea(int[] a) { java.util.ArrayDeque<Integer> s=new java.util.ArrayDeque<>(); int b=0,n=a.length; for(int i=0;i<=n;i++){ int h=i<n?a[i]:0; while(!s.isEmpty()&&a[s.peek()]>h){ int j=s.pop(),w=s.isEmpty()?i:i-s.peek()-1; b=Math.max(b,a[j]*w);} s.push(i);} return b; }
}` },
      { title: "Maximal Rectangle", difficulty: "Hard", lc: "LC 85", priority: 0, statement: "Largest 1 rectangle in binary matrix.", example: "See LC", approach: "Heights per row + histogram stack.", time: "O(m*n)", space: "O(n)", code: `class Solution {
    public int maximalRectangle(char[][] m) { if(m.length==0)return 0; int c=m[0].length,h[]=new int[c+1],b=0; for(char[] r:m){ for(int j=0;j<c;j++) h[j]=r[j]=='1'?h[j]+1:0; java.util.ArrayDeque<Integer> s=new java.util.ArrayDeque<>(); for(int i=0;i<=c;i++){ while(!s.isEmpty()&&h[s.peek()]>h[i]){ int j=s.pop(),w=s.isEmpty()?i:i-s.peek()-1; b=Math.max(b,h[j]*w);} s.push(i);} } return b; }
}` },
      { title: "Sliding Window Maximum", difficulty: "Hard", lc: "LC 239", priority: 0, statement: "Max of each sliding window of size k.", example: "[1,3,-1,-3,5,3,6,7], k=3", approach: "Deque storing decreasing indices.", time: "O(n)", space: "O(k)", code: `class Solution {
    public int[] maxSlidingWindow(int[] a, int k) { int n=a.length,r[]=new int[n-k+1],j=0; java.util.ArrayDeque<Integer> d=new java.util.ArrayDeque<>(); for(int i=0;i<n;i++){ while(!d.isEmpty()&&d.peekFirst()<=i-k) d.pollFirst(); while(!d.isEmpty()&&a[d.peekLast()]<=a[i]) d.pollLast(); d.addLast(i); if(i>=k-1) r[j++]=a[d.peekFirst()]; } return r; }
}` },
      { title: "LFU Cache", difficulty: "Hard", lc: "LC 460", priority: 0, statement: "LFU cache with O(1) get/put.", example: "See LC", approach: "key→(val,freq); freq→LinkedHashSet keys; track minFreq.", time: "O(1)", space: "O(capacity)", code: `class LFUCache {
    int cap,min; java.util.Map<Integer,Integer> kv=new java.util.HashMap<>(),kf=new java.util.HashMap<>();
    java.util.Map<Integer,java.util.LinkedHashSet<Integer>> fk=new java.util.HashMap<>();
    public LFUCache(int c){cap=c;}
    void touch(int k,boolean inc){ int f=kf.get(k); fk.get(f).remove(k); if(fk.get(f).isEmpty()){ fk.remove(f); if(min==f) min++; } f+=inc?1:0; kf.put(k,f); fk.computeIfAbsent(f,z->new java.util.LinkedHashSet<>()).add(k); }
    public int get(int k){ if(!kv.containsKey(k)) return -1; touch(k,true); return kv.get(k); }
    public void put(int k,int v){ if(cap==0) return; if(kv.containsKey(k)){ kv.put(k,v); touch(k,true); return;} if(kv.size()==cap){ int ev=fk.get(min).iterator().next(); fk.get(min).remove(ev); if(fk.get(min).isEmpty()) fk.remove(min); kv.remove(ev); kf.remove(ev);} kv.put(k,v); kf.put(k,1); fk.computeIfAbsent(1,z->new java.util.LinkedHashSet<>()).add(k); min=1; }
}` },
      { title: "Sum of Subarray Minimums", difficulty: "Medium", lc: "LC 907", priority: 0, statement: "Sum of min of every subarray mod 1e9+7.", example: "[3,1,2,4] → 17", approach: "Monotonic stack: contribution of each as minimum.", time: "O(n)", space: "O(n)", code: `class Solution {
    public int sumSubarrayMins(int[] a) { int n=a.length,MOD=1_000_000_007; long r=0; int[] l=new int[n],ri=new int[n]; java.util.Arrays.fill(l,-1); java.util.Arrays.fill(ri,n); java.util.ArrayDeque<Integer> s=new java.util.ArrayDeque<>(); for(int i=0;i<n;i++){ while(!s.isEmpty()&&a[s.peek()]>=a[i]) s.pop(); l[i]=s.isEmpty()?-1:s.peek(); s.push(i);} s.clear(); for(int i=n-1;i>=0;i--){ while(!s.isEmpty()&&a[s.peek()]>a[i]) s.pop(); ri[i]=s.isEmpty()?n:s.peek(); s.push(i);} for(int i=0;i<n;i++) r=(r+1L*a[i]*(i-l[i])*(ri[i]-i))%MOD; return (int)r; }
}` },
      { title: "LRU Cache", difficulty: "Medium", lc: "LC 146", priority: 0, statement: "LRU cache O(1) get/put.", example: "See LC", approach: "HashMap + doubly linked list.", time: "O(1)", space: "O(capacity)", code: `class LRUCache {
    class Node{int k,v; Node p,n; Node(){}}
    java.util.Map<Integer,Node> m=new java.util.HashMap<>();
    int cap; Node head,tail;
    void add(Node x){ x.p=head; x.n=head.n; head.n.p=x; head.n=x; }
    void rem(Node x){ x.p.n=x.n; x.n.p=x.p; }
    public LRUCache(int c){ cap=c; head=new Node(); tail=new Node(); head.n=tail; tail.p=head; }
    public int get(int k){ if(!m.containsKey(k)) return -1; Node x=m.get(k); rem(x); add(x); return x.v; }
    public void put(int k,int v){ if(m.containsKey(k)){ Node x=m.get(k); x.v=v; rem(x); add(x); return;} if(m.size()==cap){ Node l=tail.p; rem(l); m.remove(l.k);} Node x=new Node(); x.k=k; x.v=v; m.put(k,x); add(x); }
}` },
      { title: "Sum of Subarray Ranges", difficulty: "Hard", lc: "LC 2104", priority: 1, statement: "Sum of (max-min) over every subarray in index range [left,right].", example: "See LC (bounded indices).", approach: "Sum of subarray maximums minus sum of subarray minimums (monotonic stacks).", time: "O(n)", space: "O(n)", code: `class Solution {
    public long subArrayRanges(int[] a) { return f(a,true)-f(a,false); }
    long f(int[] a,boolean mx){ int n=a.length; long r=0; java.util.ArrayDeque<Integer> d=new java.util.ArrayDeque<>(); for(int i=0;i<=n;i++){ int v=i<n?a[i]:mx?Integer.MAX_VALUE:Integer.MIN_VALUE; while(!d.isEmpty()&&(mx?a[d.peekLast()]<v:a[d.peekLast()]>v)){ int j=d.pollLast(),L=d.isEmpty()?-1:d.peekLast(),R=i; r+=1L*a[j]*(j-L)*(R-j);} d.addLast(i);} return r; }
}` },
      { title: "Min Stack", difficulty: "Medium", lc: "LC 155", priority: 1, statement: "Stack supporting push/pop/top/getMin in O(1).", example: "See LC", approach: "Aux stack of mins or store pairs.", time: "O(1)", space: "O(n)", code: `class MinStack {
    java.util.Stack<long[]> s=new java.util.Stack<>();
    public void push(int v){ if(s.isEmpty()) s.push(new long[]{v,v}); else s.push(new long[]{v,Math.min(v,s.peek()[1])}); }
    public void pop(){ s.pop(); }
    public int top(){ return (int)s.peek()[0]; }
    public int getMin(){ return (int)s.peek()[1]; }
}` },
      { title: "Next Greater Element II", difficulty: "Medium", lc: "LC 503", priority: 1, statement: "Next greater for circular array.", example: "[1,2,1] → [2,-1,2]", approach: "Monotonic stack, traverse 2n.", time: "O(n)", space: "O(n)", code: `class Solution {
    public int[] nextGreaterElements(int[] a) { int n=a.length,r[]=new int[n]; java.util.Arrays.fill(r,-1); java.util.ArrayDeque<Integer> s=new java.util.ArrayDeque<>(); for(int i=0;i<2*n;i++){ int v=a[i%n]; while(!s.isEmpty()&&a[s.peek()]<v) r[s.pop()]=v; if(i<n) s.push(i);} return r; }
}` },
      { title: "Asteroid Collision", difficulty: "Medium", lc: "LC 735", priority: 1, statement: "Simulate asteroid collisions.", example: "[5,10,-5] → [5,10]", approach: "Stack: resolve opposite signs.", time: "O(n)", space: "O(n)", code: `class Solution {
    public int[] asteroidCollision(int[] a) { java.util.Stack<Integer> s=new java.util.Stack<>(); for(int x:a){ boolean alive=true; while(alive&&x<0&&!s.isEmpty()&&s.peek()>0){ if(s.peek()<-x){ s.pop(); continue;} else if(s.peek()==-x){ s.pop();} alive=false; break;} if(alive) s.push(x);} int[] r=new int[s.size()]; for(int i=r.length-1;i>=0;i--) r[i]=s.pop(); return r; }
}` },
      { title: "Remove K Digits", difficulty: "Medium", lc: "LC 402", priority: 1, statement: "Remove k digits to get smallest number.", example: "num=\"1432219\", k=3 → \"1219\"", approach: "Monotonic increasing stack (greedy).", time: "O(n)", space: "O(n)", code: `class Solution {
    public String removeKdigits(String num, int k) { java.util.Stack<Character> s=new java.util.Stack<>(); for(char c:num.toCharArray()){ while(k>0&&!s.isEmpty()&&s.peek()>c){ s.pop(); k--; } s.push(c);} while(k-->0&&!s.isEmpty()) s.pop(); StringBuilder b=new StringBuilder(); while(!s.isEmpty()) b.append(s.pop()); b.reverse(); while(b.length()>1&&b.charAt(0)=='0') b.deleteCharAt(0); return b.length()==0?"0":b.toString(); }
}` },
      { title: "Online Stock Span", difficulty: "Medium", lc: "LC 901", priority: 1, statement: "Consecutive days price <= today's price.", example: "See LC", approach: "Stack of (price, span).", time: "O(1) amortized", space: "O(n)", code: `class StockSpanner {
    java.util.Stack<int[]> s=new java.util.Stack<>();
    public int next(int p){ int w=1; while(!s.isEmpty()&&s.peek()[0]<=p){ w+=s.pop()[1]; } s.push(new int[]{p,w}); return w; }
}` },
      { title: "Celebrity Problem", difficulty: "Medium", lc: "GFG", priority: 1, statement: "Find celebrity who knows nobody and everyone knows them.", example: "n=3 matrix", approach: "Elimination then verify in O(n).", time: "O(n)", space: "O(1)", code: `class Solution {
    public int celebrity(int n, int[][] M) { int c=0; for(int i=1;i<n;i++) if(M[c][i]==1) c=i; for(int i=0;i<n;i++) if(i!=c&&(M[c][i]==1||M[i][c]==0)) return -1; return c; }
}` },
      { title: "Daily Temperatures", difficulty: "Medium", lc: "LC 739", priority: 1, statement: "Days until warmer temperature.", example: "[73,74,75,71,69,72,76,73]", approach: "Monotonic decreasing stack of indices.", time: "O(n)", space: "O(n)", code: `class Solution {
    public int[] dailyTemperatures(int[] t) { int n=t.length,r[]=new int[n]; java.util.ArrayDeque<Integer> s=new java.util.ArrayDeque<>(); for(int i=0;i<n;i++){ while(!s.isEmpty()&&t[s.peek()]<t[i]){ int j=s.pop(); r[j]=i-j;} s.push(i);} return r; }
}` },
      { title: "Next Greater Element I", difficulty: "Easy", lc: "LC 496", priority: 1, statement: "Next greater of nums1 elements in nums2 (unique).", example: "See LC", approach: "Map from value to NGE using stack on nums2.", time: "O(m+n)", space: "O(n)", code: `class Solution {
    public int[] nextGreaterElement(int[] a, int[] b) { java.util.Map<Integer,Integer> m=new java.util.HashMap<>(); java.util.Stack<Integer> s=new java.util.Stack<>(); for(int x:b){ while(!s.isEmpty()&&s.peek()<x) m.put(s.pop(),x); s.push(x);} while(!s.isEmpty()) m.put(s.pop(),-1); int[] r=new int[a.length]; for(int i=0;i<a.length;i++) r[i]=m.get(a[i]); return r; }
}` },
      { title: "Next Smaller Element", difficulty: "Medium", lc: "GFG", priority: 2, statement: "For each index, next smaller to the right.", example: "Classic stack template.", approach: "Monotonic increasing stack.", time: "O(n)", space: "O(n)", code: `class Solution {
    public static int[] helpClassmate(int[] a, int n) {
        // TODO: Implement
    }
}` },
      { title: "Number of NGEs to the Right", difficulty: "Medium", lc: "GFG", priority: 2, statement: "For queries on indices, count next greater elements to the right.", example: "GFG variant", approach: "Offline queries + monotonic stack from right.", time: "O(n+q)", space: "O(n)", code: `class Solution {
    public static int[] countNge(int[] a, int[] q) {
        // TODO: Implement
    }
}` },
      { title: "Valid Parentheses", difficulty: "Easy", lc: "LC 20", priority: 2, statement: "Balanced ()[]{}?", example: "()[]{}", approach: "Stack of opening chars.", time: "O(n)", space: "O(n)", code: `class Solution {
    public boolean isValid(String s) {
        // TODO: Implement
    }
}` }
    ]
  },
  {
    id: "slidingwindow",
    name: "Sliding Window & Two Pointer",
    icon: "▦",
    topicPriority: 8,
    accent: "#facc15",
    description: "Very frequently asked. Pattern recognition is key.",
    problems: [
      { title: "Minimum Window Substring", difficulty: "Hard", lc: "LC 76", priority: 0, statement: "Smallest window of s containing all chars of t.", example: "s=\"ADOBECODEBANC\", t=\"ABC\" → \"BANC\"", approach: "Sliding window: miss counts chars from t still needed.", time: "O(|s|+|t|)", space: "O(|t|)", code: `class Solution {
    public String minWindow(String s, String t) { int[] m=new int[128]; for(char c:t.toCharArray()) m[c]++; int miss=t.length(),l=0,st=0,ln=Integer.MAX_VALUE; for(int r=0;r<s.length();r++){ if(m[s.charAt(r)]-->0) miss--; while(miss==0){ if(r-l+1<ln){ln=r-l+1;st=l;} if(m[s.charAt(l++)]++==0) miss++;} } return ln==Integer.MAX_VALUE?"":s.substring(st,st+ln); }
}` },
      { title: "Minimum Window Subsequence", difficulty: "Hard", lc: "LC 727", priority: 0, statement: "Smallest subsequence of S containing T in order.", example: "See LC", approach: "Greedy scan from each match of T[0] or DP O(mn).", time: "O(m*n)", space: "O(m*n)", code: `class Solution {
    public String minWindow(String S, String T) { int m=S.length(),n=T.length(),INF=m+1,l=0,b=INF; int[][] dp=new int[m+1][n+1]; for(int[] r:dp) java.util.Arrays.fill(r,INF); for(int i=0;i<=m;i++) dp[i][0]=i; for(int j=1;j<=n;j++) for(int i=1;i<=m;i++) if(S.charAt(i-1)==T.charAt(j-1)) dp[i][j]=dp[i-1][j-1]; else dp[i][j]=dp[i-1][j]; for(int i=1;i<=m;i++) if(dp[i][n]<INF){ int len=i-dp[i][n]; if(len<b){b=len; l=dp[i][n];} } return b==INF?"":S.substring(l,l+b); }
}` },
      { title: "Longest Substring Without Repeating Characters", difficulty: "Medium", lc: "LC 3", priority: 0, statement: "Longest substring with all unique characters.", example: "\"abcabcbb\" → 3", approach: "Sliding window with last index map.", time: "O(n)", space: "O(min(n,charset))", code: `class Solution {
    public int lengthOfLongestSubstring(String s) { int[] l=new int[128]; java.util.Arrays.fill(l,-1); int b=0,L=0; for(int i=0;i<s.length();i++){ char c=s.charAt(i); L=Math.max(L,l[c]+1); l[c]=i; b=Math.max(b,i-L+1);} return b; }
}` },
      { title: "Longest Repeating Character Replacement", difficulty: "Medium", lc: "LC 424", priority: 0, statement: "At most k changes; longest substring with same char.", example: "AABABBA, k=1 → 4", approach: "Window: valid if (len-maxfreq)<=k.", time: "O(n)", space: "O(1)", code: `class Solution {
    public int characterReplacement(String s, int k) { int[] c=new int[26]; int l=0,mx=0,b=0; for(int r=0;r<s.length();r++){ c[s.charAt(r)-'A']++; mx=Math.max(mx,c[s.charAt(r)-'A']); while(r-l+1-mx>k) c[s.charAt(l++)-'A']--; b=Math.max(b,r-l+1);} return b; }
}` },
      { title: "Longest Substring with At Most K Distinct Characters", difficulty: "Medium", lc: "LC 340", priority: 0, statement: "Longest substring with at most k distinct characters.", example: "See LC", approach: "Sliding window + freq map.", time: "O(n)", space: "O(k)", code: `class Solution {
    public int lengthOfLongestSubstringKDistinct(String s, int k) { if(k==0) return 0; int[] c=new int[256]; int d=0,l=0,b=0; for(int r=0;r<s.length();r++){ if(c[s.charAt(r)]++==0) d++; while(d>k) if(--c[s.charAt(l++)]==0) d--; b=Math.max(b,r-l+1);} return b; }
}` },
      { title: "Subarrays with K Different Integers", difficulty: "Hard", lc: "LC 992", priority: 1, statement: "Count subarrays with exactly k distinct integers.", example: "See LC", approach: "atMost(k)-atMost(k-1).", time: "O(n)", space: "O(n)", code: `class Solution {
    public int subarraysWithKDistinct(int[] a, int k) { return at(a,k)-at(a,k-1); }
    int at(int[] a,int k){ java.util.Map<Integer,Integer> m=new java.util.HashMap<>(); int l=0,c=0; for(int r=0;r<a.length;r++){ m.merge(a[r],1,Integer::sum); while(m.size()>k){ m.merge(a[l],-1,Integer::sum); if(m.get(a[l])==0) m.remove(a[l]); l++; } c+=r-l+1; } return c; }
}` },
      { title: "Maximum Consecutive Ones III", difficulty: "Medium", lc: "LC 1004", priority: 1, statement: "Flip at most k zeros; longest 1-window.", example: "[0,0,1,1,0,0,1,1,1,1,0], k=2 → 6", approach: "Sliding window with zero count.", time: "O(n)", space: "O(1)", code: `class Solution {
    public int longestOnes(int[] a, int k) { int l=0,z=0,b=0; for(int r=0;r<a.length;r++){ if(a[r]==0) z++; while(z>k) if(a[l++]==0) z--; b=Math.max(b,r-l+1);} return b; }
}` },
      { title: "Fruit Into Baskets", difficulty: "Medium", lc: "LC 904", priority: 1, statement: "At most 2 types; longest contiguous pick.", example: "[1,2,1] → 3", approach: "Sliding window with at most 2 distinct.", time: "O(n)", space: "O(1)", code: `class Solution {
    public int totalFruit(int[] f) { java.util.Map<Integer,Integer> m=new java.util.HashMap<>(); int l=0,b=0; for(int r=0;r<f.length;r++){ m.merge(f[r],1,Integer::sum); while(m.size()>2){ m.merge(f[l],-1,Integer::sum); if(m.get(f[l])==0) m.remove(f[l]); l++; } b=Math.max(b,r-l+1);} return b; }
}` },
      { title: "Binary Subarrays With Sum", difficulty: "Medium", lc: "LC 930", priority: 1, statement: "Count subarrays with sum goal (0/1 array).", example: "[1,0,1,0,1], goal=2 → 4", approach: "Prefix sum: atMost(goal)-atMost(goal-1).", time: "O(n)", space: "O(n)", code: `class Solution {
    public int numSubarraysWithSum(int[] a, int g) { return at(a,g)-at(a,g-1); }
    int at(int[] a,int g){ if(g<0) return 0; int s=0,c=0; java.util.Map<Integer,Integer> m=new java.util.HashMap<>(); m.put(0,1); for(int x:a){ s+=x; c+=m.getOrDefault(s-g,0); m.merge(s,1,Integer::sum);} return c; }
}` },
      { title: "Count Number of Nice Subarrays", difficulty: "Medium", lc: "LC 1248", priority: 1, statement: "Exactly k odd numbers in subarray.", example: "See LC", approach: "atMost(k)-atMost(k-1) counting subarrays with ≤k odds.", time: "O(n)", space: "O(1)", code: `class Solution {
    public int numberOfSubarrays(int[] a, int k) { return at(a,k)-at(a,k-1); }
    int at(int[] a,int K){ int i=0,c=0; for(int j=0;j<a.length;j++){ K-=a[j]&1; while(K<0) K+=a[i++]&1; c+=j-i+1;} return c; }
}` },
      { title: "Number of Substrings Containing All Three Characters", difficulty: "Medium", lc: "LC 1358", priority: 1, statement: "Count substrings having a,b,c each at least once.", example: "abcabc → 10", approach: "Track last index of a,b,c; add 1+min(last) each step.", time: "O(n)", space: "O(1)", code: `class Solution {
    public int numberOfSubstrings(String s) { int[] L=new int[]{-1,-1,-1}; int r=0; for(int i=0;i<s.length();i++){ L[s.charAt(i)-'a']=i; int m=Math.min(L[0],Math.min(L[1],L[2])); if(m>=0) r+=m+1;} return r; }
}` },
      { title: "Maximum Points You Can Obtain from Cards", difficulty: "Medium", lc: "LC 1423", priority: 1, statement: "Pick k cards from ends; maximize sum.", example: "See LC", approach: "Try k from left + (k-i) from right; or total - min middle window.", time: "O(k)", space: "O(1)", code: `class Solution {
    public int maxScore(int[] c, int k) { int n=c.length,s=0,b=0; for(int i=0;i<k;i++) s+=c[i]; b=s; for(int i=k-1;i>=0;i--){ s-=c[i]; s+=c[n-k+i]; b=Math.max(b,s);} return b; }
}` }
    ]
  },
  {
    id: "strings",
    name: "Strings",
    icon: "▧",
    topicPriority: 9,
    accent: "#e879f9",
    description: "String algorithms, pattern matching. KMP and Rabin-Karp are SSE-level must-knows.",
    problems: [
      { title: "Shortest Palindrome", difficulty: "Hard", lc: "LC 214", priority: 0, statement: "Shortest palindrome by adding only in front.", example: "s + minimal prefix from rev(s)", approach: "KMP LPS on s+'#'+rev(s).", time: "O(n)", space: "O(n)", code: `class Solution {
    public String shortestPalindrome(String s) { String r=new StringBuilder(s).reverse().toString(); int[] l=lps(s+"#"+r); return r.substring(0,s.length()-l[l.length-1])+s; }
    int[] lps(String p){ int n=p.length(),j=0,l[]=new int[n]; for(int i=1;i<n;i++){ while(j>0&&p.charAt(i)!=p.charAt(j)) j=l[j-1]; if(p.charAt(i)==p.charAt(j)) j++; l[i]=j;} return l; }
}` },
      { title: "Longest Palindromic Substring", difficulty: "Medium", lc: "LC 5", priority: 0, statement: "Longest palindromic substring.", example: "\"babad\" → \"bab\" or \"aba\"", approach: "Expand around centers (also DP interval).", time: "O(n²)", space: "O(1)", code: `class Solution {
    int l=0,r=0; public String longestPalindrome(String s) { for(int i=0;i<s.length();i++){ ex(s,i,i); ex(s,i,i+1);} return s.substring(l,r+1); }
    void ex(String s,int a,int b){ while(a>=0&&b<s.length()&&s.charAt(a)==s.charAt(b)){ a--; b++;} if(b-a-1>r-l+1){l=a+1;r=b-1;} }
}` },
      { title: "Rabin-Karp Algorithm", difficulty: "Medium", lc: "GFG", priority: 0, statement: "Find all pattern occurrences using rolling hash.", example: "txt, pat → list of start indices", approach: "Rolling hash + equality check on hits.", time: "O(n+m) avg", space: "O(1)", code: `class Solution {
    public java.util.List<Integer> search(String t,String p){ java.util.List<Integer> r=new java.util.ArrayList<>(); int m=p.length(),n=t.length(),B=256,MOD=1_000_000_007; if(m>n||m==0)return r; long hp=0,ht=0,P=1; for(int i=0;i<m;i++){ hp=(hp*B+p.charAt(i))%MOD; ht=(ht*B+t.charAt(i))%MOD; if(i<m-1)P=P*B%MOD;} for(int i=0;i<=n-m;i++){ if(hp==ht&&t.substring(i,i+m).equals(p)) r.add(i); if(i<n-m) ht=(ht-(t.charAt(i)*P)%MOD+MOD)%MOD; ht=(ht*B+t.charAt(i+m))%MOD;} return r; }
}` },
      { title: "KMP Algorithm / LPS Array (strStr)", difficulty: "Easy", lc: "LC 28", priority: 0, statement: "First index of needle in haystack or -1.", example: "sad in sadbutsad → 0", approach: "Build LPS; compare with backtrack.", time: "O(n+m)", space: "O(m)", code: `class Solution {
    public int strStr(String h, String n) { if(n.isEmpty()) return 0; int[] l=lps(n); for(int i=0,j=0;i<h.length();){ if(h.charAt(i)==n.charAt(j)){ i++; j++; if(j==n.length()) return i-j;} else if(j>0) j=l[j-1]; else i++; } return -1; }
    int[] lps(String p){ int m=p.length(); int[] a=new int[m]; for(int i=1,j=0;i<m;){ if(p.charAt(i)==p.charAt(j)) a[i++]=++j; else if(j>0) j=a[j-1]; else a[i++]=0;} return a; }
}` },
      { title: "Longest Happy Prefix", difficulty: "Hard", lc: "LC 1392", priority: 1, statement: "Longest proper prefix which is also suffix.", example: "level → leve", approach: "KMP LPS on full string.", time: "O(n)", space: "O(n)", code: `class Solution {
    public String longestPrefix(String s) { int[] l=lps(s); return s.substring(0,l[s.length()-1]); }
    int[] lps(String p){ int n=p.length(),j=0,l[]=new int[n]; for(int i=1;i<n;i++){ while(j>0&&p.charAt(i)!=p.charAt(j)) j=l[j-1]; if(p.charAt(i)==p.charAt(j)) j++; l[i]=j;} return l; }
}` },
      { title: "Count Different Palindromic Subsequences", difficulty: "Hard", lc: "LC 730", priority: 1, statement: "Count distinct palindromic subsequences mod 1e9+7.", example: "See LC", approach: "DP with last occurrence positions to avoid double count.", time: "O(n²)", space: "O(n²)", code: `class Solution {
    public int countPalindromicSubsequences(String S) { int n=S.length(),M=1_000_000_007; long[][] dp=new long[n][n]; for(int i=0;i<n;i++) dp[i][i]=1; for(int l=2;l<=n;l++) for(int i=0,j=l-1;j<n;i++,j++){ if(S.charAt(i)!=S.charAt(j)) dp[i][j]=(dp[i+1][j]+dp[i][j-1]-dp[i+1][j-1]+M)%M; else { int L=i+1,R=j-1; while(L<=R&&S.charAt(L)!=S.charAt(i)) L++; while(L<=R&&S.charAt(R)!=S.charAt(i)) R--; if(L>R) dp[i][j]=(dp[i+1][j-1]*2+2)%M; else if(L==R) dp[i][j]=(dp[i+1][j-1]*2+1)%M; else dp[i][j]=(dp[i+1][j-1]*2-dp[L+1][R-1]+M)%M; } } return (int)dp[0][n-1]; }
}` },
      { title: "Minimum Bracket Reversals", difficulty: "Medium", lc: "GFG", priority: 1, statement: "Min reversals to make bracket sequence balanced.", example: "}{{} → 1", approach: "Remove valid pairs; count unmatched opens/closes.", time: "O(n)", space: "O(1)", code: `class Solution {
    public int countRev(String s) { int n=s.length(); if(n%2!=0) return -1; int op=0,cl=0; for(char c:s.toCharArray()){ if(c=='{') op++; else if(op>0) op--; else cl++; } return (op+1)/2+(cl+1)/2; }
}` },
      { title: "Z-Function", difficulty: "Medium", lc: "GFG", priority: 1, statement: "Z[i] = longest prefix match starting at i.", example: "aaaa → [4,3,2,1]", approach: "Linear Z-algorithm with [L,R] box.", time: "O(n)", space: "O(n)", code: `class Solution {
    public int[] zFunc(String s) { int n=s.length(),Z[]=new int[n],L=0,R=0; Z[0]=n; for(int i=1;i<n;i++){ if(i>R){ L=R=i; while(R<n&&s.charAt(R-L)==s.charAt(R)) R++; Z[i]=R-L; R--;} else { int k=i-L; if(Z[k]<R-i+1) Z[i]=Z[k]; else { L=i; while(R<n&&s.charAt(R-L)==s.charAt(R)) R++; Z[i]=R-L; R--;}}} return Z; }
}` },
      { title: "String to Integer (atoi)", difficulty: "Medium", lc: "LC 8", priority: 1, statement: "Implement atoi rules.", example: "  -42 → -42", approach: "Trim sign, clamp to int range.", time: "O(n)", space: "O(1)", code: `class Solution {
    public int myAtoi(String s) { int i=0,n=s.length(); while(i<n&&s.charAt(i)==' ') i++; int sg=1; if(i<n&&(s.charAt(i)=='+'||s.charAt(i)=='-')) sg=s.charAt(i++)=='-'?-1:1; long v=0; while(i<n&&Character.isDigit(s.charAt(i))){ v=v*10+s.charAt(i++)-'0'; if(v*sg>Integer.MAX_VALUE) return Integer.MAX_VALUE; if(v*sg<Integer.MIN_VALUE) return Integer.MIN_VALUE;} return (int)(v*sg); }
}` },
      { title: "Reverse Words in a String", difficulty: "Medium", lc: "LC 151", priority: 2, statement: "Reverse word order; single spaces between.", example: "the sky is blue → blue is sky the", approach: "Trim, split, reverse join.", time: "O(n)", space: "O(n)", code: `class Solution {
    public String reverseWords(String s) {
        // TODO: Implement
    }
}` },
      { title: "Integer to Roman", difficulty: "Medium", lc: "LC 12", priority: 2, statement: "Convert int 1..3999 to Roman.", example: "58 → LVIII", approach: "Greedy with value/symbol tables.", time: "O(1)", space: "O(1)", code: `class Solution {
    public String intToRoman(int num) {
        // TODO: Implement
    }
}` },
      { title: "Count and Say", difficulty: "Medium", lc: "LC 38", priority: 2, statement: "nth term of count-and-say sequence.", example: "4 → \"1211\"", approach: "Iterative run-length from previous string.", time: "O(2^n)", space: "O(2^n)", code: `class Solution {
    public String countAndSay(int n) {
        // TODO: Implement
    }
}` },
      { title: "Sort Characters By Frequency", difficulty: "Medium", lc: "LC 451", priority: 2, statement: "Sort chars by decreasing frequency.", example: "tree → eert", approach: "Bucket by freq or heap.", time: "O(n)", space: "O(n)", code: `class Solution {
    public String frequencySort(String s) {
        // TODO: Implement
    }
}` },
      { title: "Longest Common Prefix", difficulty: "Easy", lc: "LC 14", priority: 2, statement: "Longest common prefix among strings.", example: "[\"flower\",\"flow\",\"flight\"] → \"fl\"", approach: "Vertical scan or sort ends.", time: "O(S)", space: "O(1)", code: `class Solution {
    public String longestCommonPrefix(String[] strs) {
        // TODO: Implement
    }
}` },
      { title: "Roman to Integer", difficulty: "Easy", lc: "LC 13", priority: 2, statement: "Convert Roman numeral to int.", example: "MCMXCIV → 1994", approach: "If curr<next subtract else add.", time: "O(n)", space: "O(1)", code: `class Solution {
    public int romanToInt(String s) {
        // TODO: Implement
    }
}` },
      { title: "Isomorphic Strings", difficulty: "Easy", lc: "LC 205", priority: 3, statement: "Characters can be replaced to map s→t one-to-one.", example: "egg,add → true", approach: "Two maps s→t and t→s.", time: "O(n)", space: "O(1)", code: `class Solution {
    public boolean isIsomorphic(String s, String t) {
        // TODO: Implement
    }
}` },
      { title: "Check Anagram", difficulty: "Easy", lc: "LC 242", priority: 3, statement: "t is an anagram of s.", example: "anagram,nagaram → true", approach: "Sort or char counts.", time: "O(n)", space: "O(1)", code: `class Solution {
    public boolean isAnagram(String s, String t) {
        // TODO: Implement
    }
}` },
      { title: "Remove Outermost Parentheses", difficulty: "Easy", lc: "LC 1021", priority: 3, statement: "Remove one valid outermost paren from each primitive.", example: "(()())(()) → ()()()", approach: "Balance counter; omit when balance==0 after push.", time: "O(n)", space: "O(n)", code: `class Solution {
    public String removeOuterParentheses(String s) {
        // TODO: Implement
    }
}` }
    ]
  },
  {
    id: "linkedlist",
    name: "Linked List",
    icon: "⟶",
    topicPriority: 10,
    accent: "#2dd4bf",
    description: "Pointer manipulation. Fast/slow pointer is the key technique.",
    problems: [
      { title: "Merge K Sorted Lists", difficulty: "Hard", lc: "LC 23", priority: 0, statement: "Merge k sorted singly linked lists into one sorted list.", example: "[[1,4,5],[1,3,4],[2,6]] → [1,1,2,3,4,4,5,6]", approach: "Min-heap on list heads; poll min and advance that list.", time: "O(N log k)", space: "O(k)", code: `class Solution {
    public ListNode mergeKLists(ListNode[] lists) {
        PriorityQueue<ListNode> pq=new PriorityQueue<>((a,b)->a.val-b.val);
        for(ListNode l:lists) if(l!=null) pq.offer(l);
        ListNode d=new ListNode(0),c=d;
        while(!pq.isEmpty()){ListNode n=pq.poll();c.next=n;c=c.next;if(n.next!=null)pq.offer(n.next);}
        return d.next;
    }
}` },
      { title: "Reverse Nodes in k-Group", difficulty: "Hard", lc: "LC 25", priority: 0, statement: "Reverse nodes of the linked list k at a time.", example: "[1,2,3,4,5], k=2 → [2,1,4,3,5]", approach: "Reverse first k nodes recursively or iteratively; connect blocks.", time: "O(n)", space: "O(1) iterative", code: `class Solution {
    public ListNode reverseKGroup(ListNode head, int k) {
        ListNode cur=head; int n=0;
        while(cur!=null){n++;cur=cur.next;}
        if(n<k) return head;
        cur=head; ListNode prev=null;
        for(int i=0;i<k;i++){ListNode nx=cur.next;cur.next=prev;prev=cur;cur=nx;}
        head.next=reverseKGroup(cur,k);
        return prev;
    }
}` },
      { title: "Copy List with Random Pointer", difficulty: "Medium", lc: "LC 138", priority: 0, statement: "Deep copy a linked list where each node has next and random.", example: "Clone preserves structure and random targets.", approach: "HashMap original→copy; second pass to wire next/random.", time: "O(n)", space: "O(n)", code: `class Solution {
    public Node copyRandomList(Node head) {
        if(head==null) return null;
        Map<Node,Node> m=new HashMap<>();
        for(Node x=head;x!=null;x=x.next) m.put(x,new Node(x.val));
        for(Node x=head;x!=null;x=x.next){
            m.get(x).next=m.get(x.next); m.get(x).random=m.get(x.random);}
        return m.get(head);
    }
    class Node{int val; Node next,random; Node(int v){val=v;}}
}` },
      { title: "Flatten Linked List", difficulty: "Medium", lc: "GFG", priority: 0, statement: "Each node has next and bottom; all bottom chains are sorted. Flatten to sorted single level.", example: "5—10—19—28 with bottoms 7,20,22,35 → one sorted list.", approach: "Recursively flatten next, then merge two sorted lists using bottom pointers.", time: "O(n log n) worst", space: "O(n) stack", code: `class GfG {
    Node merge(Node a, Node b) {
        if(a==null) return b; if(b==null) return a;
        Node r; if(a.data<b.data){r=a;r.bottom=merge(a.bottom,b);}else{r=b;r.bottom=merge(a,b.bottom);}
        r.next=null; return r;
    }
    Node flatten(Node root) {
        if(root==null||root.next==null) return root;
        root.next=flatten(root.next);
        return merge(root,root.next);
    }
    class Node{int data; Node next,bottom;}
}` },
      { title: "LRU Cache", difficulty: "Medium", lc: "LC 146", priority: 0, statement: "Design LRU cache with get and put in O(1).", example: "capacity 2: after put(3,3), least recently used key evicted.", approach: "HashMap + doubly linked list for access order.", time: "O(1)", space: "O(capacity)", code: `class LRUCache {
    int cap; Map<Integer,Node> mp=new HashMap<>(); Node h=new Node(0,0),t=new Node(0,0);
    public LRUCache(int c){cap=c;h.next=t;t.prev=h;}
    public int get(int k){if(!mp.containsKey(k))return -1;Node n=mp.get(k);rm(n);ins(n);return n.v;}
    public void put(int k,int v){if(mp.containsKey(k))rm(mp.get(k));
        Node n=new Node(k,v);ins(n);mp.put(k,n);if(mp.size()>cap){Node l=t.prev;rm(l);mp.remove(l.k);}}
    void rm(Node n){n.prev.next=n.next;n.next.prev=n.prev;}
    void ins(Node n){n.next=h.next;h.next.prev=n;n.prev=h;h.next=n;}
    class Node{int k,v; Node p,n; Node(int a,int b){k=a;v=b;}}
}` },
      { title: "Reverse Linked List", difficulty: "Easy", lc: "LC 206", priority: 0, statement: "Reverse a singly linked list.", example: "[1,2,3,4,5] → [5,4,3,2,1]", approach: "Iterative prev/curr/next reversal.", time: "O(n)", space: "O(1)", code: `class Solution {
    public ListNode reverseList(ListNode head) {
        ListNode p=null,c=head;
        while(c!=null){ListNode n=c.next;c.next=p;p=c;c=n;}
        return p;
    }
}` },
      { title: "Linked List Cycle", difficulty: "Easy", lc: "LC 141", priority: 0, statement: "Return true if the list has a cycle.", example: "Tail connects to index 1 → true.", approach: "Floyd’s tortoise and hare.", time: "O(n)", space: "O(1)", code: `class Solution {
    public boolean hasCycle(ListNode head) {
        ListNode s=head,f=head;
        while(f!=null&&f.next!=null){s=s.next;f=f.next.next;if(s==f)return true;}
        return false;
    }
}` },
      { title: "Add Two Numbers", difficulty: "Medium", lc: "LC 2", priority: 1, statement: "Add two numbers represented by digits stored in reverse order.", example: "[2,4,3]+[5,6,4] represents 342+465=807 → [7,0,8].", approach: "Digit-wise sum with carry.", time: "O(max(m,n))", space: "O(1)", code: `class Solution {
    public ListNode addTwoNumbers(ListNode l1, ListNode l2) {
        ListNode d=new ListNode(0),c=d; int carry=0;
        while(l1!=null||l2!=null||carry>0){
            int s=carry+(l1!=null?l1.val:0)+(l2!=null?l2.val:0);
            c.next=new ListNode(s%10); c=c.next; carry=s/10;
            if(l1!=null) l1=l1.next; if(l2!=null) l2=l2.next;
        }
        return d.next;
    }
}` },
      { title: "Linked List Cycle II", difficulty: "Medium", lc: "LC 142", priority: 1, statement: "Return the node where the cycle begins, or null.", example: "Cycle starts at node value 2 → return that node.", approach: "After meeting inside loop, reset one pointer to head; advance both until they meet.", time: "O(n)", space: "O(1)", code: `class Solution {
    public ListNode detectCycle(ListNode head) {
        ListNode s=head,f=head;
        while(f!=null&&f.next!=null){s=s.next;f=f.next.next;if(s==f)break;}
        if(f==null||f.next==null) return null;
        s=head; while(s!=f){s=s.next;f=f.next;}
        return s;
    }
}` },
      { title: "Odd Even Linked List", difficulty: "Medium", lc: "LC 328", priority: 1, statement: "Group all odd-index nodes followed by even-index (1-based indexing).", example: "[1,2,3,4,5] → [1,3,5,2,4]", approach: "Maintain odd tail and even sublist; splice.", time: "O(n)", space: "O(1)", code: `class Solution {
    public ListNode oddEvenList(ListNode head) {
        if(head==null) return null;
        ListNode o=head,e=head.next,d=e;
        while(e!=null&&e.next!=null){o.next=e.next;o=o.next;e.next=o.next;e=e.next;}
        o.next=d; return head;
    }
}` },
      { title: "Remove Nth Node From End of List", difficulty: "Medium", lc: "LC 19", priority: 1, statement: "Remove the nth node from the end of the list.", example: "[1,2,3,4,5], n=2 → [1,2,3,5]", approach: "Dummy + two pointers gap (n+1).", time: "O(n)", space: "O(1)", code: `class Solution {
    public ListNode removeNthFromEnd(ListNode head, int n) {
        ListNode d=new ListNode(0,head),a=d,b=d;
        for(int i=0;i<=n;i++) b=b.next;
        while(b!=null){a=a.next;b=b.next;}
        a.next=a.next.next; return d.next;
    }
}` },
      { title: "Rotate List", difficulty: "Medium", lc: "LC 61", priority: 1, statement: "Rotate the list to the right by k places.", example: "[1,2,3,4,5], k=2 → [4,5,1,2,3]", approach: "Make circular; break at new head after len-k steps.", time: "O(n)", space: "O(1)", code: `class Solution {
    public ListNode rotateRight(ListNode head, int k) {
        if(head==null||head.next==null) return head;
        int n=1; ListNode t=head;
        while(t.next!=null){t=t.next;n++;}
        k%=n; if(k==0) return head;
        ListNode x=head; for(int i=0;i<n-k-1;i++) x=x.next;
        ListNode nh=x.next; x.next=null; t.next=head; return nh;
    }
}` },
      { title: "Sort List", difficulty: "Medium", lc: "LC 148", priority: 1, statement: "Sort linked list in O(n log n) time and O(1) extra space.", example: "[4,2,1,3] → [1,2,3,4]", approach: "Merge sort: split at mid, recurse, merge two sorted lists.", time: "O(n log n)", space: "O(1)", code: `class Solution {
    public ListNode sortList(ListNode head) {
        if(head==null||head.next==null) return head;
        ListNode s=head,f=head,pr=null;
        while(f!=null&&f.next!=null){pr=s;s=s.next;f=f.next.next;}
        pr.next=null;
        return merge(sortList(head),sortList(s));
    }
    ListNode merge(ListNode a,ListNode b){
        ListNode d=new ListNode(0),x=d;
        while(a!=null&&b!=null){if(a.val<=b.val){x.next=a;a=a.next;}else{x.next=b;b=b.next;}x=x.next;}
        x.next=a!=null?a:b; return d.next;
    }
}` },
      { title: "Intersection of Two Linked Lists", difficulty: "Easy", lc: "LC 160", priority: 1, statement: "Return the first shared node of two singly linked lists.", example: "Lists join at a common tail segment.", approach: "Two pointers switch heads at end to equalize path lengths.", time: "O(m+n)", space: "O(1)", code: `public class Solution {
    public ListNode getIntersectionNode(ListNode a, ListNode b) {
        ListNode x=a,y=b;
        while(x!=y){x=x==null?b:x.next; y=y==null?a:y.next;}
        return x;
    }
}` },
      { title: "Merge Two Sorted Lists", difficulty: "Easy", lc: "LC 21", priority: 1, statement: "Merge two sorted linked lists into one sorted list.", example: "[1,2,4] and [1,3,4] → [1,1,2,3,4,4]", approach: "Dummy head; repeatedly take smaller head.", time: "O(m+n)", space: "O(1)", code: `class Solution {
    public ListNode mergeTwoLists(ListNode a, ListNode b) {
        ListNode d=new ListNode(0),c=d;
        while(a!=null&&b!=null){if(a.val<=b.val){c.next=a;a=a.next;}else{c.next=b;b=b.next;}c=c.next;}
        c.next=a!=null?a:b; return d.next;
    }
}` },
      { title: "Palindrome Linked List", difficulty: "Easy", lc: "LC 234", priority: 1, statement: "Return true if the list is a palindrome.", example: "[1,2,2,1] → true", approach: "Find middle, reverse second half, compare, restore links.", time: "O(n)", space: "O(1)", code: `class Solution {
    public boolean isPalindrome(ListNode head) {
        if(head==null||head.next==null) return true;
        ListNode s=head,f=head;
        while(f.next!=null&&f.next.next!=null){s=s.next;f=f.next.next;}
        ListNode sec=rev(s.next); s.next=null;
        ListNode a=head,b=sec; boolean ok=true;
        while(b!=null){if(a.val!=b.val) ok=false; a=a.next;b=b.next;}
        s.next=rev(sec); return ok;
    }
    ListNode rev(ListNode h){ListNode p=null,c=h;while(c!=null){ListNode n=c.next;c.next=p;p=c;c=n;}return p;}
}` },
      { title: "Delete the Middle Node of a Linked List", difficulty: "Medium", lc: "LC 2095", priority: 2, statement: "Delete exactly one middle node (any of two for even length).", example: "[1,3,4,7,1,2,6] → remove 7", approach: "Slow/fast to find predecessor of middle.", time: "O(n)", space: "O(1)", code: `class Solution {
    public ListNode deleteMiddle(ListNode head) {
        // TODO: Implement
    }
}` },
      { title: "Length of Loop in Linked List", difficulty: "Medium", lc: "GFG", priority: 2, statement: "If a cycle exists, return the number of nodes in the cycle.", example: "Loop of length 4 → 4", approach: "Floyd meet, then count steps until pointer returns to meet point.", time: "O(n)", space: "O(1)", code: `class Solution {
    public int countNodesInLoop(ListNode head) {
        // TODO: Implement
    }
}` },
      { title: "Sort Linked List of 0s, 1s and 2s", difficulty: "Medium", lc: "GFG", priority: 2, statement: "Sort nodes with values only 0, 1, or 2 without swapping node values arbitrarily beyond reordering.", example: "[1,2,1,0] → [0,1,1,2]", approach: "Dutch national flag with three pointers or count and relink.", time: "O(n)", space: "O(1)", code: `class Solution {
    public Node segregate(Node head) {
        // TODO: Implement
    }
}` },
      { title: "Add 1 to a Number Represented by Linked List", difficulty: "Medium", lc: "GFG", priority: 2, statement: "Digits stored MSB→LSB; add one with carry propagation.", example: "9→9→9 plus one becomes 1→0→0→0", approach: "Reverse, add carry from LSB, reverse back.", time: "O(n)", space: "O(1)", code: `class Solution {
    public Node addOne(Node head) {
        // TODO: Implement
    }
}` },
      { title: "Delete All Occurrences of Key in Doubly Linked List", difficulty: "Medium", lc: "GFG", priority: 2, statement: "Remove every node whose value equals k from a DLL.", example: "All nodes with value 3 removed.", approach: "Traverse; patch prev/next when match.", time: "O(n)", space: "O(1)", code: `class Solution {
    public Node deleteAllOccurOfX(Node head, int k) {
        // TODO: Implement
    }
}` },
      { title: "Find Pairs with Given Sum in DLL", difficulty: "Medium", lc: "GFG", priority: 2, statement: "Given sorted DLL, find all pairs whose values sum to x.", example: "1↔2↔3↔4, x=5 → (1,4) and (2,3)", approach: "Two pointers from leftmost and rightmost.", time: "O(n)", space: "O(1)", code: `class Solution {
    public void findPairsWithSum(Node head, int x) {
        // TODO: Implement
    }
}` },
      { title: "Middle of the Linked List", difficulty: "Easy", lc: "LC 876", priority: 2, statement: "Return the middle node; if two middles, return the second.", example: "[1,2,3,4,5] → node 3", approach: "Slow moves 1 step, fast moves 2 per iteration.", time: "O(n)", space: "O(1)", code: `class Solution {
    public ListNode middleNode(ListNode head) {
        // TODO: Implement
    }
}` },
      { title: "Remove Duplicates from Sorted DLL", difficulty: "Easy", lc: "GFG", priority: 3, statement: "Remove all duplicate values from a sorted doubly linked list.", example: "1-1-2-3-3 → 1-2-3", approach: "Single pass: skip consecutive equal keys.", time: "O(n)", space: "O(1)", code: `class Solution {
    public Node removeDuplicates(Node head) {
        // TODO: Implement
    }
}` }
    ]
  },
  {
    id: "recursion",
    name: "Recursion & Backtracking",
    icon: "↻",
    topicPriority: 11,
    accent: "#c084fc",
    description: "Subsets, permutations, N-Queens. Essential for understanding DP.",
    problems: [
      { title: "N-Queens", difficulty: "Hard", lc: "LC 51", priority: 0, statement: "Return all distinct solutions to n-queens.", example: "n=4 → two boards with Q placements.", approach: "Backtracking rows; check cols and diagonals.", time: "O(n!)", space: "O(n^2)", code: `class Solution {
    public List<List<String>> solveNQueens(int n) {
        List<List<String>> res=new ArrayList<>(); char[][] b=new char[n][n];
        for(char[] r:b) Arrays.fill(r,'.'); bt(b,0,res); return res;
    }
    void bt(char[][] b,int r,List<List<String>> res){
        if(r==b.length){List<String> x=new ArrayList<>();for(char[] t:b)x.add(new String(t));res.add(x);return;}
        for(int c=0;c<b.length;c++) if(ok(b,r,c)){b[r][c]='Q';bt(b,r+1,res);b[r][c]='.';}
    }
    boolean ok(char[][] b,int r,int c){
        for(int i=0;i<r;i++) if(b[i][c]=='Q') return false;
        for(int i=r-1,j=c-1;i>=0&&j>=0;i--,j--) if(b[i][j]=='Q') return false;
        for(int i=r-1,j=c+1;i>=0&&j<b.length;i--,j++) if(b[i][j]=='Q') return false;
        return true;
    }
}` },
      { title: "Expression Add Operators", difficulty: "Hard", lc: "LC 282", priority: 0, statement: "Insert +, -, * between digits of num so expression evaluates to target.", example: "num='123', target=6 → ['1+2+3','1*2*3']", approach: "DFS; track val and last term for multiplication chaining; use long to avoid overflow.", time: "O(4^n)", space: "O(n)", code: `class Solution {
    public List<String> addOperators(String num, int target) {
        List<String> res=new ArrayList<>();
        if(num.length()==0) return res;
        bt(num,target,0,0,0,"",res); return res;
    }
    void bt(String num,int t,int i,long val,long last,String cur,List<String> res){
        if(i==num.length()){if(val==t)res.add(cur);return;}
        long x=0;
        for(int j=i;j<num.length();j++){
            if(j>i&&num.charAt(i)=='0') break;
            x=x*10+num.charAt(j)-'0';
            if(i==0) bt(num,t,j+1,x,x,cur+x,res);
            else{
                bt(num,t,j+1,val+x,x,cur+'+'+x,res);
                bt(num,t,j+1,val-x,-x,cur+'-'+x,res);
                bt(num,t,j+1,val-last+last*x,last*x,cur+'*'+x,res);
            }
        }
    }
}` },
      { title: "Combination Sum", difficulty: "Medium", lc: "LC 39", priority: 0, statement: "Combinations summing to target; reuse same element unlimited times.", example: "[2,3,6,7], target 7 → [[2,2,3],[7]].", approach: "DFS from index with remaining sum.", time: "O(2^target)", space: "O(target)", code: `class Solution {
    public List<List<Integer>> combinationSum(int[] c, int t) {
        List<List<Integer>> res=new ArrayList<>(); bt(c,t,0,new ArrayList<>(),res); return res;
    }
    void bt(int[] c,int rem,int i,List<Integer> cur,List<List<Integer>> res){
        if(rem==0){res.add(new ArrayList<>(cur));return;} if(rem<0) return;
        for(int j=i;j<c.length;j++){cur.add(c[j]);bt(c,rem-c[j],j,cur,res);cur.remove(cur.size()-1);}
    }
}` },
      { title: "Combination Sum II", difficulty: "Medium", lc: "LC 40", priority: 0, statement: "Each number used once; no duplicate combinations.", example: "[10,1,2,7,6,1,5], target 8.", approach: "Sort; DFS; skip duplicates at same level.", time: "O(2^n)", space: "O(n)", code: `class Solution {
    public List<List<Integer>> combinationSum2(int[] c, int t) {
        Arrays.sort(c); List<List<Integer>> res=new ArrayList<>();
        bt(c,t,0,new ArrayList<>(),res); return res;
    }
    void bt(int[] c,int rem,int i,List<Integer> cur,List<List<Integer>> res){
        if(rem==0){res.add(new ArrayList<>(cur));return;}
        for(int j=i;j<c.length&&c[j]<=rem;j++){
            if(j>i&&c[j]==c[j-1]) continue;
            cur.add(c[j]); bt(c,rem-c[j],j+1,cur,res); cur.remove(cur.size()-1);
        }
    }
}` },
      { title: "Generate Parentheses", difficulty: "Medium", lc: "LC 22", priority: 0, statement: "Generate all well-formed parentheses strings of n pairs.", example: "n=3 → 5 strings like '((()))'.", approach: "DFS: add '(' if open<n; add ')' if close<open.", time: "O(4^n / sqrt(n))", space: "O(n)", code: `class Solution {
    public List<String> generateParenthesis(int n) {
        List<String> res=new ArrayList<>(); bt("",0,0,n,res); return res;
    }
    void bt(String s,int o,int c,int n,List<String> res){
        if(s.length()==2*n){res.add(s);return;}
        if(o<n) bt(s+"(",o+1,c,n,res);
        if(c<o) bt(s+")",o,c+1,n,res);
    }
}` },
      { title: "Permutations", difficulty: "Medium", lc: "LC 46", priority: 0, statement: "Return all permutations of distinct integers.", example: "[1,2,3] → 6 permutations.", approach: "Backtracking with used[] or swap method.", time: "O(n!)", space: "O(n)", code: `class Solution {
    public List<List<Integer>> permute(int[] nums) {
        List<List<Integer>> res=new ArrayList<>(); boolean[] u=new boolean[nums.length];
        bt(nums,u,new ArrayList<>(),res); return res;
    }
    void bt(int[] a,boolean[] u,List<Integer> cur,List<List<Integer>> res){
        if(cur.size()==a.length){res.add(new ArrayList<>(cur));return;}
        for(int i=0;i<a.length;i++){if(u[i]) continue;
            u[i]=true;cur.add(a[i]);bt(a,u,cur,res);cur.remove(cur.size()-1);u[i]=false;}
    }
}` },
      { title: "Subsets", difficulty: "Medium", lc: "LC 78", priority: 0, statement: "Return the power set: all subsets of distinct integers.", example: "[1,2,3] → 8 subsets.", approach: "Backtracking: at each index choose include or skip.", time: "O(2^n)", space: "O(n)", code: `class Solution {
    public List<List<Integer>> subsets(int[] nums) {
        List<List<Integer>> res=new ArrayList<>(); bt(nums,0,new ArrayList<>(),res); return res;
    }
    void bt(int[] a,int i,List<Integer> cur,List<List<Integer>> res){
        res.add(new ArrayList<>(cur));
        for(int j=i;j<a.length;j++){cur.add(a[j]);bt(a,j+1,cur,res);cur.remove(cur.size()-1);}
    }
}` },
      { title: "Subsets II", difficulty: "Medium", lc: "LC 90", priority: 0, statement: "All subsets with duplicates; solution set must not contain duplicates.", example: "[1,2,2] → unique subsets.", approach: "Sort; skip same value at same depth.", time: "O(2^n)", space: "O(n)", code: `class Solution {
    public List<List<Integer>> subsetsWithDup(int[] nums) {
        Arrays.sort(nums); List<List<Integer>> res=new ArrayList<>();
        bt(nums,0,new ArrayList<>(),res); return res;
    }
    void bt(int[] a,int i,List<Integer> cur,List<List<Integer>> res){
        res.add(new ArrayList<>(cur));
        for(int j=i;j<a.length;j++){
            if(j>i&&a[j]==a[j-1]) continue;
            cur.add(a[j]); bt(a,j+1,cur,res); cur.remove(cur.size()-1);
        }
    }
}` },
      { title: "Word Break", difficulty: "Medium", lc: "LC 139", priority: 0, statement: "Return true if s can be segmented into space-separated dictionary words.", example: "s='leetcode', wordDict contains 'leet','code' → true.", approach: "DP[i]=true if prefix length i is breakable; try all words.", time: "O(n^2)", space: "O(n)", code: `class Solution {
    public boolean wordBreak(String s, List<String> wd) {
        Set<String> set=new HashSet<>(wd); int n=s.length();
        boolean[] dp=new boolean[n+1]; dp[0]=true;
        for(int i=1;i<=n;i++) for(int j=0;j<i;j++)
            if(dp[j]&&set.contains(s.substring(j,i))){dp[i]=true;break;}
        return dp[n];
    }
}` },
      { title: "Word Search", difficulty: "Medium", lc: "LC 79", priority: 0, statement: "Determine if word exists in grid by moving to adjacent cells without reuse.", example: "board contains 'ABCCED' path.", approach: "DFS from each cell; mark visited with sentinel.", time: "O(m*n*4^L)", space: "O(L)", code: `class Solution {
    public boolean exist(char[][] b, String w) {
        for(int i=0;i<b.length;i++) for(int j=0;j<b[0].length;j++)
            if(dfs(b,i,j,0,w)) return true;
        return false;
    }
    boolean dfs(char[][] b,int i,int j,int k,String w){
        if(k==w.length()) return true;
        if(i<0||i>=b.length||j<0||j>=b[0].length||b[i][j]!=w.charAt(k)) return false;
        char t=b[i][j]; b[i][j]='#';
        boolean ok=dfs(b,i+1,j,k+1,w)||dfs(b,i-1,j,k+1,w)||dfs(b,i,j+1,k+1,w)||dfs(b,i,j-1,k+1,w);
        b[i][j]=t; return ok;
    }
}` },
      { title: "Sudoku Solver", difficulty: "Hard", lc: "LC 37", priority: 1, statement: "Fill empty cells so each row/col/box has digits 1-9 exactly once.", example: "Partial board → unique valid completion.", approach: "Backtracking: try digits for '.' cells with validity checks.", time: "O(9^m)", space: "O(1)", code: `class Solution {
    public void solveSudoku(char[][] b) { solve(b); }
    boolean solve(char[][] b){
        for(int i=0;i<9;i++) for(int j=0;j<9;j++) if(b[i][j]=='.'){
            for(char c='1';c<='9';c++) if(ok(b,i,j,c)){b[i][j]=c;if(solve(b))return true;b[i][j]='.';}
            return false;}
        return true;
    }
    boolean ok(char[][] b,int r,int c,char ch){
        for(int k=0;k<9;k++) if(b[r][k]==ch||b[k][c]==ch) return false;
        int br=3*(r/3),bc=3*(c/3);
        for(int i=0;i<3;i++) for(int j=0;j<3;j++) if(b[br+i][bc+j]==ch) return false;
        return true;
    }
}` },
      { title: "Combination Sum III", difficulty: "Medium", lc: "LC 216", priority: 1, statement: "Find k distinct numbers from 1..9 summing to n.", example: "k=3,n=7 → [[1,2,4]].", approach: "Backtrack choosing increasing digits.", time: "O(C(9,k))", space: "O(k)", code: `class Solution {
    public List<List<Integer>> combinationSum3(int k, int n) {
        List<List<Integer>> res=new ArrayList<>(); bt(k,n,1,new ArrayList<>(),res); return res;
    }
    void bt(int k,int rem,int s,List<Integer> cur,List<List<Integer>> res){
        if(k==0){if(rem==0)res.add(new ArrayList<>(cur));return;}
        for(int i=s;i<=9;i++){if(i>rem)break;cur.add(i);bt(k-1,rem-i,i+1,cur,res);cur.remove(cur.size()-1);}
    }
}` },
      { title: "Letter Combinations of a Phone Number", difficulty: "Medium", lc: "LC 17", priority: 1, statement: "Return all letter sequences digits map to on phone keypad.", example: "'23' → ['ad','ae','af','bd','be','bf','cd','ce','cf'].", approach: "Backtracking / BFS over digit positions.", time: "O(4^n)", space: "O(n)", code: `class Solution {
    static final String[] M={"","","abc","def","ghi","jkl","mno","pqrs","tuv","wxyz"};
    public List<String> letterCombinations(String d) {
        List<String> res=new ArrayList<>(); if(d.length()==0) return res;
        bt(d,0,new StringBuilder(),res); return res;
    }
    void bt(String d,int i,StringBuilder sb,List<String> res){
        if(i==d.length()){res.add(sb.toString());return;}
        for(char c:M[d.charAt(i)-'0'].toCharArray()){sb.append(c);bt(d,i+1,sb,res);sb.deleteCharAt(sb.length()-1);}
    }
}` },
      { title: "M-Coloring Problem", difficulty: "Medium", lc: "GFG", priority: 1, statement: "Determine if graph can be colored with at most m colors so adjacent vertices differ.", example: "Adjacency matrix + m → boolean.", approach: "Backtracking assign colors to vertices.", time: "O(m^n)", space: "O(n)", code: `class Solution {
    public boolean graphColoring(boolean[][] g, int m, int n) {
        int[] col=new int[n]; return bt(g,m,n,0,col);
    }
    boolean bt(boolean[][] g,int m,int n,int v,int[] col){
        if(v==n) return true;
        for(int c=1;c<=m;c++) if(safe(g,v,c,col,n)){col[v]=c; if(bt(g,m,n,v+1,col)) return true; col[v]=0;}
        return false;
    }
    boolean safe(boolean[][] g,int v,int c,int[] col,int n){
        for(int k=0;k<n;k++) if(g[v][k]&&col[k]==c) return false;
        return true;
    }
}` },
      { title: "Palindrome Partitioning", difficulty: "Medium", lc: "LC 131", priority: 1, statement: "Partition s so every substring in the partition is a palindrome.", example: "'aab' → [['a','a','b'],['aa','b']].", approach: "DFS: try each palindrome prefix, recurse on suffix.", time: "O(2^n)", space: "O(n)", code: `class Solution {
    public List<List<String>> partition(String s) {
        List<List<String>> res=new ArrayList<>(); bt(s,0,new ArrayList<>(),res); return res;
    }
    void bt(String s,int i,List<String> cur,List<List<String>> res){
        if(i==s.length()){res.add(new ArrayList<>(cur));return;}
        for(int j=i;j<s.length();j++) if(pal(s,i,j)){
            cur.add(s.substring(i,j+1)); bt(s,j+1,cur,res); cur.remove(cur.size()-1);}
    }
    boolean pal(String s,int l,int r){while(l<r)if(s.charAt(l++)!=s.charAt(r--))return false;return true;}
}` },
      { title: "Pow(x, n)", difficulty: "Medium", lc: "LC 50", priority: 1, statement: "Implement x raised to integer n in O(log n).", example: "2.0^10=1024.0; handle negative n.", approach: "Binary exponentiation; use long for exponent magnitude.", time: "O(log |n|)", space: "O(1)", code: `class Solution {
    public double myPow(double x, int n) {
        long N=n; if(N<0){x=1/x; N=-N;}
        double res=1;
        while(N>0){if((N&1)==1)res*=x; x*=x; N>>=1;}
        return res;
    }
}` },
      { title: "Rat in a Maze", difficulty: "Medium", lc: "GFG", priority: 1, statement: "Find all paths from (0,0) to (n-1,n-1) in binary maze; moves D,L,R,U in lex order.", example: "1-path cells only; return list of direction strings.", approach: "Backtracking DFS with visited flag.", time: "O(4^(n^2)) worst", space: "O(n^2)", code: `class Solution {
    public ArrayList<String> findPath(int[][] m, int n) {
        ArrayList<String> res=new ArrayList<>();
        if(m[0][0]==0) return res;
        boolean[][] v=new boolean[n][n];
        dfs(m,n,0,0,"",v,res); return res;
    }
    void dfs(int[][] m,int n,int i,int j,String p,boolean[][] v,ArrayList<String> res){
        if(i==n-1&&j==n-1){res.add(p);return;}
        v[i][j]=true;
        String D="DLRU"; int[][] d={{1,0},{0,-1},{0,1},{-1,0}};
        for(int k=0;k<4;k++){
            int ni=i+d[k][0],nj=j+d[k][1];
            if(ni>=0&&ni<n&&nj>=0&&nj<n&&!v[ni][nj]&&m[ni][nj]==1)
                dfs(m,n,ni,nj,p+D.charAt(k),v,res);
        }
        v[i][j]=false;
    }
}` },
      { title: "Count Good Numbers", difficulty: "Medium", lc: "LC 1922", priority: 2, statement: "Count n-digit strings where even indices are any of 5 even digits and odd indices any of 4 primes mod 5.", example: "n=1 → 5; uses modular exponentiation.", approach: "Fast pow: 5^ceil pairs * 4^floor pairs mod 1e9+7.", time: "O(log n)", space: "O(1)", code: `class Solution {
    public int countGoodNumbers(long n) {
        // TODO: Implement
    }
}` },
      { title: "Reverse a Stack", difficulty: "Medium", lc: "GFG", priority: 2, statement: "Reverse stack using recursion without extra stack structure beyond call stack.", example: "Top 1,2,3 → 3,2,1.", approach: "Pop, reverse remainder, insert at bottom.", time: "O(n^2)", space: "O(n)", code: `class Solution {
    public void reverse(java.util.Stack<Integer> s) {
        // TODO: Implement
    }
}` },
      { title: "Sort a Stack", difficulty: "Medium", lc: "GFG", priority: 2, statement: "Sort stack in ascending order using only stack ops (recursion).", example: "[3,1,2] → [1,2,3] in stack top order.", approach: "Pop all, insert sorted helper.", time: "O(n^2)", space: "O(n)", code: `class Solution {
    public java.util.Stack<Integer> sortStack(java.util.Stack<Integer> s) {
        // TODO: Implement
    }
}` }
    ]
  },
  {
    id: "greedy",
    name: "Greedy",
    icon: "◆",
    topicPriority: 12,
    accent: "#4ade80",
    description: "Activity selection, intervals, jump game patterns.",
    problems: [
      { title: "Candy", difficulty: "Hard", lc: "LC 135", priority: 0, statement: "Minimum candies so each child has at least 1 and higher rating than neighbor gets more.", example: "[1,0,2] → 5 candies total.", approach: "Two passes: left-to-right then right-to-left peaks.", time: "O(n)", space: "O(n)", code: `class Solution {
    public int candy(int[] ratings) {
        int n=ratings.length, s=0; int[] c=new int[n]; Arrays.fill(c,1);
        for(int i=1;i<n;i++) if(ratings[i]>ratings[i-1]) c[i]=c[i-1]+1;
        for(int i=n-2;i>=0;i--) if(ratings[i]>ratings[i+1]) c[i]=Math.max(c[i],c[i+1]+1);
        for(int x:c) s+=x; return s;
    }
}` },
      { title: "Jump Game", difficulty: "Medium", lc: "LC 55", priority: 0, statement: "Can you reach last index from first given max jump lengths?", example: "[2,3,1,1,4] → true.", approach: "Track farthest index reachable.", time: "O(n)", space: "O(1)", code: `class Solution {
    public boolean canJump(int[] nums) {
        int far=0;
        for(int i=0;i<nums.length;i++){if(i>far)return false;far=Math.max(far,i+nums[i]);}
        return true;
    }
}` },
      { title: "Jump Game II", difficulty: "Medium", lc: "LC 45", priority: 0, statement: "Minimum jumps to reach last index (always reachable).", example: "[2,3,1,1,4] → 2.", approach: "Greedy layers: jump when index hits current layer end.", time: "O(n)", space: "O(1)", code: `class Solution {
    public int jump(int[] nums) {
        int jumps=0,end=0,far=0;
        for(int i=0;i<nums.length-1;i++){
            far=Math.max(far,i+nums[i]);
            if(i==end){jumps++;end=far;}
        }
        return jumps;
    }
}` },
      { title: "Merge Intervals", difficulty: "Medium", lc: "LC 56", priority: 0, statement: "Merge all overlapping intervals.", example: "[[1,3],[2,6],[8,10]] → [[1,6],[8,10]].", approach: "Sort by start; merge into list if overlap.", time: "O(n log n)", space: "O(n)", code: `class Solution {
    public int[][] merge(int[][] a) {
        Arrays.sort(a,(x,y)->x[0]-y[0]); List<int[]> m=new ArrayList<>();
        for(int[] x:a){if(m.isEmpty()||m.get(m.size()-1)[1]<x[0]) m.add(x);
        else m.get(m.size()-1)[1]=Math.max(m.get(m.size()-1)[1],x[1]);}
        return m.toArray(new int[0][]);
    }
}` },
      { title: "Insert Interval", difficulty: "Medium", lc: "LC 57", priority: 1, statement: "Insert new interval into sorted non-overlapping set and merge.", example: "[[1,3],[6,9]], [2,5] → [[1,9]].", approach: "Three phases: before, merge overlapping, after.", time: "O(n)", space: "O(n)", code: `class Solution {
    public int[][] insert(int[][] iv, int[] ni) {
        List<int[]> r=new ArrayList<>(); int i=0,n=iv.length;
        while(i<n&&iv[i][1]<ni[0]) r.add(iv[i++]);
        while(i<n&&iv[i][0]<=ni[1]){ni[0]=Math.min(ni[0],iv[i][0]);ni[1]=Math.max(ni[1],iv[i][1]);i++;}
        r.add(ni); while(i<n) r.add(iv[i++]);
        return r.toArray(new int[0][]);
    }
}` },
      { title: "Job Sequencing Problem", difficulty: "Medium", lc: "GFG", priority: 1, statement: "Each job has deadline and profit; one job per unit time; maximize profit.", example: "Pick highest profit jobs in latest feasible slots.", approach: "Sort by profit; DSU or slot array from deadline downward.", time: "O(n^2) or O(n log n)", space: "O(n)", code: `class Job{int id,dead,profit;}
class Solution {
    int[] JobScheduling(Job[] a, int n) {
        Arrays.sort(a,(x,y)->y.profit-x.profit); boolean[] slot=new boolean[n+1]; int cnt=0,sum=0;
        for(Job j:a) for(int t=Math.min(n,j.dead);t>=1;t--) if(!slot[t]){slot[t]=true;cnt++;sum+=j.profit;break;}
        return new int[]{cnt,sum};
    }
}` },
      { title: "Minimum Platforms", difficulty: "Medium", lc: "GFG", priority: 1, statement: "Given train arrivals and departures, max simultaneous platforms needed.", example: "Trains overlapping at noon need extra platform.", approach: "Two-pointer on sorted arrivals and departures.", time: "O(n log n)", space: "O(1)", code: `class Solution {
    public static int findPlatform(int[] arr, int[] dep, int n) {
        Arrays.sort(arr); Arrays.sort(dep);
        int i=0,j=0,cur=0,max=0;
        while(i<n){if(arr[i]<=dep[j]){cur++;max=Math.max(max,cur);i++;}else{cur--;j++;}}
        return max;
    }
}` },
      { title: "Non-overlapping Intervals", difficulty: "Medium", lc: "LC 435", priority: 1, statement: "Minimum intervals to remove so rest are non-overlapping.", example: "[[1,2],[2,3],[3,4],[1,3]] → 1 removal.", approach: "Sort by end; greedy keep earliest-finishing.", time: "O(n log n)", space: "O(1)", code: `class Solution {
    public int eraseOverlapIntervals(int[][] a) {
        Arrays.sort(a,(x,y)->x[1]-y[1]); int c=0,e=a[0][1];
        for(int i=1;i<a.length;i++){if(a[i][0]<e)c++; else e=a[i][1];}
        return c;
    }
}` },
      { title: "N Meetings in One Room", difficulty: "Easy", lc: "GFG", priority: 1, statement: "Maximum non-overlapping meetings in one room.", example: "Classic activity selection by end time.", approach: "Sort by finish time; greedy take compatible starts.", time: "O(n log n)", space: "O(n)", code: `class Solution {
    public int maxMeetings(int[] start, int[] end) {
        int n=start.length; int[][] x=new int[n][2];
        for(int i=0;i<n;i++){x[i][0]=start[i];x[i][1]=end[i];}
        Arrays.sort(x,(a,b)->a[1]-b[1]); int c=1,last=x[0][1];
        for(int i=1;i<n;i++) if(x[i][0]>last){c++;last=x[i][1];}
        return c;
    }
}` },
      { title: "Fractional Knapsack", difficulty: "Medium", lc: "GFG", priority: 2, statement: "Items have weight and value; take fractions to maximize value in capacity W.", example: "Greedy by value/weight ratio.", approach: "Sort by ratio descending; fill knapsack fractionally.", time: "O(n log n)", space: "O(1)", code: `class Solution {
    public double fractionalKnapsack(int W, Item[] arr, int n) {
        // TODO: Implement
    }
}` },
      { title: "Minimum Coins (Greedy — canonical coin systems)", difficulty: "Medium", lc: "GFG", priority: 2, statement: "Minimum coins to make value V for given denominations (greedy works for e.g. Indian coins).", example: "V=49 → use largest first.", approach: "Repeatedly take largest coin ≤ remaining.", time: "O(n)", space: "O(1)", code: `class Solution {
    public int minCoins(int[] coins, int V) {
        // TODO: Implement
    }
}` },
      { title: "Valid Parenthesis Checker", difficulty: "Medium", lc: "GFG", priority: 2, statement: "String has '(', ')', '*'; * can be empty, '(' or ')'. Check if any valid parentheses possible.", example: "'(*)' → true.", approach: "Track low/high range of possible open count after each char.", time: "O(n)", space: "O(1)", code: `class Solution {
    public boolean checkValidString(String s) {
        // TODO: Implement
    }
}` },
      { title: "Lemonade Change", difficulty: "Easy", lc: "LC 860", priority: 2, statement: "Customers pay $5/$10/$20; start with no change; can you make correct change for all?", example: "[5,5,5,10,20] → true.", approach: "Track count of 5s and 10s; prefer giving 10 over two 5s on $20.", time: "O(n)", space: "O(1)", code: `class Solution {
    public boolean lemonadeChange(int[] bills) {
        // TODO: Implement
    }
}` },
      { title: "Assign Cookies", difficulty: "Easy", lc: "LC 455", priority: 3, statement: "Max children satisfied if child g needs cookie ≥ g; each cookie used once.", example: "g=[1,2,3], s=[1,1] → 1 child.", approach: "Sort both; two-pointer smallest fit.", time: "O(n log n)", space: "O(1)", code: `class Solution {
    public int findContentChildren(int[] g, int[] s) {
        // TODO: Implement
    }
}` }
    ]
  },
  {
    id: "heap",
    name: "Heaps / Priority Queue",
    icon: "△",
    topicPriority: 13,
    accent: "#f472b6",
    description: "Top-K problems, merge K lists, median stream.",
    problems: [
      { title: "Find Median from Data Stream", difficulty: "Hard", lc: "LC 295", priority: 0, statement: "Add integers and query median at any time.", example: "addNum(1),addNum(2),findMedian()→1.5", approach: "Two heaps: max-heap lower half, min-heap upper half.", time: "O(log n)", space: "O(n)", code: `class MedianFinder {
    PriorityQueue<Integer> lo=new PriorityQueue<>(Collections.reverseOrder());
    PriorityQueue<Integer> hi=new PriorityQueue<>();
    public void addNum(int num) {
        lo.offer(num); hi.offer(lo.poll());
        if(lo.size()<hi.size()) lo.offer(hi.poll());
    }
    public double findMedian() {
        return lo.size()>hi.size()?lo.peek():(lo.peek()+hi.peek())/2.0;
    }
}` },
      { title: "Merge k Sorted Lists", difficulty: "Hard", lc: "LC 23", priority: 0, statement: "Same as linked-list version: merge k sorted linked lists.", example: "Multiple sorted lists → one sorted list.", approach: "Min-heap of size k on current heads.", time: "O(N log k)", space: "O(k)", code: `class Solution {
    public ListNode mergeKLists(ListNode[] lists) {
        PriorityQueue<ListNode> pq=new PriorityQueue<>((a,b)->a.val-b.val);
        for(ListNode l:lists) if(l!=null) pq.offer(l);
        ListNode d=new ListNode(0),c=d;
        while(!pq.isEmpty()){ListNode n=pq.poll();c.next=n;c=c.next;if(n.next!=null)pq.offer(n.next);}
        return d.next;
    }
}` },
      { title: "Kth Largest Element in an Array", difficulty: "Medium", lc: "LC 215", priority: 0, statement: "Return kth largest in unsorted array.", example: "[3,2,1,5,6,4], k=2 → 5.", approach: "Min-heap of size k or quickselect.", time: "O(n log k)", space: "O(k)", code: `class Solution {
    public int findKthLargest(int[] nums, int k) {
        PriorityQueue<Integer> pq=new PriorityQueue<>();
        for(int x:nums){pq.offer(x);if(pq.size()>k)pq.poll();}
        return pq.peek();
    }
}` },
      { title: "Task Scheduler", difficulty: "Medium", lc: "LC 621", priority: 0, statement: "Minimum intervals to finish all tasks with cooling n between same tasks.", example: "['A','A','A','B','B','B'], n=2 → 8 slots.", approach: "Greedy by max frequency; idle slots = max(0, (max-1)*(n+1)+countMax).", time: "O(n)", space: "O(1)", code: `class Solution {
    public int leastInterval(char[] tasks, int n) {
        int[] c=new int[26]; int mx=0,mxc=0;
        for(char t:tasks){c[t-'A']++; if(c[t-'A']>mx){mx=c[t-'A'];mxc=1;} else if(c[t-'A']==mx)mxc++;}
        return Math.max(tasks.length,(mx-1)*(n+1)+mxc);
    }
}` },
      { title: "Top K Frequent Elements", difficulty: "Medium", lc: "LC 347", priority: 0, statement: "Return k most frequent elements (any order).", example: "[1,1,1,2,2,3], k=2 → [1,2].", approach: "Frequency map + min-heap of size k on pairs.", time: "O(n log k)", space: "O(n)", code: `class Solution {
    public int[] topKFrequent(int[] nums, int k) {
        Map<Integer,Integer> f=new HashMap<>();
        for(int x:nums) f.merge(x,1,Integer::sum);
        PriorityQueue<int[]> pq=new PriorityQueue<>((a,b)->a[1]-b[1]);
        for(var e:f.entrySet()){pq.offer(new int[]{e.getKey(),e.getValue()});if(pq.size()>k)pq.poll();}
        int[] r=new int[k]; for(int i=0;i<k;i++) r[i]=pq.poll()[0]; return r;
    }
}` },
      { title: "Connect n Ropes with Minimum Cost", difficulty: "Medium", lc: "GFG", priority: 1, statement: "Repeatedly connect two smallest ropes; cost is sum of lengths; minimize total cost.", example: "[4,3,2,6] → 29.", approach: "Min-heap: poll two smallest, push sum until one rope left.", time: "O(n log n)", space: "O(n)", code: `class Solution {
    long minCost(long[] arr, int n) {
        PriorityQueue<Long> pq=new PriorityQueue<>();
        for(long x:arr) pq.offer(x); long sum=0;
        while(pq.size()>1){long a=pq.poll()+pq.poll(); sum+=a; pq.offer(a);}
        return sum;
    }
}` },
      { title: "Design Twitter", difficulty: "Medium", lc: "LC 355", priority: 1, statement: "postTweet, getNewsFeed (10 recent from followees + self), follow, unfollow.", example: "Merge per-user tweet timelines by global timestamp.", approach: "Per-user tweet list; max-heap merges one pointer per followee; advance index after poll.", time: "O(10 log F)", space: "O(tweets+F)", code: `class Twitter {
    int t=0; Map<Integer,List<int[]>> tw=new HashMap<>(); Map<Integer,Set<Integer>> fo=new HashMap<>();
    public void postTweet(int u,int id){tw.computeIfAbsent(u,x->new ArrayList<>()).add(new int[]{++t,id});}
    public List<Integer> getNewsFeed(int u) {
        PriorityQueue<int[]> pq=new PriorityQueue<>((a,b)->b[0]-a[0]);
        fo.computeIfAbsent(u,x->new HashSet<>()).add(u);
        for(int id:fo.get(u)){List<int[]> L=tw.get(id); if(L!=null&&!L.isEmpty()){int i=L.size()-1;int[] x=L.get(i);pq.offer(new int[]{x[0],x[1],id,i});}}
        List<Integer> res=new ArrayList<>();
        while(!pq.isEmpty()&&res.size()<10){int[] h=pq.poll(); res.add(h[1]); if(h[3]>0){int[] n=tw.get(h[2]).get(h[3]-1); pq.offer(new int[]{n[0],n[1],h[2],h[3]-1});}}
        return res;
    }
    public void follow(int a,int b){fo.computeIfAbsent(a,x->new HashSet<>()).add(b);}
    public void unfollow(int a,int b){if(fo.containsKey(a)) fo.get(a).remove(b);}
}` },
      { title: "Hand of Straights", difficulty: "Medium", lc: "LC 846", priority: 1, statement: "Partition hand into groups of groupSize consecutive integers.", example: "[1,2,3,6,2,3,4,7,8], W=3 → true.", approach: "TreeMap count; repeatedly start smallest and consume chain.", time: "O(n log n)", space: "O(n)", code: `class Solution {
    public boolean isNStraightHand(int[] hand, int W) {
        if(hand.length%W!=0) return false;
        TreeMap<Integer,Integer> m=new TreeMap<>();
        for(int x:hand) m.merge(x,1,Integer::sum);
        while(!m.isEmpty()){
            int s=m.firstKey();
            for(int i=0;i<W;i++){if(!m.containsKey(s+i)) return false;
                if(m.merge(s+i,-1)==0) m.remove(s+i);}
        }
        return true;
    }
}` },
      { title: "Kth Largest Element in a Stream", difficulty: "Medium", lc: "LC 703", priority: 1, statement: "Design class: constructor(k, nums), add(val) returns kth largest in stream including adds.", example: "k=3, stream grows; heap holds k largest.", approach: "Min-heap size k.", time: "O(log k) add", space: "O(k)", code: `class KthLargest {
    PriorityQueue<Integer> pq=new PriorityQueue<>(); int k;
    public KthLargest(int K, int[] nums){k=K; for(int x:nums) add(x);}
    public int add(int v){pq.offer(v); if(pq.size()>k)pq.poll(); return pq.peek();}
}` },
      { title: "Maximum Sum Combination", difficulty: "Medium", lc: "GFG", priority: 1, statement: "Two sorted arrays A,B length n; pick n pairs (i,j) without repeating index pair maximizing sum A[i]+B[j].", example: "Use max-heap on (sum,i,j) with visited set.", approach: "Start (n-1,n-1); heap expand to (i-1,j) and (i,j-1).", time: "O(n log n)", space: "O(n)", code: `class Solution {
    List<Integer> maxCombinations(int N, int K, int A[], int B[]) {
        Arrays.sort(A); Arrays.sort(B); PriorityQueue<int[]> pq=new PriorityQueue<>((x,y)->(A[y[0]]+B[y[1]])-(A[x[0]]+B[x[1]]));
        Set<String> vis=new HashSet<>(); List<Integer> res=new ArrayList<>();
        pq.offer(new int[]{N-1,N-1}); vis.add((N-1)+","+(N-1));
        while(K-->0&&!pq.isEmpty()){int[] t=pq.poll(); int i=t[0],j=t[1]; res.add(A[i]+B[j]);
            if(i>0&&!vis.contains((i-1)+","+j)){vis.add((i-1)+","+j); pq.offer(new int[]{i-1,j});}
            if(j>0&&!vis.contains(i+","+(j-1))){vis.add(i+","+(j-1)); pq.offer(new int[]{i,j-1});}}
        return res;
    }
}` },
      { title: "Sort a K-Sorted Array / Nearly Sorted", difficulty: "Medium", lc: "GFG", priority: 1, statement: "Each element at most k positions away from sorted position; sort array.", example: "k=2: use heap window.", approach: "Min-heap of size k+1 sliding, or merge k-way chunks.", time: "O(n log k)", space: "O(k)", code: `class Solution {
    void sortK(int[] a, int k) {
        PriorityQueue<Integer> pq=new PriorityQueue<>();
        for(int i=0;i<=k&&i<a.length;i++) pq.offer(a[i]);
        int idx=0;
        for(int i=k+1;i<a.length;i++){a[idx++]=pq.poll(); pq.offer(a[i]);}
        while(!pq.isEmpty()) a[idx++]=pq.poll();
    }
}` },
      { title: "Kth Smallest Element", difficulty: "Medium", lc: "GFG", priority: 2, statement: "kth smallest in unsorted array (order statistic).", example: "Quickselect or max-heap of size k.", approach: "Max-heap k smallest or quickselect.", time: "O(n) avg", space: "O(1)", code: `class Solution {
    public static int kthSmallest(int[] arr, int l, int r, int k) {
        // TODO: Implement
    }
}` },
      { title: "Replace Each Element by Rank", difficulty: "Medium", lc: "LC 1331", priority: 2, statement: "Replace each value by its 1-based rank among unique sorted values.", example: "[40,10,20,30] → [4,1,2,3].", approach: "Copy sort; map value→rank; handle ties same rank.", time: "O(n log n)", space: "O(n)", code: `class Solution {
    public int[] arrayRankTransform(int[] arr) {
        // TODO: Implement
    }
}` }
    ]
  },
  {
    id: "trie",
    name: "Tries",
    icon: "⊞",
    topicPriority: 14,
    accent: "#38bdf8",
    description: "Implement Trie, word search, XOR problems.",
    problems: [
      { title: "Word Search II", difficulty: "Hard", lc: "LC 212", priority: 0, statement: "Find all words from dictionary present in board (reuse cell once per word path).", example: "Board + words list → all matches.", approach: "Trie of words; DFS from each cell; prune when prefix absent.", time: "O(m*n*4^L)", space: "O(ALPH*n)", code: `class Solution {
    int[][] d={{0,1},{0,-1},{1,0},{-1,0}};
    public List<String> findWords(char[][] b, String[] words) {
        TrieNode rt=new TrieNode(); for(String w:words){TrieNode n=rt;for(char ch:w.toCharArray()){int i=ch-'a';if(n.ch[i]==null)n.ch[i]=new TrieNode();n=n.ch[i];}n.w=w;}
        List<String> res=new ArrayList<>();
        for(int i=0;i<b.length;i++) for(int j=0;j<b[0].length;j++) dfs(b,i,j,rt,res);
        return res;
    }
    void dfs(char[][] b,int i,int j,TrieNode n,List<String> res){
        if(i<0||i>=b.length||j<0||j>=b[0].length||b[i][j]=='#'||n.ch[b[i][j]-'a']==null) return;
        char ch=b[i][j]; n=n.ch[ch-'a'];
        if(n.w!=null){res.add(n.w);n.w=null;}
        b[i][j]='#'; for(int[] x:d) dfs(b,i+x[0],j+x[1],n,res); b[i][j]=ch;
    }
    class TrieNode{TrieNode[] ch=new TrieNode[26]; String w;}
}` },
      { title: "Implement Trie (Prefix Tree)", difficulty: "Medium", lc: "LC 208", priority: 0, statement: "insert, search exact word, startsWith prefix.", example: "insert apple; search apple true; search app false; startsWith app true.", approach: "26-array children per node + end flag.", time: "O(L)", space: "O(NL)", code: `class Trie {
    Trie[] ch=new Trie[26]; boolean end;
    public void insert(String w){Trie n=this;for(char c:w.toCharArray()){int i=c-'a';if(n.ch[i]==null)n.ch[i]=new Trie();n=n.ch[i];}n.end=true;}
    public boolean search(String w){Trie n=find(w);return n!=null&&n.end;}
    public boolean startsWith(String p){return find(p)!=null;}
    Trie find(String w){Trie n=this;for(char c:w.toCharArray()){int i=c-'a';if(n.ch[i]==null)return null;n=n.ch[i];}return n;}
}` },
      { title: "Maximum XOR With an Element From Array", difficulty: "Hard", lc: "LC 1707", priority: 1, statement: "Queries (xi,mi): max nums[j] XOR xi with nums[j]≤mi.", example: "Offline sort queries + trie insert incrementally.", approach: "Sort nums and queries by mi; trie of eligible nums; same max XOR walk.", time: "O((N+Q)*32)", space: "O(N*32)", code: `class Solution {
    public int[] maximizeXor(int[] nums, int[][] queries) {
        Arrays.sort(nums); int m=queries.length; Integer[] I=new Integer[m];
        for(int i=0;i<m;i++) I[i]=i; Arrays.sort(I,(a,b)->queries[a][1]-queries[b][1]);
        int[] ans=new int[m], ptr=0; Trie t=new Trie();
        for(int id:I){while(ptr<nums.length&&nums[ptr]<=queries[id][1]) t.add(nums[ptr++]);
            ans[id]=ptr==0?-1:t.maxXor(queries[id][0]);}
        return ans;
    }
    class Trie{Trie[] c=new Trie[2]; void add(int x){Trie n=this;for(int i=31;i>=0;i--){int b=(x>>i)&1;if(n.c[b]==null)n.c[b]=new Trie();n=n.c[b];}}
        int maxXor(int x){Trie n=this;int v=0;for(int i=31;i>=0;i--){int b=(x>>i)&1;if(n.c[1-b]!=null){v|=(1<<i);n=n.c[1-b];}else if(n.c[b]==null)return v;else n=n.c[b];}return v;}}
}` },
      { title: "Implement Trie II (prefix count)", difficulty: "Medium", lc: "GFG", priority: 1, statement: "Trie supporting insert, countWordsEqualTo, countWordsStartingWith, erase.", example: "Track frequency per node for ends and prefixes.", approach: "Two counters per node: endsWith, prefixCount.", time: "O(L)", space: "O(NL)", code: `class Trie {
    Trie[] ch=new Trie[26]; int pref=0, end=0;
    public void insert(String w){Trie n=this;for(char c:w.toCharArray()){int i=c-'a';if(n.ch[i]==null)n.ch[i]=new Trie();n=n.ch[i];n.pref++;}n.end++;}
    public int countWordsEqualTo(String w){Trie n=find(w);return n==null?0:n.end;}
    public int countWordsStartingWith(String p){Trie n=find(p);return n==null?0:n.pref;}
    public void erase(String w){Trie n=this;for(char c:w.toCharArray()){int i=c-'a';n=n.ch[i];n.pref--;}n.end--;}
    Trie find(String w){Trie n=this;for(char c:w.toCharArray()){int i=c-'a';if(n.ch[i]==null)return null;n=n.ch[i];}return n;}
}` },
      { title: "Longest String with All Prefixes", difficulty: "Medium", lc: "GFG", priority: 1, statement: "Among given strings, find longest such that every prefix is also in the set.", example: "Words ['a','ab','abc'] → 'abc' (every prefix is a word).", approach: "Trie of all words; DFS only through edges whose child marks end of a word (every prefix valid).", time: "O(total chars)", space: "O(total chars)", code: `class Solution {
    static class TrieNode { TrieNode[] ch=new TrieNode[26]; boolean end; }
    String best="";
    void ins(TrieNode r,String w){TrieNode n=r;for(char c:w.toCharArray()){int i=c-'a';if(n.ch[i]==null)n.ch[i]=new TrieNode();n=n.ch[i];}n.end=true;}
    void dfs(TrieNode n,StringBuilder sb){
        for(int i=0;i<26;i++) if(n.ch[i]!=null&&n.ch[i].end){
            sb.append((char)('a'+i));
            if(sb.length()>best.length()||(sb.length()==best.length()&&sb.toString().compareTo(best)<0)) best=sb.toString();
            dfs(n.ch[i],sb); sb.deleteCharAt(sb.length()-1);
        }
    }
    public String longestString(String[] words){
        TrieNode r=new TrieNode(); for(String w:words) ins(r,w);
        dfs(r,new StringBuilder()); return best;
    }
}` },
      { title: "Number of Distinct Substrings", difficulty: "Medium", lc: "GFG", priority: 1, statement: "Count distinct substrings of a string.", example: "'aaba' → 7 distinct non-empty substrings.", approach: "Trie of all suffixes; answer = number of trie nodes (excluding root).", time: "O(n^2)", space: "O(n^2)", code: `class Solution {
    static class Node{Node[] c=new Node[26];}
    int nodes(Node r){int t=0;for(int i=0;i<26;i++)if(r.c[i]!=null)t+=1+nodes(r.c[i]);return t;}
    public int countDistinctSubstrings(String s){
        Node rt=new Node();
        for(int i=0;i<s.length();i++){Node n=rt;for(int j=i;j<s.length();j++){int k=s.charAt(j)-'a';if(n.c[k]==null)n.c[k]=new Node();n=n.c[k];}}
        return nodes(rt);
    }
}` },
      { title: "Maximum XOR of Two Numbers in an Array", difficulty: "Medium", lc: "LC 421", priority: 1, statement: "Maximum a XOR b over pairs in nums.", example: "[3,10,5,25,2,8] → 28.", approach: "Binary trie; for each value greedily pick opposite bit.", time: "O(n*31)", space: "O(n)", code: `class Solution {
    public int findMaximumXOR(int[] nums) {
        Trie r=new Trie(); for(int x:nums) r.add(x); int mx=0;
        for(int x:nums) mx=Math.max(mx,r.maxXor(x)); return mx;
    }
    class Trie{Trie[] c=new Trie[2]; void add(int x){Trie n=this;for(int i=31;i>=0;i--){int b=(x>>i)&1;if(n.c[b]==null)n.c[b]=new Trie();n=n.c[b];}}
        int maxXor(int x){Trie n=this;int v=0;for(int i=31;i>=0;i--){int b=(x>>i)&1;if(n.c[1-b]!=null){v|=(1<<i);n=n.c[1-b];}else n=n.c[b];}return v;}}
}` }
    ]
  },
  {
    id: "bit",
    name: "Bit Manipulation",
    icon: "⊕",
    topicPriority: 15,
    accent: "#94a3b8",
    description: "XOR tricks, power of 2, counting bits. Quick wins in interviews.",
    problems: [
      { title: "Divide Two Integers", difficulty: "Medium", lc: "LC 29", priority: 1, statement: "Divide two integers without *, /, %; truncate toward zero.", example: "7 / -3 = -2.", approach: "Binary long division with doubling divisor; careful overflow.", time: "O(log^2 n)", space: "O(1)", code: `class Solution {
    public int divide(int A, int B) {
        if(A==Integer.MIN_VALUE&&B==-1) return Integer.MAX_VALUE;
        boolean neg=(A<0)^(B<0); long a=Math.abs((long)A), b=Math.abs((long)B); long q=0;
        while(a>=b){long x=b,c=1; while(a>=x<<1){x<<=1;c<<=1;} a-=x;q+=c;}
        return neg?(int)-q:(int)q;
    }
}` },
      { title: "Single Number II", difficulty: "Medium", lc: "LC 137", priority: 1, statement: "Every element appears three times except one appears once.", example: "[2,2,3,2] → 3.", approach: "Count bits mod 3 or ones/twos state machine.", time: "O(n)", space: "O(1)", code: `class Solution {
    public int singleNumber(int[] nums) {
        int ones=0,twos=0;
        for(int x:nums){ones=(ones^x)&~twos; twos=(twos^x)&~ones;}
        return ones;
    }
}` },
      { title: "Single Number III", difficulty: "Medium", lc: "LC 260", priority: 1, statement: "Exactly two numbers appear once; others twice. Find the two.", example: "[1,2,1,3,2,5] → [3,5].", approach: "XOR all → diff bit; partition by bit.", time: "O(n)", space: "O(1)", code: `class Solution {
    public int[] singleNumber(int[] nums) {
        int x=0; for(int n:nums) x^=n; int lb=x&-x; int a=0;
        for(int n:nums) if((n&lb)!=0) a^=n;
        return new int[]{a,a^x};
    }
}` },
      { title: "Sieve of Eratosthenes", difficulty: "Medium", lc: "GFG", priority: 2, statement: "Mark non-primes up to n.", example: "n=10 → primes 2,3,5,7.", approach: "Cross out multiples from each prime p up to sqrt(n).", time: "O(n log log n)", space: "O(n)", code: `class Solution {
    public static boolean[] sieveOfEratosthenes(int n) {
        // TODO: Implement
    }
}` },
      { title: "Subsets / Power Set", difficulty: "Medium", lc: "LC 78", priority: 2, statement: "Same as recursion subset: all subsets of nums (also bit-mask iteration).", example: "[1,2] → [[],[1],[2],[1,2]].", approach: "Iterate mask 0..2^n-1 or recursion.", time: "O(2^n)", space: "O(1) extra for iterative", code: `class Solution {
    public List<List<Integer>> subsets(int[] nums) {
        // TODO: Implement
    }
}` },
      { title: "XOR of Numbers from L to R", difficulty: "Medium", lc: "GFG", priority: 2, statement: "Compute L xor (L+1) xor ... xor R.", example: "L=3,R=9.", approach: "f(n)=xor 1..n with pattern n%4; answer f(R)^f(L-1).", time: "O(1)", space: "O(1)", code: `class Solution {
    public static int xorRange(int L, int R) {
        // TODO: Implement
    }
}` },
      { title: "Count Bits to Flip A to B", difficulty: "Easy", lc: "LC 461", priority: 2, statement: "Number of bit positions where x and y differ.", example: "x=1,y=4 → 2.", approach: "Popcount(x^y).", time: "O(1)", space: "O(1)", code: `class Solution {
    public int hammingDistance(int x, int y) {
        // TODO: Implement
    }
}` },
      { title: "Counting Bits", difficulty: "Easy", lc: "LC 338", priority: 2, statement: "For each i in [0,n], count number of 1 bits.", example: "n=2 → [0,1,1].", approach: "dp[i]=dp[i>>1]+(i&1).", time: "O(n)", space: "O(n)", code: `class Solution {
    public int[] countBits(int n) {
        // TODO: Implement
    }
}` },
      { title: "Number of 1 Bits", difficulty: "Easy", lc: "LC 191", priority: 2, statement: "Hamming weight of unsigned 32-bit n.", example: "11 (1011) → 3.", approach: "n&(n-1) clears lowest set bit in loop.", time: "O(1)", space: "O(1)", code: `public class Solution {
    public int hammingWeight(int n) {
        // TODO: Implement
    }
}` },
      { title: "Power of Two", difficulty: "Easy", lc: "LC 231", priority: 2, statement: "Return true if n is a power of two.", example: "16 true, 3 false.", approach: "n>0 && (n&(n-1))==0.", time: "O(1)", space: "O(1)", code: `class Solution {
    public boolean isPowerOfTwo(int n) {
        // TODO: Implement
    }
}` },
      { title: "Single Number", difficulty: "Easy", lc: "LC 136", priority: 2, statement: "Every element twice except one.", example: "[4,1,2,1,2] → 4.", approach: "XOR all.", time: "O(n)", space: "O(1)", code: `class Solution {
    public int singleNumber(int[] nums) {
        // TODO: Implement
    }
}` },
      { title: "Check Odd or Even", difficulty: "Easy", lc: "GFG", priority: 3, statement: "Determine parity using bitwise op.", example: "n=7 odd.", approach: "(n & 1) == 1 for odd.", time: "O(1)", space: "O(1)", code: `class Solution {
    public static boolean isOdd(int n) {
        // TODO: Implement
    }
}` },
      { title: "Check if ith Bit is Set", difficulty: "Easy", lc: "GFG", priority: 3, statement: "Test whether bit i (0-based from LSB) is 1.", example: "n=5,i=2 → true.", approach: "(n & (1<<i)) != 0.", time: "O(1)", space: "O(1)", code: `class Solution {
    public static boolean isBitSet(int n, int i) {
        // TODO: Implement
    }
}` },
      { title: "Swap Two Numbers without Temp", difficulty: "Easy", lc: "GFG", priority: 3, statement: "Swap a and b using XOR (or arithmetic).", example: "a=3,b=5 → a=5,b=3.", approach: "a^=b; b^=a; a^=b;", time: "O(1)", space: "O(1)", code: `class Solution {
    public static void swap(int[] pair) {
        // TODO: Implement
    }
}` }
    ]
  }
];



const priorityLabels = { 0: "P0 · Must Do", 1: "P1 · Important", 2: "P2 · Good to Know", 3: "P3 · Optional" };
const priorityColors = { 0: "#ef4444", 1: "#f59e0b", 2: "#3b82f6", 3: "#6b7280" };
const diffStyles = { Easy: { bg: "#064e3b", color: "#6ee7b7" }, Medium: { bg: "#713f12", color: "#fde68a" }, Hard: { bg: "#7f1d1d", color: "#fca5a5" } };

export default function StriverGuide() {
  const [activeTopic, setActiveTopic] = useState(topics[0]?.id || "dp");
  const [expandedProblem, setExpandedProblem] = useState(null);
  const [prioFilter, setPrioFilter] = useState("all");
  const [diffFilter, setDiffFilter] = useState("all");
  const [search, setSearch] = useState("");
  const detailRef = useRef(null);

  const topic = topics.find(t => t.id === activeTopic);
  const filtered = useMemo(() => {
    if (!topic) return [];
    return topic.problems.filter(p => {
      if (prioFilter !== "all" && p.priority !== parseInt(prioFilter)) return false;
      if (diffFilter !== "all" && p.difficulty !== diffFilter) return false;
      if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    }).sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority;
      const dOrder = { Hard: 0, Medium: 1, Easy: 2 };
      return (dOrder[a.difficulty] || 1) - (dOrder[b.difficulty] || 1);
    });
  }, [topic, prioFilter, diffFilter, search]);

  const totalByPrio = useMemo(() => {
    if (!topic) return {};
    const counts = {};
    topic.problems.forEach(p => { counts[p.priority] = (counts[p.priority] || 0) + 1; });
    return counts;
  }, [topic]);

  const globalStats = useMemo(() => {
    const total = topics.reduce((s, t) => s + t.problems.length, 0);
    const p0 = topics.reduce((s, t) => s + t.problems.filter(p => p.priority === 0).length, 0);
    const hard = topics.reduce((s, t) => s + t.problems.filter(p => p.difficulty === "Hard").length, 0);
    const med = topics.reduce((s, t) => s + t.problems.filter(p => p.difficulty === "Medium").length, 0);
    const easy = topics.reduce((s, t) => s + t.problems.filter(p => p.difficulty === "Easy").length, 0);
    return { total, p0, hard, med, easy };
  }, []);

  useEffect(() => {
    if (expandedProblem !== null && detailRef.current) {
      detailRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [expandedProblem]);

  const expanded = expandedProblem !== null ? filtered[expandedProblem] : null;

  return (
    <div style={{ fontFamily: "'IBM Plex Mono', 'Menlo', monospace", background: "#09090b", color: "#e4e4e7", minHeight: "100vh" }}>
      <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600;700&family=Outfit:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 2px; }
        .topic-btn { transition: all 0.15s; cursor: pointer; border: none; font-family: inherit; }
        .topic-btn:hover { transform: translateY(-1px); }
        .prob-row { transition: all 0.12s; cursor: pointer; }
        .prob-row:hover { background: #18181b !important; }
        @keyframes slideIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        .detail-panel { animation: slideIn 0.2s ease; }
        pre { tab-size: 4; }
      `}</style>

      {/* HEADER */}
      <div style={{ background: "linear-gradient(180deg, #18181b 0%, #09090b 100%)", padding: "20px 16px 14px", borderBottom: "1px solid #27272a" }}>
        <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 20, fontWeight: 900, letterSpacing: "-1px", background: "linear-gradient(135deg, #f472b6, #60a5fa, #34d399)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          STRIVER A2Z DSA SHEET
        </div>
        <div style={{ fontSize: 10, color: "#52525b", marginTop: 2, letterSpacing: "1.5px", fontWeight: 500 }}>
          {globalStats.total} PROBLEMS · {topics.length} TOPICS · {globalStats.p0} MUST-DO · {globalStats.hard}H / {globalStats.med}M / {globalStats.easy}E · SDE-2/SSE PREP · JAVA
        </div>
      </div>

      {/* TOPIC SELECTOR */}
      <div style={{ padding: "8px 12px", borderBottom: "1px solid #1a1a1e", overflowX: "auto", display: "flex", gap: 4, whiteSpace: "nowrap" }}>
        {topics.map(t => (
          <button
            key={t.id}
            className="topic-btn"
            onClick={() => { setActiveTopic(t.id); setExpandedProblem(null); setPrioFilter("all"); setDiffFilter("all"); setSearch(""); }}
            style={{
              padding: "6px 12px", borderRadius: 8,
              background: activeTopic === t.id ? t.accent + "22" : "transparent",
              border: activeTopic === t.id ? `1.5px solid ${t.accent}` : "1px solid #27272a",
              color: activeTopic === t.id ? t.accent : "#71717a",
              fontSize: 10, fontWeight: 600, fontFamily: "'Outfit', sans-serif",
              display: "flex", alignItems: "center", gap: 4
            }}
          >
            <span style={{ fontSize: 12 }}>{t.icon}</span>
            <span>{t.name}</span>
            <span style={{ fontSize: 9, opacity: 0.6 }}>({t.problems.length})</span>
          </button>
        ))}
      </div>

      {/* TOPIC INFO BAR */}
      {topic && (
        <div style={{ padding: "10px 16px", borderBottom: "1px solid #1a1a1e", background: "#0c0c0e" }}>
          <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15, fontWeight: 700, color: topic.accent, display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 16 }}>{topic.icon}</span> {topic.name}
            <span style={{ fontSize: 10, color: "#52525b", fontWeight: 400, fontFamily: "'IBM Plex Mono', monospace" }}>
              — Priority #{topic.topicPriority} for SDE-2/SSE
            </span>
          </div>
          <div style={{ fontSize: 10, color: "#71717a", marginTop: 3 }}>{topic.description}</div>
          <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap", alignItems: "center" }}>
            {Object.entries(totalByPrio).sort(([a],[b])=>a-b).map(([p, c]) => (
              <span key={p} style={{ fontSize: 9, padding: "2px 8px", borderRadius: 10, background: priorityColors[p] + "22", color: priorityColors[p], fontWeight: 600 }}>
                P{p}: {c}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* FILTERS */}
      <div style={{ padding: "8px 16px", borderBottom: "1px solid #1a1a1e", display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
        <input
          placeholder="Search..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ padding: "5px 10px", borderRadius: 6, border: "1px solid #27272a", background: "#18181b", color: "#e4e4e7", fontSize: 10, fontFamily: "inherit", width: 140, outline: "none" }}
        />
        <div style={{ display: "flex", gap: 3 }}>
          {["all", "0", "1", "2", "3"].map(p => (
            <button key={p} onClick={() => setPrioFilter(p)} style={{
              padding: "3px 8px", borderRadius: 10, fontSize: 9, fontFamily: "inherit", cursor: "pointer",
              border: prioFilter === p ? `1px solid ${p === "all" ? "#fff" : priorityColors[p]}` : "1px solid #27272a",
              background: prioFilter === p ? (p === "all" ? "#fff1" : priorityColors[p] + "33") : "transparent",
              color: prioFilter === p ? (p === "all" ? "#fff" : priorityColors[p]) : "#52525b",
              fontWeight: 600
            }}>
              {p === "all" ? "All" : `P${p}`}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 3 }}>
          {["all", "Easy", "Medium", "Hard"].map(d => (
            <button key={d} onClick={() => setDiffFilter(d)} style={{
              padding: "3px 8px", borderRadius: 10, fontSize: 9, fontFamily: "inherit", cursor: "pointer",
              border: "1px solid #27272a",
              background: diffFilter === d ? (d !== "all" ? diffStyles[d].bg : "#fff1") : "transparent",
              color: diffFilter === d ? (d !== "all" ? diffStyles[d].color : "#fff") : "#52525b",
              fontWeight: 600
            }}>
              {d === "all" ? "All" : d}
            </button>
          ))}
        </div>
        <span style={{ fontSize: 9, color: "#3f3f46", marginLeft: "auto" }}>{filtered.length} problems</span>
      </div>

      {/* PROBLEM LIST */}
      <div style={{ padding: "4px 8px" }}>
        {filtered.map((p, idx) => {
          const isExpanded = expandedProblem === idx;
          return (
            <div key={idx}>
              <div
                className="prob-row"
                onClick={() => setExpandedProblem(isExpanded ? null : idx)}
                style={{
                  padding: "8px 12px", margin: "2px 0", borderRadius: 8,
                  background: isExpanded ? "#18181b" : "#0c0c0e",
                  border: isExpanded ? `1px solid ${topic.accent}44` : "1px solid transparent",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 8, color: priorityColors[p.priority], fontWeight: 700, minWidth: 28, fontFamily: "'Outfit', sans-serif" }}>
                    P{p.priority}
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 500, color: "#d4d4d8", flex: 1, minWidth: 120 }}>{p.title}</span>
                  <span style={{ fontSize: 8, padding: "1px 6px", borderRadius: 8, background: diffStyles[p.difficulty]?.bg, color: diffStyles[p.difficulty]?.color, fontWeight: 600 }}>{p.difficulty}</span>
                  <span style={{ fontSize: 8, color: "#52525b" }}>{p.lc}</span>
                  <span style={{ fontSize: 10, color: isExpanded ? topic.accent : "#3f3f46" }}>{isExpanded ? "▾" : "▸"}</span>
                </div>
              </div>

              {isExpanded && (
                <div ref={detailRef} className="detail-panel" style={{ margin: "0 4px 6px", borderRadius: 8, border: `1px solid ${topic.accent}33`, background: "#111113", overflow: "hidden" }}>
                  <div style={{ padding: "12px 14px", borderBottom: "1px solid #1a1a1e" }}>
                    <div style={{ fontSize: 9, color: topic.accent, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: 5 }}>Problem</div>
                    <div style={{ fontSize: 11, color: "#a1a1aa", lineHeight: 1.6 }}>{p.statement}</div>
                  </div>
                  <div style={{ padding: "10px 14px", borderBottom: "1px solid #1a1a1e" }}>
                    <div style={{ fontSize: 9, color: "#facc15", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: 5 }}>Example</div>
                    <pre style={{ fontSize: 10, color: "#71717a", lineHeight: 1.5, background: "#0a0a0c", padding: 10, borderRadius: 6, overflow: "auto", whiteSpace: "pre-wrap" }}>{p.example}</pre>
                  </div>
                  <div style={{ padding: "10px 14px", borderBottom: "1px solid #1a1a1e" }}>
                    <div style={{ fontSize: 9, color: "#34d399", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: 5 }}>Approach</div>
                    <div style={{ fontSize: 11, color: "#a1a1aa", lineHeight: 1.6 }}>{p.approach}</div>
                    <div style={{ display: "flex", gap: 12, marginTop: 6 }}>
                      <span style={{ fontSize: 9, color: "#52525b" }}>Time: <span style={{ color: "#ef4444" }}>{p.time}</span></span>
                      <span style={{ fontSize: 9, color: "#52525b" }}>Space: <span style={{ color: "#ef4444" }}>{p.space}</span></span>
                    </div>
                  </div>
                  <div style={{ padding: "10px 14px" }}>
                    <div style={{ fontSize: 9, color: "#60a5fa", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: 5 }}>Java Code</div>
                    <pre style={{ fontSize: 10, color: "#b4b4bc", lineHeight: 1.45, background: "#0a0a0c", padding: 12, borderRadius: 6, overflow: "auto", whiteSpace: "pre-wrap", wordBreak: "break-word", border: "1px solid #1a1a1e" }}>
                      {p.code}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div style={{ padding: 32, textAlign: "center", color: "#3f3f46", fontSize: 11 }}>No problems match your filters.</div>
        )}
      </div>

      {/* FOOTER */}
      <div style={{ padding: "16px", textAlign: "center", borderTop: "1px solid #1a1a1e", fontSize: 9, color: "#27272a" }}>
        {globalStats.total} problems · {topics.length} topics · Sorted by SDE-2/SSE interview priority · P0 Must Do first · Tap to expand
      </div>
    </div>
  );
}
