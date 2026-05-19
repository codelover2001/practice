// Construct BST from Preorder (LC 1008)
// Difficulty: Medium | Priority: P1
// Construct BST from preorder traversal (unique BST).
// Example: Bound: next element must lie in (min,max).
// Approach: Idx + recursion with upper bound; or monotone stack.
// Time: O(n), Space: O(h)

class Solution {
    int i = 0;
    public TreeNode bstFromPreorder(int[] preorder) {
        // TODO: Implement
    }
    TreeNode build(int[] pre, int bound) {
        if (i == pre.length || pre[i] > bound) return null;
        TreeNode root = new TreeNode(pre[i++]);
        root.left = build(pre, root.val);
        root.right = build(pre, bound);
        return root;
    }
}
