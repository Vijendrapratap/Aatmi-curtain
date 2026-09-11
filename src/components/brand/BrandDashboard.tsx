// src/components/brand/BrandDashboard.tsx
import React from 'react';
import { useBrandStore } from '../../lib/brandStore';
import {
  Sparkles,
  Layers,
  Palette,
  FolderKanban,
  ArrowRight,
  TrendingUp,
  Cpu,
  ShieldCheck,
  Plus,
  Eye,
  SlidersHorizontal,
} from 'lucide-react';

interface BrandDashboardProps {
  onOpenNewTemplate: () => void;
  onOpenBulkUpload: () => void;
}

export const BrandDashboard: React.FC<BrandDashboardProps> = ({
  onOpenNewTemplate,
  onOpenBulkUpload,
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

  // Scoped templates count
  const myTemplates = brandTemplates.filter(
    (t) => t.brand_id === currentBrand.id || !t.brand_id
  );
  // Scoped fabrics count
  const myFabrics = brandFabrics.filter(
    (f) => f.brand_id === currentBrand.id || !f.brand_id
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Hero Welcome Banner */}
      <div className="brand-card p-6 sm:p-8 bg-gradient-to-r from-[var(--color-bg-surface)] via-white to-[var(--color-accent-tint)] flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: currentBrand.theme_accent_color }}
            />
            <span className="eyebrow-label text-[var(--color-accent)] font-semibold">
              {currentBrand.name} Atelier Workspace
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-semibold text-[var(--color-text-primary)]">
            Welcome back, {currentUser?.name?.split(' ')[0] || 'Designer'}
          </h1>
          <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
            Create multi-region drapery specs, swap luxury fabrics with FLUX.1 Kontext inpainting, and visualize finished curtains in authentic rooms with Nano Banana Pro.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setActiveView('editor')}
            className="px-5 py-2.5 rounded-[var(--radius-button)] bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white text-xs font-semibold flex items-center gap-2 transition tactile-press cursor-pointer shadow-sm"
          >
            <Sparkles className="w-4 h-4" />
            <span>Open Studio Editor</span>
          </button>
          <button
            type="button"
            onClick={onOpenNewTemplate}
            className="px-4 py-2.5 rounded-[var(--radius-button)] bg-white hover:bg-[var(--color-bg-sunken)] border border-[var(--color-border-strong)] text-xs font-semibold text-[var(--color-text-primary)] flex items-center gap-2 transition tactile-press cursor-pointer shadow-2xs"
          >
            <Plus className="w-4 h-4 text-[var(--color-accent)]" />
            <span>+ Add Template</span>
          </button>
        </div>
      </div>

      {/* Overview Stat Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Monthly Generation Cap Meter */}
        <div className="brand-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="eyebrow-label text-[var(--color-text-secondary)]">AI Generation Usage</span>
            <TrendingUp className="w-4 h-4 text-[var(--color-accent)]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-display font-semibold text-[var(--color-text-primary)]">
              {used}
            </span>
            <span className="text-xs font-mono text-[var(--color-text-secondary)]">
              / {cap} monthly renders
            </span>
          </div>
          <div>
            <div className="w-full h-2 bg-[var(--color-bg-sunken)] rounded-full overflow-hidden">
              <div
                className="h-full bg-[var(--color-accent)] rounded-full transition-all duration-500"
                style={{ width: `${percentUsed}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-[var(--color-text-secondary)] mt-1 font-mono">
              <span>{percentUsed}% capacity</span>
              <span>{cap - used} remaining</span>
            </div>
          </div>
        </div>

        {/* Configured AI Models */}
        <div className="brand-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="eyebrow-label text-[var(--color-text-secondary)]">Active AI Models</span>
            <Cpu className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[var(--color-text-secondary)]">Region Swaps:</span>
              <span className="font-mono font-semibold text-[11px] text-[var(--color-text-primary)]">
                FLUX.1 Kontext
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[var(--color-text-secondary)]">Room Preview:</span>
              <span className="font-mono font-semibold text-[11px] text-[var(--color-text-primary)]">
                Nano Banana Pro
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setActiveView('settings_models')}
            className="text-[11px] font-semibold text-[var(--color-accent)] hover:underline flex items-center gap-1 cursor-pointer pt-1"
          >
            <span>Switch models</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Templates Count */}
        <div className="brand-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="eyebrow-label text-[var(--color-text-secondary)]">Available Templates</span>
            <Layers className="w-4 h-4 text-[var(--color-text-secondary)]" />
          </div>
          <div className="text-2xl font-display font-semibold text-[var(--color-text-primary)]">
            {myTemplates.length}
          </div>
          <div className="text-xs text-[var(--color-text-secondary)] flex items-center justify-between">
            <span>Stencils &amp; Real Uploads</span>
            <button
              type="button"
              onClick={() => setActiveView('templates')}
              className="text-[11px] font-semibold text-[var(--color-accent)] hover:underline"
            >
              Browse →
            </button>
          </div>
        </div>

        {/* Fabric Swatches */}
        <div className="brand-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="eyebrow-label text-[var(--color-text-secondary)]">Catalog Fabrics</span>
            <Palette className="w-4 h-4 text-[var(--color-text-secondary)]" />
          </div>
          <div className="text-2xl font-display font-semibold text-[var(--color-text-primary)]">
            {myFabrics.length}
          </div>
          <div className="text-xs text-[var(--color-text-secondary)] flex items-center justify-between">
            <span>Velvets, Silks &amp; Linens</span>
            <button
              type="button"
              onClick={() => setActiveView('catalog')}
              className="text-[11px] font-semibold text-[var(--color-accent)] hover:underline"
            >
              Manage →
            </button>
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          onClick={() => setActiveView('templates')}
          className="brand-card p-6 flex flex-col justify-between hover:translate-y-[-2px] transition cursor-pointer group"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-[var(--color-accent-tint)] text-[var(--color-accent)] flex items-center justify-center mb-4">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-base font-display font-semibold group-hover:text-[var(--color-accent)] transition">
              1. Templates Gallery
            </h3>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1.5 leading-relaxed">
              Explore your brand uploads and shared architectural stencils (chevron, color-block, and wave headers).
            </p>
          </div>
          <span className="text-xs font-semibold text-[var(--color-accent)] mt-4 inline-flex items-center gap-1">
            Open Gallery <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>

        <div
          onClick={() => setActiveView('editor')}
          className="brand-card p-6 flex flex-col justify-between hover:translate-y-[-2px] transition cursor-pointer group"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-[var(--color-bg-sunken)] text-[var(--color-text-primary)] flex items-center justify-center mb-4">
              <Sparkles className="w-5 h-5 text-[var(--color-accent)]" />
            </div>
            <h3 className="text-base font-display font-semibold group-hover:text-[var(--color-accent)] transition">
              2. Per-Region Studio Editor
            </h3>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1.5 leading-relaxed">
              Tap curtain zones with pulsing AI highlight, swap fabrics with real-time tactile previews, and run inpainting.
            </p>
          </div>
          <span className="text-xs font-semibold text-[var(--color-accent)] mt-4 inline-flex items-center gap-1">
            Start Designing <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>

        <div
          onClick={() => setActiveView('catalog')}
          className="brand-card p-6 flex flex-col justify-between hover:translate-y-[-2px] transition cursor-pointer group"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center mb-4">
              <Palette className="w-5 h-5" />
            </div>
            <h3 className="text-base font-display font-semibold group-hover:text-amber-800 transition">
              3. Fabric Catalog &amp; Bulk Swatches
            </h3>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1.5 leading-relaxed">
              Browse brand textiles, capture swatches via camera with perspective correction, or bulk upload physical books.
            </p>
          </div>
          <span className="text-xs font-semibold text-amber-800 mt-4 inline-flex items-center gap-1">
            Manage Catalog <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>

      {/* Recent Finalized Designs & Lifestyle Rooms */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-display font-semibold text-[var(--color-text-primary)]">
              Recent Saved Designs
            </h2>
            <p className="text-xs text-[var(--color-text-secondary)]">
              Click any design to view high-res curtain specs or test in authentic room settings.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActiveView('design_detail')}
            className="text-xs font-semibold text-[var(--color-accent)] hover:underline flex items-center gap-1"
          >
            <span>View All ({designs.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {designs.map((d) => (
            <div
              key={d.id}
              onClick={() => {
                setActiveDesignId(d.id);
                setActiveView('design_detail');
              }}
              className="brand-card overflow-hidden hover:translate-y-[-2px] transition cursor-pointer group flex flex-col"
            >
              <div className="w-full aspect-[4/3] bg-neutral-100 relative overflow-hidden">
                <img
                  src={d.final_image_url}
                  alt={d.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-[10px] font-mono text-white">
                  {d.assignments.length} ZONES
                </div>
                {d.room_previews && d.room_previews.length > 0 && (
                  <div className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-full bg-[var(--color-accent)] text-white text-[10px] font-medium shadow-xs">
                    {d.room_previews.length} Room Render{d.room_previews.length > 1 ? 's' : ''}
                  </div>
                )}
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="text-xs font-mono text-[var(--color-text-secondary)]">
                    {d.template_name}
                  </div>
                  <h3 className="text-sm font-display font-semibold text-[var(--color-text-primary)] mt-0.5 truncate">
                    {d.name}
                  </h3>
                </div>
                <div className="flex items-center justify-between pt-3 mt-3 border-t border-[var(--color-border-subtle)] text-[11px] text-[var(--color-text-secondary)]">
                  <span>{new Date(d.created_at).toLocaleDateString()}</span>
                  <span className="font-semibold text-[var(--color-accent)] flex items-center gap-1 group-hover:translate-x-1 transition">
                    Open Design <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
