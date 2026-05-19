/*
 * @lc app=leetcode id=372 lang=cpp
 *
 * [372] Super Pow
 */
 bool cmp(int x,int y){
    return x<y;
 }

// @lc code=start
class Solution {
public:
    int superPow(int s, vector<int>& a) {
        sort(a.begin(),a.end(),cmp)
    }
};
// @lc code=end

