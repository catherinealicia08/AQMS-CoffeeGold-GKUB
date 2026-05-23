# AQMS CoffeeGold GKUB

Automated Queue Management System untuk Coffee Gold GKUB. Sistem ini mengelola antrian pesanan dari pelanggan memesan lewat aplikasi mobile, barista memproses lewat web, hingga IoT scanner menandai pesanan selesai secara otomatis.

## Arsitektur Sistem

[Mobile App] ──── order ────► [Firebase Firestore]
                                      │
                              realtime listener
                                      │
                     ┌────────────────┼────────────────┐
                     ▼                ▼                 ▼
               [Web Barista]   [Web Dashboard]   [Web Display]
               (antrian)       (statistik)       (queue screen)
                                      
[IoT ESP32] ── scan barcode ──► [HiveMQ MQTT] ──► [Backend Worker]
                                                         │
                                               update status Firestore

## Struktur Monorepo

.
├── apps/
│   ├── backend/          # Express + TypeScript API
│   ├── web/              # Next.js — barista dashboard & display
│   └── mobile/           # Next.js — customer ordering app
├── packages/
│   └── shared/           # Shared constants, Firebase config, types
└── iot/
    └── firmware/         # PlatformIO — ESP32 barcode scanner

## Fitur

### Mobile (`apps/mobile`) — Aplikasi Pelanggan
- Register / login dengan Firebase Auth
- Browse menu & kustomisasi pesanan
- Checkout dan tracking status antrian real-time
- Push notification via FCM saat pesanan siap

### Web (`apps/web`) — Aplikasi Barista
- **`/barista`** — antrian aktif (INCOMING) dan pesanan selesai (COMPLETED), update status real-time
- **`/dashboard`** — statistik harian: total order, revenue, top menu, bar chart order per jam, tabel semua pesanan
- **`/display`** — tampilan antrian untuk layar kasir
- Login barista dengan Firebase Auth (custom claim)

### Backend (`apps/backend`) — MQTT Worker
- Subscribe ke HiveMQ Cloud via MQTT over TLS
- Update status order di Firestore saat barcode di-scan IoT
- Handle fallback button: auto-complete order antrian pertama

### IoT Firmware (`iot/firmware`) — ESP32
- Scan barcode GM65 via UART
- Publish ke MQTT topic aqms/order/complete saat order selesai
- OLED display SSD1306 128×64 untuk feedback status
- Fallback button manual jika scanner error
- Buffer offline — antrian tersimpan di RAM jika WiFi putus, otomatis kirim saat reconnect
- Heartbeat telemetri setiap 60 detik

## Tech Stack

| Layer | Teknologi |
|---|---|
| Mobile & Web | Next.js 15, React 19, Tailwind CSS, TypeScript |
| Backend | Express, TypeScript, Firebase Admin SDK |
| Database & Auth | Firebase Firestore, Firebase Auth |
| Messaging | MQTT over TLS (HiveMQ Cloud) |
| IoT | ESP32, PlatformIO, Arduino framework |
| Shared | npm workspaces monorepo |

## Tim Pengembang

| No | Nama | NIM |
|---|---|---|
| 1 | Naura Ayurachmani | 18223061 |
| 2 | Sendi Putra Alicia | 18223063 |
| 3 | Catherine Alicia N | 18223069 |
| 4 | Noeriza Aqila Wibawa | 18223095 |
| 5 | Audy Alicia Renata Tirayoh | 18223097 |