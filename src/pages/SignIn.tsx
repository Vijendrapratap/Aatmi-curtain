// src/pages/SignIn.tsx
import React, { useState } from 'react';
import { useBrandStore } from '../lib/brandStore';
import { ArrowRight, Building2 } from 'lucide-react';

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

  const handleQuickLogin = (user: (typeof demoUsers)[0]) => {
    setCurrentUser(user);
    setCurrentBrand(user.brand_id);
    onSuccess();
  };

  const roleLabel = (role: string) =>
    role === 'platform_admin' ? 'Ops' : role === 'brand_admin' ? 'Admin' : 'Staff';

  return (
    <div className="flex min-h-dvh w-full flex-col bg-[var(--color-bg-base)] text-[var(--color-text-primary)] lg:flex-row">
      <div className="relative flex min-h-[280px] flex-col justify-between overflow-hidden bg-[#1A1814] p-8 text-white lg:min-h-dvh lg:w-[44%] lg:p-14">
        <img
          src="/templates/tpl-ivory-gold-border.png"
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-45"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A1814] via-[#1A1814]/72 to-[#1A1814]/35" />

        <div className="relative z-10">
          <div className="mb-12 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-premium)] font-display text-[13px] font-semibold text-[#1A1814]">
              Aa
            </div>
            <span className="font-display text-[22px] font-semibold tracking-tight">Aatmi</span>
          </div>
          <p className="eyebrow-label mb-4">Couture drapery studio</p>
          <h1 className="max-w-md font-display text-[2rem] leading-[1.15] font-semibold tracking-tight lg:text-[2.35rem]">
            See the fabric on the window before it is cut.
          </h1>
          <p className="mt-4 max-w-md text-[14px] leading-relaxed text-white/70">
            Zone-accurate fabric mapping, tactile weave inspection, and real-room staging for ateliers and interior houses.
          </p>
        </div>

        <div className="relative z-10 hidden max-w-md space-y-3 pt-10 lg:block">
          {[
            ['Zone mapping', 'Assign velvets, linens, and borders to each panel without flattening the pleats.'],
            ['Room staging', 'Mount the finished curtain on the customer’s actual window photograph.'],
            ['Private ateliers', 'Every swatch, template, and render stays inside the brand workspace.'],
          ].map(([title, body]) => (
            <div key={title} className="border-l border-[var(--color-premium)]/70 pl-3">
              <div className="text-[13px] font-semibold">{title}</div>
              <div className="mt-0.5 text-[12px] leading-relaxed text-white/60">{body}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center p-6 sm:p-12 lg:p-16">
        <div className="w-full max-w-[420px]">
          <div className="mb-8">
            <h2 className="font-display text-[1.65rem] font-semibold tracking-tight">Sign in</h2>
            <p className="page-lede">Use a test persona or enter workspace credentials.</p>
          </div>

          <div className="mb-7 rounded-[16px] bg-[var(--color-bg-sunken)] p-3">
            <div className="mb-2 flex items-center justify-between px-1">
              <span className="text-[11px] font-semibold tracking-wide text-[var(--color-text-tertiary)] uppercase">
                Personas
              </span>
            </div>
            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
              {demoUsers.map((user) => {
                const brand = brands.find((b) => b.id === user.brand_id);
                return (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => handleQuickLogin(user)}
                    className="rounded-[12px] bg-[var(--color-bg-surface)] px-3 py-2.5 text-left shadow-[var(--shadow-ring)] transition-colors hover:bg-[var(--color-accent-tint)]"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-[13px] font-semibold">{user.name}</span>
                      <span className="badge badge-brass">{roleLabel(user.role)}</span>
                    </div>
                    <span className="mt-0.5 block truncate text-[11px] text-[var(--color-text-tertiary)]">
                      {brand?.name || 'Cross-brand'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <form onSubmit={handleManualSignIn} className="space-y-4">
            <div>
              <label className="field-label" htmlFor="signin-brand">
                Workspace
              </label>
              <select
                id="signin-brand"
                value={selectedBrandId}
                onChange={(e) => setSelectedBrandId(e.target.value)}
                className="field"
              >
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="field-label" htmlFor="signin-email">
                Work email
              </label>
              <input
                id="signin-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="field"
                placeholder="designer@yourbrand.com"
              />
            </div>
            <div>
              <label className="field-label" htmlFor="signin-password">
                Password
              </label>
              <input
                id="signin-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="field"
              />
            </div>
            <button type="submit" className="btn btn-primary btn-block h-11">
              Enter workspace
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-8 border-t border-[var(--color-border-subtle)] pt-6 text-center">
            <p className="mb-3 text-[13px] text-[var(--color-text-secondary)]">
              Represent a new drapery house?
            </p>
            <button type="button" onClick={onStartOnboarding} className="btn btn-secondary btn-block h-11">
              <Building2 className="h-4 w-4" />
              Start brand onboarding
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
