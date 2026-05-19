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
class edge
{
public:
    int u, v, w;
};


class DisjointSet{ 
    public:
    
    vector<int> parent;

    DisjointSet(int n): parent(n) { for(int i=0; i<n; i++) parent[i] = i; }

    void join(int a, int b) { parent[find(b)] = find(a); }

    int find(int a){ return a == parent[a] ? a : parent[a] = find(parent[a]); }

    bool check(int a, int b){ return find(a) == find(b); }
};
int32_t main()
{
    fast //fast
    cin >>n >> m;
    vector<edge> a(m), ans(n - 1);
    for (int i = 0; i < m; i++)
    {
        cin >> a[i].u >> a[i].v >> a[i].w;
    }
    auto cmp = [](edge a, edge b) {
        return a.w < b.w;
    };
    sort(a.begin(), a.end(), cmp);
    DisjointSet dsu(n);
    int c=0;
    for(int i=0;i<m;i++)
    {
        if(!dsu.check(a[i].u,a[i].v))
        {
            ans[c++]=a[i];
            if(c==n-1)
            break;
        }
        dsu.join(a[i].u,a[i].v);
    }

    for (auto x : ans)
        cout << x.u << " " << x.v << " " << x.w << endl;

    return 0;
}
