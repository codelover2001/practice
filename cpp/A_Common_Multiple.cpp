#include <bits/stdc++.h>
using namespace std;

int findMinimumCost(int gNodes, int gEdges, int* gFrom, int* gTo) {
    vector<unordered_set<int>> bad(gNodes + 1);
    for (int i = 0; i < gEdges; i++) {
        int u = gFrom[i], v = gTo[i];
        if (u == v) continue;
        bad[u].insert(v);
        bad[v].insert(u);
    }

    unordered_set<int> rem;
    for (int i = 1; i <= gNodes; i++) rem.insert(i);

    int components = 0;
    queue<int> q;

    while (!rem.empty()) {
        int start = *rem.begin();
        rem.erase(start);
        components++;
        q.push(start);

        while (!q.empty()) {
            int u = q.front(); q.pop();
            for (auto it = rem.begin(); it != rem.end(); ) {
                int v = *it;
                if (bad[u].find(v) == bad[u].end()) {
                    it = rem.erase(it);
                    q.push(v);
                } else {
                    ++it;
                }
            }
        }
    }

    return components - 1;
}

int main() {
    int gNodes, gEdges;
    cin >> gNodes >> gEdges;

    vector<int> gFrom(gEdges), gTo(gEdges);
    for (int i = 0; i < gEdges; i++) {
        cin >> gFrom[i] >> gTo[i];
    }

    cout << findMinimumCost(gNodes, gEdges, gFrom.data(), gTo.data()) << "\n";
    return 0;
}
