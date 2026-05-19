// KMP Algorithm / LPS Array (strStr) (LC 28)
// Difficulty: Easy | Priority: P0
// First index of needle in haystack or -1.
// Example: sad in sadbutsad → 0
// Approach: Build LPS; compare with backtrack.
// Time: O(n+m), Space: O(m)

class Solution {
    public int strStr(String h, String n) { if(n.isEmpty()) return 0; int[] l=lps(n); for(int i=0,j=0;i<h.length();){ if(h.charAt(i)==n.charAt(j)){ i++; j++; if(j==n.length()) return i-j;} else if(j>0) j=l[j-1]; else i++; } return -1; }
    int[] lps(String p){ int m=p.length(); int[] a=new int[m]; for(int i=1,j=0;i<m;){ if(p.charAt(i)==p.charAt(j)) a[i++]=++j; else if(j>0) j=a[j-1]; else a[i++]=0;} return a; }
}
