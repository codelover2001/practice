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
vector<vector<int>> a;
vector<vi> dp;
int n;
int dfs(int mask, int s)
{
    if (mask + 1 == (1 << n))
        return a[s][0];
    if (dp[mask][s] != -1)
        return dp[mask][s];
    int ans = INT_MAX;
    for (int i = 0; i < n; i++)
    {
        if ((mask & (1 << i)) == 0)
            ans = min(ans, a[s][i] + dfs(mask ^ (1 << i), i));
    }
    return dp[mask][s] = ans;
}
int32_t main()
{
    fast //fast
            cin >>
        n;
    a.resize(n, vi(n, 0));
    for (int i = 0; i < n; i++)
    {
        for (int j = 0; j < n; j++)
            cin >> a[i][j];
    }
    dp.resize((1 << n), vi(n, -1));
    cout << dfs(1, 0) << endl;

    return 0;
}
