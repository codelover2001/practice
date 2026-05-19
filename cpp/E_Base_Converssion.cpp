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

class Node {
    int val;
    Node* next;
    Node* prev;
    Node(int nodeValue){
        val=nodeValue;
        next=NULL;
        prev=NULL;
    }
}
class LRU{
    unordered_map<int,Node*> mp;//key and pointer to doubly linked list 
    int cacheSize;
    Node* head;
    Node* tail;

    

    LRU(int size){
        cacheSize=size;
        head=NULL;
        tail=NULL;
    }

    int read(int key){
        if(mp.find(key) ){
            Node* cacheNode= mp[key];
            return cacheNode->val;
        }
        else{
            cout<<" cache miss"<<endl;
            return -1;
        }
    }

    void write(int key, int NodeValue){
        if(mp.find(key)){
            Node* cacheNode= mp[key];
            Node* prevNode=cacheNode->prev;
            Node* nextNode=cacheNode->next;
            prevNode->next=nextNode;
            nextNode->prev=prevNode;

            tail->next=cacheNode;
            cacheNode->next=NULL;
            cacheNode->prev=tail;
            cacheNode->val=NodeValue;

            tail=cacheNode;

        }else if(mp.size()!=cacheSize){
            Node* newNode= new Node(val);
            tail->next=newNode;
            newNode->prev=tail;

            mp[key]=newNode;
            tail=newNode;


        } else {
            Node* nextHead=head->next;
            head=nextHead;
            head->prev=NULL;

            Node* newNode= new Node(val);
            tail->next=newNode;
            newNode->prev=tail;

            mp[key]=newNode;
            tail=newNode;
        }
    }
}

int32_t main()
{
   LRU cache=new LRU(3);
   LRU.read()

    return 0;
}




// cache size = 4
// [1,2,3,1,2,3,4,5]

// [5,2,3,4]

// Input: 
// map1 => key - val 
// {1:2},{2:3},{3:4},{1:4},{3:4},{3:4}

// time=

// Map: key - time 
// 1->7
// 2->8
// 3->5

// queue

// {3,5}<->{2,6}<->{1,7}<->{2,8}->null





// space = O(cache size)

// time 

// int read(){
//     time - O(1)
// }

// void write(){
//     if(val is present ) => O(1)
//     else size is not full => O(1)
//     else size is full => remove operation  - O(1)
// }

// void remove(){
//     time = O(n)
// }


