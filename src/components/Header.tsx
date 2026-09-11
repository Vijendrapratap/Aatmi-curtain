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
    <header className="bg-[#F0EBE4]/95 backdrop-blur-xl text-[#1A1714] border-b border-[#E2D9CE] sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18 gap-2 sm:gap-4">
          
          {/* ========================================================= */}
          {/* Zone 1: Left Brand Emblem & Active Project Breadcrumb     */}
          {/* ========================================================= */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0 min-w-0">
            <div
              className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group select-none"
              onClick={() => setActiveTab('atelier')}
              title="Aatmi Haute Atelier Home"
            >
              {/* Luxury Gold Monogram */}
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-[#F5DE8B] via-[#D4AF37] to-[#8C7322] flex items-center justify-center shadow-xs shrink-0 border border-[#F5DE8B]/40 group-hover:scale-105 transition duration-200">
                <span className="font-serif font-bold text-base sm:text-lg text-[#0A0B0E] tracking-tight">
                  A
                </span>
              </div>

              {/* Brand Wordmark */}
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="font-serif text-base sm:text-lg tracking-[0.2em] font-bold text-[#1A1714] leading-none">
                    AATMI
                  </span>
                  <span className="text-[9px] font-mono font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#FFF8E6] text-[#C49A1E] border border-[#C49A1E]/30 uppercase">
                    Atelier
                  </span>
                </div>
                <p className="text-[10px] text-[#9E9088] font-sans tracking-wide hidden sm:block mt-0.5">
                  Haute Drapery Design Suite
                </p>
              </div>
            </div>

            {/* Breadcrumb divider & Active Silhouette Badge (Desktop >= 1180px) */}
            <div className="hidden xl:flex items-center gap-2.5 pl-3 border-l border-[#D8CFC3] min-w-0">
              <span className="text-xs text-[#9E9088] font-sans truncate">Bespoke /</span>
              <button
                type="button"
                onClick={() => {
                  const selectEl = document.getElementById('template-select');
                  if (selectEl) selectEl.focus();
                }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/70 border border-[#D8CFC3] text-xs font-serif font-semibold text-[#1A1714] hover:border-[#C49A1E] transition truncate max-w-[200px]"
                title="Active design silhouette"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#C49A1E]" />
                <span className="truncate">{selectedTemplate.name.split(' (')[0]}</span>
                <span className="text-[10px] font-mono text-[#9E9088]">
                  ({selectedTemplate.regions.length}z)
                </span>
              </button>
            </div>
          </div>

          {/* ========================================================= */}
          {/* Zone 2: Center Studio Segmented Control                   */}
          {/* ========================================================= */}
          <nav className="hidden md:flex items-center p-1 bg-[#E8E2DA] rounded-2xl border border-[#D4C9BC] shadow-2xs">
            <button
              onClick={() => setActiveTab('atelier')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 tactile-press ${
                activeTab === 'atelier'
                  ? 'bg-white text-[#1A1714] font-bold shadow-xs border border-[#E2D9CE]'
                  : 'text-[#6B5F54] hover:text-[#1A1714] hover:bg-white/40'
              }`}
            >
              <Palette className="w-3.5 h-3.5 text-[#C49A1E]" />
              <span>Atelier Studio</span>
            </button>

            <button
              onClick={() => setActiveTab('room_viz')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 tactile-press ${
                activeTab === 'room_viz'
                  ? 'bg-white text-[#1A1714] font-bold shadow-xs border border-[#E2D9CE]'
                  : 'text-[#6B5F54] hover:text-[#1A1714] hover:bg-white/40'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-[#C49A1E]" />
              <span>Room Viz</span>
            </button>

            <button
              onClick={() => setActiveTab('catalogs')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 tactile-press ${
                activeTab === 'catalogs' || activeTab === 'catalog'
                  ? 'bg-white text-[#1A1714] font-bold shadow-xs border border-[#E2D9CE]'
                  : 'text-[#6B5F54] hover:text-[#1A1714] hover:bg-white/40'
              }`}
            >
              <Grid className="w-3.5 h-3.5 text-[#C49A1E]" />
              <span>Materials</span>
            </button>
          </nav>

          {/* ========================================================= */}
          {/* Zone 3: Right Utility Palette, Spec Sheet & Export CTA    */}
          {/* ========================================================= */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            
            {/* Modular AI Engine Capsule (Desktop >= 1024px) */}
            <button
              onClick={onOpenAiSettings}
              className="hidden lg:flex items-center gap-2 px-2.5 py-1.5 bg-white border border-[#D4C9BC] hover:border-[#C49A1E] rounded-xl transition cursor-pointer shadow-2xs tactile-press"
              title="AI Provider Settings (Configure or swap Gemini, OpenAI, Replicate, Stability)"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <div className="flex flex-col text-left leading-none">
                <span className="text-[9px] text-[#9E9088] font-mono uppercase tracking-wider">
                  AI Model
                </span>
                <span className="text-[11px] font-serif font-bold text-[#1A1714]">
                  {activeProviderMeta?.name || 'Modular AI'}
                </span>
              </div>
              <Cpu className="w-3.5 h-3.5 text-[#C49A1E] ml-0.5" />
            </button>

            {/* Spec Sheet Modal Trigger */}
            <button
              id="header-btn-spec-sheet"
              onClick={onOpenSpecModal}
              className="hidden sm:flex items-center gap-1.5 text-xs bg-white hover:bg-[#F8F5F0] text-[#1A1714] px-3 py-2 rounded-xl border border-[#D4C9BC] hover:border-[#C49A1E] transition font-medium cursor-pointer tactile-press shadow-2xs"
              title="Inspect architectural specifications and fabric cut docket"
            >
              <FileText className="w-3.5 h-3.5 text-[#C49A1E]" />
              <span>Spec Sheet</span>
            </button>

            {/* Primary Export CTA Button */}
            <button
              id="header-btn-export"
              onClick={onExportMockup}
              className="flex items-center gap-1.5 text-xs bg-gradient-to-r from-[#F5DE8B] via-[#D4AF37] to-[#8C7322] hover:brightness-105 text-[#0A0B0E] font-bold px-3 sm:px-4 py-2 rounded-xl shadow-xs transition cursor-pointer tactile-press border border-[#F5DE8B]/50"
              title="Export high-resolution drapery photograph"
            >
              <Download className="w-3.5 h-3.5 text-[#0A0B0E]" />
              <span className="hidden xs:inline">Export HD</span>
            </button>

            {/* User Profile / Auth Button */}
            <button
              id="header-btn-auth"
              onClick={onOpenAuthModal}
              className="flex items-center gap-2 text-xs p-1 sm:py-1.5 sm:px-2.5 rounded-xl border border-[#D4C9BC] bg-white hover:bg-[#F8F5F0] transition cursor-pointer font-medium tactile-press shadow-2xs"
              title={currentUser ? `Signed in as ${currentUser.name}` : 'Sign in to Atelier'}
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#D4AF37] to-[#8C7322] text-[#0A0B0E] font-bold flex items-center justify-center text-xs shadow-2xs">
                {currentUser ? currentUser.name.charAt(0).toUpperCase() : 'E'}
              </div>
              <div className="flex flex-col text-left leading-tight hidden xl:flex">
                <span className="text-[11px] font-semibold text-[#1A1714] truncate max-w-[85px]">
                  {currentUser ? currentUser.name : 'Elena Vance'}
                </span>
                <span className="text-[9px] text-[#C49A1E] font-mono">
                  {currentUser ? currentUser.role : 'Lead Designer'}
                </span>
              </div>
            </button>

            {/* Mobile Hamburger / Menu Toggle */}
            <button
              id="mobile-menu-toggle"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-[#1A1714] bg-white border border-[#D4C9BC] hover:bg-[#F8F5F0] rounded-xl cursor-pointer transition flex items-center justify-center tactile-press shadow-2xs"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5 text-[#C49A1E]" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* Mobile Slide-Over Luxury Drawer                           */}
      {/* ========================================================= */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm ml-auto h-full bg-[#FDFCFA] border-l border-[#E2D9CE] p-5 flex flex-col shadow-2xl overflow-y-auto">
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#E2D9CE]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#F5DE8B] via-[#D4AF37] to-[#8C7322] flex items-center justify-center text-[#0A0B0E] font-serif font-bold text-sm shadow-xs">
                  A
                </div>
                <div>
                  <h3 className="font-serif text-sm font-bold text-[#1A1714] tracking-wider">
                    AATMI STUDIO
                  </h3>
                  <p className="text-[10px] text-[#9E9088] font-sans">
                    Haute Drapery Design Suite
                  </p>
                </div>
              </div>
              <button
                onClick={closeMobileMenu}
                className="p-1.5 text-[#6B5F54] hover:text-[#1A1714] rounded-lg hover:bg-[#EDE7DF] transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Studio Workspaces Navigation */}
            <div className="py-4 border-b border-[#E2D9CE] space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#C49A1E] font-bold block">
                Studio Workspace
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => {
                    setActiveTab('atelier');
                    closeMobileMenu();
                  }}
                  className={`p-2.5 rounded-xl text-xs font-semibold flex flex-col items-center gap-1.5 transition ${
                    activeTab === 'atelier'
                      ? 'bg-[#C49A1E] text-white shadow-xs'
                      : 'bg-[#F0EBE4] text-[#6B5F54] hover:text-[#1A1714]'
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
                  className={`p-2.5 rounded-xl text-xs font-semibold flex flex-col items-center gap-1.5 transition ${
                    activeTab === 'room_viz'
                      ? 'bg-[#C49A1E] text-white shadow-xs'
                      : 'bg-[#F0EBE4] text-[#6B5F54] hover:text-[#1A1714]'
                  }`}
                >
                  <Compass className="w-4 h-4" />
                  <span>Room Viz</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('catalogs');
                    closeMobileMenu();
                  }}
                  className={`p-2.5 rounded-xl text-xs font-semibold flex flex-col items-center gap-1.5 transition ${
                    activeTab === 'catalogs' || activeTab === 'catalog'
                      ? 'bg-[#C49A1E] text-white shadow-xs'
                      : 'bg-[#F0EBE4] text-[#6B5F54] hover:text-[#1A1714]'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                  <span>Materials</span>
                </button>
              </div>
            </div>

            {/* AI Engine & Database Options in Mobile Drawer */}
            <div className="py-4 border-b border-[#E2D9CE] space-y-2">
              <button
                onClick={() => {
                  onOpenAiSettings();
                  closeMobileMenu();
                }}
                className="w-full flex items-center justify-between p-3 bg-white hover:bg-[#F8F5F0] rounded-xl border border-[#D4C9BC] text-xs transition"
              >
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-[#C49A1E]" />
                  <span className="font-semibold text-[#1A1714]">AI Provider Settings</span>
                </div>
                <span className="text-[10px] text-[#C49A1E] font-mono uppercase font-bold">
                  {activeProviderId}
                </span>
              </button>

              <button
                onClick={() => {
                  onOpenDbSchema();
                  closeMobileMenu();
                }}
                className="w-full flex items-center justify-between p-3 bg-white hover:bg-[#F8F5F0] rounded-xl border border-[#D4C9BC] text-xs transition"
              >
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold text-[#1A1714]">PostgreSQL Queue</span>
                </div>
                <span className="text-[10px] text-emerald-600 font-mono font-bold">
                  {jobs.length} Jobs
                </span>
              </button>
            </div>

            {/* Stencil / Design Switcher in Drawer */}
            <div className="py-4 border-b border-[#E2D9CE] space-y-2">
              <label className="text-[11px] font-semibold text-[#C49A1E] uppercase tracking-wider block">
                Active Silhouette:
              </label>
              <div className="space-y-1 max-h-[160px] overflow-y-auto">
                {templates.map((tpl) => (
                  <button
                    key={tpl.id}
                    onClick={() => {
                      onSelectTemplate(tpl);
                      closeMobileMenu();
                    }}
                    className={`w-full text-left p-2.5 rounded-xl text-xs flex items-center justify-between transition ${
                      tpl.id === selectedTemplate.id
                        ? 'bg-[#FFF8E6] text-[#C49A1E] border border-[#C49A1E]/40 font-bold'
                        : 'text-[#6B5F54] hover:bg-[#F0EBE4] hover:text-[#1A1714]'
                    }`}
                  >
                    <span className="truncate">{tpl.name}</span>
                    <span className="text-[10px] font-mono opacity-70 shrink-0 ml-1">
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
                className="w-full flex items-center gap-2.5 p-2.5 rounded-xl text-xs text-[#1A1714] bg-white hover:bg-[#F8F5F0] border border-[#D4C9BC] font-medium transition"
              >
                <PlusCircle className="w-4 h-4 text-[#C49A1E]" />
                <span>+ Upload Brand Design</span>
              </button>

              <button
                onClick={() => {
                  onOpenSpecModal();
                  closeMobileMenu();
                }}
                className="w-full flex items-center gap-2.5 p-2.5 rounded-xl text-xs text-[#1A1714] bg-white hover:bg-[#F8F5F0] border border-[#D4C9BC] font-medium transition"
              >
                <FileText className="w-4 h-4 text-[#C49A1E]" />
                <span>Designer Spec Sheet</span>
              </button>

              <button
                onClick={() => {
                  onOpenTourModal();
                  closeMobileMenu();
                }}
                className="w-full flex items-center gap-2.5 p-2.5 rounded-xl text-xs text-[#6B5F54] hover:text-[#1A1714] bg-white hover:bg-[#F8F5F0] border border-[#D4C9BC] font-medium transition"
              >
                <HelpCircle className="w-4 h-4 text-[#C49A1E]" />
                <span>Studio Tour &amp; Shortcuts</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

