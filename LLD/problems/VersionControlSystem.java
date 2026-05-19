import java.util.Map;
import java.util.HashMap;
import java.util.List;
import java.util.ArrayList;

/*
 * DESIGN: VERSION CONTROL SYSTEM (hard)
 * =======================================
 *
 * WHAT IT DOES:
 *   - Simplified Git: track files, make commits, view history, diff, revert
 *   - NOT distributed — think of it as a local-only Git
 *
 * NOUNS: Repository, Commit, FileSnapshot, Branch
 * VERBS: init, add, commit, log, diff, revert, branch, checkout
 *
 * PATTERNS USED:
 *   - Memento  → each Commit is a snapshot (memento) of all tracked files
 *   - Command  → operations like commit/revert can be modeled as commands
 *
 * KEY DESIGN DECISIONS:
 *   1. How to store file snapshots? Map<String, String> (filename → content) per commit
 *   2. Each commit has: id, message, timestamp, snapshot, parent commit
 *   3. Staging area: files added but not yet committed
 *   4. Start simple: no branches, just linear history. Add branches as bonus.
 *
 * CLASSES TO BUILD:
 *   1. Commit — id, message, timestamp, Map<String, String> fileSnapshots, parent Commit
 *   2. Repository — staging area, commit history, current commit (HEAD)
 *
 * API:
 *   repo.init()
 *   repo.add("file.txt", "content")           → stage a file
 *   repo.commit("initial commit")              → snapshot staged files
 *   repo.log()                                 → print commit history
 *   repo.diff()                                → show changes between staging and last commit
 *   repo.revert(commitId)                      → revert to a previous commit
 *   repo.status()                              → show staged/modified files
 *
 * HINT: The "snapshot" is just a deep copy of the current file state at commit time.
 *       Don't overthink it — Map<String, String> is enough.
 */

// Step 1: Create Commit class
// Fields: String id, String message, long timestamp, Map<String, String> fileSnapshots, Commit parent
// Methods: constructor, getters, toString (for log display)
// HINT: For id, use a simple counter or first 7 chars of a hash
// YOUR CODE HERE


// Step 2: Build Repository
// Fields:
//   - Map<String, String> workingDirectory  (current file state)
//   - Map<String, String> stagingArea       (files staged for next commit)
//   - Commit head                           (latest commit, null initially)
//   - List<Commit> commitHistory            (all commits)
//   - int commitCounter                     (for generating IDs)
//
// Methods:
//   - void add(String filename, String content) → put in staging area
//   - void commit(String message)
//       → create new Commit with snapshot of (last commit files + staging area merged)
//       → clear staging area
//       → update head
//   - void log() → print all commits newest first (id, message, timestamp)
//   - void diff() → compare staging area with head commit snapshot
//   - void revert(String commitId) → find commit, restore its snapshot as working directory
//   - void status() → show what's staged vs what's in working dir
// YOUR CODE HERE


// Step 3: Main class to test
public class VersionControlSystem {
    public static void main(String[] args) {
        // TODO: Create repository
        // TODO: Add "readme.txt" with content, commit
        // TODO: Add "app.java" with content, modify "readme.txt", commit
        // TODO: View log — should show 2 commits
        // TODO: View diff after staging a change
        // TODO: Revert to first commit — "app.java" should be gone
        // TODO: View log after revert
        System.out.println("Version Control System - implement me!");
    }
}
