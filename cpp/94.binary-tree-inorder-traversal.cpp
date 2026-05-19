/*
 * @lc app=leetcode id=94 lang=cpp
 *
 * [94] Binary Tree Inorder Traversal
 */

// @lc code=start
/**
 * Definition for a binary tree node.
 * struct TreeNode {
 *     int val;
 *     TreeNode *left;
 *     TreeNode *right;
 *     TreeNode() : val(0), left(nullptr), right(nullptr) {}
 *     TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
 *     TreeNode(int x, TreeNode *left, TreeNode *right) : val(x), left(left), right(right) {}
 * };
 */
class Solution {
public:
    vector<int> inorderTraversal(TreeNode* root) {

        stack<TreeNode*> st;
        vector<int>ans;
        if(root==NULL) return ans;
        TreeNode* curr=root;
        // st.push(root);
        while(true){
            if(curr!=NULL){
                st.push(curr);
                curr=curr->left;
            }else{
                //visit the node and go to the right 
                if(st.empty()) return ans;
                curr=st.top();
                st.pop();
                ans.push_back(curr->val);
                curr=curr->right;
            }

        }
        return ans;
    }
};
// @lc code=end

