// Rabin-Karp Algorithm (GFG)
// Difficulty: Medium | Priority: P0
// Find all pattern occurrences using rolling hash.
// Example: txt, pat → list of start indices
// Approach: Rolling hash + equality check on hits.
// Time: O(n+m) avg, Space: O(1)

class Solution {
    public java.util.List<Integer> search(String t,String p){ java.util.List<Integer> r=new java.util.ArrayList<>(); int m=p.length(),n=t.length(),B=256,MOD=1_000_000_007; if(m>n||m==0)return r; long hp=0,ht=0,P=1; for(int i=0;i<m;i++){ hp=(hp*B+p.charAt(i))%MOD; ht=(ht*B+t.charAt(i))%MOD; if(i<m-1)P=P*B%MOD;} for(int i=0;i<=n-m;i++){ if(hp==ht&&t.substring(i,i+m).equals(p)) r.add(i); if(i<n-m) ht=(ht-(t.charAt(i)*P)%MOD+MOD)%MOD; ht=(ht*B+t.charAt(i+m))%MOD;} return r; }
}
