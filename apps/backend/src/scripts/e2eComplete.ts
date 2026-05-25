import 'dotenv/config';

import mqtt from 'mqtt';
import { db } from '../config/firebase';

function env(name: string): string {
  const value = process.env[name];
  if (!value || value.trim().length === 0) throw new Error(`Missing env ${name}`);
  return value.trim();
}

async function sleep(ms: number) {
  await new Promise((r) => setTimeout(r, ms));
}

async function waitForCompleted(orderId: string, timeoutMs: number) {
  const ref = db.collection('orders').doc(orderId);
  const startedAt = Date.now();
  let lastSeen: { exists: boolean; status: string | null } = { exists: false, status: null };

  while (Date.now() - startedAt < timeoutMs) {
    const snap = await ref.get();
    if (snap.exists) {
      const data = snap.data() as { status?: string } | undefined;
      lastSeen = { exists: true, status: typeof data?.status === 'string' ? data.status : null };
      if (data?.status === 'completed') {
        return { ok: true as const, elapsedMs: Date.now() - startedAt, lastSeen };
      }
    } else {
      lastSeen = { exists: false, status: null };
    }
    await sleep(250);
  }

  return { ok: false as const, elapsedMs: Date.now() - startedAt, lastSeen };
}

async function main() {
  const orderId = process.argv[2];
  if (!orderId) {
    console.error('Usage: tsx src/scripts/e2eComplete.ts ORDER-12345678');
    process.exit(2);
  }

  const host = env('MQTT_HOST');
  const port = Number(process.env.MQTT_PORT ?? 8883);
  const username = env('MQTT_USERNAME');
  const password = env('MQTT_PASSWORD');

  const url = `mqtts://${host}:${port}`;
  const clientId = `e2e-${Math.random().toString(16).slice(2)}`;

  const sentAtMs = Date.now();
  const payload = JSON.stringify({ order_id: orderId, sent_at_ms: sentAtMs });

  const existing = await db.collection('orders').doc(orderId).get();
  if (!existing.exists) {
    console.log('--- E2E RESULT ---');
    console.log(`order_id: ${orderId}`);
    console.log('result: FAIL (order doc not found in Firestore before publish)');
    process.exit(3);
  }

  const publishStart = Date.now();
  const client = mqtt.connect(url, { clientId, username, password, clean: true });

  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('MQTT connect timeout')), 10_000);
    client.once('connect', () => {
      clearTimeout(timeout);
      resolve();
    });
    client.once('error', reject);
  });

  await new Promise<void>((resolve, reject) => {
    client.publish('aqms/order/complete', payload, { qos: 1 }, (err) => (err ? reject(err) : resolve()));
  });

  const publishElapsed = Date.now() - publishStart;
  client.end(true);

  const wait = await waitForCompleted(orderId, 10_000);

  console.log('--- E2E RESULT ---');
  console.log(`order_id: ${orderId}`);
  console.log(`published_payload: ${payload}`);
  console.log(`mqtt_publish_total_ms: ${publishElapsed}`);
  console.log(`firestore_wait_completed_ms: ${wait.elapsedMs}`);
  console.log(`firestore_last_seen: ${JSON.stringify(wait.lastSeen)}`);
  console.log(`result: ${wait.ok ? 'PASS (completed)' : 'FAIL (timeout)'} `);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
