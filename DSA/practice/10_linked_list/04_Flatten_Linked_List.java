// Flatten Linked List (GFG)
// Difficulty: Medium | Priority: P0
// Each node has next and bottom; all bottom chains are sorted. Flatten to sorted single level.
// Example: 5—10—19—28 with bottoms 7,20,22,35 → one sorted list.
// Approach: Recursively flatten next, then merge two sorted lists using bottom pointers.
// Time: O(n log n) worst, Space: O(n) stack

class GfG {
    Node merge(Node a, Node b) {
        if(a==null) return b; if(b==null) return a;
        Node r; if(a.data<b.data){r=a;r.bottom=merge(a.bottom,b);}else{r=b;r.bottom=merge(a,b.bottom);}
        r.next=null; return r;
    }
    Node flatten(Node root) {
        if(root==null||root.next==null) return root;
        root.next=flatten(root.next);
        return merge(root,root.next);
    }
    class Node{int data; Node next,bottom;}
}
