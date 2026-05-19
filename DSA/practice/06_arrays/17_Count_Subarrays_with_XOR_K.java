// Count Subarrays with XOR K (GFG)
// Difficulty: Medium | Priority: P1
// Count subarrays whose XOR equals K.
// Example: arr=[4,2,2,6,4], k=6 → 4
// Approach: Prefix XOR + map freq of prefix; cur^K seen before.
// Time: O(n), Space: O(n)

import java.util.HashMap;
import java.util.Map;

class Solution {
    public long subarrayXor(int[] a, int k) { 
        Map<Integer,Integer> m=new HashMap<>();

        m.put(0,1);
        int ans = 0;
        int xor=0;

        for(int i=0;i<a.length;i++){
            xor^=a[i];
            ans+=m.getOrDefault(xor^k,0);
            m.put(xor,m.getOrDefault(xor, 0)+1);
        }

        return ans;
     }
    
}

