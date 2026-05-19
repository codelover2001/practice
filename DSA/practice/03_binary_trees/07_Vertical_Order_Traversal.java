// Vertical Order Traversal (LC 987)
// Difficulty: Hard | Priority: P1
// Column order left→right; same (col,row) sorted by value.
// Example: Use (col,row,val) list then sort.
// Approach: DFS collect positions; sort by col, row, val; group by col.
// Time: O(n log n), Space: O(n)

class Solution {
    static class T { int c, r, v; T(int c,int r,int v){this.c=c;this.r=r;this.v=v;} }
    public List<List<Integer>> verticalTraversal(TreeNode root) {
        // TODO: Implement
    }
    void dfs(TreeNode n, int c, int r, List<T> list) {
        // TODO: Implement
    }
}
