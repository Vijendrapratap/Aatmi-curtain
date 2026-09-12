import { BrandModelConfig } from '../types/brand';

export const SERVER_MODEL_CONFIGS: Map<string, BrandModelConfig> = new Map([
  [
    'brand-aatmi-01',
    {
      id: 'config-aatmi-01',
      brand_id: 'brand-aatmi-01',
      region_edit_provider: 'flux_kontext',
      room_preview_provider: 'nano_banana_pro',
      key_mode: 'platform_managed',
      byo_api_key_encrypted: null,
      byo_provider: null,
      monthly_generation_cap: 250,
      monthly_generations_used: 24,
      updated_at: new Date().toISOString(),
      updated_by_user_id: 'usr-elena-01',
    },
  ],
  [
    'brand-lumina-02',
    {
      id: 'config-lumina-02',
      brand_id: 'brand-lumina-02',
      region_edit_provider: 'flux_kontext',
      room_preview_provider: 'seedream_edit',
      key_mode: 'platform_managed',
      byo_api_key_encrypted: null,
      byo_provider: null,
      monthly_generation_cap: 100,
      monthly_generations_used: 12,
      updated_at: new Date().toISOString(),
      updated_by_user_id: 'usr-marcus-01',
    },
  ],
]);

export function getOrCreateBrandConfig(brandId: string): BrandModelConfig {
  let cfg = SERVER_MODEL_CONFIGS.get(brandId);
  if (!cfg) {
    cfg = {
      id: `config-${brandId}-${Date.now()}`,
      brand_id: brandId,
      region_edit_provider: 'flux_kontext',
      room_preview_provider: 'nano_banana_pro',
      key_mode: 'platform_managed',
      byo_api_key_encrypted: null,
      byo_provider: null,
      monthly_generation_cap: 200,
      monthly_generations_used: 0,
      updated_at: new Date().toISOString(),
      updated_by_user_id: 'system',
    };
    SERVER_MODEL_CONFIGS.set(brandId, cfg);
  }
  return cfg;
}
