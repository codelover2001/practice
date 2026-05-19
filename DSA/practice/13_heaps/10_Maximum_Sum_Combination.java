// Maximum Sum Combination (GFG)
// Difficulty: Medium | Priority: P1
// Two sorted arrays A,B length n; pick n pairs (i,j) without repeating index pair maximizing sum A[i]+B[j].
// Example: Use max-heap on (sum,i,j) with visited set.
// Approach: Start (n-1,n-1); heap expand to (i-1,j) and (i,j-1).
// Time: O(n log n), Space: O(n)

class Solution {
    List<Integer> maxCombinations(int N, int K, int A[], int B[]) {
        Arrays.sort(A); Arrays.sort(B); PriorityQueue<int[]> pq=new PriorityQueue<>((x,y)->(A[y[0]]+B[y[1]])-(A[x[0]]+B[x[1]]));
        Set<String> vis=new HashSet<>(); List<Integer> res=new ArrayList<>();
        pq.offer(new int[]{N-1,N-1}); vis.add((N-1)+","+(N-1));
        while(K-->0&&!pq.isEmpty()){int[] t=pq.poll(); int i=t[0],j=t[1]; res.add(A[i]+B[j]);
            if(i>0&&!vis.contains((i-1)+","+j)){vis.add((i-1)+","+j); pq.offer(new int[]{i-1,j});}
            if(j>0&&!vis.contains(i+","+(j-1))){vis.add(i+","+(j-1)); pq.offer(new int[]{i,j-1});}}
        return res;
    }
}
