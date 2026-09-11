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
    { name: 'Gold / Champagne', hex: '#C49A1E' },
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
        addCustomFabric({
          name: file.name.replace(/\.[^/.]+$/, ''),
          image_url: base64,
          category: 'Custom',
          tileable: true,
          tags: ['custom', 'uploaded'],
          metadata: {
            weave: 'Custom Swatch Weave',
            scale: 'medium',
            sheen: 'Subtle Luster',
            weight: 'Medium',
            composition: 'Uploaded Fabric Sample',
          },
          color_hex: '#C49A1E',
          is_custom: true,
        });
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden bg-[#F8F6F0] text-[#1A1714]">
      {/* Left Sidebar: Collections & Filter Column */}
      <div className="w-full md:w-72 border-b md:border-b-0 md:border-r border-[#E8E2D8] bg-[#FAF8F3] p-4 sm:p-5 flex flex-col justify-between overflow-y-auto">
        <div className="space-y-5">
          {/* Section Title */}
          <div className="flex items-center justify-between pb-3 border-b border-[#E8E2D8]">
            <div className="flex items-center gap-2">
              <Folder className="w-4 h-4 text-[#C49A1E]" />
              <h3 className="font-serif text-sm font-bold text-[#1A1714] tracking-wide">
                Catalogs &amp; Collections
              </h3>
            </div>
          </div>

          {/* Asset Type Selector */}
          <div className="flex p-1 bg-[#EAE4DC] rounded-xl border border-[#D4C9BC]">
            <button
              onClick={() => setActiveTypeTab('fabric')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
                activeTypeTab === 'fabric'
                  ? 'bg-white text-[#1A1714] font-bold shadow-xs border border-[#E2D9CE]'
                  : 'text-[#6B5F54] hover:text-[#1A1714]'
              }`}
            >
              Fabrics ({fabrics.length})
            </button>
            <button
              onClick={() => setActiveTypeTab('template')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
                activeTypeTab === 'template'
                  ? 'bg-white text-[#1A1714] font-bold shadow-xs border border-[#E2D9CE]'
                  : 'text-[#6B5F54] hover:text-[#1A1714]'
              }`}
            >
              Templates ({templates.length})
            </button>
          </div>

          {/* Folder List */}
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#9E9088] font-bold block mb-1">
              Curated Folders
            </span>

            <div
              onClick={() => setActiveCatalogId(null)}
              className={`p-2.5 rounded-xl text-xs flex items-center justify-between cursor-pointer transition ${
                activeCatalogId === null
                  ? 'bg-[#FFF8E6] text-[#C49A1E] font-bold border border-[#C49A1E]/30 shadow-2xs'
                  : 'text-[#6B5F54] hover:bg-[#F0EBE4] hover:text-[#1A1714]'
              }`}
            >
              <span>All Master Assets</span>
              <span className="text-[10px] font-mono bg-[#EAE4DC] px-2 py-0.5 rounded-md font-semibold text-[#1A1714]">
                {fabrics.length + templates.length}
              </span>
            </div>

            {catalogs.map((cat) => (
              <div
                key={cat.id}
                onClick={() => setActiveCatalogId(cat.id)}
                className={`p-2.5 rounded-xl text-xs flex items-center justify-between cursor-pointer transition ${
                  activeCatalogId === cat.id
                    ? 'bg-[#FFF8E6] text-[#C49A1E] font-bold border border-[#C49A1E]/30 shadow-2xs'
                    : 'text-[#6B5F54] hover:bg-[#F0EBE4] hover:text-[#1A1714]'
                }`}
              >
                <div className="truncate pr-2">
                  <span className="block truncate">{cat.name}</span>
                </div>
                <span className="text-[10px] font-mono bg-[#EAE4DC] px-2 py-0.5 rounded-md font-semibold text-[#1A1714] shrink-0">
                  {cat.itemCount}
                </span>
              </div>
            ))}
          </div>

          {/* Color Filter Palette */}
          {activeTypeTab === 'fabric' && (
            <div className="space-y-2 pt-3 border-t border-[#E8E2D8]">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#9E9088] font-bold block">
                Colorway Filter
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
                        ? 'ring-2 ring-[#C49A1E] scale-110 border-white'
                        : 'border-[#D4C9BC] hover:scale-105 shadow-2xs'
                    }`}
                    style={{ backgroundColor: col.hex }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Upload Swatch Card */}
          <div className="pt-3 border-t border-[#E8E2D8]">
            <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-[#D4C9BC] hover:border-[#C49A1E] rounded-2xl bg-white hover:bg-[#FFFDF8] transition cursor-pointer shadow-2xs">
              <input
                type="file"
                accept="image/*"
                onChange={handleUploadFabric}
                className="hidden"
              />
              <Upload className="w-5 h-5 text-[#C49A1E] mb-1" />
              <span className="text-xs font-bold text-[#1A1714]">Upload Fabric Swatch</span>
              <span className="text-[10px] text-[#6B5F54] text-center mt-0.5">
                Seamless swatch &amp; physical texture tile
              </span>
            </label>
          </div>
        </div>

        {/* Storage Info */}
        <div className="pt-4 border-t border-[#E8E2D8] text-[10px] text-[#9E9088] font-mono">
          <span>Aatmi Storage Bucket: /fabrics</span>
        </div>
      </div>

      {/* Main Grid View */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Filter Bar */}
        <div className="p-4 border-b border-[#E8E2D8] bg-[#FAF8F3] flex flex-wrap items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative min-w-[240px] flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#9E9088] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={fabricSearchQuery}
              onChange={(e) => setFabricSearchQuery(e.target.value)}
              placeholder="Search textiles by weave (velvet, bouclé, linen)..."
              className="w-full bg-white border border-[#D4C9BC] text-xs text-[#1A1714] pl-9 pr-3 py-2 rounded-xl focus:outline-none focus:border-[#C49A1E] placeholder:text-[#9E9088] shadow-2xs"
            />
          </div>

          {/* Material Category Pills */}
          {activeTypeTab === 'fabric' && (
            <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveFabricCategory(cat)}
                  className={`text-xs px-3 py-1.5 rounded-xl whitespace-nowrap transition cursor-pointer font-semibold ${
                    activeFabricCategory === cat
                      ? 'bg-[#C49A1E] text-white shadow-xs'
                      : 'bg-white text-[#6B5F54] hover:text-[#1A1714] hover:bg-[#EFEAE2] border border-[#D4C9BC]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Grid Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#F8F6F0]">
          {activeTypeTab === 'fabric' ? (
            /* Fabric Swatches Grid */
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredFabrics.map((fabric) => (
                <div
                  key={fabric.id}
                  className="group bg-white border border-[#E5DDD0] hover:border-[#C49A1E] rounded-2xl overflow-hidden transition-all duration-200 shadow-xs hover:shadow-md flex flex-col justify-between"
                >
                  {/* Swatch Image */}
                  <div className="relative aspect-square overflow-hidden bg-[#EDE7DF]">
                    <img
                      src={fabric.image_url}
                      alt={fabric.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 right-2 flex items-center gap-1">
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-white shadow-xs"
                        style={{ backgroundColor: fabric.color_hex }}
                      />
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="p-3 space-y-1.5">
                    <div className="flex items-start justify-between gap-1">
                      <h4 className="font-serif text-xs font-bold text-[#1A1714] truncate">
                        {fabric.name}
                      </h4>
                    </div>

                    <div className="flex items-center gap-1 text-[10px] text-[#C49A1E] font-mono font-medium">
                      <span>{fabric.category}</span>
                      <span>·</span>
                      <span className="truncate">{fabric.metadata.weave}</span>
                    </div>

                    <div className="pt-2 border-t border-[#E8E2D8] flex items-center justify-between">
                      <span className="text-[10px] text-[#9E9088] truncate max-w-[90px]">
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
                        className="text-[10px] bg-[#FFF8E6] hover:bg-[#C49A1E] text-[#C49A1E] hover:text-white font-bold px-2.5 py-1 rounded-lg transition cursor-pointer border border-[#C49A1E]/30"
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
                  className={`bg-white border rounded-2xl overflow-hidden transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md group ${
                    selectedTemplateId === tpl.id
                      ? 'border-2 border-[#C49A1E] ring-1 ring-[#C49A1E]/30'
                      : 'border-[#E5DDD0] hover:border-[#C49A1E]/60'
                  }`}
                >
                  <div className="aspect-4/3 bg-[#EDE7DF] overflow-hidden relative">
                    <img
                      src={tpl.real_photo_url || tpl.original_image_url}
                      alt={tpl.name}
                      className="w-full h-full object-cover group-hover:scale-102 transition duration-300"
                    />
                    <span className="absolute bottom-2 left-2 bg-white/95 backdrop-blur-md text-[#C49A1E] text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-md border border-[#D4C9BC] shadow-2xs">
                      {tpl.regions.length} Drape Zones
                    </span>
                  </div>

                  <div className="p-4 space-y-1.5">
                    <h4 className="font-serif text-sm font-bold text-[#1A1714]">
                      {tpl.name}
                    </h4>
                    <p className="text-xs text-[#6B5F54] line-clamp-2 leading-relaxed">
                      {tpl.description}
                    </p>
                    <div className="pt-2 border-t border-[#E8E2D8] flex items-center justify-between text-[11px]">
                      <span className="text-[#C49A1E] font-mono font-semibold">{tpl.style_code}</span>
                      <span className="text-[#1A1714] font-bold group-hover:text-[#C49A1E] transition">
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
