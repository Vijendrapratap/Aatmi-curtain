import React, { useState } from 'react';
import { CurtainTemplate } from '../types/curtain';
import { PlusCircle, Check, Search, Layers, Sparkles, ArrowRight, SlidersHorizontal } from 'lucide-react';

interface TemplateGalleryPageProps {
  templates: CurtainTemplate[];
  selectedTemplate: CurtainTemplate;
  onSelectTemplate: (template: CurtainTemplate) => void;
  onProceedToCustomizer: () => void;
  onOpenNewTemplateModal: () => void;
}

export const TemplateGalleryPage: React.FC<TemplateGalleryPageProps> = ({
  templates,
  selectedTemplate,
  onSelectTemplate,
  onProceedToCustomizer,
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
    <div className="flex-1 flex flex-col min-h-0 overflow-y-auto bg-[#F8F6F0] text-[#1A1714]">
      {/* Page Hero Header */}
      <div className="border-b border-[#E8E2D8] bg-[#FAF8F3] px-4 sm:px-8 py-8 sm:py-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#C49A1E] bg-[#FFF8E6] px-2.5 py-0.5 rounded-full border border-[#C49A1E]/30">
                Step 01 · Drapery Architecture
              </span>
              <span className="text-xs text-[#9E9088] font-mono">
                {templates.length} Catalog Silhouettes
              </span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#1A1714]">
              Select Curtain Silhouette
            </h1>
            <p className="text-sm text-[#6B5F54] mt-2 leading-relaxed">
              Choose a master drapery silhouette from the showroom catalog or upload a photograph of your bespoke window treatment for automated pleat and zone segmentation.
            </p>
          </div>

          {/* Search & Category Filter Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-[#9E9088] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search silhouettes & styles..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="pl-9 pr-4 py-2 text-xs bg-white text-[#1A1714] border border-[#D4C9BC] rounded-xl focus:outline-none focus:border-[#C49A1E] focus:ring-1 focus:ring-[#C49A1E]/30 w-full sm:w-56 transition placeholder-[#9E9088] shadow-2xs"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`tactile-press px-3.5 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-[#C49A1E] text-white shadow-xs'
                      : 'bg-white text-[#6B5F54] hover:text-[#1A1714] hover:bg-[#EFEAE2] border border-[#D4C9BC]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Showcase Grid */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6 pb-24">
          
          {/* Card 1: Add Brand Silhouette CTA */}
          <div
            onClick={onOpenNewTemplateModal}
            className="tactile-press group relative rounded-2xl border-2 border-dashed border-[#C49A1E]/50 hover:border-[#C49A1E] bg-white hover:bg-[#FFFDF8] p-6 flex flex-col items-center justify-center text-center cursor-pointer min-h-[340px] transition-all duration-200 shadow-xs hover:shadow-md"
          >
            <div className="w-16 h-16 rounded-2xl bg-[#FFF8E6] group-hover:scale-105 border border-[#C49A1E]/30 flex items-center justify-center transition mb-4 shadow-2xs">
              <PlusCircle className="w-8 h-8 text-[#C49A1E]" />
            </div>
            <h3 className="font-serif text-base font-bold text-[#1A1714] group-hover:text-[#C49A1E] transition">
              + Upload Brand Design
            </h3>
            <p className="text-xs text-[#6B5F54] mt-2 max-w-[200px] leading-relaxed">
              Upload a physical showroom photograph. Our AI vision pipeline auto-segments drapery regions and pleats.
            </p>
            <span className="mt-5 text-[11px] font-mono font-bold px-3 py-1 rounded-full bg-[#FFF8E6] text-[#C49A1E] border border-[#C49A1E]/30 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Vision Inpainting</span>
            </span>
          </div>

          {/* Template Cards */}
          {filteredTemplates.map((template) => {
            const isSelected = selectedTemplate.id === template.id;

            return (
              <div
                key={template.id}
                onClick={() => onSelectTemplate(template)}
                className={`tactile-press group relative rounded-2xl border p-4 flex flex-col justify-between cursor-pointer transition-all duration-200 min-h-[340px] ${
                  isSelected
                    ? 'bg-[#FFFDF8] border-2 border-[#C49A1E] shadow-md ring-2 ring-[#C49A1E]/20'
                    : 'bg-white border-[#E5DDD0] hover:border-[#C49A1E]/60 hover:shadow-md'
                }`}
              >
                <div>
                  {/* Photo Frame with Concentric Radius */}
                  <div className="w-full aspect-[4/3] rounded-xl overflow-hidden border border-[#E5DDD0] bg-[#EFEAE2] relative mb-3.5 shadow-2xs">
                    <img
                      src={template.thumbnail_url || template.original_image_url}
                      alt={template.name}
                      className="w-full h-full object-cover better-img-outline group-hover:scale-105 transition duration-300"
                    />

                    {/* Checkmark badge */}
                    {isSelected && (
                      <div className="absolute top-2.5 right-2.5 bg-[#C49A1E] text-white rounded-full p-1.5 shadow-md">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                    )}

                    {/* Zone Badge */}
                    <span className="absolute bottom-2.5 left-2.5 text-[10px] font-mono font-semibold bg-white/95 text-[#1A1714] px-2.5 py-1 rounded-lg border border-[#D4C9BC] shadow-xs backdrop-blur-xs flex items-center gap-1.5">
                      <Layers className="w-3 h-3 text-[#C49A1E]" />
                      <span>{template.regions.length} Drape Zones</span>
                    </span>
                  </div>

                  {/* Title & Style Tag */}
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-serif text-sm sm:text-base font-bold text-[#1A1714] group-hover:text-[#C49A1E] transition leading-snug">
                      {template.name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 mt-1.5 text-xs text-[#6B5F54]">
                    <span className="font-mono text-[11px] font-medium text-[#C49A1E]">
                      {template.style_code}
                    </span>
                    <span className="text-[#D4C9BC]">•</span>
                    <span className="capitalize truncate text-[11px]">
                      {template.room_setting || 'Showroom'}
                    </span>
                  </div>

                  <p className="text-xs text-[#9E9088] mt-2 line-clamp-2 leading-relaxed">
                    {template.description || 'Master drapery silhouette with customizable textile panels, trims, and skirts.'}
                  </p>
                </div>

                {/* Card Action Footer */}
                <div className="mt-4 pt-3 border-t border-[#E8E2D8] flex items-center justify-between text-xs">
                  <span className="text-[11px] font-mono font-medium text-[#9E9088]">
                    {template.category}
                  </span>
                  <span
                    className={`font-semibold flex items-center gap-1 transition ${
                      isSelected ? 'text-[#C49A1E] font-bold' : 'text-[#6B5F54] group-hover:text-[#1A1714]'
                    }`}
                  >
                    <span>{isSelected ? 'Selected Model ✓' : 'Select Silhouette'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Bottom Sticky Bar: Instant Action on Selection */}
      <div className="sticky bottom-0 z-20 bg-white/95 backdrop-blur-xl border-t border-[#E8E2D8] p-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-12 h-12 rounded-xl overflow-hidden border border-[#D4C9BC] bg-[#EFEAE2] shrink-0">
              <img
                src={selectedTemplate.thumbnail_url || selectedTemplate.original_image_url}
                alt={selectedTemplate.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-serif font-bold text-[#1A1714]">
                  {selectedTemplate.name}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#FFF8E6] text-[#C49A1E] font-semibold border border-[#C49A1E]/30">
                  {selectedTemplate.regions.length} Customizable Zones
                </span>
              </div>
              <p className="text-[11px] text-[#6B5F54]">
                Style Code: {selectedTemplate.style_code} · Silhouette active
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onOpenNewTemplateModal}
              className="tactile-press px-4 py-2 rounded-xl border border-[#D4C9BC] bg-white hover:bg-[#FAF8F3] text-xs font-semibold text-[#1A1714] cursor-pointer shadow-2xs"
            >
              + Upload Custom Drape
            </button>
            <button
              type="button"
              onClick={onProceedToCustomizer}
              className="tactile-press px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#F5DE8B] via-[#D4AF37] to-[#8C7322] hover:brightness-105 text-[#0A0B0E] font-bold text-xs shadow-md flex items-center gap-2 cursor-pointer border border-[#F5DE8B]/40"
            >
              <span>Customize in Atelier Studio</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
