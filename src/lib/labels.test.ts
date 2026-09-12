import { describe, it, expect } from 'vitest';
import { providerLabel, styleOriginBadge, fabricOriginBadge } from './labels';
import { DEFAULT_TEMPLATES, DEFAULT_FABRICS } from '../data/defaultCatalog';

describe('labels', () => {
  it('maps provider ids to plain names and falls back to the id', () => {
    expect(providerLabel('nano_banana_pro')).toBe('Nano Banana Pro');
    expect(providerLabel('openrouter_flux')).toBe('FLUX Fill Pro');
    expect(providerLabel('Nano Banana Pro (Gemini 3 Pro Image)')).toBe('Nano Banana Pro');
    expect(providerLabel('something_new')).toBe('something_new');
  });

  it('badges styles by origin', () => {
    const builtIn = { ...DEFAULT_TEMPLATES[0], brand_id: null, source: 'catalog' as const };
    const mine = { ...DEFAULT_TEMPLATES[0], brand_id: 'b1', source: 'user_upload' as const };
    expect(styleOriginBadge(builtIn, 'b1')).toBe('Built-in');
    expect(styleOriginBadge(mine, 'b1')).toBe('Your photo');
  });

  it('badges fabrics by origin', () => {
    expect(fabricOriginBadge({ ...DEFAULT_FABRICS[0], source: 'catalog' })).toBe('Built-in');
    expect(fabricOriginBadge({ ...DEFAULT_FABRICS[0], source: 'camera_capture' })).toBe('Your fabric');
    expect(fabricOriginBadge({ ...DEFAULT_FABRICS[0], visibility: 'session_only' })).toBe('Your fabric');
  });
});
