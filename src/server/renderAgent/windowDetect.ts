// src/server/renderAgent/windowDetect.ts
import type { VisionRequest } from './imageClient';
import { askVision } from './imageClient';
import { FatalError, RetryableError } from './errors';
import type { Bbox } from './types';

export const WINDOW_DETECT_PROMPT =
  'Locate the window in this room photo. If a window is visible, return a JSON object: {"hasWindow": true, "bbox": {"x": number, "y": number, "width": number, "height": number}} where the box covers the whole window opening AND any existing curtains, drapes, sheers, rod, track or pelmet around it, from the top of the rod to where the curtains meet the floor, with values as percentages of the image from 0 to 100. If no window exists, return {"hasWindow": false}. Output valid JSON only.';

export const NO_WINDOW_MESSAGE = "We couldn't find a window in this photo. Try a clearer shot of the wall with the window.";

export async function detectWindow(
  roomPhoto: string,
  apiKey: string | null,
  ask: (req: VisionRequest) => Promise<string> = askVision
): Promise<Bbox> {
  const raw = await ask({ prompt: WINDOW_DETECT_PROMPT, images: [roomPhoto], apiKey });
  const cleaned = raw.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();
  let parsed: any;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new RetryableError(`Window detector returned non-JSON: ${cleaned.slice(0, 120)}`);
  }
  if (parsed?.hasWindow === false) throw new FatalError(NO_WINDOW_MESSAGE, 'NO_WINDOW_DETECTED');
  const b = parsed?.bbox;
  if (!b || [b.x, b.y, b.width, b.height].some((n) => typeof n !== 'number')) throw new RetryableError('Window detector returned no bbox');
  const clamp = (n: number) => Math.max(0, Math.min(100, n));
  const x = clamp(b.x);
  const y = clamp(b.y);
  return { x, y, width: clamp(b.width) - Math.max(0, x + clamp(b.width) - 100), height: clamp(b.height) - Math.max(0, y + clamp(b.height) - 100) };
}
