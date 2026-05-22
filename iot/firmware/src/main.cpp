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

// Deklarasi Fungsi Helper
void updateDisplay(String status, String data);
bool isValidFormat(String barcode);

unsigned long waktuSelesaiScan = 0;
bool sedangMenampilkanSukses = false;

// 1. Variabel Logika Tombol Fallback (Debounce)
unsigned long lastDebounceTime = 0;
unsigned long debounceDelay = 50; // Filter listrik statis 50ms
int buttonState;
int lastButtonState = HIGH;

// 2. Variabel Telemetri
unsigned long lastHeartbeat = 0;

void setup() {
    Serial.begin(115200);
    delay(500);
    
    // Inisialisasi Tombol Eksternal
    pinMode(BUTTON_PIN, INPUT_PULLUP);

    Wire.begin(21, 22); 
    if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
        Serial.println("OLED Gagal Inisialisasi");
        for (;;); 
    }
    
    updateDisplay("BOOTING...", "Mencari Wi-Fi");
    scanner.begin(9600); 
    mqtt.begin(); 
    
    updateDisplay("BOOTING...", "Connecting MQTT...");
    for (int i = 0; i < 10; i++) {   
        mqtt.loop();
        if (mqtt.isConnected()) break;
        delay(500);
    }
    
    if (mqtt.isConnected()) {
        updateDisplay("READY", "Silakan Scan");
    } else {
        updateDisplay("READY", "Mode Offline");
    }
}

void loop() {
    mqtt.loop();
    
    // LOGIKA 1: SINKRONISASI BUFFER OFFLINE
    // Secara otomatis meloloskan antrean di RAM jika WiFi pulih
    mqtt.processOfflineBuffer(MQTT_TOPIC_COMPLETE);

    // LOGIKA 2: TELEMETRI HEARTBEAT (PREDICTIVE MAINTENANCE)
    // Mengirim status kesehatan alat ke server setiap 60 detik
    if (millis() - lastHeartbeat >= 60000) {
        lastHeartbeat = millis();
        if (mqtt.isConnected()) {
            mqtt.publishTelemetry(MQTT_TOPIC_STATUS, WiFi.RSSI(), ESP.getFreeHeap());
            Serial.println("[Telemetri] Heartbeat terkirim ke Server.");
        }
    }

    // LOGIKA 3: FALLBACK PUSH BUTTON (DENGAN FILTER DEBOUNCE)
    int reading = digitalRead(BUTTON_PIN);
    if (reading != lastButtonState) {
        lastDebounceTime = millis();
    }
    if ((millis() - lastDebounceTime) > debounceDelay) {
        if (reading != buttonState) {
            buttonState = reading;
            if (buttonState == LOW) { // Interupsi terjadi!
                Serial.println("[Tombol Fallback] Ditekan!");
                updateDisplay("PROCESSING", "Fallback Manual");
                
                if (mqtt.publishFallback(MQTT_TOPIC_FALLBACK)) {
                    updateDisplay("COMPLETED", "Fallback Sukses");
                } else {
                    updateDisplay("ERROR", "Jaringan Mati");
                }
                waktuSelesaiScan = millis();
                sedangMenampilkanSukses = true;
            }
        }
    }
    lastButtonState = reading;

    // LOGIKA 4: TIMER LAYAR & PEMBERSIHAN BUFFER HARDWARE
    if (sedangMenampilkanSukses) {
        if (millis() - waktuSelesaiScan >= 3000) { 
            sedangMenampilkanSukses = false;
            while(Serial2.available() > 0) { Serial2.read(); } 
            
            if (mqtt.isConnected()) updateDisplay("READY", "Silakan Scan");
            else updateDisplay("READY", "Mode Offline");
        }
    }

    // LOGIKA 5: SCANNER & VALIDASI FORMAT EKSTREM
    if (!sedangMenampilkanSukses && scanner.scanAvailable()) {
        String scannedId = scanner.getScannedData();
        
        // Penegakan Aturan Format (ORDER-[0-9]{8})
        if (isValidFormat(scannedId)) {
            updateDisplay("PROCESSING", scannedId);
            
            if (mqtt.publishComplete(MQTT_TOPIC_COMPLETE, scannedId)) {
                updateDisplay("VALID", "Antrean Selesai");
                Serial.println("[Sukses] Order Valid. Terkirim ke server.");
            } else {
                updateDisplay("OFFLINE", "Buffer Lokal Aktif");
                mqtt.bufferOrder(scannedId); // Simpan ke RAM
            }
        } else {
            // Tolak input yang tidak sesuai aturan dokumen Fungsional
            Serial.println("[Blokir] Format Invalid Terdeteksi: " + scannedId);
            updateDisplay("ERROR", "Invalid Code");
            mqtt.publishError(MQTT_TOPIC_ERROR, "scan_error", "invalid_format");
        }
        
        waktuSelesaiScan = millis();
        sedangMenampilkanSukses = true;
    }
}

// Fungsi Keamanan: Validasi Format (Wajib 14 Karakter, Mulai "ORDER-", Sisanya Angka)
bool isValidFormat(String barcode) {
    if (barcode.length() != 14) return false;
    if (!barcode.startsWith("ORDER-")) return false;
    for (int i = 6; i < 14; i++) {
        if (!isDigit(barcode.charAt(i))) return false;
    }
    return true;
}

// Fungsi helper UI OLED
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