import React, { useState } from 'react';
import { CurtainTemplate } from '../types/curtain';
import { PlusCircle, Check, Search, Layers, Sparkles } from 'lucide-react';

interface TemplateCardDrawerProps {
  templates: CurtainTemplate[];
  selectedTemplate: CurtainTemplate;
  onSelectTemplate: (template: CurtainTemplate) => void;
  onOpenNewTemplateModal: () => void;
}

export const TemplateCardDrawer: React.FC<TemplateCardDrawerProps> = ({
  templates,
  selectedTemplate,
  onSelectTemplate,
  onOpenNewTemplateModal,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchFilter, setSearchFilter] = useState<string>('');

  const categories = ['All', 'Luxury Drapes', 'Heritage Drapes', 'Modern Drapes', 'Bespoke'];

  const filteredTemplates = templates.filter((tpl) => {
    const matchesCategory =
      selectedCategory === 'All'
        ? true
        : selectedCategory === 'Bespoke'
        ? tpl.id.startsWith('tpl-custom-')
        : (tpl.category || '').toLowerCase().includes(selectedCategory.toLowerCase());

    const matchesSearch =
      tpl.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      tpl.style_code.toLowerCase().includes(searchFilter.toLowerCase()) ||
      (tpl.room_setting || '').toLowerCase().includes(searchFilter.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="w-full bg-[#F8F5F0] border-b border-[#E2D9CE] p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="max-w-7xl mx-auto flex flex-col gap-4">
        {/* Drawer Header & Self-Explanatory Guidance */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-[#C49A1E] animate-pulse" />
              <h3 className="font-serif text-base sm:text-lg font-bold text-[#1A1714] tracking-tight flex items-center gap-2">
                <span>Step 1: Select or Upload Brand Curtain Silhouette</span>
              </h3>
              <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-[#FFF8E6] text-[#C49A1E] border border-[#C49A1E]/30 font-semibold">
                {templates.length} Models
              </span>
            </div>
            <p className="text-xs text-[#6B5F54] mt-0.5">
              Pick an architectural showroom plate below, or upload your brand’s bespoke drape photo for automatic pleat and zone segmentation.
            </p>
          </div>

          {/* Search & Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Quick Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#9E9088] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search silhouettes..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="pl-8 pr-3 py-1 text-xs bg-white text-[#1A1714] border border-[#C9BFB4] rounded-full focus:outline-none focus:border-[#C49A1E] focus:ring-1 focus:ring-[#C49A1E]/40 w-36 sm:w-44 transition placeholder-[#9E9088]"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`tactile-press px-3 py-1 rounded-full text-xs font-semibold transition whitespace-nowrap cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-[#C49A1E] text-white shadow-xs'
                      : 'bg-white text-[#6B5F54] hover:text-[#1A1714] hover:bg-[#EDE7DF] border border-[#C9BFB4]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Card Grid / Carousel */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 overflow-y-auto max-h-[380px] p-1">
          {/* Card 1: Prominent "Add Brand Design" Action Card */}
          <div
            onClick={onOpenNewTemplateModal}
            className="tactile-press group relative rounded-2xl border-2 border-dashed border-[#C49A1E]/50 hover:border-[#C49A1E] bg-white hover:bg-[#FFFDF8] p-4 flex flex-col items-center justify-center text-center cursor-pointer min-h-[230px] transition duration-200 shadow-xs hover:shadow-md"
          >
            <div className="w-13 h-13 rounded-2xl bg-[#FFF8E6] group-hover:scale-105 border border-[#C49A1E]/30 flex items-center justify-center transition mb-3 shadow-xs">
              <PlusCircle className="w-6 h-6 text-[#C49A1E]" />
            </div>
            <h4 className="font-serif text-sm font-bold text-[#1A1714] group-hover:text-[#C49A1E] transition">
              + Add Brand Design
            </h4>
            <p className="text-[11px] text-[#6B5F54] mt-1.5 max-w-[145px] leading-tight">
              Upload physical photo &amp; auto-segment drapery zones
            </p>
            <span className="mt-3 text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-[#FFF8E6] text-[#C49A1E] border border-[#C49A1E]/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>AI Vision Ready</span>
            </span>
          </div>

          {/* Template Cards */}
          {filteredTemplates.map((template) => {
            const isSelected = selectedTemplate.id === template.id;

            return (
              <div
                key={template.id}
                onClick={() => onSelectTemplate(template)}
                className={`tactile-press group relative rounded-2xl border p-3 flex flex-col justify-between cursor-pointer transition-all duration-200 min-h-[230px] ${
                  isSelected
                    ? 'bg-[#FFFDF8] border-2 border-[#C49A1E] shadow-md ring-2 ring-[#C49A1E]/20'
                    : 'bg-white border-[#E2D9CE] hover:border-[#C49A1E]/60 hover:shadow-md'
                }`}
              >
                <div>
                  {/* Preview Image Frame with concentric radius */}
                  <div className="w-full aspect-[4/3] rounded-xl overflow-hidden border border-[#E2D9CE] bg-[#EDE7DF] relative mb-2.5 shadow-xs">
                    <img
                      src={template.thumbnail_url || template.original_image_url}
                      alt={template.name}
                      className="w-full h-full object-cover better-img-outline group-hover:scale-105 transition duration-300"
                    />

                    {/* Checkmark badge */}
                    {isSelected && (
                      <div className="absolute top-2 right-2 bg-[#C49A1E] text-white rounded-full p-1 shadow-md">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}

                    {/* Zone Badge */}
                    <span className="absolute bottom-2 left-2 text-[9px] font-mono font-semibold bg-white/95 text-[#1A1714] px-2 py-0.5 rounded-md border border-[#C9BFB4] shadow-xs backdrop-blur-xs flex items-center gap-1">
                      <Layers className="w-2.5 h-2.5 text-[#C49A1E]" />
                      <span>{template.regions.length} Zones</span>
                    </span>
                  </div>

                  {/* Title & Style Code */}
                  <h4 className="font-serif text-xs sm:text-sm font-bold text-[#1A1714] group-hover:text-[#C49A1E] transition line-clamp-1">
                    {template.name}
                  </h4>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10px] font-mono text-[#6B5F54] font-medium">
                      {template.style_code}
                    </span>
                    <span className="text-[#C9BFB4]">•</span>
                    <span className="text-[10px] text-[#6B5F54] capitalize truncate">
                      {template.room_setting || 'Showroom'}
                    </span>
                  </div>
                </div>

                {/* Bottom Card Footer */}
                <div className="mt-2.5 pt-2 border-t border-[#E2D9CE] flex items-center justify-between text-[11px]">
                  <span className="text-[#9E9088] text-[10px] font-medium truncate max-w-[95px]">
                    {template.category}
                  </span>
                  <span
                    className={`font-semibold text-xs transition ${
                      isSelected ? 'text-[#C49A1E]' : 'text-[#6B5F54] group-hover:text-[#1A1714]'
                    }`}
                  >
                    {isSelected ? 'Active Silhouette ✓' : 'Select Plate →'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

