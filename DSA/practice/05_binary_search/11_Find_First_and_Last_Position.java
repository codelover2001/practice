// Find First and Last Position (LC 34)
// Difficulty: Medium | Priority: P1
// First and last index of target in sorted array.
// Example: Lower bound + upper bound style BS.
// Approach: Two binary searches for leftmost and rightmost.
// Time: O(log n), Space: O(1)

class Solution {
    public int[] searchRange(int[] nums, int target) {
        // TODO: Implement
    }
    int lb(int[] a, int t, boolean first) {
        int lo = 0, hi = a.length - 1, ans = -1;
        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2;
            if (a[mid] == t) { ans = mid; if (first) hi = mid - 1; else lo = mid + 1; }
            else if (a[mid] < t) lo = mid + 1; else hi = mid - 1;
        }
        return ans;
    }
}
