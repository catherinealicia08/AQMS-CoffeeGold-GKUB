import { db } from '@aqms/shared';
import { QUEUE_STATUS } from '@aqms/shared';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';

export async function markOrderReady(orderId: string) {
  await updateDoc(doc(db, 'orders', orderId), {
    status: QUEUE_STATUS.COMPLETED,
    completed_at: serverTimestamp(),
  });
}
