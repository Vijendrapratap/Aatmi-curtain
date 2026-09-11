// src/components/brand/FabricCard.tsx
import React, { useState } from 'react';
import { Fabric } from '../../types/curtain';
import {
  Sparkles,
  Eye,
  MoreVertical,
  FolderPlus,
  Edit2,
  Archive,
  Check,
  Palette,
} from 'lucide-react';

interface FabricCardProps {
  fabric: Fabric;
  onPreview: (fabric: Fabric) => void;
  onApplyDirect: (fabric: Fabric) => void;
  onPromoteToCatalog?: (fabric: Fabric) => void;
  onRename?: (fabric: Fabric) => void;
  onArchive?: (fabric: Fabric) => void;
  viewSize?: 'compact' | 'comfortable';
}

export const FabricCard: React.FC<FabricCardProps> = ({
  fabric,
  onPreview,
  onApplyDirect,
  onPromoteToCatalog,
  onRename,
  onArchive,
  viewSize = 'comfortable',
}) => {
  const [imgError, setImgError] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isCatalog = fabric.visibility !== 'session_only';

  return (
    <div
      onClick={() => onPreview(fabric)}
      className="brand-card overflow-hidden hover:translate-y-[-2px] transition group relative flex flex-col justify-between cursor-pointer select-none bg-white border border-[var(--color-border-subtle)] hover:border-[var(--color-accent)]"
    >
      {/* Thumbnail Box */}
      <div
        className={`w-full relative overflow-hidden bg-neutral-100 ${
          viewSize === 'comfortable' ? 'aspect-[4/3] sm:aspect-square' : 'aspect-square'
        }`}
        style={{ backgroundColor: fabric.color_hex || '#EDE8DE' }}
      >
        {!imgError ? (
          <img
            src={fabric.image_url}
            alt={fabric.name}
            onError={() => setImgError(true)}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          />
        ) : (
          <div
            className="w-full h-full flex flex-col items-center justify-center p-4 text-center text-white"
            style={{
              backgroundColor: fabric.color_hex || '#5B4FE0',
              backgroundImage:
                'repeating-linear-gradient(45deg, rgba(255,255,255,0.06) 0px, rgba(255,255,255,0.06) 2px, transparent 2px, transparent 6px)',
            }}
          >
            <Palette className="w-8 h-8 mb-1 opacity-80" />
            <span className="text-[11px] font-semibold truncate max-w-full px-2">
              {fabric.name}
            </span>
            <span className="text-[9px] font-mono opacity-80">{fabric.color_hex}</span>
          </div>
        )}

        {/* Hover Action Overlay: "Quick Preview & Apply" */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center p-3 gap-2 backdrop-blur-2xs">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onPreview(fabric);
            }}
            className="w-full py-1.5 px-3 rounded-lg bg-white/95 hover:bg-white text-[var(--color-text-primary)] text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md tactile-press"
          >
            <Eye className="w-3.5 h-3.5 text-[var(--color-accent)]" />
            <span>Preview &amp; Inspect</span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onApplyDirect(fabric);
            }}
            className="w-full py-1.5 px-3 rounded-lg bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md tactile-press"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Apply to Curtain</span>
          </button>
        </div>

        {/* Top-Left Pill: Visibility (Catalog vs Session-only) */}
        <div className="absolute top-2 left-2 pointer-events-none">
          <span
            className={`text-[9px] font-mono font-semibold px-2 py-0.5 rounded-full shadow-xs ${
              isCatalog
                ? 'bg-white/90 backdrop-blur-xs text-[var(--color-accent)] border border-[var(--color-accent)]/20'
                : 'bg-neutral-800/85 text-neutral-200 backdrop-blur-xs'
            }`}
          >
            {isCatalog ? 'Catalog' : 'Session-only'}
          </span>
        </div>

        {/* Top-Right Kebab ⋮ Menu */}
        <div className="absolute top-2 right-2 z-10">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsMenuOpen(!isMenuOpen);
            }}
            className="p-1 rounded-full bg-white/85 hover:bg-white text-[var(--color-text-primary)] shadow-xs transition cursor-pointer"
          >
            <MoreVertical className="w-3.5 h-3.5" />
          </button>

          {isMenuOpen && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 top-full mt-1 w-36 rounded-xl bg-white border border-[var(--color-border-strong)] shadow-xl p-1.5 z-30 text-xs animate-in fade-in zoom-in-95 duration-100"
            >
              {!isCatalog && onPromoteToCatalog && (
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onPromoteToCatalog(fabric);
                  }}
                  className="w-full px-2 py-1.5 text-left rounded-lg hover:bg-[var(--color-accent-tint)] text-[var(--color-accent)] font-semibold flex items-center gap-2 cursor-pointer"
                >
                  <FolderPlus className="w-3.5 h-3.5" />
                  <span>Add to catalog</span>
                </button>
              )}

              {onRename && (
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onRename(fabric);
                  }}
                  className="w-full px-2 py-1.5 text-left rounded-lg hover:bg-[var(--color-bg-sunken)] text-[var(--color-text-primary)] flex items-center gap-2 cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5 text-[var(--color-text-secondary)]" />
                  <span>Rename</span>
                </button>
              )}

              {onArchive && (
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onArchive(fabric);
                  }}
                  className="w-full px-2 py-1.5 text-left rounded-lg hover:bg-red-50 text-red-600 flex items-center gap-2 cursor-pointer"
                >
                  <Archive className="w-3.5 h-3.5" />
                  <span>Archive</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Bottom-Right Color Dot */}
        <div
          className="absolute bottom-2 right-2 w-4 h-4 rounded-full border border-white shadow-xs"
          style={{ backgroundColor: fabric.color_hex || '#5B4FE0' }}
          title={`Color tone: ${fabric.color_hex}`}
        />
      </div>

      {/* Card Body Details & Quick Action Footer */}
      <div className="p-3 space-y-2">
        <div>
          <h4 className="text-xs font-display font-semibold text-[var(--color-text-primary)] truncate group-hover:text-[var(--color-accent)] transition">
            {fabric.name}
          </h4>
          <div className="text-[10px] text-[var(--color-text-secondary)] mt-0.5 flex items-center justify-between">
            <span>{fabric.category}</span>
            <span className="font-mono text-[9px] truncate max-w-[80px]">
              {fabric.metadata?.sheen || 'Matte'}
            </span>
          </div>
        </div>

        {/* 1-Click "Apply to Curtain" Footer Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onApplyDirect(fabric);
          }}
          className="w-full py-1.5 px-2.5 rounded-lg bg-[var(--color-bg-sunken)] hover:bg-[var(--color-accent-tint)] text-[var(--color-text-primary)] hover:text-[var(--color-accent)] text-[11px] font-semibold flex items-center justify-center gap-1.5 transition border border-[var(--color-border-subtle)] hover:border-[var(--color-accent)]/30 cursor-pointer tactile-press"
        >
          <Sparkles className="w-3 h-3 text-[var(--color-accent)]" />
          <span>Apply to Curtain</span>
        </button>
      </div>
    </div>
  );
};
