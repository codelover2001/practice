// Implement Trie (Prefix Tree) (LC 208)
// Difficulty: Medium | Priority: P0
// insert, search exact word, startsWith prefix.
// Example: insert apple; search apple true; search app false; startsWith app true.
// Approach: 26-array children per node + end flag.
// Time: O(L), Space: O(NL)

class Trie {
    Trie[] ch=new Trie[26]; boolean end;
    public void insert(String w){Trie n=this;for(char c:w.toCharArray()){int i=c-'a';if(n.ch[i]==null)n.ch[i]=new Trie();n=n.ch[i];}n.end=true;}
    public boolean search(String w){Trie n=find(w);return n!=null&&n.end;}
    public boolean startsWith(String p){return find(p)!=null;}
    Trie find(String w){Trie n=this;for(char c:w.toCharArray()){int i=c-'a';if(n.ch[i]==null)return null;n=n.ch[i];}return n;}
}
