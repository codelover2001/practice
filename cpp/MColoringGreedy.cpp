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
int main()
{
    input_graph();
    int mc = 0;
    for (int i = 0; i < n; i++)
    {
        set<int> s;
        for (auto x : a[i])
        {
            if (c[x] > 0)
                s.insert(c[x]);
        }
        int j = 0;
        for (auto x : s)
        {
            if (j != x)
                break;
            j++;
        }
        c[i] = j;
        mc = max(mc, j);
    }

    if (mc > m)
    {
        cout << "Impossible to color the graph using " << m << " colors" << endl;
        return 0;
    }

    for (int x : c)
        cout << x << " ";
    return 0;
}
