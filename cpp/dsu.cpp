class DisjointSet
{
public:
    vector<int> parent, sz;

    DisjointSet(int n)
    {
        parent.resize(n);
        sz.resize(n, 1);
        for (int i = 0; i < n; i++)
            parent[i] = i;
    }

    void join(int a, int b)
    {
        a = find(a);
        b = find(b);
        if (a != b)
        {
            if (sz[a] < sz[b])
                swap(a, b);
            parent[b] = a;
            sz[a] += sz[b];
        }
    }

    int find(int a) { return a == parent[a] ? a : parent[a] = find(parent[a]); }

    bool check(int a, int b) { return find(a) == find(b); }
};