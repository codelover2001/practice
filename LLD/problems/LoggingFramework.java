import java.util.List;
import java.util.ArrayList;
import java.time.LocalDateTime;

/*
 * DESIGN: LOGGING FRAMEWORK (medium)
 * ====================================
 *
 * WHAT IT DOES:
 *   - Log messages at different levels: DEBUG, INFO, WARN, ERROR, FATAL
 *   - Each logger has a minimum level — ignores messages below it
 *   - Logs can go to different destinations: Console, File, Database
 *
 * NOUNS: Logger, LogLevel, LogMessage, LogDestination/Appender
 * VERBS: log(level, message), addAppender(), setLevel()
 *
 * PATTERNS USED:
 *   - Chain of Responsibility → log levels filter messages up the chain
 *   - Strategy / Observer     → multiple appenders (console, file) receive the same log
 *   - Singleton               → global logger instance
 *
 * KEY DESIGN DECISIONS:
 *   1. LogLevel as enum with ordinal comparison (DEBUG < INFO < WARN < ERROR < FATAL)
 *   2. Appender/Sink interface — easy to add new destinations without changing Logger
 *   3. Logger filters by level, then forwards to all appenders
 *
 * CLASSES TO BUILD:
 *   1. LogLevel (enum) — DEBUG, INFO, WARN, ERROR, FATAL
 *   2. LogMessage (class) — level, message, timestamp
 *   3. LogAppender (interface) — append(LogMessage)
 *   4. ConsoleAppender, FileAppender — concrete appenders
 *   5. Logger (class) — the main logger with level filtering + appender list
 *
 * API:
 *   Logger.getInstance()
 *   logger.setLevel(LogLevel.INFO)
 *   logger.addAppender(new ConsoleAppender())
 *   logger.debug("message")  → ignored if level > DEBUG
 *   logger.info("message")   → logged
 *   logger.error("message")  → logged
 */

// Step 1: Define LogLevel enum
// HINT: Enum order matters — earlier = lower priority
// YOUR CODE HERE
public enum LogLevel{
    DEBUG,
    INFO,
    WARN,
    ERROR,
    FATAL
}


// Step 2: Create LogMessage class
// Fields: LogLevel level, String message, LocalDateTime timestamp
// YOUR CODE HERE

class LogMessage{
    private LogLevel level;
    private String message;
    private LocalDateTime timestamp;
    public LogMessage(LogLevel level, String message) {
        this.level = level;
        this.message = message;
        this.timestamp = LocalDateTime.now();
    }
    public LogLevel getLevel() {
        return level;
    }
    public String getMessage() {
        return message;
    }
    public LocalDateTime getTimestamp() {
        return timestamp;
    }

}


// Step 3: Define LogAppender interface
// YOUR CODE HERE — single method: append(LogMessage)

interface LogAppender{
    void append(LogMessage message);
}


// Step 4: Implement ConsoleAppender
// Prints: [LEVEL] timestamp - message
// YOUR CODE HERE
class ConsoleAppender implements LogAppender{
    @Override
    public void append(LogMessage message) {
        System.out.println("[Console] " + message.getTimestamp() + " - " + message.getLevel() + " - " + message.getMessage());
    }
}

// Step 5: Implement FileAppender (simulated — just print with a [FILE] prefix)
// In a real system this writes to a file. For practice, print to console with a prefix.
// YOUR CODE HERE
class FileAppender implements LogAppender{
    @Override
    public void append(LogMessage message) {
        System.out.println("[File] " + message.getTimestamp() + " - " + message.getLevel() + " - " + message.getMessage());
    }
}

// Step 6: Build the Logger (Singleton)
// Fields: LogLevel minLevel, List<LogAppender> appenders
// Methods:
//   - static getInstance()
//   - setLevel(LogLevel)
//   - addAppender(LogAppender)
//   - log(LogLevel, String message) → skip if level < minLevel, else forward to all appenders
//   - Convenience methods: debug(), info(), warn(), error(), fatal()
// YOUR CODE HERE
class Logger{
    private static Logger instance; 

    private LogLevel minLevel;
    private List<LogAppender> appenders;
    private Logger() {
        this.minLevel = LogLevel.DEBUG;
        this.appenders = new ArrayList<>();
    }
    public static Logger getInstance() {
        if (instance == null) {
            instance = new Logger();  // created only once, first time it's requested
        }

        return instance;
    }

    public void setLevel(LogLevel level){
        this.minLevel = level;
    }
    public void addAppender(LogAppender appender){
        this.appenders.add(appender);
    }
    public void log(LogLevel level, String message){
        if(level.ordinal() < minLevel.ordinal()){
            return;
        }
        LogMessage logMessage = new LogMessage(level, message);
        for(LogAppender appender : appenders){
            appender.append(logMessage);
        }
    }
    public void debug(String message){
        log(LogLevel.DEBUG, message);
    }
    public void info(String message){
        log(LogLevel.INFO, message);
    }
    public void warn(String message){
        log(LogLevel.WARN, message);
    }
    public void error(String message){
        log(LogLevel.ERROR, message);
    }
    public void fatal(String message){
        log(LogLevel.FATAL, message);
    }
}

// Step 7: Main class to test
public class LoggingFramework {
    public static void main(String[] args) {
        // TODO: Get logger instance (singleton)
        // TODO: Set level to INFO
        // TODO: Add ConsoleAppender and FileAppender
        // TODO: Log at DEBUG level → should be IGNORED
        // TODO: Log at INFO level → should appear in both appenders
        // TODO: Log at ERROR level → should appear in both appenders
        // TODO: Change level to ERROR, log at WARN → should be ignored

        Logger logger = Logger.getInstance();
        logger.setLevel(LogLevel.INFO);
        logger.addAppender(new ConsoleAppender());
        logger.addAppender(new FileAppender());
        logger.debug("This is a debug message");
        logger.info("This is an info message");
        logger.error("This is an error message");
        logger.warn("This is a warn message");
        logger.fatal("This is a fatal message");
        System.out.println("Logging Framework - implement me!");
    }
}
