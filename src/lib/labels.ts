// src/lib/labels.ts
// Plain-language names for ids that leak into the UI.
import { CurtainTemplate, Fabric } from '../types/curtain';

const PROVIDER_NAMES: Record<string, string> = {
  nano_banana_pro: 'Nano Banana Pro',
  seedream_edit: 'Seedream 4.5',
  gpt_image_2: 'GPT Image 2',
  openrouter_unified: 'OpenRouter',
  openrouter_flux: 'FLUX Fill Pro',
  flux_kontext: 'FLUX Kontext',
  qwen_image_edit: 'Qwen Image Edit',
};

export function providerLabel(id: string): string {
  if (PROVIDER_NAMES[id]) return PROVIDER_NAMES[id];
  const lower = id.toLowerCase();
  if (lower.includes('nano banana')) return 'Nano Banana Pro';
  if (lower.includes('flux')) return 'FLUX Fill Pro';
  if (lower.includes('seedream')) return 'Seedream 4.5';
  return id;
}

export function styleOriginBadge(t: CurtainTemplate, currentBrandId: string): 'Your photo' | 'Built-in' {
  return t.brand_id === currentBrandId && t.source === 'user_upload' ? 'Your photo' : 'Built-in';
}

export function fabricOriginBadge(f: Fabric): 'Your fabric' | 'Built-in' {
  const own = f.source === 'camera_capture' || f.source === 'bulk_upload' || f.source === 'custom' || f.visibility === 'session_only' || f.is_custom;
  return own ? 'Your fabric' : 'Built-in';
}
