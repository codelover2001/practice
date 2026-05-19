// Implement Trie II (prefix count) (GFG)
// Difficulty: Medium | Priority: P1
// Trie supporting insert, countWordsEqualTo, countWordsStartingWith, erase.
// Example: Track frequency per node for ends and prefixes.
// Approach: Two counters per node: endsWith, prefixCount.
// Time: O(L), Space: O(NL)

class Trie {
    Trie[] ch=new Trie[26]; int pref=0, end=0;
    public void insert(String w){Trie n=this;for(char c:w.toCharArray()){int i=c-'a';if(n.ch[i]==null)n.ch[i]=new Trie();n=n.ch[i];n.pref++;}n.end++;}
    public int countWordsEqualTo(String w){Trie n=find(w);return n==null?0:n.end;}
    public int countWordsStartingWith(String p){Trie n=find(p);return n==null?0:n.pref;}
    public void erase(String w){Trie n=this;for(char c:w.toCharArray()){int i=c-'a';n=n.ch[i];n.pref--;}n.end--;}
    Trie find(String w){Trie n=this;for(char c:w.toCharArray()){int i=c-'a';if(n.ch[i]==null)return null;n=n.ch[i];}return n;}
}
