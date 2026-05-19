// Longest Substring with At Most K Distinct Characters (LC 340)
// Difficulty: Medium | Priority: P0
// Longest substring with at most k distinct characters.
// Example: See LC
// Approach: Sliding window + freq map.
// Time: O(n), Space: O(k)

class Solution {
    public int lengthOfLongestSubstringKDistinct(String s, int k) { if(k==0) return 0; int[] c=new int[256]; int d=0,l=0,b=0; for(int r=0;r<s.length();r++){ if(c[s.charAt(r)]++==0) d++; while(d>k) if(--c[s.charAt(l++)]==0) d--; b=Math.max(b,r-l+1);} return b; }
}
