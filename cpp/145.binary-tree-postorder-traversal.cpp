/*
 * @lc app=leetcode id=145 lang=cpp
 *
 * [145] Binary Tree Postorder Traversal
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
    vector<int> postorderTraversal(TreeNode* root) {
        stack<TreeNode* > st; 
        st.push(root);
        vector<int>ans;
        while(!st.empty()){
            TreeNode* curr=st.top();
            st.pop();
            if(curr->val > 100)
            {
                ans.push_back(curr->val-250);
                continue; 
            }

            curr->val+=250;
            st.push(curr);
            if(curr->right !=NULL)
                st.push(curr->right);

            if(curr->left!=NULL)
                st.push(curr->left);
            
            
        }

        return ans;
    }
};
// @lc code=end

