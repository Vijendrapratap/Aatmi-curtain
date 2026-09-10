import React from 'react';
import { CurtainTemplate, Fabric, FabricAssignment } from '../types/curtain';
import { X, Download, Printer, CheckCircle, Sparkles, FileText } from 'lucide-react';

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
  if (!isOpen) return null;

  const fabricMap = new Map<string, Fabric>();
  fabrics.forEach((f) => fabricMap.set(f.id, f));

  // Yardage calculation heuristics based on region type
  const calculateYardage = (regionName: string) => {
    const lower = regionName.toLowerCase();
    if (lower.includes('main') || lower.includes('body') || lower.includes('drop')) {
      return { yards: '12.5 yards', meter: '11.4 m', cuts: '3 full drops (54" width)' };
    }
    if (lower.includes('band') || lower.includes('decorative')) {
      return { yards: '2.5 yards', meter: '2.3 m', cuts: '1 continuous width cut' };
    }
    if (lower.includes('hem') || lower.includes('bottom')) {
      return { yards: '3.0 yards', meter: '2.7 m', cuts: 'Weighted double-fold hem' };
    }
    if (lower.includes('valance') || lower.includes('swag')) {
      return { yards: '4.5 yards', meter: '4.1 m', cuts: 'Swag template pattern' };
    }
    if (lower.includes('border') || lower.includes('trim') || lower.includes('flank')) {
      return { yards: '3.8 yards', meter: '3.5 m', cuts: 'Leading edge border strip' };
    }
    return { yards: '2.0 yards', meter: '1.8 m', cuts: 'Custom accent cut' };
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/75 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-900 text-stone-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-stone-950 font-serif font-bold text-sm">
              A
            </div>
            <div>
              <h3 className="font-serif text-base font-bold tracking-wide">
                AATMI HAUTE COUTURE DRAPERY
              </h3>
              <p className="text-[11px] text-stone-400">
                Design Specification & Fabric Yardage Docket
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1 text-xs bg-stone-800 hover:bg-stone-700 text-stone-200 px-3 py-1.5 rounded-lg border border-stone-700 transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Spec</span>
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
        <div className="p-6 flex-1 overflow-y-auto space-y-6 bg-[#FAFAF8]" id="printable-spec-sheet">
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
                {template.metadata.pinch_style || 'Pinch Pleat'}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider block">
                Total Redesign Zones
              </span>
              <span className="text-xs font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full inline-block">
                {template.regions.length} Replaceable Zones
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
                    className="bg-white p-3.5 rounded-xl border border-stone-200/80 shadow-xs flex items-center gap-3"
                  >
                    {/* Swatch Image */}
                    <div className="w-14 h-14 rounded-lg overflow-hidden border border-stone-200 shrink-0 bg-stone-100 shadow-2xs">
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
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: region.accent_color || '#4F46E5' }}
                        />
                        <h4 className="text-xs font-bold text-stone-900 truncate">
                          {region.display_name}
                        </h4>
                      </div>
                      <p className="text-xs text-amber-900 font-semibold mt-0.5 truncate">
                        {fabric ? fabric.name : 'Default Style Spec'}
                      </p>
                      <p className="text-[11px] text-stone-500">
                        {fabric
                          ? `${fabric.category} • ${fabric.metadata.weave} • ${fabric.metadata.composition}`
                          : region.description}
                      </p>
                    </div>

                    {/* Yardage estimate */}
                    <div className="text-right shrink-0 pl-2 border-l border-stone-100">
                      <span className="text-xs font-bold text-stone-900 block font-mono">
                        {yardage.yards}
                      </span>
                      <span className="text-[10px] text-stone-500 block">
                        ({yardage.meter})
                      </span>
                      <span className="text-[9px] text-stone-400 block max-w-[110px] truncate">
                        {yardage.cuts}
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
