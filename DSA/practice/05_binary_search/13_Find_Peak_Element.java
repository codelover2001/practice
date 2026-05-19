// Find Peak Element (LC 162)
// Difficulty: Medium | Priority: P1
// Any index i where nums[i] > neighbors (assume -inf outside).
// Example: Binary search: if nums[mid] < nums[mid+1] go right.
// Approach: Always move toward larger neighbor.
// Time: O(log n), Space: O(1)

class Solution {
    public int findPeakElement(int[] a) {
        int n=a.length;

        int l=0,r=n-1;
        if(n==1) return 0;
        while(l<=r){
            int mid=l+(r-l)/2;

            if(mid==0){
                if(a[mid]>a[mid+1]){
                    return mid;
                }
                l=mid+1;
            }else if(mid==n-1){
                return mid;
            }else if(a[mid]>a[mid+1] && a[mid]>a[mid-1]){
                return mid;
            }else if (a[mid + 1] >a[mid]){
                l=mid+1;
            }else {
                r=mid-1;
            }
        }
        return 0;
    }
}
