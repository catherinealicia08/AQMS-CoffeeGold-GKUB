import { describe, expect, it, vi } from 'vitest';
import { createMqttMessageHandler, isValidOrderId } from '../messageLogic';

describe('isValidOrderId', () => {
  it('accepts ORDER-########', () => {
    expect(isValidOrderId('ORDER-12345678')).toBe(true);
  });

  it('rejects non-matching formats', () => {
    expect(isValidOrderId('ORDER-1234')).toBe(false);
    expect(isValidOrderId('ORDER-123456789')).toBe(false);
    expect(isValidOrderId('ORDER-ABCDEFGH')).toBe(false);
    expect(isValidOrderId('order-12345678')).toBe(false);
    expect(isValidOrderId(null)).toBe(false);
    expect(isValidOrderId(undefined)).toBe(false);
    expect(isValidOrderId(123)).toBe(false);
  });
});

describe('createMqttMessageHandler', () => {
  it('routes fallback topic to onFallback', async () => {
    const onComplete = vi.fn(async () => undefined);
    const onFallback = vi.fn(async () => undefined);
    const logger = { log: vi.fn(), warn: vi.fn(), error: vi.fn() };

    const handler = createMqttMessageHandler({ onComplete, onFallback, logger });
    await handler('aqms/order/fallback', Buffer.from('{}'));

    expect(onFallback).toHaveBeenCalledTimes(1);
    expect(onComplete).not.toHaveBeenCalled();
  });

  it('ignores unrelated topics', async () => {
    const onComplete = vi.fn(async () => undefined);
    const onFallback = vi.fn(async () => undefined);
    const logger = { log: vi.fn(), warn: vi.fn(), error: vi.fn() };

    const handler = createMqttMessageHandler({ onComplete, onFallback, logger });
    await handler('aqms/device/status', Buffer.from('{}'));

    expect(onFallback).not.toHaveBeenCalled();
    expect(onComplete).not.toHaveBeenCalled();
  });

  it('warns and does nothing on invalid JSON for complete topic', async () => {
    const onComplete = vi.fn(async () => undefined);
    const onFallback = vi.fn(async () => undefined);
    const logger = { log: vi.fn(), warn: vi.fn(), error: vi.fn() };

    const handler = createMqttMessageHandler({ onComplete, onFallback, logger });
    await handler('aqms/order/complete', Buffer.from('{not-json'));

    expect(logger.warn).toHaveBeenCalledWith('[mqtt] invalid JSON payload');
    expect(onComplete).not.toHaveBeenCalled();
  });

  it('warns and does nothing on invalid order_id', async () => {
    const onComplete = vi.fn(async () => undefined);
    const onFallback = vi.fn(async () => undefined);
    const logger = { log: vi.fn(), warn: vi.fn(), error: vi.fn() };

    const handler = createMqttMessageHandler({ onComplete, onFallback, logger });
    await handler('aqms/order/complete', Buffer.from(JSON.stringify({ order_id: 'ORDER-1234' })));

    expect(logger.warn).toHaveBeenCalledWith('[mqtt] invalid order_id format (expected ORDER-########)');
    expect(onComplete).not.toHaveBeenCalled();
  });

  it('calls onComplete for valid order_id', async () => {
    const onComplete = vi.fn(async () => undefined);
    const onFallback = vi.fn(async () => undefined);
    const logger = { log: vi.fn(), warn: vi.fn(), error: vi.fn() };

    const handler = createMqttMessageHandler({ onComplete, onFallback, logger });
    await handler('aqms/order/complete', Buffer.from(JSON.stringify({ order_id: 'ORDER-12345678' })));

    expect(onComplete).toHaveBeenCalledWith('ORDER-12345678');
    expect(onFallback).not.toHaveBeenCalled();
  });
});
