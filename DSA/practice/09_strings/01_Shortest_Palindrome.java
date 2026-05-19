// Shortest Palindrome (LC 214)
// Difficulty: Hard | Priority: P0
// Shortest palindrome by adding only in front.
// Example: s + minimal prefix from rev(s)
// Approach: KMP LPS on s+'#'+rev(s).
// Time: O(n), Space: O(n)

class Solution {
    public String shortestPalindrome(String s) { String r=new StringBuilder(s).reverse().toString(); int[] l=lps(s+"#"+r); return r.substring(0,s.length()-l[l.length-1])+s; }
    int[] lps(String p){ int n=p.length(),j=0,l[]=new int[n]; for(int i=1;i<n;i++){ while(j>0&&p.charAt(i)!=p.charAt(j)) j=l[j-1]; if(p.charAt(i)==p.charAt(j)) j++; l[i]=j;} return l; }
}
