import java.util.Map;
import java.util.HashMap;
import java.util.Set;
import java.util.HashSet;
import java.util.List;
import java.util.ArrayList;

/*
 * DESIGN: LINKEDIN (hard)
 * ========================
 *
 * WHAT IT DOES:
 *   - Professional social network
 *   - Users have profiles with work experience, skills, education
 *   - Connection requests (like friend requests but professional)
 *   - Job postings by companies, job applications by users
 *   - Feed with posts, likes, comments
 *   - Messaging between connections
 *   - Search users by name, company, skill
 *   - "People you may know" recommendations (mutual connections)
 *
 * NOUNS: User/Profile, Connection, Post, Job, Company, Message, Skill, Experience
 * VERBS: connect(), post(), apply(), search(), recommend(), message()
 *
 * PATTERNS USED:
 *   - Observer → notify on new connection, job match, post from connection
 *   - Strategy → different recommendation algorithms, search ranking
 *
 * SIMPLIFY FOR PRACTICE — Focus on:
 *   1. User profiles with experience and skills
 *   2. Connection system (request → accept)
 *   3. Job posting and application
 *   4. Feed (posts from connections)
 *   Skip: messaging, notifications, recommendations
 *
 * CLASSES TO BUILD:
 *   1. User — id, name, headline, List<Experience>, List<Skill>, Set<String> connectionIds
 *   2. Experience — title, company, startDate, endDate, description
 *   3. Skill — name, endorsementCount
 *   4. Company — id, name, List<Job>
 *   5. Job — id, title, company, description, List<Skill> requirements
 *   6. Application — userId, jobId, status (APPLIED, REVIEWED, ACCEPTED, REJECTED)
 *   7. Post — id, authorId, content, timestamp, likes, comments
 *   8. LinkedInService — manages users, connections, jobs, feed
 *
 * API:
 *   service.register("alice", "Alice", "Software Engineer at Google")
 *   service.addExperience("alice", new Experience("SWE", "Google", ...))
 *   service.connect("alice", "bob")
 *   service.postJob(company, "SWE Intern", requirements)
 *   service.apply("alice", jobId)
 *   service.getFeed("bob")
 *   service.searchBySkill("java")
 */

// YOUR CODE HERE — build step by step

public class LinkedIn {
    public static void main(String[] args) {
        // TODO: Register users with profiles
        // TODO: Connect users
        // TODO: Create company, post job
        // TODO: User applies to job
        // TODO: Post content, get feed
        // TODO: Search by skill
        System.out.println("LinkedIn - implement me!");
    }
}
