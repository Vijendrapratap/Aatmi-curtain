// src/components/CatalogLibraryView.tsx
import React, { useState } from 'react';
import {
  Folder,
  Tag,
  Search,
  Plus,
  Sparkles,
  Filter,
  Layers,
  Upload,
  CheckCircle2,
  SlidersHorizontal,
  FolderPlus,
} from 'lucide-react';
import { useStudioStore, CatalogFolder } from '../lib/store';
import { Fabric, CurtainTemplate } from '../types/curtain';

export const CatalogLibraryView: React.FC = () => {
  const {
    fabrics,
    catalogs,
    activeCatalogId,
    setActiveCatalogId,
    activeFabricCategory,
    setActiveFabricCategory,
    fabricSearchQuery,
    setFabricSearchQuery,
    addCustomFabric,
    templates,
    selectTemplate,
    setActiveTab,
    assignFabricToRegion,
    selectedTemplateId,
  } = useStudioStore();

  const [activeTypeTab, setActiveTypeTab] = useState<'fabric' | 'template' | 'room'>('fabric');
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const categories = [
    'All',
    'Velvet',
    'Silk',
    'Linen',
    'Jacquard & Damask',
    'Textured & Bouclé',
    'Exotic Relief',
    'Luxury Sheers',
  ];

  const colorPalette = [
    { name: 'Gold / Champagne', hex: '#D4AF37' },
    { name: 'Emerald', hex: '#0D4A37' },
    { name: 'Midnight Navy', hex: '#1A2942' },
    { name: 'Burgundy / Crimson', hex: '#631B27' },
    { name: 'Oatmeal / Ivory', hex: '#EBE7DE' },
    { name: 'Espresso / Bronze', hex: '#3E2E23' },
    { name: 'Terracotta', hex: '#C25D23' },
  ];

  // Filter fabrics
  const filteredFabrics = fabrics.filter((fabric) => {
    const matchesCategory =
      activeFabricCategory === 'All' || fabric.category === activeFabricCategory;
    const matchesSearch =
      !fabricSearchQuery ||
      fabric.name.toLowerCase().includes(fabricSearchQuery.toLowerCase()) ||
      fabric.tags.some((t) => t.toLowerCase().includes(fabricSearchQuery.toLowerCase())) ||
      fabric.metadata.weave.toLowerCase().includes(fabricSearchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleUploadFabric = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        const newFabric: Fabric = {
          id: 'fab-custom-' + Date.now(),
          name: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
          category: 'Custom',
          image_url: base64,
          tileable: true,
          tags: ['custom', 'couture', 'uploaded', 'swatch'],
          metadata: {
            weave: 'Bespoke Atelier Weave',
            scale: 'medium',
            sheen: 'Subtle Luster',
            weight: 'Heavyweight Drapery',
            composition: 'Custom Textile',
          },
          color_hex: '#D4AF37',
          is_custom: true,
        };
        addCustomFabric(newFabric);
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden bg-[#0D0E11] text-[#F9F6F0]">
      {/* Left Sidebar: Collections & Filter Column */}
      <div className="w-full md:w-72 border-b md:border-b-0 md:border-r border-[#252832] bg-[#121318] p-4 flex flex-col justify-between overflow-y-auto">
        <div className="space-y-5">
          {/* Section Title */}
          <div className="flex items-center justify-between pb-3 border-b border-[#252832]">
            <div className="flex items-center gap-2">
              <Folder className="w-4 h-4 text-[#D4AF37]" />
              <h3 className="font-serif text-sm font-bold text-[#F9F6F0] tracking-wide">
                Catalogs & Collections
              </h3>
            </div>
          </div>

          {/* Asset Type Selector */}
          <div className="flex p-1 bg-[#1A1C23] rounded-xl border border-[#2B2E3A]">
            <button
              onClick={() => setActiveTypeTab('fabric')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
                activeTypeTab === 'fabric'
                  ? 'bg-[#D4AF37] text-[#0D0E10] shadow-sm'
                  : 'text-[#8C909C] hover:text-[#F9F6F0]'
              }`}
            >
              Fabrics ({fabrics.length})
            </button>
            <button
              onClick={() => setActiveTypeTab('template')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
                activeTypeTab === 'template'
                  ? 'bg-[#D4AF37] text-[#0D0E10] shadow-sm'
                  : 'text-[#8C909C] hover:text-[#F9F6F0]'
              }`}
            >
              Templates ({templates.length})
            </button>
          </div>

          {/* Folder List */}
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#8C909C] font-semibold block mb-1">
              Curated Folders
            </span>

            <div
              onClick={() => setActiveCatalogId(null)}
              className={`p-2.5 rounded-lg text-xs flex items-center justify-between cursor-pointer transition ${
                activeCatalogId === null
                  ? 'bg-[#1C1E26] text-[#D4AF37] font-semibold border border-[#D4AF37]/30'
                  : 'text-[#A0A4B0] hover:bg-[#181920]'
              }`}
            >
              <span>All Master Assets</span>
              <span className="text-[10px] font-mono bg-black/40 px-1.5 py-0.5 rounded">
                {fabrics.length + templates.length}
              </span>
            </div>

            {catalogs.map((cat) => (
              <div
                key={cat.id}
                onClick={() => setActiveCatalogId(cat.id)}
                className={`p-2.5 rounded-lg text-xs flex items-center justify-between cursor-pointer transition ${
                  activeCatalogId === cat.id
                    ? 'bg-[#1C1E26] text-[#D4AF37] font-semibold border border-[#D4AF37]/30'
                    : 'text-[#A0A4B0] hover:bg-[#181920]'
                }`}
              >
                <div className="truncate pr-2">
                  <span className="block truncate">{cat.name}</span>
                </div>
                <span className="text-[10px] font-mono bg-black/40 px-1.5 py-0.5 rounded shrink-0">
                  {cat.itemCount}
                </span>
              </div>
            ))}
          </div>

          {/* Color Filter Palette */}
          {activeTypeTab === 'fabric' && (
            <div className="space-y-2 pt-3 border-t border-[#252832]">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#8C909C] font-semibold block">
                Color Palette
              </span>
              <div className="flex flex-wrap gap-2">
                {colorPalette.map((col) => (
                  <button
                    key={col.hex}
                    onClick={() =>
                      setSelectedColor(selectedColor === col.hex ? null : col.hex)
                    }
                    title={col.name}
                    className={`w-6 h-6 rounded-full border transition-all cursor-pointer ${
                      selectedColor === col.hex
                        ? 'ring-2 ring-[#D4AF37] scale-110 border-white'
                        : 'border-white/20 hover:scale-105'
                    }`}
                    style={{ backgroundColor: col.hex }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Upload Swatch Card */}
          <div className="pt-3 border-t border-[#252832]">
            <label className="flex flex-col items-center justify-center p-4 border border-dashed border-[#353947] hover:border-[#D4AF37] rounded-xl bg-[#16171E] hover:bg-[#1A1C25] transition cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleUploadFabric}
                className="hidden"
              />
              <Upload className="w-5 h-5 text-[#D4AF37] mb-1" />
              <span className="text-xs font-semibold text-[#F9F6F0]">Upload Fabric Swatch</span>
              <span className="text-[10px] text-[#7A7E89] text-center mt-0.5">
                Auto VLM tagging & seamless tile parsing
              </span>
            </label>
          </div>
        </div>

        {/* Storage Info */}
        <div className="pt-4 border-t border-[#252832] text-[10px] text-[#7A7E89]">
          <span>Connected to Supabase Storage: bucket /fabrics</span>
        </div>
      </div>

      {/* Main Grid View */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Filter Bar */}
        <div className="p-4 border-b border-[#252832] bg-[#121318] flex flex-wrap items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative min-w-[240px] flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#7A7E89] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={fabricSearchQuery}
              onChange={(e) => setFabricSearchQuery(e.target.value)}
              placeholder="Search textiles by name, weave (velvet, bouclé), or tag..."
              className="w-full bg-[#171920] border border-[#2B2E3A] text-xs text-[#F9F6F0] pl-9 pr-3 py-2 rounded-lg focus:outline-none focus:border-[#D4AF37] placeholder:text-[#5E626E]"
            />
          </div>

          {/* Material Category Pills */}
          {activeTypeTab === 'fabric' && (
            <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveFabricCategory(cat)}
                  className={`text-xs px-2.5 py-1.5 rounded-lg whitespace-nowrap transition cursor-pointer ${
                    activeFabricCategory === cat
                      ? 'bg-[#D4AF37] text-[#0D0E10] font-bold shadow-sm'
                      : 'bg-[#181920] text-[#A0A4B0] hover:text-[#F9F6F0] border border-[#272A35]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Grid Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#0D0E11]">
          {activeTypeTab === 'fabric' ? (
            /* Fabric Swatches Masonry Grid */
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredFabrics.map((fabric) => (
                <div
                  key={fabric.id}
                  className="group bg-[#15161D] border border-[#272A35] hover:border-[#D4AF37] rounded-xl overflow-hidden transition-all duration-200 shadow-md hover:shadow-xl flex flex-col justify-between"
                >
                  {/* Swatch Image */}
                  <div className="relative aspect-square overflow-hidden bg-[#1D1F28]">
                    <img
                      src={fabric.image_url}
                      alt={fabric.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 right-2 flex items-center gap-1">
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-white/40 shadow-sm"
                        style={{ backgroundColor: fabric.color_hex }}
                      />
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="p-3 space-y-1.5">
                    <div className="flex items-start justify-between gap-1">
                      <h4 className="font-serif text-xs font-bold text-[#F9F6F0] truncate">
                        {fabric.name}
                      </h4>
                    </div>

                    <div className="flex items-center gap-1 text-[10px] text-[#A68832] font-mono">
                      <span>{fabric.category}</span>
                      <span>·</span>
                      <span className="truncate">{fabric.metadata.weave}</span>
                    </div>

                    <div className="pt-2 border-t border-[#23252E] flex items-center justify-between">
                      <span className="text-[10px] text-[#7A7E89] truncate">
                        {fabric.metadata.composition}
                      </span>
                      <button
                        onClick={() => {
                          const currentTpl = templates.find((t) => t.id === selectedTemplateId);
                          if (currentTpl && currentTpl.regions[0]) {
                            assignFabricToRegion(currentTpl.regions[0].id, fabric.id);
                            setActiveTab('atelier');
                          }
                        }}
                        className="text-[10px] bg-[#D4AF37]/20 hover:bg-[#D4AF37] text-[#D4AF37] hover:text-[#0D0E10] font-bold px-2 py-0.5 rounded transition cursor-pointer"
                      >
                        Apply →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Templates Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((tpl) => (
                <div
                  key={tpl.id}
                  onClick={() => {
                    selectTemplate(tpl.id);
                    setActiveTab('atelier');
                  }}
                  className={`bg-[#15161D] border rounded-xl overflow-hidden transition-all duration-200 cursor-pointer shadow-lg group ${
                    selectedTemplateId === tpl.id
                      ? 'border-[#D4AF37] ring-1 ring-[#D4AF37]/50'
                      : 'border-[#272A35] hover:border-[#3E4250]'
                  }`}
                >
                  <div className="aspect-4/3 bg-[#1B1D25] overflow-hidden relative">
                    <img
                      src={tpl.real_photo_url || tpl.original_image_url}
                      alt={tpl.name}
                      className="w-full h-full object-cover group-hover:scale-102 transition duration-300"
                    />
                    <span className="absolute bottom-2 left-2 bg-black/75 backdrop-blur-md text-[#D4AF37] text-[10px] font-mono px-2 py-0.5 rounded border border-white/10">
                      {tpl.regions.length} Replaceable Zones
                    </span>
                  </div>

                  <div className="p-4 space-y-1.5">
                    <h4 className="font-serif text-sm font-bold text-[#F9F6F0]">
                      {tpl.name}
                    </h4>
                    <p className="text-xs text-[#8C909C] line-clamp-2">
                      {tpl.description}
                    </p>
                    <div className="pt-2 border-t border-[#23252E] flex items-center justify-between text-[11px]">
                      <span className="text-[#A68832] font-mono">{tpl.style_code}</span>
                      <span className="text-[#D4AF37] font-semibold group-hover:underline">
                        Open in Atelier →
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
