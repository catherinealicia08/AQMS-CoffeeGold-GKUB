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
    Serial.print("Menghubungkan ke Wi-Fi: ");
    Serial.println(ssid);
    
    // Putuskan koneksi sebelumnya jika ada
    WiFi.disconnect(true);
    delay(1000);
    
    WiFi.begin(ssid, password);
    
    int counter = 0;
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
        counter++;
        
        // Setiap 10 kali mencoba (5 detik), cetak kode status aslinya
        if (counter % 10 == 0) {
            Serial.print("\n[DEBUG] Status Wi-Fi Saat Ini: ");
            Serial.println(WiFi.status()); 
        }
    }
    Serial.println("\nWi-Fi Terhubung!");
}

void MqttManager::reconnectMqtt() {
    if (!client->connected()) {
        Serial.print("Menghubungkan ke HiveMQ Cloud...");
        String clientId = "ESP32-AQMS-";
        clientId += String(random(0xffff), HEX);
        
        // HiveMQ Cloud WAJIB menggunakan autentikasi username & password
        if (client->connect(clientId.c_str(), mqtt_user, mqtt_pass)) {
            Serial.println("Terhubung ke HiveMQ Cloud via TLS!");
        } else {
            Serial.print("Gagal, rc=");
            Serial.print(client->state());
            Serial.println(" Coba lagi.");
        }
    }
}

void MqttManager::begin() {
    connectWiFi();
    
    // TAMBAHKAN BARIS INI: Mengizinkan TLS tanpa menyimpan berkas CA Certificate di ESP32
    espClient.setInsecure(); 
    
    client->setServer(mqtt_server, mqtt_port);
}

void MqttManager::loop() {
    if (WiFi.status() != WL_CONNECTED) {
        connectWiFi();
    }
    if (!client->connected()) {
        reconnectMqtt();
    }
    client->loop();
}

bool MqttManager::publishScan(const char* topic, String data) {
    if (client->connected()) {
        // Format JSON payload untuk memperbarui status antrean di backend
        String payload = "{\"status\":\"Completed\",\"queue_id\":\"" + data + "\"}";
        return client->publish(topic, payload.c_str());
    }
    return false;
}

bool MqttManager::isConnected() {
    return client->connected();
}