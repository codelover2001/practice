import java.util.Map;
import java.util.HashMap;
import java.util.List;
import java.util.ArrayList;

// ==================== ENUMS ====================

enum VoteType { UPVOTE, DOWNVOTE }

// ==================== ENTITY CLASSES ====================

class Tag {
    private String name;

    Tag(String name) { this.name = name; }

    String getName() { return name; }
}

class User {
    private String id;
    private String name;
    private int reputation;

    User(String id, String name) {
        this.id = id;
        this.name = name;
        this.reputation = 0;
    }

    String getId() { return id; }
    String getName() { return name; }
    int getReputation() { return reputation; }

    void addReputation(int points) { this.reputation += points; }
}

class Comment {
    private String id;
    private String content;
    private User author;
    private long timestamp;

    Comment(String id, String content, User author) {
        this.id = id;
        this.content = content;
        this.author = author;
        this.timestamp = System.currentTimeMillis();
    }

    String getId() { return id; }
    String getContent() { return content; }
    User getAuthor() { return author; }
}

class Answer {
    private String id;
    private String body;
    private User author;
    private List<Comment> comments;
    private int voteCount;
    private boolean isAccepted;

    Answer(String id, String body, User author) {
        this.id = id;
        this.body = body;
        this.author = author;
        this.comments = new ArrayList<>();
        this.voteCount = 0;
        this.isAccepted = false;
    }

    String getId() { return id; }
    String getBody() { return body; }
    User getAuthor() { return author; }
    int getVoteCount() { return voteCount; }
    boolean isAccepted() { return isAccepted; }
    List<Comment> getComments() { return comments; }

    void addComment(Comment comment) {
        comments.add(comment);
    }

    void vote(VoteType type) {
        if (type == VoteType.UPVOTE) {
            voteCount++;
            author.addReputation(15);
        } else {
            voteCount--;
            author.addReputation(-2);
        }
    }

    void markAccepted() {
        this.isAccepted = true;
        author.addReputation(25);
    }
}

class Question {
    private String id;
    private String title;
    private String body;
    private User author;
    private List<Answer> answers;
    private List<Comment> comments;
    private List<Tag> tags;
    private int voteCount;
    private Answer acceptedAnswer;

    Question(String id, String title, String body, User author, List<Tag> tags) {
        this.id = id;
        this.title = title;
        this.body = body;
        this.author = author;
        this.tags = tags;
        this.answers = new ArrayList<>();
        this.comments = new ArrayList<>();
        this.voteCount = 0;
        this.acceptedAnswer = null;
    }

    String getId() { return id; }
    String getTitle() { return title; }
    String getBody() { return body; }
    User getAuthor() { return author; }
    List<Answer> getAnswers() { return answers; }
    List<Comment> getComments() { return comments; }
    List<Tag> getTags() { return tags; }
    int getVoteCount() { return voteCount; }
    Answer getAcceptedAnswer() { return acceptedAnswer; }

    void addAnswer(Answer answer) {
        answers.add(answer);
    }

    void addComment(Comment comment) {
        comments.add(comment);
    }

    void vote(VoteType type) {
        if (type == VoteType.UPVOTE) {
            voteCount++;
            author.addReputation(10);
        } else {
            voteCount--;
            author.addReputation(-2);
        }
    }

    void acceptAnswer(Answer answer, User requester) {
        if (!requester.getId().equals(author.getId())) {
            throw new RuntimeException("Only the question author can accept an answer");
        }
        if (acceptedAnswer != null) {
            throw new RuntimeException("An answer is already accepted");
        }
        this.acceptedAnswer = answer;
        answer.markAccepted();
    }

    boolean hasTag(String tagName) {
        for (Tag tag : tags) {
            if (tag.getName().equalsIgnoreCase(tagName)) {
                return true;
            }
        }
        return false;
    }
}

// ==================== SERVICE CLASS ====================
//
// THE SERVICE IS A THIN COORDINATOR. It holds:
//   1. Lookup maps (find entity by ID)
//   2. An ID counter (generate unique IDs)
//
// It does NOT hold voteCount, acceptedAnswer, comments, etc.
// Those belong to the entities themselves.
//
// Every method follows the same 3-step pattern:
//   1. LOOKUP — find the entities by ID
//   2. VALIDATE — check permissions, check existence
//   3. DELEGATE — call a method on the entity

class StackOverflowService {
    private Map<String, User> users;
    private Map<String, Question> questions;
    private Map<String, Answer> answers;
    private int idCounter;

    StackOverflowService() {
        this.users = new HashMap<>();
        this.questions = new HashMap<>();
        this.answers = new HashMap<>();
        this.idCounter = 0;
    }

    private String generateId() {
        return "ID-" + (++idCounter);
    }

    // ---- 1. REGISTER USER ----
    // Lookup: none  |  Validate: user doesn't already exist  |  Delegate: none (just store)
    User registerUser(String userId, String name) {
        if(users.containsKey(userId)){
            throw new RuntimeException("User already exists: " + userId);
        }
        User user = new User(userId, name);
        users.put(userId, user);
        return user;
    }

    // ---- 2. POST QUESTION ----
    // Lookup: user  |  Validate: user exists  |  Delegate: none (create and store)
    Question postQuestion(String userId, String title, String body, List<String> tagNames) {
        User user = getUser(userId);

        List<Tag> tags = new ArrayList<>();
        for (String tagName : tagNames) {
            tags.add(new Tag(tagName));
        }

        Question question = new Question(generateId(), title, body, user, tags);
        questions.put(question.getId(), question);
        return question;
    }

    // ---- 3. POST ANSWER ----
    // Lookup: user + question  |  Validate: both exist  |  Delegate: question.addAnswer()
    Answer postAnswer(String userId, String questionId, String body) {
        User user = getUser(userId);
        Question question = getQuestion(questionId);

        Answer answer = new Answer(generateId(), body, user);
        question.addAnswer(answer);
        answers.put(answer.getId(), answer);
        return answer;
    }

    // ---- 4. COMMENT ON QUESTION ----
    // Lookup: user + question  |  Validate: both exist  |  Delegate: question.addComment()
    Comment commentOnQuestion(String userId, String questionId, String content) {
        User user = getUser(userId);
        Question question = getQuestion(questionId);

        Comment comment = new Comment(generateId(), content, user);
        question.addComment(comment);
        return comment;
    }

    // ---- 5. COMMENT ON ANSWER ----
    // Lookup: user + answer  |  Validate: both exist  |  Delegate: answer.addComment()
    Comment commentOnAnswer(String userId, String answerId, String content) {
        User user = getUser(userId);
        Answer answer = getAnswer(answerId);

        Comment comment = new Comment(generateId(), content, user);
        answer.addComment(comment);
        return comment;
    }

    // ---- 6. VOTE ON QUESTION ----
    // Lookup: question  |  Validate: exists  |  Delegate: question.vote()
    void voteOnQuestion(String questionId, String voterId, VoteType type) {
        getUser(voterId);
        Question question = getQuestion(questionId);
        question.vote(type);
    }

    // ---- 7. VOTE ON ANSWER ----
    // Lookup: answer  |  Validate: exists  |  Delegate: answer.vote()
    void voteOnAnswer(String answerId, String voterId, VoteType type) {
        getUser(voterId);
        Answer answer = getAnswer(answerId);
        answer.vote(type);
    }

    // ---- 8. ACCEPT ANSWER ----
    // Lookup: user + question + answer  |  Validate: user is author  |  Delegate: question.acceptAnswer()
    void acceptAnswer(String questionId, String answerId, String userId) {
        User user = getUser(userId);
        Question question = getQuestion(questionId);
        Answer answer = getAnswer(answerId);
        question.acceptAnswer(answer, user);
    }

    // ---- 9. SEARCH BY TAG ----
    // Lookup: scan all questions  |  Validate: none  |  Delegate: question.hasTag()
    List<Question> searchByTag(String tagName) {
        List<Question> result = new ArrayList<>();
        for (Question q : questions.values()) {
            if (q.hasTag(tagName)) {
                result.add(q);
            }
        }
        return result;
    }

    // ---- 10. SEARCH BY KEYWORD ----
    List<Question> searchByKeyword(String keyword) {
        List<Question> result = new ArrayList<>();
        String lowerKeyword = keyword.toLowerCase();
        for (Question q : questions.values()) {
            if (q.getTitle().toLowerCase().contains(lowerKeyword)
                    || q.getBody().toLowerCase().contains(lowerKeyword)) {
                result.add(q);
            }
        }
        return result;
    }

    // ---- PRIVATE HELPERS ----
    // These exist so every method doesn't repeat the "lookup + null check" logic

    private User getUser(String userId) {
        User user = users.get(userId);
        if (user == null) throw new RuntimeException("User not found: " + userId);
        return user;
    }

    private Question getQuestion(String questionId) {
        Question q = questions.get(questionId);
        if (q == null) throw new RuntimeException("Question not found: " + questionId);
        return q;
    }

    private Answer getAnswer(String answerId) {
        Answer a = answers.get(answerId);
        if (a == null) throw new RuntimeException("Answer not found: " + answerId);
        return a;
    }
}

// ==================== MAIN — TEST IT ====================

public class StackOverflow {
    public static void main(String[] args) {
        StackOverflowService service = new StackOverflowService();

        // Register users
        service.registerUser("alice", "Alice");
        service.registerUser("bob", "Bob");
        service.registerUser("charlie", "Charlie");

        // Alice posts a question
        Question q = service.postQuestion("alice",
                "How does HashMap work in Java?",
                "I want to understand the internal implementation of HashMap...",
                List.of("java", "collections", "hashmap"));
        System.out.println("Question posted: " + q.getTitle() + " [id=" + q.getId() + "]");

        // Bob and Charlie answer
        Answer bobAnswer = service.postAnswer("bob", q.getId(),
                "HashMap uses an array of linked lists. Keys are hashed to find the bucket index...");
        Answer charlieAnswer = service.postAnswer("charlie", q.getId(),
                "It's basically a hash table with separate chaining for collision resolution...");
        System.out.println("Bob answered [id=" + bobAnswer.getId() + "]");
        System.out.println("Charlie answered [id=" + charlieAnswer.getId() + "]");

        // Charlie upvotes the question (+10 to Alice)
        service.voteOnQuestion(q.getId(), "charlie", VoteType.UPVOTE);

        // Alice upvotes Bob's answer (+15 to Bob)
        service.voteOnAnswer(bobAnswer.getId(), "alice", VoteType.UPVOTE);

        // Alice downvotes Charlie's answer (-2 to Charlie)
        service.voteOnAnswer(charlieAnswer.getId(), "alice", VoteType.DOWNVOTE);

        // Alice comments on Bob's answer
        service.commentOnAnswer("alice", bobAnswer.getId(), "Great explanation, thanks!");

        // Alice accepts Bob's answer (+25 to Bob)
        service.acceptAnswer(q.getId(), bobAnswer.getId(), "alice");

        // Search by tag
        List<Question> javaQuestions = service.searchByTag("java");
        System.out.println("\nSearch results for 'java': " + javaQuestions.size() + " question(s)");
        for (Question found : javaQuestions) {
            System.out.println("  → " + found.getTitle());
        }

        // Print question details
        System.out.println("\n=== Question Details ===");
        System.out.println("Title: " + q.getTitle());
        System.out.println("Votes: " + q.getVoteCount());
        System.out.println("Answers: " + q.getAnswers().size());
        System.out.println("Accepted answer by: " +
                (q.getAcceptedAnswer() != null ? q.getAcceptedAnswer().getAuthor().getName() : "none"));

        for (Answer a : q.getAnswers()) {
            System.out.println("\n  Answer by " + a.getAuthor().getName()
                    + " | Votes: " + a.getVoteCount()
                    + " | Accepted: " + a.isAccepted());
            for (Comment c : a.getComments()) {
                System.out.println("    Comment by " + c.getAuthor().getName() + ": " + c.getContent());
            }
        }

        // Reputation check
        // Alice: +10 (question upvoted) = 10
        // Bob: +15 (answer upvoted) + 25 (answer accepted) = 40
        // Charlie: -2 (answer downvoted) = -2
        System.out.println("\n=== Reputation ===");
        System.out.println("Alice: " + service.searchByTag("java").get(0).getAuthor().getReputation());

        // Can't access users directly — that's by design (encapsulation)
        // In a real app, you'd have a getUser() public method
    }
}
