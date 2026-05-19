// Merge Sorted Arrays (In-Place) (LC 88)
// Difficulty: Medium | Priority: P1
// Merge nums2 into nums1 in-place (nums1 has trailing zeros).
// Example: nums1=[1,2,3,0,0,0], m=3, nums2=[2,5,6], n=3
// Approach: Fill from the end to avoid overwrite.
// Time: O(m+n), Space: O(1)

class Solution {
    public void merge(int[] a, int m, int[] b, int n) { 
        int i=m-1,j=n-1,k=m+n-1;
        while(j>=0){
            if(a[i]>b[j]){
                a[k--]=a[i--];
            }else{
                a[k--]=b[j--];
            }
        }

        return ; 
    
    }
}
