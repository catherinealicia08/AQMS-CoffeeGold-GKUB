# Backend Interface (HTTP + MQTT)

Dokumen ini menjelaskan interface yang disediakan `apps/backend`:
- HTTP API (Express)
- MQTT contract (HiveMQ → backend subscriber)

> Catatan: web/mobile umumnya baca/tulis data order langsung ke Firestore (client SDK). Backend berperan sebagai subscriber MQTT yang menjembatani event IoT menjadi update Firestore + push notification.

## Base URL

- Local dev: `http://localhost:4000`
- Cloud Run: gunakan URL service Cloud Run kamu (mis. `https://<service>-<hash>-<region>.a.run.app`)

`GET /` tidak didefinisikan, jadi akses root di browser akan membalas `Cannot GET /` (normal).

## HTTP API

### Health
- Method: `GET`
- Path: `/health`
- Response: `200`

Contoh:
```bash
curl -sS http://localhost:4000/health | jq
```

Response:
```json
{ "status": "ok", "service": "backend" }
```

### Orders (Firestore)
- Method: `GET`
- Path: `/api/orders`
- Response: `200`

Response (ringkas):
```json
{
  "count": 1,
  "orders": [
    {
      "id": "ORDER-12345678",
      "status": "queued",
      "queue_number": 12,
      "user_name": "Tamu",
      "total": 25000,
      "created_at": null,
      "completed_at": null
    }
  ]
}
```

Contoh list (default limit 20):
```bash
curl -sS http://localhost:4000/api/orders | jq
```

Contoh filter + limit:
```bash
curl -sS 'http://localhost:4000/api/orders?status=queued&limit=10' | jq
```

Contoh detail:
```bash
curl -sS http://localhost:4000/api/orders/ORDER-12345678 | jq
```

Jika `BACKEND_HTTP_API_KEY` diset, tambahkan header:
```bash
curl -sS http://localhost:4000/api/orders \
  -H 'x-api-key: YOUR_KEY' | jq
```

### OpenAPI + Swagger UI
- Method: `GET`
- Path: `/openapi.json`
- Response: `200` (OpenAPI document)

- Method: `GET`
- Path: `/docs`
- Response: `200` (Swagger UI)

## MQTT Contract (HiveMQ)

Backend subscribe ke topik berikut:
- `aqms/order/complete`
- `aqms/order/fallback`
- `aqms/device/status` (saat ini diabaikan oleh backend)
- `aqms/device/error` (saat ini diabaikan oleh backend)

### `aqms/order/complete`
Tujuan: menandai order Firestore sebagai selesai.

- QoS: `1`
- Payload: JSON

Schema minimal:
```json
{ "order_id": "ORDER-12345678" }
```

Field opsional:
```json
{ "sent_at_ms": 1710000000000 }
```

Aturan:
- `order_id` wajib format `ORDER-########` (8 digit).
- Jika payload berisi `sent_at_ms` (number), backend akan log estimasi latency `publish->backend`.

Efek:
- Update Firestore: `orders/{orderId}`
  - `status = "completed"`
  - `completed_at = serverTimestamp()`
- Jika order punya `user_id` dan ada token di `fcm_tokens/{userId}.token`, backend mengirim push notification via FCM.

### `aqms/order/fallback`
Tujuan: fallback ketika perangkat tidak mengirim `order_id` spesifik; backend akan menyelesaikan antrian FIFO.

- QoS: `1`
- Payload: boleh `{}` (backend tidak membaca payload)

Efek:
- Query Firestore untuk order aktif: `status in ["queued","in_progress"]` urut `queue_number` naik, `limit(1)`.
- Order paling depan ditandai `completed` (sama seperti flow `order/complete`).

## Environment Variables (Backend)

### Firebase Admin (wajib)
Dipakai untuk akses Firestore Admin + FCM.

- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY` (gunakan string dengan `\n`, backend akan convert ke newline)

### MQTT (opsional, untuk enable subscriber)
Jika variabel ini tidak lengkap, backend tetap jalan tapi MQTT subscriber akan disabled.

- `MQTT_HOST`
- `MQTT_PORT` (default `8883`)
- `MQTT_USERNAME`
- `MQTT_PASSWORD`
- `MQTT_CLIENT_ID` (opsional)

## Cara Test

Catatan: untuk menjalankan script `package.json`, gunakan `npm run <script>` (bukan `npm <script>`).

### 1) Unit test message logic
Dari root monorepo:
```bash
npm --workspace apps/backend test
```

### 2) Cek HTTP health
```bash
curl -sS http://localhost:4000/health
```

### 3) Semi-E2E: publish MQTT complete → verifikasi Firestore
Syarat: order doc `orders/ORDER-########` sudah ada (buat dari mobile checkout).

Dari root monorepo:
```bash
npm --workspace apps/backend run e2e:complete -- ORDER-12345678
```

Output akan menampilkan payload, waktu publish, dan waktu tunggu sampai Firestore menjadi `completed`.
