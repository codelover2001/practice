// Binary Subarrays With Sum (LC 930)
// Difficulty: Medium | Priority: P1
// Count subarrays with sum goal (0/1 array).
// Example: [1,0,1,0,1], goal=2 → 4
// Approach: Prefix sum: atMost(goal)-atMost(goal-1).
// Time: O(n), Space: O(n)

class Solution {
    public int numSubarraysWithSum(int[] a, int g) { return at(a,g)-at(a,g-1); }
    int at(int[] a,int g){ if(g<0) return 0; int s=0,c=0; java.util.Map<Integer,Integer> m=new java.util.HashMap<>(); m.put(0,1); for(int x:a){ s+=x; c+=m.getOrDefault(s-g,0); m.merge(s,1,Integer::sum);} return c; }
}
