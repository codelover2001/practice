import java.util.*;

// ─── Node Definition ────────────────────────────────────────────────────────
//
//  This is how you represent a binary tree in Java.
//  Each node holds a value and pointers to left and right children.
//
class Node {
    int val;
    Node left, right;
    Node(int v) { val = v; }
}

public class TreeTraversals {

    // ─── Build a sample tree ─────────────────────────────────────────────────
    //
    //         1
    //        / \
    //       2   3
    //      / \   \
    //     4   5   6
    //
    static Node buildTree() {
        Node root = new Node(1);
        root.left = new Node(2);
        root.right = new Node(3);
        root.left.left = new Node(4);
        root.left.right = new Node(5);
        root.right.right = new Node(6);
        return root;
    }

    

    // ─── Recursive Traversals ────────────────────────────────────────────────

    static void preorder(Node n) {                  // Root → Left → Right
        if (n == null) return;
        System.out.print(n.val + " ");
        preorder(n.left);
        preorder(n.right);
    }

    static void inorder(Node n) {                   // Left → Root → Right
        if (n == null) return;
        inorder(n.left);
        System.out.print(n.val + " ");
        inorder(n.right);
    }

    static void postorder(Node n) {                 // Left → Right → Root
        if (n == null) return;
        postorder(n.left);
        postorder(n.right);
        System.out.print(n.val + " ");
    }

    // ─── Iterative Preorder ──────────────────────────────────────────────────
    //
    //  Use a stack. Push root, then for each popped node push right then left
    //  (right first so left is processed first).
    //
    static void iterativePreorder(Node root) {
        if (root == null) return;
        Deque<Node> st = new ArrayDeque<>();
        st.push(root);
        while (!st.isEmpty()) {
            Node n = st.pop();
            System.out.print(n.val + " ");
            if (n.right != null) st.push(n.right);
            if (n.left != null) st.push(n.left);
        }
    }

    // ─── Iterative Inorder ───────────────────────────────────────────────────
    //
    //  Go left as far as possible, pushing each node. When null, pop and visit,
    //  then go right.
    //
    static void iterativeInorder(Node root) {
        Deque<Node> st = new ArrayDeque<>();
        Node cur = root;
        while (cur != null || !st.isEmpty()) {
            while (cur != null) { st.push(cur); cur = cur.left; }
            cur = st.pop();
            System.out.print(cur.val + " ");
            cur = cur.right;
        }
    }

    // ─── Iterative Postorder (2 stacks) ──────────────────────────────────────
    //
    //  Stack1 drives traversal (like preorder but right before left).
    //  Stack2 collects results. Print stack2 at the end = postorder.
    //
    static void iterativePostorder2Stacks(Node root) {
        if (root == null) return;
        Deque<Node> s1 = new ArrayDeque<>(), s2 = new ArrayDeque<>();
        s1.push(root);
        while (!s1.isEmpty()) {
            Node n = s1.pop();
            s2.push(n);
            if (n.left != null) s1.push(n.left);
            if (n.right != null) s1.push(n.right);
        }
        while (!s2.isEmpty()) System.out.print(s2.pop().val + " ");
    }

    // ─── Iterative Postorder (1 stack) ───────────────────────────────────────
    //
    //  Track the last visited node. Only pop when right child is null or
    //  already visited.
    //
    static void iterativePostorder1Stack(Node root) {
        Deque<Node> st = new ArrayDeque<>();
        Node cur = root, last = null;
        while (cur != null || !st.isEmpty()) {
            while (cur != null) { st.push(cur); cur = cur.left; }
            Node top = st.peek();
            if (top.right != null && top.right != last) {
                cur = top.right;
            } else {
                System.out.print(top.val + " ");
                last = st.pop();
            }
        }
    }

    // ─── Level Order Traversal ───────────────────────────────────────────────
    //
    //  BFS with a queue. Add root, then for each dequeued node add its children.
    //
    static void levelOrder(Node root) {
        if (root == null) return;
        Queue<Node> q = new ArrayDeque<>();
        q.add(root);
        while (!q.isEmpty()) {
            Node n = q.poll();
            System.out.print(n.val + " ");
            if (n.left != null) q.add(n.left);
            if (n.right != null) q.add(n.right);
        }
    }

    // ─── All Three in One Traversal ──────────────────────────────────────────
    //
    //  Each node is visited 3 times. Track visit count with a pair.
    //  Visit 1 → preorder, Visit 2 → inorder, Visit 3 → postorder.
    //
    static void allThreeInOne(Node root) {
        if (root == null) return;
        List<Integer> pre = new ArrayList<>(), in = new ArrayList<>(), post = new ArrayList<>();
        Deque<int[]> st = new ArrayDeque<>();  // int[0]=node's hashCode, store node separately
        // Use Object stack instead
        Deque<Object[]> stack = new ArrayDeque<>();
        stack.push(new Object[]{root, 1});
        while (!stack.isEmpty()) {
            Object[] top = stack.pop();
            Node n = (Node) top[0];
            int state = (int) top[1];
            if (state == 1) {
                pre.add(n.val);
                stack.push(new Object[]{n, 2});
                if (n.left != null) stack.push(new Object[]{n.left, 1});
            } else if (state == 2) {
                in.add(n.val);
                stack.push(new Object[]{n, 3});
                if (n.right != null) stack.push(new Object[]{n.right, 1});
            } else {
                post.add(n.val);
            }
        }
        System.out.println("Pre  (all-in-one): " + pre);
        System.out.println("In   (all-in-one): " + in);
        System.out.println("Post (all-in-one): " + post);
    }

    public static void main(String[] args) {
        Node root = buildTree();

        System.out.print("Preorder   (recursive):      "); preorder(root);   System.out.println();
        System.out.print("Inorder    (recursive):      "); inorder(root);    System.out.println();
        System.out.print("Postorder  (recursive):      "); postorder(root);  System.out.println();
        System.out.println();
        System.out.print("Preorder   (iterative):      "); iterativePreorder(root);           System.out.println();
        System.out.print("Inorder    (iterative):      "); iterativeInorder(root);            System.out.println();
        System.out.print("Postorder  (2 stacks):       "); iterativePostorder2Stacks(root);   System.out.println();
        System.out.print("Postorder  (1 stack):        "); iterativePostorder1Stack(root);    System.out.println();
        System.out.println();
        System.out.print("Level Order:                 "); levelOrder(root); System.out.println();
        System.out.println();
        allThreeInOne(root);
    }
}
