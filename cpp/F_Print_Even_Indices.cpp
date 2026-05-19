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