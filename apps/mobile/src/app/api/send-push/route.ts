import { NextRequest, NextResponse } from 'next/server';
import webPush from 'web-push';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// ─── Firebase Admin init (satu kali) ────────────────────────────────────────

function getAdminDb() {
  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        // Private key disimpan di env dengan \n literal → perlu di-parse
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  }
  return getFirestore();
}

// ─── VAPID config ────────────────────────────────────────────────────────────

const vapidSubject = process.env.VAPID_SUBJECT ?? 'mailto:admin@example.com';
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? '';
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY ?? '';

if (vapidPublicKey && vapidPrivateKey) {
  webPush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
}

// ─── POST /api/send-push ─────────────────────────────────────────────────────
// Body: { userId: string, title: string, body: string, url?: string }

export async function POST(req: NextRequest) {
  try {
    if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
      return NextResponse.json({ error: 'VAPID keys are not configured on the server' }, { status: 500 });
    }

    const { userId, title, body, url } = await req.json() as {
      userId: string;
      title: string;
      body: string;
      url?: string;
    };

    if (!userId || !title || !body) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const db = getAdminDb();

    // Ambil pushSubscription dari Firestore
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const subscription = userDoc.data()?.pushSubscription as PushSubscriptionJSON | undefined;
    if (!subscription?.endpoint) {
      return NextResponse.json({ error: 'No push subscription for this user' }, { status: 404 });
    }

    // Kirim push notification
    await webPush.sendNotification(
      subscription as webPush.PushSubscription,
      JSON.stringify({
        title,
        body,
        icon: '/coffee.png',
        tag: 'order-ready',
        url: url ?? '/track',
      })
    );

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error('[send-push] Error:', err);
    return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 });
  }
}
