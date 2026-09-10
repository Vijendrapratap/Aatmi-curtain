import React, { useState } from 'react';
import { CurtainTemplate, Fabric, FabricAssignment } from '../types/curtain';
import { X, Download, Printer, CheckCircle, Sparkles, FileText, Building2, User, Scissors, Calculator, Copy, Check } from 'lucide-react';

interface SpecSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: CurtainTemplate;
  assignments: FabricAssignment[];
  fabrics: Fabric[];
  currentPreviewImage: string;
}

export const SpecSheetModal: React.FC<SpecSheetModalProps> = ({
  isOpen,
  onClose,
  template,
  assignments,
  fabrics,
  currentPreviewImage,
}) => {
  const [fullnessMultiplier, setFullnessMultiplier] = useState<number>(2.5); // 2.0x, 2.5x, 3.0x
  const [clientName, setClientName] = useState<string>('The Bel-Air Residence · Master Salon');
  const [designerName, setDesignerName] = useState<string>('Elena Vance (Trade Designer ID #AT-882)');
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const fabricMap = new Map<string, Fabric>();
  fabrics.forEach((f) => fabricMap.set(f.id, f));

  // Yardage calculation heuristics based on region type and fullness multiplier
  const calculateYardage = (regionName: string) => {
    const lower = regionName.toLowerCase();
    const ratio = fullnessMultiplier / 2.5; // base benchmark is 2.5x
    if (lower.includes('main') || lower.includes('body') || lower.includes('drop')) {
      const y = (12.5 * ratio).toFixed(1);
      const m = (11.4 * ratio).toFixed(1);
      return { yards: `${y} yds`, meter: `${m} m`, baseNum: parseFloat(y), cuts: `${Math.ceil(3 * ratio)} full drops (54" width)` };
    }
    if (lower.includes('band') || lower.includes('decorative')) {
      const y = (2.5 * ratio).toFixed(1);
      const m = (2.3 * ratio).toFixed(1);
      return { yards: `${y} yds`, meter: `${m} m`, baseNum: parseFloat(y), cuts: '1 continuous width cut' };
    }
    if (lower.includes('hem') || lower.includes('bottom')) {
      const y = (3.0 * ratio).toFixed(1);
      const m = (2.7 * ratio).toFixed(1);
      return { yards: `${y} yds`, meter: `${m} m`, baseNum: parseFloat(y), cuts: 'Weighted double-fold hem' };
    }
    if (lower.includes('valance') || lower.includes('swag')) {
      const y = (4.5 * ratio).toFixed(1);
      const m = (4.1 * ratio).toFixed(1);
      return { yards: `${y} yds`, meter: `${m} m`, baseNum: parseFloat(y), cuts: 'Swag template pattern' };
    }
    if (lower.includes('border') || lower.includes('trim') || lower.includes('flank')) {
      const y = (3.8 * ratio).toFixed(1);
      const m = (3.5 * ratio).toFixed(1);
      return { yards: `${y} yds`, meter: `${m} m`, baseNum: parseFloat(y), cuts: 'Leading edge border strip' };
    }
    const y = (2.0 * ratio).toFixed(1);
    const m = (1.8 * ratio).toFixed(1);
    return { yards: `${y} yds`, meter: `${m} m`, baseNum: parseFloat(y), cuts: 'Custom accent cut' };
  };

  // Calculate total yardage
  let totalYards = 0;
  template.regions.forEach((reg) => {
    totalYards += calculateYardage(reg.name).baseNum;
  });

  const handlePrint = () => {
    window.print();
  };

  const handleCopySummary = () => {
    const summaryLines = [
      `AATMI COUTURE DRAPERY SPECIFICATION DOCKET`,
      `Project: ${clientName}`,
      `Designer: ${designerName}`,
      `Curtain Design: ${template.name} (${template.style_code})`,
      `Heading Pleat: ${template.metadata.pinch_style || 'Tailored Double Pinch Pleat'}`,
      `Fullness Multiplier: ${fullnessMultiplier}x Fullness`,
      `Total Estimated Yardage: ${totalYards.toFixed(1)} yards`,
      `---------------------------------------`,
      ...template.regions.map((reg, idx) => {
        const assignment = assignments.find((a) => a.region_id === reg.id);
        const fab = assignment ? fabricMap.get(assignment.fabric_id) : null;
        const yardage = calculateYardage(reg.name);
        return `Zone ${idx + 1} [${reg.display_name}]: ${fab ? fab.name : 'Default'} (${fab ? fab.category : ''}) - ${yardage.yards}`;
      }),
    ];

    navigator.clipboard.writeText(summaryLines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-stone-950/80 backdrop-blur-xs">
      <div className="bg-white sm:rounded-2xl shadow-2xl border-0 sm:border border-stone-200 w-full sm:max-w-4xl h-full sm:h-auto sm:max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in duration-200">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 border-b border-stone-800 flex items-center justify-between bg-stone-900 text-stone-100">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-stone-950 font-serif font-bold text-xs sm:text-sm shrink-0">
              A
            </div>
            <div className="truncate">
              <h3 className="font-serif text-sm sm:text-base font-bold tracking-wide truncate">
                AATMI SPECIFICATION
              </h3>
              <p className="text-[10px] sm:text-[11px] text-stone-400 truncate">
                Curtain Specification & Yardage Docket
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={handleCopySummary}
              className="flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 px-2.5 sm:px-3 py-1.5 rounded-lg border border-amber-500/40 transition cursor-pointer"
              title="Copy formatted specification docket to clipboard"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
              <span className="hidden xs:inline">{copied ? 'Copied!' : 'Copy Spec'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs bg-stone-800 hover:bg-stone-700 text-stone-200 px-2.5 sm:px-3 py-1.5 rounded-lg border border-stone-700 transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Print</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-200 rounded-lg hover:bg-stone-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Docket Body */}
        <div className="p-4 sm:p-6 flex-1 overflow-y-auto space-y-4 sm:space-y-6 bg-[#FAFAF8]" id="printable-spec-sheet">
          {/* Client & Designer Docket Header */}
          <div className="bg-stone-900 text-stone-100 p-3.5 sm:p-4 rounded-xl border border-stone-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-amber-400" />
                <span className="text-[10px] text-stone-400 uppercase tracking-wider font-semibold">Client Project:</span>
              </div>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="bg-stone-800/80 border border-stone-700 text-stone-100 text-xs px-2.5 py-1 rounded font-medium focus:ring-1 focus:ring-amber-400 outline-none w-full sm:w-64"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-400" />
                <span className="text-[10px] text-stone-400 uppercase tracking-wider font-semibold">Designer / Trade ID:</span>
              </div>
              <input
                type="text"
                value={designerName}
                onChange={(e) => setDesignerName(e.target.value)}
                className="bg-stone-800/80 border border-stone-700 text-stone-100 text-xs px-2.5 py-1 rounded font-medium focus:ring-1 focus:ring-amber-400 outline-none w-full sm:w-64"
              />
            </div>

            {/* Drapery Fullness Toggle */}
            <div className="space-y-1">
              <span className="text-[10px] text-stone-400 uppercase tracking-wider font-semibold block">
                Pleat Fullness Ratio:
              </span>
              <div className="flex items-center gap-1 bg-stone-800 p-1 rounded-lg border border-stone-700 overflow-x-auto scrollbar-none">
                {[
                  { ratio: 2.0, label: '2.0x Casual' },
                  { ratio: 2.5, label: '2.5x Tailored' },
                  { ratio: 3.0, label: '3.0x Opulent' },
                ].map((item) => (
                  <button
                    key={item.ratio}
                    onClick={() => setFullnessMultiplier(item.ratio)}
                    className={`text-[10px] sm:text-[11px] px-2 py-1 rounded font-medium transition cursor-pointer whitespace-nowrap ${
                      fullnessMultiplier === item.ratio
                        ? 'bg-amber-500 text-stone-950 font-bold shadow-xs'
                        : 'text-stone-300 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Top metadata grid */}
          <div className="bg-white p-5 rounded-xl border border-stone-200/80 shadow-xs grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider block">
                Design Style
              </span>
              <span className="font-serif font-bold text-stone-900 text-sm">
                {template.name}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider block">
                Style Code
              </span>
              <span className="font-mono text-xs font-semibold text-stone-800">
                {template.style_code}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider block">
                Heading Pleat Style
              </span>
              <span className="text-xs font-semibold text-stone-800">
                {template.metadata.pinch_style || 'Tailored Pinch Pleat'}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider block">
                Total Estimated Yardage
              </span>
              <span className="text-xs font-bold text-amber-900 bg-amber-100/90 border border-amber-300/60 px-2.5 py-0.5 rounded-full inline-block font-mono">
                {totalYards.toFixed(1)} yards ({fullnessMultiplier}x)
              </span>
            </div>
          </div>

          {/* Render Preview & Fabric Breakdown Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Visual Preview */}
            <div className="md:col-span-1 bg-white p-4 rounded-xl border border-stone-200 shadow-xs flex flex-col items-center">
              <span className="text-xs font-bold text-stone-800 mb-2 uppercase tracking-wide self-start">
                Drapery Rendering
              </span>
              <div className="w-full aspect-[4/5] rounded-lg overflow-hidden border border-stone-200 bg-stone-100 shadow-inner">
                {currentPreviewImage ? (
                  <img
                    src={currentPreviewImage}
                    alt="Curtain Render"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-stone-400">
                    No preview available
                  </div>
                )}
              </div>
              <p className="text-[10px] text-stone-400 mt-2 text-center">
                Aatmi AI Photorealistic Visualizer
              </p>
            </div>

            {/* Detailed Zones Table */}
            <div className="md:col-span-2 space-y-3">
              <span className="text-xs font-bold text-stone-800 uppercase tracking-wide block">
                Fabric Yardage & Swatch Breakdown
              </span>

              {template.regions.map((region) => {
                const assignment = assignments.find((a) => a.region_id === region.id);
                const fabric = assignment ? fabricMap.get(assignment.fabric_id) : null;
                const yardage = calculateYardage(region.name);

                return (
                  <div
                    key={region.id}
                    className="bg-white p-2.5 sm:p-3.5 rounded-xl border border-stone-200/80 shadow-xs flex items-center gap-2.5 sm:gap-3"
                  >
                    {/* Swatch Image */}
                    <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-lg overflow-hidden border border-stone-200 shrink-0 bg-stone-100 shadow-2xs">
                      {fabric ? (
                        <img
                          src={fabric.image_url}
                          alt={fabric.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div
                          className="w-full h-full"
                          style={{ backgroundColor: region.default_color || '#DDD6C7' }}
                        />
                      )}
                    </div>

                    {/* Description */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: region.accent_color || '#4F46E5' }}
                        />
                        <h4 className="text-xs font-bold text-stone-900 truncate">
                          {region.display_name}
                        </h4>
                      </div>
                      <p className="text-[11px] sm:text-xs text-amber-900 font-semibold mt-0.5 truncate">
                        {fabric ? fabric.name : 'Default Style Spec'}
                      </p>
                      <p className="text-[10px] sm:text-[11px] text-stone-500 truncate">
                        {fabric
                          ? `${fabric.category} • ${fabric.metadata.weave}`
                          : region.description}
                      </p>
                    </div>

                    {/* Yardage estimate */}
                    <div className="text-right shrink-0 pl-2 border-l border-stone-100">
                      <span className="text-[11px] sm:text-xs font-bold text-stone-900 block font-mono">
                        {yardage.yards}
                      </span>
                      <span className="text-[9px] sm:text-[10px] text-stone-500 block">
                        ({yardage.meter})
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Fabrication Notes */}
          <div className="bg-amber-50/50 border border-amber-200/70 p-4 rounded-xl text-xs text-amber-950 space-y-1">
            <span className="font-semibold block text-amber-900">
              Couture Workroom Fabrication Notes:
            </span>
            <p className="text-[11px] text-amber-900/80 leading-relaxed">
              • All vertical and horizontal seams are blind-hemmed and interlined with 240g thermal bump cotton for crisp drape memory.
              • Weighted lead weights inserted into lower hem corners for straight floor drop.
              • Fabric pattern repeats calibrated for bilateral symmetry across pair drapes.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-stone-200 bg-stone-50 flex items-center justify-between text-xs text-stone-500">
          <span>Aatmi Luxury Drapery Specification • Ready for Workroom Production</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold bg-stone-900 hover:bg-stone-800 text-stone-100 rounded-lg cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
