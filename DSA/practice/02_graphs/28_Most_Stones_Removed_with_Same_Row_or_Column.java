// Most Stones Removed with Same Row or Column (LC 947)
// Difficulty: Medium | Priority: P1
// Max removals sharing row/col.
// Example: Var
// Approach: DSU on row/col ids.
// Time: O(n α(n)), Space: O(n)

class Solution {
    int[] p;
    public int removeStones(int[][] s) {
        // TODO: Implement
    }
    int find(int x) {
        return p[x] == x ? x : (p[x] = find(p[x]));
    }
    void union(int a, int b) {
        // TODO: Implement
    }
}
