// Disjoint Set Union (Union-Find) (GFG)
// Difficulty: Medium | Priority: P1
// Union by rank + path compression.
// Example: Var
// Approach: Classic DSU.
// Time: O(α(n)), Space: O(n)

class DSU {
    int[] p, r;
    DSU(int n) {
        p = new int[n];
        r = new int[n];
        for (int i = 0; i < n; i++) p[i] = i;
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
