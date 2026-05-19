// Palindrome Linked List (LC 234)
// Difficulty: Easy | Priority: P1
// Return true if the list is a palindrome.
// Example: [1,2,2,1] → true
// Approach: Find middle, reverse second half, compare, restore links.
// Time: O(n), Space: O(1)

class Solution {
    public boolean isPalindrome(ListNode head) {
        // TODO: Implement
    }
    ListNode rev(ListNode h){ListNode p=null,c=h;while(c!=null){ListNode n=c.next;c.next=p;p=c;c=n;}return p;}
}
