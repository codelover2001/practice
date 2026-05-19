// Connect n Ropes with Minimum Cost (GFG)
// Difficulty: Medium | Priority: P1
// Repeatedly connect two smallest ropes; cost is sum of lengths; minimize total cost.
// Example: [4,3,2,6] → 29.
// Approach: Min-heap: poll two smallest, push sum until one rope left.
// Time: O(n log n), Space: O(n)

class Solution {
    long minCost(long[] arr, int n) {
        PriorityQueue<Long> pq=new PriorityQueue<>();
        for(long x:arr) pq.offer(x); long sum=0;
        while(pq.size()>1){long a=pq.poll()+pq.poll(); sum+=a; pq.offer(a);}
        return sum;
    }
}
