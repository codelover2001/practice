#include <bits/stdc++.h>
#define int long long
#define pi pair<int, int>
#define mod 1000000007
#define ss second
#define ff first
#define vi vector<int>
#define forit() for (auto it = m.begin(); it != m.end(); it++)
#define srt(a) sort(a.begin(), a.end())
#define rvs(a) reverse(a.begin(), a.end())
#define pb push_back
#define rrep(i, n) for(int i=n-1;i>=0;i--)
#define rep(i,n) for(int i=0;i<n;i++)
#define fast ios_base::sync_with_stdio(false), cin.tie(nullptr), cout.tie(nullptr);
using namespace std;
vector<vi>a;
vector<int>v;
int n,m;
stack<int>st;
void dfs(int s)
{
    v[s]=1;
    for(auto x:a[s])
    {
        if(!v[x])
        dfs(x);
    }
    st.push(s);
}
int32_t main()
{	fast   //fast
    int t=1;
    cin>>t;
    while(t--)
    {
        cin>>n>>m;;
        a.resize(n+1);
        v.resize(n+1,0);
        for(int i=0;i<m;i++)
        {
            int x,y;cin>>x>>y;
            a[x].pb(y);
        }
        for(int i=1;i<=n;i++)
        {
            if(!v[i])
            dfs(i);
        }
        while(!st.empty())
        {
            int top=st.top();st.pop();
            cout<<top<<" ";
        }
        cout<<endl;
    }
    return 0;
}
