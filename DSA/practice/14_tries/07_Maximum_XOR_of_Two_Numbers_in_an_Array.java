// Maximum XOR of Two Numbers in an Array (LC 421)
// Difficulty: Medium | Priority: P1
// Maximum a XOR b over pairs in nums.
// Example: [3,10,5,25,2,8] → 28.
// Approach: Binary trie; for each value greedily pick opposite bit.
// Time: O(n*31), Space: O(n)

class Solution {
    public int findMaximumXOR(int[] nums) {
        // TODO: Implement
    }
    class Trie{Trie[] c=new Trie[2]; void add(int x){Trie n=this;for(int i=31;i>=0;i--){int b=(x>>i)&1;if(n.c[b]==null)n.c[b]=new Trie();n=n.c[b];}}
        // TODO: Implement
    }
}
