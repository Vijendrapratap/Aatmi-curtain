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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif text-lg font-bold text-stone-900">
                Aatmi Haute Fabric Library
              </h3>
              {activeRegion && (
                <span className="text-xs bg-amber-100 text-amber-900 border border-amber-300/80 px-2 py-0.5 rounded-md font-semibold">
                  Assigning to: {activeRegion.display_name}
                </span>
              )}
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Select a luxury fabric swatch or upload your own physical fabric photograph.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="modal-toggle-upload"
              onClick={() => setIsUploading(!isUploading)}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition cursor-pointer ${
                isUploading
                  ? 'bg-stone-800 text-white border-stone-800'
                  : 'bg-white text-stone-800 border-stone-300 hover:bg-stone-100'
              }`}
            >
              <Upload className="w-3.5 h-3.5 text-amber-600" />
              <span>{isUploading ? 'Back to Swatches' : 'Upload Swatch'}</span>
            </button>

            <button
              id="modal-close-fabrics"
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-200/60 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Upload Form View */}
        {isUploading ? (
          <div className="p-6 flex-1 overflow-y-auto bg-stone-50/50">
            <div className="max-w-lg mx-auto bg-white p-6 rounded-xl border border-stone-200 shadow-sm space-y-4">
              <h4 className="font-serif text-base font-semibold text-stone-900">
                Upload New Fabric Swatch
              </h4>
              <p className="text-xs text-stone-500">
                Upload a clear top-down photograph of your fabric sample. The AI will repeat and map the texture onto your curtain drape.
              </p>

              {/* Upload Dropzone */}
              <label
                htmlFor="fabric-swatch-input"
                className="border-2 border-dashed border-stone-300 hover:border-amber-600 rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer bg-stone-50 hover:bg-amber-50/20 transition group"
              >
                {newFabricPreview ? (
                  <div className="w-32 h-32 rounded-lg overflow-hidden border border-stone-300 shadow-md">
                    <img
                      src={newFabricPreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full bg-stone-200 group-hover:bg-amber-100 flex items-center justify-center transition">
                      <Upload className="w-6 h-6 text-stone-500 group-hover:text-amber-700 transition" />
                    </div>
                    <span className="text-xs font-semibold text-stone-800">
                      Click to choose fabric file or drag and drop
                    </span>
                    <span className="text-[11px] text-stone-400">
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
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Fabric Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Royal Indigo Velvet, Gold Jacquard Striped"
                    value={newFabricName}
                    onChange={(e) => setNewFabricName(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Category
                    </label>
                    <select
                      value={newFabricCategory}
                      onChange={(e) => setNewFabricCategory(e.target.value as any)}
                      className="w-full text-xs px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
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
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Weave Texture
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Heavyweight Pile, Slub"
                      value={newFabricWeave}
                      onChange={(e) => setNewFabricWeave(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsUploading(false)}
                  className="px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveNewFabric}
                  disabled={!newFabricPreview || !newFabricName}
                  className="px-4 py-2 text-xs font-semibold bg-amber-700 hover:bg-amber-800 text-white rounded-lg disabled:opacity-50 transition cursor-pointer shadow-xs"
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
            <div className="p-4 border-b border-stone-200 flex flex-col sm:flex-row items-center gap-3 bg-white">
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search fabrics, weave, tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600"
                />
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1 overflow-x-auto w-full pb-1 sm:pb-0 scrollbar-none">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-2.5 py-1 text-xs rounded-full whitespace-nowrap transition cursor-pointer font-medium ${
                      activeCategory === cat
                        ? 'bg-amber-800 text-white shadow-2xs font-semibold'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Fabrics Grid */}
            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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
                    className={`group rounded-xl border p-3.5 transition-all duration-150 cursor-pointer bg-white relative flex flex-col justify-between ${
                      isSelected
                        ? 'border-amber-600 ring-2 ring-amber-600/30 shadow-md bg-amber-50/20'
                        : 'border-stone-200 hover:border-amber-500/70 hover:shadow-sm'
                    }`}
                  >
                    <div>
                      {/* Swatch Image Box */}
                      <div className="w-full aspect-video rounded-lg overflow-hidden border border-stone-200 bg-stone-100 mb-3 relative shadow-2xs">
                        <img
                          src={fabric.image_url}
                          alt={fabric.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                        {isSelected && (
                          <div className="absolute top-2 right-2 bg-amber-600 text-white rounded-full p-1 shadow-md">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                        <span className="absolute bottom-2 left-2 text-[10px] font-semibold bg-stone-900/80 text-white px-2 py-0.5 rounded backdrop-blur-xs">
                          {fabric.category}
                        </span>
                      </div>

                      {/* Info */}
                      <h4 className="font-serif text-xs font-bold text-stone-900 leading-snug group-hover:text-amber-800 transition">
                        {fabric.name}
                      </h4>
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        {fabric.metadata.weave} • {fabric.metadata.sheen}
                      </p>
                      <p className="text-[10px] text-stone-400 mt-0.5">
                        {fabric.metadata.composition}
                      </p>
                    </div>

                    {/* Action Button */}
                    <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between">
                      <div className="flex items-center gap-1 flex-wrap">
                        {fabric.tags.slice(0, 2).map((t) => (
                          <span
                            key={t}
                            className="text-[9px] bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded font-mono"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>

                      <span className="text-xs font-semibold text-amber-700 group-hover:underline">
                        {isSelected ? 'Assigned' : 'Select Swatch →'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-stone-200 bg-stone-50 flex items-center justify-between text-xs text-stone-500">
          <span>
            Showing {filteredFabrics.length} of {fabrics.length} fabrics in catalog
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-200 rounded-md transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
