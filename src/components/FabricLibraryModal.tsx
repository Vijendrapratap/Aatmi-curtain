import React, { useState } from 'react';
import { Fabric, Region } from '../types/curtain';
import { X, Upload, Search, Check, Tag, Sparkles, Filter } from 'lucide-react';

interface FabricLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  fabrics: Fabric[];
  activeRegion: Region | null;
  currentAssignedFabricId: string | null;
  onSelectFabric: (fabricId: string) => void;
  onAddNewFabric: (newFabric: Fabric) => void;
}

export const FabricLibraryModal: React.FC<FabricLibraryModalProps> = ({
  isOpen,
  onClose,
  fabrics,
  activeRegion,
  currentAssignedFabricId,
  onSelectFabric,
  onAddNewFabric,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // New Fabric Form state
  const [newFabricName, setNewFabricName] = useState<string>('');
  const [newFabricCategory, setNewFabricCategory] = useState<Fabric['category']>('Velvet');
  const [newFabricWeave, setNewFabricWeave] = useState<string>('Luxury Woven Damask');
  const [newFabricPreview, setNewFabricPreview] = useState<string | null>(null);

  if (!isOpen) return null;

  const categories = [
    'All',
    'Uploaded Samples (13)',
    'Embroidered & Textured',
    'Geometric',
    'Velvet',
    'Linen',
    'Luxury Sheers',
    'Silk',
    'Jacquard & Damask',
    'Textured & Bouclé',
    'Custom',
  ];

  const filteredFabrics = fabrics.filter((fab) => {
    const matchesCategory =
      activeCategory === 'All'
        ? true
        : activeCategory === 'Uploaded Samples (13)'
        ? fab.id.startsWith('fab-user-')
        : activeCategory === 'Custom'
        ? fab.is_custom
        : fab.category === activeCategory;

    const matchesSearch =
      fab.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fab.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
      fab.category.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setNewFabricPreview(base64);
      if (!newFabricName) {
        setNewFabricName(file.name.replace(/\.[^/.]+$/, ''));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveNewFabric = () => {
    if (!newFabricPreview || !newFabricName) return;

    const newFabric: Fabric = {
      id: `fab-user-${Date.now()}`,
      name: newFabricName,
      image_url: newFabricPreview,
      category: newFabricCategory,
      tileable: true,
      tags: ['custom', newFabricCategory.toLowerCase()],
      metadata: {
        weave: newFabricWeave || 'Custom Weave',
        scale: 'medium',
        sheen: 'Subtle Luster',
        weight: 'Medium',
        composition: 'Custom Client Fabric Spec',
      },
      color_hex: '#6B6862',
      is_custom: true,
    };

    onAddNewFabric(newFabric);
    onSelectFabric(newFabric.id);
    setIsUploading(false);
    setNewFabricPreview(null);
    setNewFabricName('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="atelier-surface bg-white text-stone-100 sm:rounded-2xl shadow-2xl border-0 sm:border border-[#C9BFB4] w-full sm:max-w-4xl h-full sm:h-auto sm:max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-3.5 border-b border-[#C9BFB4] flex items-center justify-between bg-[#F5F0EB]">
          <div className="min-w-0 pr-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h3 className="font-serif text-base sm:text-lg font-bold text-white tracking-wide truncate">
                Aatmi Fabric Library
              </h3>
              {activeRegion && (
                <span className="text-[10px] sm:text-xs bg-[#242013] text-[#B8900F] border border-[#D4AF37]/35 px-2.5 py-0.5 rounded-full font-semibold shrink-0">
                  Zone: {activeRegion.display_name}
                </span>
              )}
            </div>
            <p className="text-[11px] sm:text-xs text-stone-400 mt-0.5 truncate">
              Select an atelier fabric swatch or upload physical drapery photograph.
            </p>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              id="modal-toggle-upload"
              onClick={() => setIsUploading(!isUploading)}
              className={`tactile-press flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold pl-2.5 pr-3 py-1.5 rounded-lg border transition cursor-pointer ${
                isUploading
                  ? 'bg-[#D4AF37] text-stone-950 border-[#D4AF37]'
                  : 'bg-white/5 text-stone-200 border-white/15 hover:bg-white/10 hover:border-white/25'
              }`}
            >
              <Upload className={`w-3.5 h-3.5 ${isUploading ? 'text-stone-950' : 'text-[#C49A1E]'}`} />
              <span className="hidden xs:inline">{isUploading ? 'Back to Swatches' : 'Upload Swatch'}</span>
              <span className="xs:hidden">{isUploading ? 'Swatches' : 'Upload'}</span>
            </button>

            <button
              id="modal-close-fabrics"
              onClick={onClose}
              className="tactile-press p-1.5 text-stone-400 hover:text-stone-100 rounded-lg hover:bg-white/10 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Upload Form View */}
        {isUploading ? (
          <div className="p-6 flex-1 overflow-y-auto bg-[#F8F5F0]">
            <div className="max-w-lg mx-auto bg-[#151722] p-6 rounded-xl border border-[#C9BFB4] shadow-lg space-y-4">
              <h4 className="font-serif text-base font-semibold text-stone-100">
                Upload New Fabric Swatch
              </h4>
              <p className="text-xs text-stone-400">
                Upload a clear top-down photograph of your fabric sample. The AI will repeat and map the texture onto your curtain drape.
              </p>

              {/* Upload Dropzone */}
              <label
                htmlFor="fabric-swatch-input"
                className="border-2 border-dashed border-white/20 hover:border-[#D4AF37]/60 rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer bg-white/5 hover:bg-[#D4AF37]/5 transition group"
              >
                {newFabricPreview ? (
                  <div className="w-32 h-32 rounded-lg overflow-hidden border border-white/20 shadow-md">
                    <img
                      src={newFabricPreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full bg-white/10 group-hover:bg-[#D4AF37]/20 flex items-center justify-center transition">
                      <Upload className="w-6 h-6 text-stone-400 group-hover:text-[#C49A1E] transition" />
                    </div>
                    <span className="text-xs font-semibold text-stone-200">
                      Click to choose fabric file or drag and drop
                    </span>
                    <span className="text-[11px] text-stone-500">
                      PNG, JPG, WEBP up to 25MB
                    </span>
                  </>
                )}
                <input
                  id="fabric-swatch-input"
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              {/* Fabric Details */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    Fabric Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Royal Gold Velvet, Silk Jacquard Striped"
                    value={newFabricName}
                    onChange={(e) => setNewFabricName(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-[#F8F5F0] border border-white/15 text-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1">
                      Category
                    </label>
                    <select
                      value={newFabricCategory}
                      onChange={(e) => setNewFabricCategory(e.target.value as any)}
                      className="w-full text-xs px-3 py-2 bg-[#F8F5F0] border border-white/15 text-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                    >
                      <option value="Velvet">Velvet</option>
                      <option value="Linen">Linen</option>
                      <option value="Silk">Silk</option>
                      <option value="Jacquard & Damask">Jacquard & Damask</option>
                      <option value="Textured & Bouclé">Textured & Bouclé</option>
                      <option value="Exotic Relief">Exotic Relief</option>
                      <option value="Geometric">Geometric</option>
                      <option value="Custom">Custom</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1">
                      Weave Texture
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Heavyweight Pile, Slub"
                      value={newFabricWeave}
                      onChange={(e) => setNewFabricWeave(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-[#F8F5F0] border border-white/15 text-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#C9BFB4]">
                <button
                  type="button"
                  onClick={() => setIsUploading(false)}
                  className="tactile-press px-4 py-2 text-xs font-medium text-stone-400 hover:text-stone-200 hover:bg-[#F0EBE4] rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveNewFabric}
                  disabled={!newFabricPreview || !newFabricName}
                  className="tactile-press px-4 py-2 text-xs font-semibold bg-[#D4AF37] hover:bg-[#E5C158] text-stone-950 rounded-lg disabled:opacity-50 transition cursor-pointer shadow-sm"
                >
                  Save & Assign Swatch
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Swatches Gallery View */
          <>
            {/* Search & Category Filter Bar */}
            <div className="p-3 sm:p-4 border-b border-[#C9BFB4] flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 bg-[#F5F0EB]">
              <div className="relative w-full sm:w-64 shrink-0">
                <Search className="w-3.5 h-3.5 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search fabrics, weave, tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#151822] border border-white/15 text-stone-200 placeholder-stone-500 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                />
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full pb-1 sm:pb-0 scrollbar-none">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`tactile-press px-2.5 py-1 text-[11px] sm:text-xs rounded-full whitespace-nowrap transition cursor-pointer font-medium ${
                      activeCategory === cat
                        ? 'bg-[#D4AF37] text-stone-950 shadow-xs font-semibold'
                        : 'bg-white/5 text-stone-400 hover:bg-white/10 hover:text-stone-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Fabrics Grid */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-6 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-4 bg-[#F8F5F0]">
              {filteredFabrics.map((fabric) => {
                const isSelected = currentAssignedFabricId === fabric.id;

                return (
                  <div
                    key={fabric.id}
                    id={`fabric-card-${fabric.id}`}
                    onClick={() => {
                      onSelectFabric(fabric.id);
                      onClose();
                    }}
                    className={`tactile-press group rounded-xl border p-2.5 sm:p-3.5 transition-all duration-150 cursor-pointer relative flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#1D1B13] border-[#D4AF37] ring-1 ring-[#D4AF37]/50 shadow-lg shadow-[#D4AF37]/10'
                        : 'bg-[#151822] border-[#C9BFB4] hover:border-[#D4AF37]/40 hover:bg-[#181B26]'
                    }`}
                  >
                    <div>
                      {/* Swatch Image Box - Concentric inner radius */}
                      <div className="w-full aspect-[4/3] rounded-lg overflow-hidden border border-[#C9BFB4] bg-[#E8E2DA] mb-2 sm:mb-3 relative shadow-xs">
                        <img
                          src={fabric.image_url}
                          alt={fabric.name}
                          className="w-full h-full object-cover better-img-outline group-hover:scale-105 transition duration-300"
                        />
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 bg-[#D4AF37] text-stone-950 rounded-full p-1 shadow-md">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                        <span className="absolute bottom-1.5 left-1.5 text-[9px] sm:text-[10px] font-medium bg-black/80 text-[#B8900F] px-1.5 py-0.5 rounded backdrop-blur-xs border border-[#C9BFB4]">
                          {fabric.category}
                        </span>
                      </div>

                      {/* Info */}
                      <h4 className="font-serif text-[11px] sm:text-xs font-semibold text-stone-100 leading-snug group-hover:text-[#B8900F] transition line-clamp-1">
                        {fabric.name}
                      </h4>
                      <p className="text-[10px] sm:text-[11px] text-stone-400 mt-0.5 line-clamp-1">
                        {fabric.metadata.weave} • {fabric.metadata.sheen}
                      </p>
                      <p className="text-[9px] sm:text-[10px] text-stone-500 mt-0.5 hidden xs:block line-clamp-1">
                        {fabric.metadata.composition}
                      </p>
                    </div>

                    {/* Action Button */}
                    <div className="mt-2.5 pt-2 border-t border-[#C9BFB4] flex items-center justify-between">
                      <div className="hidden sm:flex items-center gap-1 flex-wrap">
                        {fabric.tags.slice(0, 1).map((t) => (
                          <span
                            key={t}
                            className="text-[9px] bg-white/5 text-stone-400 px-1.5 py-0.5 rounded font-mono"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>

                      <span className="text-[11px] sm:text-xs font-semibold text-[#C49A1E] group-hover:text-[#B8900F] group-hover:underline ml-auto">
                        {isSelected ? 'Assigned' : 'Apply Swatch →'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-[#C9BFB4] bg-[#F5F0EB] flex items-center justify-between text-xs text-stone-400">
          <span>
            Showing <strong className="text-stone-200">{filteredFabrics.length}</strong> of {fabrics.length} atelier fabrics
          </span>
          <button
            onClick={onClose}
            className="tactile-press px-4 py-1.5 text-xs font-medium text-stone-300 hover:text-white bg-white/5 hover:bg-white/10 border border-[#C9BFB4] rounded-lg transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
