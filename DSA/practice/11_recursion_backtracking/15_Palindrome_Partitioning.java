// Palindrome Partitioning (LC 131)
// Difficulty: Medium | Priority: P1
// Partition s so every substring in the partition is a palindrome.
// Example: 'aab' → [['a','a','b'],['aa','b']].
// Approach: DFS: try each palindrome prefix, recurse on suffix.
// Time: O(2^n), Space: O(n)

class Solution {
    public List<List<String>> partition(String s) {
        // TODO: Implement
    }
    void bt(String s,int i,List<String> cur,List<List<String>> res){
        // TODO: Implement
    }
    boolean pal(String s,int l,int r){while(l<r)if(s.charAt(l++)!=s.charAt(r--))return false;return true;}
}
