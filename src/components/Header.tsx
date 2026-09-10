import React from 'react';
import { CurtainTemplate } from '../types/curtain';
import { Sparkles, PlusCircle, FileText, Download, Layers, Eye } from 'lucide-react';

interface HeaderProps {
  templates: CurtainTemplate[];
  selectedTemplate: CurtainTemplate;
  onSelectTemplate: (template: CurtainTemplate) => void;
  onOpenNewTemplateModal: () => void;
  onOpenSpecModal: () => void;
  onOpenFabricLibrary: () => void;
  onExportMockup: () => void;
  hasGeneratedResult: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  templates,
  selectedTemplate,
  onSelectTemplate,
  onOpenNewTemplateModal,
  onOpenSpecModal,
  onOpenFabricLibrary,
  onExportMockup,
  hasGeneratedResult,
}) => {
  return (
    <header className="bg-[#1C1E21] text-stone-100 border-b border-stone-800 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Brand Identity */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#D4AF37] via-[#B89025] to-[#8C6B10] flex items-center justify-center shadow-md">
                <span className="font-serif font-bold text-lg text-stone-950">A</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-serif text-xl tracking-wider font-semibold text-stone-100">
                    AATMI
                  </span>
                  <span className="text-[10px] font-sans font-semibold tracking-widest px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                    Couture Drapery AI
                  </span>
                </div>
                <p className="text-[11px] text-stone-400 font-sans tracking-wide">
                  Template-Based Multi-Region Fabric Redesign
                </p>
              </div>
            </div>

            {/* Template Selector dropdown */}
            <div className="hidden md:flex items-center gap-2 pl-4 border-l border-stone-700/60">
              <span className="text-xs text-stone-400 font-medium">Design / Stencil:</span>
              <select
                id="template-select"
                value={selectedTemplate.id}
                onChange={(e) => {
                  const t = templates.find((tpl) => tpl.id === e.target.value);
                  if (t) onSelectTemplate(t);
                }}
                className="bg-stone-900 text-stone-200 border border-stone-700 rounded-md text-xs py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-amber-400/80 cursor-pointer font-medium max-w-[280px]"
              >
                {templates.map((tpl) => (
                  <option key={tpl.id} value={tpl.id}>
                    {tpl.stencil_preset ? `📐 Stencil: ${tpl.name}` : `📷 Photo: ${tpl.name}`} ({tpl.regions.length} zones)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5">
            <button
              id="header-btn-upload-template"
              onClick={onOpenNewTemplateModal}
              className="flex items-center gap-1.5 text-xs bg-gradient-to-r from-amber-700/80 to-amber-600/80 hover:from-amber-600 hover:to-amber-500 text-white px-3 py-2 rounded-md border border-amber-500/40 transition font-medium cursor-pointer shadow-xs"
              title="Add a new curtain design stencil or upload a real showroom photo"
            >
              <PlusCircle className="w-3.5 h-3.5 text-amber-200" />
              <span className="hidden sm:inline">+ Add Stencil / Template</span>
            </button>

            <button
              id="header-btn-fabric-library"
              onClick={onOpenFabricLibrary}
              className="flex items-center gap-1.5 text-xs bg-stone-800 hover:bg-stone-700 text-stone-200 px-3 py-2 rounded-md border border-stone-700 transition font-medium cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              <span>Fabrics</span>
            </button>

            <button
              id="header-btn-spec-sheet"
              onClick={onOpenSpecModal}
              className="flex items-center gap-1.5 text-xs bg-stone-800 hover:bg-stone-700 text-stone-200 px-3 py-2 rounded-md border border-stone-700 transition font-medium cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Spec Sheet</span>
            </button>

            <button
              id="header-btn-export"
              onClick={onExportMockup}
              className="flex items-center gap-1.5 text-xs bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-semibold px-3.5 py-2 rounded-md shadow-sm transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-stone-950" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
