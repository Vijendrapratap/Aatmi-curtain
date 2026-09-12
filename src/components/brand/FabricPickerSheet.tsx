// src/components/brand/FabricPickerSheet.tsx
// The studio's fabric panel. Dock variant sits beside the canvas on desktop;
// modal variant is the bottom sheet on small screens.
import React, { useState } from 'react';
import { X, Camera, Search, Check, Eye, Palette, ArrowLeftRight } from 'lucide-react';
import { Fabric, FabricAssignment, Region } from '../../types/curtain';
import { fabricOriginBadge } from '../../lib/labels';
import { CameraCaptureModal } from './CameraCaptureModal';
import { FabricPreviewModal } from './FabricPreviewModal';

interface FabricPickerSheetProps {
  variant: 'dock' | 'modal';
  isOpen: boolean;
  onClose: () => void;
  activeRegion: Region | null;
  regions: Region[];
  assignments: FabricAssignment[];
  fabrics: Fabric[];
  currentAssignedFabricId: string | null;
  onAssignFabric: (fabricId: string) => void;
  onAssignFabricTo: (target: string | 'all', fabricId: string) => void;
  onChangeZone: () => void;
}

const CATEGORIES = ['All', 'Your fabrics', 'Velvet', 'Linen', 'Silk', 'Geometric', 'Jacquard & Damask', 'Textured & Bouclé', 'Exotic Relief'];

const PickerFabricItem: React.FC<{ fabric: Fabric; isAssigned: boolean; onSelect: () => void; onPreview: () => void; compact: boolean }> = ({ fabric, isAssigned, onSelect, onPreview, compact }) => {
  const [imgError, setImgError] = useState(false);
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(); } }}
      title={`Use ${fabric.name}`}
      className={`group relative flex cursor-pointer flex-col overflow-hidden rounded-[12px] text-left transition-shadow ${isAssigned ? 'ring-2 ring-[var(--color-accent)] ring-offset-1' : 'shadow-[var(--shadow-ring)] hover:shadow-[var(--shadow-card)]'}`}
    >
      <div className="relative w-full overflow-hidden bg-[var(--color-bg-sunken)]" style={{ backgroundColor: fabric.color_hex || '#EDE8DE', aspectRatio: '1 / 1', minHeight: compact ? 88 : 112 }}>
        {!imgError ? (
          <img src={fabric.image_url} alt={fabric.name} onError={() => setImgError(true)} loading="lazy" className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center p-2 text-center text-white" style={{ backgroundColor: fabric.color_hex || '#5B4FE0' }}>
            <Palette className="mb-1 h-5 w-5 opacity-80" />
            <span className="max-w-full truncate px-1 text-[10px] font-semibold">{fabric.name}</span>
          </div>
        )}
        {isAssigned && (
          <span className="absolute top-2 right-2 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-accent)] text-white shadow-xs"><Check className="h-3 w-3 stroke-[2.5]" /></span>
        )}
        {fabricOriginBadge(fabric) === 'Your fabric' && <span className="badge badge-accent absolute top-2 left-2">Yours</span>}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onPreview(); }}
          onKeyDown={(e) => e.stopPropagation()}
          title="Look closer"
          className="absolute right-2 bottom-2 z-10 flex items-center gap-1 rounded-lg bg-white/95 p-1.5 text-[var(--color-text-primary)] opacity-0 shadow-sm transition group-hover:opacity-100 group-focus-within:opacity-100"
        >
          <Eye className="h-3.5 w-3.5 text-[var(--color-accent)]" />
          <span className="pr-0.5 text-[10px] font-semibold">Look closer</span>
        </button>
      </div>
      {!compact && (
        <div className="p-2">
          <h4 className="truncate text-[12px] font-semibold">{fabric.name}</h4>
          <div className="mt-0.5 truncate text-[10px] text-[var(--color-text-tertiary)]">{fabric.category}</div>
        </div>
      )}
    </div>
  );
};

export const FabricPickerSheet: React.FC<FabricPickerSheetProps> = ({ variant, isOpen, onClose, activeRegion, regions, assignments, fabrics, currentAssignedFabricId, onAssignFabric, onAssignFabricTo, onChangeZone }) => {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [previewing, setPreviewing] = useState<Fabric | null>(null);

  if (variant === 'modal' && !isOpen) return null;

  const filtered = fabrics.filter((f) => {
    if (category === 'Your fabrics' && fabricOriginBadge(f) !== 'Your fabric') return false;
    if (category !== 'All' && category !== 'Your fabrics' && f.category !== category) return false;
    if (query.trim()) {
      const q = query.toLowerCase();
      return f.name.toLowerCase().includes(q) || f.category.toLowerCase().includes(q) || f.tags.some((t) => t.toLowerCase().includes(q));
    }
    return true;
  });

  const pick = (fabricId: string) => {
    onAssignFabric(fabricId);
    if (variant === 'modal') onClose();
  };

  const body = (
    <>
      <div className="flex items-start justify-between gap-2 border-b border-[var(--color-border-subtle)] pb-3">
        <div className="min-w-0">
          <p className="eyebrow-label">Fabrics for</p>
          <h3 className="truncate font-display text-[15px] font-semibold">{activeRegion ? activeRegion.display_name : 'Pick a zone first'}</h3>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {regions.length > 1 && (
            <button type="button" onClick={onChangeZone} className="btn btn-ghost btn-sm" title="Choose a different zone">
              <ArrowLeftRight className="h-3.5 w-3.5" /> Change zone
            </button>
          )}
          {variant === 'modal' && (
            <button type="button" onClick={onClose} className="btn btn-ghost btn-sm" aria-label="Close fabric panel"><X className="h-5 w-5" /></button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-[var(--color-text-disabled)]" />
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search fabrics" className="field pl-9" />
        </div>
        <button type="button" onClick={() => setIsCameraOpen(true)} className="btn btn-secondary shrink-0" title="Photograph a physical fabric sample and use it here">
          <Camera className="h-4 w-4" /><span className="hidden xl:inline">Photograph a fabric</span>
        </button>
      </div>

      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {CATEGORIES.map((c) => (
          <button key={c} type="button" onClick={() => setCategory(c)} className={`shrink-0 rounded-[8px] px-2.5 py-1 text-[11px] font-medium ${category === c ? 'bg-[var(--color-accent)] text-white' : 'bg-[var(--color-bg-sunken)] text-[var(--color-text-secondary)]'}`}>{c}</button>
        ))}
      </div>

      <div className={`grid min-h-0 flex-1 auto-rows-max content-start gap-2 overflow-y-auto p-0.5 ${variant === 'dock' ? 'grid-cols-2' : 'grid-cols-3 sm:grid-cols-4'}`}>
        {!activeRegion ? (
          <div className="col-span-full px-2 py-10 text-center text-[13px] text-[var(--color-text-tertiary)]">Click a zone on the curtain or in the zones list.</div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full py-10 text-center text-[13px] text-[var(--color-text-tertiary)]">No fabrics match.</div>
        ) : (
          filtered.map((f) => (
            <PickerFabricItem key={f.id} fabric={f} compact={variant === 'dock'} isAssigned={currentAssignedFabricId === f.id} onSelect={() => pick(f.id)} onPreview={() => setPreviewing(f)} />
          ))
        )}
      </div>

      <CameraCaptureModal isOpen={isCameraOpen} onClose={() => setIsCameraOpen(false)} onFabricCaptured={(f) => pick(f.id)} />

      <FabricPreviewModal
        isOpen={!!previewing}
        onClose={() => setPreviewing(null)}
        fabric={previewing}
        regions={regions}
        activeRegionId={activeRegion?.id || null}
        assignments={assignments}
        fabrics={fabrics}
        onApply={(target, fabId) => {
          onAssignFabricTo(target, fabId);
          setPreviewing(null);
          if (variant === 'modal') onClose();
        }}
        onGoToStudio={() => setPreviewing(null)}
      />
    </>
  );

  if (variant === 'dock') {
    return <div className="flex h-full min-h-0 w-full flex-col gap-3 overflow-hidden rounded-[18px] bg-[var(--color-bg-surface)] p-3 shadow-[var(--shadow-card)]">{body}</div>;
  }
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#1A1814]/40 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="relative flex h-[min(640px,90dvh)] w-full max-w-2xl flex-col gap-3 rounded-t-[24px] bg-[var(--color-bg-surface)] p-4 shadow-[var(--shadow-modal)] sm:rounded-[24px]">{body}</div>
    </div>
  );
};
