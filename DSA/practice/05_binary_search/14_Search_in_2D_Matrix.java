import java.util.*;

// Class to perform staircase search in a 2D sorted matrix
class MatrixSearch {
    private int[][] matrix; // Store matrix

    // Constructor to initialize the matrix
    public MatrixSearch(int[][] matrix) {
        this.matrix = matrix;
    }

    // Function to search target using staircase search
    public boolean searchElement(int target) {
        int n = matrix.length;        // Number of rows
        int m = matrix[0].length;     // Number of columns

        int row = 0;           // Start at first row
        int col = m - 1;       // Start at last column (top-right)

        // Traverse while within matrix bounds
        while (row < n && col >= 0) {
            if (matrix[row][col] == target) {
                return true; // Found target
            } else if (matrix[row][col] < target) {
                row++; // Move down
            } else {
                col--; // Move left
            }
        }

        return false; // Target not found
    }

    public static void main(String[] args) {
        int[][] matrix = {
            {1, 4, 7, 11, 15},
            {2, 5, 8, 12, 19},
            {3, 6, 9, 16, 22},
            {10, 13, 14, 17, 24},
            {18, 21, 23, 26, 30}
        };

        MatrixSearch ms = new MatrixSearch(matrix);
        boolean found = ms.searchElement(8);
        System.out.println(found); // true
    }
}
