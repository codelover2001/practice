import java.util.*;

class Node {
    int val;
    Node left, right;
    Node(int v) { val = v; }
}

public class TreeProblems {

    // ─── Build sample trees ──────────────────────────────────────────────────
    //
    //         1
    //        / \
    //       2   3
    //      / \   \
    //     4   5   6
    //
    static Node buildTree() {
        Node r = new Node(1);
        r.left = new Node(2); r.right = new Node(3);
        r.left.left = new Node(4); r.left.right = new Node(5);
        r.right.right = new Node(6);
        return r;
    }

    // ─── 1. Maximum Depth ────────────────────────────────────────────────────
    //
    //  Depth = 1 + max(left depth, right depth).
    //  Base: null node has depth 0.
    //
    static int maxDepth(Node n) {
        if (n == null) return 0;
        return 1 + Math.max(maxDepth(n.left), maxDepth(n.right));
    }

    // ─── 2. Balanced Binary Tree ─────────────────────────────────────────────
    //
    //  A tree is balanced if for every node:
    //    |leftHeight - rightHeight| <= 1  AND both subtrees are balanced.
    //
    //  Return -1 as a sentinel to propagate "unbalanced" upward.
    //  This avoids a second pass — O(n) single pass.
    //
    static int heightOrUnbalanced(Node n) {
        if (n == null) return 0;
        int l = heightOrUnbalanced(n.left);
        if (l == -1) return -1;                     // left subtree unbalanced
        int r = heightOrUnbalanced(n.right);
        if (r == -1) return -1;                     // right subtree unbalanced
        if (Math.abs(l - r) > 1) return -1;         // this node unbalanced
        return 1 + Math.max(l, r);
    }
    static boolean isBalanced(Node root) {
        return heightOrUnbalanced(root) != -1;
    }

    // ─── 3. Diameter of Binary Tree ──────────────────────────────────────────
    //
    //  Diameter through a node = leftHeight + rightHeight.
    //  The diameter might not pass through root, so track global max.
    //
    static int diameter = 0;
    static int heightForDiameter(Node n) {
        if (n == null) return 0;
        int l = heightForDiameter(n.left);
        int r = heightForDiameter(n.right);
        diameter = Math.max(diameter, l + r);       // update diameter at each node
        return 1 + Math.max(l, r);
    }
    static int diameter(Node root) {
        diameter = 0;
        heightForDiameter(root);
        return diameter;
    }

    // ─── 4. Maximum Path Sum ─────────────────────────────────────────────────
    //
    //  Path can start and end at any node. At each node, path sum through it =
    //  node.val + max(0, leftMax) + max(0, rightMax).
    //  Use max(0, ...) to ignore negative branches.
    //  Return only one side upward (can't go both ways to the parent).
    //
    static int maxSum = Integer.MIN_VALUE;
    static int pathSum(Node n) {
        if (n == null) return 0;
        int l = Math.max(0, pathSum(n.left));
        int r = Math.max(0, pathSum(n.right));
        maxSum = Math.max(maxSum, n.val + l + r);   // update global max at each node
        return n.val + Math.max(l, r);              // return best single branch upward
    }
    static int maxPathSum(Node root) {
        maxSum = Integer.MIN_VALUE;
        pathSum(root);
        return maxSum;
    }

    // ─── 5. Identical Trees ──────────────────────────────────────────────────
    //
    //  Two trees are identical if root values match AND both subtrees are identical.
    //
    static boolean isIdentical(Node a, Node b) {
        if (a == null && b == null) return true;
        if (a == null || b == null) return false;
        return a.val == b.val && isIdentical(a.left, b.left) && isIdentical(a.right, b.right);
    }

    // ─── 6. Zigzag / Spiral Traversal ────────────────────────────────────────
    //
    //  Level order but alternate direction each level.
    //  Use a flag `leftToRight`. When false, reverse the level before adding.
    //
    static List<List<Integer>> zigzag(Node root) {
        List<List<Integer>> res = new ArrayList<>();
        if (root == null) return res;
        Deque<Node> q = new ArrayDeque<>();
        q.offer(root);
        boolean leftToRight = true;
        while (!q.isEmpty()) {
            int sz = q.size();
            List<Integer> level = new ArrayList<>();
            for (int i = 0; i < sz; i++) {
                Node n = q.poll();
                level.add(n.val);
                if (n.left != null) q.offer(n.left);
                if (n.right != null) q.offer(n.right);
            }
            if (!leftToRight) Collections.reverse(level);
            res.add(level);
            leftToRight = !leftToRight;
        }
        return res;
    }

    // ─── 7. Boundary Traversal ───────────────────────────────────────────────
    //
    //  = Left boundary (top→down, exclude leaves)
    //  + All leaves (left→right)
    //  + Right boundary (bottom→up, exclude leaves)
    //
    static void addLeftBoundary(Node n, List<Integer> res) {
        if (n == null || (n.left == null && n.right == null)) return;
        res.add(n.val);
        if (n.left != null) addLeftBoundary(n.left, res);
        else addLeftBoundary(n.right, res);
    }
    static void addLeaves(Node n, List<Integer> res) {
        if (n == null) return;
        if (n.left == null && n.right == null) { res.add(n.val); return; }
        addLeaves(n.left, res);
        addLeaves(n.right, res);
    }
    static void addRightBoundary(Node n, List<Integer> res) {
        if (n == null || (n.left == null && n.right == null)) return;
        if (n.right != null) addRightBoundary(n.right, res);
        else addRightBoundary(n.left, res);
        res.add(n.val);                             // add AFTER recursion = bottom-up
    }
    static List<Integer> boundary(Node root) {
        List<Integer> res = new ArrayList<>();
        if (root == null) return res;
        res.add(root.val);
        addLeftBoundary(root.left, res);
        addLeaves(root.left, res);
        addLeaves(root.right, res);
        addRightBoundary(root.right, res);
        return res;
    }

    // ─── 8. Vertical Order Traversal ─────────────────────────────────────────
    //
    //  Assign each node (row, col): root=(0,0), left=(r+1,c-1), right=(r+1,c+1).
    //  Group by col, then sort by row, then by val for ties.
    //
    static List<List<Integer>> verticalOrder(Node root) {
        if (root == null) return new ArrayList<>();
        // Map: col → list of (row, val)
        TreeMap<Integer, List<int[]>> map = new TreeMap<>();
        Queue<Object[]> q = new ArrayDeque<>();
        q.offer(new Object[]{root, 0, 0});          // {node, row, col}
        while (!q.isEmpty()) {
            Object[] cur = q.poll();
            Node n = (Node) cur[0]; int row = (int) cur[1], col = (int) cur[2];
            map.computeIfAbsent(col, k -> new ArrayList<>()).add(new int[]{row, n.val});
            if (n.left != null) q.offer(new Object[]{n.left, row+1, col-1});
            if (n.right != null) q.offer(new Object[]{n.right, row+1, col+1});
        }
        List<List<Integer>> res = new ArrayList<>();
        for (List<int[]> col : map.values()) {
            col.sort((a, b) -> a[0] != b[0] ? a[0] - b[0] : a[1] - b[1]);
            List<Integer> colVals = new ArrayList<>();
            for (int[] rv : col) colVals.add(rv[1]);
            res.add(colVals);
        }
        return res;
    }

    // ─── 9. Top View ─────────────────────────────────────────────────────────
    //
    //  For each column, the first node encountered in level order (BFS) is the top view.
    //  Same col tracking as vertical order, but only store the FIRST node per col.
    //
    static List<Integer> topView(Node root) {
        if (root == null) return new ArrayList<>();
        TreeMap<Integer, Integer> map = new TreeMap<>();
        Queue<Object[]> q = new ArrayDeque<>();
        q.offer(new Object[]{root, 0});
        while (!q.isEmpty()) {
            Object[] cur = q.poll();
            Node n = (Node) cur[0]; int col = (int) cur[1];
            map.putIfAbsent(col, n.val);            // only first (topmost) node per col
            if (n.left != null) q.offer(new Object[]{n.left, col-1});
            if (n.right != null) q.offer(new Object[]{n.right, col+1});
        }
        return new ArrayList<>(map.values());
    }

    // ─── 10. Bottom View ─────────────────────────────────────────────────────
    //
    //  Same as top view but OVERWRITE each col — last node per col in BFS wins.
    //
    static List<Integer> bottomView(Node root) {
        if (root == null) return new ArrayList<>();
        TreeMap<Integer, Integer> map = new TreeMap<>();
        Queue<Object[]> q = new ArrayDeque<>();
        q.offer(new Object[]{root, 0});
        while (!q.isEmpty()) {
            Object[] cur = q.poll();
            Node n = (Node) cur[0]; int col = (int) cur[1];
            map.put(col, n.val);                    // overwrite = last (bottommost) node wins
            if (n.left != null) q.offer(new Object[]{n.left, col-1});
            if (n.right != null) q.offer(new Object[]{n.right, col+1});
        }
        return new ArrayList<>(map.values());
    }

    // ─── 11. Right View / Left View ──────────────────────────────────────────
    //
    //  Right view = last node of each level in level order BFS.
    //  Left view  = first node of each level.
    //
    static List<Integer> rightView(Node root) {
        List<Integer> res = new ArrayList<>();
        if (root == null) return res;
        Deque<Node> q = new ArrayDeque<>();
        q.offer(root);
        while (!q.isEmpty()) {
            int sz = q.size();
            for (int i = 0; i < sz; i++) {
                Node n = q.poll();
                if (i == sz - 1) res.add(n.val);    // last node of this level
                if (n.left != null) q.offer(n.left);
                if (n.right != null) q.offer(n.right);
            }
        }
        return res;
    }

    // ─── 12. Symmetric Binary Tree ───────────────────────────────────────────
    //
    //  A tree is symmetric if left subtree is a mirror of right subtree.
    //  Two nodes are mirrors if: their values match AND
    //    left.left mirrors right.right AND left.right mirrors right.left.
    //
    static boolean isMirror(Node a, Node b) {
        if (a == null && b == null) return true;
        if (a == null || b == null) return false;
        return a.val == b.val && isMirror(a.left, b.right) && isMirror(a.right, b.left);
    }
    static boolean isSymmetric(Node root) {
        if (root == null) return true;
        return isMirror(root.left, root.right);
    }

    // ─── main ────────────────────────────────────────────────────────────────
    public static void main(String[] args) {
        Node root = buildTree();

        System.out.println("1. Max Depth:          " + maxDepth(root));
        System.out.println("2. Is Balanced:        " + isBalanced(root));
        System.out.println("3. Diameter:           " + diameter(root));
        System.out.println("4. Max Path Sum:       " + maxPathSum(root));
        System.out.println("5. Identical (self):   " + isIdentical(root, buildTree()));
        System.out.println("6. Zigzag:             " + zigzag(root));
        System.out.println("7. Boundary:           " + boundary(root));
        System.out.println("8. Vertical Order:     " + verticalOrder(root));
        System.out.println("9. Top View:           " + topView(root));
        System.out.println("10. Bottom View:       " + bottomView(root));
        System.out.println("11. Right View:        " + rightView(root));
        System.out.println("12. Is Symmetric:      " + isSymmetric(root));
    }
}
