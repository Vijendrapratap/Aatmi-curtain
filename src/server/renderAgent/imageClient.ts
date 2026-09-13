// src/server/renderAgent/imageClient.ts
import { GoogleGenAI } from '@google/genai';
import { getEffectiveOpenRouterKey, OPENROUTER_RECOMMENDED_MODELS } from '../openrouter';
import { parseBase64Image } from '../images';
import { classifyHttpStatus, FatalError, RetryableError } from './errors';

const BASE = 'https://openrouter.ai/api/v1';
export const GENERATE_MODEL = process.env.OPENROUTER_ROOM_VIZ_MODEL || OPENROUTER_RECOMMENDED_MODELS.roomVizArchitectural;
export const VISION_MODEL = process.env.OPENROUTER_VISION_MODEL || OPENROUTER_RECOMMENDED_MODELS.vision;

/** Wall-clock ceiling for any single provider call (generate, grade, or image download). */
export const PROVIDER_TIMEOUT_MS = 120_000;

export interface GenerateRequest { prompt: string; images: string[]; aspectRatio: string; seed: number; apiKey: string | null }
export interface VisionRequest { prompt: string; images: string[]; apiKey: string | null }
export interface ClientDeps { fetch?: typeof fetch; geminiFallback?: (req: GenerateRequest) => Promise<string> }

function headers(key: string) {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${key}`, 'HTTP-Referer': 'https://aatmi.design', 'X-Title': 'Aatmi Curtain Studio' };
}

function isTimeout(err: any): boolean {
  const name = err?.name;
  return name === 'AbortError' || name === 'TimeoutError';
}

/** Every provider call goes through here so a hung socket cannot stall a job forever. */
async function timedFetch(doFetch: typeof fetch, url: string, init: RequestInit = {}): Promise<any> {
  try {
    return await doFetch(url, { ...init, signal: AbortSignal.timeout(PROVIDER_TIMEOUT_MS) } as any);
  } catch (err: any) {
    if (isTimeout(err)) throw new RetryableError('Provider timed out');
    throw err;
  }
}

/** Providers may answer with a hosted URL; the lock stage only understands data URLs, so fetch it here. */
async function asDataUrl(value: string, doFetch: typeof fetch): Promise<string> {
  if (value.startsWith('data:')) return value;
  const res = await timedFetch(doFetch, value);
  if (!res.ok) throw new RetryableError(`Could not download the generated image (HTTP ${res.status})`);
  const mime = (res.headers?.get?.('content-type') || 'image/png').split(';')[0].trim() || 'image/png';
  const buf = Buffer.from(await res.arrayBuffer());
  return `data:${mime};base64,${buf.toString('base64')}`;
}

export async function generateImage(req: GenerateRequest, deps: ClientDeps = {}): Promise<string> {
  const doFetch = deps.fetch ?? fetch;
  const key = getEffectiveOpenRouterKey(req.apiKey);
  if (!key) {
    const fallback = deps.geminiFallback ?? geminiGenerate;
    return fallback(req);
  }
  const body = {
    model: GENERATE_MODEL,
    prompt: req.prompt,
    n: 1,
    seed: req.seed,
    resolution: '2K',
    aspect_ratio: req.aspectRatio,
    output_format: 'png',
    input_references: req.images.map((url) => ({ type: 'image_url', image_url: { url } })),
  };
  const res = await timedFetch(doFetch, `${BASE}/images`, { method: 'POST', headers: headers(key), body: JSON.stringify(body) });
  // A 400 means this deployment's model does not take the /images shape: fall back to chat completions once.
  if (res.status === 400) return generateViaChat(req, key, doFetch);
  if (!res.ok) throw classifyHttpStatus(res.status, await res.text());
  const data = await res.json();
  const first = data?.data?.[0];
  if (first?.b64_json) return `data:${first.media_type || 'image/png'};base64,${first.b64_json}`;
  if (first?.url) return asDataUrl(String(first.url), doFetch);
  throw new RetryableError('Image model returned no image');
}

async function generateViaChat(req: GenerateRequest, key: string, doFetch: typeof fetch): Promise<string> {
  const body = {
    model: GENERATE_MODEL,
    modalities: ['image', 'text'],
    messages: [{ role: 'user', content: [{ type: 'text', text: req.prompt }, ...req.images.map((url) => ({ type: 'image_url', image_url: { url } }))] }],
  };
  const res = await timedFetch(doFetch, `${BASE}/chat/completions`, { method: 'POST', headers: headers(key), body: JSON.stringify(body) });
  if (!res.ok) throw classifyHttpStatus(res.status, await res.text());
  const data = await res.json();
  const message = data?.choices?.[0]?.message;
  const direct = message?.images?.[0]?.image_url?.url;
  if (typeof direct === 'string' && direct) return asDataUrl(direct, doFetch);
  const content = message?.content;
  if (Array.isArray(content)) {
    for (const part of content) {
      const url = part?.type === 'image_url' ? part?.image_url?.url : undefined;
      if (typeof url === 'string' && url) return asDataUrl(url, doFetch);
    }
  }
  if (typeof content === 'string') {
    const match = content.match(/data:image\/[a-zA-Z0-9.+-]+;base64,[A-Za-z0-9+/=]+/);
    if (match) return match[0];
  }
  throw new RetryableError('Image model returned no image');
}

export async function askVision(req: VisionRequest, deps: ClientDeps = {}): Promise<string> {
  const doFetch = deps.fetch ?? fetch;
  const key = getEffectiveOpenRouterKey(req.apiKey);
  if (!key) throw new FatalError('OPENROUTER_API_KEY is not configured', 'BAD_KEY');
  const body = {
    model: VISION_MODEL,
    temperature: 0.1,
    messages: [{ role: 'user', content: [{ type: 'text', text: req.prompt }, ...req.images.map((url) => ({ type: 'image_url', image_url: { url } }))] }],
  };
  const res = await timedFetch(doFetch, `${BASE}/chat/completions`, { method: 'POST', headers: headers(key), body: JSON.stringify(body) });
  if (!res.ok) throw classifyHttpStatus(res.status, await res.text());
  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) return content.map((p: any) => (p?.type === 'text' ? p.text : '')).join('');
  throw new RetryableError('Vision model returned no content');
}

async function geminiGenerate(req: GenerateRequest): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new FatalError('No OPENROUTER_API_KEY or GEMINI_API_KEY configured', 'BAD_KEY');
  const ai = new GoogleGenAI({ apiKey, httpOptions: { headers: { 'User-Agent': 'aistudio-build' } } });
  const parts: any[] = [];
  for (const img of req.images) {
    const p = parseBase64Image(img);
    if (!p) throw new FatalError('Reference image is not a raster data URL', 'BAD_REQUEST');
    parts.push({ inlineData: { data: p.base64, mimeType: p.mimeType } });
  }
  parts.push({ text: req.prompt });
  const resp = await ai.models.generateContent({
    model: process.env.GEMINI_IMAGE_MODEL || 'gemini-3.1-flash-image',
    config: { imageConfig: { aspectRatio: req.aspectRatio, imageSize: '2K' } },
    contents: { parts },
  });
  for (const part of resp.candidates?.[0]?.content?.parts ?? []) {
    if (part.inlineData?.data) return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
  }
  throw new RetryableError('Gemini returned no image');
}
