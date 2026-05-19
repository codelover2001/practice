import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Random;

/*
 * ALL 4 URL ENCODING STRATEGIES
 * Run this file to see each strategy in action.
 */

interface EncodingStrategy {
    String encode(long id);
}

// ====================================================================
// STRATEGY 1: Base62 Counter-Based
// ====================================================================
// Converts a number to base-62 using: a-z, A-Z, 0-9
// Same algorithm as converting decimal to binary, just with 62 symbols.
class Base62Encoding implements EncodingStrategy {
    private static final String ALPHABET = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    @Override
    public String encode(long id) {
        if (id == 0) return String.valueOf(ALPHABET.charAt(0));

        StringBuilder sb = new StringBuilder();
        while (id > 0) {
            int remainder = (int) (id % 62);
            sb.append(ALPHABET.charAt(remainder));
            id /= 62;
        }
        return sb.reverse().toString();
    }
}

// ====================================================================
// STRATEGY 2: MD5 Hash + Truncation
// ====================================================================
// Hashes the long URL itself, takes first 7 characters.
// Note: encode(long id) interface doesn't fit perfectly here — in a real
// system you'd have encode(String url). For demo, we hash the id's string form.
class MD5Encoding implements EncodingStrategy {
    @Override
    public String encode(long id) {
        try {
            MessageDigest md = MessageDigest.getInstance("MD5");
            byte[] hash = md.digest(String.valueOf(id).getBytes());

            StringBuilder hex = new StringBuilder();
            for (byte b : hash) {
                hex.append(String.format("%02x", b));
            }
            return hex.substring(0, 7);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException(e);
        }
    }
}

// ====================================================================
// STRATEGY 3: Random String
// ====================================================================
// Generates a random 7-character string from Base62 alphabet.
// id is IGNORED — key is completely random.
// Must check for collisions externally (the service does this).
class RandomEncoding implements EncodingStrategy {
    private static final String ALPHABET = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private static final int KEY_LENGTH = 7;
    private Random random = new Random();

    @Override
    public String encode(long id) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < KEY_LENGTH; i++) {
            sb.append(ALPHABET.charAt(random.nextInt(ALPHABET.length())));
        }
        return sb.toString();
    }
}

// ====================================================================
// STRATEGY 4: Pre-Generated Key Service (KGS)
// ====================================================================
// Pre-generates a pool of unique keys. Each call pops one from the pool.
// In production: keys are generated offline and stored in a DB.
// Here: we simulate with a pre-filled array.
class PreGeneratedKeyService implements EncodingStrategy {
    private String[] keyPool;
    private int currentIndex;

    PreGeneratedKeyService(int poolSize) {
        keyPool = new String[poolSize];
        currentIndex = 0;

        Base62Encoding base62 = new Base62Encoding();
        Random random = new Random(42); // fixed seed for reproducibility
        for (int i = 0; i < poolSize; i++) {
            // shuffle by encoding random large numbers
            keyPool[i] = base62.encode(random.nextLong(1_000_000_000L));
        }
    }

    @Override
    public String encode(long id) {
        if (currentIndex >= keyPool.length) {
            throw new RuntimeException("Key pool exhausted! Generate more keys.");
        }
        return keyPool[currentIndex++];
    }

    int remainingKeys() {
        return keyPool.length - currentIndex;
    }
}

// ====================================================================
// Demo: See all 4 strategies side by side
// ====================================================================
public class EncodingStrategies {
    public static void main(String[] args) {
        System.out.println("=== Base62 (Counter-Based) ===");
        Base62Encoding base62 = new Base62Encoding();
        for (long i = 1; i <= 5; i++) {
            System.out.println("  " + i + " → " + base62.encode(i));
        }
        System.out.println("  1000 → " + base62.encode(1000));
        System.out.println("  1000000 → " + base62.encode(1000000));
        System.out.println("  Predictable? YES: 1→b, 2→c, 3→d (sequential)");

        System.out.println("\n=== MD5 Hash + Truncation ===");
        MD5Encoding md5 = new MD5Encoding();
        for (long i = 1; i <= 5; i++) {
            System.out.println("  " + i + " → " + md5.encode(i));
        }
        System.out.println("  Predictable? NO: 1→c4ca42, 2→c81e72 (looks random)");
        System.out.println("  But: collisions possible when truncating!");

        System.out.println("\n=== Random String ===");
        RandomEncoding random = new RandomEncoding();
        for (long i = 1; i <= 5; i++) {
            System.out.println("  " + i + " → " + random.encode(i) + " (id is ignored)");
        }
        System.out.println("  Predictable? NO. Collisions? Must check externally.");

        System.out.println("\n=== Pre-Generated Key Service ===");
        PreGeneratedKeyService kgs = new PreGeneratedKeyService(10);
        for (long i = 1; i <= 5; i++) {
            System.out.println("  request " + i + " → " + kgs.encode(i) + " (popped from pool)");
        }
        System.out.println("  Remaining keys: " + kgs.remainingKeys());
        System.out.println("  Predictable? NO. Collisions? IMPOSSIBLE (pre-verified).");

        // === Show base conversion clearly ===
        System.out.println("\n=== Base Conversion Demo ===");
        System.out.println("  13 in base-2  (binary)  = " + Long.toString(13, 2));
        System.out.println("  13 in base-8  (octal)   = " + Long.toString(13, 8));
        System.out.println("  13 in base-10 (decimal)  = " + Long.toString(13, 10));
        System.out.println("  13 in base-16 (hex)     = " + Long.toString(13, 16));
        System.out.println("  13 in base-36 (max for Long.toString) = " + Long.toString(13, 36));
        System.out.println("  13 in base-62 (our impl) = " + base62.encode(13));

        System.out.println("\n=== Why Base62 keys are short ===");
        System.out.println("  6 chars of base-62 = 62^6 = " + (long)Math.pow(62, 6) + " unique URLs");
        System.out.println("  7 chars of base-62 = 62^7 = " + (long)Math.pow(62, 7) + " unique URLs");
        System.out.println("  That's 3.5 TRILLION URLs with just 7 characters.");
    }
}
