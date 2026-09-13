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
  const [filter, setFilter] = useState<'all' | 'yours' | 'builtin'>('all');

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const all = brandTemplates.filter((t) => t.brand_id === currentBrandId || !t.brand_id);
  const yoursCount = all.filter((t) => styleOriginBadge(t, currentBrandId) === 'Your photo').length;
  const styles = all
    .filter((t) => filter === 'all' || (filter === 'yours' ? styleOriginBadge(t, currentBrandId) === 'Your photo' : styleOriginBadge(t, currentBrandId) === 'Built-in'))
    .filter((t) => !query.trim() || t.name.toLowerCase().includes(query.toLowerCase()));

  const chip = (id: typeof filter, label: string) => (
    <button type="button" onClick={() => setFilter(id)} className={`rounded-full px-3 py-1 text-[12px] font-semibold transition-colors ${filter === id ? 'bg-[var(--color-accent)] text-white' : 'glass-chip hover:border-[var(--color-accent)]'}`}>{label}</button>
  );

  return (
    <div className="glass-backdrop fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6" onClick={onClose}>
      <div role="dialog" aria-label="Choose a curtain style" className="glass-panel flex max-h-[92dvh] w-full max-w-6xl flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-col gap-3 px-5 pt-5 pb-4 sm:flex-row sm:items-start sm:justify-between sm:px-6">
          <div>
            <p className="eyebrow-label">Design in</p>
            <h2 className="mt-0.5 font-display text-[22px] font-semibold">Choose a curtain style</h2>
            <p className="text-[13px] text-[var(--color-text-secondary)]">Pick the curtain to work from. Each one has areas you can dress with different fabrics.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-[var(--color-text-disabled)]" />
              <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search styles" className="field w-48 bg-white/60 pl-9" />
            </div>
            <button type="button" onClick={onAddStyle} className="btn btn-secondary"><Plus className="h-4 w-4" /> Add your own</button>
            <button type="button" onClick={onClose} className="btn btn-ghost" aria-label="Close"><X className="h-5 w-5" /></button>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-5 pb-3 sm:px-6">
          {chip('all', `All ${all.length}`)}
          {yoursCount > 0 && chip('yours', `Your photos ${yoursCount}`)}
          {chip('builtin', `Built-in ${all.length - yoursCount}`)}
        </div>
        <div className="grid flex-1 auto-rows-max content-start grid-cols-1 gap-5 overflow-y-auto px-5 pb-6 sm:grid-cols-2 sm:px-6 lg:grid-cols-3">
          {styles.map((t) => (
            <StyleCard key={t.id} template={t} badge={styleOriginBadge(t, currentBrandId)} actionLabel="Use this style" compact onSelect={(picked) => { onPick(picked); onClose(); }} />
          ))}
          {styles.length === 0 && <div className="col-span-full py-12 text-center text-[13px] text-[var(--color-text-tertiary)]">No styles match that search.</div>}
        </div>
      </div>
    </div>
  );
};
