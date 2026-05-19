vector<int> phi;
vector<int> spf;
int power(int a,int b)
{
    if(b==0)
    return 1;
    int ans=power(a,b/2);
    ans*=ans;
    if(b%2==1)
    return ans*a;
    return ans;
}
int inverse(int a,int p)
{
    return power(a,p-2);
}
void banao(int n)
{
    phi.resize(n + 1);
    for(int i=0;i<=n;i++)
        phi[i] = i;
    for(int k=2;k<=n;k++)
    {
        if (phi[k] == k)
        {
            phi[k] = k - 1;
            for (int i = 2 * k; i <= n; i += k)
            {
                phi[i] = (phi[i] / k) * (k - 1);
            }
        }
    }
}
bool isprime(int n)
{
    if (phi[n] == n - 1)
        return true;
    else
        return false;
}
void pfactor(int n)
{
    spf.resize(n + 1, 1);
    for(int i=2;i<=n;i++)
        spf[i] = i;
    for (int i = 4; i <= n; i += 2)
        spf[i] = 2;
    for (int i = 3; i * i <= n; i++)
    {
        if (spf[i] == i)
        {
            for (int j = i * i; j <= n; j += i)
                if (spf[j] == j)
                    spf[j] = i;
        }
    }
}
vector<int> tpf(int x)
{
    vector<int> ret;
    while (x != 1)
    {
        ret.push_back(spf[x]);
        x = x / spf[x];
    }
    return ret;
}
