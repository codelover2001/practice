// Largest BST in Binary Tree (GFG)
// Difficulty: Hard | Priority: P0
// Size of largest subtree that is a valid BST (can be whole tree or part).
// Example: Postorder return min,max,size,isBST for each node.
// Approach: If both children BST and val in (L.max, R.min), merge; else propagate invalid.
// Time: O(n), Space: O(h)

class Solution {
    static class Info {
        int min, max, size; boolean isBST;
        Info(int mn, int mx, int sz, boolean b) { min = mn; max = mx; size = sz; isBST = b; }
    }
    int best = 0;
    public int largestBSTSubtree(TreeNode root) { dfs(root); return best; }
    Info dfs(TreeNode n) {
        if (n == null) return new Info(Integer.MAX_VALUE, Integer.MIN_VALUE, 0, true);
        Info L = dfs(n.left), R = dfs(n.right);
        if (L.isBST && R.isBST && n.val > L.max && n.val < R.min) {
            int sz = L.size + R.size + 1;
            best = Math.max(best, sz);
            return new Info(Math.min(n.val, L.min), Math.max(n.val, R.max), sz, true);
        }
        return new Info(0, 0, Math.max(L.size, R.size), false);
    }
}
