vector<int> bfs(int n,vector<vector<int>> &edges, int start){
    vector<int> bfs;
    vector<int>vis(n,0);
    queue<int> q;
    q.push(start);
    vis[start]=1;

    while(!q.empty()){
        int node = q.front();
        q.pop();

        bfs.push_back(node);

        for(auto adj: edges[node]){
            if(!vis[adj]){
                q.push(adj);
                vis[adj]=1;
            }
        }
    }
    return bfs;

}

void dfs(int start, vector<vector<int>> &edges, vector<int> &vis, vector<int> &dfs){
    vis[start]=1;
    dfs.push_back(start);
    for(auto it:edges[start]){
        if(!vis[it]){
            dfs(it, edges, vis, dfs);
        }
    }
}