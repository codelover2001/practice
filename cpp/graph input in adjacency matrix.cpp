int n,m;
vector<vector<int>>a;
void input_graph()
{
    cin>>n>>m;
    a.resize(n);
    for(int i=0;i<m;i++)
    {
        int x,y;cin>>x>>y;
        x--;y--;
        a[x].pb(y);
        a[y].pb(x);
    }
}