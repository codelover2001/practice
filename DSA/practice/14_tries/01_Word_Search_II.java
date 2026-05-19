// Word Search II (LC 212)
// Difficulty: Hard | Priority: P0
// Find all words from dictionary present in board (reuse cell once per word path).
// Example: Board + words list → all matches.
// Approach: Trie of words; DFS from each cell; prune when prefix absent.
// Time: O(m*n*4^L), Space: O(ALPH*n)

class Solution {
    int[][] d={{0,1},{0,-1},{1,0},{-1,0}};
    public List<String> findWords(char[][] b, String[] words) {
        // TODO: Implement
    }
    void dfs(char[][] b,int i,int j,TrieNode n,List<String> res){
        // TODO: Implement
    }
    class TrieNode{TrieNode[] ch=new TrieNode[26]; String w;}
}
