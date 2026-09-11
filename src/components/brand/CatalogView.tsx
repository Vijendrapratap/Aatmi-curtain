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
  Sparkles,
  Layers,
  LayoutGrid,
  Grid3X3,
  SlidersHorizontal,
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 p-3.5 rounded-2xl bg-white border border-[var(--color-accent)] text-xs text-[var(--color-text-primary)] shadow-xl flex items-center gap-2.5 animate-in slide-in-from-top-4">
          <div className="w-5 h-5 rounded-full bg-[var(--color-accent)] text-white flex items-center justify-center shrink-0">
            <Check className="w-3.5 h-3.5" />
          </div>
          <span className="font-semibold">{toastMessage}</span>
          <button
            type="button"
            onClick={() => setActiveView('editor')}
            className="ml-2 underline text-[var(--color-accent)] font-bold cursor-pointer hover:no-underline"
          >
            View in Studio →
          </button>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="eyebrow-label text-[var(--color-accent)] font-semibold">
            CURATED TEXTILES &amp; SWATCHES
          </div>
          <h1 className="text-2xl font-display font-semibold text-[var(--color-text-primary)]">
            Fabric Catalog
          </h1>
          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
            Browse high-resolution textiles, inspect macro weave textures, and 1-click apply swatches to your active curtain design.
          </p>
        </div>

        {/* "+ Add Fabric" Dropdown Button */}
        <div className="relative self-start sm:self-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveView('editor')}
            className="px-3.5 py-2.5 rounded-[var(--radius-button)] bg-white hover:bg-[var(--color-bg-sunken)] border border-[var(--color-border-strong)] text-xs font-semibold text-[var(--color-text-primary)] flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-[var(--color-accent)]" />
            <span>Open Studio Editor</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddMenuOpen(!isAddMenuOpen)}
            className="px-4 py-2.5 rounded-[var(--radius-button)] bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white text-xs font-semibold flex items-center gap-2 transition tactile-press cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Fabric</span>
          </button>

          {isAddMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl bg-white border border-[var(--color-border-strong)] shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <button
                type="button"
                onClick={() => {
                  setIsAddMenuOpen(false);
                  setIsCameraModalOpen(true);
                }}
                className="w-full p-2 rounded-xl text-left text-xs font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-bg-sunken)] flex items-center gap-2.5 transition cursor-pointer"
              >
                <Camera className="w-4 h-4 text-[var(--color-accent)]" />
                <div>
                  <div className="font-semibold">Camera Capture</div>
                  <div className="text-[10px] text-[var(--color-text-secondary)]">
                    Photograph physical swatch
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsAddMenuOpen(false);
                  setIsBulkModalOpen(true);
                }}
                className="w-full p-2 rounded-xl text-left text-xs font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-bg-sunken)] flex items-center gap-2.5 transition cursor-pointer mt-1"
              >
                <Upload className="w-4 h-4 text-amber-700" />
                <div>
                  <div className="font-semibold">Bulk Catalog Upload</div>
                  <div className="text-[10px] text-[var(--color-text-secondary)]">
                    Ingest multi-swatch folder
                  </div>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Layout: Left Filter Rail + Responsive Right Grid */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Left Filter Rail */}
        <aside className="w-full lg:w-64 shrink-0 brand-card p-5 space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-[var(--color-border-subtle)]">
            <Filter className="w-4 h-4 text-[var(--color-text-secondary)]" />
            <span className="text-xs font-semibold text-[var(--color-text-primary)]">
              Filters &amp; Categories
            </span>
          </div>

          {/* Quick Filter: Authentic Real Photos */}
          <div className="space-y-1.5">
            <span className="eyebrow-label text-[var(--color-accent)] block mb-1">
              Curated Collections
            </span>
            <button
              type="button"
              onClick={() => setQuickFilter(quickFilter === 'all' ? 'authentic_real' : 'all')}
              className={`w-full px-3 py-2 rounded-xl text-left text-xs transition cursor-pointer flex items-center justify-between border ${
                quickFilter === 'authentic_real'
                  ? 'bg-[var(--color-accent-tint)] border-[var(--color-accent)] text-[var(--color-accent)] font-semibold shadow-2xs'
                  : 'bg-white border-[var(--color-border-subtle)] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-sunken)]'
              }`}
            >
              <span className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                <span>13 Real Atelier Samples</span>
              </span>
              {quickFilter === 'authentic_real' && <Check className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Search bar */}
          <div>
            <label className="block text-[11px] font-medium text-[var(--color-text-secondary)] mb-1.5">
              Search Swatches
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[var(--color-text-disabled)] absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Name, velvet, damask..."
                className="w-full h-8 pl-8 pr-3 text-xs rounded-xl bg-[var(--color-bg-sunken)] border border-[var(--color-border-subtle)] text-[var(--color-text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
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
                className={`w-full px-2.5 py-1.5 rounded-lg text-left text-xs transition cursor-pointer flex items-center justify-between ${
                  selectedCategory === cat
                    ? 'bg-[var(--color-accent-tint)] text-[var(--color-accent)] font-semibold'
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
                className={`w-full px-2.5 py-1.5 rounded-lg text-left text-xs transition cursor-pointer flex items-center justify-between ${
                  selectedSource === src.id
                    ? 'bg-[var(--color-accent-tint)] text-[var(--color-accent)] font-semibold'
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
                className={`w-full px-2.5 py-1.5 rounded-lg text-left text-xs transition cursor-pointer flex items-center justify-between ${
                  selectedVisibility === vis.id
                    ? 'bg-[var(--color-accent-tint)] text-[var(--color-accent)] font-semibold'
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
          <div className="flex items-center justify-between text-xs text-[var(--color-text-secondary)] px-1">
            <span>
              Showing <strong className="text-[var(--color-text-primary)]">{filteredFabrics.length}</strong> of {scopedFabrics.length} swatches • Click any swatch to inspect texture &amp; apply
            </span>

            {/* View Size Switcher */}
            <div className="flex items-center gap-1 bg-[var(--color-bg-sunken)] p-0.5 rounded-lg border border-[var(--color-border-subtle)]">
              <button
                type="button"
                onClick={() => setViewSize('comfortable')}
                className={`p-1 rounded-md transition cursor-pointer ${
                  viewSize === 'comfortable'
                    ? 'bg-white shadow-2xs text-[var(--color-text-primary)]'
                    : 'text-[var(--color-text-secondary)]'
                }`}
                title="Comfortable cards"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewSize('compact')}
                className={`p-1 rounded-md transition cursor-pointer ${
                  viewSize === 'compact'
                    ? 'bg-white shadow-2xs text-[var(--color-text-primary)]'
                    : 'text-[var(--color-text-secondary)]'
                }`}
                title="Compact grid"
              >
                <Grid3X3 className="w-3.5 h-3.5" />
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
            {filteredFabrics.map((fabric) => (
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
            ))}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="brand-card w-full max-w-sm p-5 bg-white space-y-4">
            <h3 className="text-sm font-display font-semibold text-[var(--color-text-primary)]">
              Rename Swatch
            </h3>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full h-9 px-3 text-xs rounded-lg bg-[var(--color-bg-sunken)] border border-[var(--color-border-strong)]"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRenamingFabric(null)}
                className="px-3 py-1.5 text-xs text-[var(--color-text-secondary)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveRename}
                className="px-4 py-1.5 text-xs font-semibold bg-[var(--color-accent)] text-white rounded-lg"
              >
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
