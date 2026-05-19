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
    c.resize(n, 1);
    v.resize(n, 0);
    for (int i = 0; i < e; i++)
    {
        int x, y;
        cin >> x >> y;
        a[x].pb(y);
        a[y].pb(x);
    }
}
bool bfs(int start)
{
    queue<int> q;
    q.push(start);
    v[start] = 1;
    while (!q.empty())
    {
        int s = q.front();
        q.pop();
        for (auto x : a[s])
        {
            if (c[x] == c[s])
            {
                c[x]++;
                if (c[x] > mx)
                    mx++;
            }
            if (mx > m)
                return 0;
            if (!v[x])
            {
                q.push(x);
                v[x] = 1;
            }
        }
    }
    return 1;
}
int main()
{
    input_graph();
    for (int i = 0; i < n; i++)
    {
        if (!v[i] && bfs(i) == 0)
        {
            cout << "Impossible to color the graph using " << m << " colors" << endl;
            return 0;
        }
    }
    for (int x : c)
        cout << x << " ";
    return 0;
}
