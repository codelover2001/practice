// Z-Function (GFG)
// Difficulty: Medium | Priority: P1
// Z[i] = longest prefix match starting at i.
// Example: aaaa → [4,3,2,1]
// Approach: Linear Z-algorithm with [L,R] box.
// Time: O(n), Space: O(n)

class Solution {
    public int[] zFunc(String s) { int n=s.length(),Z[]=new int[n],L=0,R=0; Z[0]=n; for(int i=1;i<n;i++){ if(i>R){ L=R=i; while(R<n&&s.charAt(R-L)==s.charAt(R)) R++; Z[i]=R-L; R--;} else { int k=i-L; if(Z[k]<R-i+1) Z[i]=Z[k]; else { L=i; while(R<n&&s.charAt(R-L)==s.charAt(R)) R++; Z[i]=R-L; R--;}}} return Z; }
}
