// Cycle Detection in Undirected Graph (GFG)
// Difficulty: Medium | Priority: P1
// Any cycle?
// Example: Var
// Approach: DFS parent skip.
// Time: O(V+E), Space: O(V)

class Solution {
    public boolean isCycle(int V, java.util.List<java.util.List<Integer>> adj) {
        // TODO: Implement
    }
    boolean dfs(java.util.List<java.util.List<Integer>> adj, int u, int p, boolean[] vis) {
        vis[u] = true;
        for (int v : adj.get(u)) {
            if (!vis[v]) {
                if (dfs(adj, v, u, vis)) return true;
            } else if (v != p) return true;
        }
        return false;
    }
}
