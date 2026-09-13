// src/components/brand/BrandDashboard.tsx
import React, { useState } from 'react';
import { ArrowRight, Plus, Sparkles } from 'lucide-react';
import { useBrandStore } from '../../lib/brandStore';
import { deriveJourney } from '../../lib/journey';

interface BrandDashboardProps {
  onOpenNewStyle: () => void;
}

export const BrandDashboard: React.FC<BrandDashboardProps> = ({ onOpenNewStyle }) => {
  const { brands, currentBrandId, currentUser, getModelConfig, designs, brandTemplates, brandFabrics, setActiveView, setActiveDesignId } = useBrandStore();

  const brand = brands.find((b) => b.id === currentBrandId) || brands[0];
  const config = getModelConfig(brand.id);
  const cap = config.monthly_generation_cap || 200;
  const used = config.monthly_generations_used || 0;
  const styles = brandTemplates.filter((t) => t.brand_id === brand.id || !t.brand_id);
  const fabrics = brandFabrics.filter((f) => f.brand_id === brand.id || !f.brand_id);
  const myDesigns = designs.filter((d) => d.brand_id === brand.id);
  const latest = myDesigns[0];
  const firstName = currentUser?.name?.split(' ')[0] || 'there';

  const latestSteps = latest
    ? deriveJourney({ page: 'design', zoneCount: latest.assignments.length, assignedCount: latest.assignments.length, hasPhotoreal: latest.render_kind === 'photoreal', roomPreviewCount: latest.room_previews.length })
    : [];
  const latestNext = latestSteps.find((s) => s.state === 'current');

  const openDesign = (id: string) => {
    setActiveDesignId(id);
    setActiveView('design_detail');
  };

  return (
    <div className="page-shell space-y-8">
      <div className="space-y-2">
        <p className="eyebrow-label">{brand.name}</p>
        <h1 className="page-title">Hello, {firstName}</h1>
        <p className="page-lede">Drop a curtain design, choose fabrics for its areas, and generate the client-ready image.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <button type="button" onClick={() => setActiveView('editor')} className="brand-card brand-card-interactive flex flex-col items-start gap-3 p-6 text-left">
          <span className="icon-tile"><Sparkles className="h-5 w-5" /></span>
          <span className="font-display text-[20px] font-semibold">Start a new design</span>
          <span className="text-[13px] text-[var(--color-text-secondary)]">Upload a curtain design or pick one of {styles.length} saved styles, choose fabrics, generate.</span>
          <span className="mt-auto flex items-center gap-1 text-[13px] font-semibold text-[var(--color-accent)]">Open Generate <ArrowRight className="h-3.5 w-3.5" /></span>
        </button>

        {latest ? (
          <button type="button" onClick={() => openDesign(latest.id)} className="brand-card brand-card-interactive flex gap-4 overflow-hidden p-4 text-left">
            <div className="media-frame h-full w-28 shrink-0 rounded-[12px]"><img src={latest.final_image_url} alt="" className="h-full w-full object-cover" /></div>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="eyebrow-label">Continue</span>
              <span className="mt-1 truncate font-display text-[17px] font-semibold">{latest.name}</span>
              <span className="text-[12px] text-[var(--color-text-tertiary)]">{latest.template_name}</span>
              {latestNext && <span className="mt-2 text-[13px] text-[var(--color-text-secondary)]">Next: <strong className="font-semibold text-[var(--color-text-primary)]">{latestNext.label}</strong> · {latestNext.hint}</span>}
              <span className="mt-auto flex items-center gap-1 pt-2 text-[13px] font-semibold text-[var(--color-accent)]">Open design <ArrowRight className="h-3.5 w-3.5" /></span>
            </div>
          </button>
        ) : (
          <div className="brand-card flex flex-col items-start gap-3 p-6">
            <span className="eyebrow-label">Continue</span>
            <span className="font-display text-[18px] font-semibold">No designs yet</span>
            <span className="text-[13px] text-[var(--color-text-secondary)]">Your saved designs will show up here with what to do next.</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-px overflow-hidden rounded-[16px] bg-[var(--color-border-subtle)] shadow-[var(--shadow-card)]">
        <div className="bg-[var(--color-bg-surface)] px-5 py-4" title="Renders and room stagings used this month">
          <div className="text-[11px] font-medium tracking-wide text-[var(--color-text-tertiary)] uppercase">Renders this month</div>
          <div className="mt-1 flex items-baseline gap-1.5"><span className="font-display text-[22px] font-semibold tabular-nums">{used}</span><span className="text-[12px] text-[var(--color-text-tertiary)]">/ {cap}</span></div>
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-[var(--color-bg-sunken)]"><div className="h-full rounded-full bg-[var(--color-accent)]" style={{ width: `${Math.min(100, Math.round((used / cap) * 100))}%` }} /></div>
        </div>
        <button type="button" onClick={() => setActiveView('library_styles')} className="bg-[var(--color-bg-surface)] px-5 py-4 text-left hover:bg-[var(--color-bg-sunken)]">
          <div className="text-[11px] font-medium tracking-wide text-[var(--color-text-tertiary)] uppercase">Curtain styles</div>
          <div className="mt-1 font-display text-[22px] font-semibold tabular-nums">{styles.length}</div>
          <div className="mt-2 text-[12px] text-[var(--color-accent)]">Browse styles</div>
        </button>
        <button type="button" onClick={() => setActiveView('library_fabrics')} className="bg-[var(--color-bg-surface)] px-5 py-4 text-left hover:bg-[var(--color-bg-sunken)]">
          <div className="text-[11px] font-medium tracking-wide text-[var(--color-text-tertiary)] uppercase">Fabrics</div>
          <div className="mt-1 font-display text-[22px] font-semibold tabular-nums">{fabrics.length}</div>
          <div className="mt-2 text-[12px] text-[var(--color-accent)]">Browse fabrics</div>
        </button>
      </div>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-[20px] font-semibold tracking-tight">Your designs</h2>
            <p className="mt-1 text-[13px] text-[var(--color-text-secondary)]">Open one to render, stage it in a room, or share.</p>
          </div>
          <button type="button" onClick={onOpenNewStyle} className="btn btn-ghost btn-sm"><Plus className="h-3.5 w-3.5" /> Add a curtain style</button>
        </div>
        {myDesigns.length === 0 ? (
          <div className="brand-card px-6 py-10 text-[14px] text-[var(--color-text-secondary)]">Start a new design above. It will appear here once saved.</div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {myDesigns.map((d) => (
              <button key={d.id} type="button" onClick={() => openDesign(d.id)} className="brand-card brand-card-interactive overflow-hidden text-left">
                <div className="media-frame aspect-[4/5]">
                  <img src={d.final_image_url} alt="" className="h-full w-full object-cover" />
                  <span className="badge badge-muted absolute top-3 left-3">{d.render_kind === 'photoreal' ? 'Rendered' : 'Not rendered'}</span>
                  {d.room_previews.length > 0 && <span className="badge badge-accent absolute top-3 right-3">In room</span>}
                </div>
                <div className="p-4">
                  <div className="text-[11px] text-[var(--color-text-tertiary)]">{d.template_name}</div>
                  <h3 className="mt-0.5 truncate font-display text-[15px] font-semibold">{d.name}</h3>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
