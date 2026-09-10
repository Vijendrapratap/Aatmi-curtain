import React, { useState, useEffect } from 'react';
import { CurtainTemplate, Fabric, FabricAssignment } from './types/curtain';
import { DEFAULT_TEMPLATES, DEFAULT_FABRICS } from './data/defaultCatalog';
import { rasterizeToPngBase64, getTemplateRealPhotoUrl } from './utils/fabricRenderer';
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

  // AI Photorealistic Generation Trigger
  const handleTriggerAiGeneration = async () => {
    setIsGeneratingAi(true);
    setAiGenerationStep('Analyzing curtain structure, pleat depth & ambient room light...');
    setGenerationNotice(null);

    const fabricMap = new Map<string, Fabric>();
    fabrics.forEach((f) => fabricMap.set(f.id, f));

    // Prepare assignment descriptors and images with client-side rasterization
    const assignmentPayload = await Promise.all(
      assignments.map(async (asg) => {
        const reg = selectedTemplate.regions.find((r) => r.id === asg.region_id);
        const fab = fabricMap.get(asg.fabric_id);
        let rasterBase64 = '';
        if (fab?.image_url) {
          rasterBase64 = await rasterizeToPngBase64(fab.image_url, 256, 256);
        }
        return {
          regionName: reg?.name || 'region',
          regionDisplayName: reg?.display_name || 'Curtain Zone',
          fabricName: fab?.name || 'Luxe Fabric',
          fabricWeave: fab?.metadata.weave || 'woven',
          fabricColorHex: fab?.color_hex || '#D4AF37',
          fabricCategory: fab?.category || 'Drapery',
          fabricImageBase64: rasterBase64,
        };
      })
    );

    // Prepare template image, ensuring it is a valid raster base64
    let templateImageBase64 = currentCanvasUrl;
    if (!templateImageBase64 && selectedTemplate) {
      templateImageBase64 = getTemplateRealPhotoUrl(selectedTemplate, 800, 1000);
    }
    if (
      templateImageBase64 &&
      !templateImageBase64.startsWith('data:image/png;base64,') &&
      !templateImageBase64.startsWith('data:image/jpeg;base64,')
    ) {
      templateImageBase64 = await rasterizeToPngBase64(templateImageBase64, 800, 1000);
    }

    try {
      // Step 1: Notify step
      setTimeout(() => {
        setAiGenerationStep('Injecting micro-weave textures into multi-region masks...');
      }, 1200);

      const response = await fetch('/api/generate-curtain-fabric', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateName: selectedTemplate.name,
          templateImage: templateImageBase64,
          assignments: assignmentPayload,
        }),
      });

      const data = await response.json();

      if (response.ok && data.imageUrl) {
        setAiGeneratedImageUrl(data.imageUrl);
        setGenerationNotice({
          type: 'success',
          text: 'AI photorealistic fabric redesign generated successfully! Use the view toggle to compare.',
        });
      } else {
        // Handle gracefully when API key is missing or quota is restricted
        console.warn('AI endpoint response:', data.error);
        if (data.needsPaidKey) {
          setGenerationNotice({
            type: 'warning',
            text: 'Image generation requires a Gemini API key with billing enabled. Photorealistic canvas draping is active in real time.',
          });
        } else {
          setGenerationNotice({
            type: 'info',
            text: data.error?.includes('GEMINI_API_KEY')
              ? 'API key required for server-side inpainting. High-fidelity drape canvas rendering is active in real time.'
              : (data.error || 'AI image generation unavailable. Showing photorealistic interactive canvas drape.'),
          });
        }
      }
    } catch (err: any) {
      console.error('AI generation error:', err);
      setGenerationNotice({
        type: 'info',
        text: 'Interactive high-fidelity fabric draping is active on canvas. Gemini AI inpainter can be rerun anytime.',
      });
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

      {/* Studio View Switcher for screens under 1024px (Mobile, Tablet, and AI Studio Preview Frames) */}
      <div className="lg:hidden bg-stone-900 border-b border-stone-800 px-4 py-2 flex items-center justify-between z-20 shrink-0 shadow-sm">
        <div className="flex items-center gap-1.5 p-1 bg-stone-800/90 rounded-lg border border-stone-700/80">
          <button
            id="mobile-tab-preview"
            onClick={() => setMobileTab('preview')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition cursor-pointer ${
              mobileTab === 'preview'
                ? 'bg-amber-500 text-stone-950 font-semibold shadow-xs'
                : 'text-stone-300 hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Curtain Preview</span>
          </button>
          <button
            id="mobile-tab-regions"
            onClick={() => setMobileTab('regions')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition cursor-pointer ${
              mobileTab === 'regions'
                ? 'bg-amber-500 text-stone-950 font-semibold shadow-xs'
                : 'text-stone-300 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Fabric Zones ({selectedTemplate.regions.length})</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedTemplate.id}
            onChange={(e) => {
              const t = templates.find((tpl) => tpl.id === e.target.value);
              if (t) setSelectedTemplate(t);
            }}
            className="bg-stone-800 text-stone-200 border border-stone-700 text-xs py-1 px-2 rounded focus:outline-none cursor-pointer max-w-[150px] truncate"
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
