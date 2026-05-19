// Design Twitter (LC 355)
// Difficulty: Medium | Priority: P1
// postTweet, getNewsFeed (10 recent from followees + self), follow, unfollow.
// Example: Merge per-user tweet timelines by global timestamp.
// Approach: Per-user tweet list; max-heap merges one pointer per followee; advance index after poll.
// Time: O(10 log F), Space: O(tweets+F)

class Twitter {
    int t=0; Map<Integer,List<int[]>> tw=new HashMap<>(); Map<Integer,Set<Integer>> fo=new HashMap<>();
    public void postTweet(int u,int id){tw.computeIfAbsent(u,x->new ArrayList<>()).add(new int[]{++t,id});}
    public List<Integer> getNewsFeed(int u) {
        // TODO: Implement
    }
    public void follow(int a,int b){fo.computeIfAbsent(a,x->new HashSet<>()).add(b);}
    public void unfollow(int a,int b){if(fo.containsKey(a)) fo.get(a).remove(b);}
}
