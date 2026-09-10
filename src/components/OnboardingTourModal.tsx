import React, { useState } from 'react';
import { X, ArrowRight, ArrowLeft, Sparkles, Layers, Sun, FileText, CheckCircle2, Eye, Compass, ShieldCheck } from 'lucide-react';

interface OnboardingTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartDesigning: () => void;
}

export const OnboardingTourModal: React.FC<OnboardingTourModalProps> = ({
  isOpen,
  onClose,
  onStartDesigning,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(0);

  if (!isOpen) return null;

  const steps = [
    {
      badge: 'Welcome to Aatmi Atelier',
      title: 'Bridging the Gap Between Fabric Swatches & Real Drapery',
      subtitle: 'Engineered for Interior Designers, Luxury Architects, and Fabric Houses',
      icon: Sparkles,
      iconColor: 'text-amber-400',
      description:
        'Traditional digital catalogs only show flat 2D swatches or generic render mockups. Aatmi was engineered to let designers and luxury homeowners see their exact chosen fabrics draped naturally with realistic weight, deep pinch pleats, fabric sheen, and true room lighting.',
      points: [
        'Multi-zone curtain stencils with 100% surface tracking (0 missing gaps)',
        'Natural continuous columnar pleat shading under gravity',
        'Photographic interior room context with dynamic daylight and golden hour simulation',
      ],
      actionLabel: 'Explore Workflow',
    },
    {
      badge: 'Step 1: Stencils & Silhouettes',
      title: 'Choose or Upload Any Curtain Silhouette',
      subtitle: 'From Timeless Pinch Pleats to Color-Block & Bordered Stencils',
      icon: Layers,
      iconColor: 'text-indigo-400',
      description:
        'Select from curated architectural drapery templates or upload your own real showroom photograph. Each design is automatically segmented into crisp, assignable fabric zones: main panels, horizontal borders, vertical trims, pleated headers, and bottom hems.',
      points: [
        '6 pre-mapped high-end drapery archetypes with millimeter precision',
        'Upload custom curtain photos: instant AI segmentation into fabric zones',
        'Seamless zero-gap alignment between adjacent fabric zones',
      ],
      actionLabel: 'Next: Tactile Fabrics',
    },
    {
      badge: 'Step 2: Tactile Fabric Library',
      title: 'Assign Custom Weaves, Velvets, Damasks & Silks',
      subtitle: '13 Uploaded Haute Couture Samples & Rich Procedural Textures',
      icon: Eye,
      iconColor: 'text-emerald-400',
      description:
        'Click on any drapery zone to drape it in your preferred fabric. Test contrasting borders, tone-on-tone textures, or metallic ribbons. Use the Tactile Weave Loupe to inspect the micro-texture, yarn slub, and light reflection up close.',
      points: [
        'Instant live preview with authentic fabric textures and weave scale',
        'Custom fabric upload with automatic tileable texture extraction',
        'Extreme macro loupe for inspecting Martindale rating, weight, and sheen',
      ],
      actionLabel: 'Next: Room Lighting',
    },
    {
      badge: 'Step 3: Real Room Lighting Simulator',
      title: 'Simulate Daylight, Sunset & Evening Ambiance',
      subtitle: 'How Will Your Fabric Look at 10 AM Sun vs. 9 PM Chandelier?',
      icon: Sun,
      iconColor: 'text-amber-400',
      description:
        'Lighting is everything in luxury interior design. Curtains never exist in a sterile vacuum. Toggle between crisp 5,500K morning window sunlight, warm 3,200K golden hour sunset rays, and cozy 2,700K evening architectural downlights.',
      points: [
        'Dynamic highlights and shadows across deep columnar folds',
        'Architectural interior settings: Parisian Boiserie, Penthouse, and Milanese Salon',
        'Compare mode: interactive Before/After split slider for client presentations',
      ],
      actionLabel: 'Next: Client Spec Sheet',
    },
    {
      badge: 'Step 4: Client Presentation & Specs',
      title: '1-Click Interior Designer Spec Sheet & Quotation',
      subtitle: 'Ready to Present in Client Design Meetings & Workrooms',
      icon: FileText,
      iconColor: 'text-blue-400',
      description:
        'Turn your design into a client-ready technical specification package with one click. Generates exact fabric yardage estimates, fullness calculations, fabric SKU codes, care instructions, and high-resolution presentation boards.',
      points: [
        'Calculates yardage based on 2.0x to 3.0x drapery fullness',
        'Itemized zone-by-zone fabric specifications for the drapery workroom',
        'Download high-res architectural renders and printable PDF spec sheets',
      ],
      actionLabel: 'Start Designing Now',
    },
  ];

  const current = steps[currentStep];
  const StepIcon = current.icon;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      onStartDesigning();
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/75 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-stone-900 border border-stone-800 text-stone-100 rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-800 flex items-center justify-between bg-stone-950">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 font-semibold">
              Tour · {currentStep + 1} of {steps.length}
            </span>
            <span className="text-xs text-stone-400">Designer & Brand Guide</span>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-200 p-1.5 rounded-lg hover:bg-stone-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-stone-800 border border-stone-700 flex items-center justify-center shrink-0 shadow-md">
              <StepIcon className={`w-6 h-6 ${current.iconColor}`} />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-300">
                {current.badge}
              </span>
              <h3 className="font-serif text-xl sm:text-2xl font-semibold text-stone-100 mt-1 leading-snug">
                {current.title}
              </h3>
              <p className="text-xs text-stone-400 font-sans mt-0.5">
                {current.subtitle}
              </p>
            </div>
          </div>

          <p className="text-stone-300 text-sm leading-relaxed bg-stone-850 p-4 rounded-xl border border-stone-800">
            {current.description}
          </p>

          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block">
              Key Capabilities:
            </span>
            {current.points.map((pt, idx) => (
              <div key={idx} className="flex items-center gap-2.5 text-xs text-stone-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{pt}</span>
              </div>
            ))}
          </div>

          {/* Step Progress Indicators */}
          <div className="flex items-center justify-center gap-2 pt-2">
            {steps.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrentStep(i)}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  i === currentStep ? 'w-8 bg-amber-400' : 'w-2 bg-stone-700 hover:bg-stone-600'
                }`}
                title={`Jump to step ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="px-6 py-4 bg-stone-950 border-t border-stone-800 flex items-center justify-between">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="flex items-center gap-1.5 text-xs text-stone-400 hover:text-stone-200 disabled:opacity-30 disabled:cursor-not-allowed px-3 py-2 rounded-lg transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onStartDesigning();
                onClose();
              }}
              className="text-xs text-stone-400 hover:text-stone-300 px-3 py-2 cursor-pointer transition hidden sm:inline"
            >
              Skip Tour
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-bold text-xs px-4 py-2.5 rounded-lg shadow-md transition cursor-pointer"
            >
              <span>{current.actionLabel}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
