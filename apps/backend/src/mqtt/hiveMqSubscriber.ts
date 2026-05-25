import mqtt, { type MqttClient } from 'mqtt';
import admin, { db } from '../config/firebase';
import { createMqttMessageHandler } from './messageLogic';

function env(name: string): string | undefined {
  const value = process.env[name];
  return value && value.trim().length > 0 ? value.trim() : undefined;
}

function getMqttConfig() {
  const host = env('MQTT_HOST');
  const port = Number(env('MQTT_PORT') ?? 8883);
  const username = env('MQTT_USERNAME');
  const password = env('MQTT_PASSWORD');
  const clientId = env('MQTT_CLIENT_ID') ?? `backend-aqms-${Math.random().toString(16).slice(2)}`;

  return { host, port, username, password, clientId };
}

async function sendCompletedNotification(orderId: string, userId?: string | null) {
  if (!userId) {
    console.log(`[mqtt] skip notif: no user_id on order ${orderId}`);
    return;
  }

  const tokenSnap = await db.collection('fcm_tokens').doc(userId).get();
  const fcmToken = (tokenSnap.data() as { token?: string } | undefined)?.token;

  if (!fcmToken) {
    console.log(`[mqtt] skip notif: no fcmToken for user ${userId}`);
    return;
  }

  const t0 = Date.now();
  try {
    await admin.messaging().send({
      token: fcmToken,
      notification: {
        title: 'Pesanan siap diambil! ☕',
        body: 'Kopimu sudah selesai dibuat. Silakan ambil di counter.',
      },
      data: { orderId },
    });
    console.log(`[mqtt] notif sent to user ${userId} for order ${orderId} (${Date.now() - t0}ms)`);
  } catch (err) {
    console.error(`[mqtt] failed to send notification (${Date.now() - t0}ms)`, err);
  }
}

async function markOrderCompleted(orderId: string) {
  const ref = db.collection('orders').doc(orderId);
  const snap = await ref.get();

  if (!snap.exists) {
    console.warn(`[mqtt] order doc not found: orders/${orderId}`);
    return;
  }

  const data = snap.data() as { status?: string; completed_at?: unknown; user_id?: string | null } | undefined;
  if (data?.status === 'completed') {
    console.log(`[mqtt] already completed: ${orderId}`);
    return;
  }

  const t0 = Date.now();
  await ref.set(
    {
      status: 'completed',
      completed_at: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  console.log(`[mqtt] marked completed: ${orderId} (${Date.now() - t0}ms firestore)`);
  await sendCompletedNotification(orderId, data?.user_id);
}

async function markNextActiveOrderCompleted() {
  const snap = await db
    .collection('orders')
    .where('status', 'in', ['queued', 'in_progress'])
    .orderBy('queue_number', 'asc')
    .limit(1)
    .get();

  if (snap.empty) {
    console.warn('[mqtt] fallback: no active orders to complete');
    return;
  }

  const doc = snap.docs[0];
  await markOrderCompleted(doc.id);
}

export function startHiveMqSubscriber(): MqttClient | null {
  const { host, port, username, password, clientId } = getMqttConfig();

  // Make MQTT optional so devs without creds can still run backend.
  if (!host || !username || !password) {
    console.log('[mqtt] disabled (set MQTT_HOST/MQTT_USERNAME/MQTT_PASSWORD to enable)');
    return null;
  }

  const url = `mqtts://${host}:${port}`;
  const client = mqtt.connect(url, {
    clientId,
    username,
    password,
    keepalive: 60,
    reconnectPeriod: 2000,
    clean: true,
  });

  client.on('connect', () => {
    console.log('[mqtt] connected');

    client.subscribe(
      ['aqms/order/complete', 'aqms/order/fallback', 'aqms/device/status', 'aqms/device/error'],
      { qos: 1 },
      (err: Error | null) => {
        if (err) console.error('[mqtt] subscribe error', err);
        else console.log('[mqtt] subscribed');
      }
    );
  });

  client.on('reconnect', () => console.log('[mqtt] reconnecting...'));
  client.on('close', () => console.log('[mqtt] connection closed'));
  client.on('error', (err: Error) => console.error('[mqtt] error', err));

  client.on(
    'message',
    createMqttMessageHandler({
      onComplete: markOrderCompleted,
      onFallback: markNextActiveOrderCompleted,
    })
  );

  return client;
}
