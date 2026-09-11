// src/components/brand/OnboardingWizard.tsx
import React, { useState } from 'react';
import { useBrandStore } from '../../lib/brandStore';
import { validateAccentContrast, deriveAccentPalette } from '../../types/brand';
import {
  Upload,
  Check,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Shield,
  Layers,
  Image as ImageIcon,
  Users,
  CheckCircle2,
  Lock,
} from 'lucide-react';

interface OnboardingWizardProps {
  onComplete: () => void;
  onCancel?: () => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ onComplete, onCancel }) => {
  const { currentBrandId, brands, updateBrand, createBrand, updateModelConfig } = useBrandStore();

  const brand = brands.find((b) => b.id === currentBrandId) || brands[0];

  // Resume at current onboarding step if brand has one, default to 1
  const [step, setStep] = useState<number>(brand?.onboarding_step || 1);

  // Step 1: Profile fields
  const [brandName, setBrandName] = useState(brand?.name || '');
  const [contactName, setContactName] = useState(brand?.primary_contact_name || '');
  const [contactEmail, setContactEmail] = useState(brand?.primary_contact_email || '');
  const [contactPhone, setContactPhone] = useState(brand?.primary_contact_phone || '');
  const [logoUrl, setLogoUrl] = useState<string | null>(brand?.logo_url || null);
  const [logoMode, setLogoMode] = useState<'as_is' | 'no_bg'>('as_is');

  // Step 2: Theme fields
  const [accentColor, setAccentColor] = useState<string>(brand?.theme_accent_color || '#5B4FE0');
  const contrastCheck = validateAccentContrast(accentColor);

  // Step 3: Team fields
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'brand_admin' | 'brand_staff'>('brand_staff');
  const [invitedTeammates, setInvitedTeammates] = useState<Array<{ email: string; role: string }>>([]);

  // Step 4: AI Model fields
  const [useByoKey, setUseByoKey] = useState(false);
  const [byoProvider, setByoProvider] = useState<'gemini' | 'openai' | 'replicate'>('gemini');
  const [byoApiKey, setByoApiKey] = useState('');
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Step 5: First Template fields
  const [templateChoice, setTemplateChoice] = useState<'upload' | 'stencil' | null>(null);

  // Helpers
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setLogoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApplySafeShade = () => {
    setAccentColor(contrastCheck.closestSafeHex);
  };

  const handleAddTeammate = () => {
    if (inviteEmail && inviteEmail.includes('@')) {
      setInvitedTeammates([...invitedTeammates, { email: inviteEmail, role: inviteRole }]);
      setInviteEmail('');
    }
  };

  const handleNextStep = async () => {
    const nextStep = step + 1;
    if (step === 1) {
      await updateBrand(brand.id, {
        name: brandName,
        primary_contact_name: contactName,
        primary_contact_email: contactEmail,
        primary_contact_phone: contactPhone,
        logo_url: logoUrl,
        onboarding_step: 2,
      });
      setStep(2);
    } else if (step === 2) {
      await updateBrand(brand.id, {
        theme_accent_color: accentColor,
        onboarding_step: 3,
      });
      setStep(3);
    } else if (step === 3) {
      await updateBrand(brand.id, {
        onboarding_step: 4,
      });
      setStep(4);
    } else if (step === 4) {
      await updateModelConfig(brand.id, {
        key_mode: useByoKey ? 'brand_byo_key' : 'platform_managed',
        byo_provider: useByoKey ? byoProvider : null,
        byo_api_key_encrypted: useByoKey ? byoApiKey : null,
      });
      await updateBrand(brand.id, { onboarding_step: 5 });
      setStep(5);
    } else if (step === 5) {
      await updateBrand(brand.id, {
        status: 'active',
        onboarding_step: 5,
        activated_at: new Date().toISOString(),
      });
      onComplete();
    }
  };

  // Validation
  const isStep1Valid = Boolean(brandName.trim() && contactName.trim() && contactEmail.trim());
  const isStep2Valid = contrastCheck.isValid;
  const isStep3Valid = true; // Skippable
  const isStep4Valid = !useByoKey || Boolean(byoApiKey.trim());
  const isStep5Valid = true; // Skippable

  // Preview palette for Step 2
  const previewPalette = deriveAccentPalette(accentColor);

  return (
    <div className="mx-auto flex min-h-dvh max-w-4xl flex-col justify-between bg-[var(--color-bg-base)] p-4 text-[var(--color-text-primary)] sm:p-8">
      <div className="mb-8 w-full pt-4">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="eyebrow-label">
              Step {step} of 5
            </span>
            <span className="text-xs text-[var(--color-text-secondary)]">
              {step === 1 && '— Brand Profile'}
              {step === 2 && '— Brand Theme'}
              {step === 3 && '— Team Members'}
              {step === 4 && '— AI Model Configuration'}
              {step === 5 && '— First Template'}
            </span>
          </div>
          {onCancel && (
            <button
              onClick={onCancel}
              className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] cursor-pointer"
            >
              Exit
            </button>
          )}
        </div>

        {/* Thin accent progress bar (Section 4.2) */}
        <div className="w-full h-1.5 bg-[var(--color-border-subtle)] rounded-full overflow-hidden">
          <div
            className="h-full bg-[var(--color-accent)] transition-all duration-300 rounded-full"
            style={{ width: `${(step / 5) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Wizard Card */}
      <div className="brand-card p-6 sm:p-10 flex-1 flex flex-col justify-between">
        {/* Step 1: Brand Profile */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-display font-semibold">Brand Profile</h2>
              <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                Tell us about your drapery atelier or studio. This personalizes your client-ready renders and catalog.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium mb-1.5">Brand Name *</label>
                  <input
                    type="text"
                    required
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    placeholder="e.g. Maison Aatmi"
                    className="field"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1.5">Primary Contact Name *</label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="e.g. Elena Vance"
                    className="field"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1.5">Primary Contact Email *</label>
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="elena@aatmi.design"
                    className="field"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1.5">Primary Phone (Optional)</label>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="field"
                  />
                </div>
              </div>

              {/* Logo upload with As-is vs Remove background */}
              <div className="p-4 rounded-2xl bg-[var(--color-bg-sunken)] border border-[var(--color-border-subtle)] flex flex-col justify-between">
                <div>
                  <label className="block text-xs font-medium mb-2">Brand Mark / Logo</label>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-20 h-20 rounded-full border-2 border-dashed border-[var(--color-border-strong)] flex items-center justify-center overflow-hidden bg-white shrink-0 shadow-xs">
                      {logoUrl ? (
                        <img
                          src={logoUrl}
                          alt="Logo preview"
                          className={`w-full h-full object-cover ${logoMode === 'no_bg' ? 'filter contrast-125' : ''}`}
                        />
                      ) : (
                        <Upload className="w-6 h-6 text-[var(--color-text-disabled)]" />
                      )}
                    </div>
                    <div>
                      <input
                        type="file"
                        id="logo-upload"
                        accept="image/png,image/jpeg,image/svg+xml"
                        className="hidden"
                        onChange={handleLogoUpload}
                      />
                      <label
                        htmlFor="logo-upload"
                        className="inline-block px-3 py-1.5 rounded-[var(--radius-button)] bg-white border border-[var(--color-border-strong)] text-xs font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-bg-base)] cursor-pointer tactile-press shadow-xs"
                      >
                        Upload Logo (PNG, JPG, SVG)
                      </label>
                      <div className="text-[10px] text-[var(--color-text-secondary)] mt-1">
                        Max 5MB. Clear high-resolution mark recommended.
                      </div>
                    </div>
                  </div>

                  {logoUrl && (
                    <div className="mt-4 pt-3 border-t border-[var(--color-border-subtle)]">
                      <div className="text-[11px] font-medium text-[var(--color-text-secondary)] mb-2">
                        Logo Preprocessing Option:
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setLogoMode('as_is')}
                          className={`p-2 rounded-xl text-left text-xs transition cursor-pointer border ${
                            logoMode === 'as_is'
                              ? 'bg-white border-[var(--color-accent)] font-semibold shadow-xs'
                              : 'bg-[var(--color-bg-surface)] border-[var(--color-border-subtle)] text-[var(--color-text-secondary)]'
                          }`}
                        >
                          Use as-is
                        </button>
                        <button
                          type="button"
                          onClick={() => setLogoMode('no_bg')}
                          className={`p-2 rounded-xl text-left text-xs transition cursor-pointer border ${
                            logoMode === 'no_bg'
                              ? 'bg-white border-[var(--color-accent)] font-semibold shadow-xs'
                              : 'bg-[var(--color-bg-surface)] border-[var(--color-border-subtle)] text-[var(--color-text-secondary)]'
                          }`}
                        >
                          Remove background
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="text-[11px] text-[var(--color-text-secondary)] mt-4">
                  Step 1 will save your brand details and unlock theme customization.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Brand Theme */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-display font-semibold">Brand Theme &amp; Accent</h2>
              <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                Customize your primary accent color. It styles interactive buttons, region outlines, and links across your studio.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              {/* Color Picker & Contrast check */}
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-medium mb-2">Primary Accent Color</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="w-12 h-12 rounded-xl cursor-pointer border border-[var(--color-border-strong)] p-1 bg-white"
                    />
                    <input
                      type="text"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="w-32 h-10 px-3 text-xs font-mono rounded-[var(--radius-input)] bg-[var(--color-bg-sunken)] border border-[var(--color-border-strong)] text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-accent)] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Preset Luxury Palette */}
                <div>
                  <span className="text-[11px] text-[var(--color-text-secondary)] block mb-2">
                    Or select a curated atelier accent:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { name: 'Indigo Violet', hex: '#5B4FE0' },
                      { name: 'Haute Emerald', hex: '#2FA875' },
                      { name: 'Royal Gold', hex: '#C9A961' },
                      { name: 'Deep Sapphire', hex: '#1E40AF' },
                      { name: 'Couture Sienna', hex: '#9A3412' },
                    ].map((c) => (
                      <button
                        key={c.hex}
                        type="button"
                        onClick={() => setAccentColor(c.hex)}
                        className={`px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 border transition cursor-pointer ${
                          accentColor.toLowerCase() === c.hex.toLowerCase()
                            ? 'border-[var(--color-text-primary)] font-semibold shadow-xs'
                            : 'border-[var(--color-border-subtle)] bg-white text-[var(--color-text-secondary)]'
                        }`}
                      >
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: c.hex }} />
                        <span>{c.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* WCAG AA Contrast Validation Box (Section 2.6) */}
                <div
                  className={`p-4 rounded-xl border text-xs ${
                    contrastCheck.isValid
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-amber-50 border-amber-200 text-amber-900'
                  }`}
                >
                  <div className="flex items-center gap-2 font-semibold">
                    {contrastCheck.isValid ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span>WCAG AA Contrast Valid ({contrastCheck.contrastRatio}:1 ratio)</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                        <span>Insufficient Contrast ({contrastCheck.contrastRatio}:1 on white)</span>
                      </>
                    )}
                  </div>
                  {!contrastCheck.isValid && (
                    <div className="mt-2 text-[11px]">
                      This color is too light for accessible text buttons. Recommended safe shade:{' '}
                      <button
                        type="button"
                        onClick={handleApplySafeShade}
                        className="font-mono underline font-bold cursor-pointer hover:text-black ml-1"
                      >
                        {contrastCheck.closestSafeHex} (Apply)
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Live Preview Card */}
              <div className="p-6 rounded-2xl bg-[var(--color-bg-sunken)] border border-[var(--color-border-subtle)] flex flex-col">
                <span className="eyebrow-label mb-3 text-[var(--color-text-secondary)]">
                  Live UI Component Preview
                </span>

                <div className="brand-card p-4 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-display text-sm font-semibold">Palazzo Dual Chevron</span>
                    <span
                      className="text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold"
                      style={{ backgroundColor: previewPalette.tint, color: previewPalette.accent }}
                    >
                      3 ZONES
                    </span>
                  </div>
                  <div className="w-full h-28 rounded-xl bg-neutral-200 overflow-hidden relative mb-3">
                    <img
                      src="https://images.unsplash.com/photo-1513694203232-719a280e022f?w=400&auto=format&fit=crop&q=80"
                      alt="Sample"
                      className="w-full h-full object-cover"
                    />
                    <div
                      className="absolute inset-0 border-2 pointer-events-none rounded-xl"
                      style={{ borderColor: previewPalette.accent }}
                    />
                  </div>

                  <button
                    type="button"
                    className="w-full py-2 px-3 rounded-[var(--radius-button)] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs"
                    style={{ backgroundColor: previewPalette.accent }}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate Photorealistic Drapery</span>
                  </button>
                </div>

                <div className="text-[11px] text-[var(--color-text-secondary)] leading-tight">
                  Notice how interactive buttons, zone outlines, and badges adopt your brand tone.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Team */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-display font-semibold">Invite Team Members</h2>
              <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                Collaborate with interior designers, sales reps, and atelier staff. You are already an auto-assigned Brand Admin.
              </p>
            </div>

            <div className="max-w-xl space-y-4">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@yourbrand.com"
                  className="flex-1 h-10 px-3 text-xs rounded-[var(--radius-input)] bg-[var(--color-bg-sunken)] border border-[var(--color-border-subtle)] text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-accent)] focus:outline-none"
                />
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as any)}
                  className="h-10 px-3 text-xs rounded-[var(--radius-input)] bg-[var(--color-bg-sunken)] border border-[var(--color-border-subtle)] text-[var(--color-text-primary)] focus:outline-none"
                >
                  <option value="brand_staff">Brand Staff (Editor &amp; Catalog)</option>
                  <option value="brand_admin">Brand Admin (Full Control)</option>
                </select>
                <button
                  type="button"
                  onClick={handleAddTeammate}
                  className="h-10 px-4 rounded-[var(--radius-button)] bg-[var(--color-accent)] text-white text-xs font-semibold cursor-pointer tactile-press shadow-xs shrink-0"
                >
                  Add
                </button>
              </div>

              {/* List of pending invites */}
              <div className="space-y-2 pt-2">
                <div className="p-3 rounded-xl bg-[var(--color-bg-sunken)] border border-[var(--color-border-subtle)] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[var(--color-accent)] text-white flex items-center justify-center font-bold text-[10px]">
                      {contactName[0]?.toUpperCase() || 'Y'}
                    </div>
                    <span className="font-semibold">{contactName || 'You'} ({contactEmail})</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-semibold">
                    Brand Admin (Owner)
                  </span>
                </div>

                {invitedTeammates.map((t, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-white border border-[var(--color-border-subtle)] flex items-center justify-between text-xs shadow-xs"
                  >
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-[var(--color-text-secondary)]" />
                      <span>{t.email}</span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700 font-semibold">
                      {t.role === 'brand_admin' ? 'Brand Admin' : 'Brand Staff'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: AI Model Setup */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-display font-semibold">AI Model Setup</h2>
              <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                Aatmi provides managed AI models by default for both region-locked replacement and room preview.
              </p>
            </div>

            {/* Platform defaults cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-[var(--color-bg-sunken)] border border-[var(--color-border-subtle)]">
                <div className="flex items-center justify-between mb-2">
                  <span className="eyebrow-label text-[var(--color-accent)] font-semibold">TASK A: FABRIC REGIONS</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                    Recommended Default
                  </span>
                </div>
                <div className="text-sm font-semibold font-display">FLUX.1 Kontext + Flux Tools</div>
                <div className="text-xs text-[var(--color-text-secondary)] mt-1 leading-relaxed">
                  Controls Canny edges and depth maps. Preserves fabric fold tension with zero pixel drift outside the region.
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--color-bg-sunken)] border border-[var(--color-border-subtle)]">
                <div className="flex items-center justify-between mb-2">
                  <span className="eyebrow-label text-[var(--color-accent)] font-semibold">TASK B: ROOM PREVIEWS</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                    Recommended Default
                  </span>
                </div>
                <div className="text-sm font-semibold font-display">Nano Banana Pro (Gemini 3 Pro)</div>
                <div className="text-xs text-[var(--color-text-secondary)] mt-1 leading-relaxed">
                  Edits the actual customer room photo without generating lookalikes — keeps windows, floors, and daylight exact.
                </div>
              </div>
            </div>

            {/* BYO Key toggle */}
            <div className="p-4 rounded-2xl bg-white border border-[var(--color-border-subtle)] shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-[var(--color-text-primary)]">
                    Billing Mode: Bring Your Own API Key (Optional)
                  </div>
                  <div className="text-[11px] text-[var(--color-text-secondary)]">
                    Use your enterprise Google Cloud or OpenAI API key instead of platform credits.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={useByoKey}
                  onChange={(e) => setUseByoKey(e.target.checked)}
                  className="w-4 h-4 text-[var(--color-accent)] rounded-md cursor-pointer"
                />
              </div>

              {useByoKey && (
                <div className="mt-4 pt-4 border-t border-[var(--color-border-subtle)] space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium mb-1">Provider</label>
                      <select
                        value={byoProvider}
                        onChange={(e) => setByoProvider(e.target.value as any)}
                        className="w-full h-9 px-2 text-xs rounded-lg bg-[var(--color-bg-sunken)] border border-[var(--color-border-strong)]"
                      >
                        <option value="gemini">Google Gemini AI</option>
                        <option value="openai">OpenAI (GPT Image 2)</option>
                        <option value="replicate">Replicate (Flux Kontext)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium mb-1">API Key</label>
                      <input
                        type="password"
                        value={byoApiKey}
                        onChange={(e) => setByoApiKey(e.target.value)}
                        placeholder="sk-••••••••••••"
                        className="w-full h-9 px-2 text-xs rounded-lg bg-[var(--color-bg-sunken)] border border-[var(--color-border-strong)] font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 5: First Template */}
        {step === 5 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-display font-semibold">Add Your First Template</h2>
              <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                Choose how you want to start designing draperies. You can also skip this and browse the gallery directly.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setTemplateChoice('upload')}
                className={`p-6 rounded-2xl text-left border transition cursor-pointer tactile-press flex flex-col justify-between h-48 ${
                  templateChoice === 'upload'
                    ? 'bg-white border-[var(--color-accent)] ring-2 ring-[var(--color-accent)]/20 shadow-md'
                    : 'bg-[var(--color-bg-sunken)] border-[var(--color-border-subtle)] hover:border-[var(--color-border-strong)]'
                }`}
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-[var(--color-accent-tint)] text-[var(--color-accent)] flex items-center justify-center mb-3">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div className="text-sm font-display font-semibold">Upload a Room Photo (Path A)</div>
                  <div className="text-xs text-[var(--color-text-secondary)] mt-1 leading-relaxed">
                    Upload an authentic customer window photograph. Our VLM detects pleats, bands, and fabric zones automatically.
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-[var(--color-accent)]">Select &amp; Upload →</span>
              </button>

              <button
                type="button"
                onClick={() => setTemplateChoice('stencil')}
                className={`p-6 rounded-2xl text-left border transition cursor-pointer tactile-press flex flex-col justify-between h-48 ${
                  templateChoice === 'stencil'
                    ? 'bg-white border-[var(--color-accent)] ring-2 ring-[var(--color-accent)]/20 shadow-md'
                    : 'bg-[var(--color-bg-sunken)] border-[var(--color-border-subtle)] hover:border-[var(--color-border-strong)]'
                }`}
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mb-3">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div className="text-sm font-display font-semibold">Browse Starter Stencils (Path B)</div>
                  <div className="text-xs text-[var(--color-text-secondary)] mt-1 leading-relaxed">
                    Pick from pre-segmented architectural templates: chevron borders, color-block trios, or tailored wave headers.
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-amber-800">Browse Stencils →</span>
              </button>
            </div>
          </div>
        )}

        {/* Wizard Footer Controls */}
        <div className="pt-8 mt-8 border-t border-[var(--color-border-subtle)] flex items-center justify-between">
          <div>
            {step === 3 && (
              <button
                type="button"
                onClick={() => setStep(4)}
                className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] underline cursor-pointer"
              >
                Invite later
              </button>
            )}
            {step === 5 && (
              <button
                type="button"
                onClick={handleNextStep}
                className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] underline cursor-pointer"
              >
                Skip for now
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="btn btn-secondary"
              >
                Back
              </button>
            )}

            <button
              type="button"
              disabled={
                (step === 1 && !isStep1Valid) ||
                (step === 2 && !isStep2Valid) ||
                (step === 4 && !isStep4Valid)
              }
              onClick={handleNextStep}
              className="btn btn-primary"
            >
              <span>{step === 5 ? 'Finish & Launch Studio' : 'Continue'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
