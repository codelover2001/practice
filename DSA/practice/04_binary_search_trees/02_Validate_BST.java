// Validate BST (LC 98)
// Difficulty: Medium | Priority: P0
// Check BST property: left < root < right for all nodes.
// Example: Pass (min,max) bounds or inorder strictly increasing.
// Approach: DFS with long bounds to handle Integer edge cases.
// Time: O(n), Space: O(h)

class Solution {
    public boolean isValidBST(TreeNode root) { return valid(root, Long.MIN_VALUE, Long.MAX_VALUE); }
    boolean valid(TreeNode n, long lo, long hi) {
        if (n == null) return true;
        if (n.val <= lo || n.val >= hi) return false;
        return valid(n.left, lo, n.val) && valid(n.right, n.val, hi);
    }
}
