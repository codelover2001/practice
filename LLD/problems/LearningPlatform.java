import java.util.Map;
import java.util.HashMap;
import java.util.List;
import java.util.ArrayList;

/*
 * DESIGN: LEARNING PLATFORM (medium)
 * ====================================
 *
 * WHAT IT DOES:
 *   - Instructors create Courses with Modules and Lessons
 *   - Students can enroll in courses
 *   - Track progress: which lessons completed, percentage done
 *   - Quizzes at end of modules with pass/fail
 *   - Certificate issued on course completion
 *
 * NOUNS: User (Student/Instructor), Course, Module, Lesson, Quiz, Enrollment, Certificate
 * VERBS: createCourse(), enroll(), completeLesson(), takeQuiz(), getCertificate()
 *
 * PATTERNS USED:
 *   - Observer → notify student when new lesson is added to enrolled course
 *   - Strategy → different quiz grading strategies (pass/fail, percentage, weighted)
 *   - State → enrollment status (ACTIVE, COMPLETED, DROPPED)
 *
 * KEY DESIGN DECISIONS:
 *   1. Course has Modules, Modules have Lessons — tree structure (but simpler than file system)
 *   2. Enrollment tracks per-student progress: Set<String> completedLessonIds
 *   3. Progress = completedLessons.size() / totalLessons * 100
 *
 * CLASSES TO BUILD:
 *   1. User — id, name, role (STUDENT/INSTRUCTOR)
 *   2. Lesson — id, title, content, duration
 *   3. Quiz — id, questions (Map<String, String[]> question→options), answers, passingScore
 *   4. Module — id, title, List<Lesson>, Quiz (optional)
 *   5. Course — id, title, instructor, List<Module>, description
 *   6. Enrollment — student, course, completedLessons (Set), status, enrolledDate
 *   7. LearningPlatformService — manages everything
 *
 * API:
 *   service.createCourse("instructor1", "Java Basics", modules)
 *   service.enroll("student1", "courseId")
 *   service.completeLesson("student1", "courseId", "lessonId")
 *   service.getProgress("student1", "courseId")  → 75%
 *   service.takeQuiz("student1", "quizId", answers)  → PASS/FAIL
 */

// Step 1: Create Role enum — STUDENT, INSTRUCTOR
// YOUR CODE HERE


// Step 2: Create User, Lesson, Module, Course classes
// YOUR CODE HERE


// Step 3: Create EnrollmentStatus enum — ACTIVE, COMPLETED, DROPPED
// YOUR CODE HERE


// Step 4: Create Enrollment class
// Fields: String studentId, String courseId, Set<String> completedLessonIds, EnrollmentStatus status
// Methods: completeLesson(), getProgress(), isComplete()
// YOUR CODE HERE


// Step 5: Build LearningPlatformService
// YOUR CODE HERE


// Step 6: Main class to test
public class LearningPlatform {
    public static void main(String[] args) {
        // TODO: Create instructor and students
        // TODO: Instructor creates course with 2 modules, 3 lessons each
        // TODO: Student enrolls
        // TODO: Student completes 4/6 lessons → 66% progress
        // TODO: Student completes all → 100% → COMPLETED status
        System.out.println("Learning Platform - implement me!");
    }
}
