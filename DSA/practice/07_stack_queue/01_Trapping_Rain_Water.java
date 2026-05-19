// Trapping Rain Water (LC 42)
// Difficulty: Hard | Priority: P0
// Water trapped between bars after raining.
// Example: [0,1,0,2,1,0,1,3,2,1,2,1] → 6
// Approach: Two pointers with left/right max heights.
// Time: O(n), Space: O(1)

class Solution {
    public int trap(int[] h) { int l=0,r=h.length-1,lm=0,rm=0,w=0; while(l<r) if(h[l]<h[r]){ if(h[l]>=lm) lm=h[l]; else w+=lm-h[l]; l++; } else { if(h[r]>=rm) rm=h[r]; else w+=rm-h[r]; r--; } return w; }
}
