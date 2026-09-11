// src/components/brand/FabricPickerSheet.tsx
import React, { useState } from 'react';
import { useBrandStore } from '../../lib/brandStore';
import { Fabric, Region } from '../../types/curtain';
import {
  X,
  Camera,
  Palette,
  Search,
  Check,
  Sparkles,
  Plus,
  ArrowRight,
} from 'lucide-react';
import { CameraCaptureModal } from './CameraCaptureModal';

interface FabricPickerSheetProps {
  isOpen: boolean;
  onClose: () => void;
  activeRegion: Region | null;
  currentAssignedFabricId: string | null;
  onAssignFabric: (fabricId: string) => void;
}

export const FabricPickerSheet: React.FC<FabricPickerSheetProps> = ({
  isOpen,
  onClose,
  activeRegion,
  currentAssignedFabricId,
  onAssignFabric,
}) => {
  const { brandFabrics, currentBrandId } = useBrandStore();

  const [activeTab, setActiveTab] = useState<'catalog' | 'camera'>('catalog');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);

  if (!isOpen || !activeRegion) return null;

  const scopedFabrics = brandFabrics.filter(
    (f) => f.brand_id === currentBrandId || !f.brand_id
  );

  const filteredFabrics = scopedFabrics.filter((f) => {
    if (selectedCategory !== 'All' && f.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        f.name.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q) ||
        f.tags.some((t) => t.toLowerCase().includes(q))
      );
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
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="brand-card w-full sm:max-w-2xl max-h-[85vh] h-[640px] bg-white rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 flex flex-col space-y-4 shadow-2xl relative">
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border-subtle)]">
          <div>
            <div className="eyebrow-label text-[var(--color-accent)] font-semibold">
              FABRIC PICKER SHEET
            </div>
            <h3 className="text-base font-display font-semibold text-[var(--color-text-primary)]">
              Assign Fabric to "{activeRegion.display_name}"
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[var(--color-bg-sunken)] text-[var(--color-text-secondary)] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Two Tabs: [ Catalog ] [ Camera ] (Section 7, Screen 6) */}
        <div className="flex items-center p-1 rounded-xl bg-[var(--color-bg-sunken)] border border-[var(--color-border-subtle)]">
          <button
            type="button"
            onClick={() => setActiveTab('catalog')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
              activeTab === 'catalog'
                ? 'bg-white text-[var(--color-text-primary)] shadow-2xs'
                : 'text-[var(--color-text-secondary)]'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Brand Catalog ({scopedFabrics.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('camera');
              setIsCameraModalOpen(true);
            }}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
              activeTab === 'camera'
                ? 'bg-white text-[var(--color-text-primary)] shadow-2xs'
                : 'text-[var(--color-text-secondary)]'
            }`}
          >
            <Camera className="w-3.5 h-3.5 text-[var(--color-accent)]" />
            <span>Camera Capture</span>
          </button>
        </div>

        {/* Search & Category Pills */}
        <div className="space-y-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[var(--color-text-disabled)] absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search fabrics by name or weave..."
              className="w-full h-8 pl-8 pr-3 text-xs rounded-xl bg-[var(--color-bg-sunken)] border border-[var(--color-border-subtle)] text-[var(--color-text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-[11px] shrink-0 transition cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[var(--color-accent)] text-white font-semibold'
                    : 'bg-[var(--color-bg-sunken)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Swatch Grid */}
        <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-1">
          {filteredFabrics.map((fabric) => {
            const isAssigned = currentAssignedFabricId === fabric.id;

            return (
              <button
                key={fabric.id}
                type="button"
                onClick={() => {
                  onAssignFabric(fabric.id);
                  onClose();
                }}
                className={`rounded-2xl border text-left overflow-hidden transition cursor-pointer tactile-press flex flex-col justify-between group ${
                  isAssigned
                    ? 'border-[var(--color-accent)] ring-2 ring-[var(--color-accent)]/20 shadow-sm bg-[var(--color-accent-tint)]'
                    : 'border-[var(--color-border-subtle)] hover:border-[var(--color-border-strong)] bg-white'
                }`}
              >
                <div className="w-full aspect-square bg-neutral-100 relative overflow-hidden">
                  <img
                    src={fabric.image_url}
                    alt={fabric.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  {isAssigned && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[var(--color-accent)] text-white flex items-center justify-center shadow-xs">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </div>

                <div className="p-2.5">
                  <h4 className="text-xs font-semibold text-[var(--color-text-primary)] truncate">
                    {fabric.name}
                  </h4>
                  <div className="text-[10px] text-[var(--color-text-secondary)] mt-0.5 flex items-center justify-between">
                    <span>{fabric.category}</span>
                    <span className="font-mono text-[9px]">{fabric.metadata.sheen}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Camera Modal */}
        <CameraCaptureModal
          isOpen={isCameraModalOpen}
          onClose={() => setIsCameraModalOpen(false)}
          onFabricCaptured={(f) => {
            onAssignFabric(f.id);
            onClose();
          }}
        />
      </div>
    </div>
  );
};
