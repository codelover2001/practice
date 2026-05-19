import java.util.*;

class Solution {
    public List<List<Integer>> generate(int n) {
        List<List<Integer>> a=new ArrayList<>();

        a.add(new ArrayList<>(List.of(1)));
        for(int i=1;i<n;i++){
            List<Integer> r=new ArrayList<>();

            r.add(1);
            for(int j=1;j<i;j++){
                r.add(a.get(i-1).get(j-1)+a.get(i-1).get(j));
            }
            r.add(1);
            a.add(r);
        }

        return a;
    }
}