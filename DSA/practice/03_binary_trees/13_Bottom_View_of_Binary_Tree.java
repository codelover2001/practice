// Bottom View of Binary Tree (GFG)
// Difficulty: Medium | Priority: P1
// Last node per vertical column in level order (deepest wins ties by value rules per GFG).
// Example: BFS/DFS with column index; map col→last value at max depth.
// Approach: DFS with (col, depth); update map when deeper or same depth smaller index.
// Time: O(n log n), Space: O(n)

class Solution {
    static class Info { int val, d; Info(int v,int d){val=v;this.d=d;} }
    public List<Integer> bottomView(TreeNode root) {
        // TODO: Implement
    }
    void dfs(TreeNode n, int c, int d, Map<Integer, Info> map) {
        // TODO: Implement
    }
}
