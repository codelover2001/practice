import java.util.HashMap;
import java.util.Map;

/*
 * DESIGN: URL SHORTENER (medium)
 * ==============================
 * 
 * WHAT IT DOES:
 *   - Takes a long URL → returns a short URL (e.g., "https://short.ly/abc123")
 *   - Takes a short URL → redirects to the original long URL
 *
 * NOUNS (entities): URLShortenerService, URL mapping
 * VERBS (actions): shorten(longUrl), resolve(shortUrl)
 *
 * PATTERNS USED:
 *   - Strategy  → for the encoding algorithm (Base62, MD5 hash, random, counter-based)
 *   - Singleton → the service itself (one instance manages all mappings)
 *
 * KEY DESIGN DECISIONS:
 *   1. How to generate the short key? (Base62 encoding of a counter is simplest)
 *   2. How to store mappings? (HashMap for both directions: short→long, long→short)
 *   3. What if the same long URL is shortened twice? (Return existing short URL)
 *
 * CLASSES TO BUILD:
 *   1. EncodingStrategy (interface) — encode(long id) → String
 *   2. Base62Encoding (class) — implements the strategy
 *   3. URLShortenerService — the main service
 *
 * API:
 *   String shorten(String longUrl)   → returns short URL
 *   String resolve(String shortUrl)  → returns long URL or null
 */

// Step 1: Define the encoding strategy interface
// YOUR CODE HERE
interface EncodingStrategy{
    String encode(long id);
}


// Step 2: Implement Base62 encoding
// HINT: Base62 uses characters: a-z, A-Z, 0-9 (62 chars total)
// HINT: Convert a number (counter) to base62 string
// YOUR CODE HERE
class Base62Encoding implements EncodingStrategy{
    @Override
    public String encode(long id) {
        return "abc";
    }
}


// Step 3: Build the URLShortenerService
// Fields:
//   - Map<String, String> shortToLong
//   - Map<String, String> longToShort  (to avoid duplicate shortenings)
//   - EncodingStrategy encoder
//   - long counter (auto-incrementing ID)
//   - String baseUrl (e.g., "https://short.ly/")
//
// Methods:
//   - String shorten(String longUrl)
//       → if already shortened, return existing
//       → otherwise: increment counter, encode it, store both mappings, return short URL
//   - String resolve(String shortUrl)
//       → look up in shortToLong, return long URL or null
// YOUR CODE HERE

class URLShortenerService{
    private Map<String, String> shortToLong; 
    private Map<String, String> longToShort; 

    private EncodingStrategy encoder;
    private long counter;
    private String baseUrl; 

    public URLShortenerService(EncodingStrategy encoder) {
        this.encoder = encoder;
        this.counter = 0;
        this.shortToLong = new HashMap<>();
        this.longToShort = new HashMap<>();
        this.baseUrl = "https://short.ly/";
    }
    public String shorten(String longUrl) {
        if(longToShort.containsKey(longUrl)){
            return longToShort.get(longUrl);
        }

        counter++;
        String shortUrl = baseUrl + encoder.encode(counter);
        shortToLong.put(shortUrl, longUrl);
        longToShort.put(longUrl, shortUrl);
        return shortUrl;
    }
    public String resolve(String shortUrl) {

        // if(shortUrl.startsWith(baseUrl)){
        //     shortUrl = shortUrl.substring(baseUrl.length());
        // }

        if(shortToLong.containsKey(shortUrl)){
            return shortToLong.get(shortUrl);
        }
        return null;
    }
}


// Step 4: Main class to test
public class URLShortener {
    public static void main(String[] args) {
        // TODO: Create service with Base62 encoding
        // TODO: Shorten 3 different URLs
        // TODO: Shorten the same URL again — should return same short URL
        // TODO: Resolve each short URL back to original
        // TODO: Try resolving a URL that doesn't exist

      // Two separate instances — two separate worlds
URLShortenerService service1 = new URLShortenerService(new Base62Encoding());
URLShortenerService service2 = new URLShortenerService(new Base62Encoding());

// service1: counter=0, shortToLong={}, longToShort={}
// service2: counter=0, shortToLong={}, longToShort={}

String short1 = service1.shorten("https://google.com");
// service1: counter=1, shortToLong={"b" → "google.com"}, longToShort={"google.com" → "b"}
// service2: counter=0, shortToLong={}, longToShort={}  ← knows NOTHING about this

String short2 = service2.shorten("https://youtube.com");
// service1: counter=1, shortToLong={"b" → "google.com"}
// service2: counter=1, shortToLong={"b" → "youtube.com"}  ← SAME KEY "b"!!

// Now someone tries to resolve "b"
service1.resolve("b");  // → "google.com"
service2.resolve("b");  // → "youtube.com"   ← WRONG! Or is it? Who's right?

// Even worse — service2 can't resolve what service1 shortened
service2.resolve(short1);  // → null!  It has no idea about google.com
    }
}
