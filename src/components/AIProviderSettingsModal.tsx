// src/components/AIProviderSettingsModal.tsx
import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Key,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Cpu,
  Layers,
  Eye,
  EyeOff,
  Radio,
  Sliders,
} from 'lucide-react';
import { useStudioStore } from '../lib/store';
import { providerRegistry } from '../lib/ai-providers/registry';
import { AIProviderId } from '../lib/ai-providers/types';

interface AIProviderSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIProviderSettingsModal: React.FC<AIProviderSettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    activeProviderId,
    setActiveProviderId,
    apiKeys,
    setApiKey,
    isTestingConnection,
    connectionTestResult,
    testProviderConnection,
  } = useStudioStore();

  const [selectedProviderId, setSelectedProviderId] = useState<AIProviderId>(activeProviderId);
  const [inputKey, setInputKey] = useState<string>(apiKeys[activeProviderId] || '');
  const [showKey, setShowKey] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const allMetadatas = providerRegistry.getAllMetadata();
  const currentMeta = allMetadatas.find((m) => m.id === selectedProviderId) || allMetadatas[0];

  const handleSelectProvider = (id: AIProviderId) => {
    setSelectedProviderId(id);
    setInputKey(apiKeys[id] || '');
    setSavedSuccess(false);
  };

  const handleSaveKey = () => {
    setApiKey(selectedProviderId, inputKey);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleActivateProvider = (id: AIProviderId) => {
    setActiveProviderId(id);
    handleSelectProvider(id);
  };

  const hasKeyConfigured = Boolean(apiKeys[selectedProviderId] && apiKeys[selectedProviderId].length > 5);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#121316] border border-[#2B2D33] text-[#F9F6F0] rounded-2xl shadow-2xl max-w-3xl w-full h-full sm:h-auto max-h-[96vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#25272D] flex items-center justify-between bg-[#0E0F12]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#8C7322] flex items-center justify-center text-[#0D0E10] font-bold shadow-md">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-base sm:text-lg font-bold tracking-wide text-[#F9F6F0]">
                  Modular AI Provider Architecture
                </h3>
                <span className="text-[10px] font-mono uppercase tracking-wider bg-[#D4AF37]/15 text-[#D4AF37] px-2 py-0.5 rounded-full border border-[#D4AF37]/30">
                  Adapter Pattern
                </span>
              </div>
              <p className="text-xs text-[#8C909A]">
                Hot-swap image generation, inpainting, and VLM models seamlessly without vendor lock-in.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#8C909A] hover:text-[#F9F6F0] hover:bg-[#1E2026] rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-6 bg-[#121316]">
          {/* Provider Selection Column */}
          <div className="md:col-span-5 space-y-2.5">
            <label className="text-[11px] font-mono uppercase tracking-wider text-[#D4AF37] font-semibold block mb-1">
              Select AI Engine
            </label>

            {allMetadatas.map((meta) => {
              const isSelected = selectedProviderId === meta.id;
              const isActive = activeProviderId === meta.id;
              const hasKey = Boolean(apiKeys[meta.id] && apiKeys[meta.id].length > 5);

              return (
                <div
                  key={meta.id}
                  onClick={() => handleSelectProvider(meta.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer relative ${
                    isSelected
                      ? 'bg-[#1C1E24] border-[#D4AF37] shadow-lg ring-1 ring-[#D4AF37]/40'
                      : 'bg-[#15161B] border-[#25272E] hover:border-[#3A3E48] hover:bg-[#191A20]'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-serif text-sm font-bold text-[#F9F6F0]">
                          {meta.name}
                        </span>
                        {isActive && (
                          <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-mono font-semibold border border-emerald-500/30">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#A0A4AE] mt-0.5 leading-snug">
                        {meta.tagline}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {hasKey ? (
                        <span
                          className="w-2 h-2 rounded-full bg-emerald-400"
                          title="API key configured"
                        />
                      ) : (
                        <span
                          className="w-2 h-2 rounded-full bg-amber-500/80"
                          title="Key optional or using server env"
                        />
                      )}
                    </div>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-[#262830] flex items-center justify-between text-[10px] text-[#7A7E89]">
                    <span className="font-mono">{meta.modelFamily.split('/')[0]}</span>
                    {isActive ? (
                      <span className="text-[#D4AF37] font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Default
                      </span>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleActivateProvider(meta.id);
                        }}
                        className="text-[#D4AF37] hover:underline font-semibold"
                      >
                        Set as Active →
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Configuration & Detail Column */}
          <div className="md:col-span-7 flex flex-col justify-between space-y-5 bg-[#17181E] p-4 sm:p-5 rounded-xl border border-[#272932]">
            <div>
              {/* Provider Title & Active Switch */}
              <div className="flex items-center justify-between pb-3 border-b border-[#2A2C35]">
                <div>
                  <h4 className="font-serif text-base font-bold text-[#F9F6F0]">
                    {currentMeta.name}
                  </h4>
                  <p className="text-xs text-[#8E93A0]">
                    {currentMeta.company} · {currentMeta.defaultModel}
                  </p>
                </div>

                {activeProviderId === currentMeta.id ? (
                  <span className="text-xs bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40 px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Engine In Use
                  </span>
                ) : (
                  <button
                    onClick={() => handleActivateProvider(currentMeta.id)}
                    className="text-xs bg-[#D4AF37] hover:bg-[#E5C058] text-[#0D0E10] font-bold px-3 py-1.5 rounded-lg transition cursor-pointer shadow-md"
                  >
                    Activate {currentMeta.name}
                  </button>
                )}
              </div>

              {/* Description */}
              <p className="text-xs text-[#C5C8D1] mt-3 leading-relaxed">
                {currentMeta.description}
              </p>

              {/* Supported Capabilities Grid */}
              <div className="mt-4">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#8E93A0] font-semibold block mb-2">
                  Engine Capabilities
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-[#1D1F26] p-2 rounded-lg border border-[#2B2E37] flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        currentMeta.supportedFeatures.vlmRegionDetection
                          ? 'bg-emerald-400'
                          : 'bg-stone-600'
                      }`}
                    />
                    <span className="text-[#E0E2EC]">VLM Region Detection</span>
                  </div>

                  <div className="bg-[#1D1F26] p-2 rounded-lg border border-[#2B2E37] flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        currentMeta.supportedFeatures.maskedInpainting
                          ? 'bg-emerald-400'
                          : 'bg-stone-600'
                      }`}
                    />
                    <span className="text-[#E0E2EC]">Masked Inpainting</span>
                  </div>

                  <div className="bg-[#1D1F26] p-2 rounded-lg border border-[#2B2E37] flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        currentMeta.supportedFeatures.sequentialRefinement
                          ? 'bg-emerald-400'
                          : 'bg-stone-600'
                      }`}
                    />
                    <span className="text-[#E0E2EC]">Sequential Refinement</span>
                  </div>

                  <div className="bg-[#1D1F26] p-2 rounded-lg border border-[#2B2E37] flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        currentMeta.supportedFeatures.roomVisualization
                          ? 'bg-emerald-400'
                          : 'bg-stone-600'
                      }`}
                    />
                    <span className="text-[#E0E2EC]">Room Visualization</span>
                  </div>
                </div>
              </div>

              {/* API Key Input Section */}
              <div className="mt-5 pt-4 border-t border-[#2A2C35] space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-[#D4AF37] font-semibold flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5" />
                    API Key / Token ({currentMeta.envKeyName})
                  </label>
                  <a
                    href={currentMeta.apiKeyHelpUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-[#A68832] hover:text-[#D4AF37] flex items-center gap-1 hover:underline"
                  >
                    <span>Get Key</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="relative">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={inputKey}
                    onChange={(e) => setInputKey(e.target.value)}
                    placeholder={`Enter your ${currentMeta.name} secret key...`}
                    className="w-full bg-[#121316] border border-[#2F323C] text-[#F9F6F0] text-xs px-3 py-2 pr-20 rounded-lg focus:outline-none focus:border-[#D4AF37] font-mono placeholder:text-[#5E626E]"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      className="p-1 text-[#8C909A] hover:text-[#F9F6F0] cursor-pointer"
                    >
                      {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveKey}
                      className="text-[11px] bg-[#D4AF37] hover:bg-[#E5C058] text-[#0D0E10] font-bold px-2 py-0.5 rounded cursor-pointer transition"
                    >
                      Save
                    </button>
                  </div>
                </div>

                {savedSuccess && (
                  <p className="text-[11px] text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Key saved to profile configuration.
                  </p>
                )}

                <p className="text-[10px] text-[#7A7E89]">
                  Keys are stored encrypted in your designer profile. If left blank, Aatmi Studio will utilize the server environment default credentials when available.
                </p>
              </div>
            </div>

            {/* Test Connection Footer */}
            <div className="pt-4 border-t border-[#2A2C35] space-y-3">
              <div className="flex items-center justify-between gap-3">
                <button
                  onClick={() => testProviderConnection(selectedProviderId)}
                  disabled={isTestingConnection}
                  className="flex items-center gap-2 text-xs bg-[#24262E] hover:bg-[#2C2E38] text-[#F9F6F0] font-semibold px-4 py-2 rounded-lg border border-[#353843] transition cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-[#D4AF37] ${isTestingConnection ? 'animate-spin' : ''}`} />
                  <span>{isTestingConnection ? 'Testing Ping...' : 'Test Connection'}</span>
                </button>

                <div className="text-right">
                  <span className="text-[10px] text-[#8C909A] block font-mono">
                    Provider: {currentMeta.id}
                  </span>
                  <span className="text-[11px] text-[#D4AF37] font-semibold block">
                    {currentMeta.defaultModel}
                  </span>
                </div>
              </div>

              {/* Connection Result Message */}
              {connectionTestResult && (
                <div
                  className={`p-2.5 rounded-lg text-xs flex items-start gap-2 border ${
                    connectionTestResult.success
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                      : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                  }`}
                >
                  {connectionTestResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="font-semibold">{connectionTestResult.message}</p>
                    {connectionTestResult.latencyMs > 0 && (
                      <span className="text-[10px] opacity-75 font-mono">
                        Roundtrip Latency: {connectionTestResult.latencyMs}ms
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-[#25272D] bg-[#0E0F12] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-[#8C909A]">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Multi-tenant SaaS Architecture · Supabase Auth & Storage Ready</span>
          </div>

          <button
            onClick={onClose}
            className="bg-[#D4AF37] hover:bg-[#E5C058] text-[#0D0E10] font-bold px-4 py-1.5 rounded-lg transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
