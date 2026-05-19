// Fruit Into Baskets (LC 904)
// Difficulty: Medium | Priority: P1
// At most 2 types; longest contiguous pick.
// Example: [1,2,1] → 3
// Approach: Sliding window with at most 2 distinct.
// Time: O(n), Space: O(1)

class Solution {
    public int totalFruit(int[] f) { java.util.Map<Integer,Integer> m=new java.util.HashMap<>(); int l=0,b=0; for(int r=0;r<f.length;r++){ m.merge(f[r],1,Integer::sum); while(m.size()>2){ m.merge(f[l],-1,Integer::sum); if(m.get(f[l])==0) m.remove(f[l]); l++; } b=Math.max(b,r-l+1);} return b; }
}
