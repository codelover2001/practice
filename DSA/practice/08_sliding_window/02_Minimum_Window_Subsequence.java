// Minimum Window Subsequence (LC 727)
// Difficulty: Hard | Priority: P0
// Smallest subsequence of S containing T in order.
// Example: See LC
// Approach: Greedy scan from each match of T[0] or DP O(mn).
// Time: O(m*n), Space: O(m*n)

class Solution {
    public String minWindow(String S, String T) { int m=S.length(),n=T.length(),INF=m+1,l=0,b=INF; int[][] dp=new int[m+1][n+1]; for(int[] r:dp) java.util.Arrays.fill(r,INF); for(int i=0;i<=m;i++) dp[i][0]=i; for(int j=1;j<=n;j++) for(int i=1;i<=m;i++) if(S.charAt(i-1)==T.charAt(j-1)) dp[i][j]=dp[i-1][j-1]; else dp[i][j]=dp[i-1][j]; for(int i=1;i<=m;i++) if(dp[i][n]<INF){ int len=i-dp[i][n]; if(len<b){b=len; l=dp[i][n];} } return b==INF?"":S.substring(l,l+b); }
}
