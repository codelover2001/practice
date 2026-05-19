#include <bits/stdc++.h>
#define pi pair<int, int>
#define mod 1000000007
#define ss second
#define inf 1e16
#define ff first
#define all(x) x.begin(), x.end()
#define vi vector<int>
#define forit() for (auto it = m.begin(); it != m.end(); it++)
#define srt(a) sort(a.begin(), a.end())
#define rvs(a) reverse(a.begin(), a.end())
#define pb push_back
#define rrep(i, n) for (int i = n - 1; i >= 0; i--)
#define fr() for (int i = 0; i < n; i++)
using namespace std;
class Solution
{
public:
    vector<vi> multiply(vector<vi> a, vector<vi> b)
    {
        int n = a.size();
        vector<vi> ans = a;
        for (int i = 0; i < n; i++)
        {
            for (int j = 0; j < n; j++)
            {
                int sum = 0;
                for (int k = 0; k < n; k++)
                    sum = (sum + a[i][k] * b[k][j]);
                ans[i][j] = sum;
            }
        }

        return ans;
    }
    vector<vi> fun(vector<vi> a, int n)
    {
        if (n == 1)
            return a;
        auto v = fun(a, n / 2);
        v = multiply(v, v);
        if (n % 2 == 1)
            v = multiply(v, a);
        return v;
    }
    int fib(int n)
    {
        if (n == 0)
            return 0;
        if (n <= 2)
            return 1;
        vector<vi> a{
            {1, 1, 1},
            {1, 0, 0},
            {0, 1, 0}};
        auto v = fun(a, n - 2);
        return v[0][0] + v[0][1];
    }
};