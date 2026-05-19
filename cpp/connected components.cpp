int m, n;
vector<vector<int>> dir{{1, 0}, {0, 1}, {-1, 0}, {0, -1}};
void dfs(vector<vector<int>> &a, int i, int j)
{
    if (i < 0 || j < 0 || i >= m || j >= n || a[i][j] == 2 || a[i][j] == 0)
        return;
    a[i][j] = 2;
    for (int k = 0; k < 4; k++)
        dfs(a, i + dir[k][0], j + dir[k][1]);
}
int numIslands(vector<vector<int>> &a)
{
    int c = 0;
    m = a.size();
    if (m == 0)
        return 0;
    n = a[0].size();
    for (int i = 0; i < m; i++)
    {
        for (int j = 0; j < n; j++)
        {
            if (a[i][j] == 1)
            {
                c++;
                dfs(a, i, j);
            }
        }
    }
    return c;
}