// src/components/Header.tsx
import React, { useState } from 'react';
import { CurtainTemplate } from '../types/curtain';
import { UserProfile } from '../types/auth';
import {
  Sparkles,
  PlusCircle,
  FileText,
  Download,
  Layers,
  Eye,
  User,
  HelpCircle,
  Menu,
  X,
  ChevronDown,
  Palette,
  Compass,
  Check,
  Cpu,
  Database,
  Grid,
  Maximize2,
  ExternalLink,
} from 'lucide-react';
import { useStudioStore, StudioTab } from '../lib/store';
import { providerRegistry } from '../lib/ai-providers/registry';

interface HeaderProps {
  templates: CurtainTemplate[];
  selectedTemplate: CurtainTemplate;
  onSelectTemplate: (template: CurtainTemplate) => void;
  onOpenNewTemplateModal: () => void;
  onOpenSpecModal: () => void;
  onOpenFabricLibrary: () => void;
  onExportMockup: () => void;
  hasGeneratedResult: boolean;
  currentUser: UserProfile | null;
  onOpenAuthModal: () => void;
  onOpenTourModal: () => void;
  onOpenAiSettings: () => void;
  onOpenDbSchema: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  templates,
  selectedTemplate,
  onSelectTemplate,
  onOpenNewTemplateModal,
  onOpenSpecModal,
  onOpenFabricLibrary,
  onExportMockup,
  hasGeneratedResult,
  currentUser,
  onOpenAuthModal,
  onOpenTourModal,
  onOpenAiSettings,
  onOpenDbSchema,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { activeProviderId, activeTab, setActiveTab, jobs } = useStudioStore();

  const activeProviderMeta = providerRegistry.getMetadata(activeProviderId);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <header className="bg-[#0E0F13] text-[#F9F6F0] border-b border-[#242630] sticky top-0 z-30 shadow-xl backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Left: Brand Identity */}
          <div className="flex items-center gap-3 sm:gap-6">
            <div
              className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group"
              onClick={() => setActiveTab('atelier')}
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-br from-[#F5DE8B] via-[#D4AF37] to-[#8C7322] flex items-center justify-center shadow-lg shrink-0 border border-[#F5DE8B]/30 group-hover:scale-105 transition">
                <span className="font-serif font-bold text-base sm:text-lg text-[#0A0B0E] tracking-tighter">
                  A
                </span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="font-serif text-base sm:text-lg tracking-[0.16em] font-bold text-[#F9F6F0] leading-none">
                    AATMI
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-sans font-semibold tracking-wider px-1.5 py-0.5 rounded bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 uppercase">
                    Studio
                  </span>
                </div>
                <p className="text-[10px] text-[#8C909A] font-sans tracking-wide hidden sm:block mt-0.5">
                  Haute Drapery Design & Inpainting
                </p>
              </div>
            </div>

            {/* Studio Workspace Tabs (Desktop >= 900px) */}
            <nav className="hidden md:flex items-center gap-1 bg-[#15171E] p-1 rounded-xl border border-[#272935] ml-2">
              <button
                onClick={() => setActiveTab('atelier')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'atelier'
                    ? 'bg-[#D4AF37] text-[#0A0B0E] shadow-sm'
                    : 'text-[#A0A4B0] hover:text-[#F9F6F0]'
                }`}
              >
                <Palette className="w-3.5 h-3.5" />
                <span>Atelier Canvas</span>
              </button>

              <button
                onClick={() => setActiveTab('room_viz')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'room_viz'
                    ? 'bg-[#D4AF37] text-[#0A0B0E] shadow-sm'
                    : 'text-[#A0A4B0] hover:text-[#F9F6F0]'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Room Viz</span>
              </button>

              <button
                onClick={() => setActiveTab('catalog')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'catalog'
                    ? 'bg-[#D4AF37] text-[#0A0B0E] shadow-sm'
                    : 'text-[#A0A4B0] hover:text-[#F9F6F0]'
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                <span>Library</span>
              </button>
            </nav>
          </div>

          {/* Center/Right: Modular AI Engine Pill */}
          <div className="hidden xl:flex items-center gap-2">
            <button
              onClick={onOpenAiSettings}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#171921] hover:bg-[#1E202A] rounded-xl border border-[#2D303E] hover:border-[#D4AF37]/50 transition cursor-pointer group shadow-sm"
              title="Click to configure or hot-swap AI Engine (Gemini, OpenAI, Replicate, Stability)"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-400 group-hover:scale-125 transition" />
              <div className="flex flex-col text-left">
                <span className="text-[9px] text-[#8C909A] font-mono uppercase tracking-wider leading-tight">
                  AI Model Engine
                </span>
                <span className="text-xs font-serif font-bold text-[#F9F6F0] group-hover:text-[#D4AF37] transition">
                  {activeProviderMeta?.name || 'Modular AI'}
                </span>
              </div>
              <Cpu className="w-3.5 h-3.5 text-[#D4AF37] ml-1" />
            </button>

            {/* Supabase Schema & Jobs Button */}
            <button
              onClick={onOpenDbSchema}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#171921] hover:bg-[#1E202A] rounded-xl border border-[#2D303E] text-xs font-semibold text-[#A0A4B0] hover:text-[#F9F6F0] transition cursor-pointer"
              title="Inspect Supabase PostgreSQL schema and generation queue"
            >
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span>Jobs ({jobs.length})</span>
            </button>
          </div>

          {/* Action Buttons (Desktop >= 1024px) */}
          <div className="hidden lg:flex items-center gap-2">
            {/* Template Stencil Selector */}
            <div className="relative">
              <select
                id="template-select"
                value={selectedTemplate.id}
                onChange={(e) => {
                  const t = templates.find((tpl) => tpl.id === e.target.value);
                  if (t) onSelectTemplate(t);
                }}
                className="bg-[#171921] text-[#E0E2EB] border border-[#2E313E] rounded-lg text-xs py-1.5 pl-2.5 pr-7 focus:outline-none focus:border-[#D4AF37] cursor-pointer font-medium max-w-[190px] truncate appearance-none"
              >
                {templates.map((tpl) => (
                  <option key={tpl.id} value={tpl.id}>
                    {tpl.name.split(' (')[0]} ({tpl.regions.length} zones)
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3 h-3 text-[#8C909A] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <button
              id="header-btn-upload-template"
              onClick={onOpenNewTemplateModal}
              className="flex items-center gap-1.5 text-xs bg-[#242630] hover:bg-[#2C2E3A] text-[#F9F6F0] px-3 py-2 rounded-lg border border-[#373A48] hover:border-[#D4AF37]/40 transition font-medium cursor-pointer"
              title="Add a new curtain design stencil or upload a showroom photo"
            >
              <PlusCircle className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>+ Stencil</span>
            </button>

            <button
              id="header-btn-spec-sheet"
              onClick={onOpenSpecModal}
              className="flex items-center gap-1.5 text-xs bg-[#1A1C24] hover:bg-[#22242E] text-[#E0E2EB] px-3 py-2 rounded-lg border border-[#2D303E] transition font-medium cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-blue-400" />
              <span>Spec Sheet</span>
            </button>

            <button
              id="header-btn-export"
              onClick={onExportMockup}
              className="flex items-center gap-1.5 text-xs bg-gradient-to-r from-[#D4AF37] to-[#B59128] hover:from-[#E5C058] hover:to-[#C6A035] text-[#0A0B0E] font-bold px-3 py-2 rounded-lg shadow-md transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#0A0B0E]" />
              <span>Export HD</span>
            </button>

            {/* User Profile / Auth Button */}
            <button
              id="header-btn-auth"
              onClick={onOpenAuthModal}
              className="flex items-center gap-2 text-xs py-1.5 px-2.5 rounded-lg border border-[#2D303E] bg-[#16171E] hover:bg-[#1E2028] transition cursor-pointer font-medium ml-1"
              title={currentUser ? `Signed in as ${currentUser.name}` : 'Sign in'}
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#8C7322] text-[#0A0B0E] font-bold flex items-center justify-center text-[11px]">
                {currentUser ? currentUser.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="flex flex-col text-left leading-tight hidden xl:flex">
                <span className="text-[11px] font-semibold text-[#F9F6F0] truncate max-w-[80px]">
                  {currentUser ? currentUser.name : 'Atelier Designer'}
                </span>
                <span className="text-[9px] text-[#D4AF37] font-mono">
                  {currentUser ? currentUser.role : 'Pro'}
                </span>
              </div>
            </button>
          </div>

          {/* Compact Actions for Mobile & Tablet (< 1024px) */}
          <div className="flex lg:hidden items-center gap-2">
            {/* Engine Quick Button */}
            <button
              onClick={onOpenAiSettings}
              className="p-2 text-[#D4AF37] bg-[#171921] border border-[#2D303E] rounded-lg cursor-pointer"
              title="AI Provider Settings"
            >
              <Cpu className="w-4 h-4" />
            </button>

            {/* Quick Export Button */}
            <button
              onClick={onExportMockup}
              className="p-2 text-[#D4AF37] bg-[#171921] border border-[#2D303E] rounded-lg cursor-pointer transition"
              title="Export HD curtain photo"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Hamburger / Menu toggle */}
            <button
              id="mobile-menu-toggle"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-[#E0E2EB] bg-[#171921] border border-[#2D303E] hover:bg-[#22242E] rounded-lg cursor-pointer transition flex items-center justify-center"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5 text-[#D4AF37]" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Slide-Over Luxury Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-sm ml-auto h-full bg-[#121318] border-l border-[#242630] p-5 flex flex-col shadow-2xl overflow-y-auto">
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#242630]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-gradient-to-br from-[#D4AF37] to-[#8C7322] flex items-center justify-center text-[#0A0B0E] font-serif font-bold text-sm">
                  A
                </div>
                <div>
                  <h3 className="font-serif text-sm font-bold text-[#F9F6F0] tracking-wider">
                    AATMI STUDIO
                  </h3>
                  <p className="text-[10px] text-[#8C909A] font-sans">
                    Modular AI Drapery Suite
                  </p>
                </div>
              </div>
              <button
                onClick={closeMobileMenu}
                className="p-1.5 text-[#8C909A] hover:text-[#F9F6F0] rounded-lg hover:bg-[#1A1C23] transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="py-4 border-b border-[#242630] space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#D4AF37] font-semibold block">
                Studio View
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => {
                    setActiveTab('atelier');
                    closeMobileMenu();
                  }}
                  className={`p-2 rounded-lg text-xs font-semibold flex flex-col items-center gap-1 ${
                    activeTab === 'atelier'
                      ? 'bg-[#D4AF37] text-[#0A0B0E]'
                      : 'bg-[#181A22] text-[#A0A4B0]'
                  }`}
                >
                  <Palette className="w-4 h-4" />
                  <span>Atelier</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('room_viz');
                    closeMobileMenu();
                  }}
                  className={`p-2 rounded-lg text-xs font-semibold flex flex-col items-center gap-1 ${
                    activeTab === 'room_viz'
                      ? 'bg-[#D4AF37] text-[#0A0B0E]'
                      : 'bg-[#181A22] text-[#A0A4B0]'
                  }`}
                >
                  <Compass className="w-4 h-4" />
                  <span>Room Viz</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('catalog');
                    closeMobileMenu();
                  }}
                  className={`p-2 rounded-lg text-xs font-semibold flex flex-col items-center gap-1 ${
                    activeTab === 'catalog'
                      ? 'bg-[#D4AF37] text-[#0A0B0E]'
                      : 'bg-[#181A22] text-[#A0A4B0]'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                  <span>Library</span>
                </button>
              </div>
            </div>

            {/* AI Engine & Database Options in Mobile Drawer */}
            <div className="py-4 border-b border-[#242630] space-y-2">
              <button
                onClick={() => {
                  onOpenAiSettings();
                  closeMobileMenu();
                }}
                className="w-full flex items-center justify-between p-3 bg-[#181A22] rounded-xl border border-[#2A2D3A] text-xs"
              >
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-[#D4AF37]" />
                  <span className="font-semibold text-[#F9F6F0]">AI Provider Settings</span>
                </div>
                <span className="text-[10px] text-[#D4AF37] font-mono uppercase font-bold">
                  {activeProviderId}
                </span>
              </button>

              <button
                onClick={() => {
                  onOpenDbSchema();
                  closeMobileMenu();
                }}
                className="w-full flex items-center justify-between p-3 bg-[#181A22] rounded-xl border border-[#2A2D3A] text-xs"
              >
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-400" />
                  <span className="font-semibold text-[#F9F6F0]">Supabase Database & Jobs</span>
                </div>
                <span className="text-[10px] text-emerald-400 font-mono font-bold">
                  {jobs.length} Jobs
                </span>
              </button>
            </div>

            {/* Stencil / Design Switcher in Drawer */}
            <div className="py-4 border-b border-[#242630] space-y-2">
              <label className="text-[11px] font-semibold text-[#D4AF37] uppercase tracking-wider block">
                Active Silhouette / Stencil:
              </label>
              <div className="space-y-1">
                {templates.map((tpl) => (
                  <button
                    key={tpl.id}
                    onClick={() => {
                      onSelectTemplate(tpl);
                      closeMobileMenu();
                    }}
                    className={`w-full text-left p-2.5 rounded-lg text-xs flex items-center justify-between transition ${
                      tpl.id === selectedTemplate.id
                        ? 'bg-[#1C1E26] text-[#D4AF37] border border-[#D4AF37]/30 font-bold'
                        : 'text-[#A0A4B0] hover:bg-[#181A22]'
                    }`}
                  >
                    <span>{tpl.name}</span>
                    <span className="text-[10px] font-mono opacity-70">
                      {tpl.regions.length} zones
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Actions List in Drawer */}
            <div className="py-4 space-y-2">
              <button
                onClick={() => {
                  onOpenNewTemplateModal();
                  closeMobileMenu();
                }}
                className="w-full flex items-center gap-2.5 p-2.5 rounded-lg text-xs text-[#E0E2EB] hover:bg-[#181A22] border border-[#2A2D3A]"
              >
                <PlusCircle className="w-4 h-4 text-[#D4AF37]" />
                <span>Add Stencil</span>
              </button>

              <button
                onClick={() => {
                  onOpenSpecModal();
                  closeMobileMenu();
                }}
                className="w-full flex items-center gap-2.5 p-2.5 rounded-lg text-xs text-[#E0E2EB] hover:bg-[#181A22] border border-[#2A2D3A]"
              >
                <FileText className="w-4 h-4 text-blue-400" />
                <span>Designer Spec Sheet</span>
              </button>

              <button
                onClick={() => {
                  onOpenTourModal();
                  closeMobileMenu();
                }}
                className="w-full flex items-center gap-2.5 p-2.5 rounded-lg text-xs text-[#E0E2EB] hover:bg-[#181A22] border border-[#2A2D3A]"
              >
                <HelpCircle className="w-4 h-4 text-[#D4AF37]" />
                <span>Platform Guide</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
