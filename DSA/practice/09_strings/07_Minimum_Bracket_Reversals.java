// Minimum Bracket Reversals (GFG)
// Difficulty: Medium | Priority: P1
// Min reversals to make bracket sequence balanced.
// Example: }{{} → 1
// Approach: Remove valid pairs; count unmatched opens/closes.
// Time: O(n), Space: O(1)

class Solution {
    public int countRev(String s) { int n=s.length(); if(n%2!=0) return -1; int op=0,cl=0; for(char c:s.toCharArray()){ if(c=='{') op++; else if(op>0) op--; else cl++; } return (op+1)/2+(cl+1)/2; }
        // TODO: Implement
    }
