// Two Sum (LC 1)
// Difficulty: Easy | Priority: P1
// Return indices of two numbers summing to target.
// Example: [2,7,11,15], target=9 → [0,1]
// Approach: HashMap value→index while scanning.
// Time: O(n), Space: O(n)

class Solution {
    public int[] twoSum(int[] a, int t) { java.util.Map<Integer,Integer> m=new java.util.HashMap<>(); for(int i=0;i<a.length;i++){ int x=t-a[i]; if(m.containsKey(x)) return new int[]{m.get(x),i}; m.put(a[i],i); } return null; }
}
