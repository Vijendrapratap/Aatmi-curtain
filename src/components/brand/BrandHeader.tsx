// src/components/brand/BrandHeader.tsx
import React, { useState } from 'react';
import { useBrandStore } from '../../lib/brandStore';
import {
  Sparkles,
  LayoutDashboard,
  Layers,
  Palette,
  FolderKanban,
  Settings,
  ShieldAlert,
  ChevronDown,
  LogOut,
  Sliders,
  Check,
  Building2,
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

  const currentBrand = brands.find((b) => b.id === currentBrandId) || brands[0];
  const modelConfig = getModelConfig(currentBrand.id);

  const cap = modelConfig.monthly_generation_cap || 200;
  const used = modelConfig.monthly_generations_used || 0;
  const percentUsed = Math.min(100, Math.round((used / cap) * 100));

  return (
    <header className="w-full bg-[var(--color-bg-surface)] border-b border-[var(--color-border-subtle)] sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand Identity & Brand Switcher */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsBrandMenuOpen(!isBrandMenuOpen)}
              className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-[var(--color-bg-sunken)] transition tactile-press cursor-pointer border border-transparent hover:border-[var(--color-border-subtle)]"
            >
              {currentBrand.logo_url ? (
                <img
                  src={currentBrand.logo_url}
                  alt={currentBrand.name}
                  className="w-8 h-8 rounded-lg object-cover shadow-xs border border-[var(--color-border-subtle)]"
                />
              ) : (
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white shadow-xs text-xs"
                  style={{ backgroundColor: currentBrand.theme_accent_color }}
                >
                  {currentBrand.name.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div className="text-left hidden sm:block">
                <div className="font-display font-semibold text-xs text-[var(--color-text-primary)] leading-tight flex items-center gap-1">
                  <span>{currentBrand.name}</span>
                  <ChevronDown className="w-3 h-3 text-[var(--color-text-secondary)]" />
                </div>
                <div className="text-[10px] text-[var(--color-text-secondary)] font-mono">
                  {currentBrand.slug}.aatmi.design
                </div>
              </div>
            </button>

            {/* Brand Dropdown Menu (Multi-Tenant Switcher) */}
            {isBrandMenuOpen && (
              <div className="absolute left-0 top-full mt-2 w-64 rounded-2xl bg-white border border-[var(--color-border-strong)] shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="eyebrow-label px-2 py-1 text-[var(--color-text-secondary)] text-[10px]">
                  Switch Brand Workspace
                </div>
                <div className="space-y-1 my-1">
                  {brands.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => {
                        setCurrentBrand(b.id);
                        setIsBrandMenuOpen(false);
                      }}
                      className={`w-full p-2 rounded-xl text-left flex items-center justify-between text-xs transition cursor-pointer ${
                        b.id === currentBrandId
                          ? 'bg-[var(--color-accent-tint)] text-[var(--color-accent)] font-semibold'
                          : 'hover:bg-[var(--color-bg-sunken)] text-[var(--color-text-primary)]'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: b.theme_accent_color }}
                        />
                        <span className="truncate">{b.name}</span>
                      </div>
                      {b.id === currentBrandId && <Check className="w-3.5 h-3.5 shrink-0" />}
                    </button>
                  ))}
                </div>
                <div className="pt-2 border-t border-[var(--color-border-subtle)] px-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsBrandMenuOpen(false);
                      setActiveView('onboarding');
                    }}
                    className="w-full py-1.5 px-2 rounded-lg text-left text-[11px] font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-sunken)] flex items-center gap-2 cursor-pointer"
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>+ Onboard New Brand</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center: Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'templates', label: 'Templates', icon: Layers },
            { id: 'editor', label: 'Studio Editor', icon: Sparkles },
            { id: 'catalog', label: 'Fabric Catalog', icon: Palette },
            { id: 'design_detail', label: 'Designs & Room', icon: FolderKanban },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveView(item.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition tactile-press cursor-pointer ${
                  isActive
                    ? 'bg-[var(--color-bg-sunken)] text-[var(--color-text-primary)] font-semibold border border-[var(--color-border-subtle)] shadow-2xs'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-base)]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}

          {/* Settings Tab (Brand Admin only) */}
          {(currentUser?.role === 'brand_admin' || currentUser?.role === 'platform_admin') && (
            <button
              type="button"
              onClick={() => setActiveView('settings_models')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition tactile-press cursor-pointer ${
                activeView.startsWith('settings')
                  ? 'bg-[var(--color-bg-sunken)] text-[var(--color-text-primary)] font-semibold border border-[var(--color-border-subtle)] shadow-2xs'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-base)]'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Settings</span>
            </button>
          )}

          {/* Platform Admin View (Platform Admin only) */}
          {currentUser?.role === 'platform_admin' && (
            <button
              type="button"
              onClick={() => setActiveView('platform_admin')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition tactile-press cursor-pointer ${
                activeView === 'platform_admin'
                  ? 'bg-purple-100 text-purple-900 font-bold border border-purple-300'
                  : 'text-purple-700 hover:bg-purple-50'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Platform Ops</span>
            </button>
          )}
        </nav>

        {/* Right: Model & Usage Indicator + User Menu */}
        <div className="flex items-center gap-3">
          {/* Generation Credits Usage pill (Section 3.2 / 3.4) */}
          <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-xl bg-[var(--color-bg-sunken)] border border-[var(--color-border-subtle)] text-[11px]">
            <Sparkles className="w-3 h-3 text-[var(--color-accent)] shrink-0" />
            <div className="flex flex-col">
              <span className="font-mono font-semibold text-[10px] text-[var(--color-text-primary)]">
                {used} / {cap} renders
              </span>
              <div className="w-16 h-1 bg-[var(--color-border-strong)] rounded-full overflow-hidden mt-0.5">
                <div
                  className="h-full bg-[var(--color-accent)] rounded-full"
                  style={{ width: `${percentUsed}%` }}
                />
              </div>
            </div>
          </div>

          {/* User Profile avatar & role */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-[var(--color-accent)]/30 transition cursor-pointer"
            >
              {currentUser?.avatar_url ? (
                <img
                  src={currentUser.avatar_url}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full object-cover border border-[var(--color-border-subtle)]"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[var(--color-accent)] text-white flex items-center justify-center text-xs font-bold">
                  {currentUser?.name ? currentUser.name[0].toUpperCase() : 'U'}
                </div>
              )}
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl bg-white border border-[var(--color-border-strong)] shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2 border-b border-[var(--color-border-subtle)]">
                  <div className="text-xs font-semibold text-[var(--color-text-primary)]">
                    {currentUser?.name || 'Staff User'}
                  </div>
                  <div className="text-[10px] text-[var(--color-text-secondary)] font-mono truncate">
                    {currentUser?.email}
                  </div>
                  <span
                    className={`inline-block text-[9px] font-mono font-medium px-2 py-0.5 rounded-full mt-1.5 ${
                      currentUser?.role === 'platform_admin'
                        ? 'bg-purple-100 text-purple-800'
                        : currentUser?.role === 'brand_admin'
                        ? 'bg-indigo-100 text-indigo-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {currentUser?.role === 'platform_admin'
                      ? 'Platform Admin'
                      : currentUser?.role === 'brand_admin'
                      ? 'Brand Admin'
                      : 'Brand Staff'}
                  </span>
                </div>

                <div className="py-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      setActiveView('settings_profile');
                    }}
                    className="w-full px-3 py-1.5 text-left text-xs text-[var(--color-text-primary)] hover:bg-[var(--color-bg-sunken)] rounded-lg cursor-pointer"
                  >
                    Brand Profile
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      setActiveView('settings_models');
                    }}
                    className="w-full px-3 py-1.5 text-left text-xs text-[var(--color-text-primary)] hover:bg-[var(--color-bg-sunken)] rounded-lg cursor-pointer"
                  >
                    AI Models &amp; Keys
                  </button>
                </div>

                <div className="pt-1 border-t border-[var(--color-border-subtle)]">
                  <button
                    type="button"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onSignOut();
                    }}
                    className="w-full px-3 py-1.5 text-left text-xs text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
