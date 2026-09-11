// src/components/brand/FabricPreviewModal.tsx
import React, { useState } from 'react';
import { Fabric, Region } from '../../types/curtain';
import {
  X,
  ZoomIn,
  Sparkles,
  Check,
  Palette,
  Layers,
  Info,
  ArrowRight,
  Maximize2,
} from 'lucide-react';

interface FabricPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  fabric: Fabric | null;
  regions: Region[];
  activeRegionId: string | null;
  onApplyToRegion: (regionId: string, fabricId: string) => void;
  onApplyToAllRegions: (fabricId: string) => void;
  onGoToStudio: () => void;
}

export const FabricPreviewModal: React.FC<FabricPreviewModalProps> = ({
  isOpen,
  onClose,
  fabric,
  regions,
  activeRegionId,
  onApplyToRegion,
  onApplyToAllRegions,
  onGoToStudio,
}) => {
  const [selectedRegionId, setSelectedRegionId] = useState<string>(
    activeRegionId || regions[0]?.id || ''
  );
  const [isLoupeActive, setIsLoupeActive] = useState(false);
  const [lensPos, setLensPos] = useState({ x: 50, y: 50 });
  const [appliedNotice, setAppliedNotice] = useState<string | null>(null);
  const [imgFailed, setImgFailed] = useState(false);

  if (!isOpen || !fabric) return null;

  const targetRegion = regions.find((r) => r.id === selectedRegionId) || regions[0];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isLoupeActive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setLensPos({ x, y });
  };

  const handleApplySingle = () => {
    if (selectedRegionId) {
      onApplyToRegion(selectedRegionId, fabric.id);
      setAppliedNotice(`Applied to "${targetRegion?.display_name || 'Zone'}"`);
      setTimeout(() => setAppliedNotice(null), 2500);
    }
  };

  const handleApplyAndGo = () => {
    if (selectedRegionId) {
      onApplyToRegion(selectedRegionId, fabric.id);
    } else if (regions.length > 0) {
      onApplyToRegion(regions[0].id, fabric.id);
    }
    onClose();
    onGoToStudio();
  };

  const handleApplyAll = () => {
    onApplyToAllRegions(fabric.id);
    setAppliedNotice(`Applied to all ${regions.length} curtain zones!`);
    setTimeout(() => setAppliedNotice(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="brand-card w-full max-w-3xl bg-white max-h-[92vh] flex flex-col overflow-hidden shadow-2xl relative">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[var(--color-border-subtle)] flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="w-4 h-4 rounded-full border border-black/15 shrink-0 shadow-xs"
              style={{ backgroundColor: fabric.color_hex || '#5B4FE0' }}
            />
            <div>
              <h2 className="text-base font-display font-semibold text-[var(--color-text-primary)]">
                {fabric.name}
              </h2>
              <div className="text-[11px] text-[var(--color-text-secondary)] font-mono">
                {fabric.category} • {fabric.metadata?.weave || 'Woven Drapery'}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[var(--color-bg-sunken)] text-[var(--color-text-secondary)] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* Left Column: High-Res Interactive Viewport */}
          <div className="space-y-3">
            <div
              onMouseMove={handleMouseMove}
              className="relative w-full aspect-square rounded-2xl overflow-hidden bg-neutral-100 border border-[var(--color-border-strong)] shadow-inner group select-none cursor-crosshair"
              style={{
                backgroundColor: fabric.color_hex || '#F3EFE6',
              }}
            >
              {!imgFailed ? (
                <img
                  src={fabric.image_url}
                  alt={fabric.name}
                  onError={() => setImgFailed(true)}
                  className="w-full h-full object-cover transition-transform duration-200"
                />
              ) : (
                <div
                  className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-white"
                  style={{
                    backgroundColor: fabric.color_hex || '#333',
                    backgroundImage:
                      'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.18) 0%, transparent 80%)',
                  }}
                >
                  <Palette className="w-12 h-12 mb-2 opacity-80" />
                  <span className="font-display text-sm font-semibold">{fabric.name}</span>
                  <span className="text-[10px] opacity-80 mt-1 font-mono">
                    {fabric.color_hex}
                  </span>
                </div>
              )}

              {/* 40x Macro Loupe Lens */}
              {isLoupeActive && (
                <div
                  className="absolute pointer-events-none rounded-full border-2 border-white shadow-2xl overflow-hidden z-20"
                  style={{
                    width: 140,
                    height: 140,
                    left: `${lensPos.x}%`,
                    top: `${lensPos.y}%`,
                    transform: 'translate(-50%, -50%)',
                    backgroundImage: `url(${fabric.image_url})`,
                    backgroundPosition: `${lensPos.x}% ${lensPos.y}%`,
                    backgroundSize: '450%',
                    backgroundColor: fabric.color_hex,
                  }}
                />
              )}

              {/* View mode indicator */}
              <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-white text-[10px] font-mono">
                {isLoupeActive ? '40x TACTILE LOUPE' : 'TEXTURE VIEW'}
              </div>
            </div>

            {/* Loupe Toggle Button */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsLoupeActive(!isLoupeActive)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border ${
                  isLoupeActive
                    ? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)]'
                    : 'bg-white border-[var(--color-border-strong)] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-sunken)]'
                }`}
              >
                <ZoomIn className="w-3.5 h-3.5" />
                <span>{isLoupeActive ? 'Disable Loupe' : '40x Tactile Weave Loupe'}</span>
              </button>

              <span className="text-[11px] font-mono text-[var(--color-text-secondary)]">
                Tileable Seamless
              </span>
            </div>
          </div>

          {/* Right Column: Material Details & Instant Apply Controls */}
          <div className="space-y-5">
            {/* Success Feedback Alert */}
            {appliedNotice && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2 animate-in fade-in">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-semibold">{appliedNotice}</span>
              </div>
            )}

            {/* Material Specifications */}
            <div className="p-4 rounded-2xl bg-[var(--color-bg-sunken)] border border-[var(--color-border-subtle)] space-y-2.5 text-xs">
              <div className="eyebrow-label text-[var(--color-accent)] font-semibold">
                TEXTILE SPECIFICATIONS
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-[var(--color-text-secondary)] block">Weave Pattern:</span>
                  <span className="font-semibold text-[var(--color-text-primary)]">
                    {fabric.metadata?.weave || 'Fine Thread Weave'}
                  </span>
                </div>

                <div>
                  <span className="text-[var(--color-text-secondary)] block">Sheen / Luster:</span>
                  <span className="font-semibold text-[var(--color-text-primary)]">
                    {fabric.metadata?.sheen || 'Subtle Luster'}
                  </span>
                </div>

                <div>
                  <span className="text-[var(--color-text-secondary)] block">Fabric Weight:</span>
                  <span className="font-semibold text-[var(--color-text-primary)]">
                    {fabric.metadata?.weight || 'Heavyweight Drapery'}
                  </span>
                </div>

                <div>
                  <span className="text-[var(--color-text-secondary)] block">Composition:</span>
                  <span className="font-semibold text-[var(--color-text-primary)] truncate block">
                    {fabric.metadata?.composition || 'Natural Atelier Fibers'}
                  </span>
                </div>
              </div>

              {fabric.tags && fabric.tags.length > 0 && (
                <div className="pt-2 border-t border-[var(--color-border-subtle)] flex flex-wrap gap-1">
                  {fabric.tags.map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 rounded-md bg-white text-[10px] text-[var(--color-text-secondary)] font-mono border border-[var(--color-border-subtle)]"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Apply To Zone Section (The Key Requirement!) */}
            <div className="p-4 rounded-2xl bg-white border border-[var(--color-border-strong)] space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="eyebrow-label text-[var(--color-text-primary)] font-semibold flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                  <span>Apply to Active Curtain</span>
                </span>
                <span className="text-[10px] font-mono text-[var(--color-text-secondary)]">
                  {regions.length} Available Zones
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[var(--color-text-secondary)] mb-1">
                  Select Target Curtain Zone:
                </label>
                <select
                  value={selectedRegionId}
                  onChange={(e) => setSelectedRegionId(e.target.value)}
                  className="w-full h-10 px-3 text-xs rounded-xl bg-[var(--color-bg-sunken)] border border-[var(--color-border-strong)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                >
                  {regions.map((reg) => (
                    <option key={reg.id} value={reg.id}>
                      Zone #{reg.order}: {reg.display_name} ({reg.location})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2 pt-1">
                {/* 1. Apply to selected zone & immediately route to Studio Editor */}
                <button
                  type="button"
                  onClick={handleApplyAndGo}
                  className="w-full h-11 rounded-[var(--radius-button)] bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer tactile-press shadow-xs"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Apply &amp; Open in Studio Editor →</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  {/* 2. Apply to single zone only */}
                  <button
                    type="button"
                    onClick={handleApplySingle}
                    className="h-9 px-3 rounded-xl bg-white hover:bg-[var(--color-bg-sunken)] border border-[var(--color-border-strong)] text-xs font-semibold text-[var(--color-text-primary)] flex items-center justify-center gap-1.5 cursor-pointer tactile-press shadow-2xs"
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Apply to This Zone</span>
                  </button>

                  {/* 3. Apply to all zones */}
                  <button
                    type="button"
                    onClick={handleApplyAll}
                    className="h-9 px-3 rounded-xl bg-white hover:bg-[var(--color-bg-sunken)] border border-[var(--color-border-strong)] text-xs font-semibold text-[var(--color-text-primary)] flex items-center justify-center gap-1.5 cursor-pointer tactile-press shadow-2xs"
                  >
                    <span>Apply to All Zones</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
