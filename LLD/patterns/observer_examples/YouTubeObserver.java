import java.util.ArrayList;
import java.util.List;

interface Subscriber {
    void onNewVideo(String channelName, String videoTitle);
}

interface Channel {
    void subscribe(Subscriber s);
    void unsubscribe(Subscriber s);
    void notifySubscribers(String videoTitle);
}

class YouTubeChannel implements Channel {
    private String name;
    private List<Subscriber> subscribers = new ArrayList<>();

    YouTubeChannel(String name) {
        this.name = name;
    }

    @Override
    public void subscribe(Subscriber s) {
        subscribers.add(s);
    }

    @Override
    public void unsubscribe(Subscriber s) {
        subscribers.remove(s);
    }

    @Override
    public void notifySubscribers(String videoTitle) {
        for (Subscriber s : subscribers) {
            s.onNewVideo(this.name, videoTitle);
        }
    }

    public void uploadVideo(String videoTitle) {
        System.out.println(name + " uploaded: " + videoTitle);
        notifySubscribers(videoTitle);
    }
}

class User implements Subscriber {
    private String username;

    User(String username) {
        this.username = username;
    }

    @Override
    public void onNewVideo(String channelName, String videoTitle) {
        System.out.println("  " + username + " got notification: " + channelName + " posted \"" + videoTitle + "\"");
    }
}

public class YouTubeObserver {
    public static void main(String[] args) {
        YouTubeChannel techChannel = new YouTubeChannel("TechWithTim");

        User alice = new User("Alice");
        User bob = new User("Bob");
        User charlie = new User("Charlie");

        techChannel.subscribe(alice);
        techChannel.subscribe(bob);
        techChannel.subscribe(charlie);

        techChannel.uploadVideo("Observer Pattern Explained");
        // All 3 get notified

        System.out.println();
        techChannel.unsubscribe(bob);
        techChannel.uploadVideo("Strategy Pattern Deep Dive");
        // Only Alice and Charlie get notified
    }
}
