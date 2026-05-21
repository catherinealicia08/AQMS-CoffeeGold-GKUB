#ifndef BARCODESCANNER_H
#define BARCODESCANNER_H

#include <Arduino.h>
#include <HardwareSerial.h>

class BarcodeScanner {
private:
    HardwareSerial* serialGM65;
    uint8_t rxPin;
    uint8_t txPin;
    String lastScannedData;

public:
    BarcodeScanner(uint8_t rx, uint8_t tx);
    void begin(long baudRate = 115200);
    bool scanAvailable();
    String getScannedData();
};

#endif