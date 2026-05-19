import java.util.*;

class Node {
    int val;
    Node left, right;
    Node(int v) { val = v; }
}

public class TreeProblems2 {

    // ─── Build sample tree ───────────────────────────────────────────────────
    //
    //            1
    //           / \
    //          2   3
    //         / \   \
    //        4   5   6
    //
    static Node buildTree() {
        Node r = new Node(1);
        r.left = new Node(2); r.right = new Node(3);
        r.left.left = new Node(4); r.left.right = new Node(5);
        r.right.right = new Node(6);
        return r;
    }

    // ─── 1. Print Root to Leaf Paths ─────────────────────────────────────────
    //
    //  DFS with a running path list. When you hit a leaf, print the path.
    //  Backtrack by removing the last element after returning.
    //
    static void rootToLeaf(Node n, List<Integer> path) {
        if (n == null) return;
        path.add(n.val);
        if (n.left == null && n.right == null) {
            System.out.println(path);
        } else {
            rootToLeaf(n.left, path);
            rootToLeaf(n.right, path);
        }
        path.remove(path.size() - 1);              // backtrack
    }
    static void rootToLeaf(Node root) { rootToLeaf(root, new ArrayList<>()); }

    // ─── 2. LCA in Binary Tree ───────────────────────────────────────────────
    //
    //  At each node: if it matches p or q, return it.
    //  Recurse left and right. If both return non-null → current node is LCA.
    //  If only one side returns non-null → propagate that up.
    //
    static Node lca(Node n, int p, int q) {
        if (n == null || n.val == p || n.val == q) return n;
        Node l = lca(n.left, p, q);
        Node r = lca(n.right, p, q);
        if (l != null && r != null) return n;      // split point = LCA
        return l != null ? l : r;                  // propagate the found one up
    }

    // ─── 3. Maximum Width of Binary Tree ─────────────────────────────────────
    //
    //  Level order BFS. At each level, width = last_index - first_index + 1.
    //  Index nodes like a heap: left child = 2*i, right child = 2*i+1.
    //  Normalize indices at each level (subtract level's first index) to avoid overflow.
    //
    static int maxWidth(Node root) {
        if (root == null) return 0;
        int maxW = 0;
        // Use separate queues for nodes and indices
        Queue<Node> q = new ArrayDeque<>();
        Queue<Long> idxQ = new ArrayDeque<>();
        q.offer(root); idxQ.offer(0L);
        while (!q.isEmpty()) {
            int sz = q.size();
            long first = 0, last = 0;
            long levelMin = idxQ.peek();
            for (int i = 0; i < sz; i++) {
                Node n = q.poll();
                long idx = idxQ.poll() - levelMin;
                if (i == 0) first = idx;
                if (i == sz - 1) last = idx;
                if (n.left != null)  { q.offer(n.left);  idxQ.offer(2 * idx); }
                if (n.right != null) { q.offer(n.right); idxQ.offer(2 * idx + 1); }
            }
            maxW = (int) Math.max(maxW, last - first + 1);
        }
        return maxW;
    }

    // ─── 4. Children Sum Property ────────────────────────────────────────────
    //
    //  Every node's value must equal sum of its children's values.
    //  Leaves and null satisfy by default.
    //
    static boolean childrenSum(Node n) {
        if (n == null || (n.left == null && n.right == null)) return true;
        int sum = (n.left != null ? n.left.val : 0) + (n.right != null ? n.right.val : 0);
        return n.val == sum && childrenSum(n.left) && childrenSum(n.right);
    }

    // ─── 5. All Nodes at Distance K ──────────────────────────────────────────
    //
    //  Two types of nodes at distance K from target:
    //  (a) In the subtree rooted at target — simple DFS downward.
    //  (b) Through ancestors — need parent pointers or pass distance upward.
    //
    //  Approach: Build parent map with BFS, then BFS from target for K steps.
    //
    static List<Integer> distanceK(Node root, int target, int k) {
        Map<Node, Node> parent = new HashMap<>();
        Queue<Node> q = new ArrayDeque<>();
        q.offer(root); parent.put(root, null);
        Node targetNode = null;
        while (!q.isEmpty()) {
            Node n = q.poll();
            if (n.val == target) targetNode = n;
            if (n.left != null)  { parent.put(n.left, n);  q.offer(n.left); }
            if (n.right != null) { parent.put(n.right, n); q.offer(n.right); }
        }
        // BFS from target using parent map to move upward too
        Set<Node> visited = new HashSet<>();
        Queue<Node> bfs = new ArrayDeque<>();
        bfs.offer(targetNode); visited.add(targetNode);
        int dist = 0;
        while (!bfs.isEmpty() && dist < k) {
            int sz = bfs.size();
            for (int i = 0; i < sz; i++) {
                Node n = bfs.poll();
                for (Node nb : new Node[]{n.left, n.right, parent.get(n)}) {
                    if (nb != null && !visited.contains(nb)) {
                        visited.add(nb); bfs.offer(nb);
                    }
                }
            }
            dist++;
        }
        List<Integer> res = new ArrayList<>();
        for (Node n : bfs) res.add(n.val);
        return res;
    }

    // ─── 6. Minimum Time to Burn Tree from a Node ────────────────────────────
    //
    //  Same parent-map trick as distance K, but instead of stopping at K,
    //  run BFS until the queue is empty. The number of levels = burn time.
    //
    static int burnTime(Node root, int target) {
        Map<Node, Node> parent = new HashMap<>();
        Queue<Node> q = new ArrayDeque<>();
        q.offer(root); parent.put(root, null);
        Node targetNode = null;
        while (!q.isEmpty()) {
            Node n = q.poll();
            if (n.val == target) targetNode = n;
            if (n.left != null)  { parent.put(n.left, n);  q.offer(n.left); }
            if (n.right != null) { parent.put(n.right, n); q.offer(n.right); }
        }
        Set<Node> visited = new HashSet<>();
        Queue<Node> bfs = new ArrayDeque<>();
        bfs.offer(targetNode); visited.add(targetNode);
        int time = 0;
        while (!bfs.isEmpty()) {
            int sz = bfs.size(); boolean spread = false;
            for (int i = 0; i < sz; i++) {
                Node n = bfs.poll();
                for (Node nb : new Node[]{n.left, n.right, parent.get(n)}) {
                    if (nb != null && !visited.contains(nb)) {
                        visited.add(nb); bfs.offer(nb); spread = true;
                    }
                }
            }
            if (spread) time++;
        }
        return time;
    }

    // ─── 7. Count Total Nodes in Complete Binary Tree ────────────────────────
    //
    //  A complete BT has all levels full except possibly the last (filled left to right).
    //  Key insight: if left height == right height → left subtree is perfect → 2^h - 1 nodes.
    //  Recurse only on the side that may be incomplete → O(log^2 n) instead of O(n).
    //
    static int countNodes(Node n) {
        if (n == null) return 0;
        int lh = 0, rh = 0;
        Node l = n, r = n;
        while (l != null) { lh++; l = l.left; }
        while (r != null) { rh++; r = r.right; }
        if (lh == rh) return (1 << lh) - 1;        // perfect subtree: 2^h - 1
        return 1 + countNodes(n.left) + countNodes(n.right);
    }

    // ─── 8. Requirements to Construct a Unique BT ────────────────────────────
    //
    //  - Inorder alone: NOT unique (can't determine root)
    //  - Preorder alone: NOT unique
    //  - Postorder alone: NOT unique
    //  - Preorder + Inorder: UNIQUE ✓
    //  - Postorder + Inorder: UNIQUE ✓
    //  - Preorder + Postorder: NOT unique (can't distinguish left/right for single child)
    //
    //  Inorder is MANDATORY in all unique combinations — it separates left/right subtrees.
    //  (This is a conceptual note, no code needed)

    // ─── 9. Construct BT from Preorder and Inorder ───────────────────────────
    //
    //  Preorder[0] = root. Find root in inorder → splits into left/right subtrees.
    //  Left subtree size = index of root in inorder.
    //  Recurse with correct slices of both arrays.
    //  Use a map for O(1) inorder lookup instead of linear scan.
    //
    static Map<Integer, Integer> inorderIdx = new HashMap<>();
    static int preIdx = 0;
    static Node buildFromPreIn(int[] pre, int inL, int inR) {
        if (inL > inR) return null;
        Node root = new Node(pre[preIdx++]);
        int idx = inorderIdx.get(root.val);
        root.left = buildFromPreIn(pre, inL, idx - 1);
        root.right = buildFromPreIn(pre, idx + 1, inR);
        return root;
    }
    static Node buildFromPreIn(int[] preorder, int[] inorder) {
        preIdx = 0; inorderIdx.clear();
        for (int i = 0; i < inorder.length; i++) inorderIdx.put(inorder[i], i);
        return buildFromPreIn(preorder, 0, inorder.length - 1);
    }

    // ─── 10. Construct BT from Postorder and Inorder ─────────────────────────
    //
    //  Same idea but postorder's LAST element is the root.
    //  Process postorder from right to left. Build RIGHT subtree first, then left.
    //
    static int postIdx;
    static Node buildFromPostIn(int[] post, int inL, int inR) {
        if (inL > inR) return null;
        Node root = new Node(post[postIdx--]);
        int idx = inorderIdx.get(root.val);
        root.right = buildFromPostIn(post, idx + 1, inR);   // right first!
        root.left = buildFromPostIn(post, inL, idx - 1);
        return root;
    }
    static Node buildFromPostIn(int[] postorder, int[] inorder) {
        postIdx = postorder.length - 1; inorderIdx.clear();
        for (int i = 0; i < inorder.length; i++) inorderIdx.put(inorder[i], i);
        return buildFromPostIn(postorder, 0, inorder.length - 1);
    }

    // ─── 11. Serialize and Deserialize BT ────────────────────────────────────
    //
    //  Serialize: BFS level order, write "null" for missing nodes.
    //  Deserialize: BFS, read values and attach children in order.
    //
    static String serialize(Node root) {
        if (root == null) return "";
        StringBuilder sb = new StringBuilder();
        Queue<Node> q = new ArrayDeque<>();
        q.offer(root);
        while (!q.isEmpty()) {
            Node n = q.poll();
            if (n == null) { sb.append("null,"); continue; }
            sb.append(n.val).append(",");
            if (n.left != null) q.offer(n.left); else sb.append("null,");
            if (n.right != null) q.offer(n.right); else sb.append("null,");
        }
        return sb.toString();
    }
    static Node deserialize(String data) {
        if (data.isEmpty()) return null;
        String[] vals = data.split(",");
        Node root = new Node(Integer.parseInt(vals[0]));
        Queue<Node> q = new ArrayDeque<>();
        q.offer(root); int i = 1;
        while (!q.isEmpty() && i < vals.length) {
            Node n = q.poll();
            if (!vals[i].equals("null")) { n.left = new Node(Integer.parseInt(vals[i])); q.offer(n.left); }
            i++;
            if (i < vals.length && !vals[i].equals("null")) { n.right = new Node(Integer.parseInt(vals[i])); q.offer(n.right); }
            i++;
        }
        return root;
    }

    // ─── 12. Morris Preorder Traversal ───────────────────────────────────────
    //
    //  Same as Morris Inorder but visit the node BEFORE threading (when first seen).
    //  Thread: predecessor.right = cur (visit cur, go left).
    //  Unthread: predecessor.right = null (go right, don't visit again).
    //
    static List<Integer> morrisPreorder(Node root) {
        List<Integer> res = new ArrayList<>();
        Node cur = root;
        while (cur != null) {
            if (cur.left == null) {
                res.add(cur.val);                   // no left → visit and go right
                cur = cur.right;
            } else {
                Node pred = cur.left;
                while (pred.right != null && pred.right != cur) pred = pred.right;
                if (pred.right == null) {
                    res.add(cur.val);               // visit BEFORE going left (preorder)
                    pred.right = cur;               // thread
                    cur = cur.left;
                } else {
                    pred.right = null;              // unthread, don't visit again
                    cur = cur.right;
                }
            }
        }
        return res;
    }

    // ─── 13. Morris Inorder Traversal ────────────────────────────────────────
    //
    //  Visit node AFTER unthreading (when returning from left subtree).
    //  Thread: predecessor.right = cur → go left.
    //  Unthread: predecessor.right = null → VISIT cur → go right.
    //
    static List<Integer> morrisInorder(Node root) {
        List<Integer> res = new ArrayList<>();
        Node cur = root;
        while (cur != null) {
            if (cur.left == null) {
                res.add(cur.val);                   // no left → visit and go right
                cur = cur.right;
            } else {
                Node pred = cur.left;
                while (pred.right != null && pred.right != cur) pred = pred.right;
                if (pred.right == null) {
                    pred.right = cur;               // thread
                    cur = cur.left;
                } else {
                    pred.right = null;              // unthread
                    res.add(cur.val);               // visit AFTER unthreading (inorder)
                    cur = cur.right;
                }
            }
        }
        return res;
    }

    // ─── 14. Flatten Binary Tree to Linked List ──────────────────────────────
    //
    //  Flatten to right-skewed list in preorder (root → left → right).
    //  Approach: At each node, find the rightmost node of left subtree.
    //  Attach root.right there. Move root.left to root.right. Set root.left = null.
    //  Move to root.right and repeat. O(n) time, O(1) space.
    //
    static void flatten(Node root) {
        Node cur = root;
        while (cur != null) {
            if (cur.left != null) {
                Node rightmost = cur.left;
                while (rightmost.right != null) rightmost = rightmost.right;
                rightmost.right = cur.right;        // attach original right at end of left
                cur.right = cur.left;               // move left to right
                cur.left = null;
            }
            cur = cur.right;
        }
    }

    // ─── main ────────────────────────────────────────────────────────────────
    public static void main(String[] args) {
        Node root = buildTree();

        System.out.print("1. Root to leaf paths: ");
        rootToLeaf(root);

        System.out.println("2. LCA(4,5):           " + lca(root, 4, 5).val);
        System.out.println("3. Max Width:          " + maxWidth(root));
        System.out.println("4. Children Sum:       " + childrenSum(root));
        System.out.println("5. Distance K=2 from 2: " + distanceK(root, 2, 2));
        System.out.println("6. Burn time from 4:   " + burnTime(root, 4));
        System.out.println("7. Count nodes:        " + countNodes(root));

        int[] pre = {1, 2, 4, 5, 3, 6}, in = {4, 2, 5, 1, 3, 6};
        System.out.println("9. Build from Pre+In valid: " + (buildFromPreIn(pre, in) != null));

        int[] post = {4, 5, 2, 6, 3, 1};
        System.out.println("10. Build from Post+In valid: " + (buildFromPostIn(post, in) != null));

        String ser = serialize(root);
        System.out.println("11. Serialize: " + ser);
        Node des = deserialize(ser);
        System.out.println("    Deserialize root: " + des.val);

        System.out.println("12. Morris Preorder:   " + morrisPreorder(buildTree()));
        System.out.println("13. Morris Inorder:    " + morrisInorder(buildTree()));

        flatten(root);
        System.out.print("14. Flattened:         ");
        for (Node n = root; n != null; n = n.right) System.out.print(n.val + " ");
        System.out.println();
    }
}
