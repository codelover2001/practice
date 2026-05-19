// Find Median from Data Stream (LC 295)
// Difficulty: Hard | Priority: P0
// Add integers and query median at any time.
// Example: addNum(1),addNum(2),findMedian()→1.5
// Approach: Two heaps: max-heap lower half, min-heap upper half.
// Time: O(log n), Space: O(n)

class MedianFinder {
    PriorityQueue<Integer> lo=new PriorityQueue<>(Collections.reverseOrder());
    PriorityQueue<Integer> hi=new PriorityQueue<>();
    public void addNum(int num) {
        // TODO: Implement
    }
    public double findMedian() {
        // TODO: Implement
    }
}
