import java.util.Map;
import java.util.HashMap;
import java.util.List;
import java.util.ArrayList;
import java.util.Collections;

/*
 * DESIGN: IN-MEMORY FILE SYSTEM (hard)
 * ======================================
 *
 * WHAT IT DOES:
 *   - Simulates a Unix-like file system entirely in memory
 *   - Supports: mkdir, touch (create file), write, read, ls, cd, rm, find
 *
 * NOUNS: FileSystem, File, Directory, Path
 * VERBS: mkdir, touch, write, read, ls, cd, rm
 *
 * PATTERNS USED:
 *   - Composite → Directory and File share a common interface (FileSystemNode)
 *                 A Directory "contains" other nodes (files and directories)
 *   - This is a TREE structure. Directory is internal node, File is leaf node.
 *
 * KEY DESIGN DECISIONS:
 *   1. FileSystemNode (abstract) — base for both File and Directory
 *   2. Directory stores Map<String, FileSystemNode> children
 *   3. File stores String content
 *   4. Path parsing: "/home/user/docs" → navigate root → home → user → docs
 *
 * CLASSES TO BUILD:
 *   1. FileSystemNode (abstract) — name, parent, isFile(), getPath()
 *   2. File extends FileSystemNode — content (String), write(), read()
 *   3. Directory extends FileSystemNode — children (Map), addChild(), getChild(), list()
 *   4. FileSystem — root directory, current directory, implements all commands
 *
 * API:
 *   fs.mkdir("/home/user")
 *   fs.touch("/home/user/notes.txt")
 *   fs.write("/home/user/notes.txt", "hello world")
 *   fs.read("/home/user/notes.txt")    → "hello world"
 *   fs.ls("/home/user")                → ["notes.txt"]
 *   fs.ls("/home")                     → ["user"]
 *
 * HINT: The hardest part is path resolution — splitting path by "/" and navigating the tree.
 *       Write a helper: FileSystemNode resolvePath(String path) that returns the node at that path.
 */

// Step 1: Create abstract FileSystemNode
// Fields: String name, Directory parent (null for root)
// Methods: getName(), getPath() (walk up parents to build full path), isFile() (abstract)
// YOUR CODE HERE


// Step 2: Create File (extends FileSystemNode)
// Fields: String content
// Methods: write(String), read(), isFile() → true
// YOUR CODE HERE


// Step 3: Create Directory (extends FileSystemNode)
// Fields: Map<String, FileSystemNode> children
// Methods: addChild(FileSystemNode), getChild(String name), list() → List<String>, isFile() → false
// YOUR CODE HERE


// Step 4: Build the FileSystem
// Fields: Directory root (name="/"), Directory currentDir
// Methods:
//   - mkdir(String path) → create directory (handle nested: "/a/b/c" creates all)
//   - touch(String path) → create empty file
//   - write(String path, String content) → write to file
//   - String read(String path) → read file content
//   - List<String> ls(String path) → list children
//
// PRIVATE HELPER:
//   - FileSystemNode resolvePath(String path)
//       → split by "/", start from root, walk children
//       → return the node at that path, or null if not found
//   - Directory resolveParent(String path)
//       → return the parent directory of the given path
//       → e.g., "/home/user/file.txt" → returns the Directory for "/home/user"
// YOUR CODE HERE


// Step 5: Main class to test
public class InMemoryFileSystem {
    public static void main(String[] args) {
        // TODO: Create FileSystem
        // TODO: mkdir("/home")
        // TODO: mkdir("/home/user")
        // TODO: touch("/home/user/notes.txt")
        // TODO: write to notes.txt
        // TODO: read from notes.txt
        // TODO: ls("/home") → should show ["user"]
        // TODO: ls("/home/user") → should show ["notes.txt"]
        // TODO: Try reading a file that doesn't exist
        System.out.println("In-Memory File System - implement me!");
    }
}
