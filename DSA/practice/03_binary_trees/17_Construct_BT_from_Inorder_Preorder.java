// Construct BT from Inorder & Preorder (LC 105)
// Difficulty: Medium | Priority: P1
// Unique tree from preorder and inorder arrays.
// Example: Root = preorder[0]; split inorder at root.
// Approach: HashMap inorder index + recurse on ranges.
// Time: O(n), Space: O(n)

class Solution {
    int preIdx = 0;
    Map<Integer, Integer> inMap = new HashMap<>();
    public TreeNode buildTree(int[] preorder, int[] inorder) {
        // TODO: Implement
    }
    TreeNode build(int[] pre, int lo, int hi) {
        if (lo > hi) return null;
        TreeNode root = new TreeNode(pre[preIdx++]);
        int mid = inMap.get(root.val);
        root.left = build(pre, lo, mid - 1);
        root.right = build(pre, mid + 1, hi);
        return root;
    }
}
