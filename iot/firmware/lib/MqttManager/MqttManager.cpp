#include "MqttManager.h"

MqttManager::MqttManager(const char* s, const char* p, const char* srv, uint16_t prt, const char* mU, const char* mP) {
    ssid = s;
    password = p;
    mqtt_server = srv;
    mqtt_port = prt;
    mqtt_user = mU;
    mqtt_pass = mP;
    client = new PubSubClient(espClient);
}

void MqttManager::connectWiFi() {
    if(WiFi.status() == WL_CONNECTED) return;
    
    Serial.print("Menghubungkan ke Wi-Fi: ");
    Serial.println(ssid);
    WiFi.disconnect(true);
    WiFi.begin(ssid, password);
    
    // Jangan blocking selamanya agar sistem antrean lokal tidak freeze
    int counter = 0;
    while (WiFi.status() != WL_CONNECTED && counter < 10) {
        delay(500);
        Serial.print(".");
        counter++;
    }
    if(WiFi.status() == WL_CONNECTED) Serial.println("\nWi-Fi Terhubung!");
}

void MqttManager::reconnectMqtt() {
    if (WiFi.status() == WL_CONNECTED && !client->connected()) {
        String clientId = "ESP32-AQMS-" + String(random(0xffff), HEX);
        if (client->connect(clientId.c_str(), mqtt_user, mqtt_pass)) {
            Serial.println("Terhubung ke HiveMQ Cloud via TLS!");
        }
    }
}

void MqttManager::begin() {
    connectWiFi();
    espClient.setInsecure(); 
    client->setServer(mqtt_server, mqtt_port);
}

void MqttManager::loop() {
    if (WiFi.status() != WL_CONNECTED) {
        connectWiFi();
    } else if (!client->connected()) {
        reconnectMqtt();
    }
    
    if (client->connected()) {
        client->loop();
    }
}

// FORMAT 1: Penyelesaian Pesanan Normal
bool MqttManager::publishComplete(const char* topic, String orderId) {
    if (client->connected()) {
        String payload = "{\"order_id\":\"" + orderId + "\"}";
        return client->publish(topic, payload.c_str());
    }
    return false;
}

// FORMAT 2: Tombol Fallback Manual
bool MqttManager::publishFallback(const char* topic) {
    if (client->connected()) {
        return client->publish(topic, "{}");
    }
    return false;
}

// FORMAT 3: Telemetri Hardware (Heartbeat)
bool MqttManager::publishTelemetry(const char* topic, int rssi, uint32_t freeRam) {
    if (client->connected()) {
        String payload = "{\"rssi\": " + String(rssi) + ", \"ram\": " + String(freeRam) + ", \"mqtt\": true}";
        return client->publish(topic, payload.c_str());
    }
    return false;
}

// FORMAT 4: Error Logging
bool MqttManager::publishError(const char* topic, String errorType, String errorMsg) {
    if (client->connected()) {
        String payload = "{\"type\": \"" + errorType + "\", \"msg\": \"" + errorMsg + "\"}";
        return client->publish(topic, payload.c_str());
    }
    return false;
}

bool MqttManager::isConnected() {
    return client->connected();
}

// Fungsi menyimpan ID ke dalam RAM saat WiFi terputus
void MqttManager::bufferOrder(String orderId) {
    if(offlineBuffer.size() < 20) { // Limit sesuai SLA maksimum 20 antrean
        offlineBuffer.push_back(orderId);
        Serial.println("[Offline] Order diselamatkan di buffer lokal: " + orderId);
    } else {
        Serial.println("[Offline] Peringatan: Buffer lokal penuh!");
    }
}

// Fungsi mengirim otomatis dari RAM ke Server saat koneksi pulih (FIFO)
void MqttManager::processOfflineBuffer(const char* topic) {
    if (client->connected() && !offlineBuffer.empty()) {
        Serial.println("Koneksi pulih! Mengirim data dari buffer lokal...");
        for (auto it = offlineBuffer.begin(); it != offlineBuffer.end(); ) {
            if (publishComplete(topic, *it)) {
                it = offlineBuffer.erase(it); // Hapus dari antrean jika sukses
                delay(100); 
            } else {
                break; // Hentikan proses jika di tengah jalan gagal lagi
            }
        }
    }
}