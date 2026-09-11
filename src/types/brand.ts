// src/types/brand.ts

export type BrandRole = 'platform_admin' | 'brand_admin' | 'brand_staff';

export type BrandStatus = 'pending_review' | 'onboarding' | 'active' | 'suspended';

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  theme_accent_color: string;
  primary_contact_name: string;
  primary_contact_email: string;
  primary_contact_phone: string | null;
  status: BrandStatus;
  onboarding_step: number; // 1 to 5
  created_at: string;
  activated_at: string | null;
}

export type RegionEditProvider = 'flux_kontext' | 'qwen_image_edit' | 'gpt_image_2';
export type RoomPreviewProvider = 'nano_banana_pro' | 'seedream_edit' | 'gpt_image_2';
export type KeyMode = 'platform_managed' | 'brand_byo_key';

export interface BrandModelConfig {
  id: string;
  brand_id: string;
  region_edit_provider: RegionEditProvider;
  room_preview_provider: RoomPreviewProvider;
  key_mode: KeyMode;
  byo_api_key_encrypted?: string | null;
  byo_provider?: string | null;
  monthly_generation_cap?: number | null; // null = platform default
  monthly_generations_used?: number;
  updated_at: string;
  updated_by_user_id: string;
}

export interface BrandUser {
  id: string;
  brand_id: string;
  name: string;
  email: string;
  role: BrandRole;
  avatar_url?: string;
  created_at: string;
}

export interface RoomPreview {
  id: string;
  design_id: string;
  brand_id: string;
  room_source: 'template_original' | 'uploaded';
  room_photo_url: string;
  output_url: string;
  provider_used: string;
  created_at: string;
}

export interface Design {
  id: string;
  brand_id: string;
  template_id: string;
  template_name: string;
  name: string;
  assignments: Array<{
    region_id: string;
    fabric_id: string;
    scale: number;
    rotation: number;
    brightness?: number;
  }>;
  final_image_url: string;
  created_at: string;
  created_by_user_id: string;
  room_previews: RoomPreview[];
}

/**
 * Calculates relative luminance according to WCAG specifications
 */
function getRelativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Parses 3-digit or 6-digit hex color to [r, g, b]
 */
export function parseHexColor(hex: string): [number, number, number] | null {
  const clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16);
    const g = parseInt(clean[1] + clean[1], 16);
    const b = parseInt(clean[2] + clean[2], 16);
    return isNaN(r) || isNaN(g) || isNaN(b) ? null : [r, g, b];
  }
  if (clean.length === 6) {
    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);
    return isNaN(r) || isNaN(g) || isNaN(b) ? null : [r, g, b];
  }
  return null;
}

/**
 * Checks contrast ratio against white (#FFFFFF, luminance 1.0)
 * Section 2.6: WCAG AA requires contrast ratio >= 4.5:1 for normal text use.
 */
export function validateAccentContrast(hex: string): {
  isValid: boolean;
  contrastRatio: number;
  closestSafeHex: string;
} {
  const rgb = parseHexColor(hex);
  if (!rgb) {
    return { isValid: false, contrastRatio: 1, closestSafeHex: '#5B4FE0' };
  }

  const [r, g, b] = rgb;
  const l1 = 1.0; // white
  const l2 = getRelativeLuminance(r, g, b);
  const ratio = (l1 + 0.05) / (l2 + 0.05);

  if (ratio >= 4.5) {
    return {
      isValid: true,
      contrastRatio: Math.round(ratio * 10) / 10,
      closestSafeHex: hex,
    };
  }

  // Darken until ratio >= 4.5
  let factor = 0.85;
  let darkenedHex = hex;
  for (let i = 0; i < 15; i++) {
    const dr = Math.max(0, Math.floor(r * factor));
    const dg = Math.max(0, Math.floor(g * factor));
    const db = Math.max(0, Math.floor(b * factor));
    const dl2 = getRelativeLuminance(dr, dg, db);
    const dRatio = (l1 + 0.05) / (dl2 + 0.05);
    darkenedHex = '#' + [dr, dg, db].map((x) => x.toString(16).padStart(2, '0')).join('');
    if (dRatio >= 4.5) {
      break;
    }
    factor -= 0.08;
  }

  return {
    isValid: false,
    contrastRatio: Math.round(ratio * 10) / 10,
    closestSafeHex: darkenedHex,
  };
}

/**
 * Helper to generate hover and tint shades from an accent color
 */
export function deriveAccentPalette(hex: string) {
  const rgb = parseHexColor(hex) || [91, 79, 224];
  const [r, g, b] = rgb;
  const hoverR = Math.max(0, Math.floor(r * 0.82));
  const hoverG = Math.max(0, Math.floor(g * 0.82));
  const hoverB = Math.max(0, Math.floor(b * 0.82));
  const hoverHex = '#' + [hoverR, hoverG, hoverB].map((x) => x.toString(16).padStart(2, '0')).join('');
  const tint = `rgba(${r}, ${g}, ${b}, 0.08)`;
  return {
    accent: hex,
    hover: hoverHex,
    tint,
  };
}
