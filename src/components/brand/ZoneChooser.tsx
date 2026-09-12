// src/components/brand/ZoneChooser.tsx
import React, { useEffect } from 'react';
import { X, Layers } from 'lucide-react';
import { Fabric, FabricAssignment, Region } from '../../types/curtain';

interface ZoneChooserProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  regions: Region[];
  activeRegionId: string | null;
  assignments: FabricAssignment[];
  fabrics: Fabric[];
  onChoose: (regionId: string | 'all') => void;
}

export const ZoneChooser: React.FC<ZoneChooserProps> = ({
  isOpen,
  onClose,
  title,
  regions,
  activeRegionId,
  assignments,
  fabrics,
  onChoose,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-[#1A1814]/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-label={title}
        className="brand-card w-full max-w-sm p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <p className="eyebrow-label">Apply to</p>
            <h3 className="mt-0.5 font-display text-[16px] font-semibold">{title}</h3>
          </div>
          <button type="button" onClick={onClose} className="btn btn-ghost btn-sm" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-1">
          {regions.map((region) => {
            const assignment = assignments.find((a) => a.region_id === region.id);
            const fabric = fabrics.find((f) => f.id === assignment?.fabric_id);
            const isActive = region.id === activeRegionId;
            return (
              <button
                key={region.id}
                type="button"
                onClick={() => onChoose(region.id)}
                className={`flex w-full items-center gap-3 rounded-[12px] px-2.5 py-2 text-left transition-colors ${
                  isActive ? 'bg-[var(--color-accent-tint)]' : 'hover:bg-[var(--color-bg-sunken)]'
                }`}
              >
                {fabric ? (
                  <img src={fabric.image_url} alt="" className="h-8 w-8 shrink-0 rounded-[8px] object-cover" />
                ) : (
                  <span className="h-8 w-8 shrink-0 rounded-[8px]" style={{ backgroundColor: region.default_color || '#DDD6C7' }} />
                )}
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-semibold">{region.display_name}</span>
                  <span className="block truncate text-[11px] text-[var(--color-text-tertiary)]">
                    {fabric ? `Now: ${fabric.name}` : 'No fabric yet'}
                  </span>
                </span>
                {isActive && <span className="badge badge-accent">Active</span>}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => onChoose('all')}
            className="mt-1 flex w-full items-center gap-3 rounded-[12px] border-t border-[var(--color-border-subtle)] px-2.5 py-2.5 text-left hover:bg-[var(--color-bg-sunken)]"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[var(--color-bg-sunken)]">
              <Layers className="h-4 w-4 text-[var(--color-accent)]" />
            </span>
            <span className="text-[13px] font-semibold">All {regions.length} zones</span>
          </button>
        </div>
      </div>
    </div>
  );
};
