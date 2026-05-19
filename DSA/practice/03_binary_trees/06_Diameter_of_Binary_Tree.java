// Diameter of Binary Tree (LC 543)
// Difficulty: Easy | Priority: P0
// Length of longest path between any two nodes (edges count).
// Example: [1,2,3,4,5] → 3
// Approach: DFS height; ans = max(ans, leftH + rightH).
// Time: O(n), Space: O(h)

class Solution {
    int ans = 0;
    public int diameterOfBinaryTree(TreeNode root) { height(root); return ans; }
    int height(TreeNode n) {
        if (n == null) return 0;
        int l = height(n.left), r = height(n.right);
        ans = Math.max(ans, l + r);
        return 1 + Math.max(l, r);
    }
}
