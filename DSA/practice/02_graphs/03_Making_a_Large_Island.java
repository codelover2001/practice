// Making a Large Island (LC 827)
// Difficulty: Hard | Priority: P0
// Change at most one 0 to 1; max island.
// Example: Var
// Approach: DSU sizes + merge.
// Time: O(n²), Space: O(n²)

class Solution {
    int[] p, sz;
    public int largestIsland(int[][] g) {
        // TODO: Implement
    }
    int find(int x) {
        return p[x] == x ? x : (p[x] = find(p[x]));
    }
    void union(int a, int b) {
        // TODO: Implement
    }
}
