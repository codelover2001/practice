#include <bits/stdc++.h>
#define int long long
#define pi pair<int, int>
#define mod 1000000007
#define ss second
#define ff first
#define inf 1e14
#define all(x) x.begin(), x.end()
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
    vector<vi> a(n, vi(n, inf));
    for (int i = 0; i < m; i++)
    {
        int x, y, w;
        cin >> x >> y >> w;
        a[x][y] = w;
    }
    auto dp = a;
    for (int i = 0; i < n; i++)
        dp[i][i] = 0;

    for (int k = 0; k < n; k++)
    {
        for (int i = 0; i < n; i++)
        {
            for (int j = 0; j < n; j++)
            {
                if (dp[i][k] != inf && dp[k][j] != inf && dp[i][j] > dp[i][k] + dp[k][j])
                    dp[i][j] = dp[i][k] + dp[k][j];
            }
        }
    }
    for (int i = 0; i < n; i++)
    {
        for (int j = 0; j < n; j++)
            cout << dp[i][j] << " ";
        cout << endl;
    }

    return 0;
}
