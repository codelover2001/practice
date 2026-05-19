// Remove K Digits (LC 402)
// Difficulty: Medium | Priority: P1
// Remove k digits to get smallest number.
// Example: num="1432219", k=3 → "1219"
// Approach: Monotonic increasing stack (greedy).
// Time: O(n), Space: O(n)

class Solution {
    public String removeKdigits(String num, int k) { java.util.Stack<Character> s=new java.util.Stack<>(); for(char c:num.toCharArray()){ while(k>0&&!s.isEmpty()&&s.peek()>c){ s.pop(); k--; } s.push(c);} while(k-->0&&!s.isEmpty()) s.pop(); StringBuilder b=new StringBuilder(); while(!s.isEmpty()) b.append(s.pop()); b.reverse(); while(b.length()>1&&b.charAt(0)=='0') b.deleteCharAt(0); return b.length()==0?"0":b.toString(); }
}
