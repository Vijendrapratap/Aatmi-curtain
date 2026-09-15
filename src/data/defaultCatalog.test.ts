import { describe, it, expect } from 'vitest';
import { DEFAULT_TEMPLATES } from './defaultCatalog';

describe('built-in catalog', () => {
  it('gives every style its own photo, so the same picture never shows two different zone sets', () => {
    const seen = new Map<string, string>();
    for (const t of DEFAULT_TEMPLATES) {
      const photo = t.real_photo_url || t.original_image_url;
      expect(seen.get(photo), `${t.name} reuses the photo of ${seen.get(photo)}`).toBeUndefined();
      seen.set(photo, t.name);
    }
  });
  it('keeps every zone polygon inside the photo', () => {
    for (const t of DEFAULT_TEMPLATES) for (const r of t.regions) {
      expect(r.polygon_coords.length).toBeGreaterThanOrEqual(3);
      for (const p of r.polygon_coords) { expect(p.x).toBeGreaterThanOrEqual(0); expect(p.x).toBeLessThanOrEqual(100); expect(p.y).toBeGreaterThanOrEqual(0); expect(p.y).toBeLessThanOrEqual(100); }
    }
  });
});
