// src/components/brand/BrandHeader.tsx
import React, { useEffect, useRef, useState } from 'react';
import { useBrandStore } from '../../lib/brandStore';
import {
  Sparkles,
  Layers,
  Palette,
  FolderKanban,
  Settings,
  Shield,
  ChevronDown,
  LogOut,
  Check,
  Building2,
  Menu,
  X,
  LayoutDashboard,
} from 'lucide-react';

interface BrandHeaderProps {
  onSignOut: () => void;
}

export const BrandHeader: React.FC<BrandHeaderProps> = ({ onSignOut }) => {
  const {
    brands,
    currentBrandId,
    setCurrentBrand,
    currentUser,
    activeView,
    setActiveView,
    getModelConfig,
  } = useBrandStore();

  const [isBrandMenuOpen, setIsBrandMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const brandMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const currentBrand = brands.find((b) => b.id === currentBrandId) || brands[0];
  const modelConfig = getModelConfig(currentBrand.id);

  const cap = modelConfig.monthly_generation_cap || 200;
  const used = modelConfig.monthly_generations_used || 0;
  const percentUsed = Math.min(100, Math.round((used / cap) * 100));

  const navItems: Array<{
    id: string;
    label: string;
    icon: typeof Layers;
    match: (view: string) => boolean;
  }> = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard, match: (v) => v === 'dashboard' },
    { id: 'editor', label: 'Studio', icon: Sparkles, match: (v) => v === 'editor' },
    { id: 'templates', label: 'Templates', icon: Layers, match: (v) => v === 'templates' },
    { id: 'catalog', label: 'Catalog', icon: Palette, match: (v) => v === 'catalog' },
    { id: 'design_detail', label: 'Designs', icon: FolderKanban, match: (v) => v === 'design_detail' },
  ];

  const canManage =
    currentUser?.role === 'brand_admin' || currentUser?.role === 'platform_admin';

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (brandMenuRef.current && !brandMenuRef.current.contains(target)) {
        setIsBrandMenuOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(target)) {
        setIsUserMenuOpen(false);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsBrandMenuOpen(false);
        setIsUserMenuOpen(false);
        setIsMobileNavOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const go = (view: string) => {
    setActiveView(view as any);
    setIsMobileNavOpen(false);
    setIsBrandMenuOpen(false);
    setIsUserMenuOpen(false);
  };

  const roleLabel =
    currentUser?.role === 'platform_admin'
      ? 'Platform admin'
      : currentUser?.role === 'brand_admin'
        ? 'Brand admin'
        : 'Staff';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)]/85 backdrop-blur-md">
      <div className="mx-auto flex h-[60px] max-w-[1280px] items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative" ref={brandMenuRef}>
            <button
              type="button"
              onClick={() => {
                setIsBrandMenuOpen((open) => !open);
                setIsUserMenuOpen(false);
              }}
              aria-haspopup="menu"
              aria-expanded={isBrandMenuOpen}
              className="flex items-center gap-2.5 rounded-[10px] py-1 pr-2 pl-1 transition-colors hover:bg-[var(--color-bg-sunken)]"
            >
              {currentBrand.logo_url ? (
                <img
                  src={currentBrand.logo_url}
                  alt=""
                  className="h-8 w-8 rounded-lg object-cover shadow-[var(--shadow-ring)]"
                />
              ) : (
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-[11px] font-semibold tracking-wide text-white"
                  style={{ backgroundColor: currentBrand.theme_accent_color }}
                >
                  {currentBrand.name.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div className="hidden text-left sm:block">
                <div className="flex items-center gap-1 font-display text-[13px] font-semibold leading-tight text-[var(--color-text-primary)]">
                  <span className="max-w-[160px] truncate">{currentBrand.name}</span>
                  <ChevronDown className="h-3 w-3 text-[var(--color-text-tertiary)]" />
                </div>
                <div className="font-mono text-[10px] tracking-wide text-[var(--color-text-tertiary)]">
                  {currentBrand.slug}
                </div>
              </div>
            </button>

            {isBrandMenuOpen && (
              <div
                role="menu"
                className="menu-panel absolute top-full left-0 z-50 mt-2 w-64 animate-in fade-in zoom-in-95 duration-150"
              >
                <div className="eyebrow-label px-2.5 py-2">Workspaces</div>
                <div className="space-y-0.5">
                  {brands.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setCurrentBrand(b.id);
                        setIsBrandMenuOpen(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-[10px] px-2.5 py-2 text-left text-[13px] transition-colors ${
                        b.id === currentBrandId
                          ? 'bg-[var(--color-accent-tint)] font-semibold text-[var(--color-accent)]'
                          : 'text-[var(--color-text-primary)] hover:bg-[var(--color-bg-sunken)]'
                      }`}
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <span
                          className="h-2 w-2 shrink-0 rounded-full"
                          style={{ backgroundColor: b.theme_accent_color }}
                        />
                        <span className="truncate">{b.name}</span>
                      </span>
                      {b.id === currentBrandId && <Check className="h-3.5 w-3.5 shrink-0" />}
                    </button>
                  ))}
                </div>
                <div className="mt-1 border-t border-[var(--color-border-subtle)] pt-1">
                  <button
                    type="button"
                    onClick={() => go('onboarding')}
                    className="flex w-full items-center gap-2 rounded-[10px] px-2.5 py-2 text-left text-[12px] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-sunken)] hover:text-[var(--color-text-primary)]"
                  >
                    <Building2 className="h-3.5 w-3.5" />
                    Onboard a brand
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Primary">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.match(activeView);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => go(item.id)}
                className={`nav-chip ${isActive ? 'is-active' : ''}`}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
          {canManage && (
            <button
              type="button"
              onClick={() => go('settings_models')}
              className={`nav-chip ${activeView.startsWith('settings') ? 'is-active' : ''}`}
              aria-current={activeView.startsWith('settings') ? 'page' : undefined}
            >
              <Settings className="h-3.5 w-3.5" />
              <span>Settings</span>
            </button>
          )}
          {currentUser?.role === 'platform_admin' && (
            <button
              type="button"
              onClick={() => go('platform_admin')}
              className={`nav-chip ${activeView === 'platform_admin' ? 'is-active' : ''}`}
            >
              <Shield className="h-3.5 w-3.5" />
              <span>Ops</span>
            </button>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <div
            className="hidden items-center gap-2 rounded-[10px] bg-[var(--color-bg-sunken)] px-2.5 py-1.5 md:flex"
            title={`${used} of ${cap} monthly renders`}
          >
            <span className="font-mono text-[10px] font-medium tabular-nums text-[var(--color-text-secondary)]">
              {used}/{cap}
            </span>
            <div className="h-1 w-14 overflow-hidden rounded-full bg-[var(--color-border-strong)]">
              <div
                className="h-full rounded-full bg-[var(--color-accent)]"
                style={{ width: `${percentUsed}%` }}
              />
            </div>
          </div>

          <div className="relative" ref={userMenuRef}>
            <button
              type="button"
              onClick={() => {
                setIsUserMenuOpen((open) => !open);
                setIsBrandMenuOpen(false);
              }}
              className="rounded-full p-0.5 transition-shadow hover:ring-2 hover:ring-[var(--color-accent)]/25"
              aria-haspopup="menu"
              aria-expanded={isUserMenuOpen}
              aria-label="Account menu"
            >
              {currentUser?.avatar_url ? (
                <img
                  src={currentUser.avatar_url}
                  alt=""
                  className="h-8 w-8 rounded-full object-cover shadow-[var(--shadow-ring)]"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-accent)] text-[12px] font-semibold text-white">
                  {currentUser?.name ? currentUser.name[0].toUpperCase() : 'U'}
                </div>
              )}
            </button>

            {isUserMenuOpen && (
              <div
                role="menu"
                className="menu-panel absolute top-full right-0 z-50 mt-2 w-60 animate-in fade-in zoom-in-95 duration-150"
              >
                <div className="border-b border-[var(--color-border-subtle)] px-3 py-2.5">
                  <div className="text-[13px] font-semibold text-[var(--color-text-primary)]">
                    {currentUser?.name || 'Staff'}
                  </div>
                  <div className="truncate font-mono text-[11px] text-[var(--color-text-tertiary)]">
                    {currentUser?.email}
                  </div>
                  <span className="badge badge-brass mt-2">{roleLabel}</span>
                </div>
                <div className="py-1">
                  <button
                    type="button"
                    className="w-full rounded-[10px] px-3 py-2 text-left text-[13px] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-sunken)]"
                    onClick={() => go('settings_profile')}
                  >
                    Brand profile
                  </button>
                  <button
                    type="button"
                    className="w-full rounded-[10px] px-3 py-2 text-left text-[13px] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-sunken)]"
                    onClick={() => go('settings_models')}
                  >
                    Models &amp; keys
                  </button>
                </div>
                <div className="border-t border-[var(--color-border-subtle)] pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onSignOut();
                    }}
                    className="btn btn-ghost btn-danger w-full justify-start"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-sunken)] hover:text-[var(--color-text-primary)] lg:hidden"
            aria-label={isMobileNavOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setIsMobileNavOpen((open) => !open)}
          >
            {isMobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {isMobileNavOpen && (
        <div className="border-t border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] px-4 py-3 lg:hidden">
          <nav className="grid grid-cols-2 gap-1" aria-label="Mobile">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.match(activeView);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => go(item.id)}
                  className={`nav-chip justify-start ${isActive ? 'is-active' : ''}`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
            {canManage && (
              <button
                type="button"
                onClick={() => go('settings_models')}
                className={`nav-chip justify-start ${activeView.startsWith('settings') ? 'is-active' : ''}`}
              >
                <Settings className="h-4 w-4" />
                Settings
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};
