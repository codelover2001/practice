// LRU Cache (LC 146)
// Difficulty: Medium | Priority: P0
// LRU cache O(1) get/put.
// Example: See LC
// Approach: HashMap + doubly linked list.
// Time: O(1), Space: O(capacity)

class LRUCache {
    class Node{int k,v; Node p,n; Node(){}}
    java.util.Map<Integer,Node> m=new java.util.HashMap<>();
    int cap; Node head,tail;
    void add(Node x){ x.p=head; x.n=head.n; head.n.p=x; head.n=x; }
    void rem(Node x){ x.p.n=x.n; x.n.p=x.p; }
    public LRUCache(int c){ cap=c; head=new Node(); tail=new Node(); head.n=tail; tail.p=head; }
    public int get(int k){ if(!m.containsKey(k)) return -1; Node x=m.get(k); rem(x); add(x); return x.v; }
    public void put(int k,int v){ if(m.containsKey(k)){ Node x=m.get(k); x.v=v; rem(x); add(x); return;} if(m.size()==cap){ Node l=tail.p; rem(l); m.remove(l.k);} Node x=new Node(); x.k=k; x.v=v; m.put(k,x); add(x); }
}
