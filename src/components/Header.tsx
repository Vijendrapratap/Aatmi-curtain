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
  Check
} from 'lucide-react';

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
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <header className="bg-[#141517] text-stone-100 border-b border-[#2A2C30] sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Brand Identity */}
          <div className="flex items-center gap-3 sm:gap-6">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-br from-[#E2C37A] via-[#C8A452] to-[#8F6C1E] flex items-center justify-center shadow-md shrink-0 border border-amber-300/30">
                <span className="font-serif font-bold text-base sm:text-lg text-stone-950 tracking-tighter">A</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="font-serif text-lg sm:text-xl tracking-[0.18em] font-bold text-stone-100 leading-none">
                    AATMI
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-sans font-semibold tracking-widest px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 uppercase">
                    Atelier AI
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-stone-400 font-sans tracking-wide hidden xs:block mt-0.5">
                  Haute Couture Multi-Zone Drapery Studio
                </p>
              </div>
            </div>

            {/* Template Selector dropdown (Desktop & Tablet) */}
            <div className="hidden md:flex items-center gap-2 pl-4 border-l border-stone-800">
              <span className="text-xs text-stone-400 font-medium">Design / Stencil:</span>
              <div className="relative">
                <select
                  id="template-select"
                  value={selectedTemplate.id}
                  onChange={(e) => {
                    const t = templates.find((tpl) => tpl.id === e.target.value);
                    if (t) onSelectTemplate(t);
                  }}
                  className="bg-stone-900/90 text-stone-200 border border-stone-700/80 rounded-lg text-xs py-1.5 pl-3 pr-8 focus:outline-none focus:border-amber-400 cursor-pointer font-medium max-w-[240px] lg:max-w-[280px] truncate appearance-none"
                >
                  {templates.map((tpl) => (
                    <option key={tpl.id} value={tpl.id}>
                      {tpl.name.split(' (')[0]} ({tpl.regions.length} zones)
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-stone-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Action Buttons (Desktop >= 1024px) */}
          <div className="hidden lg:flex items-center gap-2">
            {/* Guide & Tour */}
            <button
              id="header-btn-tour"
              onClick={onOpenTourModal}
              className="flex items-center gap-1.5 text-xs bg-stone-900 hover:bg-stone-850 text-amber-300/90 hover:text-amber-200 px-3 py-2 rounded-lg border border-stone-750 hover:border-amber-500/40 transition font-medium cursor-pointer"
              title="Learn how Aatmi empowers interior designers and luxury clients"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>How It Works</span>
            </button>

            <button
              id="header-btn-upload-template"
              onClick={onOpenNewTemplateModal}
              className="flex items-center gap-1.5 text-xs bg-gradient-to-r from-amber-800 to-amber-700 hover:from-amber-700 hover:to-amber-600 text-amber-100 px-3 py-2 rounded-lg border border-amber-600/50 transition font-medium cursor-pointer shadow-xs"
              title="Add a new curtain design stencil or upload a real showroom photo"
            >
              <PlusCircle className="w-3.5 h-3.5 text-amber-300" />
              <span>+ Add Stencil</span>
            </button>

            <button
              id="header-btn-fabric-library"
              onClick={onOpenFabricLibrary}
              className="flex items-center gap-1.5 text-xs bg-stone-850 hover:bg-stone-800 text-stone-200 px-3 py-2 rounded-lg border border-stone-700 transition font-medium cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              <span>Fabrics (13)</span>
            </button>

            <button
              id="header-btn-spec-sheet"
              onClick={onOpenSpecModal}
              className="flex items-center gap-1.5 text-xs bg-stone-850 hover:bg-stone-800 text-stone-200 px-3 py-2 rounded-lg border border-stone-700 transition font-medium cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-blue-400" />
              <span>Spec Sheet</span>
            </button>

            <button
              id="header-btn-export"
              onClick={onExportMockup}
              className="flex items-center gap-1.5 text-xs bg-gradient-to-r from-[#C8A452] to-[#B5913F] hover:from-[#D4AF5B] hover:to-[#C29E48] text-stone-950 font-semibold px-3 py-2 rounded-lg shadow-sm transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-stone-950" />
              <span>Export HD</span>
            </button>

            {/* User Profile / Auth Button */}
            <button
              id="header-btn-auth"
              onClick={onOpenAuthModal}
              className={`flex items-center gap-2 text-xs py-1.5 px-3 rounded-lg border transition cursor-pointer font-medium ml-1 ${
                currentUser
                  ? 'bg-stone-900 hover:bg-stone-850 text-stone-200 border-stone-700'
                  : 'bg-gradient-to-r from-amber-500/20 to-amber-600/20 hover:from-amber-500/30 hover:to-amber-600/30 text-amber-300 border-amber-500/40'
              }`}
              title={currentUser ? `Signed in as ${currentUser.name} (${currentUser.role})` : 'Sign in or explore demo profile'}
            >
              {currentUser ? (
                <>
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-stone-950 font-bold flex items-center justify-center text-[11px] shadow-xs">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col text-left leading-none">
                    <span className="text-[11px] font-semibold text-stone-200 truncate max-w-[90px]">
                      {currentUser.name}
                    </span>
                    <span className="text-[9px] text-amber-400 font-mono capitalize">
                      {currentUser.role === 'designer' ? 'Designer' : currentUser.role === 'brand_partner' ? 'Showroom' : 'Client'}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <User className="w-3.5 h-3.5 text-amber-400" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </div>

          {/* Compact Actions for Mobile & Tablet (< 1024px) */}
          <div className="flex lg:hidden items-center gap-2">
            {/* Quick Export Button */}
            <button
              onClick={onExportMockup}
              className="p-2 text-amber-300 bg-stone-900 border border-stone-750 hover:bg-stone-850 rounded-lg cursor-pointer transition"
              title="Export HD curtain photo"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* User Avatar Chip */}
            <button
              onClick={onOpenAuthModal}
              className="p-1.5 bg-stone-900 border border-stone-750 hover:bg-stone-850 rounded-lg cursor-pointer transition flex items-center justify-center"
              title="User profile"
            >
              {currentUser ? (
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-stone-950 font-bold flex items-center justify-center text-[10px]">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
              ) : (
                <User className="w-4 h-4 text-amber-400" />
              )}
            </button>

            {/* Hamburger / Menu toggle */}
            <button
              id="mobile-menu-toggle"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-stone-200 bg-stone-850 border border-stone-700 hover:bg-stone-800 rounded-lg cursor-pointer transition flex items-center justify-center"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5 text-amber-400" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Slide-Over Luxury Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col bg-stone-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-sm ml-auto h-full bg-[#161719] border-l border-stone-800 p-5 flex flex-col shadow-2xl overflow-y-auto">
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-4 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-stone-950 font-serif font-bold text-sm">
                  A
                </div>
                <div>
                  <h3 className="font-serif text-sm font-bold text-stone-100 tracking-wider">AATMI ATELIER</h3>
                  <p className="text-[10px] text-stone-400 font-sans">Haute Drapery Design Suite</p>
                </div>
              </div>
              <button
                onClick={closeMobileMenu}
                className="p-1.5 text-stone-400 hover:text-stone-100 rounded-lg hover:bg-stone-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stencil / Design Switcher in Drawer */}
            <div className="py-4 border-b border-stone-800 space-y-2">
              <label className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider block">
                Active Silhouette / Stencil:
              </label>
              <select
                value={selectedTemplate.id}
                onChange={(e) => {
                  const t = templates.find((tpl) => tpl.id === e.target.value);
                  if (t) {
                    onSelectTemplate(t);
                    closeMobileMenu();
                  }
                }}
                className="w-full bg-stone-900 text-stone-100 border border-stone-700 rounded-lg text-xs py-2.5 px-3 focus:outline-none focus:border-amber-400 cursor-pointer font-medium"
              >
                {templates.map((tpl) => (
                  <option key={tpl.id} value={tpl.id}>
                    {tpl.name} ({tpl.regions.length} zones)
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-stone-400 italic">
                {selectedTemplate.tagline}
              </p>
            </div>

            {/* Quick Navigation Menu */}
            <div className="py-4 space-y-2 flex-1">
              <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block mb-2">
                Atelier Tools & Dockets
              </span>

              <button
                onClick={() => {
                  closeMobileMenu();
                  onOpenFabricLibrary();
                }}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-stone-900/70 hover:bg-stone-850 border border-stone-800 text-stone-200 text-xs font-medium transition cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Palette className="w-4 h-4" />
                </div>
                <div className="text-left flex-1">
                  <div className="font-semibold text-stone-100">Haute Fabric Catalog</div>
                  <div className="text-[10px] text-stone-400">Browse 13 couture swatches or upload sample</div>
                </div>
              </button>

              <button
                onClick={() => {
                  closeMobileMenu();
                  onOpenNewTemplateModal();
                }}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-stone-900/70 hover:bg-stone-850 border border-stone-800 text-stone-200 text-xs font-medium transition cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-amber-950/60 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <PlusCircle className="w-4 h-4" />
                </div>
                <div className="text-left flex-1">
                  <div className="font-semibold text-stone-100">Add Stencil / Silhouette</div>
                  <div className="text-[10px] text-stone-400">Pick architectural cut or upload showroom photo</div>
                </div>
              </button>

              <button
                onClick={() => {
                  closeMobileMenu();
                  onOpenSpecModal();
                }}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-stone-900/70 hover:bg-stone-850 border border-stone-800 text-stone-200 text-xs font-medium transition cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-950/60 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="text-left flex-1">
                  <div className="font-semibold text-stone-100">Specification & Yardage</div>
                  <div className="text-[10px] text-stone-400">Workroom pleat fullness & cut calculations</div>
                </div>
              </button>

              <button
                onClick={() => {
                  closeMobileMenu();
                  onOpenTourModal();
                }}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-stone-900/70 hover:bg-stone-850 border border-stone-800 text-stone-200 text-xs font-medium transition cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-purple-950/60 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div className="text-left flex-1">
                  <div className="font-semibold text-stone-100">Design Workflow Tour</div>
                  <div className="text-[10px] text-stone-400">Learn how multi-zone AI redesign works</div>
                </div>
              </button>
            </div>

            {/* Drawer Footer: User Profile */}
            <div className="pt-4 border-t border-stone-800">
              <button
                onClick={() => {
                  closeMobileMenu();
                  onOpenAuthModal();
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-stone-900 border border-stone-800 hover:border-stone-700 transition cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-stone-950 font-bold flex items-center justify-center text-xs shadow-xs">
                    {currentUser ? currentUser.name.charAt(0).toUpperCase() : 'G'}
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-semibold text-stone-100">
                      {currentUser ? currentUser.name : 'Guest Designer'}
                    </div>
                    <div className="text-[10px] text-amber-400 font-mono">
                      {currentUser ? currentUser.role : 'Tap to sign in / switch persona'}
                    </div>
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-stone-400 -rotate-90" />
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};


