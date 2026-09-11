import React from 'react';
import {
  Layers,
  Palette,
  Sun,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Upload,
  PlusCircle,
  Download,
  CheckCircle2,
} from 'lucide-react';

export type BrandStudioStep = 'template' | 'materials' | 'ambiance' | 'generate';

interface BrandStudioStepperProps {
  currentStep: BrandStudioStep;
  onSelectStep: (step: BrandStudioStep) => void;
  onOpenNewTemplateModal: () => void;
  onOpenFabricLibrary: () => void;
  onTriggerAiGeneration: () => void;
  isGeneratingAi: boolean;
  hasGeneratedResult: boolean;
  onExportMockup: () => void;
  assignedRegionsCount: number;
  totalRegionsCount: number;
}

interface StepConfig {
  id: BrandStudioStep;
  number: number;
  label: string;
  tagline: string;
  icon: React.ElementType;
}

const STEPS: StepConfig[] = [
  {
    id: 'template',
    number: 1,
    label: 'Curtain Template',
    tagline: 'Select or Upload Design',
    icon: Layers,
  },
  {
    id: 'materials',
    number: 2,
    label: 'Fabrics & Colors',
    tagline: 'Swatches & Architectural Tones',
    icon: Palette,
  },
  {
    id: 'ambiance',
    number: 3,
    label: 'Room & Ambiance',
    tagline: 'Architectural Daylight & Setting',
    icon: Sun,
  },
  {
    id: 'generate',
    number: 4,
    label: 'AI Photorealistic Render',
    tagline: 'Sequential Inpainting & Lookbook',
    icon: Sparkles,
  },
];

export const BrandStudioStepper: React.FC<BrandStudioStepperProps> = ({
  currentStep,
  onSelectStep,
  onOpenNewTemplateModal,
  onOpenFabricLibrary,
  onTriggerAiGeneration,
  isGeneratingAi,
  hasGeneratedResult,
  onExportMockup,
  assignedRegionsCount,
  totalRegionsCount,
}) => {
  const currentStepIndex = STEPS.findIndex((s) => s.id === currentStep);

  const handleNext = () => {
    if (currentStepIndex < STEPS.length - 1) {
      onSelectStep(STEPS[currentStepIndex + 1].id);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      onSelectStep(STEPS[currentStepIndex - 1].id);
    }
  };

  return (
    <div className="w-full px-3 sm:px-6 py-2.5 bg-[#F0EBE4]/95 border-b border-[#E2D9CE] sticky top-16 sm:top-18 z-20 backdrop-blur-xl shadow-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Step Navigation Tabs */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = idx < currentStepIndex;

            return (
              <button
                key={step.id}
                type="button"
                onClick={() => onSelectStep(step.id)}
                className={`tactile-press flex items-center gap-2 px-2.5 sm:px-3.5 py-1.5 rounded-xl border transition-all cursor-pointer shrink-0 text-left ${
                  isActive
                    ? 'bg-white border-2 border-[#C49A1E] ring-2 ring-[#C49A1E]/15 shadow-sm'
                    : isCompleted
                    ? 'bg-[#FAF7F2] border-[#C9BFB4] hover:bg-white text-[#1A1714]'
                    : 'bg-white/50 border-[#E2D9CE] hover:bg-white hover:border-[#C9BFB4] text-[#6B5F54] hover:text-[#1A1714]'
                }`}
              >
                {/* Step number badge / icon */}
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-mono shrink-0 transition ${
                    isActive
                      ? 'bg-gradient-to-br from-[#F5DE8B] to-[#C49A1E] text-stone-950 font-bold shadow-xs'
                      : isCompleted
                      ? 'bg-[#FFF8E6] text-[#C49A1E] border border-[#C49A1E]/40'
                      : 'bg-[#E8E2DA] text-[#6B5F54] border border-[#C9BFB4]'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#C49A1E]" />
                  ) : (
                    <Icon className="w-3.5 h-3.5" />
                  )}
                </div>

                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono uppercase text-[#C49A1E] font-bold tracking-wider">
                      Step 0{step.number}
                    </span>
                    {step.id === 'materials' && totalRegionsCount > 0 && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#E8E2DA] text-[#1A1714] font-mono font-medium">
                        {assignedRegionsCount}/{totalRegionsCount}
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-xs font-serif tracking-tight whitespace-nowrap ${
                      isActive ? 'text-[#1A1714] font-bold' : 'text-[#6B5F54] font-medium'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Step Contextual Quick Action Tray */}
        <div className="flex items-center justify-between md:justify-end gap-2 shrink-0 border-t md:border-t-0 pt-2 md:pt-0 border-[#E2D9CE]">
          {/* Step 1 Quick Action */}
          {currentStep === 'template' && (
            <button
              type="button"
              onClick={onOpenNewTemplateModal}
              className="tactile-press flex items-center gap-1.5 pl-2.5 pr-3.5 py-1.5 rounded-xl border border-[#C49A1E]/40 bg-white text-[#C49A1E] hover:bg-[#FFFDF8] hover:border-[#C49A1E] text-xs font-semibold shadow-xs cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5 text-[#C49A1E]" />
              <span>+ Add Brand Design</span>
            </button>
          )}

          {/* Step 2 Quick Action */}
          {currentStep === 'materials' && (
            <button
              type="button"
              onClick={onOpenFabricLibrary}
              className="tactile-press flex items-center gap-1.5 pl-2.5 pr-3.5 py-1.5 rounded-xl border border-[#C49A1E]/40 bg-white text-[#C49A1E] hover:bg-[#FFFDF8] hover:border-[#C49A1E] text-xs font-semibold shadow-xs cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-[#C49A1E]" />
              <span>+ Upload Brand Fabric</span>
            </button>
          )}

          {/* Step 4 Quick Action */}
          {currentStep === 'generate' && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onTriggerAiGeneration}
                disabled={isGeneratingAi}
                className="tactile-press flex items-center gap-1.5 pl-3.5 pr-4 py-1.5 rounded-xl bg-gradient-to-r from-[#C49A1E] via-[#D4AF37] to-[#B89025] hover:brightness-105 text-white text-xs font-bold shadow-md disabled:opacity-50 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-white animate-pulse" />
                <span>{isGeneratingAi ? 'Synthesizing...' : 'Run Photorealistic AI'}</span>
              </button>
              {hasGeneratedResult && (
                <button
                  type="button"
                  onClick={onExportMockup}
                  className="tactile-press flex items-center gap-1.5 pl-2.5 pr-3 py-1.5 rounded-xl border border-[#C9BFB4] bg-white hover:bg-[#F8F5F0] text-[#1A1714] text-xs font-medium cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5 text-[#C49A1E]" />
                  <span>Download</span>
                </button>
              )}
            </div>
          )}

          {/* Stepper Navigation: Back / Next buttons */}
          <div className="flex items-center gap-1 bg-white p-0.5 rounded-xl border border-[#C9BFB4] shadow-xs">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentStepIndex === 0}
              className="tactile-press p-1.5 rounded-lg text-[#6B5F54] hover:text-[#1A1714] disabled:opacity-30 disabled:pointer-events-none hover:bg-[#EDE7DF] transition cursor-pointer"
              title="Previous Step"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-[11px] font-mono text-[#6B5F54] px-1.5 font-semibold">
              {currentStepIndex + 1}/{STEPS.length}
            </span>
            <button
              type="button"
              onClick={handleNext}
              disabled={currentStepIndex === STEPS.length - 1}
              className="tactile-press p-1.5 rounded-lg text-[#6B5F54] hover:text-[#1A1714] disabled:opacity-30 disabled:pointer-events-none hover:bg-[#EDE7DF] transition cursor-pointer"
              title="Next Step"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
