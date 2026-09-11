import { describe, it, expect, beforeEach } from 'vitest';
import { useStudioStore } from './store';
import { DEFAULT_TEMPLATES } from '../data/defaultCatalog';

const velvet = DEFAULT_TEMPLATES.find((t) => t.id === 'tpl-velvet-houndstooth')!;
const chevron = DEFAULT_TEMPLATES.find((t) => t.id === 'tpl-chevron-accent-band')!;

describe('useStudioStore', () => {
  beforeEach(() => {
    useStudioStore.getState().selectTemplate(chevron.id, DEFAULT_TEMPLATES);
  });

  it('selectTemplate loads default assignments and activates the first zone', () => {
    useStudioStore.getState().selectTemplate(velvet.id, DEFAULT_TEMPLATES);
    const s = useStudioStore.getState();
    expect(s.selectedTemplateId).toBe(velvet.id);
    expect(s.activeRegionId).toBe(velvet.regions[0].id);
    expect(s.assignments.map((a) => a.region_id)).toEqual(
      velvet.regions.filter((r) => r.default_fabric_id).map((r) => r.id)
    );
  });

  it('assignFabricToRegion replaces an existing assignment for that zone', () => {
    const zone = chevron.regions[1].id;
    useStudioStore.getState().assignFabricToRegion(zone, 'fab-emerald-velvet');
    useStudioStore.getState().assignFabricToRegion(zone, 'fab-croc-espresso');
    const matches = useStudioStore.getState().assignments.filter((a) => a.region_id === zone);
    expect(matches).toHaveLength(1);
    expect(matches[0].fabric_id).toBe('fab-croc-espresso');
  });

  it('assignFabricToAllRegions covers every given zone', () => {
    const ids = chevron.regions.map((r) => r.id);
    useStudioStore.getState().assignFabricToAllRegions(ids, 'fab-emerald-velvet');
    const s = useStudioStore.getState();
    expect(ids.every((id) => s.assignments.find((a) => a.region_id === id)?.fabric_id === 'fab-emerald-velvet')).toBe(true);
  });

  it('setActiveRegionId is shared state', () => {
    useStudioStore.getState().setActiveRegionId(chevron.regions[2].id);
    expect(useStudioStore.getState().activeRegionId).toBe(chevron.regions[2].id);
  });

  it('loadAssignments restores a saved design', () => {
    useStudioStore.getState().loadAssignments(velvet.id, [
      { region_id: velvet.regions[0].id, fabric_id: 'fab-emerald-velvet', scale: 1, rotation: 0 },
    ]);
    const s = useStudioStore.getState();
    expect(s.selectedTemplateId).toBe(velvet.id);
    expect(s.assignments).toHaveLength(1);
    expect(s.activeRegionId).toBe(velvet.regions[0].id);
  });
});
