// src/components/brand/DesignDetailView.tsx
import React, { useState } from 'react';
import { useBrandStore } from '../../lib/brandStore';
import { useStudioStore } from '../../lib/store';
import { Design, RoomPreview } from '../../types/brand';
import {
  Share2,
  Download,
  Copy,
  Check,
  Sparkles,
  Plus,
  Upload,
  ArrowLeft,
  Sliders,
  Maximize2,
  FileText,
  AlertCircle,
  Eye,
} from 'lucide-react';

interface DesignDetailViewProps {
  onBackToEditor?: () => void;
  onOpenSpecSheet?: (design: Design) => void;
}

export const DesignDetailView: React.FC<DesignDetailViewProps> = ({
  onBackToEditor,
  onOpenSpecSheet,
}) => {
  const {
    designs,
    activeDesignId,
    setActiveDesignId,
    brandTemplates,
    currentBrandId,
    getModelConfig,
    addRoomPreview,
    setActiveView,
  } = useBrandStore();

  const [activeTab, setActiveTab] = useState<'curtain' | 'room'>('curtain');
  const [copiedLink, setCopiedLink] = useState(false);

  // Active room preview selected in horizontal strip
  const [selectedPreviewIndex, setSelectedPreviewIndex] = useState(0);

  // Before/After comparison slider position (0 - 100)
  const [sliderPos, setSliderPos] = useState(50);
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);

  // Room generation chooser modal
  const [isRoomChooserOpen, setIsRoomChooserOpen] = useState(false);
  const [isGeneratingRoom, setIsGeneratingRoom] = useState(false);
  const [roomError, setRoomError] = useState<string | null>(null);

  const design: Design | undefined =
    designs.find((d) => d.id === activeDesignId) || designs[0];

  if (!design) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="page-title">No design selected</h2>
        <p className="page-lede mx-auto">
          Save a curtain in the studio to inspect specs and stage it in a room.
        </p>
        <button type="button" onClick={() => setActiveView('editor')} className="btn btn-primary">
          Open studio
        </button>
      </div>
    );
  }

  const template = brandTemplates.find((t) => t.id === design.template_id);
  const isTemplateFromRealRoom = template?.source === 'user_upload' || Boolean(template?.real_photo_url);

  const roomPreviews = design.room_previews || [];
  const currentPreview = roomPreviews[selectedPreviewIndex] || roomPreviews[0];

  const modelConfig = getModelConfig(currentBrandId);

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleDownloadImage = () => {
    const src = activeTab === 'curtain' ? design.final_image_url : currentPreview?.output_url;
    if (!src) return;
    const link = document.createElement('a');
    link.href = src;
    link.download = `${design.name.toLowerCase().replace(/\s+/g, '-')}-${activeTab}.jpg`;
    link.click();
  };

  const handleGenerateRoomFromSource = async (
    roomSource: 'template_original' | 'uploaded',
    uploadedPhotoData?: string
  ) => {
    const roomPhoto =
      roomSource === 'template_original'
        ? template?.real_photo_url || template?.original_image_url
        : uploadedPhotoData;

    if (!roomPhoto) return;

    setIsGeneratingRoom(true);
    setRoomError(null);
    setIsRoomChooserOpen(false);

    try {
      const resp = await fetch('/api/room-visualize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomPhoto,
          designImage: design.final_image_url,
          brandId: currentBrandId,
          roomSource,
        }),
      });

      const data = await resp.json();

      if (!resp.ok || !data.success) {
        throw new Error(data.error || 'Room visualization failed');
      }

      const newPreview = addRoomPreview(design.id, {
        design_id: design.id,
        brand_id: currentBrandId,
        room_source: roomSource,
        room_photo_url: roomPhoto,
        output_url: data.outputUrl,
        provider_used: data.providerUsed || modelConfig.room_preview_provider,
      });

      setSelectedPreviewIndex(design.room_previews ? design.room_previews.length : 0);
      setActiveTab('room');
    } catch (err: any) {
      console.error('Room preview error:', err);
      setRoomError(err.message || 'Failed to render room preview');
    } finally {
      setIsGeneratingRoom(false);
    }
  };

  const handleUploadedRoomFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        handleGenerateRoomFromSource('uploaded', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="page-shell max-w-6xl space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <button
            type="button"
            onClick={() => setActiveView('editor')}
            className="btn btn-ghost btn-sm mb-2 -ml-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to studio
          </button>
          <h1 className="page-title">{design.name}</h1>
          <p className="page-lede">
            {design.template_name} · {design.assignments.length} zones
          </p>
        </div>

        <div className="segmented self-start">
          <button
            type="button"
            onClick={() => setActiveTab('curtain')}
            className={`segmented-item ${activeTab === 'curtain' ? 'is-active' : ''}`}
            aria-pressed={activeTab === 'curtain'}
          >
            Curtain
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('room');
              if (roomPreviews.length === 0) {
                setIsRoomChooserOpen(true);
              }
            }}
            className={`segmented-item ${activeTab === 'room' ? 'is-active' : ''}`}
            aria-pressed={activeTab === 'room'}
          >
            In room
            {roomPreviews.length > 0 && (
              <span className="ml-1 font-mono text-[10px] tabular-nums">{roomPreviews.length}</span>
            )}
          </button>
        </div>
      </div>

      {/* Error alert if room viz fails */}
      {roomError && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{roomError}</span>
          </div>
          <button
            onClick={() => setRoomError(null)}
            className="text-[11px] underline hover:no-underline ml-4 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Viewport Stage */}
      <div className="brand-card overflow-hidden bg-white p-4 sm:p-6 space-y-4">
        {/* TAB 1: Curtain Design View */}
        {activeTab === 'curtain' && (
          <div className="w-full flex flex-col items-center">
            <div className="media-frame relative aspect-[4/5] w-full max-w-2xl overflow-hidden rounded-[16px] bg-[var(--color-bg-sunken)]">
              <img
                src={design.final_image_url}
                alt={design.name}
                className="h-full w-full object-cover"
              />
              <div className="absolute top-3 left-3">
                <span className="badge badge-muted">Studio render</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: In Your Room View (Interactive Before/After Slider, Section 8.3 & 8.4) */}
        {activeTab === 'room' && (
          <div className="w-full space-y-4">
            {isGeneratingRoom ? (
              <div className="w-full h-96 rounded-2xl bg-[var(--color-bg-sunken)] flex flex-col items-center justify-center space-y-3 relative overflow-hidden">
                <div className="absolute inset-0 ai-generation-shimmer" />
                <Sparkles className="w-8 h-8 text-[var(--color-accent)] animate-spin" />
                <div className="text-xs font-semibold text-[var(--color-text-primary)] z-10">
                  Rendering lifestyle room preview with {modelConfig.room_preview_provider}...
                </div>
                <div className="text-[11px] text-[var(--color-text-secondary)] z-10">
                  Detecting window boundaries and harmonizing daylight shadows.
                </div>
              </div>
            ) : currentPreview ? (
              <div className="space-y-4">
                {/* Before/After Split Slider Stage */}
                <div
                  className="relative w-full max-w-4xl mx-auto aspect-[16/10] rounded-2xl overflow-hidden shadow-lg select-none cursor-ew-resize bg-neutral-100"
                  onMouseDown={() => setIsDraggingSlider(true)}
                  onMouseUp={() => setIsDraggingSlider(false)}
                  onMouseLeave={() => setIsDraggingSlider(false)}
                  onMouseMove={(e) => {
                    if (isDraggingSlider) {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
                      setSliderPos(Math.round((x / rect.width) * 100));
                    }
                  }}
                  onTouchMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const touch = e.touches[0];
                    const x = Math.max(0, Math.min(touch.clientX - rect.left, rect.width));
                    setSliderPos(Math.round((x / rect.width) * 100));
                  }}
                >
                  {/* Under layer: Plain Room Photo */}
                  <img
                    src={currentPreview.room_photo_url}
                    alt="Plain Room Photo"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-xs text-white text-[10px] font-mono">
                    PLAIN ROOM PHOTO
                  </div>

                  {/* Top layer: Rendered Room with Curtain (Clipped) */}
                  <div
                    className="absolute inset-0 overflow-hidden"
                    style={{ width: `${sliderPos}%` }}
                  >
                    <img
                      src={currentPreview.output_url}
                      alt="Room with Curtain Render"
                      className="absolute inset-0 w-full h-full object-cover max-w-none"
                      style={{ width: '100%', height: '100%' }}
                    />
                    <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full bg-[var(--color-accent)] text-white text-[10px] font-mono shadow-xs">
                      NEW CURTAIN APPLIED ({currentPreview.provider_used})
                    </div>
                  </div>

                  {/* Split Drag Divider Line */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-white shadow-xl pointer-events-none"
                    style={{ left: `${sliderPos}%` }}
                  >
                    <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center text-[var(--color-accent)] border border-[var(--color-border-subtle)] text-xs font-bold">
                      ↔
                    </div>
                  </div>
                </div>

                {/* Horizontal Room Thumbnail Strip + "+ Try another room" button (Section 8.4) */}
                <div className="flex items-center gap-3 pt-2 overflow-x-auto pb-1">
                  {roomPreviews.map((p, idx) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedPreviewIndex(idx)}
                      className={`relative w-24 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition cursor-pointer ${
                        selectedPreviewIndex === idx
                          ? 'border-[var(--color-accent)] ring-2 ring-[var(--color-accent)]/20 shadow-xs'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={p.output_url} alt="Thumbnail" className="w-full h-full object-cover" />
                      <div className="absolute bottom-1 right-1 px-1 rounded bg-black/60 text-[8px] font-mono text-white">
                        #{idx + 1}
                      </div>
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() => setIsRoomChooserOpen(true)}
                    className="h-16 px-4 rounded-xl border-2 border-dashed border-[var(--color-border-strong)] hover:border-[var(--color-accent)] text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] text-xs font-semibold flex items-center gap-2 shrink-0 transition cursor-pointer bg-[var(--color-bg-sunken)]"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Try another room</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Empty state if no room previews yet */
              <div className="w-full py-16 rounded-2xl bg-[var(--color-bg-sunken)] border border-[var(--color-border-subtle)] text-center space-y-3">
                <Sparkles className="w-8 h-8 text-[var(--color-accent)] mx-auto" />
                <h3 className="text-base font-display font-semibold text-[var(--color-text-primary)]">
                  Preview this curtain inside an authentic room
                </h3>
                <p className="text-xs text-[var(--color-text-secondary)] max-w-sm mx-auto">
                  Nano Banana Pro blends your finished drape onto customer window frames with realistic daylight shadows.
                </p>
                <button
                  type="button"
                  onClick={() => setIsRoomChooserOpen(true)}
                  className="mt-2 px-5 py-2.5 rounded-[var(--radius-button)] bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white text-xs font-semibold cursor-pointer shadow-xs tactile-press"
                >
                  Generate Room Preview
                </button>
              </div>
            )}
          </div>
        )}

        {/* PERSISTENT ACTION BAR PINNED UNDER BOTH TABS (Section 8.1) */}
        <div className="pt-4 border-t border-[var(--color-border-subtle)] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyShareLink}
              className="px-3.5 py-2 rounded-[var(--radius-button)] bg-white hover:bg-[var(--color-bg-sunken)] border border-[var(--color-border-strong)] text-xs font-semibold text-[var(--color-text-primary)] flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Link Copied!' : 'Copy Share Link'}</span>
            </button>

            {onOpenSpecSheet && (
              <button
                type="button"
                onClick={() => onOpenSpecSheet(design)}
                className="px-3.5 py-2 rounded-[var(--radius-button)] bg-white hover:bg-[var(--color-bg-sunken)] border border-[var(--color-border-strong)] text-xs font-semibold text-[var(--color-text-primary)] flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
              >
                <FileText className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                <span>Export Atelier Spec Sheet</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadImage}
              className="px-4 py-2 rounded-[var(--radius-button)] bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer tactile-press shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download High-Res ({activeTab === 'curtain' ? 'Curtain' : 'Room'})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Room Photo Source Chooser Modal (Section 8.2) */}
      {isRoomChooserOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="brand-card w-full max-w-md p-6 bg-white space-y-5">
            <div>
              <div className="eyebrow-label text-[var(--color-accent)] font-semibold">
                ROOM VISUALIZATION SOURCE
              </div>
              <h3 className="text-lg font-display font-semibold text-[var(--color-text-primary)]">
                Choose Room Setting
              </h3>
              <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                Select where to hang this curtain design.
              </p>
            </div>

            <div className="space-y-3">
              {/* Option 1: "Use this room" (Only shown if template is from real photo, Section 8.2) */}
              {isTemplateFromRealRoom && (
                <button
                  type="button"
                  onClick={() => handleGenerateRoomFromSource('template_original')}
                  className="w-full p-4 rounded-2xl border border-[var(--color-border-subtle)] hover:border-[var(--color-accent)] bg-[var(--color-bg-sunken)] hover:bg-white text-left transition cursor-pointer flex items-center gap-4 group"
                >
                  <div className="w-16 h-16 rounded-xl bg-neutral-200 overflow-hidden shrink-0 border border-[var(--color-border-subtle)]">
                    <img
                      src={template?.real_photo_url || template?.original_image_url}
                      alt="Original Room"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)]">
                      Use this room photo
                    </div>
                    <div className="text-[11px] text-[var(--color-text-secondary)] mt-0.5">
                      Reuses the original window setting from this template photo.
                    </div>
                  </div>
                </button>
              )}

              {/* Option 2: "Upload a room photo" (Always available) */}
              <div>
                <input
                  type="file"
                  accept="image/*"
                  id="fresh-room-upload"
                  className="hidden"
                  onChange={handleUploadedRoomFile}
                />
                <label
                  htmlFor="fresh-room-upload"
                  className="w-full p-4 rounded-2xl border border-[var(--color-border-subtle)] hover:border-[var(--color-accent)] bg-[var(--color-bg-sunken)] hover:bg-white text-left transition cursor-pointer flex items-center gap-4 group block"
                >
                  <div className="w-16 h-16 rounded-xl bg-[var(--color-accent-tint)] text-[var(--color-accent)] flex items-center justify-center shrink-0">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)]">
                      Upload a customer room photo
                    </div>
                    <div className="text-[11px] text-[var(--color-text-secondary)] mt-0.5">
                      Take or upload a photo of the client's actual living room or bedroom.
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setIsRoomChooserOpen(false)}
                className="px-4 py-2 text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
