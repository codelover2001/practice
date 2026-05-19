// Find Repeating and Missing Number (GFG)
// Difficulty: Medium | Priority: P1
// Array 1..n with one duplicate and one missing.
// Example: arr=[3,1,3] → repeating 3, missing 2
// Approach: Let A=m-r, B=m+r from sum and sum of squares.
// Time: O(n), Space: O(1)

class Solution {
    public int[] findTwoElement(int[] a, int n) {
        int xor=0;
        for(int i=1;i<=n;i++){
            xor=xor^a[i-1];
            xor^=i;
        }

        int bit=xor&(-xor);

        int b1=0,b2=0;

        for(int i=0;i<n;i++){
            if((bit & a[i])>0){
                b1=b1^a[i];

            }else{
                b2=b2^a[i];
            }
        }


        for(int i=1;i<=n;i++){
            if((bit & i)>0){
                b1=b1^i;
            }else{
                b2=b2^i;
            }
        }

        int count =0;
        for(int i=0;i<n;i++){
            if(a[i]==b1){
                count++;
            }
        }
        if(count==0){
            return new int[]{b1,b2};
        }else{
            return new int[]{b2,b1};
        }

    }
}