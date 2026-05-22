#ifndef MQTTMANAGER_H
#define MQTTMANAGER_H

#include <Arduino.h>
#include <WiFi.h>
#include <WiFiClientSecure.h> // <-- GANTI INI
#include <PubSubClient.h>

class MqttManager {
private:
    WiFiClientSecure espClient; // <-- GANTI INI menjadi WiFiClientSecure
    PubSubClient* client;
    const char* ssid;
    const char* password;
    const char* mqtt_server;
    uint16_t mqtt_port;
    const char* mqtt_user;
    const char* mqtt_pass;

    void connectWiFi();
    void reconnectMqtt();

public:
    MqttManager(const char* ssid, const char* pass, const char* server, uint16_t port, const char* mUser, const char* mPass);
    void begin();
    void loop();
    bool publishScan(const char* topic, String data);
    bool isConnected();
};

#endif