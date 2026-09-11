import React, { useRef, useState } from 'react';
import { CurtainTemplate, Fabric, FabricAssignment, Region } from '../types/curtain';
import { LuxuryColorPalette } from './LuxuryColorPalette';
import {
  Upload,
  Layers,
  Sparkles,
  Sliders,
  RotateCw,
  Maximize,
  Check,
  Palette,
  ChevronRight,
  Info,
  ZoomIn,
  Paintbrush,
  SlidersHorizontal,
} from 'lucide-react';

interface RegionAssignmentPanelProps {
  template: CurtainTemplate;
  assignments: FabricAssignment[];
  fabrics: Fabric[];
  activeRegionId: string | null;
  onSelectRegion: (regionId: string) => void;
  onAssignFabric: (regionId: string, fabricId: string) => void;
  onUpdateAssignmentControls: (regionId: string, updates: Partial<FabricAssignment>) => void;
  onOpenFabricUploadForRegion: (regionId: string) => void;
  onOpenFabricLibrary: () => void;
  onTriggerAiGeneration: () => void;
  isGeneratingAi: boolean;
  onReturnToPreview?: () => void;
  onOpenTactileLoupe?: (fabric: Fabric) => void;
  onAddNewFabric?: (newFabric: Fabric) => void;
}

export const RegionAssignmentPanel: React.FC<RegionAssignmentPanelProps> = ({
  template,
  assignments,
  fabrics,
  activeRegionId,
  onSelectRegion,
  onAssignFabric,
  onUpdateAssignmentControls,
  onOpenFabricUploadForRegion,
  onOpenFabricLibrary,
  onTriggerAiGeneration,
  isGeneratingAi,
  onReturnToPreview,
  onOpenTactileLoupe,
  onAddNewFabric,
}) => {
  const [materialTab, setMaterialTab] = useState<'swatches' | 'palette' | 'tailoring'>('swatches');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const targetRegionForFileRef = useRef<string | null>(null);

  // Map of fabric by ID
  const fabricMap = new Map<string, Fabric>();
  fabrics.forEach((f) => fabricMap.set(f.id, f));

  // Handle direct file upload for a section
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const regionId = targetRegionForFileRef.current;
    if (!file || !regionId) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      const customFabricId = `custom-fab-${Date.now()}`;
      const newCustomFabric: Fabric = {
        id: customFabricId,
        name: file.name.replace(/\.[^/.]+$/, ''),
        image_url: base64,
        category: 'Custom',
        tileable: true,
        tags: ['uploaded', 'custom'],
        metadata: {
          weave: 'Custom Swatch Weave',
          scale: 'medium',
          sheen: 'Subtle Luster',
          weight: 'Medium',
          composition: 'Client Uploaded Fabric Sample',
        },
        color_hex: '#8C7A6B',
        is_custom: true,
      };

      fabrics.unshift(newCustomFabric);
      onAssignFabric(regionId, customFabricId);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const triggerUploadForRegion = (regionId: string) => {
    targetRegionForFileRef.current = regionId;
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSelectColor = (color: { name: string; hex: string }) => {
    if (!activeRegion) return;
    const colorFabricId = `fab-color-${color.hex.replace('#', '').toLowerCase()}`;
    let existing = fabrics.find(
      (f) => f.id === colorFabricId || (f.is_custom && f.color_hex?.toLowerCase() === color.hex.toLowerCase())
    );
    if (!existing) {
      const svgThumb = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="80" height="80" fill="${encodeURIComponent(
        color.hex
      )}"/><circle cx="40" cy="40" r="24" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="2"/></svg>`;
      const newColorway: Fabric = {
        id: colorFabricId,
        name: `${color.name} Colorway`,
        image_url: svgThumb,
        category: 'Custom',
        tileable: true,
        tags: ['colorway', color.name.toLowerCase()],
        metadata: {
          weave: 'Tailored Architectural Weave',
          scale: 'medium',
          sheen: 'Subtle Luster',
          weight: 'Heavyweight Drapery',
          composition: 'Curated Brand Color Spec',
        },
        color_hex: color.hex,
        is_custom: true,
      };
      if (onAddNewFabric) {
        onAddNewFabric(newColorway);
      } else {
        fabrics.unshift(newColorway);
      }
      existing = newColorway;
    }
    onAssignFabric(activeRegion.id, existing.id);
  };

  const activeRegion = template.regions.find((r) => r.id === activeRegionId) || template.regions[0];
  const activeAssignment = assignments.find((a) => a.region_id === activeRegion?.id);
  const activeFabric = activeAssignment ? fabricMap.get(activeAssignment.fabric_id) : null;

  return (
    <aside className="w-full lg:w-96 bg-[#FDFCFA] border-r border-[#E2D9CE] flex flex-col h-full shadow-2xl select-none">
      {/* Hidden file input for fast region file upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/png,image/jpeg,image/webp,image/jpg"
        className="hidden"
      />

      {/* Header section */}
      <div className="p-4 sm:p-5 border-b border-[#E2D9CE] bg-[#F0EBE4]">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#C49A1E] flex items-center justify-center shadow-xs">
              <Layers className="w-3.5 h-3.5" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-[#1A1714] text-sm tracking-wide">
                Fabric Zone Matrix
              </h2>
              <p className="text-[10px] text-[#6B5F54] font-mono">
                ARCHITECTURAL ZONES ({template.regions.length})
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onReturnToPreview && (
              <button
                onClick={onReturnToPreview}
                className="lg:hidden text-[11px] bg-gradient-to-r from-[#D4AF37] to-[#B89025] text-[#0A0B0E] font-bold px-3 py-1.5 rounded-lg shadow-xs cursor-pointer flex items-center gap-1 tactile-press"
              >
                <span>View Curtain</span>
                <span>→</span>
              </button>
            )}
            <span className="text-[11px] font-semibold text-[#C49A1E] bg-[#D4AF37]/10 border border-[#C49A1E]/30 px-2.5 py-0.5 rounded-full font-mono">
              {assignments.length}/{template.regions.length} ASSIGNED
            </span>
          </div>
        </div>
        <p className="text-[11px] text-[#6B5F54] leading-relaxed mt-1">
          Assign luxury swatches to drape panels, trims, and hems. Tune weave scale and rotation.
        </p>
      </div>

      {/* Region Cards List */}
      <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-3">
        {template.regions.map((region) => {
          const isSelected = activeRegion?.id === region.id;
          const assignment = assignments.find((a) => a.region_id === region.id);
          const currentFabric = assignment ? fabricMap.get(assignment.fabric_id) : null;

          return (
            <div
              key={region.id}
              id={`region-card-${region.id}`}
              onClick={() => onSelectRegion(region.id)}
              className={`rounded-xl border transition-all duration-150 p-3.5 cursor-pointer relative ${
                isSelected
                  ? 'border-2 border-[#C49A1E] bg-[#FFFDF8] shadow-sm ring-1 ring-[#C49A1E]/30'
                  : 'border-[#E2D9CE] hover:border-[#C49A1E]/50 bg-white hover:bg-[#FAF7F2]'
              }`}
            >
              {/* Region Label Bar */}
              <div className="flex items-start justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-5 h-5 rounded-full text-[#0A0B0E] text-[10px] font-bold flex items-center justify-center shadow-xs"
                    style={{ backgroundColor: region.accent_color || '#D4AF37' }}
                  >
                    {region.order}
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-[#1A1714] leading-tight">
                      {region.display_name}
                    </h3>
                    <p className="text-[10px] text-[#6B5F54] line-clamp-1 mt-0.5">
                      {region.description}
                    </p>
                  </div>
                </div>

                {isSelected && (
                  <span className="text-[9px] uppercase font-bold tracking-wider text-[#C49A1E] bg-[#D4AF37]/15 border border-[#D4AF37]/30 px-2 py-0.5 rounded-full font-mono">
                    Active Zone
                  </span>
                )}
              </div>

              {/* Current Assigned Fabric Card */}
              <div className="flex items-center gap-3 bg-[#F8F5F0] p-2 rounded-lg border border-[#E2D9CE] mb-2.5">
                <div className="w-11 h-11 rounded-md overflow-hidden shrink-0 bg-[#EDE7DF] relative better-img-outline shadow-xs">
                  {currentFabric ? (
                    <img
                      src={currentFabric.image_url}
                      alt={currentFabric.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div
                      className="w-full h-full"
                      style={{ backgroundColor: region.default_color || '#DDD6C7' }}
                    />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-[#1A1714] truncate">
                      {currentFabric ? currentFabric.name : 'Default Preset Fabric'}
                    </span>
                    {currentFabric?.is_custom && (
                      <span className="text-[9px] bg-[#D4AF37]/20 text-[#C49A1E] px-1.5 py-0.2 rounded font-medium border border-[#D4AF37]/30">
                        Custom
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-[#6B5F54] truncate mt-0.5">
                    {currentFabric
                      ? `${currentFabric.category} • ${currentFabric.metadata.weave}`
                      : 'Original style preset'}
                  </p>
                </div>
              </div>

              {/* Quick Actions for this Region */}
              <div className="flex items-center gap-2 pt-1.5 border-t border-[#222532]">
                <button
                  id={`btn-upload-for-region-${region.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    triggerUploadForRegion(region.id);
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 text-[11px] font-medium bg-white hover:bg-[#F8F5F0] text-[#1A1714] py-1.5 ps-3 pe-2.5 rounded-lg border border-[#C9BFB4] transition cursor-pointer tactile-press shadow-2xs"
                  title="Upload a fabric photo for this specific section"
                >
                  <Upload className="w-3 h-3 text-[#C49A1E]" />
                  <span>Upload</span>
                </button>

                <button
                  id={`btn-choose-fabric-${region.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectRegion(region.id);
                    onOpenFabricLibrary();
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 text-[11px] font-medium bg-white hover:bg-[#F8F5F0] text-[#1A1714] py-1.5 ps-3 pe-2.5 rounded-lg border border-[#C9BFB4] transition cursor-pointer tactile-press shadow-2xs"
                >
                  <Palette className="w-3 h-3 text-[#C49A1E]" />
                  <span>Swatches</span>
                </button>

                {currentFabric && onOpenTactileLoupe && (
                  <button
                    id={`btn-loupe-region-${region.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenTactileLoupe(currentFabric);
                    }}
                    className="p-1.5 bg-[#FFF8E6] hover:bg-[#FFF3D1] text-[#C49A1E] rounded-lg border border-[#C49A1E]/40 transition cursor-pointer shrink-0 tactile-press"
                    title={`Inspect ${currentFabric.name} with 40x macro optical loupe`}
                  >
                    <ZoomIn className="w-3.5 h-3.5 text-[#C49A1E]" />
                  </button>
                )}
              </div>

              {/* Expanded Fine-tuning controls when region is selected */}
              {isSelected && assignment && (
                <div className="mt-3 pt-3 border-t border-[#E2D9CE] space-y-2.5 bg-[#F8F5F0] -mx-3.5 -mb-3.5 p-3 rounded-b-xl">
                  {/* Pattern Scale Slider */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-[#A0A4B2] mb-1">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Maximize className="w-3 h-3 text-[#C49A1E]" />
                        Pattern Repeat Scale
                      </span>
                      <span className="font-mono font-semibold text-[#C49A1E]">
                        {assignment.scale.toFixed(1)}x
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="2.5"
                      step="0.1"
                      value={assignment.scale}
                      onChange={(e) =>
                        onUpdateAssignmentControls(region.id, {
                          scale: parseFloat(e.target.value),
                        })
                      }
                      className="w-full accent-[#D4AF37] cursor-pointer h-1.5 bg-[#E2D9CE] rounded-lg"
                    />
                  </div>

                  {/* Pattern Rotation Slider */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-[#A0A4B2] mb-1">
                      <span className="flex items-center gap-1.5 font-medium">
                        <RotateCw className="w-3 h-3 text-[#C49A1E]" />
                        Weave / Stripe Rotation
                      </span>
                      <span className="font-mono font-semibold text-[#C49A1E]">
                        {assignment.rotation}°
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="180"
                      step="15"
                      value={assignment.rotation}
                      onChange={(e) =>
                        onUpdateAssignmentControls(region.id, {
                          rotation: parseInt(e.target.value, 10),
                        })
                      }
                      className="w-full accent-[#D4AF37] cursor-pointer h-1.5 bg-[#E2D9CE] rounded-lg"
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Material Curation Dock at bottom of panel */}
      <div className="p-3.5 sm:p-4 border-t border-[#E2D9CE] bg-[#F0EBE4]">
        {/* Material Mode Tabs */}
        <div className="flex items-center gap-1 bg-black/50 p-1 rounded-xl border border-[#E2D9CE] mb-3">
          <button
            type="button"
            onClick={() => setMaterialTab('swatches')}
            className={`tactile-press flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
              materialTab === 'swatches'
                ? 'bg-[#D4AF37] text-white shadow-xs'
                : 'text-[#6B5F54] hover:text-[#1A1714] hover:bg-white'
            }`}
          >
            <Palette className="w-3 h-3" />
            <span>Swatches</span>
          </button>
          <button
            type="button"
            onClick={() => setMaterialTab('palette')}
            className={`tactile-press flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
              materialTab === 'palette'
                ? 'bg-[#D4AF37] text-white shadow-xs'
                : 'text-[#6B5F54] hover:text-[#1A1714] hover:bg-white'
            }`}
          >
            <Paintbrush className="w-3 h-3" />
            <span>Colors</span>
          </button>
          <button
            type="button"
            onClick={() => setMaterialTab('tailoring')}
            className={`tactile-press flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
              materialTab === 'tailoring'
                ? 'bg-[#D4AF37] text-white shadow-xs'
                : 'text-[#6B5F54] hover:text-[#1A1714] hover:bg-white'
            }`}
          >
            <SlidersHorizontal className="w-3 h-3" />
            <span>Tailor</span>
          </button>
        </div>

        {/* Tab 1: Physical Swatches */}
        {materialTab === 'swatches' && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-[#6B5F54] uppercase tracking-wider font-mono">
                {activeRegion?.display_name || `Zone ${activeRegion?.order}`} Swatches
              </span>
              <button
                type="button"
                onClick={onOpenFabricLibrary}
                className="text-[11px] text-[#C49A1E] hover:text-[#C49A1E] font-medium cursor-pointer underline underline-offset-2 tactile-press"
              >
                All Fabrics ({fabrics.length}) →
              </button>
            </div>

            {/* 6 Quick Swatch Circles */}
            <div className="grid grid-cols-6 gap-2">
              {fabrics.slice(0, 6).map((fab) => {
                const isAssigned = activeAssignment?.fabric_id === fab.id;
                return (
                  <button
                    key={fab.id}
                    type="button"
                    onClick={() => onAssignFabric(activeRegion.id, fab.id)}
                    title={`${fab.name} (${fab.category})`}
                    className={`tactile-press w-10 h-10 rounded-lg overflow-hidden border transition-all cursor-pointer relative better-img-outline ${
                      isAssigned
                        ? 'border-[#D4AF37] ring-2 ring-[#D4AF37]/50 shadow-md scale-105'
                        : 'border-[#C9BFB4] hover:border-[#C49A1E]/60'
                    }`}
                  >
                    <img
                      src={fab.image_url}
                      alt={fab.name}
                      className="w-full h-full object-cover"
                    />
                    {isAssigned && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 text-[#C49A1E] stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Curated Luxury Palette */}
        {materialTab === 'palette' && (
          <LuxuryColorPalette
            activeRegion={activeRegion}
            currentColorHex={activeFabric?.color_hex}
            onSelectColor={handleSelectColor}
          />
        )}

        {/* Tab 3: Tailoring scale and rotation */}
        {materialTab === 'tailoring' && activeAssignment && (
          <div className="space-y-3 bg-white p-3 rounded-xl border border-[#E2D9CE]">
            <div>
              <div className="flex items-center justify-between text-[11px] text-[#1A1714] mb-1">
                <span className="flex items-center gap-1.5 font-medium">
                  <Maximize className="w-3 h-3 text-[#C49A1E]" />
                  Weave Repeat Scale
                </span>
                <span className="font-mono font-semibold text-[#C49A1E]">
                  {activeAssignment.scale.toFixed(1)}x
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.5"
                step="0.1"
                value={activeAssignment.scale}
                onChange={(e) =>
                  onUpdateAssignmentControls(activeRegion.id, {
                    scale: parseFloat(e.target.value),
                  })
                }
                className="w-full accent-[#D4AF37] cursor-pointer h-1.5 bg-[#EDE7DF] rounded-lg"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-[11px] text-[#1A1714] mb-1">
                <span className="flex items-center gap-1.5 font-medium">
                  <RotateCw className="w-3 h-3 text-[#C49A1E]" />
                  Stripe / Texture Angle
                </span>
                <span className="font-mono font-semibold text-[#C49A1E]">
                  {activeAssignment.rotation}°
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="180"
                step="15"
                value={activeAssignment.rotation}
                onChange={(e) =>
                  onUpdateAssignmentControls(activeRegion.id, {
                    rotation: parseInt(e.target.value, 10),
                  })
                }
                className="w-full accent-[#D4AF37] cursor-pointer h-1.5 bg-[#EDE7DF] rounded-lg"
              />
            </div>
          </div>
        )}

        {/* Big Generate AI Button */}
        <button
          id="btn-redesign-with-ai"
          onClick={onTriggerAiGeneration}
          disabled={isGeneratingAi}
          className="tactile-press w-full mt-3 py-2.5 px-4 bg-gradient-to-r from-[#F5DE8B] via-[#D4AF37] to-[#8C7322] hover:brightness-110 text-white font-bold text-xs rounded-xl shadow-lg border border-[#F5DE8B]/40 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
        >
          <Sparkles className="w-3.5 h-3.5 text-white animate-pulse" />
          <span>{isGeneratingAi ? 'Synthesizing Drapery Redesign...' : 'Synthesize Drapery with AI'}</span>
        </button>
      </div>
    </aside>
  );
};
