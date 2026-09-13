// src/server/renderAgent/imageClient.test.ts
import { describe, it, expect, vi } from 'vitest';
import { generateImage, askVision, PROVIDER_TIMEOUT_MS } from './imageClient';
import { FatalError, RetryableError } from './errors';

const PNG = 'data:image/png;base64,iVBORw0KGgo=';
// A stand-in brand key long enough to pass getEffectiveOpenRouterKey's length filter (>10 chars),
// so these tests exercise the fetch path deterministically without depending on ambient env vars.
const API_KEY = 'test-openrouter-key-0001';
const ok = (body: any) => ({ ok: true, status: 200, json: async () => body, text: async () => JSON.stringify(body) }) as any;
const fail = (status: number, text = 'err') => ({ ok: false, status, json: async () => ({}), text: async () => text }) as any;

describe('generateImage', () => {
  it('posts to /images with object-shaped input_references, seed and resolution, and returns a data url', async () => {
    const fetchMock = vi.fn(async (_url: string, _init: any) => ok({ data: [{ b64_json: 'AAAA', media_type: 'image/png' }] }));
    const out = await generateImage({ prompt: 'p', images: [PNG, PNG], aspectRatio: '4:5', seed: 7, apiKey: API_KEY }, { fetch: fetchMock });
    expect(out).toBe('data:image/png;base64,AAAA');
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://openrouter.ai/api/v1/images');
    const body = JSON.parse(init.body);
    expect(body.input_references).toEqual([{ type: 'image_url', image_url: { url: PNG } }, { type: 'image_url', image_url: { url: PNG } }]);
    expect(body.seed).toBe(7);
    expect(body.resolution).toBe('2K');
    expect(body.aspect_ratio).toBe('4:5');
    expect(body.n).toBe(1);
    expect(init.headers.Authorization).toBe(`Bearer ${API_KEY}`);
  });
  it('maps 429 to RetryableError and 401 to FatalError', async () => {
    await expect(generateImage({ prompt: 'p', images: [PNG], aspectRatio: '1:1', seed: 1, apiKey: API_KEY }, { fetch: vi.fn(async () => fail(429)) })).rejects.toBeInstanceOf(RetryableError);
    await expect(generateImage({ prompt: 'p', images: [PNG], aspectRatio: '1:1', seed: 1, apiKey: API_KEY }, { fetch: vi.fn(async () => fail(401)) })).rejects.toBeInstanceOf(FatalError);
  });
  it('treats an empty data array as retryable', async () => {
    await expect(generateImage({ prompt: 'p', images: [PNG], aspectRatio: '1:1', seed: 1, apiKey: API_KEY }, { fetch: vi.fn(async () => ok({ data: [] })) })).rejects.toBeInstanceOf(RetryableError);
  });
  it('downloads a hosted url result and returns it as a data url', async () => {
    const bytes = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
    const fetchMock = vi.fn(async (url: string) => {
      if (String(url).endsWith('/images')) return ok({ data: [{ url: 'https://cdn.example/img-1' }] });
      return {
        ok: true,
        status: 200,
        headers: { get: (h: string) => (h.toLowerCase() === 'content-type' ? 'image/png' : null) },
        arrayBuffer: async () => bytes.buffer,
      } as any;
    });
    const out = await generateImage({ prompt: 'p', images: [PNG], aspectRatio: '1:1', seed: 1, apiKey: API_KEY }, { fetch: fetchMock as any });
    expect(out.startsWith('data:image/png;base64,')).toBe(true);
    expect(out).toBe(`data:image/png;base64,${Buffer.from(bytes).toString('base64')}`);
    expect(fetchMock.mock.calls[1][0]).toBe('https://cdn.example/img-1');
  });

  it('falls back to chat completions when /images answers 400', async () => {
    const fetchMock = vi.fn(async (url: string, _init?: any) => {
      if (String(url).endsWith('/images')) return fail(400, 'unsupported');
      return ok({ choices: [{ message: { images: [{ image_url: { url: 'data:image/png;base64,BBBB' } }] } }] });
    });
    const out = await generateImage({ prompt: 'p', images: [PNG], aspectRatio: '1:1', seed: 3, apiKey: API_KEY }, { fetch: fetchMock as any });
    expect(out).toBe('data:image/png;base64,BBBB');
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[1][0]).toBe('https://openrouter.ai/api/v1/chat/completions');
    const body = JSON.parse((fetchMock.mock.calls[1][1] as any).body);
    expect(body.modalities).toEqual(['image', 'text']);
    expect(body.messages[0].content[0]).toEqual({ type: 'text', text: 'p' });
  });

  it('turns a provider timeout into a RetryableError', async () => {
    const fetchMock = vi.fn(async () => { throw new DOMException('x', 'TimeoutError'); });
    await expect(generateImage({ prompt: 'p', images: [PNG], aspectRatio: '1:1', seed: 1, apiKey: API_KEY }, { fetch: fetchMock as any }))
      .rejects.toBeInstanceOf(RetryableError);
    expect(PROVIDER_TIMEOUT_MS).toBe(120_000);
  });

  it('passes an abort signal on every provider call', async () => {
    const fetchMock = vi.fn(async (_url: string, _init?: any) => ok({ data: [{ b64_json: 'AAAA' }] }));
    await generateImage({ prompt: 'p', images: [PNG], aspectRatio: '1:1', seed: 1, apiKey: API_KEY }, { fetch: fetchMock as any });
    expect((fetchMock.mock.calls[0][1] as any).signal).toBeInstanceOf(AbortSignal);
  });

  it('uses the gemini fallback when there is no OpenRouter key', async () => {
    const prev = process.env.OPENROUTER_API_KEY;
    delete process.env.OPENROUTER_API_KEY;
    try {
      const geminiFallback = vi.fn(async () => PNG);
      const out = await generateImage({ prompt: 'p', images: [PNG], aspectRatio: '1:1', seed: 1, apiKey: null }, { fetch: vi.fn(), geminiFallback });
      expect(out).toBe(PNG);
      expect(geminiFallback).toHaveBeenCalledTimes(1);
    } finally {
      if (prev) process.env.OPENROUTER_API_KEY = prev;
    }
  });
});

describe('askVision', () => {
  it('sends text plus every image and returns the content string', async () => {
    const fetchMock = vi.fn(async (_url: string, _init: any) => ok({ choices: [{ message: { content: '{"items":[]}' } }] }));
    const out = await askVision({ prompt: 'grade', images: [PNG, PNG, PNG], apiKey: API_KEY }, { fetch: fetchMock });
    expect(out).toBe('{"items":[]}');
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.messages[0].content).toHaveLength(4);
    expect(body.messages[0].content[0]).toEqual({ type: 'text', text: 'grade' });
    expect(body.messages[0].content[3]).toEqual({ type: 'image_url', image_url: { url: PNG } });
    expect(body.temperature).toBe(0.1);
  });
  it('joins array content parts', async () => {
    const fetchMock = vi.fn(async () => ok({ choices: [{ message: { content: [{ type: 'text', text: 'a' }, { type: 'text', text: 'b' }] } }] }));
    expect(await askVision({ prompt: 'x', images: [], apiKey: API_KEY }, { fetch: fetchMock })).toBe('ab');
  });
  it('throws FatalError when no key resolves', async () => {
    const prev = process.env.OPENROUTER_API_KEY;
    delete process.env.OPENROUTER_API_KEY;
    try {
      await expect(askVision({ prompt: 'x', images: [], apiKey: null }, { fetch: vi.fn() })).rejects.toBeInstanceOf(FatalError);
    } finally {
      if (prev) process.env.OPENROUTER_API_KEY = prev;
    }
  });
});
