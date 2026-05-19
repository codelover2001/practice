import java.util.ArrayList;
import java.util.List;

interface WeatherDisplay {
    void onWeatherUpdate(double temperature, double humidity);
}

class WeatherStation {
    private List<WeatherDisplay> displays = new ArrayList<>();
    private double temperature;
    private double humidity;

    void addDisplay(WeatherDisplay display) {
        displays.add(display);
    }

    void removeDisplay(WeatherDisplay display) {
        displays.remove(display);
    }

    void setMeasurements(double temperature, double humidity) {
        this.temperature = temperature;
        this.humidity = humidity;
        for (WeatherDisplay display : displays) {
            display.onWeatherUpdate(temperature, humidity);
        }
    }
}

class PhoneDisplay implements WeatherDisplay {
    private String ownerName;

    PhoneDisplay(String ownerName) {
        this.ownerName = ownerName;
    }

    @Override
    public void onWeatherUpdate(double temperature, double humidity) {
        System.out.println("[Phone - " + ownerName + "] Temp: " + temperature + "°C, Humidity: " + humidity + "%");
    }
}

class TVDisplay implements WeatherDisplay {
    @Override
    public void onWeatherUpdate(double temperature, double humidity) {
        String feel = temperature > 35 ? "HOT" : temperature < 15 ? "COLD" : "Pleasant";
        System.out.println("[TV] Weather is " + feel + " (" + temperature + "°C)");
    }
}

class LoggerDisplay implements WeatherDisplay {
    @Override
    public void onWeatherUpdate(double temperature, double humidity) {
        System.out.println("[LOG] " + System.currentTimeMillis() + " | temp=" + temperature + " humidity=" + humidity);
    }
}

public class WeatherObserver {
    public static void main(String[] args) {
        WeatherStation station = new WeatherStation();

        PhoneDisplay phone = new PhoneDisplay("Rahul");
        TVDisplay tv = new TVDisplay();
        LoggerDisplay logger = new LoggerDisplay();

        station.addDisplay(phone);
        station.addDisplay(tv);
        station.addDisplay(logger);

        System.out.println("--- Morning reading ---");
        station.setMeasurements(22.5, 65);

        System.out.println("\n--- Afternoon reading ---");
        station.setMeasurements(38.0, 40);

        System.out.println("\n--- Remove TV, evening reading ---");
        station.removeDisplay(tv);
        station.setMeasurements(19.0, 72);
    }
}
