#include <bits/stdc++.h>
#define int long long
#define pi pair<int, int>
#define mod 1000000007
#define ss second
#define ff first
#define inf 1e18
#define vi vector<int>
#define forit() for (auto it = m.begin(); it != m.end(); it++)
#define srt(a) sort(a.begin(), a.end())
#define rvs(a) reverse(a.begin(), a.end())
#define pb push_back
#define rrep(i, n) for (int i = n - 1; i >= 0; i--)
#define rep(i, n) for (int i = 0; i < n; i++)
#define fast ios_base::sync_with_stdio(false), cin.tie(nullptr), cout.tie(nullptr);
using namespace std;
int32_t main()
{
    fast //fast
        int n,
        m;
    cin >> n >> m;
    vector<vector<pi>> a(n + 1);
    for (int i = 0; i < m; i++)
    {
        int u, v, w;
        cin >> u >> v >> w;
        a[u].pb({v, w});
        a[v].pb({u, w});
    }
    vi dist(n + 1, inf), par(n + 1, -1);
    set<pi> s;
    dist[1] = 0;
    s.insert({0, 1});
    while (!s.empty())
    {
        auto x = *s.begin();
        s.erase(s.begin());
        for (auto y : a[x.ss])
        {
            int u = x.ss, v = y.ff, wt = y.ss;
            // cout<<u<<" "<<v<<" "<<wt<<endl;
            if (dist[v] > dist[u] + wt)
            {
                // if(dist[v]!=LONG_MAX)
                if (s.count({dist[v], v}))
                    s.erase({dist[v], v});
                dist[v] = dist[u] + wt;
                s.insert({dist[v], v});
                par[v] = u;
            }
        }
    }
    if (dist[n] == inf)
    {
        cout << "-1";
        return 0;
    }
    vi v;
    int c = n;
    while (c != -1)
    {
        v.pb(c);
        c = par[c];
    }
    reverse(v.begin(), v.end());
    for (int x : v)
        cout << x << " ";
    // for(int i=2;i<dist.size();i++)
    // cout<<dist[i]<<" ";
    return 0;
}
