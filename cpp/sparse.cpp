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
int32_t main()
{
    fast //fast
        int n,
        q;
    cin >> n >> q;
    vi a(n);
    for (int i = 0; i < n; i++)
        cin >> a[i];
    int dp[n][26] = {};
    for (int i = 0; i < n; i++)
        dp[i][0] = a[i];
    for (int j = 1; j <= 25; j++)
    {
        for (int i = 0; i + (1 << j) <= n; i++)
        {
            dp[i][j] = min(dp[i][j - 1], dp[i + (1 << (j - 1))][j - 1]);
        }
    }

    while (q--)
    {
        int l, r;
        cin >> l >> r;
        l--,r--;
        int ans = inf;
        for (int i = 25; i >= 0; i--)
        {
            if (l + (1 << i) - 1 <= r)
            {
                ans = min(ans, dp[l][i]);
                l += 1 << i;
            }
        }
        cout << ans << endl;
    }
    return 0;
}
