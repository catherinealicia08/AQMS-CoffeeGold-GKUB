#include "BarcodeScanner.h"

BarcodeScanner::BarcodeScanner(uint8_t rx, uint8_t tx) {
    rxPin = rx;
    txPin = tx;
    serialGM65 = new HardwareSerial(2); // 2 explicitly calls Hardware UART2
}

void BarcodeScanner::begin(long baudRate) {
    serialGM65->begin(baudRate, SERIAL_8N1, rxPin, txPin);
    // No custom timeout needed - we use a fixed delay approach instead
}

bool BarcodeScanner::scanAvailable() {
    if (serialGM65->available() > 0) {
        // Wait 100ms for the FULL barcode packet to arrive in the buffer.
        // At 9600 baud, a 20-char barcode takes ~20ms, so 100ms is plenty.
        // This avoids readStringUntil() which resets its timer on every byte
        // received and never returns while the cable is connected.
        delay(100);

        lastScannedData = "";
        while (serialGM65->available() > 0) {
            char c = (char)serialGM65->read();
            // Only keep printable ASCII characters (ignore CR, LF, noise)
            if (c >= 32 && c <= 126) {
                lastScannedData += c;
            }
        }
        lastScannedData.trim();
        Serial.print("[Scanner] Barcode: '");
        Serial.print(lastScannedData);
        Serial.println("'");
        return (lastScannedData.length() > 0);
    }
    return false;
}

String BarcodeScanner::getScannedData() {
    return lastScannedData;
}