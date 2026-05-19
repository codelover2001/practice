// Row with Maximum 1s (GFG)
// Difficulty: Medium | Priority: P2
// Binary matrix sorted rows; row with most 1s.
// Example: Start top-right; move down/left.
// Approach: O(n+m) walk or BS each row.
// Time: O(n+m), Space: O(1)


class Solution {
    public int rowWithMax1s(int[][] a) {
        int m=a.length,n=a[0].length;

        int i=0,j=n-1;
        int ans=-1;
        while(i<m && j>=0){
            if(a[i][j]==1){
                ans=i;
                j--;
            }else{
                i++;
            }
        }
        return ans;
    }

    
}
