import React, { useState, useEffect, useMemo } from 'react';
import { Search, ChevronDown, ChevronRight, RotateCcw, Trophy, Flame, Target } from 'lucide-react';

// =========================================================================
// PROBLEM DATA — 38 sections, ~300+ problems
// =========================================================================
const SECTIONS = [
  {
    id: 1, title: "Kadane / Subarray / Sliding Window — Sums",
    problems: [
      ["Maximum Subarray (Kadane's Algorithm)"],
      ["Maximum Circular Subarray"],
      ["Maximum Subarray Sum with One Deletion"],
      ["Maximum Product Subarray"],
      ["Maximum Absolute Sum Subarray"],
      ["Minimum Size Subarray Sum"],
      ["Maximum Sum Rectangle (2D Kadane)"],
      ["Flipping Game", "CF 327A"],
      ["Fence (sliding window min sum)", "CF 363B"],
      ["Lecture Sleep (window + base contribution)", "CF 961B"],
      ["Red and Blue (max prefix sum)", "CF 1469B"],
      ["Napoleon Cake (greedy sweep)", "CF 1501B"],
    ]
  },
  {
    id: 2, title: "Sliding Window — Strings / Distinct / At-Most-K",
    problems: [
      ["Longest Substring Without Repeating Characters", "LC 3"],
      ["Max Consecutive Ones III", "LC 1004"],
      ["Max Consecutive Ones III — weighted-flip follow-up"],
      ["Fruit Into Baskets", "LC 904"],
      ["Longest Repeating Character Replacement", "LC 424"],
      ["Binary Subarrays With Sum", "LC 930"],
      ["Count Number of Nice Subarrays", "LC 1248"],
      ["Number of Substrings Containing All Three Characters", "LC 1358"],
      ["Maximum Points You Can Obtain from Cards", "LC 1423"],
      ["Longest Substring with At Most K Distinct Characters", "LC 340"],
      ["Subarrays with K Different Integers", "LC 992"],
      ["Minimum Window Substring", "LC 76"],
      ["Minimum Window Subsequence", "LC 727"],
    ]
  },
  {
    id: 3, title: "Prefix Sums / Counting Patterns",
    problems: [
      ["QAQ", "CF 894A"],
      ["Ilya and Queries", "CF 313B"],
      ["Reposts (tree depth via hashmap)", "CF 522A"],
      ["Modulo Sum (prefix remainder + pigeonhole)", "CF 577B"],
      ["Subarray sums divisible by K"],
      ["Multiple-of-2019 type problems"],
    ]
  },
  {
    id: 4, title: "Classical 1D DP",
    problems: [
      ["Cut Ribbon (unbounded knapsack)", "CF 189A"],
      ["Vitamins (tiny bitmask DP)", "CF 1042B"],
      ["Basketball Exercise", "CF 1195C"],
      ["Pokémon Army (easy)", "CF 1420C1"],
      ["House Robber II (circular)"],
      ["House Robber III (tree DP)", "LC 337"],
      ["Assign Cookies (greedy)"],
      ["Minimum swaps so that nums[i] != forbidden[i]"],
    ]
  },
  {
    id: 5, title: "LIS Family (DP on Subsequences)",
    problems: [
      ["Longest Increasing Subsequence"],
      ["Print Longest Increasing Subsequence"],
      ["Largest Divisible Subset"],
      ["Longest String Chain"],
      ["Longest Bitonic Subsequence"],
      ["Number of Longest Increasing Subsequences"],
    ]
  },
  {
    id: 6, title: "LCS / String DP",
    problems: [
      ["Longest Common Subsequence"],
      ["Print Longest Common Subsequence"],
      ["Longest Common Substring"],
      ["Longest Palindromic Subsequence"],
      ["Minimum Insertions to Make String Palindrome"],
      ["Minimum Insertions/Deletions to Convert A → B"],
      ["Shortest Common Supersequence"],
      ["Distinct Subsequences"],
      ["Edit Distance"],
    ]
  },
  {
    id: 7, title: "Number Theory / Divisibility DP",
    problems: [
      ["Mashmokh and ACM", "CF 414B"],
      ["Orac and Models", "CF 1350B"],
    ]
  },
  {
    id: 8, title: "Digit DP",
    problems: [
      ["Classy Numbers", "CF 1036C"],
      ["Little Elephant and Interval", "CF 204A"],
    ]
  },
  {
    id: 9, title: "Bitmask DP / Hamiltonian / Subset DP",
    problems: [
      ["Roman and Numbers", "CF 401D"],
      ["Shortest Hamiltonian Walk"],
      ["Count Hamiltonian Walks"],
      ["Count Simple Paths"],
      ["Hamiltonian Walk Existence"],
      ["Shortest Hamiltonian Cycle (TSP)"],
      ["Count Hamiltonian Cycles"],
      ["Count Simple Cycles"],
      ["Hamiltonian Cycle Existence"],
      ["Hamiltonian Flights", "CSES"],
      ["Simple Cycles", "CF 11D"],
    ]
  },
  {
    id: 10, title: "State-Bounded / Optimized DP",
    problems: [
      ["Mr. Kitayuta, the Treasure Hunter (bounded jump length)", "CF 505C"],
      ["Riding in a Lift (DP + prefix sums)", "CF 479E"],
    ]
  },
  {
    id: 11, title: "Interval / Divide-and-Conquer DP",
    problems: [
      ["Painting Fence", "CF 448C"],
    ]
  },
  {
    id: 12, title: "Tree DP — Core Problems",
    problems: [
      ["Maximum Weight Independent Set on Tree"],
      ["Tree Diameter"],
      ["Tree Matching", "CSES"],
      ["Subordinates", "CSES"],
      ["Tree Distances I", "CSES"],
      ["Tree Distances II — rerooting", "CSES"],
      ["Distance in Tree", "CF 161D"],
      ["Choosing Capital for Treeland (rerooting)", "CF 219D"],
      ["Book of Evil (diameter-endpoint trick)", "CF 337D"],
      ["Parsa's Humongous Tree", "CF 1528A"],
      ["Appleman and Tree", "CF 461B"],
      ["House Robber III", "LC 337"],
      ["Counting Connected Subtrees of Size ≤ K"],
      ["Beautiful Set of Tree Nodes (binary-valued)"],
      ["Count induced subgraphs with exactly x connected components", "AtCoder"],
    ]
  },
  {
    id: 13, title: "Binary Lifting / LCA",
    problems: [
      ["Company Queries I (k-th ancestor)"],
      ["Company Queries II (LCA)"],
    ]
  },
  {
    id: 14, title: "Segment Tree / DP Optimization",
    problems: [
      ["Hanoi Factory (LIS-style nesting + segtree)", "CF 777E"],
    ]
  },
  {
    id: 15, title: "BFS / DFS — Grids and Components",
    problems: [
      ["Number of Provinces", "LC 547"],
      ["Connected Components in Matrix (BFS + DFS)"],
      ["Rotten Oranges (multi-source BFS)", "LC 994"],
      ["Rotten Oranges follow-up: cells that rot last + parent reconstruction"],
      ["Flood Fill", "LC 733"],
      ["0/1 Matrix (multi-source BFS + parent reconstruction)", "LC 542"],
      ["Surrounded Regions (border DFS/BFS)", "LC 130"],
      ["Number of Enclaves", "LC 1020"],
      ["Number of Distinct Islands (relative-coordinate normalization)"],
      ["Counting Rooms", "CSES"],
      ["Labyrinth (BFS + path reconstruction)", "CSES"],
      ["Building Roads (connected components)", "CSES"],
      ["Message Route", "CSES"],
    ]
  },
  {
    id: 16, title: "BFS / DFS — Graph Properties",
    problems: [
      ["Cycle Detection in Undirected Graph (BFS — parent tracking)"],
      ["Cycle Detection in Undirected Graph (DFS)"],
      ["Cycle Detection in Directed Graph (DFS — 3-state)"],
      ["Cycle Detection in Directed Graph (BFS / Kahn)"],
      ["Bipartite Graph (DFS 2-coloring)"],
      ["Round Trip (cycle in undirected)", "CSES"],
      ["Kefa and Park (DFS + constraint propagation)", "CF 580C"],
      ["Xor-tree (DFS state propagation)", "CF 429A"],
      ["Reachability from the Capital", "CF 999E"],
      ["Critical Connections in a Network (Tarjan bridges)", "LC 1192"],
      ["Minimal Diameter Forest (DFS + tree diameter)", "CF 1092E"],
    ]
  },
  {
    id: 17, title: "BFS on Implicit / State Graphs",
    problems: [
      ["Word Ladder I", "LC 127"],
      ["Word Ladder II (BFS + DFS backtracking)", "LC 126"],
      ["Bus Routes", "LC 815"],
      ["Mike and Shortcuts", "CF 892E"],
      ["Minimum Steps Using Multiplication and Mod (BFS on mod states)"],
    ]
  },
  {
    id: 18, title: "Topological Sort / DAG",
    problems: [
      ["Topological Sort (DFS)"],
      ["Kahn's Algorithm (BFS topological sort)"],
      ["Course Schedule I", "LC 207"],
      ["Course Schedule II", "LC 210"],
      ["Course Schedule II — lexicographically smallest topo order"],
      ["Find Eventual Safe States (reverse graph + outdegree BFS)", "LC 802"],
      ["Alien Dictionary (topo sort on characters)"],
      ["Fox And Names", "CF 510C"],
      ["Course Schedule", "CSES"],
      ["Incremental cycle detection / online topo maintenance"],
    ]
  },
  {
    id: 19, title: "DAG DP / Longest Path / Path Counting",
    problems: [
      ["Shortest Path in DAG (topo + relaxation)"],
      ["Longest Path in DAG"],
      ["Longest Flight Route", "CSES"],
      ["Game Routes (path counting in DAG)", "CSES"],
      ["Substring (topo + character DP on DAG)", "CF 919D"],
    ]
  },
  {
    id: 20, title: "Shortest Paths",
    problems: [
      ["Shortest Path in Undirected Graph with Unit Weights (BFS)"],
      ["Shortest Path in Binary Maze (BFS on grid)"],
      ["Dijkstra's Algorithm (heap + greedy invariant)"],
      ["Dijkstra: PQ vs set (stale entries, decrease-key simulation)"],
      ["Dijkstra: O(V²) vs O(E log V) complexity tradeoff"],
      ["Path With Minimum Effort (modified Dijkstra)", "LC 1631"],
      ["Cheapest Flights Within K Stops (Bellman-Ford with limit)", "LC 787"],
      ["Network Delay Time", "LC 743"],
      ["Number of Ways to Arrive at Destination (Dijkstra + path counting)", "LC 1976"],
      ["Find the City with Smallest Number of Neighbors Within Threshold", "LC 1334"],
      ["Bellman-Ford Algorithm (DP interpretation + negative cycle detection)"],
      ["Floyd-Warshall Algorithm (all-pairs + negative cycle check)"],
      ["Shortest Routes I", "CSES"],
      ["Shortest Routes II", "CSES"],
      ["High Score", "CSES"],
      ["Flight Discount", "CSES"],
      ["Investigation (path counts + min/max edges)", "CSES"],
      ["Cycle Finding (Bellman-Ford negative cycle)", "CSES"],
      ["Dijkstra? (path reconstruction)", "CF 20C"],
      ["Greg and Graph (Floyd-Warshall in reverse)", "CF 295B"],
      ["Cookies", "CF 1099F"],
      ["Road Improvement", "CF 721E"],
      ["Shortest Path", "CF 59E"],
      ["Wormholes", "UVa 558"],
      ["Score Attack", "AtCoder ABC 061 D"],
    ]
  },
  {
    id: 21, title: "DSU / Union-Find / MST",
    problems: [
      ["DSU (Find + path compression + union by rank/size)"],
      ["DSU applications: cycle detection, Kruskal, components"],
      ["Road Reparation (Kruskal MST)", "CSES"],
      ["Road Construction (online DSU / dynamic connectivity)", "CSES"],
      ["Min Cost to Connect All Points (Prim's MST)", "LC 1584"],
      ["Learning Languages (DSU components)", "CF 277A"],
      ["Array and Segments (DSU connectivity)", "CF 1108E1"],
    ]
  },
  {
    id: 22, title: "2D DP / Matrix / Subrectangle Problems",
    problems: [
      ["Largest all-zero subrectangle"],
      ["Maximum sum subrectangle"],
      ["Count subrectangles with max - min ≤ K"],
      ["Count subrectangles with ones ≤ K"],
      ["Largest arithmetic subrectangle"],
      ["Count all-zero subrectangles"],
      ["Count squares with exactly K stripes"],
      ["Largest subrectangle with zero perimeter"],
      ["Maximal Rectangle (all 1s)"],
      ["Count Square Submatrices with All Ones"],
    ]
  },
  {
    id: 23, title: "Greedy / Two-Pass / Constructive",
    problems: [
      ["Construct sequence with diff constraints (two-pass)"],
      ["Maximum Building Height", "LC 1840"],
      ["Candy", "LC 135"],
      ["Trapping Rain Water", "LC 42"],
      ["Partition Array into Disjoint Intervals", "LC 915"],
      ["Max Chunks To Make Sorted", "LC 769"],
    ]
  },
  {
    id: 24, title: "Monotonic Stack — Basic (NGE / NSE)",
    problems: [
      ["Next Greater Element"],
      ["Next Greater Element II (circular)"],
      ["Next Smaller Element"],
      ["Number of Greater Elements to the Right"],
      ["Daily Temperatures", "LC 739"],
      ["Maximum Width Ramp", "LC 962"],
      ["Number of Visible People in a Queue", "LC 1944"],
      ["Stock Span Problem"],
    ]
  },
  {
    id: 25, title: "Monotonic Stack — Contribution / Boundary",
    problems: [
      ["Sum of Subarray Minimums", "LC 907"],
      ["Sum of Subarray Ranges", "LC 2104"],
      ["Sum of Total Strength of Wizards", "LC 2281"],
      ["Imbalanced Array", "CF 817D"],
      ["Mike and Feet", "CF 547B"],
    ]
  },
  {
    id: 26, title: "Monotonic Stack — Histogram Expansion",
    problems: [
      ["Largest Rectangle in Histogram", "LC 84"],
      ["Maximal Rectangle", "LC 85"],
      ["Trapping Rainwater (stack approach)", "LC 42"],
    ]
  },
  {
    id: 27, title: "Monotonic Stack — Greedy + Simulation",
    problems: [
      ["Asteroid Collision", "LC 735"],
      ["Remove K Digits", "LC 402"],
      ["Remove Duplicate Letters", "LC 316"],
    ]
  },
  {
    id: 28, title: "Monotonic Stack — Advanced / DP Hybrid",
    problems: [
      ["132 Pattern", "LC 456"],
      ["Steps to Make Array Non-decreasing", "LC 2289"],
      ["Beautiful Towers II", "LC 2866"],
    ]
  },
  {
    id: 29, title: "Monotonic Deque / Sliding Window Extremes",
    problems: [
      ["Sliding Window Maximum", "LC 239"],
    ]
  },
  {
    id: 30, title: "Stack / Queue Design Problems",
    problems: [
      ["Min Stack", "LC 155"],
      ["Infix → Postfix conversion"],
      ["Infix → Prefix conversion (with ^ right-associativity)"],
      ["Postfix evaluation"],
      ["LRU Cache", "LC 146"],
      ["LFU Cache", "LC 460"],
    ]
  },
  {
    id: 31, title: "Sorting Algorithms (Foundations)",
    problems: [
      ["Bubble Sort"],
      ["Selection Sort"],
      ["Insertion Sort"],
      ["Quick Sort (Hoare Partition)"],
      ["Quick Sort (Lomuto Partition)"],
      ["3-Way Quick Sort (Dutch National Flag)"],
      ["Quick Select (one-sided recursion, avg O(n))"],
      ["Merge Sort"],
    ]
  },
  {
    id: 32, title: "Quickselect / Partition-Based Problems",
    problems: [
      ["K-th Largest Element in Array"],
      ["Sort Colors (Dutch National Flag)"],
      ["Top K Frequent Elements"],
      ["Wiggle Sort II"],
      ["K Closest Points to Origin"],
      ["Sort Array with Many Duplicates"],
      ["Find Median of Unsorted Array"],
    ]
  },
  {
    id: 33, title: "Comparator-Based Sorting",
    problems: [
      ["Largest Number"],
      ["Reorder Log Files"],
      ["Custom Alphabet / Alien Dictionary Sort"],
      ["Sort Fractions by Value"],
      ["Sort Points by Polar Angle"],
      ["Job Scheduling by Profit/Time Ratio"],
      ["Contest Leaderboard Sorting"],
      ["Interval Scheduling Sort"],
      ["Sort Strings by Length"],
      ["Sort by Number of Set Bits"],
    ]
  },
  {
    id: 34, title: "Merge Sort / Merge-Technique Problems",
    problems: [
      ["Merge Two Sorted Arrays In-Place"],
      ["Merge K Sorted Linked Lists"],
      ["Merge K Sorted Arrays"],
      ["Sort Linked List using Merge Sort"],
      ["Count Inversions in Array"],
      ["Reverse Pairs (a[i] > 2 * a[j])"],
      ["Count Smaller Elements to the Right"],
      ["Intersection of Two Sorted Arrays"],
      ["Union of Two Sorted Arrays"],
      ["Common Elements in Three Sorted Arrays"],
      ["Merge Overlapping Intervals"],
      ["Maximum Simultaneous Guests (Line Sweep)"],
      ["External Merge Sort"],
      ["Merge Two BSTs into Sorted Order"],
      ["K-th Element of Two Sorted Arrays"],
    ]
  },
  {
    id: 35, title: "Tree Traversal",
    problems: [
      ["Preorder (Recursive + Iterative)"],
      ["Inorder (Recursive + Iterative)"],
      ["Postorder (Recursive + Iterative)"],
      ["Level Order (BFS)"],
      ["Morris Traversal"],
    ]
  },
  {
    id: 36, title: "LLD / Design Problems",
    problems: [
      ["Simple Bank System", "LC 2043"],
      ["Bank Account Summary", "LC 1555"],
      ["Bank Account Summary II", "LC 1587"],
      ["Design File System (hashmap + trie variants)", "LC 1166"],
      ["Design In-Memory File System (mkdir / ls / read / write)", "LC 588"],
      ["Design Underground System (active trips + route aggregation)", "LC 1396"],
      ["Search Suggestions System (sorted + binary search on prefix)", "LC 1268"],
      ["Windowed Summary System (per-user deque + rolling sums)"],
    ]
  },
  {
    id: 37, title: "Real-World / Streaming / Production-Style",
    problems: [
      ["Log Query + Aggregation (binary search on ISO timestamps)"],
      ["Rolling Window Spike Detection (deque + hashmap)"],
      ["Alert Deduplication / Spike Alert Suppression"],
      ["Top-K Errors in Last X Minutes (heap + lazy deletion)"],
      ["Memory-Constrained Sliding Windows (Count-Min Sketch, sampling)"],
      ["Out-of-Order Log Handling (watermarks, min-heap)"],
      ["High Query Throughput Optimization (prefix sums, Fenwick)"],
      ["Concurrent / Multi-threaded Log Processing"],
      ["Rate Limiter — Sliding Window (per-user deque, amortized O(1))"],
      ["Fixed Window vs Sliding Window tradeoffs"],
      ["Token Bucket / Leaky Bucket"],
      ["Per-Endpoint Rate Limits (composite keys, hierarchical)"],
      ["Distributed Rate Limiting (Redis, consistent hashing, clock skew)"],
      ["Approximate Sliding Window Rate Limiting (time buckets)"],
      ["Payment Transaction Reconciliation (TODO)"],
      ["Notification Deduplication (TODO)"],
      ["Active Users in Last X Minutes (TODO)"],
      ["Error Budget Burn Detector (TODO)"],
      ["Sessionization (TODO)"],
      ["API Latency Monitoring — rolling p95/p99 (TODO)"],
      ["Fraud Signal Aggregator (TODO)"],
      ["Inventory Change Tracker (TODO)"],
      ["Top-K Trending Items — decaying counts (TODO)"],
      ["Chat Spam Detection (TODO)"],
      ["File Access Audit Detection (TODO)"],
      ["Service Failure Propagation (TODO)"],
      ["Feature Flag Rollout Monitoring (TODO)"],
    ]
  },
  {
    id: 38, title: "OOP / Domain Modeling (Rippling-Style LLD)",
    problems: [
      ["Payroll modeling + aggregation (max/min/avg per dept)"],
      ["Project allocation (many-to-many, cost per dept, median)"],
      ["Employee attendance tracking (hours by dept, median)"],
      ["Employee performance scores (totals + medians per dept)"],
      ["Compensation band analysis (filter then aggregate)"],
    ]
  },
];

// Build a flat list with stable IDs
const ALL_PROBLEMS = [];
SECTIONS.forEach(section => {
  section.problems.forEach((p, idx) => {
    ALL_PROBLEMS.push({
      sectionId: section.id,
      sectionTitle: section.title,
      pid: `s${section.id}-p${idx}`,
      name: p[0],
      platform: p[1] || null,
    });
  });
});

const PLATFORM_COLORS = {
  LC: { bg: 'rgba(255, 161, 22, 0.12)', text: '#ffa116', border: 'rgba(255, 161, 22, 0.3)' },
  CF: { bg: 'rgba(30, 138, 211, 0.12)', text: '#5ab0e5', border: 'rgba(30, 138, 211, 0.3)' },
  CSES: { bg: 'rgba(183, 21, 64, 0.15)', text: '#e85a7c', border: 'rgba(183, 21, 64, 0.3)' },
  AtCoder: { bg: 'rgba(120, 120, 120, 0.15)', text: '#aaaaaa', border: 'rgba(120, 120, 120, 0.3)' },
  UVa: { bg: 'rgba(150, 100, 200, 0.12)', text: '#b58cd9', border: 'rgba(150, 100, 200, 0.3)' },
};

function getPlatform(tag) {
  if (!tag) return null;
  if (tag.startsWith('LC')) return 'LC';
  if (tag.startsWith('CF')) return 'CF';
  if (tag.startsWith('CSES')) return 'CSES';
  if (tag.startsWith('AtCoder')) return 'AtCoder';
  if (tag.startsWith('UVa')) return 'UVa';
  return null;
}

// =========================================================================
// COMPONENT
// =========================================================================
export default function DSATracker() {
  const [solved, setSolved] = useState(new Set());
  const [loaded, setLoaded] = useState(false);
  const [search, setSearch] = useState('');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [collapsed, setCollapsed] = useState(new Set());
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Load from storage
  useEffect(() => {
    async function load() {
      try {
        const result = await window.storage.get('dsa-cp-solved', false);
        if (result && result.value) {
          setSolved(new Set(JSON.parse(result.value)));
        }
      } catch (e) {
        // First time, no data yet
      }
      setLoaded(true);
    }
    load();
  }, []);

  // Persist on change
  const persist = async (newSet) => {
    try {
      await window.storage.set('dsa-cp-solved', JSON.stringify([...newSet]), false);
    } catch (e) {
      console.error('Storage error:', e);
    }
  };

  const toggle = (pid) => {
    const newSet = new Set(solved);
    if (newSet.has(pid)) newSet.delete(pid);
    else newSet.add(pid);
    setSolved(newSet);
    persist(newSet);
  };

  const toggleCollapse = (sid) => {
    const newSet = new Set(collapsed);
    if (newSet.has(sid)) newSet.delete(sid);
    else newSet.add(sid);
    setCollapsed(newSet);
  };

  const collapseAll = () => setCollapsed(new Set(SECTIONS.map(s => s.id)));
  const expandAll = () => setCollapsed(new Set());

  const reset = () => {
    setSolved(new Set());
    persist(new Set());
    setShowResetConfirm(false);
  };

  // Stats
  const totalProblems = ALL_PROBLEMS.length;
  const totalSolved = solved.size;
  const pct = totalProblems === 0 ? 0 : Math.round((totalSolved / totalProblems) * 100);

  // Platform counts
  const platformCounts = useMemo(() => {
    const counts = { all: ALL_PROBLEMS.length };
    ALL_PROBLEMS.forEach(p => {
      const plat = getPlatform(p.platform) || 'Other';
      counts[plat] = (counts[plat] || 0) + 1;
    });
    return counts;
  }, []);

  // Filter logic
  const filteredSections = useMemo(() => {
    const lowerSearch = search.trim().toLowerCase();
    return SECTIONS.map(section => {
      const filtered = section.problems
        .map((p, idx) => ({
          pid: `s${section.id}-p${idx}`,
          name: p[0],
          platform: p[1] || null,
        }))
        .filter(p => {
          if (lowerSearch && !p.name.toLowerCase().includes(lowerSearch) &&
              !(p.platform && p.platform.toLowerCase().includes(lowerSearch))) {
            return false;
          }
          if (platformFilter !== 'all') {
            const plat = getPlatform(p.platform) || 'Other';
            if (plat !== platformFilter) return false;
          }
          return true;
        });
      return { ...section, filteredProblems: filtered };
    }).filter(s => s.filteredProblems.length > 0);
  }, [search, platformFilter]);

  // Per-section progress
  const sectionProgress = useMemo(() => {
    const map = {};
    SECTIONS.forEach(section => {
      let count = 0;
      section.problems.forEach((_, idx) => {
        if (solved.has(`s${section.id}-p${idx}`)) count++;
      });
      map[section.id] = { solved: count, total: section.problems.length };
    });
    return map;
  }, [solved]);

  if (!loaded) {
    return (
      <div style={{
        minHeight: '100vh', background: '#0d0d0d', color: '#8b8680',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: '14px'
      }}>
        loading your progress…
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0d0d0d',
      color: '#e8e6e1',
      fontFamily: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace',
      padding: '32px 20px 80px',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=JetBrains+Mono:wght@400;500;600&display=swap');
        * { box-sizing: border-box; }
        .display { font-family: 'Fraunces', Georgia, serif; font-feature-settings: 'ss01'; letter-spacing: -0.02em; }
        .mono { font-family: 'JetBrains Mono', ui-monospace, monospace; }
        .check-input { appearance: none; -webkit-appearance: none; width: 16px; height: 16px; border: 1.5px solid #3a3a3a;
          border-radius: 3px; cursor: pointer; transition: all 160ms ease; flex-shrink: 0; background: transparent;
          position: relative; }
        .check-input:hover { border-color: #c9a45c; }
        .check-input:checked { background: #c9a45c; border-color: #c9a45c; }
        .check-input:checked::after { content: '✓'; position: absolute; top: 50%; left: 50%;
          transform: translate(-50%, -54%); color: #0d0d0d; font-size: 11px; font-weight: 700; }
        .pill { padding: 1px 7px; border-radius: 3px; font-size: 10.5px; font-weight: 600;
          font-family: 'JetBrains Mono', monospace; letter-spacing: 0.02em; }
        .section-card { background: #141414; border: 1px solid #232323; border-radius: 8px;
          margin-bottom: 12px; overflow: hidden; transition: border-color 200ms ease; }
        .section-card:hover { border-color: #2e2e2e; }
        .section-header { padding: 14px 18px; display: flex; align-items: center; justify-content: space-between;
          cursor: pointer; user-select: none; gap: 12px; }
        .section-header:hover { background: rgba(201, 164, 92, 0.03); }
        .problem-row { padding: 9px 18px 9px 42px; display: flex; align-items: center; gap: 12px;
          transition: background 120ms ease; border-top: 1px solid #1c1c1c; }
        .problem-row:hover { background: #181818; }
        .problem-row.done .name { color: #5d5a55; text-decoration: line-through;
          text-decoration-color: #3a3a3a; }
        .filter-pill { background: transparent; border: 1px solid #2a2a2a; color: #8b8680;
          padding: 5px 12px; border-radius: 16px; font-size: 11.5px; cursor: pointer; font-weight: 500;
          font-family: 'JetBrains Mono', monospace; transition: all 160ms ease; }
        .filter-pill:hover { border-color: #4a4a4a; color: #c0bdb6; }
        .filter-pill.active { background: #c9a45c; color: #0d0d0d; border-color: #c9a45c; }
        .search-input { width: 100%; background: #141414; border: 1px solid #232323; border-radius: 6px;
          color: #e8e6e1; padding: 11px 14px 11px 40px; font-size: 13.5px;
          font-family: 'JetBrains Mono', monospace; outline: none; transition: border-color 160ms ease; }
        .search-input:focus { border-color: #c9a45c; }
        .search-input::placeholder { color: #5d5a55; }
        .btn-ghost { background: transparent; border: 1px solid #2a2a2a; color: #8b8680;
          padding: 6px 12px; border-radius: 5px; cursor: pointer; font-size: 11px;
          font-family: 'JetBrains Mono', monospace; transition: all 160ms ease; font-weight: 500; }
        .btn-ghost:hover { border-color: #4a4a4a; color: #c0bdb6; }
        .progress-bar-bg { background: #1c1c1c; height: 3px; border-radius: 2px; overflow: hidden; }
        .progress-bar-fill { background: #c9a45c; height: 100%; transition: width 400ms ease; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .fade-in { animation: fadeUp 360ms ease both; }
      `}</style>

      <div style={{ maxWidth: '880px', margin: '0 auto' }}>

        {/* Header */}
        <header style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '14px', flexWrap: 'wrap' }}>
            <h1 className="display" style={{
              fontSize: '40px', fontWeight: 500, margin: 0, color: '#e8e6e1', lineHeight: 1.05,
              fontStyle: 'italic',
            }}>
              practice<span style={{ color: '#c9a45c' }}>.</span>log
            </h1>
            <span className="mono" style={{ color: '#5d5a55', fontSize: '12px' }}>
              dsa · cp · interviews
            </span>
          </div>
          <p className="mono" style={{ color: '#8b8680', fontSize: '13px', marginTop: '10px', maxWidth: '560px', lineHeight: 1.6 }}>
            Every problem you've worked through, grouped by pattern. Check them off — progress is saved locally
            and survives reloads.
          </p>
        </header>

        {/* Stats Bar */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '24px'
        }}>
          <StatCard icon={<Target size={14} />} label="solved" value={totalSolved} sub={`of ${totalProblems}`} />
          <StatCard icon={<Flame size={14} />} label="progress" value={`${pct}%`} sub="overall" />
          <StatCard icon={<Trophy size={14} />} label="sections" value={SECTIONS.length} sub="patterns" />
        </div>

        {/* Master progress */}
        <div style={{ marginBottom: '24px' }}>
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: '14px' }}>
          <Search size={15} style={{
            position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
            color: '#5d5a55', pointerEvents: 'none'
          }} />
          <input
            className="search-input"
            placeholder="search problems, platforms, sections…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Filter row */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px', alignItems: 'center' }}>
          {['all', 'LC', 'CF', 'CSES', 'AtCoder', 'UVa', 'Other'].map(p => (
            <button
              key={p}
              className={`filter-pill ${platformFilter === p ? 'active' : ''}`}
              onClick={() => setPlatformFilter(p)}
            >
              {p} <span style={{ opacity: 0.6, marginLeft: '4px' }}>{platformCounts[p] || 0}</span>
            </button>
          ))}
        </div>

        {/* Tool row */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', justifyContent: 'flex-end' }}>
          <button className="btn-ghost" onClick={expandAll}>expand all</button>
          <button className="btn-ghost" onClick={collapseAll}>collapse all</button>
          <button
            className="btn-ghost"
            style={{ color: '#d97757', borderColor: 'rgba(217, 119, 87, 0.3)' }}
            onClick={() => setShowResetConfirm(true)}
          >
            <RotateCcw size={11} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-2px' }} />
            reset
          </button>
        </div>

        {/* Reset confirm */}
        {showResetConfirm && (
          <div style={{
            background: '#1a1310', border: '1px solid #3d2520', padding: '14px 16px',
            borderRadius: '6px', marginBottom: '16px', display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap',
          }}>
            <span className="mono" style={{ fontSize: '12.5px', color: '#d4a99a' }}>
              clear all {totalSolved} checked problems? this can't be undone.
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn-ghost" onClick={() => setShowResetConfirm(false)}>cancel</button>
              <button
                className="btn-ghost"
                style={{ background: '#d97757', color: '#0d0d0d', borderColor: '#d97757', fontWeight: 600 }}
                onClick={reset}
              >
                yes, reset
              </button>
            </div>
          </div>
        )}

        {/* Sections */}
        {filteredSections.length === 0 ? (
          <div style={{
            padding: '60px 20px', textAlign: 'center', color: '#5d5a55',
            fontSize: '13px', fontFamily: 'JetBrains Mono, monospace',
          }}>
            no problems match. try a different search.
          </div>
        ) : (
          filteredSections.map((section, idx) => {
            const sp = sectionProgress[section.id];
            const sPct = sp.total === 0 ? 0 : (sp.solved / sp.total) * 100;
            const isCollapsed = collapsed.has(section.id);
            return (
              <div key={section.id} className="section-card fade-in" style={{ animationDelay: `${Math.min(idx, 10) * 30}ms` }}>
                <div className="section-header" onClick={() => toggleCollapse(section.id)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
                    <span style={{ color: '#5d5a55', flexShrink: 0 }}>
                      {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                    </span>
                    <span className="mono" style={{
                      color: '#5d5a55', fontSize: '11px', minWidth: '24px',
                    }}>
                      {String(section.id).padStart(2, '0')}
                    </span>
                    <h2 className="display" style={{
                      fontSize: '16px', fontWeight: 500, margin: 0, color: '#e8e6e1',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {section.title}
                    </h2>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0 }}>
                    <div style={{ width: '60px' }}>
                      <div className="progress-bar-bg" style={{ height: '2px' }}>
                        <div className="progress-bar-fill" style={{ width: `${sPct}%`, height: '100%' }} />
                      </div>
                    </div>
                    <span className="mono" style={{
                      color: sp.solved === sp.total && sp.total > 0 ? '#c9a45c' : '#8b8680',
                      fontSize: '11.5px', minWidth: '46px', textAlign: 'right',
                    }}>
                      {sp.solved}/{sp.total}
                    </span>
                  </div>
                </div>

                {!isCollapsed && (
                  <div>
                    {section.filteredProblems.map(p => {
                      const isDone = solved.has(p.pid);
                      const plat = getPlatform(p.platform);
                      const pc = plat && PLATFORM_COLORS[plat];
                      return (
                        <label
                          key={p.pid}
                          className={`problem-row ${isDone ? 'done' : ''}`}
                          style={{ cursor: 'pointer' }}
                        >
                          <input
                            type="checkbox"
                            className="check-input"
                            checked={isDone}
                            onChange={() => toggle(p.pid)}
                          />
                          <span className="name mono" style={{
                            color: '#d6d3cb', fontSize: '13px', flex: 1, lineHeight: 1.45,
                          }}>
                            {p.name}
                          </span>
                          {p.platform && (
                            <span
                              className="pill"
                              style={pc ? {
                                background: pc.bg, color: pc.text, border: `1px solid ${pc.border}`,
                              } : {
                                background: 'rgba(120,120,120,0.08)', color: '#8b8680',
                                border: '1px solid #2a2a2a',
                              }}
                            >
                              {p.platform}
                            </span>
                          )}
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Footer */}
        <footer style={{
          marginTop: '60px', paddingTop: '24px', borderTop: '1px solid #1c1c1c',
          textAlign: 'center', color: '#5d5a55', fontSize: '11px',
          fontFamily: 'JetBrains Mono, monospace',
        }}>
          {totalSolved === totalProblems ? (
            <span style={{ color: '#c9a45c' }}>★ all problems solved. now go invent some. ★</span>
          ) : (
            <span>keep going · {totalProblems - totalSolved} problems left</span>
          )}
        </footer>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, sub }) {
  return (
    <div style={{
      background: '#141414', border: '1px solid #232323', borderRadius: '6px',
      padding: '14px 16px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#8b8680', marginBottom: '6px' }}>
        {icon}
        <span className="mono" style={{ fontSize: '10.5px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {label}
        </span>
      </div>
      <div className="display" style={{
        fontSize: '24px', fontWeight: 500, color: '#e8e6e1', lineHeight: 1, fontStyle: 'italic',
      }}>
        {value}
      </div>
      <div className="mono" style={{ fontSize: '10.5px', color: '#5d5a55', marginTop: '4px' }}>
        {sub}
      </div>
    </div>
  );
}
