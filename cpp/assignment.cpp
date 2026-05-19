#include<bits/stdc++.h>
# define INF 0x3f3f3f3f
#define mod 1000000007
#define ss second
#define ll long long int
#define ff first
#define all(x) x.begin(), x.end()
#define vi vector<int>
#define vii vector<vector<int>>
#define forit() for (auto it = m.begin(); it != m.end(); it++)
#define srt(a) sort(a.begin(), a.end())
#define rvs(a) reverse(a.begin(), a.end())
#define pb push_back
#define rrep(i, n) for (int i = n - 1; i >= 0; i--)
#define fr() for (int i = 0; i < n; i++)
using namespace std;

typedef pair<int, int> iPair;

class Router
{
    int V;
    list< pair<int, int> > *adj;

public:
    Router(int V);
    void addLink(int u, int v, int w);
    void shortestPath(int s);
};
Router::Router(int V)
{
    this->V = V;
    adj = new list<iPair> [V];
}

void Router::addLink(int u, int v, int w)
{
    adj[u].push_back(make_pair(v, w));
    adj[v].push_back(make_pair(u, w));
}
void Router::shortestPath(int src)
{
    priority_queue< iPair, vector <iPair> , greater<iPair> > pq;

    vector<int> dist(V, INF);

    pq.push(make_pair(0, src));
    dist[src] = 0;
    while (!pq.empty())
    {
        int u = pq.top().second;
        pq.pop();
        list< pair<int, int> >::iterator i;
        for (i = adj[u].begin(); i != adj[u].end(); ++i)
        {
            int v = (*i).first;
            int weight = (*i).second;
            
            if (dist[v] > dist[u] + weight)
            {
                dist[v] = dist[u] + weight;
                pq.push(make_pair(dist[v], v));
            }
        }
    }
    printf("Distance from Source Router\n");
    for (int i = 0; i < V; ++i)
        printf("%d \t\t %d\n", i, dist[i]);
}
int main()
{
    int V = 9;
    Router g(V);

    g.addLink(0, 1, 4);
    g.addLink(0, 7, 8);
    g.addLink(1, 2, 8);
    g.addLink(1, 7, 11);
    g.addLink(2, 3, 7);
    g.addLink(2, 8, 2);
    g.addLink(2, 5, 4);
    g.addLink(3, 4, 9);
    g.addLink(3, 5, 14);
    g.addLink(4, 5, 10);
    g.addLink(5, 6, 2);
    g.addLink(6, 7, 1);
    g.addLink(6, 8, 6);
    g.addLink(7, 8, 7);

    g.shortestPath(0);
    return 0;
}
