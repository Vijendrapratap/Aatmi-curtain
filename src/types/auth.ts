export type UserRole = 'designer' | 'homeowner' | 'brand_partner';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  studioName?: string;
  location?: string;
  avatarUrl?: string;
  savedProjectsCount: number;
  tradeDiscountPercent?: number;
}

export type RoomLightingId = 'daylight' | 'golden_hour' | 'evening_luxury';

export interface RoomLightingOption {
  id: RoomLightingId;
  name: string;
  timeLabel: string;
  kelvin: string;
  iconName: string;
  description: string;
  canvasFilter: string;
  tintOverlay: string;
  highlightIntensity: number;
  shadowIntensity: number;
}

export type RoomSettingId = 'parisian' | 'penthouse' | 'minimalist' | 'coastal';

export interface RoomSettingOption {
  id: RoomSettingId;
  name: string;
  wallTexture: string;
  floorStyle: string;
  aesthetic: string;
  bgGradient: string;
}

export interface ClientProject {
  id: string;
  name: string;
  clientName: string;
  roomName: string;
  templateId: string;
  assignments: { region_id: string; fabric_id: string }[];
  updatedAt: string;
}
