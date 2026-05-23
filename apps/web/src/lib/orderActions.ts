import { db } from '@aqms/shared';
import { QUEUE_STATUS } from '@aqms/shared';
import { doc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';

// URL mobile app — sesuaikan jika deploy ke production
const MOBILE_APP_URL = process.env.NEXT_PUBLIC_MOBILE_APP_URL ?? 'http://localhost:3001';

export async function markOrderReady(orderId: string) {
  // 1. Update status di Firestore
  await updateDoc(doc(db, 'orders', orderId), {
    status: QUEUE_STATUS.COMPLETED,
    completed_at: serverTimestamp(),
  });

  // 2. Kirim Web Push notification ke customer
  try {
    const orderSnap = await getDoc(doc(db, 'orders', orderId));
    if (!orderSnap.exists()) return;

    const order = orderSnap.data();
    const userId = order.user_id as string | null;
    if (!userId) return; // guest order, tidak ada push

    await fetch(`${MOBILE_APP_URL}/api/send-push`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        title: '☕ Kopi Anda Siap!',
        body: `Pesanan #${order.queue_number} siap diambil di counter.`,
        url: '/track',
      }),
    });
  } catch (err) {
    // Jangan gagalkan mark-ready hanya karena push error
    console.warn('[Push] Failed to send notification:', err);
  }
}
