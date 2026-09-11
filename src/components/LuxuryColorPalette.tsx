import React, { useState } from 'react';
import { Region } from '../types/curtain';
import { Palette, Check, Sparkles, SlidersHorizontal, Plus } from 'lucide-react';

export interface LuxuryColor {
  id: string;
  name: string;
  hex: string;
  category: 'Jewel' | 'Neutral' | 'Earth' | 'Metallic & Silk';
  ambiance: string;
}

export const LUXURY_DRAPERY_COLORS: LuxuryColor[] = [
  // Metallics & Silk
  { id: 'col-champagne', name: 'Champagne Gold', hex: '#D4AF37', category: 'Metallic & Silk', ambiance: 'Warm Luster' },
  { id: 'col-parisian-blanc', name: 'Parisian Pearl', hex: '#F5F2EB', category: 'Neutral', ambiance: 'Soft Daylight' },
  { id: 'col-belgian-oatmeal', name: 'Belgian Oatmeal', hex: '#DDD6C7', category: 'Neutral', ambiance: 'Natural Linen' },
  { id: 'col-antique-ivory', name: 'Antique Ivory', hex: '#FAF6E9', category: 'Neutral', ambiance: 'Airy Ambient' },
  { id: 'col-charcoal-slate', name: 'Charcoal Slate', hex: '#1E2024', category: 'Neutral', ambiance: 'Dramatic Contrast' },
  
  // Jewel Tones
  { id: 'col-imperial-emerald', name: 'Imperial Emerald', hex: '#0F5A41', category: 'Jewel', ambiance: 'Rich Velvet Depth' },
  { id: 'col-royal-navy', name: 'Midnight Navy', hex: '#162033', category: 'Jewel', ambiance: 'Deep Evening' },
  { id: 'col-bordeaux-wine', name: 'Bordeaux Velvet', hex: '#6B1724', category: 'Jewel', ambiance: 'Aristocratic Warmth' },
  { id: 'col-venetian-saffron', name: 'Venetian Saffron', hex: '#E29B27', category: 'Jewel', ambiance: 'Luminous Glow' },
  
  // Earth & Terracotta
  { id: 'col-tuscan-terracotta', name: 'Tuscan Terracotta', hex: '#A65B32', category: 'Earth', ambiance: 'Golden Hour' },
  { id: 'col-florentine-amber', name: 'Florentine Ochre', hex: '#D97706', category: 'Earth', ambiance: 'Sun-Drenched' },
  { id: 'col-cashmere-camel', name: 'Cashmere Camel', hex: '#B59A79', category: 'Earth', ambiance: 'Organic Wool' },
  { id: 'col-cognac-leather', name: 'Cognac Saddle', hex: '#8C4A26', category: 'Earth', ambiance: 'Rich Patina' },
  { id: 'col-rose-damask', name: 'Rose Damask Blush', hex: '#E5C2BC', category: 'Earth', ambiance: 'Romantic Sheen' },

  // Cool & Mineral
  { id: 'col-moss-sage', name: 'Silk Moss Sage', hex: '#7A8471', category: 'Metallic & Silk', ambiance: 'Earthy Serenity' },
  { id: 'col-silver-birch', name: 'Silver Birch', hex: '#C5C8CC', category: 'Metallic & Silk', ambiance: 'Cool Nordic' },
  { id: 'col-nordic-sky', name: 'Nordic Slate Blue', hex: '#4A6B82', category: 'Metallic & Silk', ambiance: 'Atmospheric Dusk' },
  { id: 'col-obsidian-black', name: 'Obsidian Velvet', hex: '#121316', category: 'Neutral', ambiance: 'Pure Noir Shadow' },
];

interface LuxuryColorPaletteProps {
  activeRegion: Region | null;
  currentColorHex?: string;
  onSelectColor: (color: { name: string; hex: string }) => void;
}

export const LuxuryColorPalette: React.FC<LuxuryColorPaletteProps> = ({
  activeRegion,
  currentColorHex,
  onSelectColor,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [customHex, setCustomHex] = useState<string>('#D4AF37');

  const categories = ['All', 'Neutral', 'Jewel', 'Earth', 'Metallic & Silk'];

  const filteredColors = LUXURY_DRAPERY_COLORS.filter((col) =>
    selectedFilter === 'All' ? true : col.category === selectedFilter
  );

  const handleApplyCustomHex = (hex: string) => {
    setCustomHex(hex);
    onSelectColor({ name: `Custom Brand Dye (${hex.toUpperCase()})`, hex });
  };

  return (
    <div className="space-y-3.5">
      {/* Category selector pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedFilter(cat)}
            className={`tactile-press px-2.5 py-1 text-[10px] sm:text-[11px] font-medium rounded-full transition cursor-pointer whitespace-nowrap ${
              selectedFilter === cat
                ? 'bg-[#D4AF37] text-stone-950 font-semibold shadow-xs'
                : 'bg-white/5 text-stone-400 hover:bg-white/10 hover:text-stone-200 border border-white/5'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Swatches Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-[220px] overflow-y-auto p-0.5">
        {filteredColors.map((color) => {
          const isSelected = currentColorHex?.toLowerCase() === color.hex.toLowerCase();

          return (
            <button
              key={color.id}
              type="button"
              onClick={() => onSelectColor({ name: color.name, hex: color.hex })}
              title={`${color.name} (${color.hex}) — ${color.ambiance}`}
              className={`tactile-press group relative rounded-xl p-1.5 border text-left flex flex-col justify-between transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#242013] border-[#D4AF37] ring-1 ring-[#D4AF37]/50 shadow-md'
                  : 'bg-white/[0.03] border-[#C9BFB4] hover:border-[#D4AF37]/40 hover:bg-white/[0.06]'
              }`}
            >
              {/* Color Disk with sheen & pure white border */}
              <div
                className="w-full aspect-square rounded-lg relative overflow-hidden shadow-inner better-img-outline mb-1.5 flex items-center justify-center transition group-hover:scale-[1.02]"
                style={{ backgroundColor: color.hex }}
              >
                {/* Surface sheen highlight reflection */}
                <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-white/20 pointer-events-none" />

                {isSelected && (
                  <div className="w-5 h-5 rounded-full bg-stone-950/80 text-[#B8900F] flex items-center justify-center shadow-md border border-[#D4AF37]/40">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </div>

              {/* Label */}
              <span className="text-[10px] font-medium text-stone-200 truncate group-hover:text-white block leading-tight">
                {color.name}
              </span>
              <span className="text-[9px] font-mono text-stone-500 uppercase block">
                {color.hex}
              </span>
            </button>
          );
        })}
      </div>

      {/* Custom Brand Color Input */}
      <div className="pt-2.5 border-t border-[#C9BFB4] flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="color"
              value={customHex}
              onChange={(e) => handleApplyCustomHex(e.target.value)}
              className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border border-white/20 p-0 overflow-hidden"
              title="Pick exact brand hex color"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-medium text-stone-300">Custom Brand Hex</span>
            <input
              type="text"
              value={customHex}
              onChange={(e) => {
                setCustomHex(e.target.value);
                if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
                  handleApplyCustomHex(e.target.value);
                }
              }}
              placeholder="#D4AF37"
              className="text-[11px] font-mono px-2 py-0.5 bg-black/50 border border-[#C9BFB4] rounded text-[#B8900F] w-20 focus:outline-none focus:border-[#D4AF37]"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={() => handleApplyCustomHex(customHex)}
          className="tactile-press pl-2.5 pr-3 py-1.5 rounded-lg border border-[#D4AF37]/40 bg-[#1D1A10] text-[#B8900F] hover:bg-[#252112] text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
        >
          <Sparkles className="w-3 h-3 text-[#C49A1E]" />
          <span>Apply Dye</span>
        </button>
      </div>
    </div>
  );
};
