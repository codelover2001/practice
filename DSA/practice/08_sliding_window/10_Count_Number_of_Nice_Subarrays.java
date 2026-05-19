// Count Number of Nice Subarrays (LC 1248)
// Difficulty: Medium | Priority: P1
// Exactly k odd numbers in subarray.
// Example: See LC
// Approach: atMost(k)-atMost(k-1) counting subarrays with ≤k odds.
// Time: O(n), Space: O(1)

class Solution {
    public int numberOfSubarrays(int[] a, int k) { return at(a,k)-at(a,k-1); }
    int at(int[] a,int K){ int i=0,c=0; for(int j=0;j<a.length;j++){ K-=a[j]&1; while(K<0) K+=a[i++]&1; c+=j-i+1;} return c; }
}
