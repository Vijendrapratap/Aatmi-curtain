// src/components/RoomVizStudio.tsx
import React, { useState } from 'react';
import {
  Maximize2,
  Sparkles,
  Sun,
  Moon,
  Layers,
  Camera,
  Upload,
  Download,
  Share2,
  CheckCircle2,
  Sliders,
  Compass,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { useStudioStore } from '../lib/store';
import { providerRegistry } from '../lib/ai-providers/registry';

const ROOM_SETTINGS = [
  {
    id: 'living_room',
    name: 'Haussmannian Parisian Salon',
    description: '14-foot ceiling with herringbone French oak, hand-carved boiserie molding, and tall double-casement windows.',
    styleTag: 'Neoclassical Editorial',
    lighting: 'Soft Morning Daylight',
    bgGradient: 'from-[#EAE4DC] to-[#DDD7CE]',
  },
  {
    id: 'penthouse',
    name: 'TriBeCa Modern Penthouse',
    description: 'Double-height floor-to-ceiling windows with brushed bronze mullions, travertine flooring, and city horizon view.',
    styleTag: 'Contemporary Luxury',
    lighting: 'Sunset Golden Hour',
    bgGradient: 'from-[#EDE5DC] to-[#DFCDBF]',
  },
  {
    id: 'master_bedroom',
    name: 'Haute Couture Master Suite',
    description: 'Fluted acoustic walnut slats, velvet upholstered headboard, concealed cove illumination, and shearling rug.',
    styleTag: 'Intimate Architectural',
    lighting: 'Evening Ambient Glow',
    bgGradient: 'from-[#E5DFD7] to-[#D5CDC3]',
  },
  {
    id: 'french_salon',
    name: 'Versailles Chinoiserie Gallery',
    description: 'Arched palladium windows overlooking private topiary gardens, crystal chandeliers, and silk wall hangings.',
    styleTag: 'Heritage French',
    lighting: 'Bright Diffused Sunlight',
    bgGradient: 'from-[#EFEBE4] to-[#DDD8CE]',
  },
  {
    id: 'minimalist_loft',
    name: 'Copenhagen Stone Residence',
    description: 'Limewashed plaster walls, microcement floors, organic monolithic stone island, and subtle ceiling drapery track.',
    styleTag: 'Scandinavian Warm Minimal',
    lighting: 'Clean Nordic Daylight',
    bgGradient: 'from-[#E8E4DD] to-[#DCD6CD]',
  },
];

interface RoomVizStudioProps {
  onProceedToGenerate?: () => void;
  onBackToAtelier?: () => void;
}

export const RoomVizStudio: React.FC<RoomVizStudioProps> = ({
  onProceedToGenerate,
  onBackToAtelier,
}) => {
  const {
    activeRoomType,
    setActiveRoomType,
    renderedImageUrl,
    selectedTemplateId,
    templates,
    isRenderingRoom,
    runRoomVisualization,
    renderedRoomUrl,
    activeProviderId,
  } = useStudioStore();

  const [promptNotes, setPromptNotes] = useState('');
  const [customRoomUploaded, setCustomRoomUploaded] = useState<string | null>(null);

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId) || templates[0];
  const curtainSrc = renderedImageUrl || selectedTemplate.real_photo_url || selectedTemplate.original_image_url;
  const currentRoom = ROOM_SETTINGS.find((r) => r.id === activeRoomType) || ROOM_SETTINGS[0];

  const handleUploadCustomRoom = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setCustomRoomUploaded(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden bg-[#F8F6F0] text-[#1A1714]">
      {/* Left Column: Room Viewport */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-hidden bg-[#EDE7DF]">
        {/* Architectural Ambient Grid */}
        <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#C49A1E_1px,transparent_1px)] [background-size:24px_24px]" />

        {/* Room View Container */}
        <div className="relative w-full max-w-4xl aspect-4/3 sm:aspect-16/10 rounded-3xl overflow-hidden border border-[#D4C9BC] shadow-lg bg-white flex items-center justify-center">
          {/* Background Room Canvas */}
          <div className="absolute inset-0 w-full h-full">
            {customRoomUploaded ? (
              <img
                src={customRoomUploaded}
                alt="Custom Room"
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className={`w-full h-full bg-gradient-to-br ${currentRoom.bgGradient} flex items-center justify-center relative`}
              >
                {/* Simulated Architectural Window Frame & Sunlight */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10 pointer-events-none" />
                <div className="absolute top-0 bottom-0 left-1/4 right-1/4 border-x border-white/40 pointer-events-none flex flex-col justify-between">
                  <div className="h-1 bg-white/50 w-full" />
                  <div className="h-1 bg-white/50 w-full" />
                </div>
              </div>
            )}
          </div>

          {/* Curtain Overlay Hanging in Window */}
          <div className="relative z-10 w-3/4 sm:w-1/2 max-h-[88%] flex flex-col items-center">
            {/* Curtain Rod */}
            <div className="w-full h-3 bg-gradient-to-r from-[#C49A1E] via-[#E8C868] to-[#C49A1E] rounded-full shadow-md mb-1 flex items-center justify-between px-2">
              <div className="w-2 h-2 rounded-full bg-[#8C6C14]" />
              <div className="w-2 h-2 rounded-full bg-[#8C6C14]" />
            </div>

            <div className="relative rounded-xl overflow-hidden shadow-2xl border border-white/50 bg-[#F5F0EB]/50">
              <img
                src={renderedRoomUrl || curtainSrc}
                alt="Curtain in Room"
                className="w-full object-contain max-h-[60vh] rounded-b-xl"
              />

              {/* Lighting Glow overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-transparent to-amber-500/10 pointer-events-none mix-blend-overlay" />
            </div>
          </div>

          {/* Room Metadata Card */}
          <div className="absolute bottom-5 left-5 z-20 bg-white/95 backdrop-blur-md border border-[#D4C9BC] p-3.5 rounded-2xl max-w-xs text-xs shadow-md">
            <div className="flex items-center gap-1.5 text-[#C49A1E] font-bold text-[11px] mb-0.5 font-mono uppercase tracking-wider">
              <Compass className="w-3.5 h-3.5" />
              <span>{currentRoom.styleTag}</span>
            </div>
            <h4 className="font-serif text-sm font-bold text-[#1A1714]">
              {currentRoom.name}
            </h4>
            <p className="text-[11px] text-[#6B5F54] mt-1 line-clamp-2 leading-relaxed">
              {currentRoom.description}
            </p>
          </div>

          {/* Top Actions */}
          <div className="absolute top-5 right-5 z-20 flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase bg-white/95 backdrop-blur-md border border-[#D4C9BC] px-3 py-1 rounded-full text-[#C49A1E] shadow-2xs">
              AI Engine: {activeProviderId.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Right Column: Architectural Settings Tray */}
      <div className="w-full md:w-96 border-t md:border-t-0 md:border-l border-[#E5DDD0] bg-[#FAF8F3] p-5 flex flex-col justify-between overflow-y-auto">
        <div className="space-y-5">
          {/* Header */}
          <div className="border-b border-[#E8E2D8] pb-3">
            <div className="flex items-center gap-2">
              <h3 className="font-serif text-base font-bold text-[#1A1714]">
                Room &amp; Ambiance Visualizer
              </h3>
              <span className="text-[10px] font-mono bg-[#FFF8E6] text-[#C49A1E] px-2 py-0.5 rounded-full border border-[#C49A1E]/40 font-bold">
                Step 03
              </span>
            </div>
            <p className="text-xs text-[#6B5F54] mt-0.5">
              Experience the drapery inside photorealistic luxury architectural settings with contextual window lighting.
            </p>
          </div>

          {/* Select Architectural Setting */}
          <div className="space-y-2">
            <label className="text-[11px] font-mono uppercase tracking-wider text-[#C49A1E] font-bold block">
              Curated Architectural Settings
            </label>

            <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
              {ROOM_SETTINGS.map((room) => {
                const isSelected = activeRoomType === room.id && !customRoomUploaded;
                return (
                  <div
                    key={room.id}
                    onClick={() => {
                      setActiveRoomType(room.id as any);
                      setCustomRoomUploaded(null);
                    }}
                    className={`p-3 rounded-xl border transition cursor-pointer ${
                      isSelected
                        ? 'bg-[#FFFDF8] border-2 border-[#C49A1E] shadow-xs ring-1 ring-[#C49A1E]/30'
                        : 'bg-white border-[#E5DDD0] hover:border-[#C49A1E]/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-serif text-xs font-bold text-[#1A1714]">
                        {room.name}
                      </span>
                      <span className="text-[10px] text-[#C49A1E] font-mono font-semibold">
                        {room.lighting}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#6B5F54] mt-1 leading-snug">
                      {room.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Custom Room Photo Upload */}
          <div className="pt-3 border-t border-[#E8E2D8] space-y-2">
            <label className="text-[11px] font-mono uppercase tracking-wider text-[#C49A1E] font-bold flex items-center justify-between">
              <span>Or Upload Client Room Photo</span>
              <Upload className="w-3.5 h-3.5" />
            </label>

            <label className="flex items-center justify-center p-3 border-2 border-dashed border-[#D4C9BC] hover:border-[#C49A1E] rounded-xl bg-white hover:bg-[#FFFDF8] transition cursor-pointer shadow-2xs">
              <input
                type="file"
                accept="image/*"
                onChange={handleUploadCustomRoom}
                className="hidden"
              />
              <span className="text-xs text-[#6B5F54] flex items-center gap-2 font-medium">
                <Camera className="w-4 h-4 text-[#C49A1E]" />
                {customRoomUploaded ? 'Change Client Window Photo' : 'Upload Client Window Photo (.JPG/.PNG)'}
              </span>
            </label>
          </div>

          {/* Custom AI Prompt Notes */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono uppercase tracking-wider text-[#6B5F54] font-semibold block">
              Lighting Directives &amp; Styling
            </label>
            <textarea
              value={promptNotes}
              onChange={(e) => setPromptNotes(e.target.value)}
              placeholder="e.g. Soft morning light angled 45 degrees, warm shearling furniture, highlight gold sheen..."
              rows={2}
              className="w-full bg-white border border-[#D4C9BC] text-[#1A1714] text-xs p-2.5 rounded-xl focus:outline-none focus:border-[#C49A1E] placeholder:text-[#9E9088] shadow-2xs"
            />
          </div>
        </div>

        {/* Action Button & Step Navigation */}
        <div className="pt-4 border-t border-[#E8E2D8] space-y-2.5">
          <button
            onClick={() => runRoomVisualization(promptNotes)}
            disabled={isRenderingRoom}
            className="w-full bg-gradient-to-r from-[#F5DE8B] via-[#D4AF37] to-[#8C7322] hover:brightness-105 text-[#0A0B0E] font-bold text-xs py-3 rounded-xl transition cursor-pointer shadow-md flex items-center justify-center gap-2 disabled:opacity-50 border border-[#F5DE8B]/40"
          >
            <Sparkles className={`w-4 h-4 ${isRenderingRoom ? 'animate-spin' : ''}`} />
            <span>
              {isRenderingRoom
                ? 'Synthesizing Room with AI...'
                : `Simulate Room Lighting with AI (${activeProviderId.toUpperCase()})`}
            </span>
          </button>

          {onProceedToGenerate && (
            <div className="flex items-center gap-2 pt-1">
              {onBackToAtelier && (
                <button
                  type="button"
                  onClick={onBackToAtelier}
                  className="tactile-press px-3 py-2 rounded-xl border border-[#D4C9BC] bg-white hover:bg-[#F8F5F0] text-xs font-medium text-[#6B5F54] flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
              )}
              <button
                type="button"
                onClick={onProceedToGenerate}
                className="flex-1 tactile-press px-3 py-2 rounded-xl bg-white hover:bg-[#FFFDF8] border border-[#C49A1E] text-xs font-bold text-[#C49A1E] flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <span>Proceed to Lookbook &amp; Export</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
