// 3Sum (LC 15)
// Difficulty: Medium | Priority: P0
// Return all unique triplets that sum to 0.
// Example: [-1,0,1,2,-1,-4] → [[-1,-1,2],[-1,0,1]]
// Approach: Sort, fix i, two pointers for j,k; skip duplicates.
// Time: O(n²), Space: O(1) excl. output

class Solution {
    public java.util.List<java.util.List<Integer>> threeSum(int[] a) { java.util.Arrays.sort(a); java.util.List<java.util.List<Integer>> r=new java.util.ArrayList<>(); int n=a.length; for(int i=0;i<n;i++){ if(i>0&&a[i]==a[i-1]) continue; int j=i+1,k=n-1; while(j<k){ int s=a[i]+a[j]+a[k]; if(s==0){ r.add(java.util.List.of(a[i],a[j],a[k])); while(j<k&&a[j]==a[j+1]) j++; while(j<k&&a[k]==a[k-1]) k--; j++; k--; } else if(s<0) j++; else k--; } } return r; }
}
