// src/components/brand/BrandSettingsView.tsx
import React, { useState, useEffect } from 'react';
import { useBrandStore } from '../../lib/brandStore';
import {
  RegionEditProvider,
  RoomPreviewProvider,
  KeyMode,
  validateAccentContrast,
  deriveAccentPalette,
} from '../../types/brand';
import {
  REGION_EDIT_MODEL_METADATA,
  ROOM_PREVIEW_MODEL_METADATA,
} from '../../server/providers';
import {
  Cpu,
  Shield,
  Key,
  CreditCard,
  Building2,
  Users,
  Check,
  AlertCircle,
  Sparkles,
  Zap,
} from 'lucide-react';

interface BrandSettingsViewProps {
  initialTab?: 'models' | 'profile' | 'team' | 'billing';
}

export const BrandSettingsView: React.FC<BrandSettingsViewProps> = ({
  initialTab = 'models',
}) => {
  const {
    currentBrandId,
    brands,
    updateBrand,
    getModelConfig,
    updateModelConfig,
    testProviderConnection,
    currentUser,
  } = useBrandStore();

  const brand = brands.find((b) => b.id === currentBrandId) || brands[0];
  const initialConfig = getModelConfig(currentBrandId);

  const [activeTab, setActiveTab] = useState<'models' | 'profile' | 'team' | 'billing'>(
    initialTab
  );

  // Model Form State
  const [regionProvider, setRegionProvider] = useState<RegionEditProvider>(
    initialConfig.region_edit_provider
  );
  const [roomProvider, setRoomProvider] = useState<RoomPreviewProvider>(
    initialConfig.room_preview_provider
  );
  const [keyMode, setKeyMode] = useState<KeyMode>(initialConfig.key_mode);
  const [byoProvider, setByoProvider] = useState<string>(
    initialConfig.byo_provider || 'openrouter'
  );
  const [byoKeyInput, setByoKeyInput] = useState<string>('');

  // Dirty state tracking for sticky bar
  const [isDirty, setIsDirty] = useState(false);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  // Connection testing state
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // Profile Form State
  const [profileName, setProfileName] = useState(brand.name);
  const [profileAccent, setProfileAccent] = useState(brand.theme_accent_color);
  const [profileContact, setProfileContact] = useState(brand.primary_contact_name);
  const [profileEmail, setProfileEmail] = useState(brand.primary_contact_email);
  const contrastCheck = validateAccentContrast(profileAccent);

  useEffect(() => {
    const dirty =
      regionProvider !== initialConfig.region_edit_provider ||
      roomProvider !== initialConfig.room_preview_provider ||
      keyMode !== initialConfig.key_mode ||
      Boolean(byoKeyInput.trim());
    setIsDirty(dirty);
  }, [regionProvider, roomProvider, keyMode, byoKeyInput, initialConfig]);

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const result = await testProviderConnection(byoProvider, byoKeyInput);
      setTestResult(result);
    } catch (e: any) {
      setTestResult({ success: false, message: e.message || 'Connection test failed' });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveChanges = async () => {
    await updateModelConfig(currentBrandId, {
      region_edit_provider: regionProvider,
      room_preview_provider: roomProvider,
      key_mode: keyMode,
      byo_provider: keyMode === 'brand_byo_key' ? byoProvider : null,
      byo_api_key_encrypted: byoKeyInput ? byoKeyInput : initialConfig.byo_api_key_encrypted,
    });

    setSaveNotice('Settings updated successfully');
    setIsDirty(false);
    setTimeout(() => setSaveNotice(null), 3000);
  };

  const handleSaveProfile = async () => {
    if (!contrastCheck.isValid) return;
    await updateBrand(currentBrandId, {
      name: profileName,
      theme_accent_color: profileAccent,
      primary_contact_name: profileContact,
      primary_contact_email: profileEmail,
    });
    setSaveNotice('Brand profile saved');
    setTimeout(() => setSaveNotice(null), 3000);
  };

  const cap = initialConfig.monthly_generation_cap || 250;
  const used = initialConfig.monthly_generations_used || 0;

  return (
    <div className="page-shell max-w-4xl space-y-6">
      <div>
        <p className="eyebrow-label">Atelier</p>
        <h1 className="page-title">Settings</h1>
      </div>
      <div className="segmented flex-wrap">
        {[
          { id: 'models', label: 'Models', icon: Cpu },
          { id: 'profile', label: 'Brand', icon: Building2 },
          { id: 'team', label: 'Team', icon: Users },
          { id: 'billing', label: 'Billing', icon: CreditCard },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`segmented-item ${isActive ? 'is-active' : ''}`}
              aria-pressed={isActive}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {saveNotice && (
        <div className="flex items-center gap-2 rounded-[14px] bg-[rgba(44,154,106,0.1)] px-4 py-3 text-[13px] text-[#1F6B48]">
          <Check className="h-4 w-4" />
          <span>{saveNotice}</span>
        </div>
      )}

      {/* TAB 1: AI MODELS SCREEN (Section 3.4) */}
      {activeTab === 'models' && (
        <div className="max-w-2xl mx-auto space-y-6 pb-24">
          {/* Header (Section 3.4.1) */}
          <div>
            <h2 className="font-display text-[22px] font-semibold tracking-tight">AI models</h2>
            <p className="page-lede">
              Choose which model powers fabric renders. Defaults are tuned for drapery; change them only if you need a different vendor.
            </p>
          </div>

          {/* CARD 1: Fabric Region Editing (Section 3.4.2) */}
          <div className="brand-card p-6 space-y-4">
            <div>
              <div className="eyebrow-label text-[var(--color-accent)] font-semibold">TASK A</div>
              <h2 className="text-base font-display font-semibold text-[var(--color-text-primary)]">
                Fabric Region Editing
              </h2>
              <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                Controls inpainting swaps inside selected drapery zones without altering background pixels.
              </p>
            </div>

            {/* Radio-style model selector */}
            <div className="space-y-2.5">
              {(
                Object.values(REGION_EDIT_MODEL_METADATA) as Array<
                  typeof REGION_EDIT_MODEL_METADATA[RegionEditProvider]
                >
              ).map((m) => {
                const isSelected = regionProvider === m.id;
                return (
                  <label
                    key={m.id}
                    className={`p-4 rounded-2xl border transition cursor-pointer flex items-start gap-3.5 block ${
                      isSelected
                        ? 'bg-[var(--color-bg-surface)] border-[var(--color-accent)] ring-2 ring-[var(--color-accent)]/15 shadow-sm'
                        : 'bg-[var(--color-bg-sunken)] border-[var(--color-border-subtle)] hover:border-[var(--color-border-strong)]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="region_edit_provider"
                      value={m.id}
                      checked={isSelected}
                      onChange={() => setRegionProvider(m.id)}
                      className="mt-1 text-[var(--color-accent)] focus:ring-[var(--color-accent)] cursor-pointer"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-[var(--color-text-primary)] font-display">
                            {m.name}
                          </span>
                          {m.isRecommended && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                              Recommended
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] font-mono text-[var(--color-text-secondary)]">
                          {m.costEstimate}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--color-text-secondary)] mt-1 leading-relaxed">
                        {m.description}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>

            {/* Static Example Image Pair (Section 3.4.2) */}
            <div className="pt-2">
              <span className="eyebrow-label text-[var(--color-text-secondary)] block mb-2">
                Quality Comparison Example (Single-Region Swap)
              </span>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <div className="w-full aspect-[4/3] rounded-xl bg-neutral-100 overflow-hidden relative">
                    <img
                      src="https://images.unsplash.com/photo-1513694203232-719a280e022f?w=400&auto=format&fit=crop&q=80"
                      alt="Before"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/60 text-[9px] font-mono text-white">
                      ORIGINAL
                    </div>
                  </div>
                  <span className="text-[10px] text-[var(--color-text-secondary)]">
                    Base curtain with pleats
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="w-full aspect-[4/3] rounded-xl bg-neutral-100 overflow-hidden relative border border-[var(--color-accent)]">
                    <img
                      src="https://images.unsplash.com/photo-1513694203232-719a280e022f?w=400&auto=format&fit=crop&q=80"
                      alt="After"
                      className="w-full h-full object-cover filter contrast-125"
                    />
                    <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-[var(--color-accent)] text-[9px] font-mono text-white font-semibold">
                      INPAINTED
                    </div>
                  </div>
                  <span className="text-[10px] text-[var(--color-text-secondary)]">
                    Folds &amp; lighting preserved
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* CARD 2: Room Preview (Section 3.4.3) */}
          <div className="brand-card p-6 space-y-4">
            <div>
              <div className="eyebrow-label text-[var(--color-accent)] font-semibold">TASK B</div>
              <h2 className="text-base font-display font-semibold text-[var(--color-text-primary)]">
                Room Preview
              </h2>
              <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                Integrates finished drapes onto window tracks in real customer rooms.
              </p>
            </div>

            <div className="space-y-2.5">
              {(
                Object.values(ROOM_PREVIEW_MODEL_METADATA) as Array<
                  typeof ROOM_PREVIEW_MODEL_METADATA[RoomPreviewProvider]
                >
              ).map((m) => {
                const isSelected = roomProvider === m.id;
                return (
                  <label
                    key={m.id}
                    className={`p-4 rounded-2xl border transition cursor-pointer flex items-start gap-3.5 block ${
                      isSelected
                        ? 'bg-[var(--color-bg-surface)] border-[var(--color-accent)] ring-2 ring-[var(--color-accent)]/15 shadow-sm'
                        : 'bg-[var(--color-bg-sunken)] border-[var(--color-border-subtle)] hover:border-[var(--color-border-strong)]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="room_preview_provider"
                      value={m.id}
                      checked={isSelected}
                      onChange={() => setRoomProvider(m.id)}
                      className="mt-1 text-[var(--color-accent)] focus:ring-[var(--color-accent)] cursor-pointer"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-[var(--color-text-primary)] font-display">
                            {m.name}
                          </span>
                          {m.isRecommended && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                              Recommended
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] font-mono text-[var(--color-text-secondary)]">
                          {m.costEstimate}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--color-text-secondary)] mt-1 leading-relaxed">
                        {m.description}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* CARD 3: Billing Mode (Section 3.4.4) */}
          <div className="brand-card p-6 space-y-4">
            <div>
              <h2 className="text-base font-display font-semibold text-[var(--color-text-primary)]">
                Billing &amp; API Keys
              </h2>
              <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                Choose between managed platform credits or bringing your own enterprise key.
              </p>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 rounded-xl bg-[var(--color-bg-sunken)] border border-[var(--color-border-subtle)] cursor-pointer">
                <input
                  type="radio"
                  name="key_mode"
                  checked={keyMode === 'platform_managed'}
                  onChange={() => setKeyMode('platform_managed')}
                  className="text-[var(--color-accent)] cursor-pointer"
                />
                <div className="flex-1">
                  <div className="text-xs font-semibold">Use Pratap-managed credits (Default)</div>
                  <div className="text-[11px] text-[var(--color-text-secondary)]">
                    Current plan allowance: {cap} renders/month ({used} used this billing period).
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-xl bg-[var(--color-bg-sunken)] border border-[var(--color-border-subtle)] cursor-pointer">
                <input
                  type="radio"
                  name="key_mode"
                  checked={keyMode === 'brand_byo_key'}
                  onChange={() => setKeyMode('brand_byo_key')}
                  className="text-[var(--color-accent)] cursor-pointer"
                />
                <div className="flex-1">
                  <div className="text-xs font-semibold">Use my own API key (BYO Key)</div>
                  <div className="text-[11px] text-[var(--color-text-secondary)]">
                    Billed directly to your Google Cloud, OpenAI, or Replicate account.
                  </div>
                </div>
              </label>
            </div>

            {keyMode === 'brand_byo_key' && (
              <div className="p-4 rounded-2xl bg-white border border-[var(--color-border-strong)] space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium mb-1">BYO Provider</label>
                    <select
                      value={byoProvider}
                      onChange={(e) => setByoProvider(e.target.value)}
                      className="w-full h-9 px-2.5 text-xs rounded-lg bg-[var(--color-bg-sunken)] border border-[var(--color-border-strong)] font-medium"
                    >
                      <option value="openrouter">OpenRouter (Unified: FLUX.1 + Nano Banana Pro + Claude + Seedream)</option>
                      <option value="gemini">Google Gemini (Nano Banana Pro / Image)</option>
                      <option value="openai">OpenAI (GPT Image 2 / GPT-4o)</option>
                      <option value="replicate">Replicate (FLUX.1 Kontext)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium mb-1">
                      API Secret Key
                    </label>
                    <input
                      type="password"
                      value={byoKeyInput}
                      onChange={(e) => setByoKeyInput(e.target.value)}
                      placeholder={
                        initialConfig.byo_api_key_encrypted
                          ? 'sk-••••••••••••1234'
                          : 'sk-or-v1-...'
                      }
                      className="w-full h-9 px-2.5 text-xs rounded-lg bg-[var(--color-bg-sunken)] border border-[var(--color-border-strong)] font-mono"
                    />
                  </div>
                </div>

                {byoProvider === 'openrouter' && (
                  <div className="p-3 rounded-xl bg-[var(--color-accent-tint)] border border-[var(--color-accent)]/20 text-xs text-[var(--color-text-primary)] space-y-1">
                    <div className="flex items-center gap-1.5 font-semibold text-[var(--color-accent)]">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Single API Key Architecture</span>
                    </div>
                    <p className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed">
                      With a single OpenRouter key, your atelier connects to <strong>FLUX.1 Fill Pro</strong> for pleat inpainting, <strong>Nano Banana Pro (Gemini 3)</strong> for architectural room visualization, and <strong>Gemini 2.5 Flash / Claude 3.7</strong> for textile vision analysis — no separate accounts needed.
                    </p>
                    <div className="pt-0.5">
                      <a
                        href="https://openrouter.ai/keys"
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-[var(--color-accent)] hover:underline font-semibold"
                      >
                        Get your OpenRouter API Key &rarr;
                      </a>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={isTesting}
                    className="px-3 py-1.5 rounded-lg border border-[var(--color-border-strong)] text-xs font-semibold hover:bg-[var(--color-bg-sunken)] cursor-pointer"
                  >
                    {isTesting ? 'Testing Ping...' : 'Test Connection'}
                  </button>
                  {testResult && (
                    <span
                      className={`text-xs font-mono font-medium ${
                        testResult.success ? 'text-emerald-700' : 'text-red-600'
                      }`}
                    >
                      {testResult.message}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {isDirty && (
            <div className="fixed right-0 bottom-0 left-0 z-30 border-t border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)]/92 px-4 py-3 backdrop-blur-md">
              <div className="mx-auto flex max-w-2xl items-center justify-between gap-3">
                <span className="text-[13px] text-[var(--color-text-secondary)]">
                  Unsaved model changes
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setRegionProvider(initialConfig.region_edit_provider);
                      setRoomProvider(initialConfig.room_preview_provider);
                      setKeyMode(initialConfig.key_mode);
                      setByoKeyInput('');
                    }}
                    className="btn btn-ghost"
                  >
                    Cancel
                  </button>
                  <button type="button" onClick={handleSaveChanges} className="btn btn-primary">
                    Save changes
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: BRAND PROFILE & THEME (Section 7, Screen 10) */}
      {activeTab === 'profile' && (
        <div className="max-w-2xl mx-auto brand-card p-6 space-y-6">
          <div>
            <h2 className="font-display text-[20px] font-semibold tracking-tight">Brand profile</h2>
            <p className="page-lede">
              Contact details and the accent used on interactive studio controls.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="field-label">Brand name</label>
              <input
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="field"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="field-label">Primary contact</label>
                <input
                  type="text"
                  value={profileContact}
                  onChange={(e) => setProfileContact(e.target.value)}
                  className="field"
                />
              </div>
              <div>
                <label className="field-label">Contact email</label>
                <input
                  type="email"
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  className="field"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium mb-2">Theme Accent Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={profileAccent}
                  onChange={(e) => setProfileAccent(e.target.value)}
                  className="w-10 h-10 rounded-xl cursor-pointer p-1 bg-white border border-[var(--color-border-strong)]"
                />
                <input
                  type="text"
                  value={profileAccent}
                  onChange={(e) => setProfileAccent(e.target.value)}
                  className="w-28 h-9 px-2 text-xs font-mono rounded-lg bg-[var(--color-bg-sunken)] border border-[var(--color-border-strong)]"
                />
                <div
                  className={`text-xs px-2.5 py-1 rounded-full font-mono font-medium ${
                    contrastCheck.isValid
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {contrastCheck.isValid
                    ? `WCAG AA Valid (${contrastCheck.contrastRatio}:1)`
                    : `Low Contrast (${contrastCheck.contrastRatio}:1)`}
                </div>
              </div>
            </div>

            <button type="button" onClick={handleSaveProfile} className="btn btn-primary">
              Save profile
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: TEAM MEMBERS */}
      {activeTab === 'team' && (
        <div className="max-w-2xl mx-auto brand-card p-6 space-y-4">
          <h2 className="text-lg font-display font-semibold">Team Members</h2>
          <p className="text-xs text-[var(--color-text-secondary)]">
            Manage designers and staff with access to {brand.name}'s private catalog and templates.
          </p>

          <div className="p-4 rounded-xl bg-[var(--color-bg-sunken)] border border-[var(--color-border-subtle)] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[var(--color-accent)] text-white flex items-center justify-center font-bold text-xs">
                {currentUser?.name ? currentUser.name[0] : 'U'}
              </div>
              <div>
                <div className="font-semibold">{currentUser?.name}</div>
                <div className="text-[11px] text-[var(--color-text-secondary)]">
                  {currentUser?.email}
                </div>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-semibold">
              {currentUser?.role === 'brand_admin' ? 'Brand Admin' : 'Staff'}
            </span>
          </div>
        </div>
      )}

      {/* TAB 4: BILLING */}
      {activeTab === 'billing' && (
        <div className="max-w-2xl mx-auto brand-card p-6 space-y-4">
          <h2 className="text-lg font-display font-semibold">Billing &amp; Monthly Capacity</h2>
          <div className="p-4 rounded-2xl bg-[var(--color-bg-sunken)] border border-[var(--color-border-subtle)] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold">Atelier Enterprise Plan</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                ACTIVE
              </span>
            </div>
            <div className="text-xs text-[var(--color-text-secondary)]">
              Includes FLUX.1 Kontext high-res inpainting, Nano Banana Pro room visualization, and unlimited fabric catalog storage.
            </div>
            <div className="pt-2 text-xs font-mono font-semibold">
              {used} / {cap} renders used this month
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
