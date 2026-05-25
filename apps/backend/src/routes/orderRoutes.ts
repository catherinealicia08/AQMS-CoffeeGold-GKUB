import { Router } from 'express';
import { db } from '../config/firebase';

const router = Router();

function env(name: string): string | undefined {
  const value = process.env[name];
  return value && value.trim().length > 0 ? value.trim() : undefined;
}

function requireApiKeyIfConfigured(req: { headers: Record<string, unknown> }): string | null {
  const configured = env('BACKEND_HTTP_API_KEY');
  if (!configured) return null;

  const provided = req.headers['x-api-key'];
  const providedStr = Array.isArray(provided) ? provided[0] : provided;
  if (typeof providedStr !== 'string' || providedStr.trim() !== configured) {
    return 'Invalid or missing x-api-key';
  }
  return null;
}

router.get('/', async (req, res) => {
  const authError = requireApiKeyIfConfigured(req);
  if (authError) return res.status(401).json({ error: authError });

  const status = typeof req.query.status === 'string' ? req.query.status : undefined;
  const rawLimit = typeof req.query.limit === 'string' ? Number(req.query.limit) : undefined;
  const limit = Number.isFinite(rawLimit) ? Math.min(Math.max(rawLimit as number, 1), 100) : 20;

  try {
    let q = db.collection('orders') as FirebaseFirestore.Query;

    if (status) q = q.where('status', '==', status);
    // Order by created_at when possible to show newest first.
    q = q.orderBy('created_at', 'desc').limit(limit);

    const snap = await q.get();
    const orders = snap.docs.map((d) => {
      const data = d.data() as Record<string, unknown>;
      return {
        id: d.id,
        status: data.status ?? null,
        queue_number: data.queue_number ?? null,
        user_name: data.user_name ?? null,
        total: data.total ?? null,
        created_at: data.created_at ?? null,
        completed_at: data.completed_at ?? null,
      };
    });

    return res.status(200).json({ count: orders.length, orders });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch orders', details: String(err) });
  }
});

router.get('/:orderId', async (req, res) => {
  const authError = requireApiKeyIfConfigured(req);
  if (authError) return res.status(401).json({ error: authError });

  const orderId = req.params.orderId;
  try {
    const snap = await db.collection('orders').doc(orderId).get();
    if (!snap.exists) return res.status(404).json({ error: 'Order not found' });
    return res.status(200).json({ id: snap.id, ...snap.data() });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch order', details: String(err) });
  }
});

export default router;
