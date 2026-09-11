// src/components/brand/TemplatesGallery.tsx
import React, { useState } from 'react';
import { useBrandStore } from '../../lib/brandStore';
import { useStudioStore } from '../../lib/store';
import { CurtainTemplate } from '../../types/curtain';
import { Layers, Plus, Filter, ArrowRight, Upload, Sparkles } from 'lucide-react';

interface TemplatesGalleryProps {
  onOpenNewTemplateModal: () => void;
}

export const TemplatesGallery: React.FC<TemplatesGalleryProps> = ({ onOpenNewTemplateModal }) => {
  const { brandTemplates, currentBrandId, setActiveView } = useBrandStore();
  const { selectTemplate } = useStudioStore();

  const [filter, setFilter] = useState<'all' | 'my_uploads' | 'stencils'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Scoped templates: current brand or platform stencils (brand_id === null)
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-in fade-in duration-200">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="eyebrow-label text-[var(--color-accent)] font-semibold">
            ARCHITECTURAL SILHOUETTES
          </div>
          <h1 className="text-2xl font-display font-semibold text-[var(--color-text-primary)]">
            Curtain Templates &amp; Stencils
          </h1>
          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
            Select a base template to assign custom fabrics to zones or upload a real customer room photo.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenNewTemplateModal}
          className="px-4 py-2.5 rounded-[var(--radius-button)] bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white text-xs font-semibold flex items-center gap-2 transition tactile-press cursor-pointer shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Template</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-2 bg-[var(--color-bg-sunken)] rounded-2xl border border-[var(--color-border-subtle)]">
        <div className="flex items-center gap-1 w-full sm:w-auto">
          {[
            { id: 'all', label: `All Silhouettes (${scopedTemplates.length})` },
            { id: 'my_uploads', label: 'Your Uploads' },
            { id: 'stencils', label: 'Platform Stencils' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                filter === tab.id
                  ? 'bg-white text-[var(--color-text-primary)] font-semibold shadow-2xs'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="w-full sm:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search templates..."
            className="w-full h-8 px-3 text-xs rounded-xl bg-white border border-[var(--color-border-strong)] text-[var(--color-text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
          />
        </div>
      </div>

      {/* Grid of Templates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((tpl) => {
          const isMyUpload = tpl.brand_id === currentBrandId && tpl.source === 'user_upload';
          return (
            <div
              key={tpl.id}
              onClick={() => handleSelectTemplate(tpl)}
              className="brand-card overflow-hidden hover:translate-y-[-2px] transition cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="w-full aspect-[4/5] bg-neutral-100 relative overflow-hidden">
                  <img
                    src={tpl.real_photo_url || tpl.original_image_url}
                    alt={tpl.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  {/* Tag Pill: Your upload vs Stencil (Section 5) */}
                  <div className="absolute top-3 left-3">
                    <span
                      className={`text-[10px] font-mono font-semibold px-2.5 py-1 rounded-full shadow-xs ${
                        isMyUpload
                          ? 'bg-[var(--color-accent)] text-white'
                          : 'bg-white/90 backdrop-blur-xs text-[var(--color-text-primary)] border border-[var(--color-border-subtle)]'
                      }`}
                    >
                      {isMyUpload ? 'Your upload' : 'Stencil'}
                    </span>
                  </div>

                  <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-[10px] font-mono text-white">
                    {tpl.regions.length} ZONES
                  </div>
                </div>

                <div className="p-4">
                  <div className="text-[11px] font-mono text-[var(--color-text-secondary)]">
                    {tpl.style_code} • {tpl.metadata.pinch_style}
                  </div>
                  <h3 className="text-sm font-display font-semibold text-[var(--color-text-primary)] mt-0.5 truncate group-hover:text-[var(--color-accent)] transition">
                    {tpl.name}
                  </h3>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-1 line-clamp-2 leading-relaxed">
                    {tpl.description}
                  </p>
                </div>
              </div>

              <div className="px-4 pb-4 pt-2 border-t border-[var(--color-border-subtle)] flex items-center justify-between text-xs">
                <span className="text-[11px] text-[var(--color-text-secondary)]">
                  {tpl.regions.map((r) => r.display_name).slice(0, 2).join(', ')}...
                </span>
                <span className="font-semibold text-[var(--color-accent)] flex items-center gap-1 group-hover:translate-x-1 transition">
                  Open Studio <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
