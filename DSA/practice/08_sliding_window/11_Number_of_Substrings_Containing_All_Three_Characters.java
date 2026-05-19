// Number of Substrings Containing All Three Characters (LC 1358)
// Difficulty: Medium | Priority: P1
// Count substrings having a,b,c each at least once.
// Example: abcabc → 10
// Approach: Track last index of a,b,c; add 1+min(last) each step.
// Time: O(n), Space: O(1)

class Solution {
    public int numberOfSubstrings(String s) { int[] L=new int[]{-1,-1,-1}; int r=0; for(int i=0;i<s.length();i++){ L[s.charAt(i)-'a']=i; int m=Math.min(L[0],Math.min(L[1],L[2])); if(m>=0) r+=m+1;} return r; }
}
