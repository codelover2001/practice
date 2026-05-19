#include <bits/stdc++.h>
using namespace std;

class Bank{
    unordered_map<int , long long> balances; 
    set<int> richUsers;
    long long threshold=0; 
    
public: 
    Bank(){
        balances.reserve(1024);
        // richUsers.reserve(1024);
    }

    bool addUser(int user_id,int amount){
        if(!balances.count(user_id)){
            balances[user_id] = amount;
            return true;
        }
        return false;
    }
    bool addTxn(int paid_by, int paid_to, long long amount){
        if(!balances.count(paid_by) || !balances.count(paid_to)) 
            return false;
        balances[paid_by]-=amount;
        balances[paid_to]+=amount;
    }

    bool addSingleTxn(int user_id, long long amount){
        balances[user_id]+=amount;
        // cout<<balances[user_id]<<endl;
        if(balances[user_id]>= threshold){
            richUsers.insert(user_id);
        }else{
            richUsers.erase(user_id);
        }
    }

    void showRichUsers(){
        // cout<<richUsers.size()<<endl;
        for(auto &richUser: richUsers){
            cout<<richUser<<" ";
        }
        cout<<endl;
    }

    void showFinalBalance(){
        for(auto &[user_id, amount]: balances){
            if(amount<0){
                cout<<user_id<<" has negative credit "<<amount<<endl;
            }else {
                cout<<user_id<<" "<<amount<<endl;
            }
        }
    }
    
};

int main(){

    Bank indianBank; 

    indianBank.addUser(5,100);
    indianBank.addUser(4,200);
    indianBank.addSingleTxn(4,500);
    indianBank.addSingleTxn(5,-1000);
    

    indianBank.showRichUsers();
    // indianBank.showFinalBalance();


   

    return 0;
}

//Time - O(n) for n transactions
//space - O(n)