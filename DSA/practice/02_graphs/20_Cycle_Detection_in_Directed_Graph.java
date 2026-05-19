// Cycle Detection in Directed Graph (GFG)
// Difficulty: Medium | Priority: P1
// Directed cycle?
// Example: Var
// Approach: 3-color DFS.
// Time: O(V+E), Space: O(V)

class Solution {
    public boolean isCyclic(int V, java.util.List<java.util.List<Integer>> adj) {
        // TODO: Implement
    }
    boolean dfs(java.util.List<java.util.List<Integer>> adj, int u, int[] c) {
        c[u] = 1;
        for (int v : adj.get(u)) {
            if (c[v] == 1) return true;
            if (c[v] == 0 && dfs(adj, v, c)) return true;
        }
        c[u] = 2;
        return false;
    }
}
