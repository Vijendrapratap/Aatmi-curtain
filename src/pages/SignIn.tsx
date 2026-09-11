// src/pages/SignIn.tsx
import React, { useState } from 'react';
import { useBrandStore } from '../lib/brandStore';
import { ShieldCheck, ArrowRight, Sparkles, Building2, User, Key, CheckCircle2 } from 'lucide-react';

interface SignInProps {
  onStartOnboarding: () => void;
  onSuccess: () => void;
}

export const SignIn: React.FC<SignInProps> = ({ onStartOnboarding, onSuccess }) => {
  const { brands, demoUsers, setCurrentBrand, setCurrentUser } = useBrandStore();
  const [email, setEmail] = useState('elena@aatmi.design');
  const [password, setPassword] = useState('••••••••••••');
  const [selectedBrandId, setSelectedBrandId] = useState('brand-aatmi-01');

  const handleManualSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    const matchedUser = demoUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (matchedUser) {
      setCurrentUser(matchedUser);
      setCurrentBrand(matchedUser.brand_id);
    } else {
      // Fallback staff user for selected brand
      const fallbackUser = {
        id: 'usr-custom-' + Date.now(),
        brand_id: selectedBrandId,
        name: email.split('@')[0],
        email,
        role: 'brand_admin' as const,
        created_at: new Date().toISOString(),
      };
      setCurrentUser(fallbackUser);
      setCurrentBrand(selectedBrandId);
    }
    onSuccess();
  };

  const handleQuickLogin = (user: typeof demoUsers[0]) => {
    setCurrentUser(user);
    setCurrentBrand(user.brand_id);
    onSuccess();
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[var(--color-bg-base)] text-[var(--color-text-primary)]">
      {/* Left Brand Panel: 45% */}
      <div className="lg:w-[45%] p-8 lg:p-14 flex flex-col justify-between bg-gradient-to-br from-[#16171B] via-[#1E1F26] to-[#121316] text-white relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[var(--color-accent)] opacity-25 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-[#38D9C9] opacity-15 blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-9 h-9 rounded-xl bg-[var(--color-accent)] flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-semibold text-2xl tracking-tight text-white">AATMI</span>
          </div>

          <div className="eyebrow-label text-[var(--color-premium)] mb-3">Multi-Tenant Brand Platform</div>
          <h1 className="text-3xl lg:text-4xl font-display font-semibold text-white leading-tight mb-4">
            Couture drapery, visualized in seconds.
          </h1>
          <p className="text-sm text-[#A0A3AB] leading-relaxed max-w-md mb-8">
            The next-generation CAD and visual AI platform for luxury drapery houses, interior studios, and bespoke window treatment brands.
          </p>

          <div className="space-y-4 max-w-md">
            <div className="p-3.5 rounded-xl bg-white/5 border-l-2 border-[var(--color-accent)] backdrop-blur-xs">
              <div className="text-xs font-semibold text-white">Multi-region AI templates</div>
              <div className="text-[11px] text-[#A0A3AB] mt-0.5">
                Targeted inpainting with pixel-locked fold preservation and clean sewn seams.
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white/5 border-l-2 border-[#38D9C9] backdrop-blur-xs">
              <div className="text-xs font-semibold text-white">Model Selection per Task</div>
              <div className="text-[11px] text-[#A0A3AB] mt-0.5">
                FLUX.1 Kontext for precision region swaps &amp; Nano Banana Pro for lifestyle room previews.
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white/5 border-l-2 border-[var(--color-premium)] backdrop-blur-xs">
              <div className="text-xs font-semibold text-white">Strict Tenant Isolation</div>
              <div className="text-[11px] text-[#A0A3AB] mt-0.5">
                Every template, fabric swatch, and finished room render stays private to your brand.
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 pt-10 border-t border-white/10 flex items-center justify-between text-xs text-[#80838C]">
          <span>© 2026 Aatmi Brand Platform</span>
          <span className="font-mono text-[10px] text-[var(--color-premium)]">v2.5 Enterprise</span>
        </div>
      </div>

      {/* Right Login / Persona Panel: 55% */}
      <div className="lg:w-[55%] flex-1 p-6 sm:p-12 lg:p-16 flex flex-col justify-center items-center">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-display font-semibold text-[var(--color-text-primary)]">
              Sign in to your brand workspace
            </h2>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">
              Select your brand and role or sign in with credentials.
            </p>
          </div>

          {/* Quick Persona Switchers */}
          <div className="mb-6 p-4 rounded-2xl bg-[var(--color-bg-sunken)] border border-[var(--color-border-subtle)]">
            <div className="eyebrow-label mb-2 text-[var(--color-text-secondary)] flex items-center justify-between">
              <span>Quick Test Personas</span>
              <span className="text-[10px] font-mono text-[var(--color-accent)] font-semibold">1-Click Sign In</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {demoUsers.map((user) => {
                const brand = brands.find((b) => b.id === user.brand_id);
                return (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => handleQuickLogin(user)}
                    className="p-2.5 rounded-xl bg-[var(--color-bg-surface)] hover:bg-[var(--color-accent-tint)] border border-[var(--color-border-subtle)] hover:border-[var(--color-accent)] text-left transition tactile-press flex flex-col cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[var(--color-text-primary)] truncate">
                        {user.name}
                      </span>
                      <span
                        className={`text-[9px] font-mono font-medium px-1.5 py-0.5 rounded-full ${
                          user.role === 'platform_admin'
                            ? 'bg-purple-100 text-purple-700'
                            : user.role === 'brand_admin'
                            ? 'bg-indigo-100 text-indigo-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {user.role === 'platform_admin'
                          ? 'Platform Ops'
                          : user.role === 'brand_admin'
                          ? 'Brand Admin'
                          : 'Brand Staff'}
                      </span>
                    </div>
                    <span className="text-[10px] text-[var(--color-text-secondary)] truncate mt-0.5">
                      {brand?.name || 'Cross-Brand'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleManualSignIn} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-primary)] mb-1.5">
                Brand Workspace
              </label>
              <select
                value={selectedBrandId}
                onChange={(e) => setSelectedBrandId(e.target.value)}
                className="w-full h-10 px-3 text-xs rounded-[var(--radius-input)] bg-[var(--color-bg-surface)] border border-[var(--color-border-strong)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              >
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.slug}.aatmi.design)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--color-text-primary)] mb-1.5">
                Work Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-10 px-3 text-xs rounded-[var(--radius-input)] bg-[var(--color-bg-surface)] border border-[var(--color-border-strong)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                placeholder="designer@yourbrand.com"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--color-text-primary)] mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-10 px-3 text-xs rounded-[var(--radius-input)] bg-[var(--color-bg-surface)] border border-[var(--color-border-strong)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              />
            </div>

            <button
              type="submit"
              className="w-full h-11 rounded-[var(--radius-button)] bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white text-xs font-semibold tracking-wide flex items-center justify-center gap-2 transition tactile-press cursor-pointer shadow-sm"
            >
              <span>Enter Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* New Brand Onboarding Divider */}
          <div className="mt-8 pt-6 border-t border-[var(--color-border-subtle)] text-center">
            <p className="text-xs text-[var(--color-text-secondary)] mb-3">
              Represent a new drapery or textile brand?
            </p>
            <button
              type="button"
              onClick={onStartOnboarding}
              className="w-full h-11 rounded-[var(--radius-button)] bg-[var(--color-bg-surface)] hover:bg-[var(--color-bg-sunken)] border border-[var(--color-border-strong)] text-xs font-semibold text-[var(--color-text-primary)] flex items-center justify-center gap-2 transition tactile-press cursor-pointer"
            >
              <Building2 className="w-4 h-4 text-[var(--color-accent)]" />
              <span>Start Brand Onboarding (5-Step Wizard)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
