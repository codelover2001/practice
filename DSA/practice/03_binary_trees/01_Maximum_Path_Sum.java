// Maximum Path Sum (LC 124)
// Difficulty: Hard | Priority: P0
// Max sum along any path between any two nodes (path may not pass root).
// Example: [-10,9,20,null,null,15,7] → 42
// Approach: Postorder: return max chain up; update global with val+max(0,l)+max(0,r).
// Time: O(n), Space: O(h)

class Solution {
    int maxSum = Integer.MIN_VALUE;
    public int maxPathSum(TreeNode root) { dfs(root); return maxSum; }
    int dfs(TreeNode n) {
        if (n == null) return 0;
        int l = Math.max(0, dfs(n.left)), r = Math.max(0, dfs(n.right));
        maxSum = Math.max(maxSum, n.val + l + r);
        return n.val + Math.max(l, r);
    }
}
