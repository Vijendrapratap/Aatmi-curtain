// src/lib/store.ts
// Studio selection state: which curtain style is open, which zone is active,
// and which fabric is assigned to each zone. Everything else lives in brandStore.
import { create } from 'zustand';
import { CurtainTemplate, FabricAssignment } from '../types/curtain';

export interface StudioStoreState {
  selectedTemplateId: string;
  activeRegionId: string | null;
  hoveredRegionId: string | null;
  assignments: FabricAssignment[];

  selectTemplate: (templateId: string, templates: CurtainTemplate[]) => void;
  setActiveRegionId: (regionId: string | null) => void;
  setHoveredRegionId: (regionId: string | null) => void;
  assignFabricToRegion: (regionId: string, fabricId: string) => void;
  assignFabricToAllRegions: (regionIds: string[], fabricId: string) => void;
  removeAssignment: (regionId: string) => void;
  loadAssignments: (templateId: string, assignments: FabricAssignment[]) => void;
}

function defaultAssignments(template: CurtainTemplate): FabricAssignment[] {
  return template.regions
    .filter((r) => r.default_fabric_id)
    .map((r) => ({
      region_id: r.id,
      fabric_id: r.default_fabric_id!,
      scale: 1.0,
      rotation: 0,
      brightness: 1.0,
    }));
}

// Nothing is selected until the user picks a style or uploads a photo; the Generate page opens empty.
export const useStudioStore = create<StudioStoreState>((set, get) => ({
  selectedTemplateId: '',
  activeRegionId: null,
  hoveredRegionId: null,
  assignments: [],

  selectTemplate: (templateId, templates) => {
    const template = templates.find((t) => t.id === templateId);
    if (!template) return;
    set({
      selectedTemplateId: templateId,
      activeRegionId: template.regions[0]?.id ?? null,
      hoveredRegionId: null,
      assignments: defaultAssignments(template),
    });
  },

  setActiveRegionId: (activeRegionId) => set({ activeRegionId }),
  setHoveredRegionId: (hoveredRegionId) => set({ hoveredRegionId }),

  assignFabricToRegion: (regionId, fabricId) => {
    set((state) => ({
      assignments: [
        ...state.assignments.filter((a) => a.region_id !== regionId),
        { region_id: regionId, fabric_id: fabricId, scale: 1.0, rotation: 0, brightness: 1.0 },
      ],
    }));
  },

  assignFabricToAllRegions: (regionIds, fabricId) => {
    regionIds.forEach((id) => get().assignFabricToRegion(id, fabricId));
  },

  removeAssignment: (regionId) => {
    set((state) => ({
      assignments: state.assignments.filter((a) => a.region_id !== regionId),
    }));
  },

  loadAssignments: (templateId, assignments) => {
    set({
      selectedTemplateId: templateId,
      activeRegionId: assignments[0]?.region_id ?? null,
      hoveredRegionId: null,
      assignments: assignments.map((a) => ({ ...a })),
    });
  },
}));
