// Longest Happy Prefix (LC 1392)
// Difficulty: Hard | Priority: P1
// Longest proper prefix which is also suffix.
// Example: level → leve
// Approach: KMP LPS on full string.
// Time: O(n), Space: O(n)

class Solution {
    public String longestPrefix(String s) { int[] l=lps(s); return s.substring(0,l[s.length()-1]); }
    int[] lps(String p){ int n=p.length(),j=0,l[]=new int[n]; for(int i=1;i<n;i++){ while(j>0&&p.charAt(i)!=p.charAt(j)) j=l[j-1]; if(p.charAt(i)==p.charAt(j)) j++; l[i]=j;} return l; }
}
