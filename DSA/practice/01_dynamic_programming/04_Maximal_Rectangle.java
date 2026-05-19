// Maximal Rectangle (LC 85)
// Difficulty: Hard | Priority: P0
// Max area rectangle of 1s in binary matrix.
// Example: matrix→area
// Approach: Histogram heights per row + stack.
// Time: O(m*n), Space: O(n)

class Solution {
    public int maximalRectangle(char[][] matrix) {
        // TODO: Implement
    }
    int largestRect(int[] h) {
        java.util.Deque<Integer> s = new java.util.ArrayDeque<>();
        int mx = 0;
        for (int i = 0; i <= h.length; i++) {
            int c = i == h.length ? 0 : h[i];
            while (!s.isEmpty() && c < h[s.peek()]) {
                int ht = h[s.pop()];
                int w = s.isEmpty() ? i : i - s.peek() - 1;
                mx = Math.max(mx, ht * w);
            }
            s.push(i);
        }
        return mx;
    }
}
