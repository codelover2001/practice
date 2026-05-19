// Min Stack (LC 155)
// Difficulty: Medium | Priority: P1
// Stack supporting push/pop/top/getMin in O(1).
// Example: See LC
// Approach: Aux stack of mins or store pairs.
// Time: O(1), Space: O(n)

class MinStack {
    java.util.Stack<long[]> s=new java.util.Stack<>();
    public void push(int v){ if(s.isEmpty()) s.push(new long[]{v,v}); else s.push(new long[]{v,Math.min(v,s.peek()[1])}); }
    public void pop(){ s.pop(); }
    public int top(){ return (int)s.peek()[0]; }
    public int getMin(){ return (int)s.peek()[1]; }
}
