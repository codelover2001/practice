// Longest Palindromic Substring (LC 5)
// Difficulty: Medium | Priority: P0
// Longest palindromic substring.
// Example: "babad" → "bab" or "aba"
// Approach: Expand around centers (also DP interval).
// Time: O(n²), Space: O(1)

class Solution {
    int l=0,r=0; public String longestPalindrome(String s) { for(int i=0;i<s.length();i++){ ex(s,i,i); ex(s,i,i+1);} return s.substring(l,r+1); }
    void ex(String s,int a,int b){ while(a>=0&&b<s.length()&&s.charAt(a)==s.charAt(b)){ a--; b++;} if(b-a-1>r-l+1){l=a+1;r=b-1;} }
}
