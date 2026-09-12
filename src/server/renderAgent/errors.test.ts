// src/server/renderAgent/errors.test.ts
import { describe, it, expect, vi } from 'vitest';
import { RetryableError, FatalError, classifyHttpStatus, withRetry } from './errors';

describe('classifyHttpStatus', () => {
  it('429 and 5xx are retryable', () => {
    expect(classifyHttpStatus(429, 'slow down')).toBeInstanceOf(RetryableError);
    expect(classifyHttpStatus(503, 'down')).toBeInstanceOf(RetryableError);
  });
  it('401, 403 and 400 are fatal', () => {
    expect(classifyHttpStatus(401, '')).toBeInstanceOf(FatalError);
    expect(classifyHttpStatus(403, '')).toBeInstanceOf(FatalError);
    expect(classifyHttpStatus(400, 'bad')).toBeInstanceOf(FatalError);
  });
  it('keeps the status and a trimmed body in the message', () => {
    const e = classifyHttpStatus(500, 'x'.repeat(500));
    expect(e.message).toContain('500');
    expect(e.message.length).toBeLessThan(260);
  });
});

describe('withRetry', () => {
  it('retries a RetryableError up to the limit then succeeds', async () => {
    let calls = 0;
    const fn = vi.fn(async () => {
      calls++;
      if (calls < 3) throw new RetryableError('flaky');
      return 'ok';
    });
    const sleep = vi.fn(async () => undefined);
    await expect(withRetry(fn, { retries: 2, delaysMs: [1, 2], sleep })).resolves.toBe('ok');
    expect(fn).toHaveBeenCalledTimes(3);
    expect(sleep).toHaveBeenCalledWith(1);
    expect(sleep).toHaveBeenCalledWith(2);
  });
  it('gives up after the limit', async () => {
    const fn = vi.fn(async () => { throw new RetryableError('flaky'); });
    await expect(withRetry(fn, { retries: 2, sleep: async () => undefined })).rejects.toBeInstanceOf(RetryableError);
    expect(fn).toHaveBeenCalledTimes(3);
  });
  it('does not retry a FatalError', async () => {
    const fn = vi.fn(async () => { throw new FatalError('nope'); });
    await expect(withRetry(fn, { sleep: async () => undefined })).rejects.toBeInstanceOf(FatalError);
    expect(fn).toHaveBeenCalledTimes(1);
  });
  it('treats unknown errors as retryable', async () => {
    let calls = 0;
    const fn = vi.fn(async () => { if (++calls === 1) throw new Error('ECONNRESET'); return 1; });
    await expect(withRetry(fn, { sleep: async () => undefined })).resolves.toBe(1);
  });
});
