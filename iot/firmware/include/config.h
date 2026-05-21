#ifndef CONFIG_H
#define CONFIG_H

// Konfigurasi Pin Sensor GM65 & Tombol (Sesuai Desain Rangkaian)
#define GM65_RX_PIN 34
#define GM65_TX_PIN 32
#define BUTTON_PIN 4

// Konfigurasi OLED I2C
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1

// Kredensial Wi-Fi (Ubah sesuai dengan jaringan di lokasi)
#define WIFI_SSID "SmartHome"
#define WIFI_PASSWORD "11223344"

// Kredensial MQTT Broker (Ubah dengan IP Server/Backend)
#define MQTT_SERVER "fac6cb04653c4b92893cb77685953ee0.s1.eu.hivemq.cloud" 
#define MQTT_PORT 8883
#define MQTT_USER "esp32-aqms"
#define MQTT_PASSWORD "Nauracantik1"

// Topik MQTT
#define MQTT_TOPIC_PUBLISH "aqms/order/completed"

#endif