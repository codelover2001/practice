// Sum of Subarray Minimums (LC 907)
// Difficulty: Medium | Priority: P0
// Sum of min of every subarray mod 1e9+7.
// Example: [3,1,2,4] → 17
// Approach: Monotonic stack: contribution of each as minimum.
// Time: O(n), Space: O(n)

class Solution {
    public int sumSubarrayMins(int[] a) { int n=a.length,MOD=1_000_000_007; long r=0; int[] l=new int[n],ri=new int[n]; java.util.Arrays.fill(l,-1); java.util.Arrays.fill(ri,n); java.util.ArrayDeque<Integer> s=new java.util.ArrayDeque<>(); for(int i=0;i<n;i++){ while(!s.isEmpty()&&a[s.peek()]>=a[i]) s.pop(); l[i]=s.isEmpty()?-1:s.peek(); s.push(i);} s.clear(); for(int i=n-1;i>=0;i--){ while(!s.isEmpty()&&a[s.peek()]>a[i]) s.pop(); ri[i]=s.isEmpty()?n:s.peek(); s.push(i);} for(int i=0;i<n;i++) r=(r+1L*a[i]*(i-l[i])*(ri[i]-i))%MOD; return (int)r; }
}
