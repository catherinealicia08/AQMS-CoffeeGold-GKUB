export type LoggerLike = Pick<Console, 'log' | 'warn' | 'error'>;

const ORDER_ID_RE = /^ORDER-\d{8}$/;

export function isValidOrderId(orderId: unknown): orderId is string {
  return typeof orderId === 'string' && ORDER_ID_RE.test(orderId);
}

export type MqttMessageHandlerDeps = {
  onComplete: (orderId: string) => Promise<void>;
  onFallback: () => Promise<void>;
  logger?: LoggerLike;
};

export function createMqttMessageHandler({
  onComplete,
  onFallback,
  logger = console,
}: MqttMessageHandlerDeps) {
  return async (topic: string, payload: Buffer) => {
    if (topic === 'aqms/order/fallback') {
      try {
        await onFallback();
      } catch (err) {
        logger.error('[mqtt] fallback failed', err);
      }
      return;
    }

    if (topic !== 'aqms/order/complete') return;

    let msg: unknown;
    try {
      msg = JSON.parse(payload.toString('utf8'));
    } catch {
      logger.warn('[mqtt] invalid JSON payload');
      return;
    }

    const orderId = (msg as { order_id?: unknown })?.order_id;
    if (!isValidOrderId(orderId)) {
      logger.warn('[mqtt] invalid order_id format (expected ORDER-########)');
      return;
    }

    const sentAtMs = (msg as { sent_at_ms?: unknown })?.sent_at_ms;
    if (typeof sentAtMs === 'number' && Number.isFinite(sentAtMs)) {
      const latencyMs = Date.now() - sentAtMs;
      if (latencyMs >= 0) logger.log(`[mqtt] latency publish->backend: ${Math.round(latencyMs)}ms`);
    }

    try {
      await onComplete(orderId);
    } catch (err) {
      logger.error('[mqtt] failed to mark completed', err);
    }
  };
}
