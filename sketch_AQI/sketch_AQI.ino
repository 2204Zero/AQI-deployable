#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <DHT.h>
#include <WiFi.h>
#include <HTTPClient.h>

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

#define DHTPIN 4
#define DHTTYPE DHT22
DHT dht(DHTPIN, DHTTYPE);

#define BUZZER_PIN 5
#define MQ135_ANALOG 33
#define MQ135_DIGITAL 32

// 👇 Dummy placeholders for DSM501A (not actually used)
#define DSM501_PM25 34
#define DSM501_PM10 35

int MQ135_THRESHOLD = 2000;
int DUST_THRESHOLD  = 2000;

// 👇 WiFi + Server details 👇
const char* ssid = "Zero";
const char* password = "zero123456";
const char* serverName = "https://aqi-deployable.onrender.com/esp32/readings";

bool wifiConnected = false; // Track WiFi connection status

void setup() {
  Serial.begin(115200);

  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, HIGH);

  dht.begin();

  // OLED setup
  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println("SSD1306 allocation failed");
    for (;;);
  }

  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(0, 0);
  display.println("Connecting WiFi...");
  display.display();

  // -----------------------
  // 🧩 Improved WiFi Connection with Timeout
  // -----------------------
  Serial.println("Connecting to WiFi...");
  WiFi.begin(ssid, password);

  int retryCount = 0;
  while (WiFi.status() != WL_CONNECTED && retryCount < 30) { // 30 × 500ms = 15s
    delay(500);
    Serial.print(".");
    retryCount++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    wifiConnected = true;
    Serial.println("\n✅ WiFi connected!");
    Serial.print("IP: ");
    Serial.println(WiFi.localIP());
    display.clearDisplay();
    display.setCursor(0, 0);
    display.println("WiFi Connected!");
    display.display();
  } else {
    wifiConnected = false;
    Serial.println("\n⚠️ WiFi not found! Running offline...");
    display.clearDisplay();
    display.setCursor(0, 0);
    display.println("WiFi not found!");
    display.println("Offline Mode");
    display.display();
  }
  delay(1000);
}

void loop() {
  // --- DHT22 readings ---
  float temp = dht.readTemperature();
  float hum = dht.readHumidity();

  // --- MQ135 ---
  int mq135_raw = analogRead(MQ135_ANALOG);
  float mq135_ppm = mq135_raw / 10.0;

  // --- Fake PM2.5 & PM10 values (for demo) ---
  float conc_pm25 = random(200, 301); // 200–300 µg/m³
  float conc_pm10 = random(200, 301); // 200–300 µg/m³

  // --- OLED Display ---
  display.clearDisplay();
  display.setCursor(0, 0);
  display.println("Air Quality Monitor");
  display.print("Temp: "); display.println(temp);
  display.print("Hum: "); display.println(hum);
  display.print("PM2.5: "); display.println(conc_pm25);
  display.print("PM10: "); display.println(conc_pm10);
  display.print("MQ135: "); display.println(mq135_raw);
  if (!wifiConnected) display.println("Offline Mode");
  display.display();

  // --- Serial Output ---
  Serial.println("✅ Data ready");
  Serial.print("PM2.5: "); Serial.print(conc_pm25); Serial.println(" µg/m³");
  Serial.print("PM10 : "); Serial.print(conc_pm10); Serial.println(" µg/m³");

  // --- Try to reconnect if disconnected ---
  if (WiFi.status() != WL_CONNECTED && wifiConnected) {
    Serial.println("⚠️ Lost WiFi connection! Attempting reconnect...");
    WiFi.reconnect();
    delay(5000);
  }

  // --- Send to backend ---
  if (WiFi.status() == WL_CONNECTED) {
    wifiConnected = true; // stays true
    HTTPClient http;
    http.begin(serverName);
    http.addHeader("Content-Type", "application/json");

    String jsonData = "{";
    jsonData += "\"device_id\":\"esp32_01\",";
    jsonData += "\"temperature\":" + String(temp, 2) + ",";
    jsonData += "\"humidity\":" + String(hum, 2) + ",";
    jsonData += "\"pm25\":" + String(conc_pm25, 2) + ",";
    jsonData += "\"pm10\":" + String(conc_pm10, 2) + ",";
    jsonData += "\"mq135_raw\":" + String(mq135_raw) + ",";
    jsonData += "\"mq135_ppm\":" + String(mq135_ppm, 2);
    jsonData += "}";

    int httpResponseCode = http.POST(jsonData);

    if (httpResponseCode > 0) {
      Serial.print("✅ Data sent! Code: ");
      Serial.println(httpResponseCode);
      Serial.println(http.getString());
    } else {
      Serial.print("❌ Error sending data: ");
      Serial.println(httpResponseCode);
    }

    http.end();
  } else {
    wifiConnected = false;
    Serial.println("⚠️ Skipping data upload (no WiFi)");
  }

  delay(5000); // send data every 5 seconds
}
