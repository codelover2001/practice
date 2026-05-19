// String to Integer (atoi) (LC 8)
// Difficulty: Medium | Priority: P1
// Implement atoi rules.
// Example:   -42 → -42
// Approach: Trim sign, clamp to int range.
// Time: O(n), Space: O(1)

class Solution {
    public int myAtoi(String s) { int i=0,n=s.length(); while(i<n&&s.charAt(i)==' ') i++; int sg=1; if(i<n&&(s.charAt(i)=='+'||s.charAt(i)=='-')) sg=s.charAt(i++)=='-'?-1:1; long v=0; while(i<n&&Character.isDigit(s.charAt(i))){ v=v*10+s.charAt(i++)-'0'; if(v*sg>Integer.MAX_VALUE) return Integer.MAX_VALUE; if(v*sg<Integer.MIN_VALUE) return Integer.MIN_VALUE;} return (int)(v*sg); }
}
