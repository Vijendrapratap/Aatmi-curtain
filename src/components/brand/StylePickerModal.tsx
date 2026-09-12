// src/components/brand/StylePickerModal.tsx
import React, { useEffect, useState } from 'react';
import { X, Plus, Search } from 'lucide-react';
import { useBrandStore } from '../../lib/brandStore';
import { CurtainTemplate } from '../../types/curtain';
import { styleOriginBadge } from '../../lib/labels';
import { StyleCard } from './StyleCard';

interface StylePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPick: (t: CurtainTemplate) => void;
  onAddStyle: () => void;
}

export const StylePickerModal: React.FC<StylePickerModalProps> = ({ isOpen, onClose, onPick, onAddStyle }) => {
  const { brandTemplates, currentBrandId } = useBrandStore();
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const styles = brandTemplates
    .filter((t) => t.brand_id === currentBrandId || !t.brand_id)
    .filter((t) => !query.trim() || t.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1814]/45 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        role="dialog"
        aria-label="Choose a curtain style"
        className="brand-card flex max-h-[90dvh] w-full max-w-5xl flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col gap-3 border-b border-[var(--color-border-subtle)] p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="eyebrow-label">Step 1</p>
            <h2 className="mt-0.5 font-display text-[20px] font-semibold">Choose a curtain style</h2>
            <p className="text-[13px] text-[var(--color-text-secondary)]">Each style has zones you can dress with different fabrics.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-[var(--color-text-disabled)]" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search styles"
                className="field w-48 pl-9"
              />
            </div>
            <button type="button" onClick={onAddStyle} className="btn btn-secondary">
              <Plus className="h-4 w-4" />
              Add your own
            </button>
            <button type="button" onClick={onClose} className="btn btn-ghost" aria-label="Close">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="grid flex-1 grid-cols-2 gap-4 overflow-y-auto p-5 md:grid-cols-3 lg:grid-cols-4">
          {styles.map((t) => (
            <StyleCard
              key={t.id}
              template={t}
              badge={styleOriginBadge(t, currentBrandId)}
              actionLabel="Use this style"
              compact
              onSelect={(picked) => {
                onPick(picked);
                onClose();
              }}
            />
          ))}
          {styles.length === 0 && (
            <div className="col-span-full py-12 text-center text-[13px] text-[var(--color-text-tertiary)]">
              No styles match that search.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
