// Number of Islands II (LC 305)
// Difficulty: Hard | Priority: P1
// Dynamic island count after adds.
// Example: Var
// Approach: DSU on grid.
// Time: O(k α(n)), Space: O(n²)

class Solution {
    int[] p, sz;
    public java.util.List<Integer> numIslands2(int m, int n, int[][] pos) {
        // TODO: Implement
    }
    int find(int x) {
        return p[x] == x ? x : (p[x] = find(p[x]));
    }
    boolean union(int a, int b) {
        a = find(a);
        b = find(b);
        if (a == b) return false;
        if (sz[a] < sz[b]) {
            int t = a;
            a = b;
            b = t;
        }
        p[b] = a;
        sz[a] += sz[b];
        return true;
    }
}
