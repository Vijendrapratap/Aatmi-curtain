// src/components/SequentialProgressOverlay.tsx
import React from 'react';
import { Sparkles, Layers, CheckCircle2, ArrowRight, ShieldAlert, Clock } from 'lucide-react';
import { InpaintingStepEvent } from '../lib/sequential-inpainting';
import { useStudioStore } from '../lib/store';

interface SequentialProgressOverlayProps {
  progress: InpaintingStepEvent;
}

export const SequentialProgressOverlay: React.FC<SequentialProgressOverlayProps> = ({
  progress,
}) => {
  const { activeProviderId } = useStudioStore();
  const percentage = Math.round((progress.stepIndex / (progress.totalSteps || 1)) * 100);

  return (
    <div className="absolute inset-0 z-40 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#14161B] border border-[#2F323D] rounded-2xl shadow-2xl max-w-lg w-full p-6 text-[#F9F6F0] space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#252830] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
              <Layers className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h4 className="font-serif text-sm sm:text-base font-bold text-[#F9F6F0]">
                Sequential Masked Inpainting
              </h4>
              <p className="text-[11px] text-[#A0A5B2] font-mono">
                Pipeline: {activeProviderId.toUpperCase()} Multi-Zone Compositor
              </p>
            </div>
          </div>

          <span className="text-xs font-mono bg-[#D4AF37] text-[#0D0E10] font-bold px-2.5 py-1 rounded-full">
            {progress.stepIndex}/{progress.totalSteps}
          </span>
        </div>

        {/* Secret Sauce Architectural Explanation */}
        <div className="bg-[#1A1C24] border border-[#2A2E39] p-3 rounded-xl text-xs space-y-1">
          <div className="flex items-center gap-1.5 text-[#D4AF37] font-semibold text-[11px]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Sequential Zone Composition (Anti-Flat Synthesis)</span>
          </div>
          <p className="text-[11px] text-[#8E93A2] leading-relaxed">
            Processing regions individually in topological order. Each zone composites back into the base drape canvas to preserve physical fold shadows, gravity tension, and specular crests.
          </p>
        </div>

        {/* Current Active Step Card */}
        <div className="bg-[#1C1E26] border border-[#343845] p-3.5 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#8E93A2] uppercase tracking-wider font-mono text-[10px]">
              Active drapery zone
            </span>
            <span className="text-emerald-400 text-[11px] font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Inpainting In Progress
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg border border-white/20 shrink-0 shadow-sm"
              style={{ backgroundColor: progress.fabricColorHex || '#D4AF37' }}
            />
            <div className="min-w-0 flex-1">
              <h5 className="font-semibold text-sm text-[#F9F6F0] truncate">
                {progress.regionDisplayName || progress.regionName}
              </h5>
              <p className="text-xs text-[#D4AF37] truncate font-medium">
                {progress.fabricName || 'Applying custom textile'}
              </p>
            </div>
          </div>

          {/* Status Message */}
          <p className="text-[11px] text-[#A0A4B0] font-mono pt-1 truncate">
            {progress.message}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-[#8E93A2] font-mono">
            <span>Overall Studio Synthesis</span>
            <span className="text-[#D4AF37] font-bold">{percentage}%</span>
          </div>
          <div className="w-full h-2 bg-[#252833] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#B59128] via-[#D4AF37] to-[#F1DE8B] transition-all duration-300 rounded-full"
              style={{ width: `${Math.max(5, percentage)}%` }}
            />
          </div>
        </div>

        {/* Live In-Progress Composite Thumbnail */}
        {progress.currentCompositeUrl && (
          <div className="flex items-center gap-3 p-2 bg-[#121318] rounded-xl border border-[#252731]">
            <img
              src={progress.currentCompositeUrl}
              alt="Live Composite"
              className="w-12 h-14 object-cover rounded-lg border border-white/10 shrink-0"
            />
            <div className="text-xs min-w-0">
              <span className="text-[10px] text-[#8C909C] font-mono uppercase block">
                Composited Canvas Buffer
              </span>
              <span className="text-[#E0E2EB] text-[11px] font-medium block truncate">
                Layer {progress.stepIndex} baked into base drape.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
