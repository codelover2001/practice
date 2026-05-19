// LRU Cache (LC 146)
// Difficulty: Medium | Priority: P0
// Design LRU cache with get and put in O(1).
// Example: capacity 2: after put(3,3), least recently used key evicted.
// Approach: HashMap + doubly linked list for access order.
// Time: O(1), Space: O(capacity)

class LRUCache {
    int cap; Map<Integer,Node> mp=new HashMap<>(); Node h=new Node(0,0),t=new Node(0,0);
    public LRUCache(int c){cap=c;h.next=t;t.prev=h;}
    public int get(int k){if(!mp.containsKey(k))return -1;Node n=mp.get(k);rm(n);ins(n);return n.v;}
    public void put(int k,int v){if(mp.containsKey(k))rm(mp.get(k));
        // TODO: Implement
    }
    void rm(Node n){n.prev.next=n.next;n.next.prev=n.prev;}
    void ins(Node n){n.next=h.next;h.next.prev=n;n.prev=h;h.next=n;}
    class Node{int k,v; Node p,n; Node(int a,int b){k=a;v=b;}}
}
