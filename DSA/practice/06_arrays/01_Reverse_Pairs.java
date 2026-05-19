class Solution {

    public void merge(int[] a, int l, int mid, int r) {
        int[] temp = new int[r - l + 1];
        int k = 0, i = l, j = mid + 1;

        while (i <= mid && j <= r) {
            if (a[i] <= a[j]) temp[k++] = a[i++];
            else temp[k++] = a[j++];
        }
        while (i <= mid) temp[k++] = a[i++];
        while (j <= r) temp[k++] = a[j++];

        for (i = l; i <= r; i++) a[i] = temp[i - l];
    }

    public int mergeSort(int[] a, int l, int r) {
        if (l >= r) return 0;
        int mid = l + (r - l) / 2;

        int count = mergeSort(a, l, mid) + mergeSort(a, mid + 1, r);

        int i = l;
        for (int j = mid + 1; j <= r; j++) {
            while (i <= mid && (long) a[i] <= 2L * a[j]) i++;
            count += mid - i + 1;
        }

        merge(a, l, mid, r);
        return count;
    }

    public int reversePairs(int[] a) {
        return mergeSort(a, 0, a.length - 1);
    }
}
