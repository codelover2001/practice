import java.util.*;

class Node {
    int val;
    Node left, right;
    Node(int v) { val = v; }
}

public class BSTProblems {

    // ─── Build sample BST ────────────────────────────────────────────────────
    //
    //         8
    //        / \
    //       3   10
    //      / \    \
    //     1   6    14
    //        / \   /
    //       4   7 13
    //
    static Node buildBST() {
        Node r = new Node(8);
        r.left = new Node(3); r.right = new Node(10);
        r.left.left = new Node(1); r.left.right = new Node(6);
        r.left.right.left = new Node(4); r.left.right.right = new Node(7);
        r.right.right = new Node(14);
        r.right.right.left = new Node(13);
        return r;
    }

    // ─── 1. Search in BST ────────────────────────────────────────────────────
    //
    //  Go left if target < node, right if target > node.
    //  BST property means we eliminate half the tree each step → O(log n).
    //
    static Node search(Node n, int target) {
        if (n == null || n.val == target) return n;
        return target < n.val ? search(n.left, target) : search(n.right, target);
    }

    // ─── 2. Find Min / Max ───────────────────────────────────────────────────
    //
    //  Min = leftmost node. Max = rightmost node.
    //
    static int findMin(Node n) {
        while (n.left != null) n = n.left;
        return n.val;
    }
    static int findMax(Node n) {
        while (n.right != null) n = n.right;
        return n.val;
    }

    // ─── 3. Floor in BST ─────────────────────────────────────────────────────
    //
    //  Floor = largest value <= target.
    //  If node.val == target → exact match, return it.
    //  If node.val > target  → floor must be in left subtree.
    //  If node.val < target  → this node is a candidate; floor might be in right.
    //
    static int floor(Node n, int target) {
        int floor = -1;
        while (n != null) {
            if (n.val == target) return n.val;
            if (n.val < target) { floor = n.val; n = n.right; }
            else n = n.left;
        }
        return floor;
    }

    // ─── 4. Ceil in BST ──────────────────────────────────────────────────────
    //
    //  Ceil = smallest value >= target. Mirror of floor.
    //
    static int ceil(Node n, int target) {
        int ceil = -1;
        while (n != null) {
            if (n.val == target) return n.val;
            if (n.val > target) { ceil = n.val; n = n.left; }
            else n = n.right;
        }
        return ceil;
    }

    // ─── 5. Insert in BST ────────────────────────────────────────────────────
    //
    //  Search for the correct position, attach new node at the null spot.
    //  Returning node at each level re-links the tree cleanly.
    //
    static Node insert(Node n, int val) {
        if (n == null) return new Node(val);
        if (val < n.val) n.left = insert(n.left, val);
        else if (val > n.val) n.right = insert(n.right, val);
        return n;
    }

    // ─── 6. Delete in BST ────────────────────────────────────────────────────
    //
    //  Three cases:
    //  - No children: just remove.
    //  - One child: replace node with that child.
    //  - Two children: replace node's value with inorder successor (min of right
    //    subtree), then delete that successor from right subtree.
//
    static Node delete(Node root, int val) {
        if(root == null) return null;

        if(val < root.val){
            root.left = delete(root.left, val);
        }else if(val > root.val){
            root.right = delete(root.right, val);
        }else{
            if(root.left == null) return root.right;
            if(root.right == null) return root.left;

            Node successor  = root.right;

            while(successor.left != null) successor = successor.left;

            root.val = successor.val;
            root.right = delete(root.right, successor.val);
        }
        return root;
    }

    // ─── 7. Kth Smallest ─────────────────────────────────────────────────────
    //
    //  Inorder traversal of BST gives sorted order.
    //  Kth element visited in inorder = kth smallest.
    //
    static int kthSmallest(Node root, int k) {
        Deque<Node> st = new ArrayDeque<>();
        Node cur = root;
        int count = 0;
        while (cur != null || !st.isEmpty()) {
            while (cur != null) { st.push(cur); cur = cur.left; }
            cur = st.pop();
            if (++count == k) return cur.val;
            cur = cur.right;
        }
        return -1;
    }

    // ─── 8. Kth Largest ──────────────────────────────────────────────────────
    //
    //  Reverse inorder (right → root → left) gives descending order.
    //  Kth element in reverse inorder = kth largest.
    //
    static int kthLargest(Node root, int k) {
        Deque<Node> st = new ArrayDeque<>();
        Node cur = root;
        int count = 0;
        while (cur != null || !st.isEmpty()) {
            while (cur != null) { st.push(cur); cur = cur.right; }
            cur = st.pop();
            if (++count == k) return cur.val;
            cur = cur.left;
        }
        return -1;
    }

    // ─── 9. Validate BST ─────────────────────────────────────────────────────
    //
    //  Each node must be within a valid range (min, max).
    //  Going left → upper bound tightens. Going right → lower bound tightens.
    //  Don't just compare with children — a subtree node could violate an ancestor.
    //
    static boolean isValidBST(Node n, long min, long max) {
        if (n == null) return true;
        if (n.val <= min || n.val >= max) return false;
        return isValidBST(n.left, min, n.val) && isValidBST(n.right, n.val, max);
    }
    static boolean isValidBST(Node root) {
        return isValidBST(root, Long.MIN_VALUE, Long.MAX_VALUE);
    }

    // ─── 10. LCA in BST ──────────────────────────────────────────────────────
    //
    //  If both p and q are less than node → LCA is in left.
    //  If both are greater → LCA is in right.
    //  Otherwise current node is the split point = LCA.
    //
    static Node lca(Node n, int p, int q) {
        if (n == null) return null;
        if (p < n.val && q < n.val) return lca(n.left, p, q);
        if (p > n.val && q > n.val) return lca(n.right, p, q);
        return n;
    }

    // ─── 11. Construct BST from Preorder ─────────────────────────────────────
    //
    //  In preorder the first element is always root. Use valid range to determine
    //  when to stop including elements in a subtree — same min/max trick as validate.
    //
    static int preIdx = 0;
    static Node buildFromPreorder(int[] pre, long min, long max) {
        if (preIdx == pre.length || pre[preIdx] <= min || pre[preIdx] >= max) return null;
        Node n = new Node(pre[preIdx++]);
        n.left = buildFromPreorder(pre, min, n.val);
        n.right = buildFromPreorder(pre, n.val, max);
        return n;
    }
    static Node buildFromPreorder(int[] pre) {
        preIdx = 0;
        return buildFromPreorder(pre, Long.MIN_VALUE, Long.MAX_VALUE);
    }

    // ─── 12. Inorder Successor ───────────────────────────────────────────────
    //
    //  Successor = smallest node greater than target.
    //  When node.val > target → candidate, go left to find smaller valid one.
    //  When node.val <= target → go right.
    //
    static Node inorderSuccessor(Node n, int target) {
        Node successor = null;
        while (n != null) {
            if (n.val > target) { successor = n; n = n.left; }
            else n = n.right;
        }
        return successor;
    }

    // ─── 13. Inorder Predecessor ─────────────────────────────────────────────
    //
    //  Predecessor = largest node smaller than target. Mirror of successor.
    //
    static Node inorderPredecessor(Node n, int target) {
        Node predecessor = null;
        while (n != null) {
            if (n.val < target) { predecessor = n; n = n.right; }
            else n = n.left;
        }
        return predecessor;
    }

    // ─── 14. Two Sum in BST ──────────────────────────────────────────────────
    //
    //  Inorder gives sorted array. Use two pointers on that array.
    //  Alternatively use a HashSet during inorder traversal.
    //
    static boolean twoSum(Node root, int k) {
        List<Integer> inorder = new ArrayList<>();
        Node cur = root;
        Deque<Node> st = new ArrayDeque<>();
        while (cur != null || !st.isEmpty()) {
            while (cur != null) { st.push(cur); cur = cur.left; }
            cur = st.pop(); inorder.add(cur.val); cur = cur.right;
        }
        int l = 0, r = inorder.size() - 1;
        while (l < r) {
            int sum = inorder.get(l) + inorder.get(r);
            if (sum == k) return true;
            if (sum < k) l++; else r--;
        }
        return false;
    }

    // ─── 15. Merge 2 BSTs ────────────────────────────────────────────────────
    //
    //  Get inorder (sorted) of both BSTs. Merge two sorted arrays.
    //  Build balanced BST from merged sorted array.
    //
    static void inorderList(Node n, List<Integer> list) {
        if (n == null) return;
        inorderList(n.left, list);
        list.add(n.val);
        inorderList(n.right, list);
    }
    static Node sortedArrayToBST(List<Integer> arr, int l, int r) {
        if (l > r) return null;
        int mid = l + (r - l) / 2;
        Node n = new Node(arr.get(mid));
        n.left = sortedArrayToBST(arr, l, mid - 1);
        n.right = sortedArrayToBST(arr, mid + 1, r);
        return n;
    }
    static Node mergeBSTs(Node r1, Node r2) {
        List<Integer> a = new ArrayList<>(), b = new ArrayList<>(), merged = new ArrayList<>();
        inorderList(r1, a); inorderList(r2, b);
        int i = 0, j = 0;
        while (i < a.size() && j < b.size())
            merged.add(a.get(i) <= b.get(j) ? a.get(i++) : b.get(j++));
        while (i < a.size()) merged.add(a.get(i++));
        while (j < b.size()) merged.add(b.get(j++));
        return sortedArrayToBST(merged, 0, merged.size() - 1);
    }

    // ─── 16. Correct BST with two swapped nodes ──────────────────────────────
    //
    //  Inorder of correct BST is sorted. Two swapped nodes create at most
    //  two "violations" (prev.val > cur.val).
    //  First violation: first = prev, second = cur.
    //  Second violation (if exists): update second = cur.
    //  Swap their values at the end.
    //
    static Node first, second, prev;
    static void findSwapped(Node n) {
        if (n == null) return;
        findSwapped(n.left);
        if (prev != null && prev.val > n.val) {
            if (first == null) first = prev;
            second = n;
        }
        prev = n;
        findSwapped(n.right);
    }
    static void recoverBST(Node root) {
        first = second = prev = null;
        findSwapped(root);
        if (first != null) { int t = first.val; first.val = second.val; second.val = t; }
    }

    // ─── 17. Largest BST in Binary Tree ──────────────────────────────────────
    //
    //  At each node return {size, min, max, isBST}.
    //  If both subtrees are BSTs AND node.val > left.max AND node.val < right.min
    //  → current subtree is a BST of size = leftSize + rightSize + 1.
    //
    static int largestBSTSize = 0;
    static int[] largestBSTInfo(Node n) {  // returns {size, min, max}
        if (n == null) return new int[]{0, Integer.MAX_VALUE, Integer.MIN_VALUE};
        int[] l = largestBSTInfo(n.left);
        int[] r = largestBSTInfo(n.right);
        if (l[0] != -1 && r[0] != -1 && n.val > l[2] && n.val < r[1]) {
            int size = l[0] + r[0] + 1;
            largestBSTSize = Math.max(largestBSTSize, size);
            return new int[]{size, Math.min(n.val, l[1]), Math.max(n.val, r[2])};
        }
        return new int[]{-1, 0, 0};        // -1 signals "not a BST"
    }
    static int largestBST(Node root) {
        largestBSTSize = 0;
        largestBSTInfo(root);
        return largestBSTSize;
    }

    // ─── main ────────────────────────────────────────────────────────────────
    public static void main(String[] args) {
        Node root = buildBST();

        System.out.println("1. Search 6:            " + (search(root, 6) != null ? "found" : "not found"));
        System.out.println("2. Min / Max:           " + findMin(root) + " / " + findMax(root));
        System.out.println("3. Floor(5):            " + floor(root, 5));
        System.out.println("4. Ceil(5):             " + ceil(root, 5));
        System.out.println("5. Insert 5, inorder:   "); insert(root, 5);
        System.out.println("6. Delete 3, search 3:  " + (search(delete(root, 3), 3) == null ? "deleted" : "still exists"));
        System.out.println("7. 3rd Smallest:        " + kthSmallest(buildBST(), 3));
        System.out.println("8. 3rd Largest:         " + kthLargest(buildBST(), 3));
        System.out.println("9. Valid BST:           " + isValidBST(root));
        System.out.println("10. LCA(4,7):           " + lca(root, 4, 7).val);
        int[] pre = {8, 3, 1, 6, 4, 7, 10, 14, 13};
        System.out.println("11. Built from preorder, valid: " + isValidBST(buildFromPreorder(pre)));
        System.out.println("12. Successor of 6:     " + inorderSuccessor(root, 6).val);
        System.out.println("13. Predecessor of 6:   " + inorderPredecessor(root, 6).val);
        System.out.println("14. Two sum k=9:        " + twoSum(root, 9));
        System.out.println("15. Merge BSTs:         valid=" + isValidBST(mergeBSTs(buildBST(), insert(new Node(5), 2))));
        System.out.println("16. Recover BST:        done (no swap in valid tree)");
        System.out.println("17. Largest BST:        " + largestBST(buildBST()));
    }
}
