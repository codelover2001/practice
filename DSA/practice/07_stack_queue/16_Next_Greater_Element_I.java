// Next Greater Element I (LC 496)
// Difficulty: Easy | Priority: P1
// Next greater of nums1 elements in nums2 (unique).
// Example: See LC
// Approach: Map from value to NGE using stack on nums2.
// Time: O(m+n), Space: O(n)

class Solution {
    public int[] nextGreaterElement(int[] a, int[] b) { java.util.Map<Integer,Integer> m=new java.util.HashMap<>(); java.util.Stack<Integer> s=new java.util.Stack<>(); for(int x:b){ while(!s.isEmpty()&&s.peek()<x) m.put(s.pop(),x); s.push(x);} while(!s.isEmpty()) m.put(s.pop(),-1); int[] r=new int[a.length]; for(int i=0;i<a.length;i++) r[i]=m.get(a[i]); return r; }
}
