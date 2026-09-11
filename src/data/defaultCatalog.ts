import { CurtainTemplate, Fabric } from '../types/curtain';
import { USER_UPLOADED_FABRICS } from './userUploadedFabrics';

// Curated Luxury Fabrics for Brand Aatmi (including all user uploaded samples)
export const DEFAULT_FABRICS: Fabric[] = [
  ...USER_UPLOADED_FABRICS,
  {
    id: 'fab-emerald-velvet',
    name: 'Emerald Royale Velvet',
    category: 'Velvet',
    image_url: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="160" height="160">
        <defs>
          <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#083827"/>
            <stop offset="35%" stop-color="#0F5A41"/>
            <stop offset="70%" stop-color="#0B4330"/>
            <stop offset="100%" stop-color="#05261A"/>
          </linearGradient>
          <filter id="noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" result="noise"/>
            <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.15 0"/>
            <feBlend mode="overlay" in2="SourceGraphic"/>
          </filter>
        </defs>
        <rect width="160" height="160" fill="url(#g1)"/>
        <rect width="160" height="160" fill="#136F50" opacity="0.25" filter="url(#noise)"/>
        <line x1="0" y1="20" x2="160" y2="20" stroke="#1D8E67" stroke-width="0.8" opacity="0.3"/>
        <line x1="0" y1="60" x2="160" y2="60" stroke="#1D8E67" stroke-width="0.8" opacity="0.3"/>
        <line x1="0" y1="100" x2="160" y2="100" stroke="#1D8E67" stroke-width="0.8" opacity="0.3"/>
        <line x1="0" y1="140" x2="160" y2="140" stroke="#1D8E67" stroke-width="0.8" opacity="0.3"/>
      </svg>
    `),
    tileable: true,
    tags: ['velvet', 'solid', 'luxury', 'jewel tone'],
    metadata: {
      weave: 'Plush Dense Pile',
      scale: 'fine',
      sheen: 'Subtle Luster',
      weight: 'Heavyweight Drapery',
      composition: '100% Cotton-Luxe Velvet',
    },
    color_hex: '#0d4a37',
  },
  {
    id: 'fab-croc-espresso',
    name: 'Crocodile Embossed Bronze',
    category: 'Exotic Relief',
    image_url: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120">
        <defs>
          <linearGradient id="crocGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#3A2C21"/>
            <stop offset="50%" stop-color="#4E3B2E"/>
            <stop offset="100%" stop-color="#281E16"/>
          </linearGradient>
        </defs>
        <rect width="120" height="120" fill="url(#crocGrad)"/>
        <!-- Reptilian scale grid with gold sheen seams -->
        <g stroke="#6A5342" stroke-width="1.8" fill="none" opacity="0.8">
          <rect x="6" y="6" width="32" height="24" rx="4" fill="#3D2E24"/>
          <rect x="42" y="6" width="40" height="24" rx="4" fill="#443428"/>
          <rect x="86" y="6" width="28" height="24" rx="4" fill="#38291F"/>

          <rect x="6" y="34" width="46" height="26" rx="4" fill="#49382B"/>
          <rect x="56" y="34" width="30" height="26" rx="4" fill="#3D2E24"/>
          <rect x="90" y="34" width="24" height="26" rx="4" fill="#443428"/>

          <rect x="6" y="64" width="26" height="24" rx="4" fill="#38291F"/>
          <rect x="36" y="64" width="44" height="24" rx="4" fill="#46362A"/>
          <rect x="84" y="64" width="30" height="24" rx="4" fill="#3D2E24"/>

          <rect x="6" y="92" width="40" height="22" rx="4" fill="#443428"/>
          <rect x="50" y="92" width="36" height="22" rx="4" fill="#38291F"/>
          <rect x="90" y="92" width="24" height="22" rx="4" fill="#49382B"/>
        </g>
        <circle cx="22" cy="18" r="1.5" fill="#B48E59" opacity="0.7"/>
        <circle cx="62" cy="18" r="1.5" fill="#B48E59" opacity="0.7"/>
        <circle cx="29" cy="47" r="1.5" fill="#B48E59" opacity="0.7"/>
        <circle cx="71" cy="47" r="1.5" fill="#B48E59" opacity="0.7"/>
      </svg>
    `),
    tileable: true,
    tags: ['leatherette', 'crocodile', 'accent band', 'textured'],
    metadata: {
      weave: 'Embossed Relief Matrix',
      scale: 'medium',
      sheen: 'High Sheen',
      weight: 'Heavyweight Drapery',
      composition: 'Embossed Vegan Leather with Foil Accents',
    },
    color_hex: '#3e2e23',
  },
  {
    id: 'fab-belgian-oatmeal',
    name: 'Belgian Slubbed Oatmeal Linen',
    category: 'Linen',
    image_url: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="140" height="140">
        <defs>
          <linearGradient id="linenGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#E8E2D5"/>
            <stop offset="100%" stop-color="#DDD6C7"/>
          </linearGradient>
        </defs>
        <rect width="140" height="140" fill="url(#linenGrad)"/>
        <!-- Crosshatch linen slubs -->
        <g stroke="#C2B8A4" stroke-width="0.7" opacity="0.65">
          <line x1="0" y1="12" x2="140" y2="12"/>
          <line x1="0" y1="28" x2="140" y2="28" stroke-width="1.2" stroke="#B8AC96"/>
          <line x1="0" y1="44" x2="140" y2="44"/>
          <line x1="0" y1="60" x2="140" y2="60"/>
          <line x1="0" y1="76" x2="140" y2="76" stroke-width="1.1"/>
          <line x1="0" y1="92" x2="140" y2="92"/>
          <line x1="0" y1="108" x2="140" y2="108"/>
          <line x1="0" y1="124" x2="140" y2="124" stroke-width="1.3" stroke="#B8AC96"/>

          <line x1="14" y1="0" x2="14" y2="140"/>
          <line x1="32" y1="0" x2="32" y2="140" stroke-width="1.1"/>
          <line x1="50" y1="0" x2="50" y2="140"/>
          <line x1="68" y1="0" x2="68" y2="140"/>
          <line x1="86" y1="0" x2="86" y2="140" stroke-width="1.2"/>
          <line x1="104" y1="0" x2="104" y2="140"/>
          <line x1="122" y1="0" x2="122" y2="140"/>
        </g>
      </svg>
    `),
    tileable: true,
    tags: ['linen', 'natural', 'breathable', 'slub', 'neutral'],
    metadata: {
      weave: 'Plain Loose Slub Weave',
      scale: 'fine',
      sheen: 'Matte',
      weight: 'Medium',
      composition: '100% Organic Flax Linen',
    },
    color_hex: '#e2dcce',
  },
  {
    id: 'fab-gold-damask',
    name: 'Imperial Champagne Damask',
    category: 'Jacquard & Damask',
    image_url: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="160" height="160">
        <defs>
          <linearGradient id="damaskBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#EADDC7"/>
            <stop offset="50%" stop-color="#DFCFB2"/>
            <stop offset="100%" stop-color="#D2BF9E"/>
          </linearGradient>
        </defs>
        <rect width="160" height="160" fill="url(#damaskBg)"/>
        <!-- Ornate damask acanthus motif -->
        <g fill="#A88B58" opacity="0.75">
          <!-- Center floral crest -->
          <path d="M80 30 C70 45, 60 55, 60 70 C60 85, 72 95, 80 105 C88 95, 100 85, 100 70 C100 55, 90 45, 80 30 Z M80 45 C85 55, 92 65, 90 75 C88 85, 82 92, 80 95 C78 92, 72 85, 70 75 C68 65, 75 55, 80 45 Z" />
          <circle cx="80" cy="70" r="5" fill="#7C6236"/>
          <!-- Leaf side scrolls -->
          <path d="M55 60 C42 55, 35 68, 45 80 C55 90, 65 85, 65 78 C65 72, 60 65, 55 60 Z"/>
          <path d="M105 60 C118 55, 125 68, 115 80 C105 90, 95 85, 95 78 C95 72, 100 65, 105 60 Z"/>
          <!-- Corner flourishes -->
          <path d="M10 10 C20 15, 25 25, 20 35 C15 30, 12 20, 10 10 Z"/>
          <path d="M150 10 C140 15, 135 25, 140 35 C145 30, 148 20, 150 10 Z"/>
          <path d="M10 150 C20 145, 25 135, 20 125 C15 130, 12 140, 10 150 Z"/>
          <path d="M150 150 C140 145, 135 135, 140 125 C145 130, 148 140, 150 150 Z"/>
        </g>
      </svg>
    `),
    tileable: true,
    tags: ['damask', 'jacquard', 'embroidered', 'gold', 'ornate'],
    metadata: {
      weave: 'Jacquard Brocade',
      scale: 'bold',
      sheen: 'Subtle Luster',
      weight: 'Heavyweight Drapery',
      composition: 'Silk & Metallic Lurex Blend',
    },
    color_hex: '#d8c5a4',
  },
  {
    id: 'fab-charcoal-slate',
    name: 'Architectural Slate Hemming Wool',
    category: 'Textured & Bouclé',
    image_url: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">
        <defs>
          <linearGradient id="charcoalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#2D3136"/>
            <stop offset="50%" stop-color="#24272B"/>
            <stop offset="100%" stop-color="#1A1C1F"/>
          </linearGradient>
        </defs>
        <rect width="100" height="100" fill="url(#charcoalGrad)"/>
        <g stroke="#3D434B" stroke-width="0.8" opacity="0.6">
          <line x1="0" y1="10" x2="100" y2="10"/>
          <line x1="0" y1="20" x2="100" y2="20"/>
          <line x1="0" y1="30" x2="100" y2="30"/>
          <line x1="0" y1="40" x2="100" y2="40"/>
          <line x1="0" y1="50" x2="100" y2="50"/>
          <line x1="0" y1="60" x2="100" y2="60"/>
          <line x1="0" y1="70" x2="100" y2="70"/>
          <line x1="0" y1="80" x2="100" y2="80"/>
          <line x1="0" y1="90" x2="100" y2="90"/>
        </g>
      </svg>
    `),
    tileable: true,
    tags: ['wool', 'charcoal', 'solid', 'hem', 'border'],
    metadata: {
      weave: 'Worsted Twill',
      scale: 'fine',
      sheen: 'Matte',
      weight: 'Heavyweight Drapery',
      composition: '80% Wool, 20% Silk',
    },
    color_hex: '#272a2e',
  },
  {
    id: 'fab-midnight-navy-boucle',
    name: 'Midnight Prussian Bouclé',
    category: 'Textured & Bouclé',
    image_url: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120">
        <rect width="120" height="120" fill="#131B2A"/>
        <!-- Nubby textured looped knots -->
        <g fill="#212E45" opacity="0.85">
          <circle cx="15" cy="15" r="4.5"/>
          <circle cx="35" cy="22" r="5.5"/>
          <circle cx="55" cy="12" r="4"/>
          <circle cx="78" cy="20" r="5"/>
          <circle cx="102" cy="14" r="4.5"/>

          <circle cx="20" cy="45" r="5"/>
          <circle cx="42" cy="50" r="4"/>
          <circle cx="68" cy="42" r="5.5"/>
          <circle cx="92" cy="48" r="4"/>
          <circle cx="112" cy="40" r="4.5"/>

          <circle cx="12" cy="78" r="4"/>
          <circle cx="38" cy="72" r="5"/>
          <circle cx="62" cy="80" r="4.5"/>
          <circle cx="85" cy="74" r="5.5"/>
          <circle cx="106" cy="82" r="4"/>

          <circle cx="24" cy="105" r="5"/>
          <circle cx="48" cy="112" r="4"/>
          <circle cx="74" cy="104" r="5.5"/>
          <circle cx="98" cy="110" r="4.5"/>
        </g>
        <circle cx="35" cy="22" r="2" fill="#3D5174" opacity="0.6"/>
        <circle cx="68" cy="42" r="2" fill="#3D5174" opacity="0.6"/>
        <circle cx="85" cy="74" r="2" fill="#3D5174" opacity="0.6"/>
      </svg>
    `),
    tileable: true,
    tags: ['boucle', 'navy', 'tactile', 'modern luxury'],
    metadata: {
      weave: 'Looped Nubby Bouclé',
      scale: 'medium',
      sheen: 'Matte',
      weight: 'Heavyweight Drapery',
      composition: 'Cotton, Wool & Alpaca Blend',
    },
    color_hex: '#162033',
  },
  {
    id: 'fab-rose-dupioni',
    name: 'Blush Rose Silk Dupioni',
    category: 'Silk',
    image_url: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="130" height="130">
        <defs>
          <linearGradient id="silkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#EED5D0"/>
            <stop offset="50%" stop-color="#E5C2BC"/>
            <stop offset="100%" stop-color="#D8ADA6"/>
          </linearGradient>
        </defs>
        <rect width="130" height="130" fill="url(#silkGrad)"/>
        <g stroke="#C6958E" stroke-width="0.9" opacity="0.45">
          <line x1="0" y1="18" x2="130" y2="18"/>
          <line x1="0" y1="36" x2="130" y2="36" stroke-width="1.4" stroke="#B87F77"/>
          <line x1="0" y1="62" x2="130" y2="62"/>
          <line x1="0" y1="84" x2="130" y2="84" stroke-width="1.3"/>
          <line x1="0" y1="110" x2="130" y2="110"/>
        </g>
      </svg>
    `),
    tileable: true,
    tags: ['silk', 'blush', 'soft', 'feminine', 'luster'],
    metadata: {
      weave: 'Raw Filament Dupioni',
      scale: 'fine',
      sheen: 'Subtle Luster',
      weight: 'Medium',
      composition: '100% Mulberry Silk',
    },
    color_hex: '#e2bfb8',
  },
  {
    id: 'fab-moroccan-trellis',
    name: 'Artisan Terracotta Trellis',
    category: 'Geometric',
    image_url: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120">
        <rect width="120" height="120" fill="#B95C3E"/>
        <!-- Interlocking Moroccan lattice -->
        <g stroke="#EAD3C8" stroke-width="2" fill="none" opacity="0.85">
          <path d="M60 10 L85 35 L60 60 L35 35 Z"/>
          <path d="M60 70 L85 95 L60 120 L35 95 Z"/>
          <path d="M0 10 L25 35 L0 60 L-25 35 Z"/>
          <path d="M120 10 L145 35 L120 60 L95 35 Z"/>
          <path d="M0 70 L25 95 L0 120 L-25 95 Z"/>
          <path d="M120 70 L145 95 L120 120 L95 95 Z"/>
        </g>
        <circle cx="60" cy="35" r="3" fill="#EAD3C8" opacity="0.9"/>
        <circle cx="60" cy="95" r="3" fill="#EAD3C8" opacity="0.9"/>
      </svg>
    `),
    tileable: true,
    tags: ['geometric', 'terracotta', 'border', 'accent', 'moroccan'],
    metadata: {
      weave: 'Tapestry Weave',
      scale: 'medium',
      sheen: 'Matte',
      weight: 'Medium',
      composition: 'Cotton & Linen Jacquard',
    },
    color_hex: '#b3573a',
  },
  {
    id: 'fab-classic-houndstooth',
    name: 'Mayfair Woven Houndstooth',
    category: 'Textured & Bouclé',
    image_url: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120">
        <rect width="120" height="120" fill="#F7F6F2"/>
        <g fill="#141619">
          <!-- 4x4 houndstooth matrix -->
          <rect x="0" y="0" width="15" height="15"/>
          <path d="M15 15 L30 15 L30 30 Z"/>
          <path d="M15 0 L30 15 L15 15 Z"/>
          <rect x="30" y="0" width="15" height="15"/>
          <path d="M45 15 L60 15 L60 30 Z"/>
          <path d="M45 0 L60 15 L45 15 Z"/>
          <rect x="60" y="0" width="15" height="15"/>
          <path d="M75 15 L90 15 L90 30 Z"/>
          <path d="M75 0 L90 15 L75 15 Z"/>
          <rect x="90" y="0" width="15" height="15"/>
          <path d="M105 15 L120 15 L120 30 Z"/>
          <path d="M105 0 L120 15 L105 15 Z"/>

          <rect x="0" y="30" width="15" height="15"/>
          <path d="M15 45 L30 45 L30 60 Z"/>
          <path d="M15 30 L30 45 L15 45 Z"/>
          <rect x="30" y="30" width="15" height="15"/>
          <path d="M45 45 L60 45 L60 60 Z"/>
          <path d="M45 30 L60 45 L45 45 Z"/>
          <rect x="60" y="30" width="15" height="15"/>
          <path d="M75 45 L90 45 L90 60 Z"/>
          <path d="M75 30 L90 45 L75 45 Z"/>
          <rect x="90" y="30" width="15" height="15"/>
          <path d="M105 45 L120 45 L120 60 Z"/>
          <path d="M105 30 L120 45 L105 45 Z"/>

          <rect x="0" y="60" width="15" height="15"/>
          <path d="M15 75 L30 75 L30 90 Z"/>
          <path d="M15 60 L30 75 L15 75 Z"/>
          <rect x="30" y="60" width="15" height="15"/>
          <path d="M45 75 L60 75 L60 90 Z"/>
          <path d="M45 60 L60 75 L45 75 Z"/>
          <rect x="60" y="60" width="15" height="15"/>
          <path d="M75 75 L90 75 L90 90 Z"/>
          <path d="M75 60 L90 75 L75 75 Z"/>
          <rect x="90" y="60" width="15" height="15"/>
          <path d="M105 75 L120 75 L120 90 Z"/>
          <path d="M105 60 L120 75 L105 75 Z"/>

          <rect x="0" y="90" width="15" height="15"/>
          <path d="M15 105 L30 105 L30 120 Z"/>
          <path d="M15 90 L30 105 L15 105 Z"/>
          <rect x="30" y="90" width="15" height="15"/>
          <path d="M45 105 L60 105 L60 120 Z"/>
          <path d="M45 90 L60 105 L45 105 Z"/>
          <rect x="60" y="90" width="15" height="15"/>
          <path d="M75 105 L90 105 L90 120 Z"/>
          <path d="M75 90 L90 105 L75 105 Z"/>
          <rect x="90" y="90" width="15" height="15"/>
          <path d="M105 105 L120 105 L120 120 Z"/>
          <path d="M105 90 L120 105 L105 105 Z"/>
        </g>
      </svg>
    `),
    tileable: true,
    tags: ['houndstooth', 'black-and-white', 'classic', 'skirt', 'tailored'],
    metadata: {
      weave: 'Twill Woven Dogtooth',
      scale: 'medium',
      sheen: 'Matte',
      weight: 'Heavyweight Drapery',
      composition: 'Wool & Spun Rayon Blend',
    },
    color_hex: '#181A1D',
  },
  {
    id: 'fab-chevron-jacquard',
    name: 'Champagne & Charcoal Chevron Jacquard',
    category: 'Jacquard & Damask',
    image_url: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="140" height="140">
        <rect width="140" height="140" fill="#1C1F24"/>
        <g stroke="#D1BA8D" stroke-width="4.5" fill="none">
          <path d="M0 15 L35 45 L70 15 L105 45 L140 15"/>
          <path d="M0 45 L35 75 L70 45 L105 75 L140 45"/>
          <path d="M0 75 L35 105 L70 75 L105 105 L140 75"/>
          <path d="M0 105 L35 135 L70 105 L105 135 L140 105"/>
        </g>
        <g stroke="#967B48" stroke-width="1.5" fill="none">
          <path d="M0 25 L35 55 L70 25 L105 55 L140 25"/>
          <path d="M0 55 L35 85 L70 55 L105 85 L140 55"/>
          <path d="M0 85 L35 115 L70 85 L105 115 L140 85"/>
          <path d="M0 115 L35 145 L70 115 L105 145 L140 115"/>
        </g>
      </svg>
    `),
    tileable: true,
    tags: ['chevron', 'zigzag', 'gold', 'champagne', 'jacquard'],
    metadata: {
      weave: 'Chevron Ribbed Jacquard',
      scale: 'bold',
      sheen: 'Subtle Luster',
      weight: 'Heavyweight Drapery',
      composition: 'Metallic Lurex & Chenille',
    },
    color_hex: '#2b2925',
  },
  {
    id: 'fab-metallic-gold-satin',
    name: 'Lustrous Antique Brass Satin',
    category: 'Silk',
    image_url: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120">
        <defs>
          <linearGradient id="satinGleam" x1="0%" y1="0%" x2="100%" y2="50%">
            <stop offset="0%" stop-color="#B89748"/>
            <stop offset="25%" stop-color="#F5E4AA"/>
            <stop offset="50%" stop-color="#C6A554"/>
            <stop offset="75%" stop-color="#FFF2CE"/>
            <stop offset="100%" stop-color="#9C7D33"/>
          </linearGradient>
        </defs>
        <rect width="120" height="120" fill="url(#satinGleam)"/>
        <g stroke="#FFFFFF" stroke-width="0.8" opacity="0.35">
          <line x1="0" y1="20" x2="120" y2="20"/>
          <line x1="0" y1="40" x2="120" y2="40"/>
          <line x1="0" y1="60" x2="120" y2="60"/>
          <line x1="0" y1="80" x2="120" y2="80"/>
          <line x1="0" y1="100" x2="120" y2="100"/>
        </g>
      </svg>
    `),
    tileable: true,
    tags: ['satin', 'metallic', 'brass', 'gold', 'ribbon', 'accent-band'],
    metadata: {
      weave: 'High-Density Satin Weave',
      scale: 'fine',
      sheen: 'High Sheen',
      weight: 'Medium',
      composition: 'Silk & Spun Metallic Filament',
    },
    color_hex: '#d4b35e',
  },
  {
    id: 'fab-greek-key-trim',
    name: 'Athenian Greek Key Embroidered Ribbon',
    category: 'Geometric',
    image_url: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120">
        <rect width="120" height="120" fill="#24272D"/>
        <!-- Gold framing borders -->
        <rect x="0" y="10" width="120" height="4" fill="#D6B778"/>
        <rect x="0" y="106" width="120" height="4" fill="#D6B778"/>
        <!-- Greek key fretwork -->
        <g stroke="#E8D4A2" stroke-width="4.5" fill="none" stroke-linecap="square">
          <path d="M10 95 L10 25 L40 25 L40 95 L25 95 L25 50 L35 50 L35 70"/>
          <path d="M50 95 L50 25 L80 25 L80 95 L65 95 L65 50 L75 50 L75 70"/>
          <path d="M90 95 L90 25 L120 25 L120 95 L105 95 L105 50 L115 50 L115 70"/>
        </g>
      </svg>
    `),
    tileable: true,
    tags: ['greek-key', 'fretwork', 'ribbon', 'embroidered', 'frame-border'],
    metadata: {
      weave: 'Raised Relief Embroidery',
      scale: 'medium',
      sheen: 'Subtle Luster',
      weight: 'Medium',
      composition: 'Linen Ribbon with Mercerized Cotton Embroidery',
    },
    color_hex: '#d1ba86',
  },
  {
    id: 'fab-persian-tapestry',
    name: 'Isfahan Botanical Silk Tapestry',
    category: 'Jacquard & Damask',
    image_url: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="140" height="140">
        <rect width="140" height="140" fill="#F4EDE2"/>
        <rect x="4" y="4" width="132" height="132" fill="none" stroke="#B34A2E" stroke-width="2"/>
        <!-- Central floral vase motif -->
        <g fill="#D49E35">
          <path d="M70 85 C55 85, 52 110, 70 115 C88 110, 85 85, 70 85 Z"/>
        </g>
        <g fill="#B34A2E">
          <circle cx="70" cy="50" r="18"/>
          <circle cx="45" cy="65" r="10"/>
          <circle cx="95" cy="65" r="10"/>
        </g>
        <g fill="#5A7552">
          <ellipse cx="50" cy="40" rx="14" ry="7" transform="rotate(-30 50 40)"/>
          <ellipse cx="90" cy="40" rx="14" ry="7" transform="rotate(30 90 40)"/>
          <ellipse cx="70" cy="24" rx="8" ry="14"/>
        </g>
        <circle cx="70" cy="50" r="6" fill="#263D5C"/>
      </svg>
    `),
    tileable: true,
    tags: ['persian', 'tapestry', 'botanical', 'embroidered', 'vertical-border'],
    metadata: {
      weave: 'Crewelwork Silk Embroidery',
      scale: 'bold',
      sheen: 'Subtle Luster',
      weight: 'Heavyweight Drapery',
      composition: '100% Belgian Flax with Spun Silk Needlework',
    },
    color_hex: '#b34a2e',
  },
  {
    id: 'fab-terracotta-rust-velvet',
    name: 'Sienna Terracotta Velvet',
    category: 'Velvet',
    image_url: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="130" height="130">
        <defs>
          <linearGradient id="terraGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#AD4214"/>
            <stop offset="40%" stop-color="#C65A26"/>
            <stop offset="70%" stop-color="#B84D1A"/>
            <stop offset="100%" stop-color="#8A310A"/>
          </linearGradient>
        </defs>
        <rect width="130" height="130" fill="url(#terraGrad)"/>
        <g stroke="#E87D4A" stroke-width="0.8" opacity="0.3">
          <line x1="0" y1="25" x2="130" y2="25"/>
          <line x1="0" y1="65" x2="130" y2="65"/>
          <line x1="0" y1="105" x2="130" y2="105"/>
        </g>
      </svg>
    `),
    tileable: true,
    tags: ['velvet', 'terracotta', 'rust', 'warm', 'color-block'],
    metadata: {
      weave: 'Dense Cotton Pile',
      scale: 'fine',
      sheen: 'Subtle Luster',
      weight: 'Heavyweight Drapery',
      composition: 'Cotton & Rayon Velvet',
    },
    color_hex: '#c25d23',
  },
  {
    id: 'fab-royal-midnight-velvet',
    name: 'Royal Midnight Navy Velvet',
    category: 'Velvet',
    image_url: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="130" height="130">
        <defs>
          <linearGradient id="midGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#0E1724"/>
            <stop offset="50%" stop-color="#1B2B44"/>
            <stop offset="100%" stop-color="#09101A"/>
          </linearGradient>
        </defs>
        <rect width="130" height="130" fill="url(#midGrad)"/>
        <g stroke="#3B557D" stroke-width="0.8" opacity="0.35">
          <line x1="0" y1="30" x2="130" y2="30"/>
          <line x1="0" y1="70" x2="130" y2="70"/>
          <line x1="0" y1="110" x2="130" y2="110"/>
        </g>
      </svg>
    `),
    tileable: true,
    tags: ['velvet', 'navy', 'midnight', 'plush', 'color-block'],
    metadata: {
      weave: 'Lustrous Crushed Pile',
      scale: 'fine',
      sheen: 'Subtle Luster',
      weight: 'Heavyweight Drapery',
      composition: '100% Cotton Royale Velvet',
    },
    color_hex: '#1a2942',
  },
  {
    id: 'fab-camel-cashmere',
    name: 'Sahara Camel Twill Cashmere',
    category: 'Textured & Bouclé',
    image_url: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120">
        <rect width="120" height="120" fill="#CBB28A"/>
        <g stroke="#B89B70" stroke-width="1.2" opacity="0.6">
          <line x1="-30" y1="0" x2="90" y2="120"/>
          <line x1="0" y1="0" x2="120" y2="120"/>
          <line x1="30" y1="0" x2="150" y2="120"/>
          <line x1="60" y1="0" x2="180" y2="120"/>
        </g>
      </svg>
    `),
    tileable: true,
    tags: ['camel', 'tan', 'cashmere', 'twill', 'header'],
    metadata: {
      weave: 'Fine Twill Cashmere Weave',
      scale: 'fine',
      sheen: 'Matte',
      weight: 'Medium',
      composition: 'Wool & Cashmere Blend',
    },
    color_hex: '#cbb28a',
  },
  {
    id: 'fab-cream-boucle',
    name: 'Alpaca Ivory Looped Bouclé',
    category: 'Textured & Bouclé',
    image_url: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120">
        <rect width="120" height="120" fill="#F5F2EB"/>
        <g stroke="#D4CDBC" stroke-width="2" fill="none" opacity="0.75">
          <circle cx="20" cy="20" r="5"/>
          <circle cx="50" cy="25" r="4.5"/>
          <circle cx="85" cy="18" r="5.5"/>
          <circle cx="30" cy="55" r="5"/>
          <circle cx="65" cy="60" r="6"/>
          <circle cx="100" cy="50" r="4.5"/>
          <circle cx="25" cy="95" r="5.5"/>
          <circle cx="60" cy="90" r="4.5"/>
          <circle cx="95" cy="100" r="5"/>
        </g>
      </svg>
    `),
    tileable: true,
    tags: ['boucle', 'cream', 'ivory', 'tactile', 'main-body'],
    metadata: {
      weave: 'Looped Wool Bouclé',
      scale: 'medium',
      sheen: 'Matte',
      weight: 'Heavyweight Drapery',
      composition: 'Alpaca, Wool & Cotton Blend',
    },
    color_hex: '#f5f2eb',
  },
  {
    id: 'fab-mustard-ochre-velvet',
    name: 'Antique Ochre Velvet',
    category: 'Velvet',
    image_url: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120">
        <defs>
          <linearGradient id="ochreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#9E781C"/>
            <stop offset="45%" stop-color="#BF952D"/>
            <stop offset="100%" stop-color="#785A10"/>
          </linearGradient>
        </defs>
        <rect width="120" height="120" fill="url(#ochreGrad)"/>
        <g stroke="#E8C366" stroke-width="0.8" opacity="0.3">
          <line x1="0" y1="24" x2="120" y2="24"/>
          <line x1="0" y1="64" x2="120" y2="64"/>
          <line x1="0" y1="104" x2="120" y2="104"/>
        </g>
      </svg>
    `),
    tileable: true,
    tags: ['velvet', 'ochre', 'mustard', 'gold', 'frame-border'],
    metadata: {
      weave: 'Silk Lustre Pile',
      scale: 'fine',
      sheen: 'Subtle Luster',
      weight: 'Heavyweight Drapery',
      composition: '100% Cotton Velvet',
    },
    color_hex: '#a88428',
  },
];

// Curated Curtain Templates matching Section 2 of Specification & User Photo Designs
export const DEFAULT_TEMPLATES: CurtainTemplate[] = [
  // 1. Inspired by Screenshot 1: The Chevron & Ribbon Trim Drape
  {
    id: 'tpl-chevron-accent-band',
    name: 'Chevron & Cream Drape with Ribbon Stencil',
    style_code: 'AATMI-CHV-01',
    tagline: 'Dual Drapery Pairing Full Chevron Panel with Inset Ribbon Band',
    description: 'Authentic designer drapery as photographed: A dramatic left drape in black & gold chevron weave, paired with a right cream drape highlighted by a mid-height chevron accent band framed by metallic gold ribbon trims.',
    original_image_url: '/templates/tpl-ivory-chevron-band.png',
    plate_id: 'plate-chevron-accent',
    stencil_preset: 'chevron_accent',
    structure_maps: {},
    metadata: {
      created_at: '2026-03-05T00:00:00Z',
      source: 'catalog',
      tags: ['chevron', 'accent-band', 'ribbon-trim', 'cream', 'haute-couture'],
      pinch_style: 'Pinch Pleat',
    },
    regions: [
      {
        id: 'reg-chv-left-panel',
        name: 'left_full_chevron',
        display_name: 'Stencil 1 — Left Chevron Drapery',
        description: 'Full height left drapery panel featuring bold woven chevron pattern.',
        location: 'Left panel (5% to 47% width)',
        order: 1,
        stencil_type: 'color_block',
        suggested_sam_prompt: 'left full height black and gold chevron drapery panel',
        default_fabric_id: 'fab-chevron-jacquard',
        default_color: '#2B2925',
        accent_color: '#D97706',
        polygon_coords: [
          { x: 5, y: 0 }, { x: 47, y: 0 }, { x: 47, y: 100 }, { x: 5, y: 100 }
        ],
      },
      {
        id: 'reg-chv-right-main',
        name: 'right_cream_body',
        display_name: 'Stencil 2 — Right Cream Upper Body',
        description: 'Upper cream bouclé drape body extending down to the upper ribbon trim.',
        location: 'Right drape upper body (47% to 96% width, 0% to 22% height)',
        order: 2,
        stencil_type: 'color_block',
        suggested_sam_prompt: 'cream white textured bouclé curtain drapery body',
        default_fabric_id: 'fab-cream-boucle',
        default_color: '#F5F2EB',
        accent_color: '#D4AF37',
        polygon_coords: [
          { x: 47, y: 0 }, { x: 96, y: 0 }, { x: 96, y: 22 }, { x: 47, y: 22 }
        ],
      },
      {
        id: 'reg-chv-ribbon-trims',
        name: 'gold_ribbon_trims',
        display_name: 'Stencil 3 — Upper Metallic Ribbon Trim',
        description: 'Upper metallic gold satin ribbon framing the chevron accent band.',
        location: 'Upper border (47% to 96% width, 22% to 25.2% height)',
        order: 3,
        stencil_type: 'horizontal_band',
        suggested_sam_prompt: 'metallic gold satin ribbon trims',
        default_fabric_id: 'fab-metallic-gold-satin',
        default_color: '#D4B35E',
        accent_color: '#EAB308',
        polygon_coords: [
          { x: 47, y: 22 }, { x: 96, y: 22 }, { x: 96, y: 25.2 }, { x: 47, y: 25.2 }
        ],
      },
      {
        id: 'reg-chv-accent-band',
        name: 'horizontal_chevron_band',
        display_name: 'Stencil 4 — Inset Chevron Accent Band',
        description: 'Mid-height horizontal band repeating the left panel chevron jacquard.',
        location: 'Right drape center band (47% to 96% width, 25.2% to 34.8% height)',
        order: 4,
        stencil_type: 'horizontal_band',
        suggested_sam_prompt: 'horizontal chevron jacquard decorative band',
        default_fabric_id: 'fab-chevron-jacquard',
        default_color: '#2B2925',
        accent_color: '#D97706',
        polygon_coords: [
          { x: 47, y: 25.2 }, { x: 96, y: 25.2 }, { x: 96, y: 34.8 }, { x: 47, y: 34.8 }
        ],
      },
      {
        id: 'reg-chv-ribbon-lower',
        name: 'gold_ribbon_lower',
        display_name: 'Stencil 5 — Lower Metallic Ribbon Trim',
        description: 'Lower metallic gold satin ribbon framing below the chevron band.',
        location: 'Lower border (47% to 96% width, 34.8% to 38% height)',
        order: 5,
        stencil_type: 'horizontal_band',
        suggested_sam_prompt: 'lower metallic gold satin ribbon trim',
        default_fabric_id: 'fab-metallic-gold-satin',
        default_color: '#D4B35E',
        accent_color: '#EAB308',
        polygon_coords: [
          { x: 47, y: 34.8 }, { x: 96, y: 34.8 }, { x: 96, y: 38 }, { x: 47, y: 38 }
        ],
      },
      {
        id: 'reg-chv-right-skirt',
        name: 'right_cream_skirt',
        display_name: 'Stencil 6 — Right Lower Skirt',
        description: 'Lower cream bouclé drape falling continuously to the floor.',
        location: 'Right drape lower body (47% to 96% width, 38% to 100% height)',
        order: 6,
        stencil_type: 'color_block',
        suggested_sam_prompt: 'lower cream white drapery skirt',
        default_fabric_id: 'fab-cream-boucle',
        default_color: '#F5F2EB',
        accent_color: '#059669',
        polygon_coords: [
          { x: 47, y: 38 }, { x: 96, y: 38 }, { x: 96, y: 100 }, { x: 47, y: 100 }
        ],
      },
    ],
  },

  // 2. Inspired by Screenshot 2: Modern Color-Block Trio Drape
  {
    id: 'tpl-colorblock-trio',
    name: 'Modern Color-Block Trio Drape',
    style_code: 'AATMI-CBT-02',
    tagline: 'Architectural Window Framing with Inverted 3-Tone Color Blocks',
    description: 'Crisp contemporary interior setting: Twin pinch-pleat drapes featuring asymmetric color-blocking with warm champagne linen, terracotta rust accent stripes, and midnight navy velvet pooling on hardwood floors.',
    original_image_url: '/templates/tpl-colorblock-navy-camel.png',
    plate_id: 'plate-colorblock-trio',
    stencil_preset: 'color_block_trio',
    structure_maps: {},
    metadata: {
      created_at: '2026-03-05T00:00:00Z',
      source: 'catalog',
      tags: ['color-block', 'modern', 'terracotta', 'navy', 'champagne', 'window-pair'],
      pinch_style: 'Pinch Pleat',
    },
    regions: [
      {
        id: 'reg-cbt-left-top',
        name: 'left_champagne_header',
        display_name: 'Stencil 1 — Left Champagne Body (Upper 65%)',
        description: 'Upper 65% of left curtain in soft champagne tan drape.',
        location: 'Left curtain upper section (8% to 40% width, 8.5% to 65% height)',
        order: 1,
        stencil_type: 'color_block',
        suggested_sam_prompt: 'left curtain upper champagne tan drapery',
        default_fabric_id: 'fab-belgian-oatmeal',
        default_color: '#D9CEBF',
        accent_color: '#D97706',
        polygon_coords: [
          { x: 8, y: 8.5 }, { x: 40, y: 8.5 }, { x: 40, y: 65 }, { x: 8, y: 65 }
        ],
      },
      {
        id: 'reg-cbt-left-stripe',
        name: 'left_terracotta_stripe',
        display_name: 'Stencil 2 — Left Terracotta Stripe (Mid 10%)',
        description: 'Vibrant terracotta accent stripe separating upper tan from lower navy.',
        location: 'Left curtain mid stripe (65% to 75% height)',
        order: 2,
        stencil_type: 'horizontal_band',
        suggested_sam_prompt: 'terracotta rust horizontal accent stripe',
        default_fabric_id: 'fab-terracotta-rust-velvet',
        default_color: '#C25D23',
        accent_color: '#EA580C',
        polygon_coords: [
          { x: 8, y: 65 }, { x: 40, y: 65 }, { x: 40, y: 75 }, { x: 8, y: 75 }
        ],
      },
      {
        id: 'reg-cbt-left-bottom',
        name: 'left_navy_base',
        display_name: 'Stencil 3 — Left Midnight Navy Base (Lower 25%)',
        description: 'Heavy midnight navy velvet pooling on hardwood floor.',
        location: 'Left curtain lower section (75% to 96% height)',
        order: 3,
        stencil_type: 'color_block',
        suggested_sam_prompt: 'midnight navy blue curtain base block',
        default_fabric_id: 'fab-royal-midnight-velvet',
        default_color: '#1A2942',
        accent_color: '#2563EB',
        polygon_coords: [
          { x: 8, y: 75 }, { x: 40, y: 75 }, { x: 40, y: 96 }, { x: 8, y: 96 }
        ],
      },
      {
        id: 'reg-cbt-right-top',
        name: 'right_navy_header',
        display_name: 'Stencil 4 — Right Midnight Navy Header (Upper 25%)',
        description: 'Inverted top block in deep midnight navy velvet.',
        location: 'Right curtain header (60% to 92% width, 8.5% to 30% height)',
        order: 4,
        stencil_type: 'color_block',
        suggested_sam_prompt: 'right curtain midnight navy velvet header',
        default_fabric_id: 'fab-royal-midnight-velvet',
        default_color: '#1A2942',
        accent_color: '#2563EB',
        polygon_coords: [
          { x: 60, y: 8.5 }, { x: 92, y: 8.5 }, { x: 92, y: 30 }, { x: 60, y: 30 }
        ],
      },
      {
        id: 'reg-cbt-right-stripe',
        name: 'right_terracotta_stripe',
        display_name: 'Stencil 5 — Right Terracotta Stripe (Mid 10%)',
        description: 'Terracotta horizontal stripe matching left drape.',
        location: 'Right curtain mid stripe (30% to 40% height)',
        order: 5,
        stencil_type: 'horizontal_band',
        suggested_sam_prompt: 'terracotta rust horizontal accent stripe',
        default_fabric_id: 'fab-terracotta-rust-velvet',
        default_color: '#C25D23',
        accent_color: '#EA580C',
        polygon_coords: [
          { x: 60, y: 30 }, { x: 92, y: 30 }, { x: 92, y: 40 }, { x: 60, y: 40 }
        ],
      },
      {
        id: 'reg-cbt-right-bottom',
        name: 'right_champagne_puddle',
        display_name: 'Stencil 6 — Right Champagne Skirt (Lower 60%)',
        description: 'Expansive champagne linen drape puddling luxuriously on the floor.',
        location: 'Right curtain lower section (40% to 98% height)',
        order: 6,
        stencil_type: 'color_block',
        suggested_sam_prompt: 'champagne linen drape puddling on floor',
        default_fabric_id: 'fab-belgian-oatmeal',
        default_color: '#D9CEBF',
        accent_color: '#D97706',
        polygon_coords: [
          { x: 60, y: 40 }, { x: 92, y: 40 }, { x: 92, y: 98 }, { x: 60, y: 98 }
        ],
      },
    ],
  },

  // 3. Inspired by Screenshot 3: Haute Couture Velvet & Houndstooth
  {
    id: 'tpl-velvet-houndstooth',
    name: 'Haute Couture Velvet & Houndstooth Drape',
    style_code: 'AATMI-VHT-03',
    tagline: 'Deep Midnight Velvet Header with Brass Satin Trim & Houndstooth Skirt',
    description: 'Opulent salon drapery: Upper 50% in deep lustrous charcoal velvet, divided by a gleaming mirror-finish brass satin horizontal band, and falling into a tailored black & white houndstooth pleated skirt.',
    original_image_url: '/templates/tpl-velvet-houndstooth.png',
    plate_id: 'plate-velvet-houndstooth',
    stencil_preset: 'velvet_houndstooth',
    structure_maps: {},
    metadata: {
      created_at: '2026-03-05T00:00:00Z',
      source: 'catalog',
      tags: ['houndstooth', 'velvet', 'brass-satin', 'haute-couture', 'glamour'],
      pinch_style: 'Pinch Pleat',
    },
    regions: [
      {
        id: 'reg-vh-top-velvet',
        name: 'velvet_upper_header',
        display_name: 'Stencil 1 — Top Velvet Header (Upper 50%)',
        description: 'Lustrous charcoal/black velvet with deep columnar drapery pleats.',
        location: 'Upper half drape (8% to 80% width, 0% to 50% height)',
        order: 1,
        stencil_type: 'color_block',
        suggested_sam_prompt: 'top dark lustrous velvet curtain drapery header',
        default_fabric_id: 'fab-charcoal-slate',
        default_color: '#1E2024',
        accent_color: '#D4AF37',
        polygon_coords: [
          { x: 8, y: 0 }, { x: 80, y: 0 }, { x: 80, y: 50 }, { x: 8, y: 50 }
        ],
      },
      {
        id: 'reg-vh-mid-brass',
        name: 'metallic_brass_band',
        display_name: 'Stencil 2 — Brass Satin Transition Band (8% Height)',
        description: 'Gleaming horizontal metallic brass/gold satin ribbon divider.',
        location: 'Horizontal transition band (50% to 57.5% height)',
        order: 2,
        stencil_type: 'horizontal_band',
        suggested_sam_prompt: 'metallic gold brass satin horizontal accent band',
        default_fabric_id: 'fab-metallic-gold-satin',
        default_color: '#D4B35E',
        accent_color: '#EAB308',
        polygon_coords: [
          { x: 8, y: 50 }, { x: 80, y: 50 }, { x: 80, y: 57.5 }, { x: 8, y: 57.5 }
        ],
      },
      {
        id: 'reg-vh-skirt-houndstooth',
        name: 'houndstooth_skirt',
        display_name: 'Stencil 3 — Houndstooth Drapery Skirt (Lower 42.5%)',
        description: 'Tailored black & white woven houndstooth skirt pooling on dark walnut floor.',
        location: 'Lower drapery skirt (57.5% to 96% height)',
        order: 3,
        stencil_type: 'color_block',
        suggested_sam_prompt: 'black and white houndstooth wool drapery skirt',
        default_fabric_id: 'fab-classic-houndstooth',
        default_color: '#181A1D',
        accent_color: '#D97706',
        polygon_coords: [
          { x: 8, y: 57.5 }, { x: 80, y: 57.5 }, { x: 80, y: 96 }, { x: 8, y: 96 }
        ],
      },
    ],
  },

  // 4. Inspired by Screenshot 4: Ivory Velvet Greek Key Frame Border
  {
    id: 'tpl-greek-key-frame',
    name: 'Ivory Velvet Greek Key Frame Border',
    style_code: 'AATMI-GKF-04',
    tagline: 'Mitered L-Shape Frame Border with Embroidered Greek Key Ribbon',
    description: 'Bespoke architectural drapery: Soft ivory cream velvet center field framed by an embroidered Greek key fretwork ribbon and an outer mustard gold velvet perimeter border.',
    original_image_url: '/templates/tpl-ivory-gold-border.png',
    plate_id: 'plate-greek-key-frame',
    stencil_preset: 'greek_key_frame',
    structure_maps: {},
    metadata: {
      created_at: '2026-03-05T00:00:00Z',
      source: 'catalog',
      tags: ['greek-key', 'frame-border', 'mitered', 'ochre', 'ivory-velvet'],
      pinch_style: 'Tailored Wave',
    },
    regions: [
      {
        id: 'reg-gkf-center-velvet',
        name: 'center_ivory_field',
        display_name: 'Stencil 1 — Center Ivory Velvet Field',
        description: 'Soft off-white ivory cream velvet center drapery field.',
        location: 'Center body inside border frame (5% to 75% width, 0% to 75% height)',
        order: 1,
        stencil_type: 'color_block',
        suggested_sam_prompt: 'ivory cream soft velvet main curtain drapery body',
        default_fabric_id: 'fab-cream-boucle',
        default_color: '#F2ECE1',
        accent_color: '#D4AF37',
        polygon_coords: [
          { x: 5, y: 0 }, { x: 74, y: 0 }, { x: 74, y: 74 }, { x: 5, y: 74 }
        ],
      },
      {
        id: 'reg-gkf-greek-key-trim',
        name: 'greek_key_ribbon',
        display_name: 'Stencil 2 — Greek Key Embroidered Ribbon (L-Shape)',
        description: 'Embroidered geometric Greek key ribbon running along bottom and right edge.',
        location: 'Inner border framing center field (74% to 82% width & 74% to 82% height)',
        order: 2,
        stencil_type: 'frame_border',
        suggested_sam_prompt: 'embroidered greek key geometric ribbon border',
        default_fabric_id: 'fab-greek-key-trim',
        default_color: '#D1BA86',
        accent_color: '#D97706',
        polygon_coords: [
          { x: 5, y: 74 }, { x: 82, y: 74 }, { x: 82, y: 0 },
          { x: 74, y: 0 }, { x: 74, y: 82 }, { x: 5, y: 82 }
        ],
      },
      {
        id: 'reg-gkf-outer-gold-frame',
        name: 'outer_gold_border',
        display_name: 'Stencil 3 — Outer Mustard Gold Velvet Frame & Hem',
        description: 'Wide tailored mustard gold / ochre velvet border framing outer edge and bottom hem.',
        location: 'Outer perimeter border (82% to 95% width & 82% to 96% height)',
        order: 3,
        stencil_type: 'frame_border',
        suggested_sam_prompt: 'mustard gold ochre velvet outer frame and bottom hem',
        default_fabric_id: 'fab-mustard-ochre-velvet',
        default_color: '#A88428',
        accent_color: '#EAB308',
        polygon_coords: [
          { x: 5, y: 82 }, { x: 95, y: 82 }, { x: 95, y: 0 },
          { x: 82, y: 0 }, { x: 82, y: 96 }, { x: 5, y: 96 }
        ],
      },
    ],
  },

  // 5. Inspired by Screenshot 5: Camel & Midnight Two-Tone Drape with Tassel
  {
    id: 'tpl-twotone-camel-black',
    name: 'Camel & Midnight Two-Tone Pleat with Tieback',
    style_code: 'AATMI-CMB-05',
    tagline: 'Tailored 2-Tone Horizontal Split with Sheer Voile Background',
    description: 'Classic grand drapery: Upper 25% pleated header in camel tan twill, flowing into a heavy midnight charcoal blackout drape gathered with an antique gold tassel rope tieback.',
    original_image_url: '/templates/tpl-camel-black-duo.png',
    plate_id: 'plate-twotone-camel-black',
    stencil_preset: 'camel_midnight_header',
    structure_maps: {},
    metadata: {
      created_at: '2026-03-05T00:00:00Z',
      source: 'catalog',
      tags: ['two-tone', 'camel', 'midnight', 'tieback', 'tassel', 'classic'],
      pinch_style: 'Pinch Pleat',
    },
    regions: [
      {
        id: 'reg-cb-header',
        name: 'camel_tan_header',
        display_name: 'Stencil 1 — Camel Tan Pleated Header (Upper 25%)',
        description: 'Upper 25% header panel with uniform pinch pleats and brass ring hardware.',
        location: 'Top header section (4.5% to 29% height)',
        order: 1,
        stencil_type: 'color_block',
        suggested_sam_prompt: 'camel sand beige twill pleated curtain header',
        default_fabric_id: 'fab-camel-cashmere',
        default_color: '#CBB28A',
        accent_color: '#D97706',
        polygon_coords: [
          { x: 6, y: 4.5 }, { x: 94, y: 4.5 }, { x: 94, y: 29 }, { x: 6, y: 29 }
        ],
      },
      {
        id: 'reg-cb-body',
        name: 'midnight_black_body',
        display_name: 'Stencil 2 — Midnight Black Velvet Gathered Drape (Lower 75%)',
        description: 'Lower 75% heavy drapery body gathered gracefully to the left with gold tassel tieback.',
        location: 'Lower drapery body (29% to 95% height)',
        order: 2,
        stencil_type: 'color_block',
        suggested_sam_prompt: 'midnight black charcoal velvet drapery gathered with tieback',
        default_fabric_id: 'fab-charcoal-slate',
        default_color: '#1D2126',
        accent_color: '#D4AF37',
        polygon_coords: [
          { x: 6, y: 29 }, { x: 94, y: 29 }, { x: 94, y: 95 }, { x: 6, y: 95 }
        ],
      },
    ],
  },

  // 6. Inspired by Screenshot 6: High-Ceiling Linen with Persian Tapestry Edge
  {
    id: 'tpl-persian-tapestry',
    name: 'High-Ceiling Linen with Persian Tapestry Stencil',
    style_code: 'AATMI-PTE-06',
    tagline: 'Grand Natural Flax Linen Drape with Vertical Persian Tapestry Stencil',
    description: 'High-ceiling architectural salon: Natural Belgian oatmeal linen drapery accented by an exquisite multi-color Persian floral arabesque embroidered tapestry along the leading edge.',
    original_image_url: '/templates/tpl-linen-embroidery-border.png',
    plate_id: 'plate-persian-tapestry',
    stencil_preset: 'persian_tapestry',
    structure_maps: {},
    metadata: {
      created_at: '2026-03-05T00:00:00Z',
      source: 'catalog',
      tags: ['linen', 'persian', 'tapestry', 'embroidered', 'vertical-stencil', 'high-ceiling'],
      pinch_style: 'Pinch Pleat',
    },
    regions: [
      {
        id: 'reg-pt-left-linen',
        name: 'left_oatmeal_linen',
        display_name: 'Stencil 1 — Left Natural Oatmeal Linen Body',
        description: 'Full-height organic Belgian linen with soft, relaxed vertical drape folds on left curtain.',
        location: 'Left drape panel (5% to 33% width, 0% to 100% height)',
        order: 1,
        stencil_type: 'color_block',
        suggested_sam_prompt: 'natural oatmeal belgian linen curtain drapery body',
        default_fabric_id: 'fab-belgian-oatmeal',
        default_color: '#E5DEC9',
        accent_color: '#D4AF37',
        polygon_coords: [
          { x: 5, y: 0 }, { x: 33, y: 0 }, { x: 33, y: 100 }, { x: 5, y: 100 }
        ],
      },
      {
        id: 'reg-pt-left-tapestry',
        name: 'left_persian_tapestry_edge',
        display_name: 'Stencil 2 — Left Leading Edge Persian Tapestry',
        description: 'Exquisite botanical embroidered tapestry ribbon running full-height down the leading edge of left drape.',
        location: 'Left vertical border strip (33% to 45% width, 0% to 100% height)',
        order: 2,
        stencil_type: 'vertical_border',
        suggested_sam_prompt: 'persian botanical floral arabesque embroidered tapestry border trim',
        default_fabric_id: 'fab-persian-tapestry',
        default_color: '#B34A2E',
        accent_color: '#D97706',
        polygon_coords: [
          { x: 33, y: 0 }, { x: 45, y: 0 }, { x: 45, y: 100 }, { x: 33, y: 100 }
        ],
      },
      {
        id: 'reg-pt-right-tapestry',
        name: 'right_persian_tapestry_edge',
        display_name: 'Stencil 3 — Right Leading Edge Persian Tapestry',
        description: 'Matching botanical embroidered tapestry ribbon running down the leading edge of right drape.',
        location: 'Right vertical border strip (55% to 67% width, 0% to 100% height)',
        order: 3,
        stencil_type: 'vertical_border',
        suggested_sam_prompt: 'persian botanical floral arabesque embroidered tapestry border trim',
        default_fabric_id: 'fab-persian-tapestry',
        default_color: '#B34A2E',
        accent_color: '#D97706',
        polygon_coords: [
          { x: 55, y: 0 }, { x: 67, y: 0 }, { x: 67, y: 100 }, { x: 55, y: 100 }
        ],
      },
      {
        id: 'reg-pt-right-linen',
        name: 'right_oatmeal_linen',
        display_name: 'Stencil 4 — Right Natural Oatmeal Linen Body',
        description: 'Full-height organic Belgian linen body on right curtain.',
        location: 'Right drape panel (67% to 95% width, 0% to 100% height)',
        order: 4,
        stencil_type: 'color_block',
        suggested_sam_prompt: 'natural oatmeal belgian linen curtain drapery body',
        default_fabric_id: 'fab-belgian-oatmeal',
        default_color: '#E5DEC9',
        accent_color: '#D4AF37',
        polygon_coords: [
          { x: 67, y: 0 }, { x: 95, y: 0 }, { x: 95, y: 100 }, { x: 67, y: 100 }
        ],
      },
    ],
  },
  {
    id: 'tpl-granada-classic',
    name: 'Granada Style (3-Zone Tri-Band)',
    style_code: 'AATMI-GRN-03',
    tagline: 'Deep Pinch Pleats with High-Impact Mid Band & Weighted Hem',
    description: 'Based on the signature Granada design: A large vertical main panel with dramatic folds, accented by an eye-catching horizontal band and finished with a dark tailored hem border.',
    original_image_url: '/templates/tpl-linen-embroidery-border.png',
    structure_maps: {
      canny_url: 'canny_granada',
      depth_url: 'depth_granada',
    },
    metadata: {
      created_at: '2026-03-01T00:00:00Z',
      source: 'catalog',
      tags: ['granada', 'pinch-pleat', 'horizontal-band', 'three-regions', 'luxury'],
      pinch_style: 'Pinch Pleat',
    },
    regions: [
      {
        id: 'reg-grn-main',
        name: 'main_panel',
        display_name: 'Region 1 — Main Panel',
        description: 'Large vertical folds of fabric — primary changeable area with soft gravity draping.',
        location: 'Upper 72% body with pinch pleats',
        order: 1,
        suggested_sam_prompt: 'large vertical drape curtain folds light fabric body',
        default_fabric_id: 'fab-belgian-oatmeal',
        default_color: '#DDD6C7',
        accent_color: '#D4AF37',
        polygon_coords: [
          { x: 12, y: 4 },
          { x: 88, y: 4 },
          { x: 88, y: 72 },
          { x: 12, y: 72 },
        ],
      },
      {
        id: 'reg-grn-band',
        name: 'decorative_band',
        display_name: 'Region 2 — Decorative Band',
        description: 'Horizontal textured strip with top/bottom seam stitching — high visual impact focal point.',
        location: 'Middle horizontal band (72% to 84%)',
        order: 2,
        suggested_sam_prompt: 'horizontal accent band crocodile textured stripe',
        default_fabric_id: 'fab-croc-espresso',
        default_color: '#4E3B2E',
        accent_color: '#D97706',
        polygon_coords: [
          { x: 12, y: 72 },
          { x: 88, y: 72 },
          { x: 88, y: 84 },
          { x: 12, y: 84 },
        ],
      },
      {
        id: 'reg-grn-hem',
        name: 'bottom_hem',
        display_name: 'Region 3 — Bottom Hem Border',
        description: 'Solid weighted horizontal base band at the floor hem with blind stitching.',
        location: 'Base floor hem (84% to 98%)',
        order: 3,
        suggested_sam_prompt: 'solid dark floor bottom border band hem',
        default_fabric_id: 'fab-charcoal-slate',
        default_color: '#24272B',
        accent_color: '#059669',
        polygon_coords: [
          { x: 12, y: 84 },
          { x: 88, y: 84 },
          { x: 88, y: 98 },
          { x: 12, y: 98 },
        ],
      },
    ],
  },
  {
    id: 'tpl-vertical-border',
    name: 'Vertical Border Style (2-Zone Duo)',
    style_code: 'AATMI-VRT-02',
    tagline: 'Deep Continuous Folds with Architectural Leading Edge Border',
    description: 'Classic European pinch pleat drape featuring a full-height main drapery body highlighted by an elegant vertical decorative border running down the leading edge.',
    original_image_url: '/templates/tpl-ivory-chevron-band.png',
    structure_maps: {},
    metadata: {
      created_at: '2026-03-02T00:00:00Z',
      source: 'catalog',
      tags: ['vertical-border', 'pinch-pleat', 'two-regions', 'minimalist'],
      pinch_style: 'Pinch Pleat',
    },
    regions: [
      {
        id: 'reg-vrt-main',
        name: 'main_panel',
        display_name: 'Region 1 — Main Panel Body',
        description: 'Full height curtain fabric with deep pinch pleats and columnar shadows.',
        location: 'Main drape panel (12% to 70% width)',
        order: 1,
        suggested_sam_prompt: 'full height beige fabric with deep pinch pleats',
        default_fabric_id: 'fab-belgian-oatmeal',
        default_color: '#E8E2D5',
        accent_color: '#D4AF37',
        polygon_coords: [
          { x: 12, y: 4 },
          { x: 70, y: 4 },
          { x: 70, y: 98 },
          { x: 12, y: 98 },
        ],
      },
      {
        id: 'reg-vrt-border',
        name: 'vertical_border',
        display_name: 'Region 2 — Leading Edge Vertical Border',
        description: 'Narrow vertical column with repeating geometric or embroidered luxury trim.',
        location: 'Right leading edge border (70% to 88% width)',
        order: 2,
        suggested_sam_prompt: 'narrow vertical strip border geometric trim',
        default_fabric_id: 'fab-gold-damask',
        default_color: '#DFCFB2',
        accent_color: '#D97706',
        polygon_coords: [
          { x: 70, y: 4 },
          { x: 88, y: 4 },
          { x: 88, y: 98 },
          { x: 70, y: 98 },
        ],
      },
    ],
  },
  {
    id: 'tpl-double-border-hem',
    name: 'Double Border + Hem Style (4-Zone Quad)',
    style_code: 'AATMI-DBL-04',
    tagline: 'Bilateral Embroidered Borders with Connecting Weighted Bottom Band',
    description: 'High-end tailored drapery pairing dual vertical flank borders with an interconnected floor hem border framing an expansive center drape panel.',
    original_image_url: '/templates/tpl-ivory-gold-border.png',
    structure_maps: {},
    metadata: {
      created_at: '2026-03-03T00:00:00Z',
      source: 'catalog',
      tags: ['double-border', 'four-regions', 'ornate', 'symmetrical'],
      pinch_style: 'Goblet Pleat',
    },
    regions: [
      {
        id: 'reg-dbl-main',
        name: 'main_panel',
        display_name: 'Region 1 — Center Drapery Body',
        description: 'Large center fabric area showing soft fluid folds and natural ambient lighting.',
        location: 'Center body between vertical borders (26% to 74% width)',
        order: 1,
        suggested_sam_prompt: 'central main drapery fabric body',
        default_fabric_id: 'fab-rose-dupioni',
        default_color: '#E5C2BC',
        accent_color: '#D4AF37',
        polygon_coords: [
          { x: 26, y: 4 },
          { x: 74, y: 4 },
          { x: 74, y: 84 },
          { x: 26, y: 84 },
        ],
      },
      {
        id: 'reg-dbl-left-border',
        name: 'left_vertical_border',
        display_name: 'Region 2 — Left Vertical Flank',
        description: 'Left vertical frame border strip with clean edge seam.',
        location: 'Left border strip (12% to 26% width)',
        order: 2,
        suggested_sam_prompt: 'left vertical decorative border trim',
        default_fabric_id: 'fab-emerald-velvet',
        default_color: '#0F5A41',
        accent_color: '#059669',
        polygon_coords: [
          { x: 12, y: 4 },
          { x: 26, y: 4 },
          { x: 26, y: 84 },
          { x: 12, y: 84 },
        ],
      },
      {
        id: 'reg-dbl-right-border',
        name: 'right_vertical_border',
        display_name: 'Region 3 — Right Vertical Flank',
        description: 'Right vertical frame border strip symmetrical to the left flank.',
        location: 'Right border strip (74% to 88% width)',
        order: 3,
        suggested_sam_prompt: 'right vertical decorative border trim',
        default_fabric_id: 'fab-emerald-velvet',
        default_color: '#0F5A41',
        accent_color: '#2563EB',
        polygon_coords: [
          { x: 74, y: 4 },
          { x: 88, y: 4 },
          { x: 88, y: 84 },
          { x: 74, y: 84 },
        ],
      },
      {
        id: 'reg-dbl-hem',
        name: 'bottom_hem',
        display_name: 'Region 4 — Floor Hem Trim',
        description: 'Horizontal decorative band connecting the two vertical borders at the floor.',
        location: 'Bottom hem band (84% to 98% height)',
        order: 4,
        suggested_sam_prompt: 'horizontal decorative bottom hem band connecting borders',
        default_fabric_id: 'fab-gold-damask',
        default_color: '#DFCFB2',
        accent_color: '#D97706',
        polygon_coords: [
          { x: 12, y: 84 },
          { x: 88, y: 84 },
          { x: 88, y: 98 },
          { x: 12, y: 98 },
        ],
      },
    ],
  },
  {
    id: 'tpl-french-valance',
    name: 'Royal French Swag Valance (3-Zone)',
    style_code: 'AATMI-RFL-03',
    tagline: 'Scalloped Swag Header with Grand Drop Curtains and Edge Piping',
    description: 'Opulent palace-inspired drapery featuring an arched sculpted top valance swag, grand floor-length drop panels, and contrast edge piping.',
    original_image_url: '/templates/tpl-camel-black-duo.png',
    structure_maps: {},
    metadata: {
      created_at: '2026-03-04T00:00:00Z',
      source: 'catalog',
      tags: ['valance', 'royal', 'swag', 'three-regions', 'french-pleat'],
      pinch_style: 'Pinch Pleat',
    },
    regions: [
      {
        id: 'reg-fl-valance',
        name: 'top_valance',
        display_name: 'Region 1 — Top Swag Valance',
        description: 'Arched scalloped header with draped swags and top pleat headers.',
        location: 'Top header (4% to 26% height)',
        order: 1,
        suggested_sam_prompt: 'scalloped top swag valance curtain pelmet',
        default_fabric_id: 'fab-gold-damask',
        default_color: '#DFCFB2',
        accent_color: '#D97706',
        polygon_coords: [
          { x: 10, y: 4 },
          { x: 90, y: 4 },
          { x: 90, y: 26 },
          { x: 50, y: 32 },
          { x: 10, y: 26 },
        ],
      },
      {
        id: 'reg-fl-main',
        name: 'main_drops',
        display_name: 'Region 2 — Cascading Drop Drapes',
        description: 'Grand floor-sweeping fabric drops with dramatic vertical volume.',
        location: 'Main vertical drapes (26% to 98% height)',
        order: 2,
        suggested_sam_prompt: 'grand vertical drop drapery panels',
        default_fabric_id: 'fab-midnight-navy-boucle',
        default_color: '#162033',
        accent_color: '#D4AF37',
        polygon_coords: [
          { x: 12, y: 26 },
          { x: 88, y: 26 },
          { x: 88, y: 98 },
          { x: 12, y: 98 },
        ],
      },
      {
        id: 'reg-fl-tiebacks',
        name: 'edge_trim_tiebacks',
        display_name: 'Region 3 — Contrast Flange Trim',
        description: 'Outer perimeter framing flange and decorative piping cord.',
        location: 'Outer borders (8% to 12% & 88% to 92%)',
        order: 3,
        suggested_sam_prompt: 'curtain flange piping edge trim',
        default_fabric_id: 'fab-emerald-velvet',
        default_color: '#0F5A41',
        accent_color: '#059669',
        polygon_coords: [
          { x: 8, y: 4 },
          { x: 12, y: 4 },
          { x: 12, y: 98 },
          { x: 8, y: 98 },
        ],
      },
    ],
  },
];
