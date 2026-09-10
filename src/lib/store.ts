// src/lib/store.ts
import { create } from 'zustand';
import { CurtainTemplate, Fabric, FabricAssignment, Region } from '../types/curtain';
import { DEFAULT_FABRICS, DEFAULT_TEMPLATES as CURTAIN_TEMPLATES } from '../data/defaultCatalog';
import { AIProviderId } from './ai-providers/types';
import { providerRegistry } from './ai-providers/registry';
import { InpaintingStepEvent, executeSequentialInpainting } from './sequential-inpainting';

export type StudioTab = 'atelier' | 'room_viz' | 'catalog' | 'catalogs' | 'template_studio' | 'database' | 'settings';

export interface CatalogFolder {
  id: string;
  name: string;
  type: 'fabric' | 'template' | 'room';
  description: string;
  itemCount: number;
}

export interface UserProfileState {
  id: string;
  fullName: string;
  companyName: string;
  role: 'designer' | 'admin' | 'client';
  aiProvider: AIProviderId;
  tradeTier: string;
}

export interface GenerationJobItem {
  id: string;
  templateId: string;
  templateName: string;
  type: 'region_inpaint' | 'sequential_composite' | 'room_viz';
  status: 'queued' | 'processing' | 'completed' | 'failed';
  providerUsed: string;
  outputUrl?: string;
  createdAt: string;
  stepsCompleted: number;
  stepsTotal: number;
}

export interface StudioStoreState {
  // Navigation & Views
  activeTab: StudioTab;
  setActiveTab: (tab: StudioTab) => void;

  // AI Provider & Settings
  activeProviderId: AIProviderId;
  setActiveProviderId: (id: AIProviderId) => void;
  apiKeys: Record<string, string>;
  setApiKey: (provider: AIProviderId, key: string) => void;
  isTestingConnection: boolean;
  connectionTestResult: { success: boolean; latencyMs: number; message: string } | null;
  testProviderConnection: (providerId?: AIProviderId) => Promise<void>;

  // Templates
  templates: CurtainTemplate[];
  selectedTemplateId: string;
  activeRegionId: string | null;
  hoveredRegionId: string | null;
  selectTemplate: (templateId: string) => void;
  setActiveRegionId: (regionId: string | null) => void;
  setHoveredRegionId: (regionId: string | null) => void;
  addCustomTemplate: (template: CurtainTemplate) => void;

  // Fabrics & Catalogs
  fabrics: Fabric[];
  catalogs: CatalogFolder[];
  activeCatalogId: string | null;
  setActiveCatalogId: (id: string | null) => void;
  activeFabricCategory: string;
  setActiveFabricCategory: (cat: string) => void;
  fabricSearchQuery: string;
  setFabricSearchQuery: (query: string) => void;
  addCustomFabric: (fabric: Fabric) => void;

  // Fabric Assignments
  assignments: FabricAssignment[];
  assignFabricToRegion: (regionId: string, fabricId: string, scale?: number, rotation?: number) => void;
  removeAssignment: (regionId: string) => void;
  resetToTemplateDefaults: () => void;

  // Sequential Inpainting Pipeline
  isRendering: boolean;
  renderProgress: InpaintingStepEvent | null;
  renderedImageUrl: string | null;
  splitComparison: boolean;
  setSplitComparison: (val: boolean) => void;
  splitSliderPos: number;
  setSplitSliderPos: (pos: number) => void;
  runSequentialInpaint: (customInstructions?: string) => Promise<void>;
  clearRenderedImage: () => void;

  // Room Scene Visualization
  activeRoomType: 'living_room' | 'penthouse' | 'master_bedroom' | 'french_salon' | 'minimalist_loft';
  setActiveRoomType: (type: 'living_room' | 'penthouse' | 'master_bedroom' | 'french_salon' | 'minimalist_loft') => void;
  renderedRoomUrl: string | null;
  isRenderingRoom: boolean;
  runRoomVisualization: (prompt?: string) => Promise<void>;

  // User Profile & Multi-tenant State
  userProfile: UserProfileState;
  updateUserProfile: (profile: Partial<UserProfileState>) => void;

  // Jobs Queue
  jobs: GenerationJobItem[];
  addJob: (job: GenerationJobItem) => void;
  updateJob: (id: string, update: Partial<GenerationJobItem>) => void;
}

const DEFAULT_CATALOGS: CatalogFolder[] = [
  { id: 'cat-haute-2026', name: 'Haute Couture 2026 Collection', type: 'fabric', description: 'Curated French velvets, damasks, and fine gold filigree textiles.', itemCount: 18 },
  { id: 'cat-classic-drapery', name: 'Architectural Stencils', type: 'template', description: 'Pre-segmented multi-zone drapes, valances, and horizontal borders.', itemCount: 6 },
  { id: 'cat-penthouse-suites', name: 'Residential & Penthouse Rooms', type: 'room', description: 'High-ceiling architectural window settings with natural ambient lighting.', itemCount: 5 },
];

export const useStudioStore = create<StudioStoreState>((set, get) => {
  // Initialize initial assignments from first template
  const initialTemplate = CURTAIN_TEMPLATES[0];
  const initialAssignments: FabricAssignment[] = initialTemplate.regions
    .filter((r) => r.default_fabric_id)
    .map((r) => ({
      region_id: r.id,
      fabric_id: r.default_fabric_id!,
      scale: 1.0,
      rotation: 0,
      brightness: 1.0,
    }));

  return {
    // Navigation
    activeTab: 'atelier',
    setActiveTab: (activeTab) => set({ activeTab }),

    // AI Provider
    activeProviderId: providerRegistry.getActiveProviderId(),
    setActiveProviderId: (id) => {
      providerRegistry.setActiveProviderId(id);
      set({
        activeProviderId: id,
        connectionTestResult: null,
      });
    },
    apiKeys: {
      gemini: providerRegistry.getApiKey('gemini'),
      openai: providerRegistry.getApiKey('openai'),
      replicate: providerRegistry.getApiKey('replicate'),
      stability: providerRegistry.getApiKey('stability'),
    },
    setApiKey: (provider, key) => {
      providerRegistry.setApiKey(provider, key);
      set((state) => ({
        apiKeys: { ...state.apiKeys, [provider]: key },
      }));
    },
    isTestingConnection: false,
    connectionTestResult: null,
    testProviderConnection: async (providerId) => {
      const targetId = providerId || get().activeProviderId;
      set({ isTestingConnection: true, connectionTestResult: null });
      try {
        const result = await providerRegistry.testProvider(targetId);
        set({
          isTestingConnection: false,
          connectionTestResult: result,
        });
      } catch (err: any) {
        set({
          isTestingConnection: false,
          connectionTestResult: {
            success: false,
            latencyMs: 0,
            message: err.message || 'Connection test failed',
          },
        });
      }
    },

    // Templates
    templates: CURTAIN_TEMPLATES,
    selectedTemplateId: initialTemplate.id,
    activeRegionId: null,
    hoveredRegionId: null,
    selectTemplate: (templateId) => {
      const template = get().templates.find((t) => t.id === templateId);
      if (!template) return;
      const assignments: FabricAssignment[] = template.regions
        .filter((r) => r.default_fabric_id)
        .map((r) => ({
          region_id: r.id,
          fabric_id: r.default_fabric_id!,
          scale: 1.0,
          rotation: 0,
          brightness: 1.0,
        }));
      set({
        selectedTemplateId: templateId,
        activeRegionId: null,
        hoveredRegionId: null,
        assignments,
        renderedImageUrl: null,
        renderProgress: null,
      });
    },
    setActiveRegionId: (activeRegionId) => set({ activeRegionId }),
    setHoveredRegionId: (hoveredRegionId) => set({ hoveredRegionId }),
    addCustomTemplate: (template) => {
      set((state) => ({
        templates: [template, ...state.templates],
        selectedTemplateId: template.id,
        activeRegionId: null,
        assignments: template.regions.map((r) => ({
          region_id: r.id,
          fabric_id: r.default_fabric_id || state.fabrics[0].id,
          scale: 1.0,
          rotation: 0,
        })),
      }));
    },

    // Fabrics & Catalogs
    fabrics: DEFAULT_FABRICS,
    catalogs: DEFAULT_CATALOGS,
    activeCatalogId: null,
    setActiveCatalogId: (activeCatalogId) => set({ activeCatalogId }),
    activeFabricCategory: 'All',
    setActiveFabricCategory: (activeFabricCategory) => set({ activeFabricCategory }),
    fabricSearchQuery: '',
    setFabricSearchQuery: (fabricSearchQuery) => set({ fabricSearchQuery }),
    addCustomFabric: (fabric) => {
      set((state) => ({
        fabrics: [fabric, ...state.fabrics],
      }));
    },

    // Assignments
    assignments: initialAssignments,
    assignFabricToRegion: (regionId, fabricId, scale = 1.0, rotation = 0) => {
      set((state) => {
        const existing = state.assignments.filter((a) => a.region_id !== regionId);
        return {
          assignments: [
            ...existing,
            { region_id: regionId, fabric_id: fabricId, scale, rotation, brightness: 1.0 },
          ],
        };
      });
    },
    removeAssignment: (regionId) => {
      set((state) => ({
        assignments: state.assignments.filter((a) => a.region_id !== regionId),
      }));
    },
    resetToTemplateDefaults: () => {
      const template = get().templates.find((t) => t.id === get().selectedTemplateId);
      if (!template) return;
      const assignments: FabricAssignment[] = template.regions
        .filter((r) => r.default_fabric_id)
        .map((r) => ({
          region_id: r.id,
          fabric_id: r.default_fabric_id!,
          scale: 1.0,
          rotation: 0,
          brightness: 1.0,
        }));
      set({ assignments, renderedImageUrl: null, renderProgress: null });
    },

    // Sequential Inpainting Pipeline
    isRendering: false,
    renderProgress: null,
    renderedImageUrl: null,
    splitComparison: false,
    setSplitComparison: (splitComparison) => set({ splitComparison }),
    splitSliderPos: 50,
    setSplitSliderPos: (splitSliderPos) => set({ splitSliderPos }),
    runSequentialInpaint: async (customInstructions) => {
      const template = get().templates.find((t) => t.id === get().selectedTemplateId);
      if (!template) return;

      set({ isRendering: true, renderProgress: null });

      const jobId = 'job-' + Date.now();
      get().addJob({
        id: jobId,
        templateId: template.id,
        templateName: template.name,
        type: 'sequential_composite',
        status: 'processing',
        providerUsed: providerRegistry.getActiveProvider().name,
        createdAt: new Date().toISOString(),
        stepsCompleted: 0,
        stepsTotal: template.regions.length,
      });

      try {
        const result = await executeSequentialInpainting({
          template,
          fabrics: get().fabrics,
          assignments: get().assignments,
          customInstructions,
          onStepProgress: (event) => {
            set({
              renderProgress: event,
              renderedImageUrl: event.currentCompositeUrl,
            });
            get().updateJob(jobId, {
              stepsCompleted: event.stepIndex,
              stepsTotal: event.totalSteps,
            });
          },
        });

        set({
          isRendering: false,
          renderedImageUrl: result.finalImageUrl,
          splitComparison: true,
        });

        get().updateJob(jobId, {
          status: 'completed',
          outputUrl: result.finalImageUrl,
        });
      } catch (err: any) {
        console.error('Sequential inpainting error:', err);
        set({ isRendering: false });
        get().updateJob(jobId, {
          status: 'failed',
        });
      }
    },
    clearRenderedImage: () => set({ renderedImageUrl: null, renderProgress: null, splitComparison: false }),

    // Room Scene Visualization
    activeRoomType: 'living_room',
    setActiveRoomType: (activeRoomType) => set({ activeRoomType }),
    renderedRoomUrl: null,
    isRenderingRoom: false,
    runRoomVisualization: async (prompt) => {
      const template = get().templates.find((t) => t.id === get().selectedTemplateId);
      const curtainSrc = get().renderedImageUrl || template?.real_photo_url || template?.original_image_url;
      if (!curtainSrc) return;

      set({ isRenderingRoom: true });
      const activeProvider = providerRegistry.getActiveProvider();

      try {
        const result = await activeProvider.generateScene({
          curtainImage: curtainSrc,
          roomType: get().activeRoomType,
          prompt,
        });
        set({
          isRenderingRoom: false,
          renderedRoomUrl: result,
        });
      } catch (e: any) {
        console.warn('Room viz API fallback to architectural composite:', e.message);
        // Architectural preset preview fallback
        set({
          isRenderingRoom: false,
          renderedRoomUrl: curtainSrc,
        });
      }
    },

    // User Profile
    userProfile: {
      id: 'usr-at-01',
      fullName: 'Aatmi Haute Couture Atelier',
      companyName: 'Maison Aatmi Draperies',
      role: 'designer',
      aiProvider: 'gemini',
      tradeTier: 'haute_couture',
    },
    updateUserProfile: (profile) => {
      set((state) => ({
        userProfile: { ...state.userProfile, ...profile },
      }));
    },

    // Jobs Queue
    jobs: [
      {
        id: 'job-init-01',
        templateId: 'template-chevron-accent',
        templateName: 'Palazzo Dual Chevron Drapery',
        type: 'sequential_composite',
        status: 'completed',
        providerUsed: 'Google Gemini (Gemini 3.1 Flash Image)',
        createdAt: '2026-03-10T10:30:00Z',
        stepsCompleted: 4,
        stepsTotal: 4,
      },
    ],
    addJob: (job) => set((state) => ({ jobs: [job, ...state.jobs] })),
    updateJob: (id, update) =>
      set((state) => ({
        jobs: state.jobs.map((j) => (j.id === id ? { ...j, ...update } : j)),
      })),
  };
});
