// Copy List with Random Pointer (LC 138)
// Difficulty: Medium | Priority: P0
// Deep copy a linked list where each node has next and random.
// Example: Clone preserves structure and random targets.
// Approach: HashMap original→copy; second pass to wire next/random.
// Time: O(n), Space: O(n)

class Solution {
    public Node copyRandomList(Node head) {
        // TODO: Implement
    }
    class Node{int val; Node next,random; Node(int v){val=v;}}
}
