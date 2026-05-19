

class Solution {

    public void merge(int[] a,int l,int mid,int r){
        int[] temp=new int[r-l+1];

        int i=l,j=mid+1,k=0;

        while(i<=mid && j<=r){
            if(a[i]<=a[j]){
                temp[k++]=a[i++];
            }else{
                temp[k++]=a[j++];
            }
        }

        while(i<=mid){
            temp[k++]=a[i++];
        }

        while(j<=r){
            temp[k++]=a[j++];
        }

        for(i=l;i<=r;i++){
            a[i]=temp[i-l];
        }
    }

    public long mergeSort(int[] a,int l,int r){
        if(l>=r) return 0;

        int mid=l+(r-l)/2;

        long count=mergeSort(a, l, mid)+mergeSort(a, mid+1, r);
        int i=l;
        for(int j=mid+1;j<=r;j++){
            while(i<=mid && a[i]<=a[j]){
                i++;
            }

            count+=mid-i+1;
        }
        merge(a, l, mid,r);
        return count;
    }
    public long inversionCount(int[] a){
        return mergeSort(a,0,a.length-1);
    }
   
}
