#include <bits/stdc++.h>
// #define int long long
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
#define fast ios_base::sync_with_stdio(false), cin.tie(nullptr), cout.tie(nullptr);
using namespace std;

vector<int> getMedianArray( vector<int> nums) {
    priority_queue<int> maxHeap; // max heap for the lower half
    priority_queue<int, vector<int>, greater<int> > minHeap; // min heap for the upper half
    vector<int> medians;

    for (int i = 0; i < nums.size(); ++i) {
        int num = nums[i];

        // Step 1: Insert into appropriate heap
        if (maxHeap.empty() || num <= maxHeap.top()) {
            maxHeap.push(num);
        } else {
            minHeap.push(num);
        }

        // Step 2: Balance the heaps so that maxHeap has the same number or one more than minHeap
        if (maxHeap.size() > minHeap.size() + 1) {
            minHeap.push(maxHeap.top());
            maxHeap.pop();
        } else if (minHeap.size() > maxHeap.size()) {
            maxHeap.push(minHeap.top());
            minHeap.pop();
        }

        // Step 3: Get the median
        int median = maxHeap.top(); // If even count, we can return maxHeap.top() as per requirement
        medians.push_back(median);
    }

    return medians;
}

int getMid(int a, int b, int c) {
    if ((a >= b && a <= c) || (a <= b && a >= c)) {
        return a; // a is the median
    } else if ((b >= a && b <= c) || (b <= a && b >= c)) {
        return b; // b is the median
    } else {
        return c; // c is the median
    }
}


int32_t main()
{
    fast // fast
            cout
        << fixed << setprecision(10);
    int t = 1;
    cin>>t;
    while (t--)
    {
        int n,k;
        cin>>n>>k;
        vector<int> a(n);
        for(int i=0;i<n;i++){
            cin>>a[i];
        }

        vi left= getMedianArray(a);
        //reverse a array 

        vi b = a;
        reverse(b.begin(),b.end());
        vi right = getMedianArray(b);
        reverse(right.begin(),right.end());

        int flag = 0;
        for(int i=1;i<n-1;i++){
            int med = getMid(left[i-1],a[i],right[i+1]);
            if(med<=k){
                flag =1;
            }
        }

        for(int i=1;i<n-2;i++){
            int med = getMid(left[i-1],right[i+2],min(a[i],a[i+1]));
            if(med<=k){
                flag=1;
            }
        }

        for(int i=1;i<n-3;i++){
            int med = getMid(left[i-1],right[i+3],getMid(a[i],a[i+1],a[i+2]));
            if(med<=k){
                flag=1;
            }
        }

        if(flag==1){
            cout<<"YES"<<endl;
        }
        else {
            cout<<"NO"<<endl;
        }


        
        
    }
    return 0;
}


