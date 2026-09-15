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
import { fetchMe, loginApi, logoutApi, acceptInviteApi, loadCollection, putDocumentApi, deleteDocumentApi, getModelConfigApi, patchModelConfigApi, SessionInfo } from './accountClient';

export interface BrandStoreState {
  // Tenancy & Auth
  currentBrandId: string;
  brands: Brand[];
  currentUser: BrandUser | null;
  demoUsers: BrandUser[];
  setCurrentBrand: (brandId: string) => void;
  setCurrentUser: (user: BrandUser | null) => void;

  // Session (server-backed accounts)
  session: 'loading' | 'signed_out' | 'signed_in';
  bootstrapSession: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  acceptInvite: (token: string, name: string, password: string) => Promise<void>;
  updateBrand: (brandId: string, updates: Partial<Brand>) => Promise<Brand>;

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
  updateDesign: (designId: string, updates: Partial<Design>) => void;

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
    | 'editor'
    | 'room'
    | 'library_styles'
    | 'library_fabrics'
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

// Seed templates and fabrics with brand_id for tenancy
// Built-in styles and fabrics are platform-wide (brand_id null); a brand's own live on the server.
const SEEDED_TEMPLATES: CurtainTemplate[] = DEFAULT_TEMPLATES.map((tpl) => ({ ...tpl, brand_id: null, source: 'catalog' }));
const SEEDED_FABRICS: Fabric[] = DEFAULT_FABRICS.map((fab) => ({ ...fab, brand_id: null, visibility: 'catalog' as const, source: 'catalog' as const }));

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
    applyRootTheme('#5B4FE0');
  }

  /**
   * Writes a brand-owned document through to the server; platform defaults are never persisted.
   * Saves of the same document run one after another so a slow large save cannot overtake a later small one,
   * and the server's copy (images swapped for /images/ URLs) replaces the local one unless it was edited meanwhile.
   */
  const saveChains = new Map<string, Promise<void>>();
  const stateKey = { designs: 'designs', fabrics: 'brandFabrics', templates: 'brandTemplates' } as const;
  const persist = (collection: 'designs' | 'fabrics' | 'templates', doc: { id: string; brand_id?: string | null }) => {
    if (get().session !== 'signed_in' || !doc.brand_id || doc.brand_id !== get().currentBrandId) return;
    const key = `${collection}/${doc.id}`;
    const run = (saveChains.get(key) ?? Promise.resolve())
      .then(() => putDocumentApi(collection, doc as any))
      .then((saved) => {
        const k = stateKey[collection];
        set((state) => ({ [k]: (state[k] as any[]).map((d) => (d === doc ? saved : d)) }) as any);
      })
      .catch((e) => console.warn(`Could not save ${collection}/${doc.id}:`, e?.message || e))
      .finally(() => { if (saveChains.get(key) === run) saveChains.delete(key); });
    saveChains.set(key, run);
  };
  const unpersist = (collection: 'designs' | 'fabrics' | 'templates', id: string) => {
    if (get().session !== 'signed_in') return;
    deleteDocumentApi(collection, id).catch((e) => console.warn(`Could not delete ${collection}/${id}:`, e?.message || e));
  };

  const applySession = async (info: SessionInfo) => {
    const brand = info.brand;
    const isAdmin = info.user.role === 'platform_admin';
    if (brand) applyRootTheme(brand.theme_accent_color);
    set({
      session: 'signed_in',
      currentUser: info.user,
      brands: brand ? [brand] : [],
      currentBrandId: brand?.id || '',
      activeView: brand ? 'dashboard' : isAdmin ? 'platform_admin' : 'dashboard',
      activeDesignId: null,
      designs: [],
      brandTemplates: SEEDED_TEMPLATES,
      brandFabrics: SEEDED_FABRICS,
    });
    if (brand) {
      getModelConfigApi().then((config) => set((state) => ({ modelConfigs: { ...state.modelConfigs, [brand.id]: config } }))).catch((e) => console.warn('Could not load model settings:', e?.message || e));
      try {
        const [designs, fabrics, templates] = await Promise.all([loadCollection<Design>('designs'), loadCollection<Fabric>('fabrics'), loadCollection<CurtainTemplate>('templates')]);
        set({ designs: [...designs].reverse(), brandFabrics: [...fabrics.reverse(), ...SEEDED_FABRICS], brandTemplates: [...templates.reverse(), ...SEEDED_TEMPLATES], activeDesignId: designs.length ? designs[designs.length - 1].id : null });
      } catch (e: any) {
        console.warn('Could not load brand data:', e?.message || e);
      }
    }
  };

  return {
    currentBrandId: '',
    brands: [],
    currentUser: null,
    demoUsers: [],

    session: 'loading',
    bootstrapSession: async () => {
      try { await applySession(await fetchMe()); } catch { set({ session: 'signed_out', currentUser: null }); }
    },
    signIn: async (email, password) => { await applySession(await loginApi(email, password)); },
    signOut: async () => {
      try { await logoutApi(); } catch { /* the cookie is gone either way */ }
      set({ session: 'signed_out', currentUser: null, brands: [], currentBrandId: '', designs: [], activeDesignId: null, activeView: 'dashboard' });
    },
    acceptInvite: async (token, name, password) => { await applySession(await acceptInviteApi(token, name, password)); },

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

      // Brand name, accent and status are changed by the platform admin (PATCH /api/admin/brands/:id); this only updates the screen.
      return updatedBrand;
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
        const saved = await patchModelConfigApi(updates as Record<string, unknown>);
        set((state) => ({ modelConfigs: { ...state.modelConfigs, [brandId]: saved } }));
        return saved;
      } catch (e: any) {
        console.warn('Could not save model settings:', e?.message || e);
        return updated;
      }
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

    designs: [],

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
      persist('designs', newDesign);
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
      const updated = get().designs.find((d) => d.id === designId);
      if (updated) persist('designs', updated);
      return newPreview;
    },

    getDesign: (designId) => {
      return get().designs.find((d) => d.id === designId);
    },

    updateDesign: (designId, updates) => {
      set((state) => ({
        designs: state.designs.map((d) => (d.id === designId ? { ...d, ...updates } : d)),
      }));
      const updated = get().designs.find((d) => d.id === designId);
      if (updated) persist('designs', updated);
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
      persist('fabrics', withBrand);
    },

    updateBrandFabric: (fabricId, updates) => {
      set((state) => ({
        brandFabrics: state.brandFabrics.map((f) =>
          f.id === fabricId ? { ...f, ...updates } : f
        ),
      }));
      const updated = get().brandFabrics.find((f) => f.id === fabricId);
      if (updated) persist('fabrics', updated);
    },

    archiveBrandFabric: (fabricId) => {
      const existing = get().brandFabrics.find((f) => f.id === fabricId);
      set((state) => ({
        brandFabrics: state.brandFabrics.filter((f) => f.id !== fabricId),
      }));
      if (existing?.brand_id) unpersist('fabrics', fabricId);
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
      branded.forEach((f) => persist('fabrics', f));
    },

    addBrandTemplate: (template) => {
      const withBrand: CurtainTemplate = {
        ...template,
        brand_id: template.brand_id || get().currentBrandId,
      };
      set((state) => ({
        brandTemplates: [withBrand, ...state.brandTemplates],
      }));
      persist('templates', withBrand);
    },

    applyBrandTheme: (hex) => {
      applyRootTheme(hex);
    },

    activeView: 'dashboard',
    setActiveView: (activeView) => set({ activeView }),
    activeDesignId: null,
    setActiveDesignId: (activeDesignId) => set({ activeDesignId }),
  };
});
