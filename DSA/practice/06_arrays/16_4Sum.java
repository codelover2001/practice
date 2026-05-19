// 4Sum (LC 18)
// Difficulty: Medium | Priority: P1
// Unique quadruplets summing to target.
// Example: [1,0,-1,0,-2,2], target=0
// Approach: Sort, fix i,j, two pointers; skip duplicates.
// Time: O(n³), Space: O(1) excl. output

class Solution {
    public java.util.List<java.util.List<Integer>> fourSum(int[] a, int t) { java.util.Arrays.sort(a); java.util.List<java.util.List<Integer>> r=new java.util.ArrayList<>(); int n=a.length; for(int i=0;i<n;i++){ if(i>0&&a[i]==a[i-1]) continue; for(int j=i+1;j<n;j++){ if(j>i+1&&a[j]==a[j-1]) continue; int x=j+1,y=n-1; while(x<y){ long s=(long)a[i]+a[j]+a[x]+a[y]; if(s==t){ r.add(java.util.List.of(a[i],a[j],a[x],a[y])); while(x<y&&a[x]==a[x+1]) x++; while(x<y&&a[y]==a[y-1]) y--; x++; y--; } else if(s<t) x++; else y--; } } } return r; }
}
