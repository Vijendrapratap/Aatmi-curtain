// src/components/brand/CatalogView.tsx
import React, { useState } from 'react';
import { useBrandStore } from '../../lib/brandStore';
import { useStudioStore } from '../../lib/store';
import { Fabric } from '../../types/curtain';
import {
  Search,
  Plus,
  Camera,
  Upload,
  Filter,
  Check,
  LayoutGrid,
  Grid3X3,
} from 'lucide-react';
import { CameraCaptureModal } from './CameraCaptureModal';
import { BulkUploadModal } from './BulkUploadModal';
import { FabricCard } from './FabricCard';
import { FabricPreviewModal } from './FabricPreviewModal';

export const CatalogView: React.FC = () => {
  const {
    brandFabrics,
    currentBrandId,
    brandTemplates,
    updateBrandFabric,
    archiveBrandFabric,
    setActiveView,
  } = useBrandStore();

  const {
    selectedTemplateId,
    assignments,
    assignFabricToRegion,
    activeRegionId,
  } = useStudioStore();

  // Active template in studio
  const currentTemplate =
    brandTemplates.find((t) => t.id === selectedTemplateId) || brandTemplates[0];

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [selectedVisibility, setSelectedVisibility] = useState<string>('all');
  const [quickFilter, setQuickFilter] = useState<'all' | 'authentic_real'>('all');
  const [viewSize, setViewSize] = useState<'comfortable' | 'compact'>('comfortable');

  // Modals state
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);

  // Preview & Inspect Modal
  const [previewFabric, setPreviewFabric] = useState<Fabric | null>(null);

  // Rename prompt state
  const [renamingFabric, setRenamingFabric] = useState<Fabric | null>(null);
  const [newName, setNewName] = useState('');

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Scoped fabrics: show brand-specific or shared platform fabrics
  const scopedFabrics = brandFabrics.filter(
    (f) => !f.brand_id || f.brand_id === currentBrandId
  );

  // Filter logic
  const filteredFabrics = scopedFabrics.filter((fabric) => {
    if (quickFilter === 'authentic_real' && !fabric.id.startsWith('fab-user-')) return false;
    if (selectedCategory !== 'All' && fabric.category !== selectedCategory) return false;
    if (selectedSource !== 'all' && fabric.source !== selectedSource) return false;
    if (selectedVisibility !== 'all' && fabric.visibility !== selectedVisibility) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = fabric.name.toLowerCase().includes(q);
      const matchTags = fabric.tags?.some((t) => t.toLowerCase().includes(q));
      const matchCategory = fabric.category?.toLowerCase().includes(q);
      const matchWeave = fabric.metadata?.weave?.toLowerCase().includes(q);
      return matchName || matchTags || matchCategory || matchWeave;
    }

    return true;
  });

  const categories = [
    'All',
    'Velvet',
    'Linen',
    'Silk',
    'Geometric',
    'Jacquard & Damask',
    'Textured & Bouclé',
    'Exotic Relief',
    'Embroidered & Textured',
    'Custom',
  ];

  const handlePromoteToCatalog = (fabric: Fabric) => {
    updateBrandFabric(fabric.id, { visibility: 'catalog' });
  };

  const handleStartRename = (fabric: Fabric) => {
    setRenamingFabric(fabric);
    setNewName(fabric.name);
  };

  const handleSaveRename = () => {
    if (renamingFabric && newName.trim()) {
      updateBrandFabric(renamingFabric.id, { name: newName.trim() });
      setRenamingFabric(null);
    }
  };

  // Direct 1-click apply to active zone
  const handleApplyDirect = (fabric: Fabric) => {
    const targetRegionId = activeRegionId || currentTemplate?.regions[0]?.id;
    if (targetRegionId) {
      assignFabricToRegion(targetRegionId, fabric.id);
      const targetZoneName =
        currentTemplate?.regions.find((r) => r.id === targetRegionId)?.display_name || 'Curtain Zone';

      setToastMessage(`Applied "${fabric.name}" to ${targetZoneName}!`);
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const handleApplyToRegion = (regionId: string, fabricId: string) => {
    assignFabricToRegion(regionId, fabricId);
    const fabric = scopedFabrics.find((f) => f.id === fabricId);
    const zoneName = currentTemplate?.regions.find((r) => r.id === regionId)?.display_name || 'Zone';
    setToastMessage(`Applied "${fabric?.name}" to ${zoneName}`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleApplyToAllRegions = (fabricId: string) => {
    currentTemplate?.regions.forEach((reg) => {
      assignFabricToRegion(reg.id, fabricId);
    });
    setToastMessage(`Applied to all ${currentTemplate?.regions.length} zones!`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="page-shell space-y-7">
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2.5 rounded-[14px] bg-[var(--color-bg-surface)] px-4 py-3 text-[13px] shadow-[var(--shadow-modal)]">
          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)] text-white">
            <Check className="h-3.5 w-3.5" />
          </div>
          <span className="font-medium">{toastMessage}</span>
          <button
            type="button"
            onClick={() => setActiveView('editor')}
            className="ml-1 font-semibold text-[var(--color-accent)]"
          >
            View in studio
          </button>
        </div>
      )}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow-label">Textiles</p>
          <h1 className="page-title">Fabric catalog</h1>
          <p className="page-lede">
            Inspect weave, then apply a swatch to the active drapery zone.
          </p>
        </div>

        <div className="relative flex items-center gap-2 self-start">
          <button type="button" onClick={() => setActiveView('editor')} className="btn btn-secondary">
            Open studio
          </button>
          <button
            type="button"
            onClick={() => setIsAddMenuOpen(!isAddMenuOpen)}
            className="btn btn-primary"
          >
            <Plus className="h-4 w-4" />
            Add fabric
          </button>

          {isAddMenuOpen && (
            <div className="menu-panel absolute top-full right-0 z-50 mt-2 w-60">
              <button
                type="button"
                onClick={() => {
                  setIsAddMenuOpen(false);
                  setIsCameraModalOpen(true);
                }}
                className="flex w-full items-start gap-2.5 rounded-[10px] p-2.5 text-left hover:bg-[var(--color-bg-sunken)]"
              >
                <Camera className="mt-0.5 h-4 w-4 text-[var(--color-accent)]" />
                <div>
                  <div className="text-[13px] font-semibold">Camera capture</div>
                  <div className="text-[11px] text-[var(--color-text-tertiary)]">Photograph a physical swatch</div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAddMenuOpen(false);
                  setIsBulkModalOpen(true);
                }}
                className="flex w-full items-start gap-2.5 rounded-[10px] p-2.5 text-left hover:bg-[var(--color-bg-sunken)]"
              >
                <Upload className="mt-0.5 h-4 w-4 text-[var(--color-premium)]" />
                <div>
                  <div className="text-[13px] font-semibold">Bulk upload</div>
                  <div className="text-[11px] text-[var(--color-text-tertiary)]">Ingest a swatch folder</div>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Layout: Left Filter Rail + Responsive Right Grid */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Left Filter Rail */}
        <aside className="w-full shrink-0 space-y-6 rounded-[18px] bg-[var(--color-bg-surface)] p-5 shadow-[var(--shadow-card)] lg:w-60">
          <div className="flex items-center gap-2 border-b border-[var(--color-border-subtle)] pb-3">
            <Filter className="h-4 w-4 text-[var(--color-text-tertiary)]" />
            <span className="text-[13px] font-semibold">Filters</span>
          </div>

          {/* Quick Filter: Authentic Real Photos */}
          <div className="space-y-1.5">
            <span className="eyebrow-label mb-1 block">Collections</span>
            <button
              type="button"
              onClick={() => setQuickFilter(quickFilter === 'all' ? 'authentic_real' : 'all')}
              className={`flex w-full cursor-pointer items-center justify-between rounded-[12px] px-3 py-2 text-left text-[13px] transition-colors ${
                quickFilter === 'authentic_real'
                  ? 'bg-[var(--color-accent-tint)] font-semibold text-[var(--color-accent)]'
                  : 'text-[var(--color-text-primary)] hover:bg-[var(--color-bg-sunken)]'
              }`}
            >
              <span>Atelier samples</span>
              {quickFilter === 'authentic_real' && <Check className="h-3.5 w-3.5" />}
            </button>
          </div>

          {/* Search bar */}
          <div>
            <label className="field-label">Search</label>
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-[var(--color-text-disabled)]" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Velvet, damask…"
                className="field pl-9"
              />
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-1.5">
            <span className="eyebrow-label text-[var(--color-text-secondary)] block mb-1">
              Material &amp; Weave
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`flex w-full cursor-pointer items-center justify-between rounded-[8px] px-2.5 py-1.5 text-left text-[13px] transition-colors ${
                  selectedCategory === cat
                    ? 'bg-[var(--color-accent-tint)] font-semibold text-[var(--color-accent)]'
                    : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-sunken)] hover:text-[var(--color-text-primary)]'
                }`}
              >
                <span>{cat}</span>
                {selectedCategory === cat && <Check className="w-3.5 h-3.5" />}
              </button>
            ))}
          </div>

          {/* Source Filter */}
          <div className="space-y-1.5 pt-3 border-t border-[var(--color-border-subtle)]">
            <span className="eyebrow-label text-[var(--color-text-secondary)] block mb-1">
              Source
            </span>
            {[
              { id: 'all', label: 'All Sources' },
              { id: 'catalog', label: 'Catalog Uploads' },
              { id: 'camera_capture', label: 'Camera Captures' },
              { id: 'bulk_upload', label: 'Bulk Ingestions' },
            ].map((src) => (
              <button
                key={src.id}
                type="button"
                onClick={() => setSelectedSource(src.id)}
                className={`flex w-full cursor-pointer items-center justify-between rounded-[8px] px-2.5 py-1.5 text-left text-[13px] transition-colors ${
                  selectedSource === src.id
                    ? 'bg-[var(--color-accent-tint)] font-semibold text-[var(--color-accent)]'
                    : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-sunken)]'
                }`}
              >
                <span>{src.label}</span>
                {selectedSource === src.id && <Check className="w-3.5 h-3.5" />}
              </button>
            ))}
          </div>

          {/* Visibility Filter */}
          <div className="space-y-1.5 pt-3 border-t border-[var(--color-border-subtle)]">
            <span className="eyebrow-label text-[var(--color-text-secondary)] block mb-1">
              Visibility
            </span>
            {[
              { id: 'all', label: 'All Visibility' },
              { id: 'catalog', label: 'Permanent Catalog' },
              { id: 'session_only', label: 'Session-only Trials' },
            ].map((vis) => (
              <button
                key={vis.id}
                type="button"
                onClick={() => setSelectedVisibility(vis.id)}
                className={`flex w-full cursor-pointer items-center justify-between rounded-[8px] px-2.5 py-1.5 text-left text-[13px] transition-colors ${
                  selectedVisibility === vis.id
                    ? 'bg-[var(--color-accent-tint)] font-semibold text-[var(--color-accent)]'
                    : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-sunken)]'
                }`}
              >
                <span>{vis.label}</span>
                {selectedVisibility === vis.id && <Check className="w-3.5 h-3.5" />}
              </button>
            ))}
          </div>
        </aside>

        {/* Right Grid of Fabric Swatches */}
        <main className="flex-1 w-full space-y-4">
          <div className="flex items-center justify-between px-1 text-[13px] text-[var(--color-text-secondary)]">
            <span>
              <strong className="font-semibold text-[var(--color-text-primary)] tabular-nums">{filteredFabrics.length}</strong>
              {' '}of {scopedFabrics.length}
            </span>
            <div className="segmented">
              <button
                type="button"
                onClick={() => setViewSize('comfortable')}
                className={`segmented-item ${viewSize === 'comfortable' ? 'is-active' : ''}`}
                aria-pressed={viewSize === 'comfortable'}
                title="Comfortable cards"
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewSize('compact')}
                className={`segmented-item ${viewSize === 'compact' ? 'is-active' : ''}`}
                aria-pressed={viewSize === 'compact'}
                title="Compact grid"
              >
                <Grid3X3 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div
            className={`grid gap-4 ${
              viewSize === 'comfortable'
                ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4'
                : 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5'
            }`}
          >
            {filteredFabrics.length === 0 ? (
              <div className="col-span-full brand-card px-6 py-12">
                <p className="eyebrow-label">No swatches</p>
                <h3 className="mt-2 font-display text-[18px] font-semibold">Nothing matches these filters</h3>
                <p className="mt-1 max-w-md text-[14px] text-[var(--color-text-secondary)]">
                  Clear a filter, or add a fabric from camera or bulk upload.
                </p>
              </div>
            ) : (
              filteredFabrics.map((fabric) => (
                <FabricCard
                  key={fabric.id}
                  fabric={fabric}
                  viewSize={viewSize}
                  onPreview={(f) => setPreviewFabric(f)}
                  onApplyDirect={handleApplyDirect}
                  onPromoteToCatalog={handlePromoteToCatalog}
                  onRename={handleStartRename}
                  onArchive={(f) => archiveBrandFabric(f.id)}
                />
              ))
            )}
          </div>
        </main>
      </div>

      {/* Fabric Detail & Application Modal */}
      <FabricPreviewModal
        isOpen={Boolean(previewFabric)}
        onClose={() => setPreviewFabric(null)}
        fabric={previewFabric}
        regions={currentTemplate?.regions || []}
        activeRegionId={activeRegionId}
        onApplyToRegion={handleApplyToRegion}
        onApplyToAllRegions={handleApplyToAllRegions}
        onGoToStudio={() => setActiveView('editor')}
      />

      {/* Rename Dialog */}
      {renamingFabric && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1814]/40 p-4 backdrop-blur-sm">
          <div className="brand-card w-full max-w-sm space-y-4 p-5">
            <h3 className="font-display text-[16px] font-semibold">Rename swatch</h3>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="field"
            />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setRenamingFabric(null)} className="btn btn-ghost">
                Cancel
              </button>
              <button type="button" onClick={handleSaveRename} className="btn btn-primary">
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Camera & Bulk Modals */}
      <CameraCaptureModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
      />
      <BulkUploadModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
      />
    </div>
  );
};
