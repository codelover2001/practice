// Maximum Points You Can Obtain from Cards (LC 1423)
// Difficulty: Medium | Priority: P1
// Pick k cards from ends; maximize sum.
// Example: See LC
// Approach: Try k from left + (k-i) from right; or total - min middle window.
// Time: O(k), Space: O(1)

class Solution {
    public int maxScore(int[] c, int k) { int n=c.length,s=0,b=0; for(int i=0;i<k;i++) s+=c[i]; b=s; for(int i=k-1;i>=0;i--){ s-=c[i]; s+=c[n-k+i]; b=Math.max(b,s);} return b; }
}
