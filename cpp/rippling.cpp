#include <bits/stdc++.h>
using namespace std;


void generate(int n, int open, int close, string output){
    if(open >n || close >n)
        return ;
    if(open ==n && close ==n ){
        cout<<output<<endl;
    }

    generate(n,open+1,close,output+"(");
    if(open>close){
         generate(n,open,close+1, output+")");
    }

    return ;
   




}


int main(){
    generate(3,0,0,"");
    return 0;
}