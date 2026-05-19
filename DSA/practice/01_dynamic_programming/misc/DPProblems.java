import java.util.*;

public class DPProblems {

    // ═══════════════════════════════════════════════════════════════════════════
    // HARDEST FIRST — MCM / PARTITION DP
    // These are the hardest DP category. The frame is: try every split point k
    // in range [i,j], recurse on both halves, combine. The key is: what you're
    // optimizing over the split.
    // ═══════════════════════════════════════════════════════════════════════════

    // ─── Matrix Chain Multiplication ─────────────────────────────────────────
    //
    //  Given dimensions arr[] where matrix i has size arr[i-1] x arr[i].
    //  Find minimum multiplications to multiply all matrices.
    //
    //  Recurrence: dp[i][j] = min over k in [i,j-1] of:
    //              dp[i][k] + dp[k+1][j] + arr[i-1]*arr[k]*arr[j]
    //  Base: dp[i][i] = 0 (single matrix, no cost)
    //
    static int mcm(int[] arr) {
        int n = arr.length;
        int[][] dp = new int[n][n];
        // length = gap between i and j
        for (int len = 2; len < n; len++) {
            for (int i = 1; i < n - len + 1; i++) {
                int j = i + len - 1;
                dp[i][j] = Integer.MAX_VALUE;
                for (int k = i; k < j; k++) {
                    int cost = dp[i][k] + dp[k+1][j] + arr[i-1] * arr[k] * arr[j];
                    dp[i][j] = Math.min(dp[i][j], cost);
                }
            }
        }
        return dp[1][n-1];
    }

    // ─── Burst Balloons (LC 312) ──────────────────────────────────────────────
    //
    //  Burst all balloons to maximize coins. Coins for bursting balloon i =
    //  nums[left] * nums[i] * nums[right] where left/right are adjacent unbursted.
    //
    //  KEY INSIGHT: Think in reverse — instead of "which to burst first",
    //  think "which to burst LAST in range [i,j]". The last balloon k bursted
    //  in [i,j] gives coins: nums[i-1] * nums[k] * nums[j+1] (boundaries are fixed).
    //
    //  Add sentinel 1s at both ends. dp[i][j] = max coins from bursting all in [i,j].
    //  Recurrence: dp[i][j] = max over k in [i,j]:
    //              nums[i-1]*nums[k]*nums[j+1] + dp[i][k-1] + dp[k+1][j]
    //
    static int burstBalloons(int[] nums) {
        int n = nums.length;
        int[] arr = new int[n + 2];
        arr[0] = arr[n+1] = 1;
        for (int i = 0; i < n; i++) arr[i+1] = nums[i];
        int[][] dp = new int[n+2][n+2];
        for (int len = 1; len <= n; len++) {
            for (int i = 1; i <= n - len + 1; i++) {
                int j = i + len - 1;
                for (int k = i; k <= j; k++) {
                    int coins = arr[i-1] * arr[k] * arr[j+1] + dp[i][k-1] + dp[k+1][j];
                    dp[i][j] = Math.max(dp[i][j], coins);
                }
            }
        }
        return dp[1][n];
    }

    // ─── Palindrome Partitioning II (LC 132) ─────────────────────────────────
    //
    //  Min cuts to partition string into palindromes.
    //  dp[i] = min cuts for s[0..i].
    //  For each i, try all j <= i where s[j..i] is palindrome → dp[i] = min(dp[j-1]+1).
    //  Precompute palindrome table: isPalin[i][j] in O(n²).
    //
    static int minCuts(String s) {
        int n = s.length();
        boolean[][] isPalin = new boolean[n][n];
        for (int len = 1; len <= n; len++) {
            for (int i = 0; i <= n - len; i++) {
                int j = i + len - 1;
                isPalin[i][j] = s.charAt(i) == s.charAt(j) && (len <= 2 || isPalin[i+1][j-1]);
            }
        }
        int[] dp = new int[n];
        Arrays.fill(dp, Integer.MAX_VALUE);
        for (int i = 0; i < n; i++) {
            if (isPalin[0][i]) { dp[i] = 0; continue; }
            for (int j = 1; j <= i; j++) {
                if (isPalin[j][i]) dp[i] = Math.min(dp[i], dp[j-1] + 1);
            }
        }
        return dp[n-1];
    }

    // ─── Edit Distance (LC 72) ────────────────────────────────────────────────
    //
    //  Min operations (insert, delete, replace) to convert word1 → word2.
    //  dp[i][j] = edit distance between word1[0..i-1] and word2[0..j-1].
    //
    //  If chars match: dp[i][j] = dp[i-1][j-1]
    //  Else: dp[i][j] = 1 + min(dp[i-1][j],    // delete from word1
    //                           dp[i][j-1],    // insert into word1
    //                           dp[i-1][j-1])  // replace
    //
    static int editDistance(String w1, String w2) {
        int m = w1.length(), n = w2.length();
        int[][] dp = new int[m+1][n+1];
        for (int i = 0; i <= m; i++) dp[i][0] = i;
        for (int j = 0; j <= n; j++) dp[0][j] = j;
        for (int i = 1; i <= m; i++) {
            for (int j = 1; j <= n; j++) {
                if (w1.charAt(i-1) == w2.charAt(j-1)) dp[i][j] = dp[i-1][j-1];
                else dp[i][j] = 1 + Math.min(dp[i-1][j-1], Math.min(dp[i-1][j], dp[i][j-1]));
            }
        }
        return dp[m][n];
    }

    // ─── Wildcard Matching (LC 44) ────────────────────────────────────────────
    //
    //  '?' matches any single char. '*' matches any sequence (including empty).
    //  dp[i][j] = can pattern p[0..j-1] match s[0..i-1]?
    //
    //  If p[j-1] == '*': dp[i][j] = dp[i-1][j] (use * to match one more char)
    //                              OR dp[i][j-1] (use * as empty)
    //  If p[j-1] == '?' or match: dp[i][j] = dp[i-1][j-1]
    //
    static boolean wildcardMatch(String s, String p) {
        int m = s.length(), n = p.length();
        boolean[][] dp = new boolean[m+1][n+1];
        dp[0][0] = true;
        for (int j = 1; j <= n; j++) dp[0][j] = dp[0][j-1] && p.charAt(j-1) == '*';
        for (int i = 1; i <= m; i++) {
            for (int j = 1; j <= n; j++) {
                if (p.charAt(j-1) == '*') dp[i][j] = dp[i-1][j] || dp[i][j-1];
                else dp[i][j] = dp[i-1][j-1] && (p.charAt(j-1) == '?' || s.charAt(i-1) == p.charAt(j-1));
            }
        }
        return dp[m][n];
    }

    // ─── Distinct Subsequences (LC 115) ──────────────────────────────────────
    //
    //  Count distinct subsequences of s that equal t.
    //  dp[i][j] = # ways to form t[0..j-1] from s[0..i-1].
    //
    //  If s[i-1] == t[j-1]: dp[i][j] = dp[i-1][j-1]  // use this char
    //                                  + dp[i-1][j]    // skip this char
    //  Else: dp[i][j] = dp[i-1][j]   // skip this char
    //
    static long distinctSubseq(String s, String t) {
        int m = s.length(), n = t.length();
        long[][] dp = new long[m+1][n+1];
        for (int i = 0; i <= m; i++) dp[i][0] = 1;  // empty t matched in 1 way
        for (int i = 1; i <= m; i++) {
            for (int j = 1; j <= n; j++) {
                dp[i][j] = dp[i-1][j];
                if (s.charAt(i-1) == t.charAt(j-1)) dp[i][j] += dp[i-1][j-1];
            }
        }
        return dp[m][n];
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // DP ON STRINGS — LCS family
    // All of these reduce to LCS or build on top of it.
    // Master LCS first — the rest fall out naturally.
    // ═══════════════════════════════════════════════════════════════════════════

    // ─── Longest Common Subsequence ──────────────────────────────────────────
    //
    //  dp[i][j] = LCS of s1[0..i-1] and s2[0..j-1]
    //  If chars match: dp[i][j] = 1 + dp[i-1][j-1]
    //  Else: dp[i][j] = max(dp[i-1][j], dp[i][j-1])
    //
    static int lcs(String s1, String s2) {
        int m = s1.length(), n = s2.length();
        int[][] dp = new int[m+1][n+1];
        for (int i = 1; i <= m; i++)
            for (int j = 1; j <= n; j++)
                dp[i][j] = s1.charAt(i-1) == s2.charAt(j-1)
                    ? 1 + dp[i-1][j-1]
                    : Math.max(dp[i-1][j], dp[i][j-1]);
        return dp[m][n];
    }

    // ─── Longest Common Substring ─────────────────────────────────────────────
    //
    //  Unlike LCS, substring must be contiguous.
    //  dp[i][j] = length of longest common substring ending at s1[i-1] and s2[j-1].
    //  If chars match: dp[i][j] = 1 + dp[i-1][j-1]
    //  Else: dp[i][j] = 0  ← key difference from LCS
    //
    static int longestCommonSubstring(String s1, String s2) {
        int m = s1.length(), n = s2.length(), max = 0;
        int[][] dp = new int[m+1][n+1];
        for (int i = 1; i <= m; i++)
            for (int j = 1; j <= n; j++) {
                dp[i][j] = s1.charAt(i-1) == s2.charAt(j-1) ? 1 + dp[i-1][j-1] : 0;
                max = Math.max(max, dp[i][j]);
            }
        return max;
    }

    // ─── Shortest Common Supersequence (LC 1092) ──────────────────────────────
    //
    //  Shortest string containing both s1 and s2 as subsequences.
    //  Length = m + n - LCS(s1,s2)  [LCS chars appear once, rest twice]
    //
    //  To reconstruct: backtrack LCS table, include LCS chars once, others twice.
    //
    static int shortestCommonSupersequence(String s1, String s2) {
        return s1.length() + s2.length() - lcs(s1, s2);
    }

    // ─── Longest Palindromic Subsequence ─────────────────────────────────────
    //
    //  LPS(s) = LCS(s, reverse(s))
    //  Because: a palindromic subsequence is a common subsequence of s and its reverse.
    //
    static int longestPalindromicSubseq(String s) {
        return lcs(s, new StringBuilder(s).reverse().toString());
    }

    // ─── Min Insertions to Make Palindrome ───────────────────────────────────
    //
    //  = n - LPS(s)
    //  Because: the chars NOT in LPS need to be inserted with their mirrors.
    //
    static int minInsertionsPalindrome(String s) {
        return s.length() - longestPalindromicSubseq(s);
    }

    // ─── Min Insertions/Deletions to Convert s1 → s2 (LC 583 variant) ────────
    //
    //  Deletions from s1 = m - LCS
    //  Insertions into s1 = n - LCS
    //  Total = m + n - 2*LCS
    //
    static int minInsertionsDeletion(String s1, String s2) {
        int l = lcs(s1, s2);
        return (s1.length() - l) + (s2.length() - l);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // DP ON STOCKS
    // Single state machine pattern. State = (day, holding, transactions_left).
    // ═══════════════════════════════════════════════════════════════════════════

    // ─── Stock I — at most 1 transaction ──────────────────────────────────────
    //
    //  Track min price seen so far. Profit at each day = price - minSoFar.
    //  Not really DP — pure greedy O(n).
    //
    static int stockI(int[] prices) {
        int minPrice = Integer.MAX_VALUE, maxProfit = 0;
        for (int p : prices) {
            minPrice = Math.min(minPrice, p);
            maxProfit = Math.max(maxProfit, p - minPrice);
        }
        return maxProfit;
    }

    // ─── Stock II — unlimited transactions ────────────────────────────────────
    //
    //  Capture every upward slope. Buy before every rise, sell at peak.
    //  Add profit whenever prices[i] > prices[i-1].
    //
    static int stockII(int[] prices) {
        int profit = 0;
        for (int i = 1; i < prices.length; i++)
            if (prices[i] > prices[i-1]) profit += prices[i] - prices[i-1];
        return profit;
    }

    // ─── Stock III — at most 2 transactions ───────────────────────────────────
    //
    //  State: (day, holding, txnsLeft). Use 4 variables:
    //  buy1: max profit after first buy (negative cost)
    //  sell1: max profit after first sell
    //  buy2: max profit after second buy
    //  sell2: max profit after second sell
    //
    static int stockIII(int[] prices) {
        int buy1 = Integer.MIN_VALUE, sell1 = 0, buy2 = Integer.MIN_VALUE, sell2 = 0;
        for (int p : prices) {
            buy1  = Math.max(buy1,  -p);
            sell1 = Math.max(sell1, buy1 + p);
            buy2  = Math.max(buy2,  sell1 - p);
            sell2 = Math.max(sell2, buy2 + p);
        }
        return sell2;
    }

    // ─── Stock IV — at most k transactions ────────────────────────────────────
    //
    //  Generalize III. dp[t][0] = max profit with t txns, not holding.
    //                  dp[t][1] = max profit with t txns, holding.
    //
    static int stockIV(int[] prices, int k) {
        if (k >= prices.length / 2) return stockII(prices);  // effectively unlimited
        int[][] dp = new int[k+1][2];
        for (int[] row : dp) { row[0] = 0; row[1] = Integer.MIN_VALUE; }
        for (int p : prices) {
            for (int t = k; t >= 1; t--) {
                dp[t][0] = Math.max(dp[t][0], dp[t][1] + p);
                dp[t][1] = Math.max(dp[t][1], dp[t-1][0] - p);
            }
        }
        return dp[k][0];
    }

    // ─── Stock with Cooldown ──────────────────────────────────────────────────
    //
    //  After selling, must wait 1 day (cooldown). 3 states per day:
    //  hold: max profit while holding
    //  sold: max profit on day just sold (enters cooldown next)
    //  rest: max profit while in rest/cooldown
    //
    static int stockCooldown(int[] prices) {
        int hold = Integer.MIN_VALUE, sold = 0, rest = 0;
        for (int p : prices) {
            int prevSold = sold;
            sold = hold + p;
            hold = Math.max(hold, rest - p);
            rest = Math.max(rest, prevSold);
        }
        return Math.max(sold, rest);
    }

    // ─── Stock with Transaction Fee ───────────────────────────────────────────
    //
    //  Unlimited transactions but pay fee per transaction.
    //  hold: max profit while holding
    //  cash: max profit while not holding
    //
    static int stockFee(int[] prices, int fee) {
        int hold = Integer.MIN_VALUE, cash = 0;
        for (int p : prices) {
            hold = Math.max(hold, cash - p);
            cash = Math.max(cash, hold + p - fee);
        }
        return cash;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // DP ON SUBSEQUENCES — Knapsack family
    // 0/1 Knapsack is the template. Everything else is a variation.
    // ═══════════════════════════════════════════════════════════════════════════

    // ─── Subset Sum Equal to Target ──────────────────────────────────────────
    //
    //  dp[i][j] = can we form sum j using first i elements?
    //  Transition: dp[i][j] = dp[i-1][j] (skip) OR dp[i-1][j-arr[i-1]] (take, if j>=arr[i-1])
    //
    static boolean subsetSum(int[] arr, int target) {
        int n = arr.length;
        boolean[][] dp = new boolean[n+1][target+1];
        for (int i = 0; i <= n; i++) dp[i][0] = true;
        for (int i = 1; i <= n; i++)
            for (int j = 1; j <= target; j++) {
                dp[i][j] = dp[i-1][j];
                if (j >= arr[i-1]) dp[i][j] |= dp[i-1][j-arr[i-1]];
            }
        return dp[n][target];
    }

    // ─── Partition Equal Subset Sum (LC 416) ─────────────────────────────────
    //
    //  Can we split array into two subsets with equal sum?
    //  = subsetSum(arr, totalSum/2). Odd total → impossible.
    //
    static boolean partitionEqualSubset(int[] arr) {
        int sum = Arrays.stream(arr).sum();
        return sum % 2 == 0 && subsetSum(arr, sum / 2);
    }

    // ─── Min Absolute Difference Partition ───────────────────────────────────
    //
    //  Fill dp for all achievable sums (0 to totalSum/2).
    //  Answer = min over all achievable sums s of |totalSum - 2*s|.
    //
    static int minAbsDiff(int[] arr) {
        int total = Arrays.stream(arr).sum();
        int n = arr.length, half = total / 2;
        boolean[][] dp = new boolean[n+1][half+1];
        for (int i = 0; i <= n; i++) dp[i][0] = true;
        for (int i = 1; i <= n; i++)
            for (int j = 1; j <= half; j++) {
                dp[i][j] = dp[i-1][j];
                if (j >= arr[i-1]) dp[i][j] |= dp[i-1][j-arr[i-1]];
            }
        for (int s = half; s >= 0; s--)
            if (dp[n][s]) return total - 2*s;
        return total;
    }

    // ─── Count Subsets with Sum K ─────────────────────────────────────────────
    //
    //  dp[i][j] = count of subsets of first i elements summing to j.
    //  Take + Skip (both are additive now, not OR).
    //
    static int countSubsetsWithSum(int[] arr, int k) {
        int n = arr.length;
        int[][] dp = new int[n+1][k+1];
        for (int i = 0; i <= n; i++) dp[i][0] = 1;
        for (int i = 1; i <= n; i++)
            for (int j = 0; j <= k; j++) {
                dp[i][j] = dp[i-1][j];
                if (j >= arr[i-1]) dp[i][j] += dp[i-1][j-arr[i-1]];
            }
        return dp[n][k];
    }

    // ─── Minimum Coins (LC 322) ───────────────────────────────────────────────
    //
    //  Unbounded knapsack variant — coins can be reused.
    //  dp[j] = min coins to make amount j.
    //  For each coin, for each amount from coin to target:
    //  dp[j] = min(dp[j], 1 + dp[j - coin])
    //
    static int minCoins(int[] coins, int amount) {
        int[] dp = new int[amount+1];
        Arrays.fill(dp, amount+1);
        dp[0] = 0;
        for (int coin : coins)
            for (int j = coin; j <= amount; j++)
                dp[j] = Math.min(dp[j], 1 + dp[j-coin]);
        return dp[amount] > amount ? -1 : dp[amount];
    }

    // ─── Coin Change 2 — Count Ways (LC 518) ──────────────────────────────────
    //
    //  Count combinations (not permutations) to make amount.
    //  Iterate coins in outer loop to avoid counting same combination twice.
    //
    static int coinChange2(int[] coins, int amount) {
        int[] dp = new int[amount+1];
        dp[0] = 1;
        for (int coin : coins)
            for (int j = coin; j <= amount; j++)
                dp[j] += dp[j-coin];
        return dp[amount];
    }

    // ─── Unbounded Knapsack ───────────────────────────────────────────────────
    //
    //  Same item can be picked multiple times.
    //  Key: iterate j from weight[i] upward (not downward like 0/1 knapsack).
    //  Downward = each item used once. Upward = item can be reused.
    //
    static int unboundedKnapsack(int[] wt, int[] val, int W) {
        int[] dp = new int[W+1];
        for (int i = 0; i < wt.length; i++)
            for (int j = wt[i]; j <= W; j++)
                dp[j] = Math.max(dp[j], dp[j-wt[i]] + val[i]);
        return dp[W];
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // DP ON LIS
    // LIS O(n²) is basic. O(n log n) with patience sorting is the real interview question.
    // ═══════════════════════════════════════════════════════════════════════════

    // ─── LIS — O(n²) ─────────────────────────────────────────────────────────
    //
    //  dp[i] = LIS ending at index i.
    //  For each i, look at all j < i where arr[j] < arr[i] → dp[i] = max(dp[j]) + 1.
    //
    static int lisN2(int[] arr) {
        int n = arr.length;
        int[] dp = new int[n];
        Arrays.fill(dp, 1);
        int max = 1;
        for (int i = 1; i < n; i++) {
            for (int j = 0; j < i; j++)
                if (arr[j] < arr[i]) dp[i] = Math.max(dp[i], dp[j]+1);
            max = Math.max(max, dp[i]);
        }
        return max;
    }

    // ─── LIS — O(n log n) with Patience Sorting ──────────────────────────────
    //
    //  Maintain array `tails` where tails[i] = smallest tail of all increasing
    //  subsequences of length i+1. Binary search to find insertion position.
    //
    //  KEY: tails is always sorted, so binary search works.
    //  Length of tails at end = LIS length.
    //
    static int lisNLogN(int[] arr) {
        List<Integer> tails = new ArrayList<>();
        for (int x : arr) {
            int lo = 0, hi = tails.size();
            while (lo < hi) {
                int mid = (lo + hi) / 2;
                if (tails.get(mid) < x) lo = mid + 1;
                else hi = mid;
            }
            if (lo == tails.size()) tails.add(x);
            else tails.set(lo, x);
        }
        return tails.size();
    }

    // ─── Longest Bitonic Subsequence ─────────────────────────────────────────
    //
    //  Bitonic = increases then decreases. At each index i:
    //  LIS from left ending at i + LIS from right starting at i - 1.
    //
    static int longestBitonic(int[] arr) {
        int n = arr.length;
        int[] lis = new int[n], lds = new int[n];
        Arrays.fill(lis, 1); Arrays.fill(lds, 1);
        for (int i = 1; i < n; i++)
            for (int j = 0; j < i; j++)
                if (arr[j] < arr[i]) lis[i] = Math.max(lis[i], lis[j]+1);
        for (int i = n-2; i >= 0; i--)
            for (int j = i+1; j < n; j++)
                if (arr[j] < arr[i]) lds[i] = Math.max(lds[i], lds[j]+1);
        int max = 0;
        for (int i = 0; i < n; i++) max = Math.max(max, lis[i] + lds[i] - 1);
        return max;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 2D/3D DP
    // ═══════════════════════════════════════════════════════════════════════════

    // ─── Unique Paths (LC 62) ─────────────────────────────────────────────────
    //
    //  dp[i][j] = paths to reach (i,j) = dp[i-1][j] + dp[i][j-1]
    //
    static int uniquePaths(int m, int n) {
        int[][] dp = new int[m][n];
        for (int[] row : dp) Arrays.fill(row, 1);
        for (int i = 1; i < m; i++)
            for (int j = 1; j < n; j++)
                dp[i][j] = dp[i-1][j] + dp[i][j-1];
        return dp[m-1][n-1];
    }

    // ─── Unique Paths II — with obstacles (LC 63) ─────────────────────────────
    //
    //  Same as above but dp[i][j] = 0 if obstacle exists.
    //
    static int uniquePathsII(int[][] grid) {
        int m = grid.length, n = grid[0].length;
        int[][] dp = new int[m][n];
        for (int i = 0; i < m; i++) {
            if (grid[i][0] == 1) break;
            dp[i][0] = 1;
        }
        for (int j = 0; j < n; j++) {
            if (grid[0][j] == 1) break;
            dp[0][j] = 1;
        }
        for (int i = 1; i < m; i++)
            for (int j = 1; j < n; j++)
                if (grid[i][j] != 1) dp[i][j] = dp[i-1][j] + dp[i][j-1];
        return dp[m-1][n-1];
    }

    // ─── Triangle (LC 120) ────────────────────────────────────────────────────
    //
    //  Min path sum from top to bottom. At each cell can go to adjacent below.
    //  Bottom-up: start from second-last row, add min of two children below.
    //
    static int triangle(List<List<Integer>> tri) {
        int n = tri.size();
        int[] dp = new int[n];
        for (int j = 0; j < n; j++) dp[j] = tri.get(n-1).get(j);
        for (int i = n-2; i >= 0; i--)
            for (int j = 0; j <= i; j++)
                dp[j] = tri.get(i).get(j) + Math.min(dp[j], dp[j+1]);
        return dp[0];
    }

    // ─── Ninja and his Friends (3D DP) ────────────────────────────────────────
    //
    //  Two people start at (0,0) and (0,n-1), move down simultaneously.
    //  Collect max chocolates — if both land on same cell, count once.
    //  State: (row, col1, col2). col2 is always >= col1 (prune).
    //
    static int ninjaAndFriends(int[][] grid) {
        int m = grid.length, n = grid[0].length;
        int[][][] dp = new int[m][n][n];
        for (int[][] a : dp) for (int[] b : a) Arrays.fill(b, Integer.MIN_VALUE);
        // Initialize last row
        for (int c1 = 0; c1 < n; c1++)
            for (int c2 = 0; c2 < n; c2++)
                dp[m-1][c1][c2] = c1 == c2 ? grid[m-1][c1] : grid[m-1][c1] + grid[m-1][c2];
        for (int i = m-2; i >= 0; i--) {
            for (int c1 = 0; c1 < n; c1++) {
                for (int c2 = c1; c2 < n; c2++) {
                    int best = Integer.MIN_VALUE;
                    for (int d1 = -1; d1 <= 1; d1++) {
                        for (int d2 = -1; d2 <= 1; d2++) {
                            int nc1 = c1+d1, nc2 = c2+d2;
                            if (nc1 >= 0 && nc1 < n && nc2 >= 0 && nc2 < n && dp[i+1][nc1][nc2] != Integer.MIN_VALUE)
                                best = Math.max(best, dp[i+1][Math.min(nc1,nc2)][Math.max(nc1,nc2)]);
                        }
                    }
                    int cur = c1 == c2 ? grid[i][c1] : grid[i][c1] + grid[i][c2];
                    dp[i][c1][c2] = cur + (best == Integer.MIN_VALUE ? 0 : best);
                }
            }
        }
        return dp[0][0][n-1];
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 1D DP — Foundation
    // ═══════════════════════════════════════════════════════════════════════════

    // ─── Climbing Stairs (LC 70) ──────────────────────────────────────────────
    //  dp[i] = dp[i-1] + dp[i-2]. Fibonacci in disguise.
    static int climbStairs(int n) {
        if (n <= 2) return n;
        int a = 1, b = 2;
        for (int i = 3; i <= n; i++) { int c = a + b; a = b; b = c; }
        return b;
    }

    // ─── Frog Jump ────────────────────────────────────────────────────────────
    //  dp[i] = min energy to reach stone i.
    //  dp[i] = min(dp[i-1] + |h[i]-h[i-1]|, dp[i-2] + |h[i]-h[i-2]|)
    static int frogJump(int[] h) {
        int n = h.length;
        int[] dp = new int[n];
        dp[1] = Math.abs(h[1]-h[0]);
        for (int i = 2; i < n; i++) {
            dp[i] = Math.min(dp[i-1]+Math.abs(h[i]-h[i-1]), dp[i-2]+Math.abs(h[i]-h[i-2]));
        }
        return dp[n-1];
    }

    // ─── Frog Jump with K distances ───────────────────────────────────────────
    //  dp[i] = min over last k stones of dp[j] + |h[i]-h[j]|
    static int frogJumpK(int[] h, int k) {
        int n = h.length;
        int[] dp = new int[n];
        Arrays.fill(dp, Integer.MAX_VALUE);
        dp[0] = 0;
        for (int i = 1; i < n; i++)
            for (int j = Math.max(0, i-k); j < i; j++)
                if (dp[j] != Integer.MAX_VALUE)
                    dp[i] = Math.min(dp[i], dp[j] + Math.abs(h[i]-h[j]));
        return dp[n-1];
    }

    // ─── Max Sum Non-Adjacent / House Robber (LC 198) ─────────────────────────
    //  dp[i] = max(dp[i-1], dp[i-2] + arr[i])
    //  Either skip current or take it (can't take adjacent).
    static int houseRobber(int[] arr) {
        int prev2 = 0, prev1 = 0;
        for (int x : arr) {
            int cur = Math.max(prev1, prev2 + x);
            prev2 = prev1; prev1 = cur;
        }
        return prev1;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // DP ON SQUARES
    // ═══════════════════════════════════════════════════════════════════════════

    // ─── Maximal Square (LC 221) ──────────────────────────────────────────────
    //
    //  dp[i][j] = side length of largest square with bottom-right at (i,j).
    //  If matrix[i][j] == '1':
    //    dp[i][j] = 1 + min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1])
    //  WHY: limited by the smallest of three neighbors.
    //
    static int maximalSquare(char[][] matrix) {
        int m = matrix.length, n = matrix[0].length, max = 0;
        int[][] dp = new int[m+1][n+1];
        for (int i = 1; i <= m; i++)
            for (int j = 1; j <= n; j++)
                if (matrix[i-1][j-1] == '1') {
                    dp[i][j] = 1 + Math.min(dp[i-1][j], Math.min(dp[i][j-1], dp[i-1][j-1]));
                    max = Math.max(max, dp[i][j]);
                }
        return max * max;
    }

    // ─── Count Square Submatrices with All Ones (LC 1277) ────────────────────
    //
    //  Same dp as maximal square. dp[i][j] = side of largest square ending here.
    //  But also = number of squares of all sizes ending at (i,j).
    //  So sum of all dp values = answer.
    //
    static int countSquares(int[][] matrix) {
        int m = matrix.length, n = matrix[0].length, count = 0;
        int[][] dp = new int[m+1][n+1];
        for (int i = 1; i <= m; i++)
            for (int j = 1; j <= n; j++)
                if (matrix[i-1][j-1] == 1) {
                    dp[i][j] = 1 + Math.min(dp[i-1][j], Math.min(dp[i][j-1], dp[i-1][j-1]));
                    count += dp[i][j];
                }
        return count;
    }

    // ─── main ────────────────────────────────────────────────────────────────
    public static void main(String[] args) {
        // MCM
        System.out.println("MCM [40,20,30,10,30]:         " + mcm(new int[]{40,20,30,10,30}));
        System.out.println("Burst Balloons [3,1,5,8]:     " + burstBalloons(new int[]{3,1,5,8}));
        System.out.println("Min Cuts 'aab':               " + minCuts("aab"));
        System.out.println("Edit Distance horse→ros:      " + editDistance("horse","ros"));
        System.out.println("Wildcard 'aa' 'a*':           " + wildcardMatch("aa","a*"));
        System.out.println("Distinct Subseq 'rabbbit','rabbit': " + distinctSubseq("rabbbit","rabbit"));

        // Strings
        System.out.println("LCS abcde,ace:                " + lcs("abcde","ace"));
        System.out.println("LPS 'bbbab':                  " + longestPalindromicSubseq("bbbab"));
        System.out.println("Min Insert Palindrome 'zzazz':" + minInsertionsPalindrome("zzazz"));

        // Stocks
        System.out.println("Stock I [7,1,5,3,6,4]:        " + stockI(new int[]{7,1,5,3,6,4}));
        System.out.println("Stock III [3,3,5,0,0,3,1,4]:  " + stockIII(new int[]{3,3,5,0,0,3,1,4}));
        System.out.println("Stock Cooldown [1,2,3,0,2]:   " + stockCooldown(new int[]{1,2,3,0,2}));

        // Knapsack
        System.out.println("Subset Sum [1,2,3] target=5:  " + subsetSum(new int[]{1,2,3},5));
        System.out.println("Min Coins [1,5,6,9] amt=11:   " + minCoins(new int[]{1,5,6,9},11));
        System.out.println("Coin Ways [1,2,5] amt=5:      " + coinChange2(new int[]{1,2,5},5));

        // LIS
        System.out.println("LIS O(n²) [10,9,2,5,3,7,101]:" + lisN2(new int[]{10,9,2,5,3,7,101}));
        System.out.println("LIS O(nlogn) same:            " + lisNLogN(new int[]{10,9,2,5,3,7,101}));

        // 1D
        System.out.println("Climb Stairs 5:               " + climbStairs(5));
        System.out.println("House Robber [2,7,9,3,1]:     " + houseRobber(new int[]{2,7,9,3,1}));

        // 2D
        System.out.println("Unique Paths 3x7:             " + uniquePaths(3,7));

        // Squares
        char[][] mat = {{'1','0','1','0'},{'1','0','1','1'},{'1','1','1','1'},{'1','0','0','1'}};
        System.out.println("Maximal Square area:          " + maximalSquare(mat));
        int[][] imat = {{0,1,1,1},{1,1,1,1},{0,1,1,1}};
        System.out.println("Count Squares:                " + countSquares(imat));
    }
}
