import React, { useState } from 'react';
import { CurtainTemplate, Region } from '../types/curtain';
import { X, Upload, Sparkles, Check, AlertCircle, Eye, Plus, Trash2, LayoutTemplate, Camera, Layers, Sliders, Paintbrush } from 'lucide-react';
import { generateRealisticPlate } from '../utils/realisticPhotoPlates';
import { FreehandMaskCanvas } from './FreehandMaskCanvas';

interface NewTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveTemplate: (template: CurtainTemplate) => void;
}

interface StencilPresetDef {
  id: string;
  name: string;
  category: string;
  plateId: string;
  description: string;
  tagline: string;
  regions: {
    name: string;
    display_name: string;
    description: string;
    location: string;
    polygon_coords: { x: number; y: number }[];
    default_color: string;
    accent_color: string;
  }[];
}

const BUILT_IN_STENCILS: StencilPresetDef[] = [
  {
    id: 'stencil-chevron',
    name: 'Aatmi Chevron Drape Stencil',
    category: 'Chevron & Inset',
    plateId: 'chevron',
    tagline: '3-Zone Architectural Chevron Inset Band',
    description: 'Upper drapery body, dynamic central chevron geometric band, and grounding bottom skirt.',
    regions: [
      {
        name: 'upper_body',
        display_name: 'Region 1 — Upper Drape Body',
        description: 'Upper curtain field extending from rod header to chevron band',
        location: 'Upper 40%',
        polygon_coords: [
          { x: 14, y: 5 }, { x: 86, y: 5 }, { x: 86, y: 40 }, { x: 50, y: 46 }, { x: 14, y: 40 }
        ],
        default_color: '#DDD6C7',
        accent_color: '#D4AF37',
      },
      {
        name: 'chevron_band',
        display_name: 'Region 2 — Dynamic Chevron Band',
        description: 'Geometric inverted-V chevron inset band across drapes',
        location: 'Mid 20% Chevron Band',
        polygon_coords: [
          { x: 14, y: 40 }, { x: 50, y: 46 }, { x: 86, y: 40 },
          { x: 86, y: 58 }, { x: 50, y: 64 }, { x: 14, y: 58 }
        ],
        default_color: '#C29B38',
        accent_color: '#D97706',
      },
      {
        name: 'lower_skirt',
        display_name: 'Region 3 — Grounding Lower Skirt',
        description: 'Lower architectural hem skirt pooling toward floor',
        location: 'Bottom 40%',
        polygon_coords: [
          { x: 14, y: 58 }, { x: 50, y: 64 }, { x: 86, y: 58 },
          { x: 86, y: 97 }, { x: 14, y: 97 }
        ],
        default_color: '#282622',
        accent_color: '#059669',
      },
    ],
  },
  {
    id: 'stencil-colorblock',
    name: 'Color-Block Trio Stencil',
    category: 'Horizontal Bands',
    plateId: 'colorblock',
    tagline: '3-Tier Color-Block Drapery Stencil',
    description: 'Header band (25%), expansive mid-body section (45%), and tailored base hem (30%).',
    regions: [
      {
        name: 'upper_header',
        display_name: 'Region 1 — Header Band',
        description: 'Pinch pleat header zone',
        location: 'Upper 25%',
        polygon_coords: [
          { x: 15, y: 5 }, { x: 85, y: 5 }, { x: 85, y: 30 }, { x: 15, y: 30 }
        ],
        default_color: '#E8E3D8',
        accent_color: '#D4AF37',
      },
      {
        name: 'mid_body',
        display_name: 'Region 2 — Main Center Field',
        description: 'Central eye-level drapery field',
        location: 'Mid 45%',
        polygon_coords: [
          { x: 15, y: 30 }, { x: 85, y: 30 }, { x: 85, y: 72 }, { x: 15, y: 72 }
        ],
        default_color: '#8C7456',
        accent_color: '#D97706',
      },
      {
        name: 'lower_hem',
        display_name: 'Region 3 — Floor Hem Skirt',
        description: 'Weighted floor pool hem band',
        location: 'Bottom 28%',
        polygon_coords: [
          { x: 15, y: 72 }, { x: 85, y: 72 }, { x: 85, y: 97 }, { x: 15, y: 97 }
        ],
        default_color: '#1F242B',
        accent_color: '#059669',
      },
    ],
  },
  {
    id: 'stencil-leading-edge',
    name: 'Velvet Body & Leading Edge Stencil',
    category: 'Borders & Edges',
    plateId: 'velvet-houndstooth',
    tagline: 'Tailored Vertical Leading Border Stencil',
    description: 'Continuous main velvet drape body framed by high-contrast houndstooth or patterned leading edge.',
    regions: [
      {
        name: 'main_body',
        display_name: 'Region 1 — Main Drapery Panel',
        description: 'Expansive field with heavy vertical fold drapes',
        location: 'Main 75% Width',
        polygon_coords: [
          { x: 14, y: 5 }, { x: 68, y: 5 }, { x: 68, y: 97 }, { x: 14, y: 97 }
        ],
        default_color: '#1C2E24',
        accent_color: '#059669',
      },
      {
        name: 'leading_edge',
        display_name: 'Region 2 — Tailored Leading Border',
        description: 'High-contrast vertical border flanking the window opening',
        location: 'Inner 25% Leading Edge',
        polygon_coords: [
          { x: 68, y: 5 }, { x: 86, y: 5 }, { x: 86, y: 97 }, { x: 68, y: 97 }
        ],
        default_color: '#F4F0E8',
        accent_color: '#D97706',
      },
    ],
  },
  {
    id: 'stencil-greek-key',
    name: 'Greek Key Mitred Frame Stencil',
    category: 'Architectural Frames',
    plateId: 'greek-key',
    tagline: 'Mitred Outer Border + Center Field',
    description: 'Classical neoclassical architectural frame with geometric Greek key or embroidered border.',
    regions: [
      {
        name: 'center_field',
        display_name: 'Region 1 — Center Field Drapery',
        description: 'Subtle linen or velvet central curtain field',
        location: 'Center Field',
        polygon_coords: [
          { x: 25, y: 15 }, { x: 75, y: 15 }, { x: 75, y: 88 }, { x: 25, y: 88 }
        ],
        default_color: '#EDE8DE',
        accent_color: '#2563EB',
      },
      {
        name: 'mitred_border',
        display_name: 'Region 2 — Mitred Outer Border',
        description: 'Perimeter framing band with tailored mitred corner seams',
        location: 'Full Perimeter Border',
        polygon_coords: [
          { x: 14, y: 5 }, { x: 86, y: 5 }, { x: 86, y: 97 }, { x: 14, y: 97 },
          { x: 25, y: 88 }, { x: 75, y: 88 }, { x: 75, y: 15 }, { x: 25, y: 15 }
        ],
        default_color: '#1F2937',
        accent_color: '#D97706',
      },
    ],
  },
  {
    id: 'stencil-split-panel',
    name: 'Bi-Color Symmetrical Drapes Stencil',
    category: 'Dual Panels',
    plateId: 'camel-midnight',
    tagline: 'Symmetrical Left & Right Panel Stencil',
    description: 'Dual-flank curtain pair with coordinating left and right drapery panels.',
    regions: [
      {
        name: 'left_panel',
        display_name: 'Region 1 — Left Drapery Panel',
        description: 'Left window drape with columnar pleating',
        location: 'Left 45%',
        polygon_coords: [
          { x: 10, y: 5 }, { x: 48, y: 5 }, { x: 48, y: 97 }, { x: 10, y: 97 }
        ],
        default_color: '#C8A870',
        accent_color: '#D97706',
      },
      {
        name: 'right_panel',
        display_name: 'Region 2 — Right Drapery Panel',
        description: 'Right window drape with columnar pleating',
        location: 'Right 45%',
        polygon_coords: [
          { x: 52, y: 5 }, { x: 90, y: 5 }, { x: 90, y: 97 }, { x: 52, y: 97 }
        ],
        default_color: '#151D2A',
        accent_color: '#D4AF37',
      },
    ],
  },
  {
    id: 'stencil-persian-tapestry',
    name: 'Persian Tapestry & Damask Stencil',
    category: 'Heritage Drapes',
    plateId: 'persian-tapestry',
    tagline: 'Jacquard Medallion Field with Weighted Hem',
    description: 'Full-length jacquard or damask medallion tapestry body with deep hem.',
    regions: [
      {
        name: 'tapestry_body',
        display_name: 'Region 1 — Jacquard Tapestry Body',
        description: 'Main body for intricate damask, brocade, or floral tapestry',
        location: 'Upper 80%',
        polygon_coords: [
          { x: 14, y: 5 }, { x: 86, y: 5 }, { x: 86, y: 80 }, { x: 14, y: 80 }
        ],
        default_color: '#7D232C',
        accent_color: '#DC2626',
      },
      {
        name: 'base_skirt',
        display_name: 'Region 2 — Weighted Base Hem',
        description: 'Tailored solid grounding hem border',
        location: 'Bottom 20%',
        polygon_coords: [
          { x: 14, y: 80 }, { x: 86, y: 80 }, { x: 86, y: 97 }, { x: 14, y: 97 }
        ],
        default_color: '#B89025',
        accent_color: '#D97706',
      },
    ],
  },
];

export const NewTemplateModal: React.FC<NewTemplateModalProps> = ({
  isOpen,
  onClose,
  onSaveTemplate,
}) => {
  const [creationMode, setCreationMode] = useState<'stencil' | 'upload'>('stencil');
  const [selectedStencil, setSelectedStencil] = useState<StencilPresetDef>(BUILT_IN_STENCILS[0]);
  
  // Custom upload & refine state
  const [step, setStep] = useState<'upload' | 'analyzing' | 'refine'>('upload');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [templateName, setTemplateName] = useState<string>('Custom Designer Curtain');
  const [styleCode, setStyleCode] = useState<string>(`AATMI-STN-${Math.floor(Math.random() * 900 + 100)}`);
  const [detectedRegions, setDetectedRegions] = useState<Region[]>([]);
  const [activeRefineRegionId, setActiveRefineRegionId] = useState<string | null>(null);
  const [refineMode, setRefineMode] = useState<'brush' | 'polygon'>('brush');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleUpdateRegionMask = (regionId: string, maskDataUrl: string) => {
    setDetectedRegions((prev) =>
      prev.map((r) => (r.id === regionId ? { ...r, mask_url: maskDataUrl } : r))
    );
  };

  const handleClearRegionMask = (regionId: string) => {
    setDetectedRegions((prev) =>
      prev.map((r) => (r.id === regionId ? { ...r, mask_url: undefined } : r))
    );
  };

  if (!isOpen) return null;

  // When switching or picking a stencil
  const handleSelectStencil = (stencil: StencilPresetDef) => {
    setSelectedStencil(stencil);
    setTemplateName(stencil.name);
    setStyleCode(`AATMI-${stencil.id.toUpperCase().replace('STENCIL-', '')}-${Math.floor(Math.random() * 900 + 100)}`);
  };

  const handleSaveStencilAsTemplate = () => {
    // Generate real photographic plate for this stencil
    const realPhotoUrl = generateRealisticPlate(selectedStencil.plateId, 800, 1000);

    const formattedRegions: Region[] = selectedStencil.regions.map((r, idx) => ({
      id: `reg-${selectedStencil.id}-${Date.now()}-${idx}`,
      name: r.name,
      display_name: r.display_name,
      description: r.description,
      location: r.location,
      order: idx + 1,
      polygon_coords: r.polygon_coords,
      default_color: r.default_color,
      accent_color: r.accent_color,
    }));

    const newTemplate: CurtainTemplate = {
      id: `tpl-${selectedStencil.id}-${Date.now()}`,
      name: templateName || selectedStencil.name,
      style_code: styleCode,
      tagline: selectedStencil.tagline,
      description: selectedStencil.description,
      original_image_url: realPhotoUrl,
      real_photo_url: realPhotoUrl,
      plate_id: selectedStencil.plateId,
      stencil_preset: selectedStencil.id,
      structure_maps: {},
      regions: formattedRegions,
      metadata: {
        created_at: new Date().toISOString(),
        source: 'upload',
        tags: ['stencil', selectedStencil.category.toLowerCase(), `${formattedRegions.length}-regions`],
        pinch_style: 'Pinch Pleat',
      },
    };

    onSaveTemplate(newTemplate);
    onClose();
  };

  // Upload custom photo handler
  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const b64 = ev.target?.result as string;
      setUploadedImage(b64);
      setTemplateName(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
      analyzeCurtainImage(b64);
    };
    reader.readAsDataURL(file);
  };

  const analyzeCurtainImage = async (b64: string) => {
    setStep('analyzing');
    setErrorMessage(null);

    try {
      const res = await fetch('/api/analyze-curtain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: b64,
          mimeType: 'image/jpeg',
        }),
      });

      const data = await res.json();
      if (data.regions && Array.isArray(data.regions)) {
        const colors = ['#D4AF37', '#D97706', '#059669', '#2563EB', '#DC2626'];
        const formatted: Region[] = data.regions.map((r: any, idx: number) => ({
          id: `reg-custom-${Date.now()}-${idx}`,
          name: r.name || `region_${idx + 1}`,
          display_name: r.display_name || `Region ${idx + 1}`,
          description: r.description || 'Replaceable fabric zone',
          location: r.location || 'Section of drapery',
          order: idx + 1,
          polygon_coords: r.polygon_coords || [
            { x: 15, y: 10 + idx * 25 },
            { x: 85, y: 10 + idx * 25 },
            { x: 85, y: 35 + idx * 25 },
            { x: 15, y: 35 + idx * 25 },
          ],
          suggested_sam_prompt: r.suggested_sam_prompt || '',
          default_color: '#DDD6C7',
          accent_color: colors[idx % colors.length],
        }));

        setDetectedRegions(formatted);
        if (formatted.length > 0) {
          setActiveRefineRegionId(formatted[0].id);
        }
        setStep('refine');
      } else {
        throw new Error(data.error || 'Failed to detect regions');
      }
    } catch (err: any) {
      console.error('Error analyzing curtain:', err);
      setErrorMessage(err.message || 'Using standard curtain geometry for uploaded photo.');
      const fallback: Region[] = [
        {
          id: `reg-custom-main-${Date.now()}`,
          name: 'main_panel',
          display_name: 'Region 1 — Main Panel',
          description: 'Upper drapery body with vertical folds',
          location: 'Upper 70%',
          order: 1,
          polygon_coords: [
            { x: 15, y: 5 }, { x: 85, y: 5 }, { x: 85, y: 75 }, { x: 15, y: 75 }
          ],
          default_color: '#DDD6C7',
          accent_color: '#D4AF37',
        },
        {
          id: `reg-custom-hem-${Date.now()}`,
          name: 'bottom_hem',
          display_name: 'Region 2 — Bottom Border',
          description: 'Lower architectural hem band',
          location: 'Lower 25%',
          order: 2,
          polygon_coords: [
            { x: 15, y: 75 }, { x: 85, y: 75 }, { x: 85, y: 98 }, { x: 15, y: 98 }
          ],
          default_color: '#24272B',
          accent_color: '#059669',
        },
      ];
      setDetectedRegions(fallback);
      setActiveRefineRegionId(fallback[0].id);
      setStep('refine');
    }
  };

  const handleAddNewRegion = () => {
    const nextOrder = detectedRegions.length + 1;
    const newReg: Region = {
      id: `reg-custom-${Date.now()}`,
      name: `custom_accent_zone_${nextOrder}`,
      display_name: `Region ${nextOrder} — Accent Zone`,
      description: 'Custom added replaceable fabric zone',
      location: 'Custom section',
      order: nextOrder,
      polygon_coords: [
        { x: 20, y: 40 }, { x: 80, y: 40 }, { x: 80, y: 60 }, { x: 20, y: 60 }
      ],
      default_color: '#DFCFB2',
      accent_color: '#D97706',
    };
    setDetectedRegions([...detectedRegions, newReg]);
    setActiveRefineRegionId(newReg.id);
  };

  const handleRemoveRegion = (id: string) => {
    setDetectedRegions(detectedRegions.filter((r) => r.id !== id));
  };

  const handleUpdateRegionName = (id: string, name: string) => {
    setDetectedRegions(
      detectedRegions.map((r) => (r.id === id ? { ...r, display_name: name } : r))
    );
  };

  const handleFinishCustomSave = () => {
    if (!uploadedImage) return;

    const newTemplate: CurtainTemplate = {
      id: `tpl-user-${Date.now()}`,
      name: templateName || 'Custom Curtain Style',
      style_code: styleCode,
      tagline: `${detectedRegions.length}-Zone Custom Fabric Segmentation`,
      description: 'Custom curtain template created from user photograph with multi-region segmentation.',
      original_image_url: uploadedImage,
      real_photo_url: uploadedImage,
      structure_maps: {},
      regions: detectedRegions,
      metadata: {
        created_at: new Date().toISOString(),
        source: 'upload',
        tags: ['custom-template', `${detectedRegions.length}-regions`],
        pinch_style: 'Pinch Pleat',
      },
    };

    onSaveTemplate(newTemplate);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-white/85 backdrop-blur-md">
      <div className="bg-white sm:rounded-2xl shadow-2xl border-0 sm:border border-[#C49A1E]/20 w-full sm:max-w-4xl h-full sm:h-auto sm:max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in duration-200" style={{boxShadow:'0 0 0 1px rgba(212,175,55,0.12), 0 32px 80px rgba(0,0,0,0.75)'}}>
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 border-b border-[#D4AF37]/15 flex items-center justify-between bg-[#F8F5F0]">
          <div className="min-w-0 pr-2 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#F5DE8B] to-[#8C7322] flex items-center justify-center shrink-0">
              <LayoutTemplate className="w-4 h-4 text-[#0A0B0E]" />
            </div>
            <div>
              <h3 className="font-serif text-base sm:text-lg font-bold text-[#1A1714] truncate">
                Curtain Design &amp; Stencil Studio
              </h3>
              <p className="text-[11px] sm:text-xs text-[#6B5F54] truncate">
                Select an architectural curtain stencil or upload showroom photo.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#9E9088] hover:text-[#1A1714] rounded-lg hover:bg-[#F0EBE4] transition cursor-pointer shrink-0 tactile-press"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Toggle Tabs */}
        <div className="px-4 sm:px-6 pt-2.5 pb-0 border-b border-[#D4AF37]/10 bg-[#F0EBE4] flex items-center gap-3 sm:gap-4 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setCreationMode('stencil')}
            className={`pb-2.5 text-xs font-semibold flex items-center gap-1.5 cursor-pointer border-b-2 transition whitespace-nowrap ${
              creationMode === 'stencil'
                ? 'border-[#D4AF37] text-[#B8900F]'
                : 'border-transparent text-[#9E9088] hover:text-[#4A3F35]'
            }`}
          >
            <LayoutTemplate className="w-3.5 h-3.5" />
            <span>Stencil Presets ({BUILT_IN_STENCILS.length})</span>
          </button>

          <button
            onClick={() => setCreationMode('upload')}
            className={`pb-2.5 text-xs font-semibold flex items-center gap-1.5 cursor-pointer border-b-2 transition whitespace-nowrap ${
              creationMode === 'upload'
                ? 'border-[#D4AF37] text-[#B8900F]'
                : 'border-transparent text-[#9E9088] hover:text-[#4A3F35]'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Upload Photo &amp; Auto-Segment</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 flex-1 overflow-y-auto bg-white">
          {/* MODE A: STENCIL PRESETS */}
          {creationMode === 'stencil' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Left 5 Cols: Stencil Selection List */}
              <div className="md:col-span-5 space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#9E9088] block mb-1">
                  Architectural Stencil Archetypes
                </span>

                {BUILT_IN_STENCILS.map((stn) => {
                  const isSelected = selectedStencil.id === stn.id;
                  return (
                    <div
                      key={stn.id}
                      onClick={() => handleSelectStencil(stn)}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition flex items-start gap-3 tactile-press ${
                        isSelected
                          ? 'border-[#D4AF37]/60 bg-[#D4AF37]/8 shadow-[0_0_0_1px_rgba(212,175,55,0.15)]'
                          : 'border-[#E2D9CE] bg-[#F8F5F0] hover:bg-[#F0EBE4] hover:border-[#C9BFB4]'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-lg bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#B8900F] flex items-center justify-center shrink-0 font-serif font-bold text-xs">
                        {stn.regions.length}Z
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-semibold text-[#1A1714] truncate">
                            {stn.name}
                          </span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#C49A1E] shrink-0" />}
                        </div>
                        <span className="text-[10px] font-medium text-[#C49A1E]/80 block">
                          {stn.category}
                        </span>
                        <p className="text-[11px] text-[#9E9088] line-clamp-1 mt-0.5">
                          {stn.tagline}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Right 7 Cols: Stencil Blueprint & Zone Inspector */}
              <div className="md:col-span-7 space-y-4 flex flex-col justify-between">
                <div>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#6B5F54] mb-1">
                        Stencil Title
                      </label>
                      <input
                        type="text"
                        value={templateName}
                        onChange={(e) => setTemplateName(e.target.value)}
                        className="w-full text-xs px-3 py-1.5 bg-white border border-[#C9BFB4] text-[#1A1714] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D4AF37] font-medium placeholder-[#4A4E5A]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#6B5F54] mb-1">
                        Style Code
                      </label>
                      <input
                        type="text"
                        value={styleCode}
                        onChange={(e) => setStyleCode(e.target.value)}
                        className="w-full text-xs px-3 py-1.5 bg-white border border-[#C9BFB4] text-[#1A1714] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D4AF37] font-mono placeholder-[#4A4E5A]"
                      />
                    </div>
                  </div>

                  {/* Visual Silhouette SVG of the Stencil */}
                  <div className="relative aspect-[4/3] bg-[#F0EBE4] rounded-xl overflow-hidden border border-[#C49A1E]/20 shadow-inner flex items-center justify-center p-3">
                    {/* Architectural Window Frame & Rod Backdrop */}
                    <div className="absolute top-2 inset-x-8 h-1 bg-[#D4AF37]/70 rounded" />
                    <div className="absolute top-1.5 left-7 w-2 h-2 rounded-full bg-[#F5DE8B]/80" />
                    <div className="absolute top-1.5 right-7 w-2 h-2 rounded-full bg-[#F5DE8B]/80" />

                    {/* Stencil Polygons */}
                    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                      {selectedStencil.regions.map((reg) => {
                        const pointsStr = reg.polygon_coords
                          .map((c) => `${c.x},${c.y}`)
                          .join(' ');
                        return (
                          <g key={reg.name}>
                            <polygon
                              points={pointsStr}
                              fill={reg.accent_color}
                              fillOpacity="0.45"
                              stroke={reg.accent_color}
                              strokeWidth="1.2"
                            />
                          </g>
                        );
                      })}
                    </svg>

                    <div className="absolute top-3 left-3 bg-[#F8F5F0]/90 text-[#4A3F35] text-[10px] px-2 py-0.5 rounded border border-[#C9BFB4] font-mono">
                      Stencil Geometry &amp; Pleat Cuts
                    </div>

                    <div className="absolute bottom-3 right-3 bg-[#D4AF37]/85 text-[#0A0B0E] text-[10px] font-semibold px-2 py-0.5 rounded">
                      Photographic Plate: {selectedStencil.plateId}
                    </div>
                  </div>

                  {/* Defined Regions in Stencil */}
                  <div className="mt-3 space-y-1.5">
                    <span className="text-[11px] font-bold text-[#6B5F54] block uppercase tracking-wide">
                      Segmented Zones ({selectedStencil.regions.length})
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {selectedStencil.regions.map((reg, idx) => (
                        <div
                          key={reg.name}
                          className="p-2 bg-[#F8F5F0] border border-[#E2D9CE] rounded-lg text-xs flex items-center gap-2"
                        >
                          <span
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{ backgroundColor: reg.accent_color }}
                          />
                          <div className="min-w-0">
                            <span className="font-semibold text-[#1A1714] block truncate">
                              {reg.display_name}
                            </span>
                            <span className="text-[10px] text-[#9E9088] block">
                              {reg.location}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Save Stencil Button */}
                <div className="pt-3 border-t border-[#E2D9CE] flex items-center justify-between">
                  <span className="text-xs text-[#9E9088]">
                    Saves as an editable curtain template in your Studio.
                  </span>
                  <button
                    onClick={handleSaveStencilAsTemplate}
                    className="px-5 py-2 text-xs font-semibold bg-gradient-to-r from-[#F5DE8B] via-[#D4AF37] to-[#8C7322] hover:brightness-110 text-[#0A0B0E] rounded-lg transition shadow-md cursor-pointer flex items-center gap-1.5 tactile-press"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Create Template from Stencil</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* MODE B: UPLOAD REAL PHOTOGRAPH */}
          {creationMode === 'upload' && (
            <div>
              {step === 'upload' && (
                <div className="space-y-4 max-w-lg mx-auto py-4">
                  <label
                    htmlFor="curtain-photo-upload"
                    className="border-2 border-dashed border-[#C9BFB4] hover:border-[#D4AF37]/60 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer bg-white/2 hover:bg-[#D4AF37]/4 transition group"
                  >
                    <div className="w-14 h-14 rounded-full bg-[#D4AF37]/12 flex items-center justify-center text-[#C49A1E] group-hover:scale-105 transition">
                      <Upload className="w-7 h-7" />
                    </div>
                    <div className="text-center">
                      <span className="text-sm font-semibold text-[#1A1714] block">
                        Upload Real Curtain Photo
                      </span>
                      <span className="text-xs text-[#9E9088] mt-1 block">
                        Real showroom or camera photo with authentic drapery folds
                      </span>
                    </div>
                    <span className="text-[11px] font-mono bg-white/6 text-[#6B5F54] px-2.5 py-1 rounded border border-[#C9BFB4]">
                      JPG, PNG, WebP up to 30MB
                    </span>
                    <input
                      id="curtain-photo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageFile}
                      className="hidden"
                    />
                  </label>

                  <div className="bg-[#D4AF37]/6 border border-[#C49A1E]/20 rounded-xl p-3.5 text-xs text-[#C49A1E]/90 flex items-start gap-2.5">
                    <Sparkles className="w-4 h-4 text-[#C49A1E] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold block mb-0.5 text-[#B8900F]">Real Photographic Pipeline:</span>
                      Your real photograph will be preserved as the master plate, allowing you to re-drape any region with new fabrics while keeping authentic folds, lighting, and room ambiance.
                    </div>
                  </div>
                </div>
              )}

              {step === 'analyzing' && (
                <div className="py-12 flex flex-col items-center justify-center text-center">
                  <div className="w-14 h-14 rounded-full border-2 border-[#D4AF37]/30 border-t-[#D4AF37] animate-spin flex items-center justify-center mb-4">
                    <Sparkles className="w-6 h-6 text-[#C49A1E]" />
                  </div>
                  <h4 className="font-serif text-lg font-bold text-[#1A1714] mb-1">
                    Analyzing Real Curtain Topology...
                  </h4>
                  <p className="text-xs text-[#9E9088] max-w-sm">
                    Segmenting fabric sections, identifying pleat columns, and preparing real drapery masks.
                  </p>
                </div>
              )}

              {step === 'refine' && uploadedImage && (
                <div className="space-y-6">
                  {errorMessage && (
                    <div className="bg-[#D4AF37]/8 border border-[#C49A1E]/25 text-[#B8900F] text-xs p-3 rounded-lg flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-[#C49A1E] shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#6B5F54] mb-1">
                        Template Name
                      </label>
                      <input
                        type="text"
                        value={templateName}
                        onChange={(e) => setTemplateName(e.target.value)}
                        className="w-full text-xs px-3 py-2 bg-white border border-[#C9BFB4] text-[#1A1714] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#6B5F54] mb-1">
                        Style Code
                      </label>
                      <input
                        type="text"
                        value={styleCode}
                        onChange={(e) => setStyleCode(e.target.value)}
                        className="w-full text-xs px-3 py-2 bg-white border border-[#C9BFB4] text-[#1A1714] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Left: Interactive Mask Canvas / Overlays */}
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 p-1 bg-white/4 rounded-lg text-[11px] font-semibold border border-[#E2D9CE]">
                          <button
                            type="button"
                            onClick={() => setRefineMode('brush')}
                            className={`px-2.5 py-1 rounded-md transition cursor-pointer flex items-center gap-1.5 tactile-press ${
                              refineMode === 'brush'
                                ? 'bg-gradient-to-r from-[#F5DE8B] to-[#D4AF37] text-[#0A0B0E] shadow-xs'
                                : 'text-[#6B5F54] hover:text-[#3D3329]'
                            }`}
                          >
                            <Paintbrush className="w-3 h-3" />
                            <span>Organic Brush &amp; Eraser</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setRefineMode('polygon')}
                            className={`px-2.5 py-1 rounded-md transition cursor-pointer flex items-center gap-1.5 tactile-press ${
                              refineMode === 'polygon'
                                ? 'bg-gradient-to-r from-[#F5DE8B] to-[#D4AF37] text-[#0A0B0E] shadow-xs'
                                : 'text-[#6B5F54] hover:text-[#3D3329]'
                            }`}
                          >
                            <Layers className="w-3 h-3" />
                            <span>Polygon Snapping</span>
                          </button>
                        </div>
                      </div>

                      {refineMode === 'brush' ? (
                        <FreehandMaskCanvas
                          backgroundImageUrl={uploadedImage}
                          regions={detectedRegions}
                          activeRegionId={activeRefineRegionId}
                          onUpdateRegionMask={handleUpdateRegionMask}
                          onClearRegionMask={handleClearRegionMask}
                        />
                      ) : (
                        <div className="relative aspect-[4/5] bg-[#F0EBE4] rounded-xl overflow-hidden border border-[#C9BFB4]">
                          <img
                            src={uploadedImage}
                            alt="Uploaded Real Curtain"
                            className="w-full h-full object-cover"
                          />
                          <svg className="absolute inset-0 w-full h-full pointer-events-none">
                            {detectedRegions.map((r) => {
                              const isSelected = activeRefineRegionId === r.id;
                              const pointsStr = r.polygon_coords
                                .map((c) => `${c.x}%,${c.y}%`)
                                .join(' ');
                              return (
                                <polygon
                                  key={r.id}
                                  points={pointsStr}
                                  fill={isSelected ? `${r.accent_color}40` : `${r.accent_color}20`}
                                  stroke={r.accent_color || '#D4AF37'}
                                  strokeWidth={isSelected ? '2.5' : '1.5'}
                                  strokeDasharray={isSelected ? 'none' : '4,2'}
                                />
                              );
                            })}
                          </svg>
                          <div className="absolute bottom-2 left-2 bg-[#F8F5F0]/90 text-[#4A3F35] text-[10px] px-2 py-0.5 rounded font-mono border border-[#C9BFB4]">
                            {detectedRegions.length} Real Photo Zones
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right: Regions Manager */}
                    <div className="space-y-3 flex flex-col justify-between">
                      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#1A1714] uppercase tracking-wide">
                            Fabric Regions
                          </span>
                          <button
                            onClick={handleAddNewRegion}
                            className="text-[11px] font-semibold text-[#C49A1E] hover:text-[#B8900F] flex items-center gap-1 cursor-pointer tactile-press"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Add Zone
                          </button>
                        </div>

                        {detectedRegions.map((reg) => (
                          <div
                            key={reg.id}
                            onClick={() => setActiveRefineRegionId(reg.id)}
                            className={`p-2.5 rounded-lg border text-xs cursor-pointer transition ${
                              activeRefineRegionId === reg.id
                                ? 'border-[#D4AF37]/60 bg-[#D4AF37]/6 shadow-[0_0_0_1px_rgba(212,175,55,0.12)]'
                                : 'border-[#E2D9CE] bg-white/2 hover:bg-white/4'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 flex-1">
                                <span
                                  className="w-3 h-3 rounded-full shrink-0"
                                  style={{ backgroundColor: reg.accent_color }}
                                />
                                <input
                                  type="text"
                                  value={reg.display_name}
                                  onChange={(e) => handleUpdateRegionName(reg.id, e.target.value)}
                                  className="w-full bg-transparent font-semibold text-[#1A1714] focus:outline-none"
                                />
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveRegion(reg.id);
                                }}
                                className="text-[#4A4E5A] hover:text-red-400 p-1 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <p className="text-[11px] text-[#9E9088] mt-1 pl-5">
                              {reg.description}
                            </p>
                          </div>
                        ))}
                      </div>

                      <div className="p-3 bg-[#F8F5F0] rounded-xl border border-[#E2D9CE] text-xs text-[#6B5F54]">
                        <p className="font-semibold text-[#1A1714] mb-0.5">Real Photo Preserved</p>
                        <p className="text-[11px] text-[#9E9088]">
                          This real photograph will serve as your base drape plate in the Aatmi Studio.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#E2D9CE] flex items-center justify-between">
                    <button
                      onClick={() => setStep('upload')}
                      className="px-4 py-2 text-xs font-medium text-[#6B5F54] hover:bg-[#F0EBE4] rounded-lg cursor-pointer transition"
                    >
                      Change Photo
                    </button>
                    <button
                      onClick={handleFinishCustomSave}
                      className="px-5 py-2 text-xs font-semibold bg-gradient-to-r from-[#F5DE8B] via-[#D4AF37] to-[#8C7322] hover:brightness-110 text-[#0A0B0E] rounded-lg transition shadow-md cursor-pointer flex items-center gap-1.5 tactile-press"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Save Real Curtain Template</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
