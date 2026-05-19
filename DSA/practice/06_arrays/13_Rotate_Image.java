// Rotate Image (LC 48)
// Difficulty: Medium | Priority: P1
// Rotate n×n matrix 90° clockwise in-place.
// Example: [[1,2,3],[4,5,6],[7,8,9]]
// Approach: Transpose then reverse each row.
// Time: O(n²), Space: O(1)

class Solution {
    public void rotate(int[][] matrix) {
        int n=matrix.length;

        for(int i=0;i<n;i++){
            for(int j=i;j<n;j++){
                int temp=matrix[i][j];
                matrix[i][j]=matrix[j][i];
                matrix[j][i]=temp;
            }
        }

        for(int[] row:matrix){
            int i=0,j=n-1;
            while(i<j){
                int temp=row[i];
                row[i]=row[j];
                row[j]=temp;
                i++;
            }
        }

        return ;
    }
}
