// Majority Element (LC 169)
// Difficulty: Easy | Priority: P1
// Element appearing > n/2 times.
// Example: [2,2,1,1,1,2,2] → 2
// Approach: Boyer–Moore voting.
// Time: O(n), Space: O(1)

class Solution {
    public int majorityElement(int[] a) { int c=0,x=0; for(int v:a){ if(c==0){x=v;c=1;} else c+=v==x?1:-1; } return x; }
}
