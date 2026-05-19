// Subarray Sum Equals K (LC 560)
// Difficulty: Medium | Priority: P0
// Count contiguous subarrays with sum k.
// Example: [1,1,1], k=2 → 2
// Approach: Prefix sum + HashMap count of prefix sums.
// Time: O(n), Space: O(n)

class Solution {
    public int subarraySum(int[] a, int k) { java.util.Map<Integer,Integer> m=new java.util.HashMap<>(); m.put(0,1); int s=0,c=0; for(int x:a){ s+=x; c+=m.getOrDefault(s-k,0); m.merge(s,1,Integer::sum); } return c; }
}
