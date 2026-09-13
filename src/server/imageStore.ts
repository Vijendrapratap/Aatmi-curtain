// src/server/imageStore.ts
// Writes data-URL images to DATA_DIR/images and rewrites documents to reference them by URL.
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { DATA_DIR } from './db';

export const IMAGES_DIR = path.join(DATA_DIR, 'images');
const EXT: Record<string, string> = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp' };

/** Stores a raster data URL as a file and returns its served URL, or null if it is not a raster data URL. */
export function storeImage(dataUrl: string, dir = IMAGES_DIR): string | null {
  const m = dataUrl.match(/^data:(image\/(?:png|jpeg|jpg|webp));base64,([A-Za-z0-9+/=\s]+)$/i);
  if (!m) return null;
  const mime = m[1].toLowerCase() === 'image/jpg' ? 'image/jpeg' : m[1].toLowerCase();
  const bytes = Buffer.from(m[2].replace(/\s+/g, ''), 'base64');
  const name = `${crypto.createHash('sha256').update(bytes).digest('hex').slice(0, 32)}.${EXT[mime]}`;
  const file = path.join(dir, name);
  if (!fs.existsSync(file)) {
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(file, bytes);
  }
  return `/images/${name}`;
}

const MIN_INLINE = 2048; // tiny data URLs (icons) stay inline

/** Recursively replaces raster data-URL strings with stored image URLs. */
export function externalizeImages<T>(value: T, store: (dataUrl: string) => string | null = storeImage): T {
  if (typeof value === 'string') {
    if (value.startsWith('data:image/') && value.length > MIN_INLINE) return (store(value) ?? value) as T;
    return value;
  }
  if (Array.isArray(value)) return value.map((v) => externalizeImages(v, store)) as T;
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) out[k] = externalizeImages(v, store);
    return out as T;
  }
  return value;
}
