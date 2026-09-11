// src/components/brand/CatalogView.tsx
import React, { useState } from 'react';
import { useBrandStore } from '../../lib/brandStore';
import { Fabric } from '../../types/curtain';
import {
  Search,
  Plus,
  Camera,
  Upload,
  MoreVertical,
  Filter,
  Check,
  Sparkles,
  Layers,
  Archive,
  Edit2,
  FolderPlus,
} from 'lucide-react';
import { CameraCaptureModal } from './CameraCaptureModal';
import { BulkUploadModal } from './BulkUploadModal';

export const CatalogView: React.FC = () => {
  const {
    brandFabrics,
    currentBrandId,
    updateBrandFabric,
    archiveBrandFabric,
  } = useBrandStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [selectedVisibility, setSelectedVisibility] = useState<string>('all');
  const [activeMenuFabricId, setActiveMenuFabricId] = useState<string | null>(null);

  // Modals state
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);

  // Rename prompt state
  const [renamingFabric, setRenamingFabric] = useState<Fabric | null>(null);
  const [newName, setNewName] = useState('');

  // Scoped fabrics to current brand
  const scopedFabrics = brandFabrics.filter(
    (f) => f.brand_id === currentBrandId || !f.brand_id
  );

  // Filter logic
  const filteredFabrics = scopedFabrics.filter((fabric) => {
    if (selectedCategory !== 'All' && fabric.category !== selectedCategory) return false;
    if (selectedSource !== 'all' && fabric.source !== selectedSource) return false;
    if (selectedVisibility !== 'all' && fabric.visibility !== selectedVisibility) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = fabric.name.toLowerCase().includes(q);
      const matchTags = fabric.tags.some((t) => t.toLowerCase().includes(q));
      const matchCategory = fabric.category.toLowerCase().includes(q);
      return matchName || matchTags || matchCategory;
    }

    return true;
  });

  const categories = [
    'All',
    'Velvet',
    'Linen',
    'Silk',
    'Jacquard & Damask',
    'Textured & Bouclé',
    'Exotic Relief',
    'Custom',
  ];

  const handlePromoteToCatalog = (fabric: Fabric) => {
    updateBrandFabric(fabric.id, { visibility: 'catalog' });
    setActiveMenuFabricId(null);
  };

  const handleStartRename = (fabric: Fabric) => {
    setRenamingFabric(fabric);
    setNewName(fabric.name);
    setActiveMenuFabricId(null);
  };

  const handleSaveRename = () => {
    if (renamingFabric && newName.trim()) {
      updateBrandFabric(renamingFabric.id, { name: newName.trim() });
      setRenamingFabric(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-in fade-in duration-200">
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
            Manage your brand's digital material library, camera-captured physical swatches, and batch books.
          </p>
        </div>

        {/* "+ Add Fabric" Dropdown Button (Section 6.2) */}
        <div className="relative self-start sm:self-auto">
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
        {/* Left Filter Rail (Section 6.2) */}
        <aside className="w-full lg:w-64 shrink-0 brand-card p-5 space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-[var(--color-border-subtle)]">
            <Filter className="w-4 h-4 text-[var(--color-text-secondary)]" />
            <span className="text-xs font-semibold text-[var(--color-text-primary)]">
              Filters &amp; Categories
            </span>
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
              Showing {filteredFabrics.length} of {scopedFabrics.length} swatches
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filteredFabrics.map((fabric) => {
              const isCatalog = fabric.visibility !== 'session_only';

              return (
                <div
                  key={fabric.id}
                  className="brand-card overflow-hidden hover:translate-y-[-2px] transition group relative flex flex-col justify-between"
                >
                  {/* Swatch Image */}
                  <div className="w-full aspect-square bg-neutral-100 relative overflow-hidden">
                    <img
                      src={fabric.image_url}
                      alt={fabric.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />

                    {/* Visibility Pill (Section 6.2) */}
                    <div className="absolute top-2 left-2">
                      <span
                        className={`text-[9px] font-mono font-semibold px-2 py-0.5 rounded-full ${
                          isCatalog
                            ? 'bg-[var(--color-accent-tint)] text-[var(--color-accent)] border border-[var(--color-accent)]/20'
                            : 'bg-neutral-800/80 text-neutral-200 backdrop-blur-xs'
                        }`}
                      >
                        {isCatalog ? 'Catalog' : 'Session-only'}
                      </span>
                    </div>

                    {/* Kebab ⋮ Menu Button */}
                    <div className="absolute top-2 right-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuFabricId(
                            activeMenuFabricId === fabric.id ? null : fabric.id
                          );
                        }}
                        className="p-1 rounded-full bg-white/80 hover:bg-white text-[var(--color-text-primary)] shadow-xs transition cursor-pointer"
                      >
                        <MoreVertical className="w-3.5 h-3.5" />
                      </button>

                      {/* Dropdown Menu */}
                      {activeMenuFabricId === fabric.id && (
                        <div className="absolute right-0 top-full mt-1 w-40 rounded-xl bg-white border border-[var(--color-border-strong)] shadow-xl p-1.5 z-30 animate-in fade-in zoom-in-95 duration-100 text-xs">
                          {/* Add to catalog option: only shown for session-only (Section 6.2) */}
                          {!isCatalog && (
                            <button
                              type="button"
                              onClick={() => handlePromoteToCatalog(fabric)}
                              className="w-full px-2 py-1.5 text-left rounded-lg hover:bg-[var(--color-accent-tint)] text-[var(--color-accent)] font-semibold flex items-center gap-2 cursor-pointer"
                            >
                              <FolderPlus className="w-3.5 h-3.5" />
                              <span>Add to catalog</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleStartRename(fabric)}
                            className="w-full px-2 py-1.5 text-left rounded-lg hover:bg-[var(--color-bg-sunken)] text-[var(--color-text-primary)] flex items-center gap-2 cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-[var(--color-text-secondary)]" />
                            <span>Rename</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              archiveBrandFabric(fabric.id);
                              setActiveMenuFabricId(null);
                            }}
                            className="w-full px-2 py-1.5 text-left rounded-lg hover:bg-red-50 text-red-600 flex items-center gap-2 cursor-pointer"
                          >
                            <Archive className="w-3.5 h-3.5" />
                            <span>Archive</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Details */}
                  <div className="p-3">
                    <h4 className="text-xs font-display font-semibold text-[var(--color-text-primary)] truncate">
                      {fabric.name}
                    </h4>
                    <div className="text-[10px] text-[var(--color-text-secondary)] mt-0.5 flex items-center justify-between">
                      <span>{fabric.category}</span>
                      <span className="font-mono text-[9px]">{fabric.metadata.sheen}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>

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

      {/* Modals */}
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
