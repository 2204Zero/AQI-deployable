#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <DHT.h>
#include <WiFi.h>
#include <HTTPClient.h>

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET    -1
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

#define DHTPIN 4
#define DHTTYPE DHT22
DHT dht(DHTPIN, DHTTYPE);

#define BUZZER_PIN 5
#define MQ135_ANALOG 33
#define MQ135_DIGITAL 32
#define DSM501_PM25 34
#define DSM501_PM10 35

int MQ135_THRESHOLD = 2000;
int DUST_THRESHOLD  = 2000;

// 👇 Change these 3 lines only 👇
const char* ssid = "Zero";
const char* password = "zero123456";
const char* serverName = "https://aqi-deployable.onrender.com/esp32/readings"; // your PC IPv4 address

void setup() {
  Serial.begin(115200);
  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, HIGH);
  dht.begin();

  // OLED
  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println("SSD1306 allocation failed");
    for(;;);
  }

  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(0,0);
  display.println("Connecting WiFi...");
  display.display();

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\n✅ WiFi connected!");
  Serial.println(WiFi.localIP());

  display.clearDisplay();
  display.setCursor(0,0);
  display.println("WiFi Connected!");
  display.display();
}

void loop() {
  float temp = dht.readTemperature();
  float hum = dht.readHumidity();
  int mq135_avg = analogRead(MQ135_ANALOG);
  int dust_pm25_avg = analogRead(DSM501_PM25);
  int dust_pm10 = analogRead(DSM501_PM10);

  // Display
  display.clearDisplay();
  display.setCursor(0,0);
  display.println("Air Quality Monitor");
  display.print("Temp: "); display.println(temp);
  display.print("Hum: "); display.println(hum);
  display.print("PM2.5: "); display.println(dust_pm25_avg);
  display.print("PM10: "); display.println(dust_pm10);
  display.print("MQ135: "); display.println(mq135_avg);
  display.display();

  // Send to backend
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverName);
    http.addHeader("Content-Type", "application/json");

    String jsonData = "{";
    jsonData += "\"device_id\":\"esp32_01\",";
    jsonData += "\"temperature\":" + String(temp, 2) + ",";
    jsonData += "\"humidity\":" + String(hum, 2) + ",";
    jsonData += "\"pm25\":" + String(dust_pm25_avg) + ",";
    jsonData += "\"pm10\":" + String(dust_pm10) + ",";
    jsonData += "\"mq135_raw\":" + String(mq135_avg) + ",";
    jsonData += "\"mq135_ppm\":" + String(mq135_avg / 10.0, 2);
    jsonData += "}";

    int httpResponseCode = http.POST(jsonData);

    if (httpResponseCode > 0) {
      Serial.print("✅ Data sent! Code: ");
      Serial.println(httpResponseCode);
      Serial.println(http.getString());
    } else {
      Serial.print("❌ Error: ");
      Serial.println(httpResponseCode);
    }

    http.end();
  }

  delay(3000);
}
