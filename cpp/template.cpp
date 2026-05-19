//jay shree ram
#include <bits/stdc++.h>
#include <sstream>
using namespace std;
typedef long long ll;
typedef long double ld;
#define INF 0x3f3f3f3f
#define mod 1000000007
#define mod2 998244353
#define fori(T, N) for (int i = T; i < N; i++)
#define forin(N, T) for (int i = N - 1; i >= T; i--)
#define forj(T, N) for (int j = T; j < N; j++)
#define fork(T, N) for (int k = T; k < N; k++)
#define all(X) X.begin(), X.end()
#define alr(X) X.rbegin(), X.rend()
#define mm cout << endl
#define PI 3.1415926535897932384626
#define mem0(X) memset(X, 0, sizeof X)
#define mem1(X) memset(X, -1, sizeof X)
typedef pair<int, int> pi;
typedef pair<ll, ll> pl;
typedef vector<int> vi;
typedef vector<ll> vl;
typedef vector<pi> vpi;
typedef vector<pl> vpl;
typedef vector<vi> vvi;
vl spf, fact;
class graph
{
public:
    int n;
    list<pair<int, int>> *adj;
    vi dist;
    vvi path;
    vector<bool> ch;
    vi par;
    vector<pair<int, pi>> mst;
    graph(int);
    void addw(int, int, int);
    void dijkshtra(int);
    void fldwsh();
    void update(int);
    void kruskal();
    int comp();
    int dfs(int);
};
graph::graph(int n)
{
    this->n = n;
    adj = new list<pair<int, int>>[n];
}
void graph::addw(int u, int v, int w)
{
    adj[u].push_back({v, w});
    adj[v].push_back({u, w});
}
void graph::dijkshtra(int src)
{
    set<pair<int, int>> setds;
    dist.resize(n, INF);
    setds.insert({0, src});
    dist[src] = 0;
    while (!setds.empty())
    {
        pair<int, int> tmp = *(setds.begin());
        setds.erase(setds.begin());
        int u = tmp.second;
        for (auto i = adj[u].begin(); i != adj[u].end(); ++i)
        {
            int v = (*i).first;
            int wt = (*i).second;
            if (dist[v] > dist[u] + wt)
            {
                if (dist[v] != INF)
                    setds.erase(setds.find({dist[v], v}));
                dist[v] = dist[u] + wt;
                setds.insert({dist[v], v});
            }
        }
    }
}
void graph::fldwsh()
{
    path.resize(n, vi(n, INF));
    fori(0, n)
    {
        path[i][i] = 0;
        for (auto it : adj[i])
            path[i][it.first] = it.second;
    }
    fork(0, n)
        fori(0, n)
            forj(0, n) if (path[i][k] + path[k][j] < path[i][j])
                path[i][j] = path[i][k] + path[k][j];
}
int graph::comp()
{
    int ans = 0;
    ch.resize(n, false);
    fori(0, n) if (!ch[i]) ans++, dfs(i);
    return ans;
}
int graph::dfs(int st)
{
    if (ch.size() == 0)
        ch.resize(n, false);
    queue<int> q;
    int cnt = 1;
    ch[st] = true;
    q.push(st);
    while (!q.empty())
    {
        int cur = q.front();
        q.pop();
        for (auto it : adj[cur])
            if (!ch[it.first])
                cnt++, ch[it.first] = true, q.push(it.first);
    }
    return cnt;
}
void graph::update(int k)
{
    if (par[k] < 0 || par[par[k]] < 0)
        return;
    update(par[k]);
    par[k] = par[par[k]];
}
void graph::kruskal()
{
    par.resize(n, -1);
    vector<pair<int, pi>> eg;
    fori(0, n) for (auto it : adj[i])
        eg.push_back({it.second, {i, it.first}});
    sort(all(eg));
    for (auto it : eg)
    {
        int u = it.second.first;
        int v = it.second.second;
        update(u);
        update(v);
        int paru, parv;
        if (par[u] < 0)
            paru = u;
        else
            paru = par[u];
        if (par[v] < 0)
            parv = v;
        else
            parv = par[v];
        if (paru == parv)
            continue;
        mst.push_back(it);
        if (par[paru] <= par[parv])
        {
            par[paru] += par[parv];
            par[parv] = paru;
        }
        else
        {
            par[parv] += par[paru];
            par[paru] = parv;
        }
    }
}
void pfactor()
{
    int n = 1000000;
    spf.resize(n + 1, 1);
    for (int i = 2; i * i <= n; i++)
    {
        if (spf[i] == 1)
        {
            for (int j = i * i; j <= n; j += i)
                if (spf[j] == 1)
                    spf[j] = i;
        }
    }
}
vector<int> tpf(int x)
{
    vector<int> ret;
    while (x != 1)
    {
        ret.push_back(spf[x]);
        x = x / spf[x];
    }
    return ret;
}
bool isprime(int k)
{
    if (spf[k] == 1)
        return true;
    return false;
}
ll cell(ll a, ll b)
{
    if (b == 0)
        return -1;
    return (a + b - 1) / b;
}
ll max(ll a, ll b, ll c)
{
    return max(a, max(b, c));
}
ll min(ll a, ll b, ll c)
{
    return min(a, min(b, c));
}
ll pr(ll x, ll y)
{
    ll res = 1;
    x = x % mod;
    if (x == 0)
        return 0;
    while (y > 0)
    {
        if (y & 1)
            res = (res * x) % mod;
        y = y >> 1;
        x = (x * x) % mod;
    }
    return res;
}
void comb()
{
    fact.resize(1000001);
    fact[0] = 1;
    fori(1, 1000000)
    {
        fact[i] = (i * fact[i - 1]) % mod;
    }
}
ll modi(ll x)
{
    return pr(x, mod - 2);
}
ll ncr(ll n, ll r)
{
    ll ans = fact[n];
    ans *= modi(fact[r]);
    ans %= mod;
    ans *= modi(fact[n - r]);
    ans %= mod;
    return ans;
}
int32_t main()
{
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    cout.tie(NULL);
    cout << fixed << setprecision(10);
    int Test = 1;
    while (Test--)
    {
    }
}
