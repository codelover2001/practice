// Serialize & Deserialize Binary Tree (LC 297)
// Difficulty: Hard | Priority: P0
// Design encode/decode so tree can be serialized to string and reconstructed.
// Example: Preorder with null markers.
// Approach: Preorder DFS; deserialize with queue of tokens.
// Time: O(n), Space: O(n)

public class Codec {
    public String serialize(TreeNode root) {
        // TODO: Implement
    }
    public TreeNode deserialize(String data) {
        // TODO: Implement
    }
    TreeNode build(java.util.Queue<String> q) {
        String s = q.poll();
        if ("#".equals(s)) return null;
        TreeNode n = new TreeNode(Integer.parseInt(s));
        n.left = build(q); n.right = build(q);
        return n;
    }
}
