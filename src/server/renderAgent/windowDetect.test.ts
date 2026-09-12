// src/server/renderAgent/windowDetect.test.ts
import { describe, it, expect, vi } from 'vitest';
import { detectWindow } from './windowDetect';
import { FatalError, RetryableError } from './errors';

describe('detectWindow', () => {
  it('returns the bbox from the model', async () => {
    const ask = vi.fn(async (_req: any) => '```json\n{"hasWindow":true,"bbox":{"x":30,"y":10,"width":40,"height":80}}\n```');
    await expect(detectWindow('data:image/png;base64,x', 'k', ask)).resolves.toEqual({ x: 30, y: 10, width: 40, height: 80 });
    expect(ask.mock.calls[0][0].images).toEqual(['data:image/png;base64,x']);
  });
  it('throws a fatal NO_WINDOW_DETECTED when hasWindow is false', async () => {
    const err = await detectWindow('d', 'k', async () => '{"hasWindow":false}').catch((e) => e);
    expect(err).toBeInstanceOf(FatalError);
    expect(err.code).toBe('NO_WINDOW_DETECTED');
  });
  it('throws retryable on malformed JSON', async () => {
    await expect(detectWindow('d', 'k', async () => 'nope')).rejects.toBeInstanceOf(RetryableError);
  });
  it('clamps the bbox into 0-100', async () => {
    await expect(detectWindow('d', 'k', async () => '{"hasWindow":true,"bbox":{"x":-5,"y":0,"width":120,"height":50}}')).resolves.toEqual({ x: 0, y: 0, width: 100, height: 50 });
  });
});
