export interface RegionCoords {
  x: number; // percentage 0 - 100
  y: number; // percentage 0 - 100
}

export interface Region {
  id: string;
  name: string; // snake_case identifier
  display_name: string;
  description: string;
  location: string;
  order: number;
  polygon_coords: RegionCoords[];
  bbox?: { x: number; y: number; width: number; height: number }; // percentage bbox
  mask_url?: string;
  multi_component?: boolean;
  replaceable?: boolean;
  sheer?: boolean;
  suggested_sam_prompt?: string;
  default_fabric_id?: string | null;
  default_color?: string;
  accent_color?: string; // UI highlight indicator
  stencil_type?: 'horizontal_band' | 'color_block' | 'vertical_border' | 'frame_border' | 'custom';
}

export interface CurtainTemplate {
  id: string;
  brand_id?: string | null; // null represents platform-wide stencils
  name: string;
  style_code: string;
  tagline: string;
  description: string;
  original_image_url: string;
  real_photo_url?: string;
  plate_id?: string;
  stencil_preset?: 'chevron_accent' | 'color_block_trio' | 'velvet_houndstooth' | 'greek_key_frame' | 'camel_midnight_header' | 'persian_tapestry' | 'custom';
  structure_maps: {
    canny_url?: string;
    depth_url?: string;
  };
  regions: Region[];
  source?: 'catalog' | 'upload' | 'user_upload' | 'stencil_builder' | 'platform_stencil';
  metadata: {
    created_at: string;
    source: 'catalog' | 'upload' | 'user_upload' | 'stencil_builder' | 'platform_stencil';
    tags: string[];
    pinch_style: 'Pinch Pleat' | 'Eyelet / Grommet' | 'Goblet Pleat' | 'Tailored Wave';
  };
}

export interface Fabric {
  id: string;
  brand_id?: string | null;
  name: string;
  image_url: string;
  thumbnail_url?: string;
  category: 'Velvet' | 'Linen' | 'Silk' | 'Jacquard & Damask' | 'Textured & Bouclé' | 'Exotic Relief' | 'Geometric' | 'Embroidered & Textured' | 'Luxury Sheers' | 'Custom';
  tileable: boolean;
  tags: string[];
  visibility?: 'catalog' | 'session_only';
  source?: 'catalog' | 'camera_capture' | 'bulk_upload' | 'custom';
  metadata: {
    weave: string;
    scale: 'fine' | 'medium' | 'bold';
    sheen: 'Matte' | 'Subtle Luster' | 'High Sheen' | 'Textured' | string;
    weight: 'Light' | 'Medium' | 'Heavyweight Drapery' | string;
    composition: string;
  };
  color_hex: string;
  is_custom?: boolean;
}

export interface FabricAssignment {
  region_id: string;
  fabric_id: string;
  scale: number; // 0.5 to 3.0
  rotation: number; // 0 to 180 degrees
  brightness?: number; // 0.8 to 1.2
}

export interface GenerationJob {
  id: string;
  brand_id?: string;
  template_id: string;
  template_name: string;
  assignments: FabricAssignment[];
  status: 'idle' | 'queued' | 'processing' | 'completed' | 'failed';
  output_urls: string[];
  current_output_url: string | null;
  error_message?: string;
  positive_prompt?: string;
  provider_used?: string;
  created_at: string;
}
