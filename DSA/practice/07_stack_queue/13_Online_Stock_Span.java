// Online Stock Span (LC 901)
// Difficulty: Medium | Priority: P1
// Consecutive days price <= today's price.
// Example: See LC
// Approach: Stack of (price, span).
// Time: O(1) amortized, Space: O(n)

class StockSpanner {
    java.util.Stack<int[]> s=new java.util.Stack<>();
    public int next(int p){ int w=1; while(!s.isEmpty()&&s.peek()[0]<=p){ w+=s.pop()[1]; } s.push(new int[]{p,w}); return w; }
}
