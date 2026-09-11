// src/components/brand/FabricCard.tsx
import React, { useState } from 'react';
import { Fabric } from '../../types/curtain';
import {
  Eye,
  MoreVertical,
  FolderPlus,
  Edit2,
  Archive,
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
      className="brand-card group relative flex cursor-pointer flex-col overflow-hidden"
      onClick={() => onPreview(fabric)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onPreview(fabric);
        }
      }}
      role="button"
      tabIndex={0}
    >
      <div
        className={`media-frame relative ${
          viewSize === 'comfortable' ? 'aspect-[4/3] sm:aspect-square' : 'aspect-square'
        }`}
        style={{ backgroundColor: fabric.color_hex || '#EDE8DE' }}
      >
        {!imgError ? (
          <img
            src={fabric.image_url}
            alt=""
            onError={() => setImgError(true)}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div
            className="flex h-full w-full flex-col items-center justify-center p-4 text-center text-white"
            style={{ backgroundColor: fabric.color_hex || '#5348C8' }}
          >
            <Palette className="mb-1 h-7 w-7 opacity-80" />
            <span className="max-w-full truncate px-2 text-[11px] font-semibold">{fabric.name}</span>
          </div>
        )}

        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#1A1814]/45 p-3 opacity-0 backdrop-blur-[2px] transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onPreview(fabric);
            }}
            className="btn btn-secondary btn-sm w-full"
          >
            <Eye className="h-3.5 w-3.5" />
            Inspect
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onApplyDirect(fabric);
            }}
            className="btn btn-primary btn-sm w-full"
          >
            Apply
          </button>
        </div>

        <div className="absolute top-2 left-2 pointer-events-none">
          <span className={isCatalog ? 'badge badge-muted' : 'badge badge-accent'}>
            {isCatalog ? 'Catalog' : 'Session'}
          </span>
        </div>

        <div className="absolute top-2 right-2 z-10">
          <button
            type="button"
            aria-label="Fabric actions"
            onClick={(e) => {
              e.stopPropagation();
              setIsMenuOpen((open) => !open);
            }}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-bg-surface)]/90 text-[var(--color-text-primary)] shadow-[var(--shadow-ring)]"
          >
            <MoreVertical className="h-3.5 w-3.5" />
          </button>

          {isMenuOpen && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="menu-panel absolute top-full right-0 z-30 mt-1 w-40 text-[12px]"
            >
              {!isCatalog && onPromoteToCatalog && (
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onPromoteToCatalog(fabric);
                  }}
                  className="flex w-full items-center gap-2 rounded-[8px] px-2 py-1.5 text-left text-[var(--color-accent)] hover:bg-[var(--color-accent-tint)]"
                >
                  <FolderPlus className="h-3.5 w-3.5" />
                  Add to catalog
                </button>
              )}
              {onRename && (
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onRename(fabric);
                  }}
                  className="flex w-full items-center gap-2 rounded-[8px] px-2 py-1.5 text-left hover:bg-[var(--color-bg-sunken)]"
                >
                  <Edit2 className="h-3.5 w-3.5 text-[var(--color-text-tertiary)]" />
                  Rename
                </button>
              )}
              {onArchive && (
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onArchive(fabric);
                  }}
                  className="flex w-full items-center gap-2 rounded-[8px] px-2 py-1.5 text-left text-[var(--color-error)] hover:bg-[rgba(201,75,72,0.08)]"
                >
                  <Archive className="h-3.5 w-3.5" />
                  Archive
                </button>
              )}
            </div>
          )}
        </div>

        <div
          className="absolute right-2 bottom-2 h-3.5 w-3.5 rounded-full border border-white shadow-[var(--shadow-ring)]"
          style={{ backgroundColor: fabric.color_hex || '#5348C8' }}
          title={fabric.color_hex}
        />
      </div>

      <div className="p-3">
        <h4 className="truncate font-display text-[13px] font-semibold">{fabric.name}</h4>
        <div className="mt-0.5 flex items-center justify-between text-[11px] text-[var(--color-text-tertiary)]">
          <span>{fabric.category}</span>
          <span className="font-mono text-[10px]">{fabric.metadata?.sheen || 'Matte'}</span>
        </div>
      </div>
    </div>
  );
};
