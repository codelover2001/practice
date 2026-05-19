// Longest String with All Prefixes (GFG)
// Difficulty: Medium | Priority: P1
// Among given strings, find longest such that every prefix is also in the set.
// Example: Words ['a','ab','abc'] → 'abc' (every prefix is a word).
// Approach: Trie of all words; DFS only through edges whose child marks end of a word (every prefix valid).
// Time: O(total chars), Space: O(total chars)

class Solution {
    static class TrieNode { TrieNode[] ch=new TrieNode[26]; boolean end; }
    String best="";
    void ins(TrieNode r,String w){TrieNode n=r;for(char c:w.toCharArray()){int i=c-'a';if(n.ch[i]==null)n.ch[i]=new TrieNode();n=n.ch[i];}n.end=true;}
    void dfs(TrieNode n,StringBuilder sb){
        // TODO: Implement
    }
    public String longestString(String[] words){
        // TODO: Implement
    }
}
