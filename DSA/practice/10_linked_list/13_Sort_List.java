// Sort List (LC 148)
// Difficulty: Medium | Priority: P1
// Sort linked list in O(n log n) time and O(1) extra space.
// Example: [4,2,1,3] → [1,2,3,4]
// Approach: Merge sort: split at mid, recurse, merge two sorted lists.
// Time: O(n log n), Space: O(1)

class Solution {
    public ListNode sortList(ListNode head) {
        // TODO: Implement
    }
    ListNode merge(ListNode a,ListNode b){
        ListNode d=new ListNode(0),x=d;
        while(a!=null&&b!=null){if(a.val<=b.val){x.next=a;a=a.next;}else{x.next=b;b=b.next;}x=x.next;}
        x.next=a!=null?a:b; return d.next;
    }
}
