public class TestTrie {
    static class TrieNode {
        TrieNode[] children = new TrieNode[26];
    }

    static int countDistinct(String s) {
        TrieNode root = new TrieNode();
        int count = 0;
        for (int i = 0; i < s.length(); i++) {
            TrieNode cur = root;
            for (int j = i; j < s.length(); j++) {
                int idx = s.charAt(j) - 'a';
                if (cur.children[idx] == null) {
                    cur.children[idx] = new TrieNode();
                    count++;
                }
                cur = cur.children[idx];
            }
        }
        return count;
    }

    public static void main(String[] args) {
        System.out.println(countDistinct("abc"));   // expect 6: a,ab,abc,b,bc,c
        System.out.println(countDistinct("aaa"));   // expect 3: a,aa,aaa
        System.out.println(countDistinct("abab"));  // expect 7: a,ab,aba,abab,b,ba,bab (not "ab" again)
    }
}
