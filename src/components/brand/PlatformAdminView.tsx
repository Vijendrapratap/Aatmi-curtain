// src/components/brand/PlatformAdminView.tsx
import React from 'react';
import { useBrandStore } from '../../lib/brandStore';
import {
  ShieldAlert,
  Building2,
  CheckCircle,
  XCircle,
  TrendingUp,
  Cpu,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export const PlatformAdminView: React.FC = () => {
  const { brands, updateBrand, modelConfigs } = useBrandStore();

  const handleApproveBrand = async (brandId: string) => {
    await updateBrand(brandId, {
      status: 'active',
      activated_at: new Date().toISOString(),
      onboarding_step: 5,
    });
  };

  const handleSuspendBrand = async (brandId: string) => {
    await updateBrand(brandId, {
      status: 'suspended',
    });
  };

  const totalRenders = Object.values(modelConfigs).reduce(
    (acc, c) => acc + (c.monthly_generations_used || 0),
    0
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="eyebrow-label text-purple-700 font-semibold flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>PRATAP AI OPS PLATFORM GOVERNANCE</span>
          </div>
          <h1 className="text-2xl font-display font-semibold text-[var(--color-text-primary)]">
            Cross-Brand Operations &amp; Approvals
          </h1>
          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
            Manage multi-tenant brand onboarding approvals, model allow-lists, and aggregate usage.
          </p>
        </div>
      </div>

      {/* Cross-Brand Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="brand-card p-5 space-y-2">
          <span className="eyebrow-label text-[var(--color-text-secondary)]">Total Onboarded Brands</span>
          <div className="text-2xl font-display font-semibold text-[var(--color-text-primary)]">
            {brands.length}
          </div>
          <div className="text-xs text-[var(--color-text-secondary)]">
            {brands.filter((b) => b.status === 'active').length} Active •{' '}
            {brands.filter((b) => b.status === 'pending_review').length} Pending Review
          </div>
        </div>

        <div className="brand-card p-5 space-y-2">
          <span className="eyebrow-label text-[var(--color-text-secondary)]">Platform-Wide Generations</span>
          <div className="text-2xl font-display font-semibold text-[var(--color-text-primary)]">
            {totalRenders} renders
          </div>
          <div className="text-xs text-[var(--color-text-secondary)]">
            Across FLUX.1 Kontext and Nano Banana Pro gateways
          </div>
        </div>

        <div className="brand-card p-5 space-y-2">
          <span className="eyebrow-label text-[var(--color-text-secondary)]">Primary Model Distribution</span>
          <div className="text-xs space-y-1 pt-1 font-mono">
            <div className="flex justify-between">
              <span>FLUX.1 Kontext:</span>
              <span className="font-semibold text-emerald-700">85% share</span>
            </div>
            <div className="flex justify-between">
              <span>Nano Banana Pro:</span>
              <span className="font-semibold text-indigo-700">92% share</span>
            </div>
          </div>
        </div>
      </div>

      {/* Brand Approval Queue (Section 7, Screen 14) */}
      <div className="brand-card p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border-subtle)]">
          <div>
            <h2 className="text-base font-display font-semibold text-[var(--color-text-primary)]">
              Brand Approval Queue &amp; Directory
            </h2>
            <p className="text-xs text-[var(--color-text-secondary)]">
              Review new atelier signups and control tenant status.
            </p>
          </div>
          <span className="text-xs font-mono text-[var(--color-text-secondary)]">
            {brands.length} Tenants Listed
          </span>
        </div>

        <div className="divide-y divide-[var(--color-border-subtle)]">
          {brands.map((b) => {
            const isPending = b.status === 'pending_review';
            const isActive = b.status === 'active';
            const isSuspended = b.status === 'suspended';

            return (
              <div
                key={b.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-xs text-xs shrink-0"
                    style={{ backgroundColor: b.theme_accent_color }}
                  >
                    {b.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold font-display text-[var(--color-text-primary)]">
                        {b.name}
                      </span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold ${
                          isActive
                            ? 'bg-emerald-100 text-emerald-800'
                            : isPending
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {b.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                      Contact: {b.primary_contact_name} ({b.primary_contact_email}) • Slug: {b.slug}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {isPending && (
                    <button
                      type="button"
                      onClick={() => handleApproveBrand(b.id)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Approve Brand</span>
                    </button>
                  )}

                  {isActive && (
                    <button
                      type="button"
                      onClick={() => handleSuspendBrand(b.id)}
                      className="px-3 py-1.5 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Suspend</span>
                    </button>
                  )}

                  {isSuspended && (
                    <button
                      type="button"
                      onClick={() => handleApproveBrand(b.id)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Re-Activate</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
