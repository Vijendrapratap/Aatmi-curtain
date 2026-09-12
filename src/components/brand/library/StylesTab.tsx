// src/components/brand/library/StylesTab.tsx
import React, { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { useBrandStore } from '../../../lib/brandStore';
import { useStudioStore } from '../../../lib/store';
import { styleOriginBadge } from '../../../lib/labels';
import { StyleCard } from '../StyleCard';

interface StylesTabProps {
  onOpenNewStyle: () => void;
}

export const StylesTab: React.FC<StylesTabProps> = ({ onOpenNewStyle }) => {
  const { brandTemplates, currentBrandId, setActiveView } = useBrandStore();
  const { selectTemplate } = useStudioStore();
  const [filter, setFilter] = useState<'all' | 'mine' | 'built_in'>('all');
  const [query, setQuery] = useState('');

  const scoped = brandTemplates.filter((t) => t.brand_id === currentBrandId || !t.brand_id);
  const filtered = scoped.filter((t) => {
    const badge = styleOriginBadge(t, currentBrandId);
    if (filter === 'mine' && badge !== 'Your photo') return false;
    if (filter === 'built_in' && badge !== 'Built-in') return false;
    if (query.trim()) {
      const q = query.toLowerCase();
      return t.name.toLowerCase().includes(q) || t.tagline.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
        <div className="segmented self-start">
          {(
            [
              { id: 'all', label: `All · ${scoped.length}` },
              { id: 'mine', label: 'Your photos' },
              { id: 'built_in', label: 'Built-in' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              aria-pressed={filter === tab.id}
              onClick={() => setFilter(tab.id)}
              className={`segmented-item ${filter === tab.id ? 'is-active' : ''}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-56">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-[var(--color-text-disabled)]" />
            <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search styles" className="field pl-9" />
          </div>
          <button type="button" onClick={onOpenNewStyle} className="btn btn-primary shrink-0">
            <Plus className="h-4 w-4" />
            Add a curtain style
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="brand-card flex flex-col items-start gap-3 px-6 py-12">
          <p className="eyebrow-label">No matches</p>
          <h3 className="font-display text-[18px] font-semibold">No curtain styles here yet</h3>
          <p className="max-w-md text-[14px] text-[var(--color-text-secondary)]">
            Try another filter, or upload a photo of a curtain to create your own style.
          </p>
          <button type="button" onClick={onOpenNewStyle} className="btn btn-secondary">Upload a curtain photo</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((t) => (
            <StyleCard
              key={t.id}
              template={t}
              badge={styleOriginBadge(t, currentBrandId)}
              actionLabel="Design with this style"
              onSelect={(picked) => {
                selectTemplate(picked.id, brandTemplates);
                setActiveView('editor');
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};
