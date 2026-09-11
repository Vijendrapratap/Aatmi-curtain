import React from 'react';
import { RoomLightingId, RoomSettingId } from '../types/auth';
import { ROOM_LIGHTING_OPTIONS, ROOM_SETTING_OPTIONS } from '../data/roomSettings';
import { Sun, Sunset, Moon, Sparkles, Building, Sliders, Eye } from 'lucide-react';

interface RoomLightingControlsProps {
  currentLighting: RoomLightingId;
  onSelectLighting: (id: RoomLightingId) => void;
  currentSetting: RoomSettingId;
  onSelectSetting: (id: RoomSettingId) => void;
  isPresentationMode: boolean;
  onTogglePresentationMode: () => void;
}

export const RoomLightingControls: React.FC<RoomLightingControlsProps> = ({
  currentLighting,
  onSelectLighting,
  currentSetting,
  onSelectSetting,
  isPresentationMode,
  onTogglePresentationMode,
}) => {
  const activeLight = ROOM_LIGHTING_OPTIONS.find((l) => l.id === currentLighting) || ROOM_LIGHTING_OPTIONS[0];

  return (
    <div className="bg-[#F0EBE4] border-b border-[#C9BFB4] px-3 sm:px-6 py-2 text-xs flex items-center justify-between gap-2 sm:gap-4 text-stone-200 z-20 overflow-x-auto scrollbar-none">
      {/* Left: Dynamic Room Lighting Simulator */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-[10px] sm:text-[11px] font-semibold text-[#C49A1E] uppercase tracking-wider flex items-center gap-1.5 shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-[#C49A1E] shrink-0" />
          <span className="hidden sm:inline">Ambiance:</span>
        </span>

        <div className="flex items-center gap-1 bg-black/60 p-1 rounded-xl border border-[#C9BFB4]">
          {ROOM_LIGHTING_OPTIONS.map((light) => {
            const isSelected = light.id === currentLighting;
            const Icon = light.id === 'daylight' ? Sun : light.id === 'golden_hour' ? Sunset : Moon;
            return (
              <button
                key={light.id}
                type="button"
                onClick={() => onSelectLighting(light.id)}
                title={`${light.name} (${light.kelvin}): ${light.description}`}
                className={`tactile-press flex items-center gap-1 sm:gap-1.5 pl-2 pr-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-medium transition cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-gradient-to-r from-[#D4AF37] to-[#B89025] text-stone-950 font-bold shadow-xs'
                    : 'text-stone-400 hover:text-stone-200 hover:bg-[#F0EBE4]'
                }`}
              >
                <Icon className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${isSelected ? 'text-stone-950' : 'text-stone-400'}`} />
                <span className="hidden xs:inline">{light.name}</span>
                <span className="xs:hidden">{light.timeLabel.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>

        <span className="text-[10px] sm:text-[11px] text-stone-500 font-mono hidden md:inline pl-1">
          {activeLight.kelvin}
        </span>
      </div>

      {/* Right: Architectural Room Setting & Presentation Toggle */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] sm:text-[11px] text-stone-400 font-medium hidden lg:inline">Setting:</span>
          <select
            id="room-setting-select"
            value={currentSetting}
            onChange={(e) => onSelectSetting(e.target.value as RoomSettingId)}
            className="bg-black/60 text-stone-200 border border-[#C9BFB4] rounded-lg text-[10px] sm:text-[11px] py-1 px-2 sm:px-2.5 focus:outline-none focus:border-[#D4AF37] cursor-pointer font-medium max-w-[120px] sm:max-w-none truncate"
          >
            {ROOM_SETTING_OPTIONS.map((set) => (
              <option key={set.id} value={set.id} className="bg-[#F0EBE4] text-stone-200">
                {set.name}
              </option>
            ))}
          </select>
        </div>

        {/* Client Presentation View Toggle */}
        <button
          type="button"
          onClick={onTogglePresentationMode}
          className={`tactile-press flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-[11px] pl-2 pr-2.5 py-1 rounded-lg border transition cursor-pointer font-medium whitespace-nowrap ${
            isPresentationMode
              ? 'bg-[#242013] text-[#B8900F] border-[#D4AF37]/50 shadow-xs'
              : 'bg-white/5 text-stone-300 border-[#C9BFB4] hover:border-white/20 hover:text-white'
          }`}
          title="Distraction-free client presentation mode"
        >
          <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#C49A1E]" />
          <span className="hidden sm:inline">{isPresentationMode ? 'Exit Presentation' : 'Client Mode'}</span>
          <span className="sm:hidden">{isPresentationMode ? 'Exit' : 'Client'}</span>
        </button>
      </div>
    </div>
  );
};
