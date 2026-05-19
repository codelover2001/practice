// Evaluate Boolean Expression to True (GFG)
// Difficulty: Hard | Priority: P1
// Count parenthesizations yielding true.
// Example: T|F&T
// Approach: Interval DP 3 states.
// Time: O(n³), Space: O(n²)

class Solution {
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
}
