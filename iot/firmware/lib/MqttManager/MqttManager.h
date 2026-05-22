#ifndef MQTTMANAGER_H
#define MQTTMANAGER_H

#include <Arduino.h>
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include <vector> // Dibutuhkan untuk antrean offline (Buffer)

class MqttManager {
private:
    WiFiClientSecure espClient;
    PubSubClient* client;
    const char* ssid;
    const char* password;
    const char* mqtt_server;
    uint16_t mqtt_port;
    const char* mqtt_user;
    const char* mqtt_pass;

    // Buffer lokal RAM untuk Mode Offline (SLA toleransi putus koneksi)
    std::vector<String> offlineBuffer; 

    void connectWiFi();
    void reconnectMqtt();

public:
    MqttManager(const char* ssid, const char* pass, const char* server, uint16_t port, const char* mUser, const char* mPass);
    void begin();
    void loop();
    
    // Pemisahan endpoint sesuai fungsi
    bool publishComplete(const char* topic, String orderId);
    bool publishFallback(const char* topic);
    bool publishTelemetry(const char* topic, int rssi, uint32_t freeRam);
    bool publishError(const char* topic, String errorType, String errorMsg);
    
    bool isConnected();
    void bufferOrder(String orderId);
    void processOfflineBuffer(const char* topic);
};

#endif