// Longest Consecutive Sequence (LC 128)
// Difficulty: Medium | Priority: P0
// Length of longest consecutive elements sequence (unsorted).
// Example: [100,4,200,1,3,2] → 4
// Approach: HashSet: start count only from sequence starts.
// Time: O(n), Space: O(n)

class Solution {
    public int longestConsecutive(int[] a) { java.util.HashSet<Integer> s=new java.util.HashSet<>(); for(int x:a)s.add(x); int b=0; for(int x:s) if(!s.contains(x-1)){ int c=1; while(s.contains(x+c)) c++; b=Math.max(b,c);} return b; }
}
