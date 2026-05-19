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
#define rrep(i, n) for (int i = n - 1; i >= 0; i--)
#define rep(i, n) for (int i = 0; i < n; i++)
#define fast ios_base::sync_with_stdio(false), cin.tie(nullptr), cout.tie(nullptr);
using namespace std;
int n, m;
int32_t main()
{
    fast //fast
            cin >>
        n >> m;
    vector<vector<pi>> a(n);
    for (int i = 0; i < m; i++)
    {
        int u, v, w;
        cin >> u >> v >> w;
        a[u].pb({v, w});
        a[v].pb({u, w});
    }
    set<vi> s;
    s.insert({0, 0, -1}); //{wt,curr,par}
    set<pi>v;
    int c = 0;
    v.insert({0,-1});
    while (!s.empty())
    {
        auto x = *s.begin();
        s.erase(s.begin());

        if (x[2] != -1)
            c++, cout << min(x[1], x[2]) << " " << max(x[1], x[2]) << " " << x[0] << endl;
        if (c == n - 1)
            break;
        for (auto y : a[x[1]])
        {
            if (v.count({y.ff,x[1]})==0)
            {
                // cout<<x[1]<<" # "<<y.ff<<endl;
                v.insert({y.ff,x[1]});
                v.insert({x[1],y.ff});
                s.insert({y.ss, y.ff, x[1]});
            }
        }
    }
    return 0;
}
