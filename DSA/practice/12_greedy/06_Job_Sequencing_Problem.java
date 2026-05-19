// Job Sequencing Problem (GFG)
// Difficulty: Medium | Priority: P1
// Each job has deadline and profit; one job per unit time; maximize profit.
// Example: Pick highest profit jobs in latest feasible slots.
// Approach: Sort by profit; DSU or slot array from deadline downward.
// Time: O(n^2) or O(n log n), Space: O(n)

class Job{int id,dead,profit;}
class Solution {
    int[] JobScheduling(Job[] a, int n) {
        Arrays.sort(a,(x,y)->y.profit-x.profit); boolean[] slot=new boolean[n+1]; int cnt=0,sum=0;
        for(Job j:a) for(int t=Math.min(n,j.dead);t>=1;t--) if(!slot[t]){slot[t]=true;cnt++;sum+=j.profit;break;}
        return new int[]{cnt,sum};
    }
}
