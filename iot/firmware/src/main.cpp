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
    // 0. Buka jalur komunikasi ke laptop (WAJIB ADA agar kita bisa nge-debug)
    Serial.begin(115200);
    delay(500);
    Serial.println("\n--- Sistem Mulai Booting ---");

    pinMode(BUTTON_PIN, INPUT_PULLUP);

    // 1. INISIALISASI OLED DULUAN
    Wire.begin(); // Panggil Wire secara eksplisit untuk ESP32
    if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
        Serial.println("OLED Gagal Inisialisasi");
        for (;;); // Berhenti di sini jika OLED lepas
    }
    
    // Tampilkan Loading Screen di OLED, jangan biarkan layar hitam!
    updateDisplay("BOOTING...", "Mencari Wi-Fi");
    
    // 2. INISIALISASI SENSOR (Panggil 1 kali saja)
    scanner.begin(115200); 
    
    // 3. JALANKAN FUNGSI JARINGAN (Wi-Fi & MQTT)
    Serial.println("Memanggil mqtt.begin()...");
    mqtt.begin(); 
    
    // Tunggu sampai MQTT benar-benar terhubung sebelum menampilkan READY
    Serial.println("Menunggu koneksi MQTT...");
    updateDisplay("BOOTING...", "Connecting MQTT...");
    for (int i = 0; i < 10; i++) {   // coba sampai 10x (masing-masing ~500ms)
        mqtt.loop();
        if (mqtt.isConnected()) break;
        delay(500);
    }
    
    // 4. JIKA LOLOS WI-FI & MQTT, UBAH STATUS LAYAR MENJADI READY
    if (mqtt.isConnected()) {
        Serial.println("Jaringan Sukses! Sistem Siap.");
        updateDisplay("READY", "Silakan Scan Pesanan");
    } else {
        Serial.println("MQTT gagal terhubung, coba lagi saat loop...");
        updateDisplay("READY", "MQTT reconnecting...");
    }
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
        
        // Coba kirim, dengan retry jika MQTT belum terhubung
        bool published = false;
        for (int attempt = 1; attempt <= 3; attempt++) {
            mqtt.loop(); // pastikan koneksi fresh sebelum publish
            if (mqtt.publishScan(MQTT_TOPIC_PUBLISH, scannedId)) {
                published = true;
                break;
            }
            Serial.print("Publish gagal, percobaan ke-");
            Serial.println(attempt);
            delay(500); // beri waktu reconnect sebelum retry
        }

        if (published) {
            Serial.println("Berhasil dikirim ke Server HiveMQ.");
            updateDisplay("COMPLETED", "Queue: " + scannedId);
        } else {
            Serial.println("Gagal mengirim setelah 3 percobaan!");
            updateDisplay("ERROR", "Koneksi MQTT Gagal");
        }
        waktuSelesaiScan = millis();
        sedangMenampilkanSukses = true;
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

// #include <Arduino.h>
// #include <Wire.h>
// #include <Adafruit_GFX.h>
// #include <Adafruit_SSD1306.h>

// #define SCREEN_WIDTH 128
// #define SCREEN_HEIGHT 64
// #define OLED_RESET    -1
// #define SCREEN_ADDRESS 0x3C // Alamat I2C standar OLED 0.96"

// Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

// void setup() {
//   Serial.begin(115200);
//   Serial.println("Memulai Tes I2C OLED...");

//   // Inisialisasi pin I2C bawaan ESP32 (SDA = D21, SCL = D22)
//   Wire.begin();

//   // Coba menyalakan layar
//   if(!display.begin(SSD1306_SWITCHCAPVCC, SCREEN_ADDRESS)) {
//     Serial.println("GAGAL: Layar OLED tidak terdeteksi di jalur I2C!");
//     Serial.println("Cek kabel SDA (D21), SCL (D22), VCC (3V3), dan GND.");
//     for(;;); // Hentikan program di sini jika gagal
//   }

//   Serial.println("SUKSES: OLED Terdeteksi.");
  
//   // Bersihkan buffer layar
//   display.clearDisplay();
  
//   // Atur teks
//   display.setTextSize(1);
//   display.setTextColor(SSD1306_WHITE);
//   display.setCursor(15, 20);
//   display.println("TEST HARDWARE");
  
//   display.setCursor(15, 40);
//   display.println("OLED NORMAL !");
  
//   // Tampilkan ke layar
//   display.display();
// }

// void loop() {
//   // Efek kedip sederhana untuk membuktikan ESP32 tidak freeze
//   display.invertDisplay(true);
//   delay(1000);
//   display.invertDisplay(false);
//   delay(1000);
// }