import React, { useState } from 'react';
import { CurtainTemplate, Fabric, FabricAssignment } from '../types/curtain';
import {
  Sparkles,
  Download,
  FileText,
  ArrowLeft,
  CheckCircle2,
  Share2,
  Camera,
  Layers,
  Sliders,
  ExternalLink,
} from 'lucide-react';

interface RenderLookbookPageProps {
  template: CurtainTemplate;
  assignments: FabricAssignment[];
  fabrics: Fabric[];
  aiGeneratedImageUrl: string | null;
  isGeneratingAi: boolean;
  onTriggerAiGeneration: () => void;
  onExportMockup: () => void;
  onOpenSpecModal: () => void;
  onBackToCustomizer: () => void;
}

export const RenderLookbookPage: React.FC<RenderLookbookPageProps> = ({
  template,
  assignments,
  fabrics,
  aiGeneratedImageUrl,
  isGeneratingAi,
  onTriggerAiGeneration,
  onExportMockup,
  onOpenSpecModal,
  onBackToCustomizer,
}) => {
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const [isDraggingSlider, setIsDraggingSlider] = useState<boolean>(false);

  const fabricMap = new Map<string, Fabric>();
  fabrics.forEach((f) => fabricMap.set(f.id, f));

  const originalUrl = template.real_photo_url || template.original_image_url;
  const resultUrl = aiGeneratedImageUrl || originalUrl;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingSlider) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    setSliderPosition((x / rect.width) * 100);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDraggingSlider) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const touch = e.touches[0];
    const x = Math.max(0, Math.min(touch.clientX - rect.left, rect.width));
    setSliderPosition((x / rect.width) * 100);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-y-auto bg-[#F8F6F0] text-[#1A1714]">
      {/* Header Banner */}
      <div className="border-b border-[#E8E2D8] bg-[#FAF8F3] px-4 sm:px-8 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#C49A1E] bg-[#FFF8E6] px-2.5 py-0.5 rounded-full border border-[#C49A1E]/30">
                Step 04 · Photorealistic AI Synthesis
              </span>
              <span className="text-xs text-[#9E9088] font-mono">
                {template.style_code}
              </span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#1A1714]">
              Lookbook &amp; Production Export
            </h1>
            <p className="text-xs sm:text-sm text-[#6B5F54] mt-1">
              Photorealistic AI synthesis with drape light physics, micro-weave displacement, and complete architectural cut sheet.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onBackToCustomizer}
              className="tactile-press px-4 py-2 rounded-xl border border-[#D4C9BC] bg-white hover:bg-[#FAF8F3] text-xs font-semibold text-[#1A1714] flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Customizer</span>
            </button>
            <button
              type="button"
              onClick={onTriggerAiGeneration}
              disabled={isGeneratingAi}
              className="tactile-press px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#F5DE8B] via-[#D4AF37] to-[#8C7322] hover:brightness-105 text-[#0A0B0E] font-bold text-xs shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50 border border-[#F5DE8B]/40"
            >
              <Sparkles className="w-4 h-4 text-[#0A0B0E] animate-pulse" />
              <span>{isGeneratingAi ? 'Synthesizing with AI...' : 'Re-Synthesize Render'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Body */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-8 py-8 space-y-8">
        
        {/* Top: Large Split-Screen Comparison Viewport */}
        <div className="bg-white rounded-3xl border border-[#E5DDD0] p-4 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-serif text-lg font-bold text-[#1A1714]">
                Interactive Split Comparison
              </h2>
              <p className="text-xs text-[#6B5F54]">
                Drag the slider to compare the authentic showroom silhouette against your AI-synthesized custom drapery.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-[#FAF8F3] border border-[#E8E2D8] text-[#6B5F54]">
                Slider: {Math.round(sliderPosition)}%
              </span>
            </div>
          </div>

          {/* Interactive Split Viewer */}
          <div
            onMouseMove={handleMouseMove}
            onMouseUp={() => setIsDraggingSlider(false)}
            onTouchMove={handleTouchMove}
            onTouchEnd={() => setIsDraggingSlider(false)}
            className="relative w-full max-w-4xl mx-auto aspect-4/3 sm:aspect-16/10 rounded-2xl overflow-hidden border border-[#E5DDD0] shadow-md bg-[#EDE7DF] select-none cursor-ew-resize"
          >
            {/* Background Layer: Synthesized Redesign */}
            <img
              src={resultUrl}
              alt="Synthesized Drapery"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute top-4 right-4 bg-[#FFF8E6] text-[#C49A1E] border border-[#C49A1E]/40 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-xs">
              Aatmi Synthesis
            </div>

            {/* Foreground Layer: Original Silhouette with Clip Width */}
            <div
              className="absolute inset-0 overflow-hidden border-r-2 border-white shadow-2xl"
              style={{ width: `${sliderPosition}%` }}
            >
              <img
                src={originalUrl}
                alt="Original Drapery"
                className="absolute inset-0 w-full h-full object-cover max-w-none"
                style={{ width: '100%' }}
              />
              <div className="absolute top-4 left-4 bg-white/95 text-[#1A1714] text-xs font-bold px-3 py-1 rounded-full border border-[#D4C9BC] uppercase tracking-wider shadow-xs">
                Original Showroom
              </div>
            </div>

            {/* Slider Handle */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize pointer-events-auto touch-none"
              style={{ left: `${sliderPosition}%` }}
              onMouseDown={() => setIsDraggingSlider(true)}
              onTouchStart={() => setIsDraggingSlider(true)}
            >
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-white text-[#1A1714] shadow-xl border border-[#C9BFB4] flex items-center justify-center text-xs font-bold select-none cursor-ew-resize hover:scale-110 active:scale-95 transition-transform">
                ↔
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Fabric Cut Docket & Export Options */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left 2 Cols: Architectural Specification Table */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-[#E5DDD0] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-serif text-base font-bold text-[#1A1714]">
                  Bespoke Zone Assignment Docket
                </h3>
                <p className="text-xs text-[#6B5F54]">
                  Textile specifications assigned to each architectural zone of {template.name}.
                </p>
              </div>
              <button
                type="button"
                onClick={onOpenSpecModal}
                className="text-xs text-[#C49A1E] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Full Spec Sheet →</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E8E2D8] text-[#9E9088] font-mono uppercase text-[10px]">
                    <th className="pb-2.5 font-semibold">Zone</th>
                    <th className="pb-2.5 font-semibold">Assigned Textile</th>
                    <th className="pb-2.5 font-semibold">Weave Type</th>
                    <th className="pb-2.5 font-semibold">Scale</th>
                    <th className="pb-2.5 font-semibold">Angle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0EBE4]">
                  {template.regions.map((region) => {
                    const assignment = assignments.find((a) => a.region_id === region.id);
                    const fabric = assignment ? fabricMap.get(assignment.fabric_id) : null;

                    return (
                      <tr key={region.id} className="hover:bg-[#FAF8F3] transition">
                        <td className="py-3 pr-2">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: region.accent_color || '#C49A1E' }}
                            />
                            <span className="font-semibold text-[#1A1714]">
                              {region.display_name}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 pr-2">
                          {fabric ? (
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-md overflow-hidden border border-[#D4C9BC] shrink-0">
                                <img src={fabric.image_url} alt={fabric.name} className="w-full h-full object-cover" />
                              </div>
                              <span className="font-medium text-[#1A1714] truncate max-w-[140px]">
                                {fabric.name}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[#9E9088] italic">Default Material</span>
                          )}
                        </td>
                        <td className="py-3 pr-2 text-[#6B5F54]">
                          {fabric?.metadata?.weave || 'Standard Drapery'}
                        </td>
                        <td className="py-3 pr-2 font-mono text-[#6B5F54]">
                          {assignment?.scale ? `${assignment.scale.toFixed(1)}x` : '1.0x'}
                        </td>
                        <td className="py-3 font-mono text-[#6B5F54]">
                          {assignment?.rotation ? `${assignment.rotation}°` : '0°'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Col: Export Actions */}
          <div className="bg-white rounded-3xl border border-[#E5DDD0] p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="font-serif text-base font-bold text-[#1A1714]">
                Export &amp; Share
              </h3>
              <p className="text-xs text-[#6B5F54] mt-1">
                Produce presentation-ready lookbook artifacts for client signoff and workroom tailoring.
              </p>

              <div className="mt-6 space-y-3">
                <button
                  type="button"
                  onClick={onExportMockup}
                  className="w-full tactile-press py-3 px-4 rounded-xl bg-gradient-to-r from-[#F5DE8B] via-[#D4AF37] to-[#8C7322] hover:brightness-105 text-[#0A0B0E] font-bold text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer border border-[#F5DE8B]/40"
                >
                  <Download className="w-4 h-4 text-[#0A0B0E]" />
                  <span>Download High-Res Mockup (PNG)</span>
                </button>

                <button
                  type="button"
                  onClick={onOpenSpecModal}
                  className="w-full tactile-press py-3 px-4 rounded-xl border border-[#D4C9BC] bg-[#FAF8F3] hover:bg-[#F5F0E8] text-xs font-semibold text-[#1A1714] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-[#C49A1E]" />
                  <span>Generate Workroom PDF Spec Docket</span>
                </button>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-[#E8E2D8] text-center">
              <span className="text-[11px] text-[#9E9088] font-mono">
                Certified Aatmi Haute Drapery Platform
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
