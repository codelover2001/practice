import java.util.Map;
import java.util.HashMap;
import java.util.Set;
import java.util.HashSet;
import java.util.List;
import java.util.ArrayList;

/*
 * DESIGN: SOCIAL NETWORK (medium)
 * =================================
 *
 * WHAT IT DOES:
 *   - Users can create profiles, add friends, post content
 *   - Users have a news feed showing posts from friends
 *   - Users can like/comment on posts
 *   - Privacy: posts can be PUBLIC, FRIENDS_ONLY, PRIVATE
 *
 * NOUNS: User, Post, Comment, FriendRequest, NewsFeed
 * VERBS: sendFriendRequest(), acceptRequest(), createPost(), like(), comment(), getNewsFeed()
 *
 * PATTERNS USED:
 *   - Observer → notify user when friend posts something (news feed)
 *   - Strategy → different news feed ranking algorithms (chronological, engagement-based)
 *
 * KEY DESIGN DECISIONS:
 *   1. Friendship is bidirectional — if A is friends with B, B is friends with A
 *      Store as: Set<String> friends per user
 *   2. News feed = collect posts from all friends, sort by timestamp (or ranking)
 *   3. Friend request flow: PENDING → ACCEPTED / REJECTED
 *
 * CLASSES TO BUILD:
 *   1. User — id, name, Set<String> friends, List<Post> posts
 *   2. Privacy (enum) — PUBLIC, FRIENDS_ONLY, PRIVATE
 *   3. Post — id, content, author, timestamp, List<Comment>, Set<String> likes, Privacy
 *   4. Comment — id, content, author, timestamp
 *   5. FriendRequest — from, to, status (PENDING/ACCEPTED/REJECTED)
 *   6. SocialNetworkService — manages users, posts, friend requests, news feed
 *
 * API:
 *   service.register("alice", "Alice")
 *   service.sendFriendRequest("alice", "bob")
 *   service.acceptFriendRequest("alice", "bob")
 *   service.createPost("alice", "Hello world!", Privacy.PUBLIC)
 *   service.like("bob", postId)
 *   service.comment("bob", postId, "Nice post!")
 *   List<Post> feed = service.getNewsFeed("bob")  → Alice's posts (sorted by time)
 */

// Step 1: Create Privacy enum
// YOUR CODE HERE


// Step 2: Create User class
// Fields: String id, String name, Set<String> friendIds, List<Post> posts
// YOUR CODE HERE


// Step 3: Create Comment class
// YOUR CODE HERE


// Step 4: Create Post class
// Fields: String id, String content, String authorId, long timestamp,
//         List<Comment> comments, Set<String> likedBy, Privacy privacy
// Methods: like(userId), addComment(), getLikeCount()
// YOUR CODE HERE


// Step 5: Create FriendRequestStatus enum and FriendRequest class
// YOUR CODE HERE


// Step 6: Build SocialNetworkService
// Fields: Map<String, User> users, Map<String, Post> posts, List<FriendRequest> requests
// Methods:
//   - register(), sendFriendRequest(), acceptFriendRequest()
//   - createPost(), like(), comment()
//   - getNewsFeed(userId) → get all posts from friends, filter by privacy, sort by time
// YOUR CODE HERE


// Step 7: Main class to test
public class SocialNetwork {
    public static void main(String[] args) {
        // TODO: Register Alice, Bob, Charlie
        // TODO: Alice sends friend request to Bob, Bob accepts
        // TODO: Alice posts (FRIENDS_ONLY), Charlie posts (PUBLIC)
        // TODO: Bob's feed: sees Alice's post (friend) + Charlie's public post
        // TODO: Charlie's feed: does NOT see Alice's friends-only post
        // TODO: Bob likes Alice's post, comments on it
        System.out.println("Social Network - implement me!");
    }
}


//Entities: 
User: 
-id: String 
-name: String 
-friends: List<Friend> 

Post: 
-id: String 
-body: String 
-comments: List<Comment> 



Comment: 
-id: String 
-body: String 
-