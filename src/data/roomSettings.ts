import { RoomLightingOption, RoomSettingOption, UserProfile } from '../types/auth';

export const ROOM_LIGHTING_OPTIONS: RoomLightingOption[] = [
  {
    id: 'daylight',
    name: 'Morning Daylight',
    timeLabel: '10:00 AM',
    kelvin: '5,500K Pure Sun',
    iconName: 'Sun',
    description: 'Crisp natural window daylight highlighting authentic fabric color, weave crispness, and soft pleat shadows.',
    canvasFilter: 'brightness(1.03) contrast(1.02) saturate(1.0)',
    tintOverlay: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(240, 245, 255, 0.02) 100%)',
    highlightIntensity: 1.1,
    shadowIntensity: 0.9,
  },
  {
    id: 'golden_hour',
    name: 'Warm Golden Hour',
    timeLabel: '5:30 PM',
    kelvin: '3,200K Sunset Rays',
    iconName: 'Sunset',
    description: 'Warm, low-angle sunset glow casting rich amber rays, highlighting metallic threads, slub texture, and deep pleats.',
    canvasFilter: 'brightness(1.02) contrast(1.06) sepia(0.18) saturate(1.15)',
    tintOverlay: 'linear-gradient(105deg, rgba(255, 180, 50, 0.15) 0%, rgba(230, 120, 20, 0.08) 60%, rgba(20, 10, 5, 0.12) 100%)',
    highlightIntensity: 1.3,
    shadowIntensity: 1.25,
  },
  {
    id: 'evening_luxury',
    name: 'Evening Ambiance',
    timeLabel: '9:00 PM',
    kelvin: '2,700K Architectural Downlights',
    iconName: 'Moon',
    description: 'Sophisticated evening interior lighting with warm recessed spotlights, moody contrast, and rich velvet sheen.',
    canvasFilter: 'brightness(0.94) contrast(1.12) sepia(0.12) saturate(1.08)',
    tintOverlay: 'radial-gradient(ellipse at 50% 10%, rgba(255, 220, 150, 0.16) 0%, rgba(30, 25, 20, 0.25) 80%)',
    highlightIntensity: 1.2,
    shadowIntensity: 1.4,
  },
];

export const ROOM_SETTING_OPTIONS: RoomSettingOption[] = [
  {
    id: 'parisian',
    name: 'Classic Parisian Boiserie',
    wallTexture: 'Soft warm French limestone with crown moulding',
    floorStyle: 'Aged French oak herringbone parquet',
    aesthetic: 'Timeless Haute Couture & European Salon',
    bgGradient: 'linear-gradient(180deg, #EBE7DD 0%, #DFDAD0 65%, #8B623E 65%, #69492D 100%)',
  },
  {
    id: 'penthouse',
    name: 'Minimalist Penthouse',
    wallTexture: 'Hand-troweled warm lime plaster',
    floorStyle: 'Light Scandinavian wide-plank oak',
    aesthetic: 'Contemporary Architectural Luxury',
    bgGradient: 'linear-gradient(180deg, #F4F3EE 0%, #E6E3DB 72%, #C4B59D 72%, #9E8E76 100%)',
  },
  {
    id: 'minimalist',
    name: 'Modern Milanese Salon',
    wallTexture: 'Dark espresso fluted oak with bronze accents',
    floorStyle: 'Honed Roman travertine marble',
    aesthetic: 'Bold High-End Italian Design',
    bgGradient: 'linear-gradient(180deg, #2D2F33 0%, #222428 70%, #8A857A 70%, #686358 100%)',
  },
  {
    id: 'coastal',
    name: 'Sunlit Coastal Villa',
    wallTexture: 'Chalk white matte plaster with sea breeze glow',
    floorStyle: 'Pale limestone slabs with natural fossilization',
    aesthetic: 'Airy, Organic Luxury & Relaxed Elegance',
    bgGradient: 'linear-gradient(180deg, #FAF8F5 0%, #EFEBE4 70%, #D5CEBF 70%, #B8AF9F 100%)',
  },
];

export const DEMO_USERS: UserProfile[] = [
  {
    id: 'user-designer-1',
    name: 'Elena Vance',
    email: 'elena@studiovance.com',
    role: 'designer',
    studioName: 'Studio Vance Milan',
    location: 'Milan & New York',
    savedProjectsCount: 14,
    tradeDiscountPercent: 25,
  },
  {
    id: 'user-homeowner-1',
    name: 'Marcus Sterling',
    email: 'marcus@sterlingresidence.ny',
    role: 'homeowner',
    studioName: 'Sterling Penthouse 18B',
    location: 'Tribeca, New York',
    savedProjectsCount: 2,
    tradeDiscountPercent: 0,
  },
  {
    id: 'user-brand-1',
    name: 'Camille Laurent',
    email: 'camille@rubelli-textiles.fr',
    role: 'brand_partner',
    studioName: 'Laurent Textiles Showroom',
    location: 'Paris & Lyon',
    savedProjectsCount: 56,
    tradeDiscountPercent: 35,
  },
];

