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
  Eye,
  Camera as CameraIcon,
} from 'lucide-react';
import { CameraCaptureModal } from './CameraCaptureModal';
import { FabricPreviewModal } from './FabricPreviewModal';

interface FabricPickerSheetProps {
  isOpen: boolean;
  onClose: () => void;
  activeRegion: Region | null;
  currentAssignedFabricId: string | null;
  onAssignFabric: (fabricId: string) => void;
  variant?: 'modal' | 'dock';
}

const PickerFabricItem: React.FC<{
  fabric: Fabric;
  isAssigned: boolean;
  onSelect: () => void;
  onPreview: () => void;
  compact?: boolean;
}> = ({ fabric, isAssigned, onSelect, onPreview, compact = false }) => {
  const [imgError, setImgError] = useState(false);
  const isRealPhoto = fabric.image_url.startsWith('/fabrics/');

  return (
    <div
      onClick={onSelect}
      title={fabric.name}
      className={`group relative flex shrink-0 cursor-pointer flex-col overflow-hidden rounded-[12px] text-left transition-shadow ${
        isAssigned
          ? 'ring-2 ring-[var(--color-accent)] ring-offset-1'
          : 'shadow-[var(--shadow-ring)] hover:shadow-[var(--shadow-card)]'
      }`}
    >
      <div
        className="relative w-full shrink-0 overflow-hidden bg-[var(--color-bg-sunken)]"
        style={{
          backgroundColor: fabric.color_hex || '#EDE8DE',
          aspectRatio: '1 / 1',
          minHeight: compact ? 92 : 112,
        }}
      >
        {!imgError ? (
          <img
            src={fabric.image_url}
            alt={fabric.name}
            onError={() => setImgError(true)}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          />
        ) : (
          <div
            className="w-full h-full flex flex-col items-center justify-center p-2 text-center text-white"
            style={{
              backgroundColor: fabric.color_hex || '#5B4FE0',
              backgroundImage:
                'repeating-linear-gradient(45deg, rgba(255,255,255,0.06) 0px, rgba(255,255,255,0.06) 2px, transparent 2px, transparent 6px)',
            }}
          >
            <Palette className="w-5 h-5 mb-1 opacity-80" />
            <span className="text-[10px] font-semibold truncate max-w-full px-1">
              {fabric.name}
            </span>
          </div>
        )}

        {/* Assigned checkmark indicator */}
        {isAssigned && (
          <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[var(--color-accent)] text-white flex items-center justify-center shadow-xs z-10">
            <Check className="w-3 h-3 stroke-[2.5]" />
          </div>
        )}

        {/* Real photo badge */}
        {isRealPhoto && (
          <span className="badge badge-muted absolute top-2 left-2">Real</span>
        )}

        {/* Quick Tactile Loupe Inspect button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onPreview();
          }}
          title="Inspect tactile weave"
          className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-white/95 hover:bg-white text-[var(--color-text-primary)] shadow-sm opacity-0 group-hover:opacity-100 transition duration-150 cursor-pointer flex items-center gap-1 z-10"
        >
          <Eye className="w-3.5 h-3.5 text-[var(--color-accent)]" />
          <span className="text-[10px] font-semibold pr-0.5">Inspect</span>
        </button>
      </div>

      {!compact && (
        <div className="p-2">
          <h4 className="truncate text-[12px] font-semibold">{fabric.name}</h4>
          <div className="mt-0.5 truncate text-[10px] text-[var(--color-text-tertiary)]">
            {fabric.category}
          </div>
        </div>
      )}
    </div>
  );
};

export const FabricPickerSheet: React.FC<FabricPickerSheetProps> = ({
  isOpen,
  onClose,
  activeRegion,
  currentAssignedFabricId,
  onAssignFabric,
  variant = 'modal',
}) => {
  const { brandFabrics, currentBrandId } = useBrandStore();

  const [activeTab, setActiveTab] = useState<'catalog' | 'camera'>('catalog');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [previewingFabric, setPreviewingFabric] = useState<Fabric | null>(null);

  const scopedFabrics = brandFabrics.filter(
    (f) => f.brand_id === currentBrandId || !f.brand_id
  );

  if (variant === 'modal' && (!isOpen || !activeRegion)) return null;

  const filteredFabrics = scopedFabrics.filter((f) => {
    if (selectedCategory === 'Real Swatches' && !f.image_url.startsWith('/fabrics/')) {
      return false;
    }
    if (
      selectedCategory !== 'All' &&
      selectedCategory !== 'Real Swatches' &&
      f.category !== selectedCategory
    ) {
      return false;
    }
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
    'Real Swatches',
    'Velvet',
    'Linen',
    'Silk',
    'Jacquard & Damask',
    'Textured & Bouclé',
    'Exotic Relief',
  ];

  const body = (
    <>
        <div className="flex items-center justify-between border-b border-[var(--color-border-subtle)] pb-3">
          <div className="min-w-0">
            <p className="eyebrow-label">Fabrics</p>
            <h3 className="truncate font-display text-[15px] font-semibold">
              {activeRegion ? activeRegion.display_name : 'Select a zone'}
            </h3>
          </div>
          {variant === 'modal' && (
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost"
              aria-label="Close fabric picker"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        <div className="segmented w-full">
          <button
            type="button"
            onClick={() => setActiveTab('catalog')}
            className={`segmented-item flex-1 ${activeTab === 'catalog' ? 'is-active' : ''}`}
          >
            Catalog
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('camera');
              setIsCameraModalOpen(true);
            }}
            className={`segmented-item flex-1 ${activeTab === 'camera' ? 'is-active' : ''}`}
          >
            Camera
          </button>
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-[var(--color-text-disabled)]" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search weave or name"
            className="field pl-9"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`shrink-0 rounded-[8px] px-2.5 py-1 text-[11px] font-medium ${
                selectedCategory === cat
                  ? 'bg-[var(--color-accent)] text-white'
                  : 'bg-[var(--color-bg-sunken)] text-[var(--color-text-secondary)]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div
          className={`grid min-h-0 flex-1 auto-rows-max content-start gap-2 overflow-y-auto p-0.5 ${
            variant === 'dock' ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4'
          }`}
        >
          {!activeRegion ? (
            <div className="col-span-full px-2 py-10 text-center text-[13px] text-[var(--color-text-tertiary)]">
              Select a zone to assign a swatch.
            </div>
          ) : (
            filteredFabrics.map((fabric) => (
              <PickerFabricItem
                key={fabric.id}
                fabric={fabric}
                compact={variant === 'dock'}
                isAssigned={currentAssignedFabricId === fabric.id}
                onSelect={() => {
                  onAssignFabric(fabric.id);
                  if (variant === 'modal') onClose();
                }}
                onPreview={() => setPreviewingFabric(fabric)}
              />
            ))
          )}

          {activeRegion && filteredFabrics.length === 0 && (
            <div className="col-span-full py-10 text-center text-[13px] text-[var(--color-text-tertiary)]">
              No fabrics match.
            </div>
          )}
        </div>

        <CameraCaptureModal
          isOpen={isCameraModalOpen}
          onClose={() => setIsCameraModalOpen(false)}
          onFabricCaptured={(f) => {
            onAssignFabric(f.id);
            if (variant === 'modal') onClose();
          }}
        />

        <FabricPreviewModal
          isOpen={!!previewingFabric}
          onClose={() => setPreviewingFabric(null)}
          fabric={previewingFabric}
          regions={activeRegion ? [activeRegion] : []}
          activeRegionId={activeRegion?.id || null}
          onApplyToRegion={(_regId, fabId) => {
            onAssignFabric(fabId);
            setPreviewingFabric(null);
            if (variant === 'modal') onClose();
          }}
          onApplyToAllRegions={(fabId) => {
            onAssignFabric(fabId);
            setPreviewingFabric(null);
            if (variant === 'modal') onClose();
          }}
          onGoToStudio={() => {
            if (previewingFabric) onAssignFabric(previewingFabric.id);
            setPreviewingFabric(null);
            if (variant === 'modal') onClose();
          }}
        />
    </>
  );

  if (variant === 'dock') {
    return (
      <div className="flex h-full min-h-0 w-full flex-col gap-3 overflow-hidden rounded-[18px] bg-[var(--color-bg-surface)] p-3 shadow-[var(--shadow-card)]">
        {body}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#1A1814]/40 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="relative flex h-[min(640px,90dvh)] w-full max-w-2xl flex-col gap-3 rounded-t-[24px] bg-[var(--color-bg-surface)] p-5 shadow-[var(--shadow-modal)] sm:rounded-[24px]">
        {body}
      </div>
    </div>
  );
};
