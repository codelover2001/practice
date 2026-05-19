// Sort Colors (LC 75)
// Difficulty: Medium | Priority: P0
// Sort array of 0,1,2 in-place.
// Example: [2,0,2,1,1,0] → [0,0,1,1,2,2]
// Approach: Dutch national flag: three pointers low, mid, high.
// Time: O(n), Space: O(1)

class Solution {
    public void sortColors(int[] n) { int l=0,m=0,h=n.length-1; while(m<=h) if(n[m]==0){ int t=n[l];n[l]=n[m];n[m]=t; l++;m++; } else if(n[m]==1) m++; else { int t=n[m];n[m]=n[h];n[h]=t; h--; } }
}
