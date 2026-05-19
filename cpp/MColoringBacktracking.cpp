#include <bits/stdc++.h>
#define pb push_back
using namespace std;
int n, m, e; //no of vertices  ,max colors   ,no of edges
int mx = 1;  //min no of colors need to color the graph
vector<vector<int>> a;
vector<int> c, v;
void input_graph()
{
    cin >> n >> e >> m;
    a.resize(n);
    c.resize(n, -1);
    v.resize(n, 0);
    for (int i = 0; i < e; i++)
    {
        int x, y;
        cin >> x >> y;
        a[x].pb(y);
        a[y].pb(x);
    }
}
bool safe(int s, int col)
{
    for (auto x : a[s])
    {
        if (c[x] == col)
            return 0;
    }
    return 1;
}
bool dfs(int s)
{
    if (s == n)
        return 1;
    for (int i = 0; i < m; i++)
    {
        if (safe(s, i))
        {
            c[s] = i;
            if (dfs(s + 1))
                return 1;
            c[s] = -1;
        }
    }
    return 0;
}
int main()
{
    input_graph();

    if (dfs(0) == 0)
    {
        cout << "Impossible to color the graph using " << m << " colors" << endl;
        return 0;
    }

    for (int x : c)
        cout << x << " ";
    return 0;
}
