#include <bits/stdc++.h>
#define int long long
#define pi pair<int, int>
#define mod 1000000007
#define ss second
#define inf 1e16
#define ff first
#define all(x) x.begin(), x.end()
#define vi vector<int>
#define forit() for (auto it = m.begin(); it != m.end(); it++)
#define srt(a) sort(a.begin(), a.end())
#define rvs(a) reverse(a.begin(), a.end())
#define pb push_back
#define rrep(i, n) for (int i = n - 1; i >= 0; i--)
#define fr() for (int i = 0; i < n; i++)
#define fast ios_base::sync_with_stdio(false), cin.tie(nullptr), cout.tie(nullptr);
using namespace std;
int n, m;
int32_t main()
{
    fast //fast
            cin >>
        n >> m;
    vector<vector<int>> a(n);
    vi indegree(n, 0);
    for (int i = 0; i < m; i++)
    {
        int u, v;
        cin >> u >> v;
        u--, v--;
        a[u].pb(v);
        indegree[v]++;
    }
    vi dp(n, 0);
    queue<int> q;
    for (int i = 0; i < n; i++)
    {
        if (indegree[i] == 0)
            q.push(i);
    }
    while (!q.empty())
    {
        auto curr = q.front();
        q.pop();
        for (auto x : a[curr])
        {
            if (dp[x] < dp[curr] + 1)
                dp[x] = dp[curr] + 1;
            indegree[x]--;
            if(indegree[x]==0)
                q.push(x);
        }
    }
    cout<<*max_element(all(dp))<<endl;
    return 0;
}
