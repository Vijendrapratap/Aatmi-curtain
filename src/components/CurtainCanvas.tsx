import React, { useEffect, useRef, useState } from 'react';
import { CurtainTemplate, Fabric, FabricAssignment, Region } from '../types/curtain';
import { RoomLightingId, RoomSettingId } from '../types/auth';
import { ROOM_LIGHTING_OPTIONS, ROOM_SETTING_OPTIONS } from '../data/roomSettings';
import { renderCurtainOnCanvas, generateCannyStructureMap, getTemplateRealPhotoUrl } from '../utils/fabricRenderer';
import {
  Sparkles,
  SlidersHorizontal,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RefreshCw,
  Eye,
  Info,
  CheckCircle2,
  AlertCircle,
  Camera,
  LayoutTemplate,
  Download,
  Image as ImageIcon,
  Check,
  Award,
  Sun,
  Sunset,
  Moon
} from 'lucide-react';

interface CurtainCanvasProps {
  template: CurtainTemplate;
  assignments: FabricAssignment[];
  fabrics: Fabric[];
  activeRegionId: string | null;
  onSelectRegion: (regionId: string) => void;
  aiGeneratedImageUrl: string | null;
  isGeneratingAi: boolean;
  aiGenerationStep: string;
  onTriggerAiGeneration: () => void;
  onCanvasRendered?: (dataUrl: string) => void;
  onOpenFabricPicker?: () => void;
  onOpenRegionsTab?: () => void;
  onAssignFabric?: (regionId: string, fabricId: string) => void;
  roomLighting?: RoomLightingId;
  roomSetting?: RoomSettingId;
  isPresentationMode?: boolean;
  onOpenTactileLoupe?: (fabric: Fabric) => void;
}

export const CurtainCanvas: React.FC<CurtainCanvasProps> = ({
  template,
  assignments,
  fabrics,
  activeRegionId,
  onSelectRegion,
  aiGeneratedImageUrl,
  isGeneratingAi,
  aiGenerationStep,
  onTriggerAiGeneration,
  onCanvasRendered,
  onOpenFabricPicker,
  onOpenRegionsTab,
  onAssignFabric,
  roomLighting = 'daylight',
  roomSetting = 'parisian',
  isPresentationMode = false,
  onOpenTactileLoupe,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // 'final_image' displays the true photographic image of the curtain
  // 'stencil' is the interactive template for assigning fabrics to zones
  const [viewMode, setViewMode] = useState<'final_image' | 'stencil' | 'original' | 'compare' | 'wireframe' | 'structure'>('final_image');
  const [sliderPosition, setSliderPosition] = useState<number>(50); // 0 to 100 for split compare
  const [isDraggingSlider, setIsDraggingSlider] = useState<boolean>(false);
  const [originalImageUrl, setOriginalImageUrl] = useState<string>('');
  const [currentRenderUrl, setCurrentRenderUrl] = useState<string>('');
  const [cannyMapUrl, setCannyMapUrl] = useState<string>('');
  const [hoveredRegion, setHoveredRegion] = useState<Region | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [showAiResult, setShowAiResult] = useState<boolean>(true);

  const activeLight = ROOM_LIGHTING_OPTIONS.find((l) => l.id === roomLighting) || ROOM_LIGHTING_OPTIONS[0];
  const activeSetting = ROOM_SETTING_OPTIONS.find((s) => s.id === roomSetting) || ROOM_SETTING_OPTIONS[0];

  // Filter out the 13 uploaded fabric samples for quick access
  const uploadedFabrics = fabrics.filter((f) => f.id.startsWith('fab-user-'));

  // Render original template for comparison
  useEffect(() => {
    const realPhoto = getTemplateRealPhotoUrl(template, 800, 1000);
    setOriginalImageUrl(realPhoto);
  }, [template]);

  // Main Render Effect
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;

    renderCurtainOnCanvas(canvas, template, assignments, fabrics, {
      width: 800,
      height: 1000,
      showWireframe: viewMode === 'wireframe',
      activeRegionId: activeRegionId,
      uiOnly: true,
    })
      .then((dataUrl) => {
        setCurrentRenderUrl(dataUrl);
        if (onCanvasRendered && dataUrl) {
          onCanvasRendered(dataUrl);
        }
        if (viewMode === 'structure') {
          const canny = generateCannyStructureMap(canvas);
          setCannyMapUrl(canny);
        }
      })
      .catch((err) => {
        console.error('Curtain canvas render error:', err);
      });
  }, [template, assignments, fabrics, activeRegionId, viewMode]);

  // Handle canvas click to select clicked region
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clickXPercent = ((e.clientX - rect.left) / rect.width) * 100;
    const clickYPercent = ((e.clientY - rect.top) / rect.height) * 100;

    // Find which region contains this point
    const hitRegion = template.regions.find((region) => {
      return isPointInPolygon(clickXPercent, clickYPercent, region.polygon_coords);
    });

    if (hitRegion) {
      onSelectRegion(hitRegion.id);
    }
  };

  // Handle canvas touch tap on mobile devices
  const handleCanvasTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (isDraggingSlider) return;
    if (!containerRef.current || e.changedTouches.length === 0) return;
    const rect = containerRef.current.getBoundingClientRect();
    const touch = e.changedTouches[0];
    const clickXPercent = ((touch.clientX - rect.left) / rect.width) * 100;
    const clickYPercent = ((touch.clientY - rect.top) / rect.height) * 100;

    const hitRegion = template.regions.find((region) => {
      return isPointInPolygon(clickXPercent, clickYPercent, region.polygon_coords);
    });

    if (hitRegion) {
      onSelectRegion(hitRegion.id);
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const moveXPercent = ((e.clientX - rect.left) / rect.width) * 100;
    const moveYPercent = ((e.clientY - rect.top) / rect.height) * 100;

    if (viewMode === 'compare' && isDraggingSlider) {
      setSliderPosition(Math.max(2, Math.min(98, moveXPercent)));
      return;
    }

    const hit = template.regions.find((region) => {
      return isPointInPolygon(moveXPercent, moveYPercent, region.polygon_coords);
    });

    setHoveredRegion(hit || null);
  };

  // Global mouse and touch drag listener for split slider
  useEffect(() => {
    if (!isDraggingSlider) return;

    const handleGlobalMove = (clientX: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const pct = ((clientX - rect.left) / rect.width) * 100;
      setSliderPosition(Math.max(2, Math.min(98, pct)));
    };

    const onMouseMove = (e: MouseEvent) => handleGlobalMove(e.clientX);
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) handleGlobalMove(e.touches[0].clientX);
    };
    const onEnd = () => setIsDraggingSlider(false);

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('touchmove', onTouchMove);
    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchend', onEnd);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('mouseup', onEnd);
      window.removeEventListener('touchend', onEnd);
    };
  }, [isDraggingSlider]);

  // Helper point-in-polygon algorithm (Ray casting)
  const isPointInPolygon = (x: number, y: number, polygon: { x: number; y: number }[]) => {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].x;
      const yi = polygon[i].y;
      const xj = polygon[j].x;
      const yj = polygon[j].y;

      const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
      if (intersect) inside = !inside;
    }
    return inside;
  };

  // Download high-resolution curtain image
  const handleDownloadCurtain = () => {
    const src = aiGeneratedImageUrl || currentRenderUrl || originalImageUrl;
    if (!src) return;
    const link = document.createElement('a');
    link.href = src;
    link.download = `aatmi-${template.name.toLowerCase().replace(/\s+/g, '-')}-curtain.jpg`;
    link.click();
  };

  // Selected region details
  const activeRegion = template.regions.find((r) => r.id === activeRegionId);
  const activeAssignment = assignments.find((a) => a.region_id === activeRegionId);
  const activeFabric = activeAssignment ? fabrics.find((f) => f.id === activeAssignment.fabric_id) : null;

  return (
    <div className="flex-1 flex flex-col bg-[#EDE7DF] relative overflow-hidden">
      {/* Top Toolbar */}
      <div className="min-h-12 sm:min-h-14 px-3 sm:px-6 py-2 bg-[#EDE7DF]/95 border-b border-[#D4AF37]/10 flex items-center justify-between gap-2 sm:gap-3 shadow-md z-10 overflow-x-auto scrollbar-none" style={{backdropFilter:'blur(12px)',WebkitBackdropFilter:'blur(12px)'}}>
        {/* View Mode Selector (Segmented Pill Bar) */}
        <div className="flex items-center gap-1 bg-white/4 p-1 rounded-xl border border-white/8 shrink-0">
          {/* Primary View: Final Curtain Image */}
          <button
            id="view-mode-final-image"
            onClick={() => setViewMode('final_image')}
            className={`px-3 py-1.5 text-[11px] sm:text-xs font-semibold rounded-lg transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap tactile-press ${
              viewMode === 'final_image'
                ? 'bg-gradient-to-r from-[#F5DE8B] to-[#D4AF37] text-[#0A0B0E] font-bold shadow-xs'
                : 'text-[#6B5F54] hover:text-[#1A1714] hover:bg-white/60'
            }`}
            title="View the authentic photographic image of the redesigned curtain"
          >
            <Camera className="w-3.5 h-3.5 text-[#0A0B0E]" />
            <span className="hidden sm:inline">Final Curtain Image</span>
            <span className="sm:hidden">Final</span>
            {aiGeneratedImageUrl && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </button>

          {/* Stencil & Template Workspace */}
          <button
            id="view-mode-stencil"
            onClick={() => setViewMode('stencil')}
            className={`px-3 py-1.5 text-[11px] sm:text-xs font-medium rounded-lg transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap tactile-press ${
              viewMode === 'stencil'
                ? 'bg-[#D4AF37] text-[#0A0B0E] font-bold shadow-xs'
                : 'text-[#6B5F54] hover:text-[#1A1714] hover:bg-white/60'
            }`}
            title="Interactive stencil template to assign and customize fabric zones"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Template & Stencils</span>
            <span className="sm:hidden">Stencil</span>
          </button>

          {/* Original Real Photo */}
          <button
            id="view-mode-original"
            onClick={() => setViewMode('original')}
            className={`px-3 py-1.5 text-[11px] sm:text-xs font-medium rounded-lg transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap tactile-press ${
              viewMode === 'original'
                ? 'bg-[#D4AF37] text-[#0A0B0E] font-bold shadow-xs'
                : 'text-[#6B5F54] hover:text-[#1A1714] hover:bg-white/60'
            }`}
            title="Inspect authentic original showroom photograph"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Original Photo</span>
            <span className="sm:hidden">Original</span>
          </button>

          {/* Split Compare */}
          <button
            id="view-mode-compare"
            onClick={() => setViewMode('compare')}
            className={`px-3 py-1.5 text-[11px] sm:text-xs font-medium rounded-lg transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap tactile-press ${
              viewMode === 'compare'
                ? 'bg-[#D4AF37] text-[#0A0B0E] font-bold shadow-xs'
                : 'text-[#6B5F54] hover:text-[#1A1714] hover:bg-white/60'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Before / After</span>
            <span className="sm:hidden">Compare</span>
          </button>

          {/* Zone Masks */}
          <button
            id="view-mode-wireframe"
            onClick={() => setViewMode('wireframe')}
            className={`px-3 py-1.5 text-[11px] sm:text-xs font-medium rounded-lg transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap tactile-press ${
              viewMode === 'wireframe'
                ? 'bg-[#D4AF37] text-[#0A0B0E] font-bold shadow-xs'
                : 'text-[#6B5F54] hover:text-[#1A1714] hover:bg-white/60'
            }`}
            title="Verify 100% seamless zone tracking without missing sections"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Tracking ({template.regions.length})</span>
            <span className="md:hidden">Zones</span>
          </button>
        </div>

        {/* AI Generation Trigger & Export */}
        <div className="flex items-center gap-2 shrink-0">
          {aiGeneratedImageUrl ? (
            <div className="flex items-center gap-2">
              <span className="hidden md:flex items-center gap-1.5 bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-[11px] font-medium px-2.5 py-1 rounded-lg">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>AI Photo Ready</span>
              </span>
              <button
                id="btn-re-generate-ai"
                onClick={onTriggerAiGeneration}
                disabled={isGeneratingAi}
                className="flex items-center gap-1.5 bg-white hover:bg-[#F8F5F0] text-[#3D3329] text-[11px] sm:text-xs font-medium px-3 py-1.5 rounded-lg transition cursor-pointer disabled:opacity-50 border border-[#C9BFB4] tactile-press"
                title="Re-generate image with AI model"
              >
                <RefreshCw className={`w-3 h-3 ${isGeneratingAi ? 'animate-spin text-[#D4AF37]' : 'text-[#D4AF37]'}`} />
                <span className="hidden xs:inline">Re-synthesize</span>
              </button>
            </div>
          ) : (
            <button
              id="btn-generate-curtain-ai"
              onClick={onTriggerAiGeneration}
              disabled={isGeneratingAi}
              className="flex items-center gap-1.5 bg-gradient-to-r from-[#F5DE8B] via-[#D4AF37] to-[#8C7322] hover:brightness-110 text-[#0A0B0E] text-[11px] sm:text-xs font-bold px-3.5 py-1.5 rounded-lg shadow-md transition cursor-pointer disabled:opacity-50 border border-[#F5DE8B]/40 whitespace-nowrap tactile-press"
            >
              <Sparkles className={`w-3.5 h-3.5 text-[#0A0B0E] ${isGeneratingAi ? 'animate-spin' : ''}`} />
              <span>{isGeneratingAi ? 'Synthesizing...' : 'Generate with AI'}</span>
            </button>
          )}

          <button
            onClick={handleDownloadCurtain}
            className="flex items-center gap-1.5 bg-white hover:bg-[#F8F5F0] text-[#3D3329] text-[11px] sm:text-xs font-medium px-3 py-1.5 rounded-lg border border-[#C9BFB4] cursor-pointer transition shrink-0 tactile-press"
            title="Download high-resolution image"
          >
            <Download className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span className="hidden md:inline">Download Photo</span>
          </button>
        </div>
      </div>

      {/* Main Canvas Stage */}
      <div
        className="flex-1 relative flex items-center justify-center p-4 sm:p-6 overflow-auto transition-all duration-300"
        style={{
          background: isPresentationMode
            ? activeSetting.bgGradient
            : 'radial-gradient(ellipse at 50% 25%, #191B24 0%, #101219 55%, #08090C 100%)',
        }}
      >
        {/* Presentation Mode Watermark & Client Room Tag */}
        {isPresentationMode && (
          <div className="absolute top-4 left-6 z-20 pointer-events-none flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-base tracking-widest text-stone-900">
                AATMI ATELIER
              </span>
              <span className="text-[10px] uppercase font-sans tracking-widest px-2 py-0.5 rounded bg-stone-900/10 text-stone-800 font-semibold border border-stone-900/15">
                Client Presentation View
              </span>
            </div>
            <span className="text-xs text-stone-700 font-serif italic mt-0.5">
              {template.name} · {activeSetting.name} · {activeLight.name} ({activeLight.kelvin})
            </span>
          </div>
        )}

        {/* Generating Overlay indicator */}
        {isGeneratingAi && (
          <div className="absolute inset-0 bg-[#F5F0EB]/85 backdrop-blur-sm z-20 flex flex-col items-center justify-center text-center p-6">
            <div className="bg-white border border-[#C49A1E]/30 p-6 rounded-2xl shadow-xl max-w-sm w-full flex flex-col items-center" style={{boxShadow:'0 0 0 1px rgba(212,175,55,0.12), 0 24px 60px rgba(0,0,0,0.8)'}}>
              <div className="w-12 h-12 rounded-full border-2 border-[#C49A1E]/30 border-t-[#C49A1E] animate-spin flex items-center justify-center mb-4">
                <Sparkles className="w-5 h-5 text-[#D4AF37]" />
              </div>
              <h4 className="font-serif text-base text-[#1A1714] font-semibold mb-1">
                Aatmi AI Image Model
              </h4>
              <p className="text-xs text-[#C49A1E] font-medium mb-3">
                {aiGenerationStep || 'Synthesizing real curtain photograph from fabric swatches...'}
              </p>
              <div className="w-full bg-[#E8E2DA] h-1.5 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-[#F5DE8B] to-[#D4AF37] h-full w-2/3 animate-pulse rounded-full" />
              </div>
              <p className="text-[11px] text-[#9E9088] mt-3">
                Rendering realistic fabric weight, window daylight, tactile embroidery, and deep gravity pleats.
              </p>
            </div>
          </div>
        )}

        {/* View Mode Badge & Tracking Integrity Audit */}
        {!isPresentationMode && (
          <div className="absolute top-4 left-6 z-10 flex flex-wrap items-center gap-2 pointer-events-none">
            <span className="bg-white/95 backdrop-blur-md text-[#1A1714] text-[11px] font-medium px-3 py-1 rounded-full border border-[#C9BFB4] shadow-xs flex items-center gap-1.5">
              <LayoutTemplate className="w-3.5 h-3.5 text-[#C49A1E]" />
              <span className="font-semibold">{template.name}</span>
              <span className="text-[#9E9088]">·</span>
              <span className="text-[#C49A1E] font-mono text-[10px] font-bold">{template.regions.length} Zones</span>
            </span>

            {viewMode === 'final_image' && (
              <span className="bg-[#FFF8E6] backdrop-blur-md text-[#C49A1E] text-[11px] font-semibold px-3 py-1 rounded-full border border-[#C49A1E]/40 shadow-xs flex items-center gap-1.5">
                <Camera className="w-3 h-3 text-[#C49A1E]" />
                <span>{aiGeneratedImageUrl ? 'AI Generated Real Photo' : 'Photorealistic Curtain Scene'}</span>
              </span>
            )}

            {viewMode === 'wireframe' && (
              <span className="bg-emerald-50 backdrop-blur-md text-emerald-800 text-[11px] font-semibold px-2.5 py-1 rounded-full border border-emerald-300 shadow-xs flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Full Surface Covered (0 Missing Sections)</span>
              </span>
            )}

            {/* Room Light Indicator */}
            <span className="bg-white/95 backdrop-blur-md text-[#6B5F54] text-[10px] font-semibold px-2.5 py-1 rounded-full border border-[#C9BFB4] shadow-xs flex items-center gap-1">
              <Sun className="w-3 h-3 text-[#C49A1E]" />
              <span>{activeLight.name}</span>
            </span>
          </div>
        )}

        {/* Viewport Box */}
        <div
          ref={containerRef}
          onClick={handleCanvasClick}
          onTouchEnd={handleCanvasTouchEnd}
          onMouseMove={handleCanvasMouseMove}
          onMouseLeave={() => setHoveredRegion(null)}
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
          className="relative max-w-[560px] w-full aspect-[4/5] min-h-[380px] bg-[#F0EBE4] rounded-2xl shadow-xl overflow-hidden border border-[#C9BFB4] transition-transform duration-200 cursor-crosshair select-none better-img-outline"
        >
          {/* Ambient Lighting Filter Wrapper */}
          <div
            className="w-full h-full relative"
            style={{
              filter: activeLight.canvasFilter,
              transition: 'filter 0.3s ease',
            }}
          >
            {/* 1. Base Canvas (Interactive rendering on template/stencil) */}
            <canvas
              ref={canvasRef}
              width={800}
              height={1000}
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              className={`w-full h-full ${
                viewMode === 'original' || viewMode === 'structure' || ((viewMode === 'final_image' || viewMode === 'compare') && aiGeneratedImageUrl) ? 'hidden' : 'block'
              }`}
            />

            {/* 1b. AI Generated Real Curtain Image */}
            {(viewMode === 'final_image' || viewMode === 'compare') && aiGeneratedImageUrl && (
              <div className="w-full h-full relative">
                <img
                  src={aiGeneratedImageUrl}
                  alt="AI Generated Real Curtain Photo"
                  className="w-full h-full object-cover"
                />
                {viewMode === 'final_image' && (
                  <div className="absolute top-3 right-3 bg-stone-900/85 text-amber-300 text-[11px] px-2.5 py-1 rounded-full border border-amber-500/40 flex items-center gap-1.5 shadow-md">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>AI Synthesized Photo</span>
                  </div>
                )}
              </div>
            )}

            {/* 2. Original Authentic Real Photo View */}
            {viewMode === 'original' && originalImageUrl && (
              <div className="w-full h-full relative">
                <img
                  src={originalImageUrl}
                  alt="Authentic Real Curtain Photograph"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 bg-white/95 text-[#1A1714] text-[11px] font-semibold px-3 py-1 rounded-full border border-[#C9BFB4] flex items-center gap-1.5 shadow-xs">
                  <Camera className="w-3 h-3 text-[#C49A1E]" />
                  <span>Authentic Showroom Photograph</span>
                </div>
              </div>
            )}

            {/* 3. Canny Edge Structure Map View */}
            {viewMode === 'structure' && cannyMapUrl && (
              <div className="w-full h-full bg-[#1A1714] flex items-center justify-center">
                <img
                  src={cannyMapUrl}
                  alt="Canny Structure Map"
                  className="w-full h-full object-contain filter invert"
                />
                <div className="absolute top-3 left-3 bg-white/95 text-[#1A1714] text-[11px] px-2.5 py-1 rounded border border-[#C9BFB4] font-mono">
                  Canny Edge & Drape Matrix
                </div>
              </div>
            )}
          </div>

          {/* Environmental Ambient Light Tint Overlay */}
          <div
            className="absolute inset-0 pointer-events-none transition-all duration-300"
            style={{ background: activeLight.tintOverlay }}
          />

          {/* Golden hour diagonal sunbeam highlights */}
          {roomLighting === 'golden_hour' && (
            <div
              className="absolute inset-0 pointer-events-none mix-blend-screen opacity-35"
              style={{
                background: 'radial-gradient(circle at 10% 20%, rgba(255,200,80,0.6) 0%, transparent 60%)',
              }}
            />
          )}

          {/* 4. Split Screen Comparison Mode (Original vs Redesign) */}
          {viewMode === 'compare' && originalImageUrl && (
            <div className="absolute inset-0 pointer-events-none">
              <div
                className="absolute inset-0 overflow-hidden border-r-2 border-white shadow-2xl"
                style={{ width: `${sliderPosition}%` }}
              >
                <img
                  src={originalImageUrl}
                  alt="Original Curtain"
                  className="absolute inset-0 w-full h-full object-cover max-w-none"
                  style={{ width: containerRef.current ? `${containerRef.current.clientWidth}px` : '100%' }}
                />
                <div className="absolute top-3 left-3 bg-white/95 text-[#1A1714] text-[10px] font-bold px-2 py-0.5 rounded border border-[#C9BFB4] tracking-wide uppercase shadow-xs">
                  Original
                </div>
              </div>

              <div className="absolute top-3 right-3 bg-[#FFF8E6] text-[#C49A1E] border border-[#C49A1E]/40 text-[10px] font-bold px-2 py-0.5 rounded tracking-wide uppercase shadow-xs">
                Aatmi Redesign
              </div>

              <div
                className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize pointer-events-auto touch-none"
                style={{ left: `${sliderPosition}%` }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  setIsDraggingSlider(true);
                }}
                onTouchStart={(e) => {
                  e.stopPropagation();
                  setIsDraggingSlider(true);
                }}
              >
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white text-[#1A1714] shadow-xl border border-[#C9BFB4] flex items-center justify-center text-[11px] font-bold select-none cursor-ew-resize hover:scale-110 active:scale-95 transition-transform">
                  ↔
                </div>
              </div>
            </div>
          )}

          {/* Interactive Hover Tooltip in Stencil/Wireframe Mode */}
          {hoveredRegion && viewMode !== 'compare' && (
            <div className="absolute bottom-3 left-3 bg-white/95 text-[#1A1714] text-xs px-3 py-1.5 rounded-lg shadow-md border border-[#C9BFB4] pointer-events-none flex items-center gap-2 z-10 animate-in fade-in">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: hoveredRegion.accent_color || '#D97706' }} />
              <span className="font-semibold">{hoveredRegion.display_name}</span>
              <span className="text-[#6B5F54] text-[11px]">— Click to assign fabric</span>
            </div>
          )}
        </div>

        {/* Floating Zoom & Reset controls */}
        <div className="absolute bottom-6 right-6 flex items-center gap-1.5 bg-white/95 backdrop-blur-md border border-[#C9BFB4] rounded-xl p-1 shadow-sm z-10">
          <button
            id="zoom-out"
            onClick={() => setZoomLevel((z) => Math.max(0.7, z - 0.15))}
            className="p-1.5 hover:bg-[#EDE7DF] rounded-lg text-[#1A1714] cursor-pointer transition"
            title="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-[11px] font-semibold text-[#1A1714] px-1.5 font-mono">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            id="zoom-in"
            onClick={() => setZoomLevel((z) => Math.min(1.8, z + 0.15))}
            className="p-1.5 hover:bg-[#EDE7DF] rounded-lg text-[#1A1714] cursor-pointer transition"
            title="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            id="zoom-reset"
            onClick={() => setZoomLevel(1)}
            className="p-1.5 hover:bg-[#EDE7DF] rounded-lg text-[#1A1714] cursor-pointer transition"
            title="Fit to view"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Split slider scrubber input when in compare mode */}
        {viewMode === 'compare' && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-xs px-4 py-2 rounded-full border border-stone-300 shadow-lg flex items-center gap-3 z-10">
            <span className="text-xs font-semibold text-stone-600">Original</span>
            <input
              type="range"
              min="0"
              max="100"
              value={sliderPosition}
              onChange={(e) => setSliderPosition(Number(e.target.value))}
              className="w-44 accent-amber-600 cursor-ew-resize"
            />
            <span className="text-xs font-semibold text-amber-800">Redesign</span>
          </div>
        )}
      </div>

      {/* Quick Swatch Tray for the 13 Uploaded Fabric Samples */}
      {uploadedFabrics.length > 0 && (
        <div className="bg-[#101219] border-t border-[#222532] px-3 sm:px-6 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 shrink-0">
            <span className="font-semibold text-[#F9F6F0] flex items-center gap-1.5 text-[11px] sm:text-xs">
              <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
              <span>Haute Swatches ({uploadedFabrics.length}):</span>
            </span>
            <span className="text-[#8C909A] text-[11px] hidden md:inline">
              Tap to drape onto <strong className="text-[#F5DE8B]">{activeRegion?.display_name || 'Active Zone'}</strong>:
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
            {uploadedFabrics.map((fab) => {
              const isAssigned = activeAssignment?.fabric_id === fab.id;
              return (
                <button
                  key={fab.id}
                  onClick={() => {
                    if (activeRegionId && onAssignFabric) {
                      onAssignFabric(activeRegionId, fab.id);
                    } else if (onOpenFabricPicker) {
                      onOpenFabricPicker();
                    }
                  }}
                  title={`Apply ${fab.name} (${fab.category}) to ${activeRegion?.display_name || 'active zone'}`}
                  className={`relative group shrink-0 w-9 h-9 sm:w-8 sm:h-8 rounded-lg overflow-hidden border-2 transition cursor-pointer better-img-outline tactile-press ${
                    isAssigned
                      ? 'border-[#D4AF37] ring-2 ring-[#D4AF37]/40 scale-105 shadow-sm'
                      : 'border-[#272B3A] hover:border-[#D4AF37]/70'
                  }`}
                >
                  <img src={fab.image_url} alt={fab.name} className="w-full h-full object-cover" />
                  {isAssigned && (
                    <div className="absolute inset-0 bg-[#0A0B0E]/60 flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 text-[#D4AF37] drop-shadow-md stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Active Zone Status & Quick Action Bar */}
      <div className="bg-[#141620] border-t border-[#222532] px-3 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[#8C909A] font-medium text-[11px] sm:text-xs">Active Zone:</span>
          <span className="font-semibold text-[#F5DE8B] bg-[#1C1F2B] border border-[#2B3042] px-2.5 py-0.5 rounded-lg shadow-2xs text-[11px] sm:text-xs font-mono">
            {activeRegion?.display_name || 'Zone'}
          </span>
          {activeFabric && (
            <div className="flex items-center gap-2 ml-1">
              <span
                className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-2xs shrink-0"
                style={{ backgroundColor: activeFabric.color_hex }}
              />
              <span className="text-[#E0E2EB] font-medium text-[11px] sm:text-xs truncate max-w-[140px] sm:max-w-[200px]">
                {activeFabric.name}
              </span>
            </div>
          )}

          {activeFabric && onOpenTactileLoupe && (
            <button
              id="btn-inspect-tactile-loupe"
              onClick={() => onOpenTactileLoupe(activeFabric)}
              className="flex items-center gap-1.5 text-[10px] sm:text-[11px] bg-[#241E14] hover:bg-[#322A1A] text-[#F5DE8B] border border-[#D4AF37]/40 px-2.5 py-1 rounded-lg font-medium transition cursor-pointer shadow-2xs whitespace-nowrap tactile-press"
              title="Inspect warp & weft micro-weave and light reflection with 40x optical loupe"
            >
              <ZoomIn className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>40x Loupe</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onOpenFabricPicker && (
            <button
              onClick={onOpenFabricPicker}
              className="bg-gradient-to-r from-[#F5DE8B] via-[#D4AF37] to-[#8C7322] hover:brightness-110 text-[#0A0B0E] text-[11px] sm:text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition shadow-md whitespace-nowrap tactile-press"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#0A0B0E]" />
              <span>Fabric Catalog</span>
            </button>
          )}
          {onOpenRegionsTab && (
            <button
              onClick={onOpenRegionsTab}
              className="bg-[#1C1F2B] hover:bg-[#252A3A] text-[#E0E2EB] border border-[#2D3242] text-[11px] sm:text-xs px-3 py-1.5 rounded-lg font-medium cursor-pointer transition lg:hidden whitespace-nowrap tactile-press"
            >
              <span>Manage Zones</span>
            </button>
          )}
        </div>
      </div>

      {/* Bottom Template Meta */}
      <div className="bg-[#0F1117] border-t border-[#222530] px-3 sm:px-6 py-2 flex items-center justify-between text-[11px] sm:text-xs text-[#8C909A] overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <span className="font-serif font-semibold text-[#F9F6F0] text-xs sm:text-sm">
            {template.name}
          </span>
          <span className="text-[10px] bg-[#171922] border border-[#272B3A] text-[#D4AF37] px-2 py-0.5 rounded font-mono">
            {template.style_code}
          </span>
          <span className="hidden md:inline text-[#3E4252]">|</span>
          <span className="hidden md:inline text-[#8C909A] italic">
            {template.tagline}
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <span className="hidden sm:inline text-[#8C909A] font-sans">
            Fullness: <strong className="text-[#F9F6F0]">2.5x Tailored Pleat</strong>
          </span>
          <span className="text-[#646878] hidden xs:inline">Surface:</span>
          <span className="font-semibold text-emerald-400 flex items-center gap-1 font-mono text-[10px]">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>100% COVERAGE</span>
          </span>
        </div>
      </div>
    </div>
  );
};

