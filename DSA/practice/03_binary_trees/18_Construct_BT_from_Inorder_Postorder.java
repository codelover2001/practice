// Construct BT from Inorder & Postorder (LC 106)
// Difficulty: Medium | Priority: P1
// Unique tree from inorder and postorder.
// Example: Root = postorder[last]; mirror of preorder build.
// Approach: PostIdx from end; right subtree then left.
// Time: O(n), Space: O(n)

class Solution {
    int postIdx;
    Map<Integer, Integer> inMap = new HashMap<>();
    public TreeNode buildTree(int[] inorder, int[] postorder) {
        // TODO: Implement
    }
    TreeNode build(int[] in, int[] post, int lo, int hi) {
        if (lo > hi) return null;
        TreeNode root = new TreeNode(post[postIdx--]);
        int mid = inMap.get(root.val);
        root.right = build(in, post, mid + 1, hi);
        root.left = build(in, post, lo, mid - 1);
        return root;
    }
}
