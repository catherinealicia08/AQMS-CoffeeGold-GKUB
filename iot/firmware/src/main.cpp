#include "BarcodeScanner.h"
#include "MqttManager.h"
#include "config.h"
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <Arduino.h>
#include <Wire.h>

// Inisialisasi Objek
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);
BarcodeScanner scanner(GM65_RX_PIN, GM65_TX_PIN);
MqttManager mqtt(WIFI_SSID, WIFI_PASSWORD, MQTT_SERVER, MQTT_PORT, MQTT_USER,
                 MQTT_PASSWORD);

void updateDisplay(String status, String data);

unsigned long waktuSelesaiScan = 0;
bool sedangMenampilkanSukses = false;

void setup() {
  Serial.begin(115200);
  delay(500);

  // Inisialisasi Tombol Eksternal dengan Internal Pullup
  pinMode(BUTTON_PIN, INPUT_PULLUP);

  // Inisialisasi OLED di pin bawaan (SDA=21, SCL=22)
  Wire.begin(21, 22);
  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println("OLED Gagal Inisialisasi");
    for (;;)
      ;
  }

  updateDisplay("BOOTING...", "Mencari Wi-Fi");

  // Inisialisasi Sensor GM65
  scanner.begin(9600);

  // Inisialisasi Jaringan
  mqtt.begin();

  updateDisplay("BOOTING...", "Connecting MQTT...");
  for (int i = 0; i < 10; i++) {
    mqtt.loop();
    if (mqtt.isConnected())
      break;
    delay(500);
  }

  if (mqtt.isConnected()) {
    updateDisplay("READY", "Silakan Scan Pesanan");
  } else {
    updateDisplay("READY", "MQTT reconnecting...");
  }
}

void loop() {
  mqtt.loop();

  // Timer layar sukses selama 3 detik
  if (sedangMenampilkanSukses) {
    if (millis() - waktuSelesaiScan >= 3000) {
      sedangMenampilkanSukses = false;

      // Bersihkan sisa data sampah di serial
      while (Serial2.available() > 0) {
        Serial2.read();
      }
      updateDisplay("READY", "Silakan Scan Pesanan");
    }
  }

  // Baca barcode jika layar dalam status READY
  if (!sedangMenampilkanSukses && scanner.scanAvailable()) {
    String scannedId = scanner.getScannedData();
    updateDisplay("PROCESSING", scannedId);

    bool published = false;
    for (int attempt = 1; attempt <= 3; attempt++) {
      mqtt.loop();
      if (mqtt.publishScan(MQTT_TOPIC_PUBLISH, scannedId)) {
        published = true;
        break;
      }
      delay(500);
    }

    if (published) {
      updateDisplay("COMPLETED", "Queue: " + scannedId);
    } else {
      updateDisplay("ERROR", "Koneksi MQTT Gagal");
    }
    waktuSelesaiScan = millis();
    sedangMenampilkanSukses = true;
  }
}

void updateDisplay(String status, String data) {
  Wire.flush();
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);

  display.setCursor(0, 0);
  display.println("= COFFEE GOLD GKUB =");

  display.setCursor(0, 20);
  display.print("Status: ");
  display.println(status);

  display.setCursor(0, 40);
  display.print("Data  : ");
  display.println(data);

  display.display();
}