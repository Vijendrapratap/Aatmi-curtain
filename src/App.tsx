import React, { useState, useEffect } from 'react';
import { CurtainTemplate, Fabric, FabricAssignment } from './types/curtain';
import { DEFAULT_TEMPLATES, DEFAULT_FABRICS } from './data/defaultCatalog';
import { rasterizeToPngBase64, getTemplateRealPhotoUrl } from './utils/fabricRenderer';
import { executeMaskedPipeline } from './utils/maskedPipeline';
import { Header } from './components/Header';
import { CurtainCanvas } from './components/CurtainCanvas';
import { RegionAssignmentPanel } from './components/RegionAssignmentPanel';
import { FabricLibraryModal } from './components/FabricLibraryModal';
import { NewTemplateModal } from './components/NewTemplateModal';
import { SpecSheetModal } from './components/SpecSheetModal';
import { AuthModal } from './components/AuthModal';
import { OnboardingTourModal } from './components/OnboardingTourModal';
import { TactileLoupeModal } from './components/TactileLoupeModal';
import { RoomLightingControls } from './components/RoomLightingControls';
import { UserProfile, RoomLightingId, RoomSettingId } from './types/auth';
import { DEMO_USERS } from './data/roomSettings';
import { Sparkles, AlertTriangle, CheckCircle, Info, Eye, Layers } from 'lucide-react';

export default function App() {
  const [templates, setTemplates] = useState<CurtainTemplate[]>(DEFAULT_TEMPLATES);
  const [selectedTemplate, setSelectedTemplate] = useState<CurtainTemplate>(DEFAULT_TEMPLATES[0]);
  const [fabrics, setFabrics] = useState<Fabric[]>(DEFAULT_FABRICS);
  const [assignments, setAssignments] = useState<FabricAssignment[]>([]);
  const [activeRegionId, setActiveRegionId] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<'preview' | 'regions'>('preview');

  // User Authentication & Persona
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('aatmi_user_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return DEMO_USERS[0]; // Elena Vance (Lead Interior Designer) as intuitive starting persona
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isOnboardingTourOpen, setIsOnboardingTourOpen] = useState<boolean>(false);

  // Environmental Lighting & Architectural Presentation
  const [roomLighting, setRoomLighting] = useState<RoomLightingId>('daylight');
  const [roomSetting, setRoomSetting] = useState<RoomSettingId>('parisian');
  const [isPresentationMode, setIsPresentationMode] = useState<boolean>(false);

  // Tactile Fabric Loupe Inspection
  const [tactileFabric, setTactileFabric] = useState<Fabric | null>(null);
  const [isTactileLoupeOpen, setIsTactileLoupeOpen] = useState<boolean>(false);

  // AI Generation state
  const [aiGeneratedImageUrl, setAiGeneratedImageUrl] = useState<string | null>(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);
  const [aiGenerationStep, setAiGenerationStep] = useState<string>('');
  const [generationNotice, setGenerationNotice] = useState<{ type: 'success' | 'info' | 'warning'; text: string } | null>(null);
  const [currentCanvasUrl, setCurrentCanvasUrl] = useState<string>('');

  // Modals state
  const [isFabricLibraryOpen, setIsFabricLibraryOpen] = useState<boolean>(false);
  const [isNewTemplateModalOpen, setIsNewTemplateModalOpen] = useState<boolean>(false);
  const [isSpecModalOpen, setIsSpecModalOpen] = useState<boolean>(false);

  // Initialize assignments when selectedTemplate changes
  useEffect(() => {
    const initialAssignments: FabricAssignment[] = selectedTemplate.regions.map((reg) => ({
      region_id: reg.id,
      fabric_id: reg.default_fabric_id || fabrics[0].id,
      scale: 1.0,
      rotation: 0,
    }));
    setAssignments(initialAssignments);
    setActiveRegionId(selectedTemplate.regions[0]?.id || null);
    setAiGeneratedImageUrl(null);
    setGenerationNotice(null);
  }, [selectedTemplate]);

  // Handle fabric assignment to a region
  const handleAssignFabric = (regionId: string, fabricId: string) => {
    setAssignments((prev) => {
      const exists = prev.some((a) => a.region_id === regionId);
      if (exists) {
        return prev.map((a) =>
          a.region_id === regionId ? { ...a, fabric_id: fabricId } : a
        );
      }
      return [...prev, { region_id: regionId, fabric_id: fabricId, scale: 1.0, rotation: 0 }];
    });
    // Invalidate stale AI result so canvas updates live
    setAiGeneratedImageUrl(null);
  };

  // Handle fine-tuning scale and rotation
  const handleUpdateAssignmentControls = (
    regionId: string,
    updates: Partial<FabricAssignment>
  ) => {
    setAssignments((prev) =>
      prev.map((a) => (a.region_id === regionId ? { ...a, ...updates } : a))
    );
  };

  // Add newly uploaded fabric swatch to catalog
  const handleAddNewFabric = (newFabric: Fabric) => {
    setFabrics((prev) => [newFabric, ...prev]);
  };

  // Add newly created template to catalog
  const handleSaveNewTemplate = (newTemplate: CurtainTemplate) => {
    setTemplates((prev) => [newTemplate, ...prev]);
    setSelectedTemplate(newTemplate);
    setGenerationNotice({
      type: 'success',
      text: `Created "${newTemplate.name}" with ${newTemplate.regions.length} AI detected fabric regions.`,
    });
  };

  // AI Photorealistic Generation Trigger via Masked Pipeline
  const handleTriggerAiGeneration = async () => {
    if (!selectedTemplate) return;
    setIsGeneratingAi(true);
    setAiGenerationStep('Initializing high-resolution curtain plate and fabric swatches...');
    setGenerationNotice(null);

    try {
      const result = await executeMaskedPipeline(
        selectedTemplate,
        assignments,
        fabrics,
        (step) => setAiGenerationStep(step)
      );

      if (result.success && result.imageUrl) {
        setAiGeneratedImageUrl(result.imageUrl);
        setGenerationNotice({
          type: 'success',
          text: 'AI photorealistic fabric redesign generated with zero background drift and preserved folds! Use the Final / Compare view to inspect.',
        });
      }
    } catch (err: any) {
      console.warn('AI generation pipeline note:', err.message);
      const isPaidKeyError =
        err.message?.includes('paid') ||
        err.message?.includes('quota') ||
        err.message?.includes('RESOURCE_EXHAUSTED') ||
        err.message?.includes('billing');

      if (isPaidKeyError) {
        setGenerationNotice({
          type: 'warning',
          text: 'High-resolution AI image synthesis requires a Gemini API key with billing enabled. Photorealistic canvas draping with authentic photographic luminance transfer is active in real time.',
        });
      } else if (err.message?.includes('GEMINI_API_KEY')) {
        setGenerationNotice({
          type: 'info',
          text: 'Server GEMINI_API_KEY required for server-side inpainting. High-fidelity canvas drape rendering is active in real time.',
        });
      } else {
        setGenerationNotice({
          type: 'info',
          text: err.message || 'Interactive high-fidelity fabric draping is active with authentic lighting and fold transfer.',
        });
      }
    } finally {
      setIsGeneratingAi(false);
      setAiGenerationStep('');
    }
  };

  // Export current canvas mockup
  const handleExportMockup = () => {
    const exportSrc = aiGeneratedImageUrl || currentCanvasUrl;
    if (!exportSrc) return;

    const link = document.createElement('a');
    link.download = `aatmi-${selectedTemplate.style_code.toLowerCase()}-${Date.now()}.jpg`;
    link.href = exportSrc;
    link.click();
  };

  const activeRegion = selectedTemplate.regions.find((r) => r.id === activeRegionId) || null;
  const activeAssignment = assignments.find((a) => a.region_id === activeRegionId);

  return (
    <div className="min-h-screen flex flex-col bg-[#FBFBF9] text-stone-900 font-sans">
      {/* Top Navigation Header */}
      <Header
        templates={templates}
        selectedTemplate={selectedTemplate}
        onSelectTemplate={setSelectedTemplate}
        onOpenNewTemplateModal={() => setIsNewTemplateModalOpen(true)}
        onOpenSpecModal={() => setIsSpecModalOpen(true)}
        onOpenFabricLibrary={() => setIsFabricLibraryOpen(true)}
        onExportMockup={handleExportMockup}
        hasGeneratedResult={Boolean(aiGeneratedImageUrl)}
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenTourModal={() => setIsOnboardingTourOpen(true)}
      />

      {/* Generation Notification Banner (if any) */}
      {generationNotice && (
        <div
          className={`px-4 py-2 text-xs flex items-center justify-between border-b transition-all ${
            generationNotice.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : generationNotice.type === 'warning'
              ? 'bg-amber-50 text-amber-900 border-amber-200'
              : 'bg-stone-100 text-stone-800 border-stone-200'
          }`}
        >
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
            <div className="flex items-center gap-2">
              {generationNotice.type === 'success' ? (
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <Info className="w-4 h-4 text-stone-500 shrink-0" />
              )}
              <span>{generationNotice.text}</span>
            </div>
            <button
              onClick={() => setGenerationNotice(null)}
              className="text-[11px] underline hover:no-underline text-stone-500 cursor-pointer ml-4"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Studio View Switcher for screens under 1024px (Mobile & Tablet) */}
      <div className="lg:hidden bg-[#181615] border-b border-stone-800/80 px-3 sm:px-4 py-2 flex items-center justify-between z-20 shrink-0 shadow-sm gap-2">
        <div className="flex items-center gap-1 p-1 bg-stone-900/90 rounded-lg border border-stone-800">
          <button
            id="mobile-tab-preview"
            onClick={() => setMobileTab('preview')}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-md text-[11px] sm:text-xs font-medium transition cursor-pointer ${
              mobileTab === 'preview'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-bold shadow-xs'
                : 'text-stone-300 hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview</span>
          </button>
          <button
            id="mobile-tab-regions"
            onClick={() => setMobileTab('regions')}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-md text-[11px] sm:text-xs font-medium transition cursor-pointer ${
              mobileTab === 'regions'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-bold shadow-xs'
                : 'text-stone-300 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Zones ({selectedTemplate.regions.length})</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5 min-w-0">
          <select
            value={selectedTemplate.id}
            onChange={(e) => {
              const t = templates.find((tpl) => tpl.id === e.target.value);
              if (t) setSelectedTemplate(t);
            }}
            className="bg-stone-900 text-stone-200 border border-stone-800 text-[11px] sm:text-xs py-1.5 px-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500/50 cursor-pointer max-w-[130px] sm:max-w-[170px] truncate"
          >
            {templates.map((tpl) => (
              <option key={tpl.id} value={tpl.id}>
                {tpl.name.split(' (')[0]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Studio Body: Region Assignment Panel on Left, Viewport on Right */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative min-h-0">
        {/* Left: Region Assignment Panel */}
        <div
          className={`w-full lg:w-96 lg:h-full lg:flex lg:flex-col shrink-0 ${
            mobileTab === 'regions' ? 'flex flex-col h-full flex-1 overflow-y-auto' : 'hidden'
          }`}
        >
          <RegionAssignmentPanel
            template={selectedTemplate}
            assignments={assignments}
            fabrics={fabrics}
            activeRegionId={activeRegionId}
            onSelectRegion={setActiveRegionId}
            onAssignFabric={handleAssignFabric}
            onUpdateAssignmentControls={handleUpdateAssignmentControls}
            onOpenFabricUploadForRegion={(regionId) => {
              setActiveRegionId(regionId);
              setIsFabricLibraryOpen(true);
            }}
            onOpenFabricLibrary={() => setIsFabricLibraryOpen(true)}
            onTriggerAiGeneration={handleTriggerAiGeneration}
            isGeneratingAi={isGeneratingAi}
            onReturnToPreview={() => setMobileTab('preview')}
            onOpenTactileLoupe={(fab) => {
              setTactileFabric(fab);
              setIsTactileLoupeOpen(true);
            }}
          />
        </div>

        {/* Center: Curtain Visualizer Stage with Environmental Lighting Bar */}
        <div
          className={`flex-1 h-full min-h-0 ${
            mobileTab === 'preview' ? 'flex flex-col flex-1' : 'hidden lg:flex lg:flex-col'
          }`}
        >
          {/* Room Lighting & Setting Controls Bar */}
          <RoomLightingControls
            currentLighting={roomLighting}
            onSelectLighting={setRoomLighting}
            currentSetting={roomSetting}
            onSelectSetting={setRoomSetting}
            isPresentationMode={isPresentationMode}
            onTogglePresentationMode={() => setIsPresentationMode(!isPresentationMode)}
          />

          {/* Interactive Fabric Canvas */}
          <CurtainCanvas
            template={selectedTemplate}
            assignments={assignments}
            fabrics={fabrics}
            activeRegionId={activeRegionId}
            onSelectRegion={setActiveRegionId}
            aiGeneratedImageUrl={aiGeneratedImageUrl}
            isGeneratingAi={isGeneratingAi}
            aiGenerationStep={aiGenerationStep}
            onTriggerAiGeneration={handleTriggerAiGeneration}
            onCanvasRendered={setCurrentCanvasUrl}
            onOpenFabricPicker={() => setIsFabricLibraryOpen(true)}
            onOpenRegionsTab={() => setMobileTab('regions')}
            onAssignFabric={handleAssignFabric}
            roomLighting={roomLighting}
            roomSetting={roomSetting}
            isPresentationMode={isPresentationMode}
            onOpenTactileLoupe={(fab) => {
              setTactileFabric(fab);
              setIsTactileLoupeOpen(true);
            }}
          />
        </div>
      </main>

      {/* Modals */}
      <FabricLibraryModal
        isOpen={isFabricLibraryOpen}
        onClose={() => setIsFabricLibraryOpen(false)}
        fabrics={fabrics}
        activeRegion={activeRegion}
        currentAssignedFabricId={activeAssignment?.fabric_id || null}
        onSelectFabric={(fabricId) => {
          if (activeRegionId) {
            handleAssignFabric(activeRegionId, fabricId);
          }
        }}
        onAddNewFabric={handleAddNewFabric}
      />

      <NewTemplateModal
        isOpen={isNewTemplateModalOpen}
        onClose={() => setIsNewTemplateModalOpen(false)}
        onSaveTemplate={handleSaveNewTemplate}
      />

      <SpecSheetModal
        isOpen={isSpecModalOpen}
        onClose={() => setIsSpecModalOpen(false)}
        template={selectedTemplate}
        assignments={assignments}
        fabrics={fabrics}
        currentPreviewImage={aiGeneratedImageUrl || currentCanvasUrl}
      />

      {/* User Login / Role Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onLogin={(user) => {
          setCurrentUser(user);
          localStorage.setItem('aatmi_user_profile', JSON.stringify(user));
        }}
        onLogout={() => {
          setCurrentUser(null);
          localStorage.removeItem('aatmi_user_profile');
        }}
      />

      {/* Engaging Onboarding Tour Modal */}
      <OnboardingTourModal
        isOpen={isOnboardingTourOpen}
        onClose={() => setIsOnboardingTourOpen(false)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenFabrics={() => setIsFabricLibraryOpen(true)}
        onOpenSpecSheet={() => setIsSpecModalOpen(true)}
        onTogglePresentation={() => setIsPresentationMode(!isPresentationMode)}
      />

      {/* 40x Macro Tactile Weave Loupe Modal */}
      <TactileLoupeModal
        isOpen={isTactileLoupeOpen}
        onClose={() => setIsTactileLoupeOpen(false)}
        fabric={tactileFabric}
        currentLighting={roomLighting}
      />
    </div>
  );
}
