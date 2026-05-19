// Asteroid Collision (LC 735)
// Difficulty: Medium | Priority: P1
// Simulate asteroid collisions.
// Example: [5,10,-5] → [5,10]
// Approach: Stack: resolve opposite signs.
// Time: O(n), Space: O(n)

class Solution {
    public int[] asteroidCollision(int[] a) { java.util.Stack<Integer> s=new java.util.Stack<>(); for(int x:a){ boolean alive=true; while(alive&&x<0&&!s.isEmpty()&&s.peek()>0){ if(s.peek()<-x){ s.pop(); continue;} else if(s.peek()==-x){ s.pop();} alive=false; break;} if(alive) s.push(x);} int[] r=new int[s.size()]; for(int i=r.length-1;i>=0;i--) r[i]=s.pop(); return r; }
}
