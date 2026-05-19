// Longest Substring Without Repeating Characters (LC 3)
// Difficulty: Medium | Priority: P0
// Longest substring with all unique characters.
// Example: "abcabcbb" → 3
// Approach: Sliding window with last index map.
// Time: O(n), Space: O(min(n,charset))

class Solution {
    public int lengthOfLongestSubstring(String s) { int[] l=new int[128]; java.util.Arrays.fill(l,-1); int b=0,L=0; for(int i=0;i<s.length();i++){ char c=s.charAt(i); L=Math.max(L,l[c]+1); l[c]=i; b=Math.max(b,i-L+1);} return b; }
}
