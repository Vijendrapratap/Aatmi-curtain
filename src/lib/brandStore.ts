// src/lib/brandStore.ts
import { create } from 'zustand';
import {
  Brand,
  BrandModelConfig,
  BrandUser,
  Design,
  RoomPreview,
  deriveAccentPalette,
  validateAccentContrast,
} from '../types/brand';
import { CurtainTemplate, Fabric, FabricAssignment } from '../types/curtain';
import { DEFAULT_FABRICS, DEFAULT_TEMPLATES } from '../data/defaultCatalog';

export interface BrandStoreState {
  // Tenancy & Auth
  currentBrandId: string;
  brands: Brand[];
  currentUser: BrandUser | null;
  demoUsers: BrandUser[];
  setCurrentBrand: (brandId: string) => void;
  setCurrentUser: (user: BrandUser | null) => void;
  updateBrand: (brandId: string, updates: Partial<Brand>) => Promise<Brand>;
  createBrand: (brandData: Omit<Brand, 'id' | 'created_at' | 'activated_at' | 'status' | 'onboarding_step'>) => Promise<Brand>;

  // Model Configurations
  modelConfigs: Record<string, BrandModelConfig>;
  getModelConfig: (brandId?: string) => BrandModelConfig;
  updateModelConfig: (brandId: string, updates: Partial<BrandModelConfig>) => Promise<BrandModelConfig>;
  testProviderConnection: (provider: string, apiKey?: string, type?: 'region_edit' | 'room_preview') => Promise<{ success: boolean; latencyMs: number; message: string }>;

  // Designs & Room Previews
  designs: Design[];
  saveDesign: (design: Omit<Design, 'id' | 'created_at'>) => Design;
  addRoomPreview: (designId: string, preview: Omit<RoomPreview, 'id' | 'created_at'>) => RoomPreview;
  getDesign: (designId: string) => Design | undefined;

  // Scoped Assets
  brandTemplates: CurtainTemplate[];
  brandFabrics: Fabric[];
  addBrandFabric: (fabric: Fabric) => void;
  updateBrandFabric: (fabricId: string, updates: Partial<Fabric>) => void;
  archiveBrandFabric: (fabricId: string) => void;
  bulkAddBrandFabrics: (fabrics: Fabric[]) => void;
  addBrandTemplate: (template: CurtainTemplate) => void;

  // Theme application
  applyBrandTheme: (hex: string) => void;

  // Active navigation view in brand platform
  activeView:
    | 'dashboard'
    | 'templates'
    | 'editor'
    | 'catalog'
    | 'design_detail'
    | 'settings_profile'
    | 'settings_models'
    | 'settings_team'
    | 'settings_billing'
    | 'platform_admin'
    | 'onboarding';
  setActiveView: (view: BrandStoreState['activeView']) => void;
  activeDesignId: string | null;
  setActiveDesignId: (designId: string | null) => void;
}

const INITIAL_BRANDS: Brand[] = [
  {
    id: 'brand-aatmi-01',
    name: 'Maison Aatmi',
    slug: 'aatmi',
    logo_url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=200&auto=format&fit=crop&q=80',
    theme_accent_color: '#5B4FE0',
    primary_contact_name: 'Elena Vance',
    primary_contact_email: 'elena@aatmi.design',
    primary_contact_phone: '+1 (555) 234-5678',
    status: 'active',
    onboarding_step: 5,
    created_at: '2026-01-15T09:00:00Z',
    activated_at: '2026-01-16T11:30:00Z',
  },
  {
    id: 'brand-lumina-02',
    name: 'Lumina Drapery Studio',
    slug: 'lumina',
    logo_url: null,
    theme_accent_color: '#2FA875',
    primary_contact_name: 'Marcus Thorne',
    primary_contact_email: 'marcus@luminadrapes.com',
    primary_contact_phone: '+1 (555) 890-1234',
    status: 'active',
    onboarding_step: 5,
    created_at: '2026-02-01T14:20:00Z',
    activated_at: '2026-02-02T10:00:00Z',
  },
  {
    id: 'brand-vivienne-03',
    name: 'Atelier Vivienne',
    slug: 'vivienne',
    logo_url: null,
    theme_accent_color: '#C9A961',
    primary_contact_name: 'Vivienne Laurent',
    primary_contact_email: 'vivienne@atelier-vivienne.fr',
    primary_contact_phone: null,
    status: 'pending_review',
    onboarding_step: 1,
    created_at: '2026-03-05T08:15:00Z',
    activated_at: null,
  },
];

const INITIAL_USERS: BrandUser[] = [
  {
    id: 'usr-elena-01',
    brand_id: 'brand-aatmi-01',
    name: 'Elena Vance',
    email: 'elena@aatmi.design',
    role: 'brand_admin',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    created_at: '2026-01-15T09:00:00Z',
  },
  {
    id: 'usr-julian-02',
    brand_id: 'brand-aatmi-01',
    name: 'Julian Croft',
    email: 'julian@aatmi.design',
    role: 'brand_staff',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    created_at: '2026-01-20T10:00:00Z',
  },
  {
    id: 'usr-marcus-01',
    brand_id: 'brand-lumina-02',
    name: 'Marcus Thorne',
    email: 'marcus@luminadrapes.com',
    role: 'brand_admin',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    created_at: '2026-02-01T14:20:00Z',
  },
  {
    id: 'usr-pratap-ops',
    brand_id: 'brand-aatmi-01',
    name: 'Pratap Singh (Platform Ops)',
    email: 'pratap@platform.curtain.ai',
    role: 'platform_admin',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80',
    created_at: '2026-01-01T00:00:00Z',
  },
];

const INITIAL_MODEL_CONFIGS: Record<string, BrandModelConfig> = {
  'brand-aatmi-01': {
    id: 'config-aatmi-01',
    brand_id: 'brand-aatmi-01',
    region_edit_provider: 'flux_kontext',
    room_preview_provider: 'nano_banana_pro',
    key_mode: 'platform_managed',
    byo_api_key_encrypted: null,
    byo_provider: null,
    monthly_generation_cap: 250,
    monthly_generations_used: 28,
    updated_at: '2026-03-01T12:00:00Z',
    updated_by_user_id: 'usr-elena-01',
  },
  'brand-lumina-02': {
    id: 'config-lumina-02',
    brand_id: 'brand-lumina-02',
    region_edit_provider: 'flux_kontext',
    room_preview_provider: 'seedream_edit',
    key_mode: 'platform_managed',
    byo_api_key_encrypted: null,
    byo_provider: null,
    monthly_generation_cap: 100,
    monthly_generations_used: 14,
    updated_at: '2026-03-02T10:00:00Z',
    updated_by_user_id: 'usr-marcus-01',
  },
};

const INITIAL_DESIGNS: Design[] = [
  {
    id: 'design-palazzo-01',
    brand_id: 'brand-aatmi-01',
    template_id: 'template-chevron-accent',
    template_name: 'Palazzo Dual Chevron Drapery',
    name: 'Palazzo Emerald & Gold Living Suite',
    assignments: [
      { region_id: 'reg-upper-field', fabric_id: 'fab-emerald-velvet', scale: 1, rotation: 0 },
      { region_id: 'reg-chevron-accent', fabric_id: 'fab-croc-espresso', scale: 1, rotation: 0 },
      { region_id: 'reg-bottom-hem', fabric_id: 'fab-emerald-velvet', scale: 1, rotation: 0 },
    ],
    final_image_url:
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1024&auto=format&fit=crop&q=80',
    created_at: '2026-03-08T14:30:00Z',
    created_by_user_id: 'usr-elena-01',
    room_previews: [
      {
        id: 'room-prev-01',
        design_id: 'design-palazzo-01',
        brand_id: 'brand-aatmi-01',
        room_source: 'template_original',
        room_photo_url:
          'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1024&auto=format&fit=crop&q=80',
        output_url:
          'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1024&auto=format&fit=crop&q=80',
        provider_used: 'Nano Banana Pro (Gemini 3 Pro Image)',
        created_at: '2026-03-08T15:00:00Z',
      },
    ],
  },
];

// Seed templates and fabrics with brand_id for tenancy
const SEEDED_TEMPLATES: CurtainTemplate[] = DEFAULT_TEMPLATES.map((tpl, i) => ({
  ...tpl,
  brand_id: i === 0 || i === 1 ? 'brand-aatmi-01' : null, // null = platform stencils
  source: i === 0 ? 'user_upload' : 'catalog',
}));

const SEEDED_FABRICS: Fabric[] = DEFAULT_FABRICS.map((fab, i) => ({
  ...fab,
  brand_id: i === 0 || i === 1 ? 'brand-aatmi-01' : null, // null = shared platform catalog available to all brands
  visibility: (i % 6 === 0 ? 'session_only' : 'catalog') as 'session_only' | 'catalog',
  source: (i % 4 === 0 ? 'camera_capture' : 'catalog') as 'camera_capture' | 'catalog',
}));

function applyRootTheme(hex: string) {
  if (typeof document === 'undefined') return;
  const palette = deriveAccentPalette(hex);
  const root = document.documentElement;
  root.style.setProperty('--color-accent', palette.accent);
  root.style.setProperty('--color-accent-hover', palette.hover);
  root.style.setProperty('--color-accent-tint', palette.tint);
}

export const useBrandStore = create<BrandStoreState>((set, get) => {
  // Apply initial theme on boot
  if (typeof window !== 'undefined') {
    applyRootTheme(INITIAL_BRANDS[0].theme_accent_color);
  }

  return {
    currentBrandId: 'brand-aatmi-01',
    brands: INITIAL_BRANDS,
    currentUser: INITIAL_USERS[0],
    demoUsers: INITIAL_USERS,

    setCurrentBrand: (brandId) => {
      const brand = get().brands.find((b) => b.id === brandId);
      if (brand) {
        applyRootTheme(brand.theme_accent_color);
        set({ currentBrandId: brandId });
      }
    },

    setCurrentUser: (user) => {
      set({ currentUser: user });
      if (user && user.brand_id) {
        get().setCurrentBrand(user.brand_id);
      }
    },

    updateBrand: async (brandId, updates) => {
      const existing = get().brands.find((b) => b.id === brandId);
      if (!existing) throw new Error('Brand not found');

      if (updates.theme_accent_color) {
        applyRootTheme(updates.theme_accent_color);
      }

      const updatedBrand: Brand = { ...existing, ...updates };
      set((state) => ({
        brands: state.brands.map((b) => (b.id === brandId ? updatedBrand : b)),
      }));

      // Persist to server if available
      try {
        fetch(`/api/brands/${brandId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });
      } catch (e) {
        // local state remains updated
      }

      return updatedBrand;
    },

    createBrand: async (brandData) => {
      const id = 'brand-' + brandData.slug + '-' + Date.now().toString(36);
      const newBrand: Brand = {
        ...brandData,
        id,
        status: 'onboarding',
        onboarding_step: 1,
        created_at: new Date().toISOString(),
        activated_at: null,
      };

      set((state) => ({
        brands: [...state.brands, newBrand],
        currentBrandId: id,
      }));

      applyRootTheme(newBrand.theme_accent_color);

      // Create model config for new brand
      const newConfig: BrandModelConfig = {
        id: `config-${id}`,
        brand_id: id,
        region_edit_provider: 'flux_kontext',
        room_preview_provider: 'nano_banana_pro',
        key_mode: 'platform_managed',
        monthly_generation_cap: 200,
        monthly_generations_used: 0,
        updated_at: new Date().toISOString(),
        updated_by_user_id: get().currentUser?.id || 'system',
      };

      set((state) => ({
        modelConfigs: { ...state.modelConfigs, [id]: newConfig },
      }));

      try {
        await fetch('/api/brands', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newBrand),
        });
      } catch (e) {}

      return newBrand;
    },

    modelConfigs: INITIAL_MODEL_CONFIGS,

    getModelConfig: (brandId) => {
      const targetId = brandId || get().currentBrandId;
      return (
        get().modelConfigs[targetId] || {
          id: `config-${targetId}`,
          brand_id: targetId,
          region_edit_provider: 'flux_kontext',
          room_preview_provider: 'nano_banana_pro',
          key_mode: 'platform_managed',
          monthly_generation_cap: 200,
          monthly_generations_used: 0,
          updated_at: new Date().toISOString(),
          updated_by_user_id: 'system',
        }
      );
    },

    updateModelConfig: async (brandId, updates) => {
      const current = get().getModelConfig(brandId);
      const updated: BrandModelConfig = {
        ...current,
        ...updates,
        updated_at: new Date().toISOString(),
      };

      set((state) => ({
        modelConfigs: { ...state.modelConfigs, [brandId]: updated },
      }));

      try {
        fetch(`/api/brands/${brandId}/model-config`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });
      } catch (e) {}

      return updated;
    },

    testProviderConnection: async (provider, apiKey, type = 'region_edit') => {
      try {
        const resp = await fetch('/api/test-provider', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ provider, apiKey, type }),
        });
        return await resp.json();
      } catch (err: any) {
        return {
          success: false,
          latencyMs: 0,
          message: err.message || 'Connection test failed',
        };
      }
    },

    designs: INITIAL_DESIGNS,

    saveDesign: (designData) => {
      const id = 'design-' + Date.now();
      const newDesign: Design = {
        ...designData,
        id,
        created_at: new Date().toISOString(),
      };
      set((state) => ({
        designs: [newDesign, ...state.designs],
        activeDesignId: id,
      }));
      return newDesign;
    },

    addRoomPreview: (designId, previewData) => {
      const id = 'room-prev-' + Date.now();
      const newPreview: RoomPreview = {
        ...previewData,
        id,
        created_at: new Date().toISOString(),
      };

      set((state) => ({
        designs: state.designs.map((d) =>
          d.id === designId
            ? { ...d, room_previews: [...(d.room_previews || []), newPreview] }
            : d
        ),
      }));

      return newPreview;
    },

    getDesign: (designId) => {
      return get().designs.find((d) => d.id === designId);
    },

    brandTemplates: SEEDED_TEMPLATES,
    brandFabrics: SEEDED_FABRICS,

    addBrandFabric: (fabric) => {
      const withBrand: Fabric = {
        ...fabric,
        brand_id: fabric.brand_id || get().currentBrandId,
        visibility: fabric.visibility || 'catalog',
      };
      set((state) => ({
        brandFabrics: [withBrand, ...state.brandFabrics],
      }));
    },

    updateBrandFabric: (fabricId, updates) => {
      set((state) => ({
        brandFabrics: state.brandFabrics.map((f) =>
          f.id === fabricId ? { ...f, ...updates } : f
        ),
      }));
    },

    archiveBrandFabric: (fabricId) => {
      set((state) => ({
        brandFabrics: state.brandFabrics.filter((f) => f.id !== fabricId),
      }));
    },

    bulkAddBrandFabrics: (fabrics) => {
      const currentBrandId = get().currentBrandId;
      const branded = fabrics.map((f) => ({
        ...f,
        brand_id: f.brand_id || currentBrandId,
        visibility: 'catalog' as const,
        source: 'bulk_upload' as const,
      }));
      set((state) => ({
        brandFabrics: [...branded, ...state.brandFabrics],
      }));
    },

    addBrandTemplate: (template) => {
      const withBrand: CurtainTemplate = {
        ...template,
        brand_id: template.brand_id || get().currentBrandId,
      };
      set((state) => ({
        brandTemplates: [withBrand, ...state.brandTemplates],
      }));
    },

    applyBrandTheme: (hex) => {
      applyRootTheme(hex);
    },

    activeView: 'dashboard',
    setActiveView: (activeView) => set({ activeView }),
    activeDesignId: INITIAL_DESIGNS[0].id,
    setActiveDesignId: (activeDesignId) => set({ activeDesignId }),
  };
});
