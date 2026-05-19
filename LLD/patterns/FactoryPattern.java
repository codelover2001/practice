/*
 * FACTORY METHOD PATTERN
 * ======================
 * Intent: Define an interface for creating an object, but let subclasses decide 
 * which class to instantiate. Factory Method lets a class defer instantiation to subclasses.
 *
 * When to use: When you need to create objects without exposing creation logic to the client,
 * and refer to the created object using a common interface.
 * Examples: Notification (Email, SMS, Push), Vehicle (Car, Bike, Truck), Document (PDF, Word).
 *
 * Structure:
 *   - Product (interface): the thing being created
 *   - ConcreteProduct (classes): specific implementations
 *   - Creator/Factory (class/method): decides which product to create
 *
 * YOUR TASK:
 *   Build a NotificationFactory that creates Email, SMS, and Push notifications.
 *   1. Define Notification interface with send(String message) method
 *   2. Implement 3 concrete notifications: EmailNotification, SMSNotification, PushNotification
 *   3. Create NotificationFactory with a create(String type) method
 *   4. Demo in main()
 *
 * THINK ABOUT: Why is this better than `new EmailNotification()` everywhere?
 *   → Adding a new notification type means changing only the factory, not all the client code.
 *
 * BONUS: Refactor to use an enum instead of String for the type parameter.
 */

// Step 1: Define the Product interface
// YOUR CODE HERE — Notification with send(String message)


// Step 2: Implement ConcreteProducts
// YOUR CODE HERE — EmailNotification


// YOUR CODE HERE — SMSNotification


// YOUR CODE HERE — PushNotification


// Step 3: Create the Factory
// YOUR CODE HERE — NotificationFactory with static method create(String type)
//                  Returns the right Notification based on type
//                  Throws IllegalArgumentException for unknown types


// Step 4: Main class to test
public class FactoryPattern {
    public static void main(String[] args) {
        // TODO: Use factory to create each type of notification
        // TODO: Send a message through each
        // TODO: Try an invalid type — see the exception
        System.out.println("Factory Pattern - implement me!");
    }
}
