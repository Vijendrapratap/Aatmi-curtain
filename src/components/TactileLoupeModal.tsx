import React, { useState } from 'react';
import { Fabric, Region } from '../types/curtain';
import { X, ZoomIn, Sparkles, Check, Info, ShieldCheck, Ruler, Scissors, Award } from 'lucide-react';

interface TactileLoupeModalProps {
  isOpen: boolean;
  onClose: () => void;
  fabric: Fabric | null;
  activeRegion: Region | null;
  onApplyFabric: (fabricId: string) => void;
  isAssignedToActive: boolean;
}

export const TactileLoupeModal: React.FC<TactileLoupeModalProps> = ({
  isOpen,
  onClose,
  fabric,
  activeRegion,
  onApplyFabric,
  isAssignedToActive,
}) => {
  const [zoomScale, setZoomScale] = useState<number>(2.5); // 1.5x to 4x optical magnification
  const [lensPos, setLensPos] = useState<{ x: number; y: number }>({ x: 50, y: 50 });

  if (!isOpen || !fabric) return null;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setLensPos({ x, y });
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const touch = e.touches[0];
    const x = Math.max(0, Math.min(100, ((touch.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((touch.clientY - rect.top) / rect.height) * 100));
    setLensPos({ x, y });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="atelier-surface bg-white border-0 sm:border border-[#C9BFB4] text-stone-100 sm:rounded-2xl shadow-2xl max-w-2xl w-full h-full sm:h-auto max-h-[100vh] sm:max-h-[92vh] overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 border-b border-[#C9BFB4] flex items-center justify-between bg-[#F5F0EB] shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-white/5 border border-[#C9BFB4] flex items-center justify-center shrink-0">
              <ZoomIn className="w-4 h-4 text-[#C49A1E]" />
            </div>
            <div className="truncate">
              <h3 className="font-serif font-semibold text-stone-100 text-sm sm:text-base flex items-center gap-2 truncate">
                <span className="truncate">{fabric.name}</span>
                <span className="text-[9px] sm:text-[10px] uppercase font-sans font-semibold tracking-wider bg-[#242013] text-[#B8900F] px-2 py-0.5 rounded border border-[#D4AF37]/35 shrink-0">
                  {fabric.category}
                </span>
              </h3>
              <p className="text-[10px] sm:text-xs text-stone-400 font-sans truncate">
                Tactile Weave & Yarn Surface Loupe · 40x Macro Inspection
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="tactile-press text-stone-400 hover:text-stone-100 p-1.5 rounded-lg hover:bg-white/10 transition cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 items-start">
          {/* Left: Interactive Macro Magnifier Viewport */}
          <div className="flex flex-col gap-3">
            <div
              onMouseMove={handleMouseMove}
              onTouchMove={handleTouchMove}
              className="relative aspect-square w-full rounded-xl overflow-hidden border border-white/15 bg-black cursor-crosshair group shadow-inner touch-none select-none better-img-outline"
            >
              {/* Swatch Background Image with optical transform */}
              <div
                className="w-full h-full"
                style={{
                  backgroundImage: `url(${fabric.image_url})`,
                  backgroundPosition: `${lensPos.x}% ${lensPos.y}%`,
                  backgroundSize: `${zoomScale * 100}%`,
                  transition: 'background-size 0.2s ease-out',
                }}
              />

              {/* Crosshair lens center target */}
              <div
                className="absolute w-12 h-12 rounded-full border-2 border-[#D4AF37]/80 pointer-events-none -translate-x-1/2 -translate-y-1/2 shadow-lg"
                style={{ left: `${lensPos.x}%`, top: `${lensPos.y}%` }}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>

              {/* Magnification Badge */}
              <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-xs text-[#B8900F] text-[10px] font-mono px-2 py-0.5 rounded border border-[#D4AF37]/30 pointer-events-none">
                {zoomScale.toFixed(1)}x Macro Zoom
              </div>

              <div className="absolute bottom-3 left-3 right-3 text-center bg-black/80 backdrop-blur-xs text-stone-400 text-[10px] py-1 rounded border border-[#C9BFB4] pointer-events-none">
                Hover cursor to inspect warp & weft fibers
              </div>
            </div>

            {/* Zoom slider control */}
            <div className="flex items-center justify-between text-xs text-stone-400 px-1">
              <span className="text-[11px]">Magnification:</span>
              <div className="flex items-center gap-1.5 bg-[#E8E2DA] p-1 rounded-lg border border-[#C9BFB4]">
                <button
                  type="button"
                  onClick={() => setZoomScale(1.8)}
                  className={`tactile-press px-2.5 py-0.5 rounded text-[11px] font-mono transition ${
                    zoomScale === 1.8 ? 'bg-[#D4AF37] text-stone-950 font-bold shadow-xs' : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  2x
                </button>
                <button
                  type="button"
                  onClick={() => setZoomScale(2.8)}
                  className={`tactile-press px-2.5 py-0.5 rounded text-[11px] font-mono transition ${
                    zoomScale === 2.8 ? 'bg-[#D4AF37] text-stone-950 font-bold shadow-xs' : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  3x
                </button>
                <button
                  type="button"
                  onClick={() => setZoomScale(4.0)}
                  className={`tactile-press px-2.5 py-0.5 rounded text-[11px] font-mono transition ${
                    zoomScale === 4.0 ? 'bg-[#D4AF37] text-stone-950 font-bold shadow-xs' : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  4x
                </button>
              </div>
            </div>
          </div>

          {/* Right: Technical Interior Designer Specifications */}
          <div className="space-y-4 text-xs">
            <div className="bg-[#151822] p-4 rounded-xl border border-[#C9BFB4] space-y-2.5">
              <h4 className="font-semibold text-xs flex items-center gap-1.5 uppercase tracking-wider text-[#B8900F]">
                <Award className="w-3.5 h-3.5 text-[#C49A1E]" />
                Workroom Specification
              </h4>

              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                <div>
                  <span className="text-stone-400 block">Weave Construction:</span>
                  <span className="text-stone-200 font-medium">{fabric.metadata.weave || 'Tailored Weave'}</span>
                </div>
                <div>
                  <span className="text-stone-400 block">Surface Sheen:</span>
                  <span className="text-stone-200 font-medium">{fabric.metadata.sheen || 'Subtle Luster'}</span>
                </div>
                <div>
                  <span className="text-stone-400 block">Fabric Weight:</span>
                  <span className="text-stone-200 font-medium">{fabric.metadata.weight || 'Heavyweight Drapery'}</span>
                </div>
                <div>
                  <span className="text-stone-400 block">Drape Fullness:</span>
                  <span className="text-stone-200 font-medium">2.5x Recommended</span>
                </div>
                <div className="col-span-2">
                  <span className="text-stone-400 block">Fiber Composition:</span>
                  <span className="text-stone-200 font-medium">{fabric.metadata.composition || 'Natural & Silk Blend'}</span>
                </div>
              </div>
            </div>

            {/* Performance & Tactile Highlights */}
            <div className="space-y-2 text-[11px]">
              <div className="flex items-center gap-2 text-stone-300">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Martindale 45,000+ rubs (Contract & Residential Grade)</span>
              </div>
              <div className="flex items-center gap-2 text-stone-300">
                <Scissors className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span>Suitable for Pinch Pleats, Ripplefold, and Roman Shades</span>
              </div>
              <div className="flex items-center gap-2 text-stone-300">
                <Sparkles className="w-3.5 h-3.5 text-[#C49A1E] shrink-0" />
                <span>Responsive to room ambient lighting and window daylight</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  onApplyFabric(fabric.id);
                  onClose();
                }}
                className={`tactile-press w-full py-2.5 px-4 rounded-lg font-bold text-xs flex items-center justify-center gap-2 shadow-md transition cursor-pointer ${
                  isAssignedToActive
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gradient-to-r from-[#D4AF37] to-[#B89025] hover:brightness-105 text-stone-950'
                }`}
              >
                {isAssignedToActive ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Already Assigned to {activeRegion?.display_name || 'Active Zone'}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Apply to {activeRegion?.display_name || 'Active Zone'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
