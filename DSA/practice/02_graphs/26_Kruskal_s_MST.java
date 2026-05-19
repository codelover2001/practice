// Kruskal's MST (GFG)
// Difficulty: Medium | Priority: P1
// MST via sorting edges + DSU.
// Example: Var
// Approach: Kruskal template.
// Time: O(E log E), Space: O(V)

class Solution {
    int[] p, r;
    public int kruskalMST(int V, int[][] edges) {
        // TODO: Implement
    }
    int find(int x) {
        return p[x] == x ? x : (p[x] = find(p[x]));
    }
    boolean union(int a, int b) {
        a = find(a);
        b = find(b);
        if (a == b) return false;
        if (r[a] < r[b]) p[a] = b;
        else if (r[a] > r[b]) p[b] = a;
        else {
            p[b] = a;
            r[a]++;
        }
        return true;
    }
}
