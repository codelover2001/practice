// Number of Distinct Substrings (GFG)
// Difficulty: Medium | Priority: P1
// Count distinct substrings of a string.
// Example: 'aaba' → 7 distinct non-empty substrings.
// Approach: Trie of all suffixes; answer = number of trie nodes (excluding root).
// Time: O(n^2), Space: O(n^2)

class Solution {
    static class Node{Node[] c=new Node[26];}
    int nodes(Node r){int t=0;for(int i=0;i<26;i++)if(r.c[i]!=null)t+=1+nodes(r.c[i]);return t;}
    public int countDistinctSubstrings(String s){
        // TODO: Implement
    }
}
