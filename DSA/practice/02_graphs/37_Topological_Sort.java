// Topological Sort (GFG)
// Difficulty: Medium | Priority: P1
// Linear ordering respecting edges.
// Example: Var
// Approach: Kahn.
// Time: O(V+E), Space: O(V+E)

class Solution {
    static int[] topoSort(int V, java.util.ArrayList<java.util.ArrayList<Integer>> adj) {
        int[] in = new int[V];
        for (int u = 0; u < V; u++) for (int v : adj.get(u)) in[v]++;
        java.util.Queue<Integer> q = new java.util.LinkedList<>();
        for (int i = 0; i < V; i++) if (in[i] == 0) q.offer(i);
        int[] ord = new int[V];
        int k = 0;
        while (!q.isEmpty()) {
            int u = q.poll();
            ord[k++] = u;
            for (int v : adj.get(u)) if (--in[v] == 0) q.offer(v);
        }
        return k == V ? ord : new int[0];
    }
}
