// LFU Cache (LC 460)
// Difficulty: Hard | Priority: P0
// LFU cache with O(1) get/put.
// Example: See LC
// Approach: key→(val,freq); freq→LinkedHashSet keys; track minFreq.
// Time: O(1), Space: O(capacity)

class LFUCache {
    int cap,min; java.util.Map<Integer,Integer> kv=new java.util.HashMap<>(),kf=new java.util.HashMap<>();
    java.util.Map<Integer,java.util.LinkedHashSet<Integer>> fk=new java.util.HashMap<>();
    public LFUCache(int c){cap=c;}
    void touch(int k,boolean inc){ int f=kf.get(k); fk.get(f).remove(k); if(fk.get(f).isEmpty()){ fk.remove(f); if(min==f) min++; } f+=inc?1:0; kf.put(k,f); fk.computeIfAbsent(f,z->new java.util.LinkedHashSet<>()).add(k); }
    public int get(int k){ if(!kv.containsKey(k)) return -1; touch(k,true); return kv.get(k); }
    public void put(int k,int v){ if(cap==0) return; if(kv.containsKey(k)){ kv.put(k,v); touch(k,true); return;} if(kv.size()==cap){ int ev=fk.get(min).iterator().next(); fk.get(min).remove(ev); if(fk.get(min).isEmpty()) fk.remove(min); kv.remove(ev); kf.remove(ev);} kv.put(k,v); kf.put(k,1); fk.computeIfAbsent(1,z->new java.util.LinkedHashSet<>()).add(k); min=1; }
}
