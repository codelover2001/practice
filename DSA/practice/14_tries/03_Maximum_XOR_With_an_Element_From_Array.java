// Maximum XOR With an Element From Array (LC 1707)
// Difficulty: Hard | Priority: P1
// Queries (xi,mi): max nums[j] XOR xi with nums[j]≤mi.
// Example: Offline sort queries + trie insert incrementally.
// Approach: Sort nums and queries by mi; trie of eligible nums; same max XOR walk.
// Time: O((N+Q)*32), Space: O(N*32)

class Solution {
    public int[] maximizeXor(int[] nums, int[][] queries) {
        // TODO: Implement
    }
    class Trie{Trie[] c=new Trie[2]; void add(int x){Trie n=this;for(int i=31;i>=0;i--){int b=(x>>i)&1;if(n.c[b]==null)n.c[b]=new Trie();n=n.c[b];}}
        // TODO: Implement
    }
}
