#include "BarcodeScanner.h"

BarcodeScanner::BarcodeScanner(uint8_t rx, uint8_t tx) {
    rxPin = rx;
    txPin = tx;
    serialGM65 = new HardwareSerial(2); // Menggunakan UART2
}

void BarcodeScanner::begin(long baudRate) {
    serialGM65->begin(baudRate, SERIAL_8N1, rxPin, txPin);
    serialGM65->setTimeout(10); // Non-blocking timeout
}

bool BarcodeScanner::scanAvailable() {
    // Jika ada data masuk, langsung ambil saat itu juga tanpa menunggu batas waktu
    if (serialGM65->available() > 0) {
        lastScannedData = "";
        
        // Baca semua karakter yang tersedia di detik itu juga
        while (serialGM65->available() > 0) {
            char c = serialGM65->read();
            // Hanya ambil karakter teks yang valid
            if (c >= 32 && c <= 126) {
                lastScannedData += c;
            }
            delay(2); // Beri jeda mikro agar buffer serial sempat terisi karakter berikutnya
        }
        
        lastScannedData.trim();
        return (lastScannedData.length() > 0);
    }
    return false;
}

String BarcodeScanner::getScannedData() {
    return lastScannedData;
}