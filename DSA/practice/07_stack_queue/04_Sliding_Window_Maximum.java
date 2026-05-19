// Sliding Window Maximum (LC 239)
// Difficulty: Hard | Priority: P0
// Max of each sliding window of size k.
// Example: [1,3,-1,-3,5,3,6,7], k=3
// Approach: Deque storing decreasing indices.
// Time: O(n), Space: O(k)

class Solution {
    public int[] maxSlidingWindow(int[] a, int k) { int n=a.length,r[]=new int[n-k+1],j=0; java.util.ArrayDeque<Integer> d=new java.util.ArrayDeque<>(); for(int i=0;i<n;i++){ while(!d.isEmpty()&&d.peekFirst()<=i-k) d.pollFirst(); while(!d.isEmpty()&&a[d.peekLast()]<=a[i]) d.pollLast(); d.addLast(i); if(i>=k-1) r[j++]=a[d.peekFirst()]; } return r; }
}
