// Minimum Window Substring (LC 76)
// Difficulty: Hard | Priority: P0
// Smallest window of s containing all chars of t.
// Example: s="ADOBECODEBANC", t="ABC" → "BANC"
// Approach: Sliding window: miss counts chars from t still needed.
// Time: O(|s|+|t|), Space: O(|t|)

class Solution {
    public String minWindow(String s, String t) { int[] m=new int[128]; for(char c:t.toCharArray()) m[c]++; int miss=t.length(),l=0,st=0,ln=Integer.MAX_VALUE; for(int r=0;r<s.length();r++){ if(m[s.charAt(r)]-->0) miss--; while(miss==0){ if(r-l+1<ln){ln=r-l+1;st=l;} if(m[s.charAt(l++)]++==0) miss++;} } return ln==Integer.MAX_VALUE?"":s.substring(st,st+ln); }
}
