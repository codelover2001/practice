// Kth Largest Element in a Stream (LC 703)
// Difficulty: Medium | Priority: P1
// Design class: constructor(k, nums), add(val) returns kth largest in stream including adds.
// Example: k=3, stream grows; heap holds k largest.
// Approach: Min-heap size k.
// Time: O(log k) add, Space: O(k)

class KthLargest {
    PriorityQueue<Integer> pq=new PriorityQueue<>(); int k;
    public KthLargest(int K, int[] nums){k=K; for(int x:nums) add(x);}
    public int add(int v){pq.offer(v); if(pq.size()>k)pq.poll(); return pq.peek();}
}
