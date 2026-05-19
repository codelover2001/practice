// Root to Node Path (GFG)
// Difficulty: Medium | Priority: P1
// Return path from root to node with given value (if exists).
// Example: DFS backtrack when target found.
// Approach: DFS with list; remove on backtrack if path fails.
// Time: O(n), Space: O(h)

class Solution {
    public List<Integer> pathToNode(TreeNode root, int x) {
        // TODO: Implement
    }
    boolean dfs(TreeNode n, int x, List<Integer> path) {
        if (n == null) return false;
        path.add(n.val);
        if (n.val == x) return true;
        if (dfs(n.left, x, path) || dfs(n.right, x, path)) return true;
        path.remove(path.size() - 1);
        return false;
    }
}
