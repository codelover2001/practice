// Merge Overlapping Intervals (LC 56)
// Difficulty: Medium | Priority: P0
// Merge all overlapping intervals.
// Example: [[1,3],[2,6],[8,10],[15,18]] → [[1,6],[8,10],[15,18]]
// Approach: Sort by start; merge if cur.start<=prev.end.
// Time: O(n log n), Space: O(n)

import java.util.*;

class Solution {
    public int[][] merge(int[][] a) {
        Arrays.sort(a, (x, y) -> x[0] - y[0]);
        List<int[]> res = new ArrayList<>();
        int s = a[0][0], e = a[0][1];
        for (int i = 1; i < a.length; i++) {
            if (a[i][0] > e) {
                res.add(new int[]{s, e});
                s = a[i][0];
                e = a[i][1];
            } else {
                e = Math.max(e, a[i][1]);
            }
        }
        res.add(new int[]{s, e});
        return res.toArray(new int[0][]);
    }
}
