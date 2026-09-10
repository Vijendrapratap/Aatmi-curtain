import React, { useRef } from 'react';
import { CurtainTemplate, Fabric, FabricAssignment, Region } from '../types/curtain';
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
  Info
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
}) => {
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
      // We create a temporary custom fabric and assign it
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

      // Add to fabrics list & assign
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

  const activeRegion = template.regions.find((r) => r.id === activeRegionId) || template.regions[0];
  const activeAssignment = assignments.find((a) => a.region_id === activeRegion?.id);
  const activeFabric = activeAssignment ? fabricMap.get(activeAssignment.fabric_id) : null;

  return (
    <aside className="w-full lg:w-96 bg-white border-r border-stone-200/80 flex flex-col h-full shadow-xs">
      {/* Hidden file input for fast region file upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/png,image/jpeg,image/webp,image/jpg"
        className="hidden"
      />

      {/* Header section */}
      <div className="p-5 border-b border-stone-100 bg-stone-50/70">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-700" />
            <h2 className="font-serif font-semibold text-stone-900 text-sm tracking-wide">
              Fabric Zone Assignment
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {onReturnToPreview && (
              <button
                onClick={onReturnToPreview}
                className="lg:hidden text-xs bg-amber-600 hover:bg-amber-500 text-white font-semibold px-2.5 py-1 rounded shadow-xs cursor-pointer"
              >
                View Live Preview
              </button>
            )}
            <span className="text-[11px] font-semibold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-full">
              {assignments.length}/{template.regions.length}
            </span>
          </div>
        </div>
        <p className="text-xs text-stone-500 leading-relaxed">
          Select any curtain section below to assign luxury fabrics or upload your own swatch image.
        </p>
      </div>

      {/* Region Cards List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
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
                  ? 'border-amber-600 bg-amber-50/40 shadow-xs ring-1 ring-amber-600/30'
                  : 'border-stone-200 hover:border-stone-300 bg-white'
              }`}
            >
              {/* Region Label Bar */}
              <div className="flex items-start justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-2">
                  <div
                    className="w-5 h-5 rounded-full text-white text-[10px] font-bold flex items-center justify-center shadow-2xs"
                    style={{ backgroundColor: region.accent_color || '#4F46E5' }}
                  >
                    {region.order}
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-stone-900 leading-tight">
                      {region.display_name}
                    </h3>
                    <p className="text-[11px] text-stone-500 line-clamp-1">
                      {region.description}
                    </p>
                  </div>
                </div>

                {isSelected && (
                  <span className="text-[10px] uppercase font-bold tracking-wider text-amber-800 bg-amber-200/60 px-1.5 py-0.5 rounded">
                    Active
                  </span>
                )}
              </div>

              {/* Current Assigned Fabric Card */}
              <div className="flex items-center gap-3 bg-stone-50 p-2 rounded-lg border border-stone-200/80 mb-2">
                <div className="w-11 h-11 rounded-md overflow-hidden border border-stone-300 shrink-0 bg-stone-200 shadow-2xs">
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
                    <span className="text-xs font-semibold text-stone-900 truncate">
                      {currentFabric ? currentFabric.name : 'Default Fabric'}
                    </span>
                    {currentFabric?.is_custom && (
                      <span className="text-[9px] bg-indigo-100 text-indigo-700 px-1 rounded font-medium">
                        Custom
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-stone-500 truncate">
                    {currentFabric
                      ? `${currentFabric.category} • ${currentFabric.metadata.weave}`
                      : 'Original style preset'}
                  </p>
                </div>
              </div>

              {/* Quick Actions for this Region */}
              <div className="flex items-center gap-2 pt-1 border-t border-stone-100">
                <button
                  id={`btn-upload-for-region-${region.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    triggerUploadForRegion(region.id);
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 text-[11px] font-medium bg-stone-100 hover:bg-stone-200 text-stone-800 py-1.5 px-2.5 rounded-md border border-stone-200 transition cursor-pointer"
                  title="Upload a fabric photo for this specific section"
                >
                  <Upload className="w-3 h-3 text-amber-700" />
                  <span>Upload Fabric</span>
                </button>

                <button
                  id={`btn-choose-fabric-${region.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectRegion(region.id);
                    onOpenFabricLibrary();
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 text-[11px] font-medium bg-white hover:bg-stone-50 text-stone-700 py-1.5 px-2.5 rounded-md border border-stone-200 transition cursor-pointer"
                >
                  <Palette className="w-3 h-3 text-indigo-600" />
                  <span>Browse Swatches</span>
                </button>
              </div>

              {/* Expanded Fine-tuning controls when region is selected */}
              {isSelected && assignment && (
                <div className="mt-3 pt-3 border-t border-amber-200/80 space-y-2.5">
                  {/* Pattern Scale Slider */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-stone-600 mb-1">
                      <span className="flex items-center gap-1 font-medium">
                        <Maximize className="w-3 h-3 text-stone-500" />
                        Pattern Repeat Scale
                      </span>
                      <span className="font-mono font-semibold text-stone-800">
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
                      className="w-full accent-amber-700 cursor-pointer h-1.5 bg-stone-200 rounded-lg"
                    />
                  </div>

                  {/* Pattern Rotation Slider */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-stone-600 mb-1">
                      <span className="flex items-center gap-1 font-medium">
                        <RotateCw className="w-3 h-3 text-stone-500" />
                        Weave / Stripe Rotation
                      </span>
                      <span className="font-mono font-semibold text-stone-800">
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
                      className="w-full accent-amber-700 cursor-pointer h-1.5 bg-stone-200 rounded-lg"
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Quick Swatch Bar at bottom of panel */}
      <div className="p-4 border-t border-stone-200/80 bg-stone-50/50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold text-stone-700 uppercase tracking-wider">
            Quick Swatch Pick for Zone {activeRegion.order}
          </span>
          <button
            onClick={onOpenFabricLibrary}
            className="text-[11px] text-amber-800 hover:text-amber-950 font-medium cursor-pointer"
          >
            View All ({fabrics.length})
          </button>
        </div>

        {/* 6 Quick Swatch Circles */}
        <div className="grid grid-cols-6 gap-2 mb-3">
          {fabrics.slice(0, 6).map((fab) => {
            const isAssigned = activeAssignment?.fabric_id === fab.id;
            return (
              <button
                key={fab.id}
                onClick={() => onAssignFabric(activeRegion.id, fab.id)}
                title={`${fab.name} (${fab.category})`}
                className={`w-10 h-10 rounded-lg overflow-hidden border-2 transition-all cursor-pointer relative shadow-2xs ${
                  isAssigned
                    ? 'border-amber-700 scale-105 ring-2 ring-amber-500/40'
                    : 'border-stone-200 hover:border-amber-500/80 hover:scale-102'
                }`}
              >
                <img
                  src={fab.image_url}
                  alt={fab.name}
                  className="w-full h-full object-cover"
                />
                {isAssigned && (
                  <div className="absolute inset-0 bg-amber-900/40 flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Big Generate AI Button */}
        <button
          id="btn-redesign-with-ai"
          onClick={onTriggerAiGeneration}
          disabled={isGeneratingAi}
          className="w-full py-2.5 px-4 bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 hover:from-amber-950 hover:to-stone-900 text-amber-300 font-semibold text-xs rounded-lg shadow-sm border border-amber-500/30 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{isGeneratingAi ? 'Synthesizing Fabric Redesign...' : 'Generate Curtain with Choosed Fabrics'}</span>
        </button>
      </div>
    </aside>
  );
};
