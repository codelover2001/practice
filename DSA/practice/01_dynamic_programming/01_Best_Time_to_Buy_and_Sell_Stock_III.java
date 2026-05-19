
class Solution {
    public int maxProfit(int[] prices) {
        int n=prices.length;
        int[] a= new int[prices.length+1];
        int mx=prices[n-1];
        int ans=0;  
        a[n-1]=0;
        a[n]=0;

        for(int i=n-2;i>=0;i--){

            if(prices[i]>mx){
                mx=prices[i];
            }else{
                ans=Math.max(ans,mx-prices[i]);
            }
            a[i]=ans;
        }

        int mn=prices[0];
        int final_ans=0;
        ans=0;
        for(int i=1;i<n;i++){
            if(prices[i]<mn){
                mn=prices[i];
            }else{
                ans=Math.max(ans,prices[i]-mn);
                final_ans=Math.max(final_ans,ans+a[i+1]);
            }
        }

        return final_ans;

        
    }

    public static void main(String[] args) {
        Solution sol = new Solution();
        int[] prices = {7, 6, 4, 3, 1};
        System.out.println(sol.maxProfit(prices));
    }
}

