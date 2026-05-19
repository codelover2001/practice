// Subarrays with K Different Integers (LC 992)
// Difficulty: Hard | Priority: P1
// Count subarrays with exactly k distinct integers.
// Example: See LC
// Approach: atMost(k)-atMost(k-1).
// Time: O(n), Space: O(n)

class Solution {
    public int subarraysWithKDistinct(int[] a, int k) { return at(a,k)-at(a,k-1); }
    int at(int[] a,int k){ java.util.Map<Integer,Integer> m=new java.util.HashMap<>(); int l=0,c=0; for(int r=0;r<a.length;r++){ m.merge(a[r],1,Integer::sum); while(m.size()>k){ m.merge(a[l],-1,Integer::sum); if(m.get(a[l])==0) m.remove(a[l]); l++; } c+=r-l+1; } return c; }
}
