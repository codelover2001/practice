public class Test {
    static int lps(String s) {
        int n = s.length();
        int[][] dp = new int[n][n];
        for (int i = 0; i < n; i++) dp[i][i] = 1;
        for (int len = 2; len <= n; len++) {
            for (int i = 0; i <= n-len; i++) {
                int j = i + len - 1;
                if (s.charAt(i) == s.charAt(j))
                    dp[i][j] = (len == 2 ? 0 : dp[i+1][j-1]) + 2;
                else
                    dp[i][j] = Math.max(dp[i+1][j], dp[i][j-1]);
            }
        }
        return dp[0][n-1];
    }
    public static void main(String[] args) {
        System.out.println(lps("bbbab"));   // 4
        System.out.println(lps("abcba"));   // 5
        System.out.println(lps("aba"));     // 3
        System.out.println(lps("aa"));      // 2
        System.out.println(lps("a"));       // 1
        System.out.println(lps("cbbd"));    // 2
    }
}
