// src/components/brand/library/FabricsTab.tsx
import React, { useState } from 'react';
import { Search, Plus, Camera, Upload, Check, LayoutGrid, Grid3X3 } from 'lucide-react';
import { useBrandStore } from '../../../lib/brandStore';
import { useStudioStore } from '../../../lib/store';
import { Fabric } from '../../../types/curtain';
import { fabricOriginBadge } from '../../../lib/labels';
import { CameraCaptureModal } from '../CameraCaptureModal';
import { BulkUploadModal } from '../BulkUploadModal';
import { FabricCard } from '../FabricCard';
import { FabricPreviewModal } from '../FabricPreviewModal';
import { ZoneChooser } from '../ZoneChooser';

const CATEGORIES = ['All', 'Velvet', 'Linen', 'Silk', 'Geometric', 'Jacquard & Damask', 'Textured & Bouclé', 'Exotic Relief', 'Embroidered & Textured', 'Luxury Sheers', 'Custom'];

export const FabricsTab: React.FC = () => {
  const { brandFabrics, currentBrandId, brandTemplates, updateBrandFabric, archiveBrandFabric, setActiveView } = useBrandStore();
  const { selectedTemplateId, assignments, activeRegionId, assignFabricToRegion, assignFabricToAllRegions } = useStudioStore();

  const currentTemplate = brandTemplates.find((t) => t.id === selectedTemplateId) || brandTemplates[0];
  const regions = currentTemplate?.regions || [];

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [source, setSource] = useState<'all' | 'built_in' | 'mine'>('all');
  const [viewSize, setViewSize] = useState<'comfortable' | 'compact'>('comfortable');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [previewFabric, setPreviewFabric] = useState<Fabric | null>(null);
  const [chooserFabric, setChooserFabric] = useState<Fabric | null>(null);
  const [renaming, setRenaming] = useState<Fabric | null>(null);
  const [newName, setNewName] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const scoped = brandFabrics.filter((f) => !f.brand_id || f.brand_id === currentBrandId);
  const filtered = scoped.filter((f) => {
    const badge = fabricOriginBadge(f);
    if (source === 'mine' && badge !== 'Your fabric') return false;
    if (source === 'built_in' && badge !== 'Built-in') return false;
    if (category !== 'All' && f.category !== category) return false;
    if (query.trim()) {
      const q = query.toLowerCase();
      return f.name.toLowerCase().includes(q) || f.category.toLowerCase().includes(q) || f.tags.some((t) => t.toLowerCase().includes(q)) || (f.metadata?.weave || '').toLowerCase().includes(q);
    }
    return true;
  });

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const applyFabric = (target: string | 'all', fabricId: string) => {
    const fabric = scoped.find((f) => f.id === fabricId);
    if (target === 'all') {
      assignFabricToAllRegions(regions.map((r) => r.id), fabricId);
      showToast(`Applied ${fabric?.name || 'fabric'} to all ${regions.length} zones`);
    } else {
      assignFabricToRegion(target, fabricId);
      const zone = regions.find((r) => r.id === target)?.display_name || 'zone';
      showToast(`Applied ${fabric?.name || 'fabric'} to ${zone}`);
    }
    setChooserFabric(null);
  };

  return (
    <div className="space-y-5">
      {toast && (
        <div role="status" className="fixed top-20 right-6 z-50 flex items-center gap-2.5 rounded-[14px] bg-[var(--color-bg-surface)] px-4 py-3 text-[13px] shadow-[var(--shadow-modal)]">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-accent)] text-white"><Check className="h-3.5 w-3.5" /></span>
          <span className="font-medium">{toast}</span>
          <button type="button" onClick={() => setActiveView('editor')} className="ml-1 font-semibold text-[var(--color-accent)]">Open Generate</button>
        </div>
      )}

      <div className="flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
        <p className="text-[13px] text-[var(--color-text-secondary)]">
          Applying a fabric changes the design open in Generate: <strong className="font-semibold text-[var(--color-text-primary)]">{currentTemplate?.name}</strong>.
        </p>
        <div className="relative flex items-center gap-2">
          <button type="button" onClick={() => setIsAddMenuOpen((o) => !o)} className="btn btn-primary">
            <Plus className="h-4 w-4" /> Add fabric
          </button>
          {isAddMenuOpen && (
            <div className="menu-panel absolute top-full right-0 z-50 mt-2 w-64">
              <button type="button" onClick={() => { setIsAddMenuOpen(false); setIsCameraOpen(true); }} className="flex w-full items-start gap-2.5 rounded-[10px] p-2.5 text-left hover:bg-[var(--color-bg-sunken)]">
                <Camera className="mt-0.5 h-4 w-4 text-[var(--color-accent)]" />
                <span><span className="block text-[13px] font-semibold">Photograph a swatch</span><span className="block text-[11px] text-[var(--color-text-tertiary)]">Use your camera on a physical sample</span></span>
              </button>
              <button type="button" onClick={() => { setIsAddMenuOpen(false); setIsBulkOpen(true); }} className="flex w-full items-start gap-2.5 rounded-[10px] p-2.5 text-left hover:bg-[var(--color-bg-sunken)]">
                <Upload className="mt-0.5 h-4 w-4 text-[var(--color-premium)]" />
                <span><span className="block text-[13px] font-semibold">Upload image files</span><span className="block text-[11px] text-[var(--color-text-tertiary)]">Add many fabric photos at once</span></span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <aside className="w-full shrink-0 space-y-5 rounded-[18px] bg-[var(--color-bg-surface)] p-4 shadow-[var(--shadow-card)] lg:w-56">
          <div>
            <label className="field-label">Search</label>
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-[var(--color-text-disabled)]" />
              <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Velvet, damask…" className="field pl-9" />
            </div>
          </div>
          <div className="space-y-1">
            <span className="eyebrow-label mb-1 block">Material</span>
            {CATEGORIES.map((c) => (
              <button key={c} type="button" onClick={() => setCategory(c)} className={`flex w-full items-center justify-between rounded-[8px] px-2.5 py-1.5 text-left text-[13px] ${category === c ? 'bg-[var(--color-accent-tint)] font-semibold text-[var(--color-accent)]' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-sunken)]'}`}>
                <span>{c}</span>{category === c && <Check className="h-3.5 w-3.5" />}
              </button>
            ))}
          </div>
          <div className="space-y-1 border-t border-[var(--color-border-subtle)] pt-3">
            <span className="eyebrow-label mb-1 block">Source</span>
            {([['all', 'All'], ['built_in', 'Built-in'], ['mine', 'Your fabrics']] as const).map(([id, label]) => (
              <button key={id} type="button" onClick={() => setSource(id)} className={`flex w-full items-center justify-between rounded-[8px] px-2.5 py-1.5 text-left text-[13px] ${source === id ? 'bg-[var(--color-accent-tint)] font-semibold text-[var(--color-accent)]' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-sunken)]'}`}>
                <span>{label}</span>{source === id && <Check className="h-3.5 w-3.5" />}
              </button>
            ))}
          </div>
        </aside>

        <div className="w-full flex-1 space-y-4">
          <div className="flex items-center justify-between px-1 text-[13px] text-[var(--color-text-secondary)]">
            <span><strong className="font-semibold text-[var(--color-text-primary)]">{filtered.length}</strong> of {scoped.length} fabrics</span>
            <div className="segmented">
              <button type="button" onClick={() => setViewSize('comfortable')} className={`segmented-item ${viewSize === 'comfortable' ? 'is-active' : ''}`} aria-pressed={viewSize === 'comfortable'} title="Larger cards"><LayoutGrid className="h-3.5 w-3.5" /></button>
              <button type="button" onClick={() => setViewSize('compact')} className={`segmented-item ${viewSize === 'compact' ? 'is-active' : ''}`} aria-pressed={viewSize === 'compact'} title="Smaller cards"><Grid3X3 className="h-3.5 w-3.5" /></button>
            </div>
          </div>
          <div className={`grid gap-4 ${viewSize === 'comfortable' ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4' : 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5'}`}>
            {filtered.length === 0 ? (
              <div className="col-span-full brand-card px-6 py-12">
                <p className="eyebrow-label">No fabrics</p>
                <h3 className="mt-2 font-display text-[18px] font-semibold">Nothing matches these filters</h3>
                <p className="mt-1 max-w-md text-[14px] text-[var(--color-text-secondary)]">Clear a filter, or add a fabric with the camera or an upload.</p>
              </div>
            ) : (
              filtered.map((f) => (
                <FabricCard
                  key={f.id}
                  fabric={f}
                  viewSize={viewSize}
                  onPreview={setPreviewFabric}
                  onApply={setChooserFabric}
                  onKeepInLibrary={(fab) => updateBrandFabric(fab.id, { visibility: 'catalog' })}
                  onRename={(fab) => { setRenaming(fab); setNewName(fab.name); }}
                  onArchive={(fab) => archiveBrandFabric(fab.id)}
                />
              ))
            )}
          </div>
        </div>
      </div>

      <ZoneChooser
        isOpen={Boolean(chooserFabric)}
        onClose={() => setChooserFabric(null)}
        title={chooserFabric?.name || ''}
        regions={regions}
        activeRegionId={activeRegionId}
        assignments={assignments}
        fabrics={scoped}
        onChoose={(target) => chooserFabric && applyFabric(target, chooserFabric.id)}
      />

      <FabricPreviewModal
        isOpen={Boolean(previewFabric)}
        onClose={() => setPreviewFabric(null)}
        fabric={previewFabric}
        regions={regions}
        activeRegionId={activeRegionId}
        assignments={assignments}
        fabrics={scoped}
        onApply={applyFabric}
        onGoToStudio={() => setActiveView('editor')}
      />

      {renaming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1814]/40 p-4 backdrop-blur-sm">
          <div className="brand-card w-full max-w-sm space-y-4 p-5">
            <h3 className="font-display text-[16px] font-semibold">Rename fabric</h3>
            <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} className="field" />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setRenaming(null)} className="btn btn-ghost">Cancel</button>
              <button type="button" onClick={() => { if (newName.trim()) updateBrandFabric(renaming.id, { name: newName.trim() }); setRenaming(null); }} className="btn btn-primary">Save</button>
            </div>
          </div>
        </div>
      )}

      <CameraCaptureModal isOpen={isCameraOpen} onClose={() => setIsCameraOpen(false)} />
      <BulkUploadModal isOpen={isBulkOpen} onClose={() => setIsBulkOpen(false)} />
    </div>
  );
};
