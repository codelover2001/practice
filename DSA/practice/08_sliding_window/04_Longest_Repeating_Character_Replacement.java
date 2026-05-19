// Longest Repeating Character Replacement (LC 424)
// Difficulty: Medium | Priority: P0
// At most k changes; longest substring with same char.
// Example: AABABBA, k=1 → 4
// Approach: Window: valid if (len-maxfreq)<=k.
// Time: O(n), Space: O(1)

class Solution {
    public int characterReplacement(String s, int k) { int[] c=new int[26]; int l=0,mx=0,b=0; for(int r=0;r<s.length();r++){ c[s.charAt(r)-'A']++; mx=Math.max(mx,c[s.charAt(r)-'A']); while(r-l+1-mx>k) c[s.charAt(l++)-'A']--; b=Math.max(b,r-l+1);} return b; }
}
