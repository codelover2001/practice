class Solution {
    public boolean lemonadeChange(int[] bills) {
        int five = 0, ten = 0;
        for(int bill: bills){
            if(bill == 5){
                five++;
            }else if(bill == 10){
                ten++;
                five--;
            }else if(bill == 20){
                if(ten > 0){
                    ten--;
                    five--;
                }else{
                    five -= 3;
                }
            }
        }
        if(five < 0 || ten < 0) return false;
        return true;
    }

    public static void main(String[] args) {
        Solution s = new Solution();
        int[] bills = {5,5,5,10,20};
        System.out.println(s.lemonadeChange(bills));
    }
}