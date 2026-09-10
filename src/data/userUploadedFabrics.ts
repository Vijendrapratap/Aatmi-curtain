import { Fabric } from '../types/curtain';

/**
 * 13 Authentic Luxury Fabrics provided directly by the user:
 * Meticulously digitized with SVG vector patterns, thread slubs, relief embroidery,
 * and authentic weave structures matching each photographic sample.
 */
export const USER_UPLOADED_FABRICS: Fabric[] = [
  // 1. Screenshot 162330: Natural Flax Linen with Vertical Chains & Charcoal/Cream Diamond Tassels
  {
    id: 'fab-user-diamond-tassel',
    name: 'Aatmi Tribal Diamond Embroidered Linen',
    category: 'Embroidered & Textured',
    image_url: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="160" height="160">
        <defs>
          <linearGradient id="flaxGround" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#EBE5D8"/>
            <stop offset="50%" stop-color="#E2DACB"/>
            <stop offset="100%" stop-color="#DAD1C0"/>
          </linearGradient>
        </defs>
        <!-- Natural flax slub ground -->
        <rect width="160" height="160" fill="url(#flaxGround)"/>
        <g stroke="#C7BDAB" stroke-width="0.75" opacity="0.65">
          <line x1="0" y1="20" x2="160" y2="20"/>
          <line x1="0" y1="40" x2="160" y2="40"/>
          <line x1="0" y1="60" x2="160" y2="60"/>
          <line x1="0" y1="80" x2="160" y2="80"/>
          <line x1="0" y1="100" x2="160" y2="100"/>
          <line x1="0" y1="120" x2="160" y2="120"/>
          <line x1="0" y1="140" x2="160" y2="140"/>
          <line x1="20" y1="0" x2="20" y2="160"/>
          <line x1="60" y1="0" x2="60" y2="160"/>
          <line x1="100" y1="0" x2="100" y2="160"/>
          <line x1="140" y1="0" x2="140" y2="160"/>
        </g>
        <!-- Vertical Stitched Chain Cords -->
        <line x1="40" y1="0" x2="40" y2="160" stroke="#33373B" stroke-width="2.5" stroke-dasharray="6,4"/>
        <line x1="120" y1="0" x2="120" y2="160" stroke="#33373B" stroke-width="2.5" stroke-dasharray="6,4"/>
        <!-- Embroidered Charcoal & Cream Diamond Tufted Tassels -->
        <!-- Diamond 1 at (40, 45) -->
        <polygon points="40,25 56,45 40,65 24,45" fill="#242628"/>
        <polygon points="40,32 50,45 40,58 30,45" fill="#FAF8F3"/>
        <circle cx="40" cy="45" r="3.5" fill="#242628"/>
        <!-- Tufted tassel fringes -->
        <path d="M40 65 L32 80 M40 65 L40 82 M40 65 L48 80" stroke="#242628" stroke-width="1.8"/>
        <!-- Diamond 2 at (40, 125) -->
        <polygon points="40,105 56,125 40,145 24,125" fill="#242628"/>
        <polygon points="40,112 50,125 40,138 30,125" fill="#FAF8F3"/>
        <circle cx="40" cy="125" r="3.5" fill="#242628"/>
        <path d="M40 145 L32 160 M40 145 L40 162 M40 145 L48 160" stroke="#242628" stroke-width="1.8"/>
        <!-- Diamond 3 at (120, 85) -->
        <polygon points="120,65 136,85 120,105 104,85" fill="#242628"/>
        <polygon points="120,72 130,85 120,98 110,85" fill="#FAF8F3"/>
        <circle cx="120" cy="85" r="3.5" fill="#242628"/>
        <path d="M120 105 L112 120 M120 105 L120 122 M120 105 L128 120" stroke="#242628" stroke-width="1.8"/>
        <!-- Diamond 4 at (120, 5) & (120, 165) wrap -->
        <polygon points="120,-15 136,5 120,25 104,5" fill="#242628"/>
        <polygon points="120,-8 130,5 120,18 110,5" fill="#FAF8F3"/>
        <circle cx="120" cy="5" r="3.5" fill="#242628"/>
        <path d="M120 25 L112 40 M120 25 L120 42 M120 25 L128 40" stroke="#242628" stroke-width="1.8"/>
      </svg>
    `),
    tileable: true,
    tags: ['embroidered', 'tribal', 'diamond', 'tassel', 'linen', 'tufted', 'flax', 'boho'],
    metadata: {
      weave: 'Raised Tufted Embroidery on Belgian Flax',
      scale: 'medium',
      sheen: 'Matte',
      weight: 'Heavyweight Drapery',
      composition: '70% Organic Flax Linen, 30% Spun Cotton Fluff',
    },
    color_hex: '#dfd8c9',
  },

  // 2. Screenshot 162137: Artisan Herringbone Chevron Twill in Ivory and Warm Oatmeal
  {
    id: 'fab-user-chevron-twill',
    name: 'Artisan Herringbone Chevron Twill',
    category: 'Geometric',
    image_url: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120">
        <defs>
          <linearGradient id="twillBg" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#EDE7DA"/>
            <stop offset="50%" stop-color="#F4EFE6"/>
            <stop offset="100%" stop-color="#E8E1D3"/>
          </linearGradient>
        </defs>
        <rect width="120" height="120" fill="url(#twillBg)"/>
        <!-- Diagonal Chevron Twill Bands -->
        <g stroke="#C8BCAB" stroke-width="4.5" fill="none" stroke-linecap="round">
          <path d="M0 15 L30 45 L60 15 L90 45 L120 15"/>
          <path d="M0 45 L30 75 L60 45 L90 75 L120 45"/>
          <path d="M0 75 L30 105 L60 75 L90 105 L120 75"/>
          <path d="M0 105 L30 135 L60 105 L90 135 L120 105"/>
        </g>
        <g stroke="#FAF7F2" stroke-width="3" fill="none">
          <path d="M0 0 L30 30 L60 0 L90 30 L120 0"/>
          <path d="M0 30 L30 60 L60 30 L90 60 L120 30"/>
          <path d="M0 60 L30 90 L60 60 L90 90 L120 60"/>
          <path d="M0 90 L30 120 L60 90 L90 120 L120 90"/>
        </g>
        <!-- Fine cross-hatch yarn texture -->
        <g stroke="#B8AC99" stroke-width="0.8" opacity="0.4">
          <line x1="0" y1="10" x2="120" y2="10"/>
          <line x1="0" y1="25" x2="120" y2="25"/>
          <line x1="0" y1="40" x2="120" y2="40"/>
          <line x1="0" y1="55" x2="120" y2="55"/>
          <line x1="0" y1="70" x2="120" y2="70"/>
          <line x1="0" y1="85" x2="120" y2="85"/>
          <line x1="0" y1="100" x2="120" y2="100"/>
          <line x1="0" y1="115" x2="120" y2="115"/>
        </g>
      </svg>
    `),
    tileable: true,
    tags: ['chevron', 'herringbone', 'twill', 'oatmeal', 'ivory', 'woven', 'neutral'],
    metadata: {
      weave: 'Dense Diagonal Herringbone Twill',
      scale: 'fine',
      sheen: 'Subtle Luster',
      weight: 'Medium-Heavy',
      composition: '100% Combed Long-Staple Cotton',
    },
    color_hex: '#e7dfd1',
  },

  // 3. Screenshot 162146: Quilted Trellis Diamond Lattice
  {
    id: 'fab-user-quilted-trellis',
    name: 'Quilted Trellis Diamond Lattice',
    category: 'Geometric',
    image_url: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="140" height="140">
        <defs>
          <radialGradient id="quiltPuff" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#FCFAF5"/>
            <stop offset="70%" stop-color="#F2ECE0"/>
            <stop offset="100%" stop-color="#E2D8C6"/>
          </radialGradient>
        </defs>
        <rect width="140" height="140" fill="#E2D8C6"/>
        <!-- Padded quilted diamond cells -->
        <polygon points="70,10 130,70 70,130 10,70" fill="url(#quiltPuff)"/>
        <polygon points="70,-60 130,0 70,60 10,0" fill="url(#quiltPuff)"/>
        <polygon points="70,80 130,140 70,200 10,140" fill="url(#quiltPuff)"/>
        <polygon points="0,10 60,70 0,130 -60,70" fill="url(#quiltPuff)"/>
        <polygon points="140,10 200,70 140,130 80,70" fill="url(#quiltPuff)"/>
        <!-- Double Stitched Diamond Lattice Borders -->
        <g stroke="#C0B29E" stroke-width="1.8" stroke-dasharray="4,2" fill="none">
          <line x1="0" y1="0" x2="140" y2="140"/>
          <line x1="0" y1="70" x2="140" y2="210"/>
          <line x1="-70" y1="0" x2="70" y2="140"/>
          <line x1="140" y1="0" x2="0" y2="140"/>
          <line x1="210" y1="0" x2="70" y2="140"/>
          <line x1="70" y1="0" x2="-70" y2="140"/>
        </g>
        <g stroke="#ECE5D8" stroke-width="1.2" stroke-dasharray="4,2" fill="none">
          <line x1="0" y1="4" x2="136" y2="140"/>
          <line x1="140" y1="4" x2="4" y2="140"/>
        </g>
      </svg>
    `),
    tileable: true,
    tags: ['trellis', 'quilted', 'diamond', 'lattice', 'architectural', 'alabaster', 'cream'],
    metadata: {
      weave: 'Quilted Diamond Trellis Relief Stitching',
      scale: 'medium',
      sheen: 'Matte',
      weight: 'Heavyweight Drapery',
      composition: 'Cotton-Linen Double Cloth with Foam Padding',
    },
    color_hex: '#f3ece0',
  },

  // 4. Screenshot 162154: Micro-Tweed Tailored Herringbone
  {
    id: 'fab-user-micro-tweed',
    name: 'Micro-Tweed Tailored Herringbone',
    category: 'Textured & Bouclé',
    image_url: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80">
        <rect width="80" height="80" fill="#E8E2D6"/>
        <!-- Fine micro chevron tweed speckles -->
        <g stroke="#B3A795" stroke-width="1.5" fill="none">
          <path d="M0 10 L10 20 L20 10 L30 20 L40 10 L50 20 L60 10 L70 20 L80 10"/>
          <path d="M0 30 L10 40 L20 30 L30 40 L40 30 L50 40 L60 30 L70 40 L80 30"/>
          <path d="M0 50 L10 60 L20 50 L30 60 L40 50 L50 60 L60 50 L70 60 L80 50"/>
          <path d="M0 70 L10 80 L20 70 L30 80 L40 70 L50 80 L60 70 L70 80 L80 70"/>
        </g>
        <g stroke="#FFFFFF" stroke-width="1.2" opacity="0.6" fill="none">
          <path d="M0 0 L10 10 L20 0 L30 10 L40 0 L50 10 L60 0 L70 10 L80 0"/>
          <path d="M0 20 L10 30 L20 20 L30 30 L40 20 L50 30 L60 20 L70 30 L80 20"/>
          <path d="M0 40 L10 50 L20 40 L30 50 L40 40 L50 50 L60 40 L70 50 L80 40"/>
          <path d="M0 60 L10 70 L20 60 L30 70 L40 60 L50 70 L60 60 L70 70 L80 60"/>
        </g>
        <!-- Flecks of charcoal wool yarn -->
        <circle cx="15" cy="18" r="0.8" fill="#5A5248"/>
        <circle cx="45" cy="35" r="0.8" fill="#5A5248"/>
        <circle cx="68" cy="58" r="0.8" fill="#5A5248"/>
        <circle cx="28" cy="72" r="0.8" fill="#5A5248"/>
      </svg>
    `),
    tileable: true,
    tags: ['tweed', 'micro-herringbone', 'tailored', 'ecru', 'stone', 'subtle', 'neutral'],
    metadata: {
      weave: 'Micro-Tweed Tailored Herringbone',
      scale: 'fine',
      sheen: 'Matte',
      weight: 'Medium',
      composition: 'Wool, Silk & Linen Blend',
    },
    color_hex: '#e2dcce',
  },

  // 5. Screenshot 162205: Eucalyptus Ikat Chevron Flame-Stitch
  {
    id: 'fab-user-eucalyptus-ikat',
    name: 'Eucalyptus Ikat Chevron Flame',
    category: 'Geometric',
    image_url: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="140" height="140">
        <defs>
          <linearGradient id="ikatBg" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#EFECE3"/>
            <stop offset="100%" stop-color="#E5E1D5"/>
          </linearGradient>
        </defs>
        <rect width="140" height="140" fill="url(#ikatBg)"/>
        <!-- Deep Sage/Teal Ikat Chevron Flame Bands -->
        <g stroke="#3B5C50" stroke-width="5" fill="none" stroke-linecap="round">
          <path d="M0 20 L35 55 L70 20 L105 55 L140 20"/>
          <path d="M0 65 L35 100 L70 65 L105 100 L140 65"/>
          <path d="M0 110 L35 145 L70 110 L105 145 L140 110"/>
        </g>
        <!-- Secondary Pine Accent Layer with feathered ikat edge -->
        <g stroke="#264137" stroke-width="3" fill="none" stroke-dasharray="8,2">
          <path d="M0 24 L35 59 L70 24 L105 59 L140 24"/>
          <path d="M0 69 L35 104 L70 69 L105 104 L140 69"/>
          <path d="M0 114 L35 149 L70 114 L105 149 L140 114"/>
        </g>
        <!-- Soft Mint Highlight Line -->
        <g stroke="#97BAA9" stroke-width="2.2" fill="none">
          <path d="M0 14 L35 49 L70 14 L105 49 L140 14"/>
          <path d="M0 59 L35 94 L70 59 L105 94 L140 59"/>
          <path d="M0 104 L35 139 L70 104 L105 139 L140 104"/>
        </g>
      </svg>
    `),
    tileable: true,
    tags: ['ikat', 'chevron', 'flame-stitch', 'eucalyptus', 'sage', 'teal', 'botanical'],
    metadata: {
      weave: 'Vertical Flame-Stitch Ikat Jacquard',
      scale: 'medium',
      sheen: 'Subtle Luster',
      weight: 'Medium-Heavy',
      composition: '55% Spun Rayon, 45% Cotton',
    },
    color_hex: '#3b5c50',
  },

  // 6. Screenshot 162210: Botanical Skeleton Leaf Voile
  {
    id: 'fab-user-skeleton-leaf',
    name: 'Botanical Skeleton Leaf Voile',
    category: 'Luxury Sheers',
    image_url: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="160" height="160">
        <defs>
          <linearGradient id="sheerMist" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#E8ECEB"/>
            <stop offset="50%" stop-color="#DEE4E3"/>
            <stop offset="100%" stop-color="#D4DCDB"/>
          </linearGradient>
        </defs>
        <rect width="160" height="160" fill="url(#sheerMist)"/>
        <!-- Gossamer sheer grid weave -->
        <g stroke="#CAD5D4" stroke-width="0.5" opacity="0.5">
          <line x1="0" y1="16" x2="160" y2="16"/>
          <line x1="0" y1="32" x2="160" y2="32"/>
          <line x1="0" y1="48" x2="160" y2="48"/>
          <line x1="0" y1="64" x2="160" y2="64"/>
          <line x1="0" y1="80" x2="160" y2="80"/>
          <line x1="0" y1="96" x2="160" y2="96"/>
          <line x1="0" y1="112" x2="160" y2="112"/>
          <line x1="0" y1="128" x2="160" y2="128"/>
          <line x1="0" y1="144" x2="160" y2="144"/>
          <line x1="16" y1="0" x2="16" y2="160"/>
          <line x1="32" y1="0" x2="32" y2="160"/>
          <line x1="48" y1="0" x2="48" y2="160"/>
          <line x1="64" y1="0" x2="64" y2="160"/>
          <line x1="80" y1="0" x2="80" y2="160"/>
          <line x1="96" y1="0" x2="96" y2="160"/>
          <line x1="112" y1="0" x2="112" y2="160"/>
          <line x1="128" y1="0" x2="128" y2="160"/>
          <line x1="144" y1="0" x2="144" y2="160"/>
        </g>
        <!-- Delicate Skeleton Leaves with Botanical Veining -->
        <!-- Leaf 1 -->
        <g transform="translate(50, 45) rotate(-25)">
          <path d="M0 -35 C18 -20, 22 20, 0 38 C-22 20, -18 -20, 0 -35 Z" fill="none" stroke="#FFFFFF" stroke-width="1.4" opacity="0.85"/>
          <line x1="0" y1="-35" x2="0" y2="42" stroke="#FFFFFF" stroke-width="1.2" opacity="0.9"/>
          <!-- Lateral veins -->
          <path d="M0 -22 L14 -12 M0 -22 L-14 -12 M0 -8 L18 2 M0 -8 L-18 2 M0 6 L18 16 M0 6 L-18 16 M0 20 L12 28 M0 20 L-12 28" stroke="#FFFFFF" stroke-width="0.8" opacity="0.75"/>
        </g>
        <!-- Leaf 2 -->
        <g transform="translate(125, 115) rotate(35)">
          <path d="M0 -30 C16 -18, 18 18, 0 32 C-18 18, -16 -18, 0 -30 Z" fill="none" stroke="#FFFFFF" stroke-width="1.3" opacity="0.85"/>
          <line x1="0" y1="-30" x2="0" y2="36" stroke="#FFFFFF" stroke-width="1.1" opacity="0.9"/>
          <path d="M0 -18 L12 -9 M0 -18 L-12 -9 M0 -6 L15 3 M0 -6 L-15 3 M0 6 L15 15 M0 6 L-15 15 M0 18 L10 24 M0 18 L-10 24" stroke="#FFFFFF" stroke-width="0.75" opacity="0.75"/>
        </g>
      </svg>
    `),
    tileable: true,
    tags: ['sheer', 'voile', 'botanical', 'skeleton-leaf', 'translucent', 'silver', 'ethereal'],
    metadata: {
      weave: 'Gossamer Voile Transparent Weave',
      scale: 'medium',
      sheen: 'Subtle Luster',
      weight: 'Light',
      composition: '100% Fine Filament Poly-Voile',
    },
    color_hex: '#e2e7e6',
  },

  // 7. Screenshot 162218: Bold Graphic Noir Chevron Chenille
  {
    id: 'fab-user-noir-chevron',
    name: 'Bold Graphic Noir Chevron',
    category: 'Geometric',
    image_url: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120">
        <rect width="120" height="120" fill="#FAF8F5"/>
        <!-- Bold Jet Black Chenille Chevrons -->
        <g stroke="#18191B" stroke-width="12" fill="none" stroke-linejoin="miter">
          <path d="M-10 15 L30 55 L70 15 L110 55 L150 15"/>
          <path d="M-10 65 L30 105 L70 65 L110 105 L150 65"/>
          <path d="M-10 115 L30 155 L70 115 L110 155 L150 115"/>
        </g>
        <!-- Fine Chenille Texture in Black Rows -->
        <g stroke="#35373A" stroke-width="1.2" fill="none">
          <path d="M-10 18 L30 58 L70 18 L110 58 L150 18"/>
          <path d="M-10 68 L30 108 L70 68 L110 108 L150 68"/>
        </g>
      </svg>
    `),
    tileable: true,
    tags: ['chevron', 'noir', 'black-and-white', 'bold', 'graphic', 'chenille', 'contrast'],
    metadata: {
      weave: 'High-Relief Chenille Jacquard Chevron',
      scale: 'bold',
      sheen: 'Matte',
      weight: 'Heavyweight Drapery',
      composition: 'Cotton Chenille & Spun Wool Ground',
    },
    color_hex: '#18191b',
  },

  // 8. Screenshot 162226: Geometric Argyle Diamond Jacquard
  {
    id: 'fab-user-argyle-diamond',
    name: 'Geometric Argyle Diamond Jacquard',
    category: 'Geometric',
    image_url: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120">
        <rect width="120" height="120" fill="#2E333C"/>
        <!-- Tri-Tone Diamond Jacquard Matrix -->
        <g stroke="#4A5260" stroke-width="2">
          <!-- Slate Grey Diamonds -->
          <polygon points="60,0 120,60 60,120 0,60" fill="#424A56"/>
          <polygon points="0,0 60,60 0,120 -60,60" fill="#363C47"/>
          <polygon points="120,0 180,60 120,120 60,60" fill="#363C47"/>
        </g>
        <!-- Pure Chalk White Diagonal Overcheck Lines -->
        <g stroke="#EDEAE4" stroke-width="1.8" stroke-dasharray="3,3">
          <line x1="0" y1="0" x2="120" y2="120"/>
          <line x1="120" y1="0" x2="0" y2="120"/>
          <line x1="-60" y1="60" x2="60" y2="180"/>
          <line x1="60" y1="-60" x2="180" y2="60"/>
        </g>
        <!-- Center Accent Diamond -->
        <polygon points="60,35 85,60 60,85 35,60" fill="#1C2026" stroke="#EDEAE4" stroke-width="1.2"/>
      </svg>
    `),
    tileable: true,
    tags: ['argyle', 'diamond', 'slate', 'charcoal', 'geometric', 'jacquard', 'architectural'],
    metadata: {
      weave: 'Tri-Tone Argyle Diamond Jacquard',
      scale: 'medium',
      sheen: 'Subtle Luster',
      weight: 'Heavyweight Drapery',
      composition: 'Yarn-Dyed Poly-Viscose Jacquard',
    },
    color_hex: '#3b434f',
  },

  // 9. Screenshot 162243: Heritage French Floral Embroidered Linen
  {
    id: 'fab-user-french-floral',
    name: 'Heritage French Floral Embroidered Linen',
    category: 'Embroidered & Textured',
    image_url: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="160" height="160">
        <defs>
          <linearGradient id="duckEggLinen" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#D2DCD9"/>
            <stop offset="50%" stop-color="#C7D3D0"/>
            <stop offset="100%" stop-color="#BDCBC8"/>
          </linearGradient>
        </defs>
        <rect width="160" height="160" fill="url(#duckEggLinen)"/>
        <!-- Soft linen crosshatch slubs -->
        <g stroke="#B2C2BF" stroke-width="0.75" opacity="0.65">
          <line x1="0" y1="20" x2="160" y2="20"/>
          <line x1="0" y1="60" x2="160" y2="60"/>
          <line x1="0" y1="100" x2="160" y2="100"/>
          <line x1="0" y1="140" x2="160" y2="140"/>
          <line x1="20" y1="0" x2="20" y2="160"/>
          <line x1="60" y1="0" x2="60" y2="160"/>
          <line x1="100" y1="0" x2="100" y2="160"/>
          <line x1="140" y1="0" x2="140" y2="160"/>
        </g>
        <!-- Raised Ivory Botanical Floral & Vine Embroidery -->
        <g fill="none" stroke="#FCFBF7" stroke-width="2.2" stroke-linecap="round">
          <!-- Curving Vine Stem -->
          <path d="M20 150 C40 110, 30 70, 70 50 C100 35, 120 60, 140 40"/>
          <!-- Delicate leaves branching out -->
          <path d="M42 95 C55 90, 60 78, 50 72 C42 80, 40 90, 42 95 Z" fill="#F4F3EE"/>
          <path d="M78 48 C90 40, 96 28, 86 24 C78 32, 76 42, 78 48 Z" fill="#F4F3EE"/>
          <path d="M105 48 C115 55, 120 68, 110 72 C104 65, 102 55, 105 48 Z" fill="#F4F3EE"/>
        </g>
        <!-- Embroidered 5-Petal Ivory Blossom -->
        <g transform="translate(135, 38)">
          <circle cx="0" cy="-9" r="6.5" fill="#FAF9F4" stroke="#E5E3D8" stroke-width="0.8"/>
          <circle cx="8" cy="-3" r="6.5" fill="#FAF9F4" stroke="#E5E3D8" stroke-width="0.8"/>
          <circle cx="5" cy="8" r="6.5" fill="#FAF9F4" stroke="#E5E3D8" stroke-width="0.8"/>
          <circle cx="-5" cy="8" r="6.5" fill="#FAF9F4" stroke="#E5E3D8" stroke-width="0.8"/>
          <circle cx="-8" cy="-3" r="6.5" fill="#FAF9F4" stroke="#E5E3D8" stroke-width="0.8"/>
          <circle cx="0" cy="0" r="4.5" fill="#E8D9AE"/>
        </g>
      </svg>
    `),
    tileable: true,
    tags: ['embroidered', 'floral', 'french', 'duck-egg', 'linen', 'botanical', 'vine', 'heritage'],
    metadata: {
      weave: 'Raised Chain-Stitch Botanical Floral Embroidery',
      scale: 'medium',
      sheen: 'Matte with Silky Thread Luster',
      weight: 'Medium Drapery',
      composition: 'Pure Washed Linen with Rayon Embroidery Floss',
    },
    color_hex: '#c7d3d0',
  },

  // 10. Screenshot 162255: Celadon Ribbed Palm Herringbone
  {
    id: 'fab-user-celadon-palm',
    name: 'Celadon Ribbed Palm Herringbone',
    category: 'Textured & Bouclé',
    image_url: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">
        <rect width="100" height="100" fill="#9FB2A2"/>
        <!-- Fine ribbed herringbone palm feathering -->
        <g stroke="#849987" stroke-width="2.5" fill="none">
          <path d="M0 15 L25 35 L50 15 L75 35 L100 15"/>
          <path d="M0 40 L25 60 L50 40 L75 60 L100 40"/>
          <path d="M0 65 L25 85 L50 65 L75 85 L100 65"/>
          <path d="M0 90 L25 110 L50 90 L75 110 L100 90"/>
        </g>
        <g stroke="#B8C8BA" stroke-width="1.2" fill="none" opacity="0.8">
          <path d="M0 10 L25 30 L50 10 L75 30 L100 10"/>
          <path d="M0 35 L25 55 L50 35 L75 55 L100 35"/>
          <path d="M0 60 L25 80 L50 60 L75 80 L100 60"/>
          <path d="M0 85 L25 105 L50 85 L75 105 L100 85"/>
        </g>
      </svg>
    `),
    tileable: true,
    tags: ['celadon', 'sage', 'mint', 'herringbone', 'palm', 'ribbed', 'textured', 'calm'],
    metadata: {
      weave: 'Ribbed Chevron Palm Feather Weave',
      scale: 'fine',
      sheen: 'Subtle Luster',
      weight: 'Medium-Heavy',
      composition: 'Cotton & Textured Modal Rep Weave',
    },
    color_hex: '#9fb2a2',
  },

  // 11. Screenshot 162307: Bronze Plume Jacquard
  {
    id: 'fab-user-bronze-plume',
    name: 'Bronze Plume Jacquard',
    category: 'Jacquard & Damask',
    image_url: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="140" height="140">
        <defs>
          <linearGradient id="bronzeShimmer" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#7C5D36"/>
            <stop offset="40%" stop-color="#9C7748"/>
            <stop offset="70%" stop-color="#C29B63"/>
            <stop offset="100%" stop-color="#5E4324"/>
          </linearGradient>
        </defs>
        <rect width="140" height="140" fill="url(#bronzeShimmer)"/>
        <!-- Stylized metallic feather plume motifs -->
        <g fill="none" stroke="#D8B57E" stroke-width="2" stroke-linecap="round">
          <path d="M30 110 C45 75, 45 40, 70 20 C60 50, 65 80, 50 110"/>
          <path d="M42 65 C55 60, 68 50, 72 40"/>
          <path d="M38 80 C50 78, 62 70, 65 62"/>
          <path d="M100 130 C115 95, 115 60, 140 40 C130 70, 135 100, 120 130"/>
          <path d="M112 85 C125 80, 138 70, 142 60"/>
        </g>
        <circle cx="70" cy="20" r="2.5" fill="#F5DCAC"/>
      </svg>
    `),
    tileable: true,
    tags: ['bronze', 'plume', 'metallic', 'jacquard', 'mink', 'luxury', 'gleam'],
    metadata: {
      weave: 'Lustrous Plume Feather Jacquard',
      scale: 'medium',
      sheen: 'High Sheen',
      weight: 'Heavyweight Drapery',
      composition: 'Silk & Metallic Lurex Blend',
    },
    color_hex: '#8a6b43',
  },

  // 12. Screenshot 162315: Art Nouveau Scrolled Damask
  {
    id: 'fab-user-art-nouveau',
    name: 'Art Nouveau Scrolled Damask',
    category: 'Jacquard & Damask',
    image_url: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="160" height="160">
        <defs>
          <linearGradient id="blushDamask" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#DEC8BD"/>
            <stop offset="50%" stop-color="#D2B9AC"/>
            <stop offset="100%" stop-color="#C2A79A"/>
          </linearGradient>
        </defs>
        <rect width="160" height="160" fill="url(#blushDamask)"/>
        <!-- Art Nouveau Sinuous S-Curve Damask Scrolls -->
        <g fill="none" stroke="#FAF2EB" stroke-width="2.5" stroke-linecap="round" opacity="0.88">
          <path d="M80 15 C60 35, 45 60, 55 90 C62 110, 85 125, 80 145"/>
          <path d="M80 15 C100 35, 115 60, 105 90 C98 110, 75 125, 80 145"/>
          <!-- Central Medallion Bud -->
          <circle cx="80" cy="55" r="14" fill="#E8D4C8"/>
          <path d="M80 41 C88 47, 88 63, 80 69 C72 63, 72 47, 80 41 Z" fill="#FAF2EB"/>
          <!-- Scrolling Tendrils -->
          <path d="M55 75 C35 70, 20 85, 30 100 C40 110, 55 95, 52 85"/>
          <path d="M105 75 C125 70, 140 85, 130 100 C120 110, 105 95, 108 85"/>
        </g>
      </svg>
    `),
    tileable: true,
    tags: ['damask', 'art-nouveau', 'scroll', 'champagne', 'blush', 'taupe', 'grandeur'],
    metadata: {
      weave: 'Woven Damask with Raised Scroll Filigree',
      scale: 'bold',
      sheen: 'Pearlescent Luster',
      weight: 'Heavyweight Drapery',
      composition: 'Viscose & Spun Mulberry Silk',
    },
    color_hex: '#d2b9ac',
  },

  // 13. Screenshot 162320: Deep Forest Moss Velvet
  {
    id: 'fab-user-moss-velvet',
    name: 'Deep Forest Moss Velvet',
    category: 'Velvet',
    image_url: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="140" height="140">
        <defs>
          <linearGradient id="mossPile" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#243424"/>
            <stop offset="35%" stop-color="#324A32"/>
            <stop offset="70%" stop-color="#283C28"/>
            <stop offset="100%" stop-color="#1B281B"/>
          </linearGradient>
          <filter id="velvetSheen">
            <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="3" result="noise"/>
            <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.18 0"/>
            <feBlend mode="overlay" in2="SourceGraphic"/>
          </filter>
        </defs>
        <rect width="140" height="140" fill="url(#mossPile)"/>
        <rect width="140" height="140" fill="#3D5C3D" opacity="0.3" filter="url(#velvetSheen)"/>
        <!-- Crushed Velvet Wave Highlights -->
        <g stroke="#4A6E4A" stroke-width="1.8" opacity="0.4" fill="none">
          <path d="M0 25 Q35 15, 70 30 T140 25"/>
          <path d="M0 65 Q35 55, 70 70 T140 65"/>
          <path d="M0 105 Q35 95, 70 110 T140 105"/>
        </g>
      </svg>
    `),
    tileable: true,
    tags: ['velvet', 'moss', 'forest', 'olive', 'plush', 'heavy', 'luxurious', 'green'],
    metadata: {
      weave: 'Dense Crushed Cotton Velvet Pile',
      scale: 'fine',
      sheen: 'Rich Liquid Sheen',
      weight: 'Super-Heavy Drapery',
      composition: '100% Long-Staple Crushed Cotton Velvet',
    },
    color_hex: '#283c28',
  },
];
