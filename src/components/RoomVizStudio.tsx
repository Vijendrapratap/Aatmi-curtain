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
    bgGradient: 'from-[#1A1916] to-[#0E0E10]',
  },
  {
    id: 'penthouse',
    name: 'TriBeCa Modern Penthouse',
    description: 'Double-height floor-to-ceiling windows with brushed bronze mullions, travertine flooring, and city horizon view.',
    styleTag: 'Contemporary Luxury',
    lighting: 'Sunset Golden Hour',
    bgGradient: 'from-[#1B1917] to-[#121110]',
  },
  {
    id: 'master_bedroom',
    name: 'Haute Couture Master Suite',
    description: 'Fluted acoustic walnut slats, velvet upholstered headboard, concealed cove illumination, and shearling rug.',
    styleTag: 'Intimate Architectural',
    lighting: 'Evening Ambient Glow',
    bgGradient: 'from-[#16171B] to-[#0E0F12]',
  },
  {
    id: 'french_salon',
    name: 'Versailles Chinoiserie Gallery',
    description: 'Arched palladium windows overlooking private topiary gardens, crystal chandeliers, and silk wall hangings.',
    styleTag: 'Heritage French',
    lighting: 'Bright Diffused Sunlight',
    bgGradient: 'from-[#181A1C] to-[#0F1012]',
  },
  {
    id: 'minimalist_loft',
    name: 'Copenhagen Stone Residence',
    description: 'Limewashed plaster walls, microcement floors, organic monolithic stone island, and subtle ceiling drapery track.',
    styleTag: 'Scandinavian Warm Minimal',
    lighting: 'Clean Nordic Daylight',
    bgGradient: 'from-[#191918] to-[#111110]',
  },
];

export const RoomVizStudio: React.FC = () => {
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
    <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden bg-[#0D0E11] text-[#F9F6F0]">
      {/* Left Column: Room Viewport */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-hidden bg-radial from-[#1A1C22] to-[#0A0B0E]">
        {/* Architectural Ambient Grid */}
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:24px_24px]" />

        {/* Room View Container */}
        <div className="relative w-full max-w-4xl aspect-4/3 sm:aspect-16/10 rounded-2xl overflow-hidden border border-[#2B2E38] shadow-2xl bg-[#121318] flex items-center justify-center">
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
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none" />
                <div className="absolute top-0 bottom-0 left-1/4 right-1/4 border-x border-[#3A3D4A]/50 pointer-events-none flex flex-col justify-between">
                  <div className="h-1 bg-[#4B4E5D]/60 w-full" />
                  <div className="h-1 bg-[#4B4E5D]/60 w-full" />
                </div>
              </div>
            )}
          </div>

          {/* Curtain Overlay Hanging in Window */}
          <div className="relative z-10 w-3/4 sm:w-1/2 max-h-[88%] flex flex-col items-center">
            <div className="w-full h-3 bg-gradient-to-r from-[#8B7536] via-[#D4AF37] to-[#8B7536] rounded-full shadow-lg mb-1 flex items-center justify-between px-2">
              <div className="w-2 h-2 rounded-full bg-[#3B3012]" />
              <div className="w-2 h-2 rounded-full bg-[#3B3012]" />
            </div>

            <div className="relative rounded-lg overflow-hidden shadow-2xl border border-white/10">
              <img
                src={renderedRoomUrl || curtainSrc}
                alt="Curtain in Room"
                className="w-full object-contain max-h-[60vh] rounded-b-lg"
              />

              {/* Lighting Glow overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-transparent to-amber-500/10 pointer-events-none mix-blend-overlay" />
            </div>
          </div>

          {/* Room Metadata Card */}
          <div className="absolute bottom-4 left-4 z-20 bg-black/75 backdrop-blur-md border border-[#333642] p-3 rounded-xl max-w-xs text-xs">
            <div className="flex items-center gap-2 text-[#D4AF37] font-semibold text-[11px] mb-0.5">
              <Compass className="w-3.5 h-3.5" />
              <span>{currentRoom.styleTag}</span>
            </div>
            <h4 className="font-serif text-sm font-bold text-[#F9F6F0]">
              {currentRoom.name}
            </h4>
            <p className="text-[11px] text-[#A0A4B0] mt-1 line-clamp-2">
              {currentRoom.description}
            </p>
          </div>

          {/* Top Actions */}
          <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase bg-black/60 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-full text-[#D4AF37]">
              Engine: {activeProviderId.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Right Column: Architectural Settings Tray */}
      <div className="w-full md:w-96 border-t md:border-t-0 md:border-l border-[#252832] bg-[#121318] p-5 flex flex-col justify-between overflow-y-auto">
        <div className="space-y-5">
          {/* Header */}
          <div className="border-b border-[#252832] pb-3">
            <div className="flex items-center gap-2">
              <h3 className="font-serif text-base font-bold text-[#F9F6F0]">
                Room Visualizer (Room Viz)
              </h3>
              <span className="text-[10px] font-mono bg-[#D4AF37]/20 text-[#D4AF37] px-2 py-0.5 rounded-full border border-[#D4AF37]/40">
                Outpainting
              </span>
            </div>
            <p className="text-xs text-[#8C909C] mt-0.5">
              Visualize how your custom drapery hangs inside luxury architectural residences.
            </p>
          </div>

          {/* Select Architectural Setting */}
          <div className="space-y-2">
            <label className="text-[11px] font-mono uppercase tracking-wider text-[#D4AF37] font-semibold block">
              Curated Architectural Settings
            </label>

            <div className="space-y-2">
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
                        ? 'bg-[#1C1E26] border-[#D4AF37] ring-1 ring-[#D4AF37]/40'
                        : 'bg-[#16171D] border-[#252832] hover:border-[#3A3D49]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-serif text-xs font-bold text-[#F9F6F0]">
                        {room.name}
                      </span>
                      <span className="text-[10px] text-[#A68832] font-mono font-medium">
                        {room.lighting}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#8C909C] mt-1 leading-snug">
                      {room.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Custom Room Photo Upload */}
          <div className="pt-3 border-t border-[#252832] space-y-2">
            <label className="text-[11px] font-mono uppercase tracking-wider text-[#D4AF37] font-semibold flex items-center justify-between">
              <span>Or Upload Client Room Photo</span>
              <Upload className="w-3 h-3" />
            </label>

            <label className="flex items-center justify-center p-3 border border-dashed border-[#343845] hover:border-[#D4AF37] rounded-xl bg-[#16171D] hover:bg-[#1A1C23] transition cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleUploadCustomRoom}
                className="hidden"
              />
              <span className="text-xs text-[#A0A4B0] flex items-center gap-2">
                <Camera className="w-4 h-4 text-[#D4AF37]" />
                {customRoomUploaded ? 'Change Client Room Photo' : 'Upload Client Window Photo (.JPG/.PNG)'}
              </span>
            </label>
          </div>

          {/* Custom AI Prompt Notes */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono uppercase tracking-wider text-[#8C909C] font-semibold block">
              Architectural Lighting & Styling Directives
            </label>
            <textarea
              value={promptNotes}
              onChange={(e) => setPromptNotes(e.target.value)}
              placeholder="e.g. Soft morning light angled 45 degrees, warm shearling furniture, highlight gold sheen..."
              rows={2}
              className="w-full bg-[#16171D] border border-[#2B2E39] text-[#F9F6F0] text-xs p-2.5 rounded-lg focus:outline-none focus:border-[#D4AF37] placeholder:text-[#5E626E]"
            />
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-4 border-t border-[#252832] space-y-2">
          <button
            onClick={() => runRoomVisualization(promptNotes)}
            disabled={isRenderingRoom}
            className="w-full bg-gradient-to-r from-[#D4AF37] to-[#B59128] hover:from-[#E5C058] hover:to-[#C6A035] text-[#0D0E10] font-bold text-xs py-3 rounded-xl transition cursor-pointer shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Sparkles className={`w-4 h-4 ${isRenderingRoom ? 'animate-spin' : ''}`} />
            <span>
              {isRenderingRoom
                ? 'Synthesizing Room with AI...'
                : `Generate Room Visualization (${activeProviderId.toUpperCase()})`}
            </span>
          </button>

          <p className="text-[10px] text-center text-[#7A7E89]">
            Generates high-resolution architectural interior with physical window light casting on drapery.
          </p>
        </div>
      </div>
    </div>
  );
};
