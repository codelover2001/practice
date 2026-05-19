// House Robber II (LC 213)
// Difficulty: Medium | Priority: P1
// Circular street.
// Example: [2,3,2]→3
// Approach: Rob twice on ranges.
// Time: O(n), Space: O(1)

class Solution {
    public int rob(int[] nums) {
        // TODO: Implement
    }
    int rob(int[] a, int lo, int hi) {
        int p2 = 0, p1 = 0;
        for (int i = lo; i <= hi; i++) {
            int c = Math.max(p1, p2 + a[i]);
            p2 = p1;
            p1 = c;
        }
        return p1;
    }
}
