// Find Eventual Safe States (LC 802)
// Difficulty: Medium | Priority: P1
// Nodes only in acyclic paths from.
// Example: Var
// Approach: 3-color / terminal DFS.
// Time: O(V+E), Space: O(V)

class Solution {
    public java.util.List<Integer> eventualSafeNodes(int[][] g) {
        // TODO: Implement
    }
    boolean dfs(int[][] g, int u, int[] c) {
        if (c[u] > 0) return c[u] == 2;
        c[u] = 1;
        for (int v : g[u]) if (!dfs(g, v, c)) return false;
        c[u] = 2;
        return true;
    }
}
