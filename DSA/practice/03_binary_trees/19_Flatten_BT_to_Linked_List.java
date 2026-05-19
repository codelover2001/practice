// Flatten BT to Linked List (LC 114)
// Difficulty: Medium | Priority: P1
// In-place preorder flatten to right-skewed linked list.
// Example: Morris-like or reverse postorder stack.
// Approach: Reverse postorder: right, left, root — thread prev.right = root.
// Time: O(n), Space: O(1)

class Solution {
    TreeNode prev = null;
    public void flatten(TreeNode root) {
        // TODO: Implement
    }
}
