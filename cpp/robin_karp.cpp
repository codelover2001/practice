#include <bits/stdc++.h>
#define pi pair<ll, ll>
#define mod 1000000007
#define ss second
#define ll long long int
#define inf 1e16
#define ff first
#define ll long long
#define vii vector<vector<ll>>
#define all(x) x.begin(), x.end()
#define vi vector<ll>
#define forit() for (auto it = m.begin(); it != m.end(); it++)
#define srt(a) sort(a.begin(), a.end())
#define rvs(a) reverse(a.begin(), a.end())
#define pb push_back
#define rrep(i, n) for (ll i = n - 1; i >= 0; i--)
#define fr() for (ll i = 0; i < n; i++)
using namespace std;
class Solution
{
public:
    ll power(ll a, ll b)
    {
        if (b == 0)
            return 1;
        ll ans = power(a, b / 2);
        ans = (ans * ans) % mod;
        if (b % 2 == 1)
            ans = (ans * a) % mod;
        return ans;
    }
    ll inverse(ll a, ll p)
    {
        return power(a, p - 2) % mod;
    }
    int strStr(string a, string b)
    {
        ll m = a.length(), n = b.length();
        if (n == 0)
            return 0;
        if (m == 0 || n > m)
            return -1;
        vector<ll> p(m, 0), h(m, 0);
        p[0] = 1;
        ll pr = 31;
        for (ll i = 1; i < m; i++)
            p[i] = (p[i - 1] * pr) % mod;
        h[0] = (a[0] - 'a' + 1);
        for (ll i = 1; i < m; i++)
            h[i] = (h[i - 1] + (a[i] - 'a' + 1) * p[i]) % mod;

        ll hs = 0;
        for (ll i = 0; i < n; i++)
            hs = (hs + (b[i] - 'a' + 1) * p[i]) % mod;

        ll hash = 0;
        for (ll i = n - 1; i < m; i++)
        {
            if (i != n - 1)
            {
                hash = (hash + (a[i] - 'a' + 1) * p[i]) % mod;
                hash = (((h[i] - h[i - n] + mod) % mod) * (inverse(p[i - n + 1], mod))) % mod;
            }
            else
                hash = h[i];
            if (hash == hs)
                return i - n + 1;
        }
        return -1;
    }
};