#ifndef CONFIG_H
#define CONFIG_H

// -- [KREDENSIAL JARINGAN] --
#define WIFI_SSID "nauraa"
#define WIFI_PASSWORD "12345678"
#define MQTT_SERVER "fac6cb04653c4b92893cb77685953ee0.s1.eu.hivemq.cloud" 
#define MQTT_PORT 8883                 
#define MQTT_USER "esp32-aqms"
#define MQTT_PASSWORD "Nauracantik1"

#define MQTT_TOPIC_COMPLETE "aqms/order/complete"
#define MQTT_TOPIC_FALLBACK "aqms/order/fallback"
#define MQTT_TOPIC_STATUS "aqms/device/status"
#define MQTT_TOPIC_ERROR "aqms/device/error"

// -- [KONFIGURASI OLED] --
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1

// -- [KONFIGURASI PIN BREADBOARD 30-PIN] --
#define GM65_RX_PIN 16 
#define GM65_TX_PIN 17 
#define BUTTON_PIN 4   // Tombol Fallback D4

#endif