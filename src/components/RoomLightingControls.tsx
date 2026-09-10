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
  const activeSetting = ROOM_SETTING_OPTIONS.find((s) => s.id === currentSetting) || ROOM_SETTING_OPTIONS[0];

  return (
    <div className="bg-stone-900/95 backdrop-blur-md border-b border-stone-800 px-4 sm:px-6 py-2 text-xs flex flex-wrap items-center justify-between gap-3 text-stone-200 z-20">
      {/* Left: Dynamic Room Lighting Simulator */}
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5 shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Room Lighting:</span>
        </span>

        <div className="flex items-center gap-1 bg-stone-950 p-1 rounded-lg border border-stone-800">
          {ROOM_LIGHTING_OPTIONS.map((light) => {
            const isSelected = light.id === currentLighting;
            const Icon = light.id === 'daylight' ? Sun : light.id === 'golden_hour' ? Sunset : Moon;
            return (
              <button
                key={light.id}
                type="button"
                onClick={() => onSelectLighting(light.id)}
                title={`${light.name} (${light.kelvin}): ${light.description}`}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500 text-stone-950 font-bold shadow-xs'
                    : 'text-stone-400 hover:text-stone-200 hover:bg-stone-850'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-stone-950' : 'text-stone-400'}`} />
                <span className="hidden md:inline">{light.name}</span>
                <span className="md:hidden">{light.timeLabel}</span>
              </button>
            );
          })}
        </div>

        <span className="text-[11px] text-stone-400 font-mono hidden lg:inline pl-1">
          {activeLight.kelvin}
        </span>
      </div>

      {/* Right: Architectural Room Setting & Presentation Toggle */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-stone-400 font-medium hidden sm:inline">Interior Setting:</span>
          <select
            id="room-setting-select"
            value={currentSetting}
            onChange={(e) => onSelectSetting(e.target.value as RoomSettingId)}
            className="bg-stone-950 text-stone-200 border border-stone-700 rounded-md text-[11px] py-1 px-2.5 focus:outline-none focus:border-amber-400 cursor-pointer font-medium"
          >
            {ROOM_SETTING_OPTIONS.map((set) => (
              <option key={set.id} value={set.id}>
                {set.name}
              </option>
            ))}
          </select>
        </div>

        {/* Client Presentation View Toggle */}
        <button
          type="button"
          onClick={onTogglePresentationMode}
          className={`flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-md border transition cursor-pointer font-medium ${
            isPresentationMode
              ? 'bg-amber-500/20 text-amber-300 border-amber-500 shadow-xs'
              : 'bg-stone-850 text-stone-300 border-stone-750 hover:border-stone-600 hover:text-stone-100'
          }`}
          title="Distraction-free client presentation mode"
        >
          <Eye className="w-3.5 h-3.5 text-amber-400" />
          <span>{isPresentationMode ? 'Exit Presentation' : 'Client Mode'}</span>
        </button>
      </div>
    </div>
  );
};
