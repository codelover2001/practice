import java.util.ArrayList;
import java.util.List;

interface Bidder {
    void onNewBid(String item, String bidderName, double amount);
    String getName();
}

class Auction {
    private String item;
    private List<Bidder> bidders = new ArrayList<>();
    private double currentBid = 0;
    private String currentWinner = "none";

    Auction(String item) {
        this.item = item;
    }

    void joinAuction(Bidder bidder) {
        bidders.add(bidder);
        System.out.println(bidder.getName() + " joined auction for " + item);
    }

    void leaveAuction(Bidder bidder) {
        bidders.remove(bidder);
    }

    void placeBid(Bidder bidder, double amount) {
        if (amount <= currentBid) {
            System.out.println("Bid rejected: " + amount + " is not higher than current " + currentBid);
            return;
        }
        currentBid = amount;
        currentWinner = bidder.getName();
        System.out.println("\n" + bidder.getName() + " bids $" + amount + " on " + item);

        for (Bidder b : bidders) {
            if (b != bidder) {
                b.onNewBid(item, bidder.getName(), amount);
            }
        }
    }

    void closeAuction() {
        System.out.println("\nAuction closed! " + item + " sold to " + currentWinner + " for $" + currentBid);
    }
}

class Person implements Bidder {
    private String name;

    Person(String name) {
        this.name = name;
    }

    @Override
    public String getName() {
        return name;
    }

    @Override
    public void onNewBid(String item, String bidderName, double amount) {
        System.out.println("  " + name + " sees: " + bidderName + " bid $" + amount + " on " + item);
    }
}

public class AuctionObserver {
    public static void main(String[] args) {
        Auction auction = new Auction("Vintage Watch");

        Person alice = new Person("Alice");
        Person bob = new Person("Bob");
        Person charlie = new Person("Charlie");

        auction.joinAuction(alice);
        auction.joinAuction(bob);
        auction.joinAuction(charlie);

        auction.placeBid(alice, 100);
        auction.placeBid(bob, 150);
        auction.placeBid(charlie, 200);
        auction.placeBid(alice, 180);   // rejected — lower than current

        auction.closeAuction();
    }
}
