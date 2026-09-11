// src/components/brand/TemplatesGallery.tsx
import React, { useState } from 'react';
import { useBrandStore } from '../../lib/brandStore';
import { useStudioStore } from '../../lib/store';
import { CurtainTemplate } from '../../types/curtain';
import { Plus, Search } from 'lucide-react';

interface TemplatesGalleryProps {
  onOpenNewTemplateModal: () => void;
}

export const TemplatesGallery: React.FC<TemplatesGalleryProps> = ({ onOpenNewTemplateModal }) => {
  const { brandTemplates, currentBrandId, setActiveView } = useBrandStore();
  const { selectTemplate } = useStudioStore();

  const [filter, setFilter] = useState<'all' | 'my_uploads' | 'stencils'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const scopedTemplates = brandTemplates.filter(
    (t) => t.brand_id === currentBrandId || !t.brand_id
  );

  const filteredTemplates = scopedTemplates.filter((t) => {
    const isUpload = t.brand_id === currentBrandId && t.source === 'user_upload';
    const isStencil = !t.brand_id || t.source === 'catalog' || t.source === 'stencil_builder';

    if (filter === 'my_uploads' && !isUpload) return false;
    if (filter === 'stencils' && !isStencil) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        t.name.toLowerCase().includes(q) ||
        t.style_code.toLowerCase().includes(q) ||
        t.tagline.toLowerCase().includes(q)
      );
    }

    return true;
  });

  const handleSelectTemplate = (tpl: CurtainTemplate) => {
    selectTemplate(tpl.id);
    setActiveView('editor');
  };

  return (
    <div className="page-shell space-y-7">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow-label">Silhouettes</p>
          <h1 className="page-title">Templates</h1>
          <p className="page-lede">
            Choose a drape architecture, then assign fabrics to each zone in the studio.
          </p>
        </div>
        <button type="button" onClick={onOpenNewTemplateModal} className="btn btn-primary self-start">
          <Plus className="h-4 w-4" />
          Add template
        </button>
      </div>

      <div className="flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
        <div className="segmented self-start">
          {(
            [
              { id: 'all', label: `All · ${scopedTemplates.length}` },
              { id: 'my_uploads', label: 'Uploads' },
              { id: 'stencils', label: 'Stencils' },
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

        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-[var(--color-text-disabled)]" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search templates"
            className="field pl-9"
          />
        </div>
      </div>

      {filteredTemplates.length === 0 ? (
        <div className="brand-card flex flex-col items-start gap-3 px-6 py-12">
          <p className="eyebrow-label">No matches</p>
          <h3 className="font-display text-[18px] font-semibold">Nothing in this collection</h3>
          <p className="max-w-md text-[14px] text-[var(--color-text-secondary)]">
            Try another filter, or upload a showroom photograph as a new template.
          </p>
          <button type="button" onClick={onOpenNewTemplateModal} className="btn btn-secondary">
            Upload a template
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map((tpl) => {
            const isMyUpload = tpl.brand_id === currentBrandId && tpl.source === 'user_upload';
            const zonePreview = tpl.regions
              .map((r) => r.display_name)
              .slice(0, 2)
              .join(', ');
            return (
              <button
                key={tpl.id}
                type="button"
                onClick={() => handleSelectTemplate(tpl)}
                className="brand-card brand-card-interactive flex flex-col overflow-hidden text-left"
              >
                <div className="media-frame aspect-[4/5]">
                  <img
                    src={tpl.real_photo_url || tpl.original_image_url}
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <span className={isMyUpload ? 'badge badge-accent' : 'badge badge-muted'}>
                      {isMyUpload ? 'Upload' : 'Stencil'}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className="badge badge-muted">{tpl.regions.length} zones</span>
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-4">
                  <div className="font-mono text-[11px] text-[var(--color-text-tertiary)]">
                    {tpl.style_code} · {tpl.metadata.pinch_style}
                  </div>
                  <h3 className="mt-1 truncate font-display text-[16px] font-semibold">{tpl.name}</h3>
                  <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-[var(--color-text-secondary)]">
                    {tpl.description}
                  </p>
                  <div className="mt-4 flex items-center justify-between border-t border-[var(--color-border-subtle)] pt-3 text-[12px]">
                    <span className="truncate text-[var(--color-text-tertiary)]">{zonePreview}</span>
                    <span className="font-semibold text-[var(--color-accent)]">Open studio</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
