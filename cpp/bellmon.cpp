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
    vector<vector<int>> a(m, vi(3));
    for (int i = 0; i < m; i++)
    {
        int u, v, w;
        cin >> u >> v >> w;
        a[i][0] = u, a[i][1] = v, a[i][2] = w;
    }
    vi dist(n + 1, inf);
    dist[1] = 0;
    for (int i = 1; i < n; i++)
    {
        for (int j = 0; j < m; j++)
        {
            int u = a[j][0], v = a[j][1], w = a[j][2];
            if (dist[u] != inf && dist[u] + w < dist[v])
                dist[v] = dist[u] + w;
        }
    }
    for (int i = 1; i < n; i++)
    {
        for (int j = 0; j < m; j++)
        {
            int u = a[j][0], v = a[j][1], w = a[j][2];
            if (dist[u] != inf && dist[u] + w < dist[v])
            {
                cout << "Negative weight cycle is present" << endl;
                return 0;
            }
        }
    }
    for (int i = 1; i <= n; i++)
        cout << dist[i] << " ";
    return 0;
}
