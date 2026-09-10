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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/80 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-stone-900 border-0 sm:border border-stone-800 text-stone-100 sm:rounded-2xl shadow-2xl max-w-2xl w-full h-full sm:h-auto max-h-[100vh] sm:max-h-[92vh] overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 border-b border-stone-800 flex items-center justify-between bg-stone-950 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-stone-800 border border-stone-700 flex items-center justify-center shrink-0">
              <ZoomIn className="w-4 h-4 text-amber-400" />
            </div>
            <div className="truncate">
              <h3 className="font-serif font-semibold text-stone-100 text-sm sm:text-base flex items-center gap-2 truncate">
                <span className="truncate">{fabric.name}</span>
                <span className="text-[9px] sm:text-[10px] uppercase font-sans font-semibold tracking-wider bg-stone-800 text-amber-300 px-1.5 py-0.5 rounded border border-stone-700 shrink-0">
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
            className="text-stone-400 hover:text-stone-200 p-1.5 rounded-lg hover:bg-stone-800 transition cursor-pointer shrink-0"
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
              className="relative aspect-square w-full rounded-xl overflow-hidden border border-stone-700 bg-stone-950 cursor-crosshair group shadow-inner touch-none select-none"
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
                className="absolute w-12 h-12 rounded-full border-2 border-amber-400/70 pointer-events-none -translate-x-1/2 -translate-y-1/2 shadow-lg"
                style={{ left: `${lensPos.x}%`, top: `${lensPos.y}%` }}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>

              {/* Magnification Badge */}
              <div className="absolute top-3 left-3 bg-stone-900/85 backdrop-blur-xs text-amber-300 text-[10px] font-mono px-2 py-0.5 rounded border border-stone-700 pointer-events-none">
                {zoomScale.toFixed(1)}x Macro Zoom
              </div>

              <div className="absolute bottom-3 left-3 right-3 text-center bg-stone-950/80 backdrop-blur-xs text-stone-400 text-[10px] py-1 rounded border border-stone-800 pointer-events-none">
                Hover cursor to inspect warp & weft fibers
              </div>
            </div>

            {/* Zoom slider control */}
            <div className="flex items-center justify-between text-xs text-stone-400 px-1">
              <span className="text-[11px]">Magnification:</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setZoomScale(1.8)}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono ${
                    zoomScale === 1.8 ? 'bg-amber-500 text-stone-950 font-bold' : 'bg-stone-800 text-stone-300'
                  }`}
                >
                  2x
                </button>
                <button
                  type="button"
                  onClick={() => setZoomScale(2.8)}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono ${
                    zoomScale === 2.8 ? 'bg-amber-500 text-stone-950 font-bold' : 'bg-stone-800 text-stone-300'
                  }`}
                >
                  3x
                </button>
                <button
                  type="button"
                  onClick={() => setZoomScale(4.0)}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono ${
                    zoomScale === 4.0 ? 'bg-amber-500 text-stone-950 font-bold' : 'bg-stone-800 text-stone-300'
                  }`}
                >
                  4x
                </button>
              </div>
            </div>
          </div>

          {/* Right: Technical Interior Designer Specifications */}
          <div className="space-y-4 text-xs">
            <div className="bg-stone-850 p-4 rounded-xl border border-stone-800 space-y-2.5">
              <h4 className="font-semibold text-stone-200 text-xs flex items-center gap-1.5 uppercase tracking-wider text-amber-300">
                <Award className="w-3.5 h-3.5" />
                Workroom Specification
              </h4>

              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                <div>
                  <span className="text-stone-500 block">Weave Construction:</span>
                  <span className="text-stone-200 font-medium">{fabric.metadata.weave || 'Tailored Weave'}</span>
                </div>
                <div>
                  <span className="text-stone-500 block">Surface Sheen:</span>
                  <span className="text-stone-200 font-medium">{fabric.metadata.sheen || 'Subtle Luster'}</span>
                </div>
                <div>
                  <span className="text-stone-500 block">Fabric Weight:</span>
                  <span className="text-stone-200 font-medium">{fabric.metadata.weight || 'Heavyweight Drapery'}</span>
                </div>
                <div>
                  <span className="text-stone-500 block">Drape Fullness:</span>
                  <span className="text-stone-200 font-medium">2.5x Recommended</span>
                </div>
                <div className="col-span-2">
                  <span className="text-stone-500 block">Fiber Composition:</span>
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
                <Scissors className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>Suitable for Pinch Pleats, Ripplefold, and Roman Shades</span>
              </div>
              <div className="flex items-center gap-2 text-stone-300">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
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
                className={`w-full py-2.5 px-4 rounded-lg font-bold text-xs flex items-center justify-center gap-2 shadow-md transition cursor-pointer ${
                  isAssignedToActive
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950'
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
