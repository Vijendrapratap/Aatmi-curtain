// src/server/renderAgent/imageClient.ts
import { GoogleGenAI } from '@google/genai';
import { getEffectiveOpenRouterKey, OPENROUTER_RECOMMENDED_MODELS } from '../openrouter';
import { parseBase64Image } from '../images';
import { classifyHttpStatus, FatalError, RetryableError } from './errors';

const BASE = 'https://openrouter.ai/api/v1';
export const GENERATE_MODEL = process.env.OPENROUTER_ROOM_VIZ_MODEL || OPENROUTER_RECOMMENDED_MODELS.roomVizArchitectural;
export const VISION_MODEL = process.env.OPENROUTER_VISION_MODEL || OPENROUTER_RECOMMENDED_MODELS.vision;

export interface GenerateRequest { prompt: string; images: string[]; aspectRatio: string; seed: number; apiKey: string | null }
export interface VisionRequest { prompt: string; images: string[]; apiKey: string | null }
export interface ClientDeps { fetch?: typeof fetch; geminiFallback?: (req: GenerateRequest) => Promise<string> }

function headers(key: string) {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${key}`, 'HTTP-Referer': 'https://aatmi.design', 'X-Title': 'Aatmi Curtain Studio' };
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
  const res = await doFetch(`${BASE}/images`, { method: 'POST', headers: headers(key), body: JSON.stringify(body) });
  if (!res.ok) throw classifyHttpStatus(res.status, await res.text());
  const data = await res.json();
  const first = data?.data?.[0];
  if (first?.b64_json) return `data:${first.media_type || 'image/png'};base64,${first.b64_json}`;
  if (first?.url) return first.url;
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
  const res = await doFetch(`${BASE}/chat/completions`, { method: 'POST', headers: headers(key), body: JSON.stringify(body) });
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
