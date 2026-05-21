#include <Arduino.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include "config.h"
#include "BarcodeScanner.h"
#include "MqttManager.h"

// Inisialisasi Objek
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);
BarcodeScanner scanner(GM65_RX_PIN, GM65_TX_PIN);
MqttManager mqtt(WIFI_SSID, WIFI_PASSWORD, MQTT_SERVER, MQTT_PORT, MQTT_USER, MQTT_PASSWORD);

// Deklarasi fungsi
void updateDisplay(String status, String data);

void setup() {
    scanner.begin(9600);
    pinMode(BUTTON_PIN, INPUT_PULLUP);

    // 1. INSIALISASI OLED DULUAN (Amankan RAM Buffer)
    if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
        Serial.println("OLED Gagal Inisialisasi");
        for (;;);
    }
    
    display.clearDisplay();
    display.display(); // Nyalakan layar kosong pertama kali
    
    // 2. BARU JALANKAN FUNGSI JARINGAN
    scanner.begin(115200); 
    mqtt.begin();
    
    updateDisplay("READY", "Silakan Scan Pesanan");
}

// Tambahkan variabel global ini di bagian paling atas src/main.cpp (di luar fungsi)
unsigned long waktuSelesaiScan = 0;
bool sedangMenampilkanSukses = false;

void loop() {
    mqtt.loop();

    if (sedangMenampilkanSukses) {
        if (millis() - waktuSelesaiScan >= 3000) { 
            sedangMenampilkanSukses = false;
            
            // TAMBAHKAN BARIS INI: Bersihkan sisa data sampah di serial sebelum scan berikutnya
            while(Serial2.available() > 0) {  
                Serial2.read(); 
            }
            
            updateDisplay("READY", "Silakan Scan Pesanan");
        }
    }

    // Hanya baca jika sedang tidak menampilkan status sukses
    if (!sedangMenampilkanSukses && scanner.scanAvailable()) {
        String scannedId = scanner.getScannedData();
        Serial.println("Barcode Terdeteksi: " + scannedId);
        
        updateDisplay("PROCESSING", scannedId);
        
        if (mqtt.publishScan(MQTT_TOPIC_PUBLISH, scannedId)) {
            Serial.println("Berhasil dikirim ke Server HiveMQ.");
            updateDisplay("COMPLETED", "Queue: " + scannedId);
            waktuSelesaiScan = millis();
            sedangMenampilkanSukses = true;
        } else {
            Serial.println("Gagal mengirim ke Server!");
            updateDisplay("ERROR", "Koneksi MQTT Gagal");
            waktuSelesaiScan = millis();
            sedangMenampilkanSukses = true;
        }
    }
}

// Fungsi helper untuk UI OLED
void updateDisplay(String status, String data) {
    // Paksa bersihkan sisa data di bus I2C sebelum kirim data baru
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
    
    // Kirim data ke layar
    display.display(); 
}