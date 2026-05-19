// Count Different Palindromic Subsequences (LC 730)
// Difficulty: Hard | Priority: P1
// Count distinct palindromic subsequences mod 1e9+7.
// Example: See LC
// Approach: DP with last occurrence positions to avoid double count.
// Time: O(n²), Space: O(n²)

class Solution {
    public int countPalindromicSubsequences(String S) { int n=S.length(),M=1_000_000_007; long[][] dp=new long[n][n]; for(int i=0;i<n;i++) dp[i][i]=1; for(int l=2;l<=n;l++) for(int i=0,j=l-1;j<n;i++,j++){ if(S.charAt(i)!=S.charAt(j)) dp[i][j]=(dp[i+1][j]+dp[i][j-1]-dp[i+1][j-1]+M)%M; else { int L=i+1,R=j-1; while(L<=R&&S.charAt(L)!=S.charAt(i)) L++; while(L<=R&&S.charAt(R)!=S.charAt(i)) R--; if(L>R) dp[i][j]=(dp[i+1][j-1]*2+2)%M; else if(L==R) dp[i][j]=(dp[i+1][j-1]*2+1)%M; else dp[i][j]=(dp[i+1][j-1]*2-dp[L+1][R-1]+M)%M; } } return (int)dp[0][n-1]; }
}
