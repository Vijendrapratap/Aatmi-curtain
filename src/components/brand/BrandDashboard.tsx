// src/components/brand/BrandDashboard.tsx
import React from 'react';
import { useBrandStore } from '../../lib/brandStore';
import { ArrowRight, Plus } from 'lucide-react';

interface BrandDashboardProps {
  onOpenNewTemplate: () => void;
  onOpenBulkUpload: () => void;
}

export const BrandDashboard: React.FC<BrandDashboardProps> = ({
  onOpenNewTemplate,
  onOpenBulkUpload: _onOpenBulkUpload,
}) => {
  const {
    brands,
    currentBrandId,
    currentUser,
    getModelConfig,
    designs,
    brandTemplates,
    brandFabrics,
    setActiveView,
    setActiveDesignId,
  } = useBrandStore();

  const currentBrand = brands.find((b) => b.id === currentBrandId) || brands[0];
  const modelConfig = getModelConfig(currentBrand.id);

  const cap = modelConfig.monthly_generation_cap || 200;
  const used = modelConfig.monthly_generations_used || 0;
  const percentUsed = Math.min(100, Math.round((used / cap) * 100));

  const myTemplates = brandTemplates.filter(
    (t) => t.brand_id === currentBrand.id || !t.brand_id
  );
  const myFabrics = brandFabrics.filter(
    (f) => f.brand_id === currentBrand.id || !f.brand_id
  );

  const firstName = currentUser?.name?.split(' ')[0] || 'Designer';

  return (
    <div className="page-shell space-y-10">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div className="max-w-xl space-y-2">
          <p className="eyebrow-label">{currentBrand.name}</p>
          <h1 className="page-title">Welcome back, {firstName}</h1>
          <p className="page-lede">
            Assign fabrics to drapery zones, then stage the finished curtain in a real room.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => setActiveView('editor')} className="btn btn-primary">
            Open studio
          </button>
          <button type="button" onClick={onOpenNewTemplate} className="btn btn-secondary">
            <Plus className="h-4 w-4" />
            Add template
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[16px] bg-[var(--color-border-subtle)] shadow-[var(--shadow-card)] sm:grid-cols-4">
        <div className="bg-[var(--color-bg-surface)] px-5 py-4">
          <div className="text-[11px] font-medium tracking-wide text-[var(--color-text-tertiary)] uppercase">
            Renders
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="font-display text-[22px] font-semibold tabular-nums">{used}</span>
            <span className="text-[12px] text-[var(--color-text-tertiary)] tabular-nums">/ {cap}</span>
          </div>
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-[var(--color-bg-sunken)]">
            <div
              className="h-full rounded-full bg-[var(--color-accent)]"
              style={{ width: `${percentUsed}%` }}
            />
          </div>
        </div>
        <button
          type="button"
          onClick={() => setActiveView('templates')}
          className="bg-[var(--color-bg-surface)] px-5 py-4 text-left transition-colors hover:bg-[var(--color-bg-sunken)]"
        >
          <div className="text-[11px] font-medium tracking-wide text-[var(--color-text-tertiary)] uppercase">
            Templates
          </div>
          <div className="mt-1 font-display text-[22px] font-semibold tabular-nums">{myTemplates.length}</div>
          <div className="mt-2 text-[12px] text-[var(--color-accent)]">Browse</div>
        </button>
        <button
          type="button"
          onClick={() => setActiveView('catalog')}
          className="bg-[var(--color-bg-surface)] px-5 py-4 text-left transition-colors hover:bg-[var(--color-bg-sunken)]"
        >
          <div className="text-[11px] font-medium tracking-wide text-[var(--color-text-tertiary)] uppercase">
            Fabrics
          </div>
          <div className="mt-1 font-display text-[22px] font-semibold tabular-nums">{myFabrics.length}</div>
          <div className="mt-2 text-[12px] text-[var(--color-accent)]">Catalog</div>
        </button>
        <button
          type="button"
          onClick={() => setActiveView('settings_models')}
          className="bg-[var(--color-bg-surface)] px-5 py-4 text-left transition-colors hover:bg-[var(--color-bg-sunken)]"
        >
          <div className="text-[11px] font-medium tracking-wide text-[var(--color-text-tertiary)] uppercase">
            Models
          </div>
          <div className="mt-1 font-display text-[15px] font-semibold leading-snug">FLUX · Banana</div>
          <div className="mt-2 text-[12px] text-[var(--color-accent)]">Configure</div>
        </button>
      </div>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-[20px] font-semibold tracking-tight">Recent designs</h2>
            <p className="mt-1 text-[13px] text-[var(--color-text-secondary)]">
              Open a saved spec to review drapery or stage it in a room.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActiveView('design_detail')}
            className="btn btn-ghost btn-sm"
          >
            View all
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {designs.length === 0 ? (
          <div className="brand-card flex flex-col items-start gap-3 px-6 py-10">
            <p className="eyebrow-label">Empty atelier</p>
            <h3 className="font-display text-[18px] font-semibold">No designs yet</h3>
            <p className="max-w-md text-[14px] text-[var(--color-text-secondary)]">
              Pick a template, assign fabrics to each zone, then save a design for client presentation.
            </p>
            <button type="button" onClick={() => setActiveView('templates')} className="btn btn-primary">
              Choose a template
            </button>
          </div>
        ) : (
          <div
            className={`grid grid-cols-1 gap-5 ${
              designs.length === 1 ? '' : 'sm:grid-cols-2 lg:grid-cols-3'
            }`}
          >
            {designs.map((d, index) => (
              <button
                key={d.id}
                type="button"
                onClick={() => {
                  setActiveDesignId(d.id);
                  setActiveView('design_detail');
                }}
                className={`brand-card brand-card-interactive overflow-hidden text-left ${
                  designs.length === 1 ? 'max-w-xl' : index === 0 ? 'sm:col-span-2 lg:col-span-1' : ''
                }`}
              >
                <div className="media-frame aspect-[4/3]">
                  <img
                    src={d.final_image_url}
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                  <div className="absolute top-3 right-3">
                    <span className="badge badge-muted">{d.assignments.length} zones</span>
                  </div>
                </div>
                <div className="flex items-end justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <div className="text-[11px] text-[var(--color-text-tertiary)]">{d.template_name}</div>
                    <h3 className="mt-0.5 truncate font-display text-[15px] font-semibold">{d.name}</h3>
                  </div>
                  <span className="shrink-0 text-[12px] font-semibold text-[var(--color-accent)]">
                    Open
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
