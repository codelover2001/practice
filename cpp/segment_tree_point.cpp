#include <bits/stdc++.h>
#define int long long
#define pi pair<int, int>
#define mod 1000000007
#define ss second
#define inf 1e16
#define MAXN 1e6
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
vi t;
int n;
int sum(int v, int tl, int tr, int l, int r)
{
    if (l > r)
        return 0;
    if (l == tl && r == tr)
    {
        return t[v];
    }
    int tm = tl + (tr - tl) / 2;
    return sum(v * 2, tl, tm, l, min(r, tm)) + sum(v * 2 + 1, tm + 1, tr, max(l, tm + 1), r);
}
void update(int v, int tl, int tr, int pos, int new_val)
{
    if (tl == tr)
    {
        t[v] = new_val;
    }
    else
    {
        int tm = tl + (tr - tl) / 2;
        if (pos <= tm)
            update(v * 2, tl, tm, pos, new_val);
        else
            update(v * 2 + 1, tm + 1, tr, pos, new_val);
        t[v] = t[v * 2] + t[v * 2 + 1];
    }
}
void build(int a[], int v, int tl, int tr)
{
    if (tl == tr)
    {
        t[v] = a[tl];
    }
    else
    {
        int tm = tl + (tr - tl) / 2;
        build(a, v * 2, tl, tm);
        build(a, v * 2 + 1, tm + 1, tr);
        t[v] = t[v * 2] + t[v * 2 + 1];
    }
}
int32_t main()
{
    fast //fast
        t.resize(4 * MAXN);

    return 0;
}
