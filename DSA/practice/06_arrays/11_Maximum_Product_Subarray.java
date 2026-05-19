class Solution {
    public int maxProduct(int[] a) {
        int n=a.length; 

        int mx=0,mn=0;
        int ans=-100;
        if(n==1) return a[0];

        for(int i=0;i<n;i++){
            int temp=mx;
            mx=Math.max(a[i],Math.max(a[i]*mx,a[i]*mn));
            mn=Math.min(a[i],Math.min(a[i]*temp,a[i]*mn));
            ans=Math.max(ans,mx);
            // System.out.println(mx+ " "+ mn);
        }

        return ans;





        
    }
}