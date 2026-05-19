// Number of Operations to Make Network Connected (LC 1319)
// Difficulty: Medium | Priority: P1
// Min extra cables to connect all.
// Example: Var
// Approach: Count components vs edges.
// Time: O(n α(n)), Space: O(n)

class Solution {
    int[] p, r;
    public int makeConnected(int n, int[][] c) {
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
