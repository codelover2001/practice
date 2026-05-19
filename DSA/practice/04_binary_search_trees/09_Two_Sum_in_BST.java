// Two Sum in BST (LC 653)
// Difficulty: Medium | Priority: P1
// Exists two nodes with values summing to k?
// Example: HashSet while traversing or BST two-pointer with deque.
// Approach: Inorder to list + two pointers, or HashSet O(n).
// Time: O(n), Space: O(n)

class Solution {
    public boolean findTarget(TreeNode root, int k) {
        // TODO: Implement
    }
    boolean dfs(TreeNode n, int k, Set<Integer> s) {
        if (n == null) return false;
        if (s.contains(k - n.val)) return true;
        s.add(n.val);
        return dfs(n.left, k, s) || dfs(n.right, k, s);
    }
}
