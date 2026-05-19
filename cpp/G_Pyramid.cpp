#include <bits/stdc++.h>
#define int long long
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
vector<string> solution(vector<string>  mem,vector<vector<string>> events){
    map<string,int> ans;
    map<string,int> active;
    for(int i=0;i<mem.size();i++){
        ans[mem[i]] = 0;
        active[mem[i]] = 0;
    }
    for(int i=0;i<events.size();i++){
        if(events[i][0]=="MESSAGE"){
            string str= events[i][2];

           if (str[0]=='A'){
                for(int i=0;i<mem.size();i++){
                    ans[mem[i]]++;
                }
            }else if (str[0]=='i'){
                ans[str]++;
            } else if (str[0]=='H') {
                string id = str.substr(5);
                int time = stoi(events[i][1]);
                if(active[id]<=time){
                    ans[id]++;
                }
               
            } 
        }else {
            int time = stoi(events[i][1]);
            time+=60;
            active[events[i][2]]= time;
        }
    }

    vector<string> result;
    for(auto it=ans.begin();it!=ans.end();it++){
        result.push_back(it->first + "=" + to_string(it->second));
    }
    return result;
}
// int32_t main()
// {
//     fast // fast
//             cout
//         << fixed << setprecision(10);
//     int t = 1;
//     // cin>>t;
//     while (t--)
//     {
//         vector<string> mem = {"id42", "id158", "id23"} ;
//         vector<vector<string>> events  = {
//             {"MESSAGE", "0", "ALL id158 id42"},
//             {"OFFLINE", "1", "id158"},
//             {"MESSAGE", "2", "id158 id158"},
//             {"OFFLINE", "3", "id23"},
//             {"MESSAGE", "60", "HERE id42 id158 id23"},
//             {"MESSAGE", "61", "HERE"},
//         };

//         vector<string> ans = solution(mem, events);

//         for(int i=0;i<ans.size();i++){
//             cout<<ans[i]<<endl;
//         }
        
//     }
//     return 0;
// }


