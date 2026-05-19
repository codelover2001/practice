// Next Permutation (LC 31)
// Difficulty: Medium | Priority: P0
// Rearrange to lexicographically next greater permutation; if none, smallest.
// Example: [1,2,3]→[1,3,2]
// Approach: Find pivot from right, swap with next larger on right, reverse suffix.
// Time: O(n), Space: O(1)

class Solution {
    public void nextPermutation(int[] a) { int i=a.length-2; while(i>=0&&a[i]>=a[i+1]) i--; if(i>=0){ int j=a.length-1; while(a[j]<=a[i]) j--; swap(a,i,j); } rev(a,i+1,a.length-1); }
    void swap(int[]a,int i,int j){int t=a[i];a[i]=a[j];a[j]=t;}
    void rev(int[]a,int l,int r){ while(l<r) swap(a,l++,r--); }
}
