#include <bits/stdc++.h>
#define int long long
#define pi pair<int, int>
#define mod 1000000007
#define ss second
#define ff first
#define all(x)  x.begin(), x.end()
#define vi vector<int>
#define forit() for (auto it = m.begin(); it != m.end(); it++)
#define srt(a) sort(a.begin(), a.end())
#define rvs(a) reverse(a.begin(), a.end())
#define pb push_back
#define rrep(i, n) for(int i=n-1;i>=0;i--)
#define rep(i,n) for(int i=0;i<n;i++)
#define fast ios_base::sync_with_stdio(false), cin.tie(nullptr), cout.tie(nullptr);
using namespace std;
vi a[200001];
int dp[200001][20];
void binary_lifting(int s,int par)
{
    dp[s][0]=par;
    for(int i=1;i<20;i++)
    {
        if(dp[s][i-1]==-1)
        dp[s][i]=-1;
        else 
        dp[s][i]=dp[dp[s][i-1]][i-1];
    }
    for(auto x:a[s])
    {
        if(x!=par)
        binary_lifting(x,s);
    }
}
int fun(int s,int k)
{
    if(s==-1||k==0)return s;
    for(int i=19;i>=0;i--)
    {
        int x=(1<<i);
        if(k>=(1<<i))
        {
            return fun(dp[s][i],k-x);
        }
    }
}
int32_t main()
{	fast   //fast
    int t=1;
    // cin>>t;
    while(t--)
    {
        int n,q;cin>>n>>q;
        for(int i=2;i<=n;i++)
        {
            int x;cin>>x;
            a[x].pb(i);
            a[i].pb(x);
        }
        binary_lifting(1,-1);
        while(q--)
        {
            int u,k;cin>>u>>k;
            cout<<fun(u,k)<<endl;
        }
    }
    return 0;
}
