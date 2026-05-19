// Majority Element II (LC 229)
// Difficulty: Medium | Priority: P1
// Elements appearing > n/3 times (at most two).
// Example: [3,2,3] → [3]
// Approach: Boyer–Moore voting for two candidates + verify.
// Time: O(n), Space: O(1)

class Solution {
    public java.util.List<Integer> majorityElement(int[] a) { int c1=0,c2=0,n1=0,n2=0; for(int x:a){ if(x==n1)c1++; else if(x==n2)c2++; else if(c1==0){n1=x;c1=1;} else if(c2==0){n2=x;c2=1;} else {c1--;c2--;} } c1=c2=0; for(int x:a){ if(x==n1)c1++; else if(x==n2)c2++; } java.util.List<Integer> r=new java.util.ArrayList<>(); if(c1>a.length/3) r.add(n1); if(c2>a.length/3) r.add(n2); return r; }
}
