// src/components/brand/TemplateEditor.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useBrandStore } from '../../lib/brandStore';
import { useStudioStore } from '../../lib/store';
import { CurtainTemplate } from '../../types/curtain';
import { generateSequentialRedesign } from '../../utils/maskedPipeline';
import { renderCurtainOnCanvas, getTemplateRealPhotoUrl } from '../../utils/fabricRenderer';
import { FabricPickerSheet } from './FabricPickerSheet';
import {
  Sparkles,
  Layers,
  Check,
  CheckCircle2,
  ChevronDown,
} from 'lucide-react';

interface TemplateEditorProps {
  onOpenSpecModal?: () => void;
}

export const TemplateEditor: React.FC<TemplateEditorProps> = ({ onOpenSpecModal: _onOpenSpecModal }) => {
  const {
    brandTemplates,
    brandFabrics,
    currentBrandId,
    getModelConfig,
    saveDesign,
    setActiveDesignId,
    setActiveView,
  } = useBrandStore();

  const {
    selectedTemplateId,
    selectTemplate,
    assignments,
    assignFabricToRegion,
  } = useStudioStore();

  const templates = useMemo(
    () => brandTemplates.filter((t) => t.brand_id === currentBrandId || !t.brand_id),
    [brandTemplates, currentBrandId]
  );

  const currentTemplate: CurtainTemplate =
    templates.find((t) => t.id === selectedTemplateId) || templates[0];

  const scopedFabrics = useMemo(
    () => brandFabrics.filter((f) => f.brand_id === currentBrandId || !f.brand_id),
    [brandFabrics, currentBrandId]
  );

  const [activeRegionId, setActiveRegionId] = useState<string | null>(
    currentTemplate?.regions[0]?.id || null
  );
  const [hoveredRegionId, setHoveredRegionId] = useState<string | null>(null);
  const [isPickerSheetOpen, setIsPickerSheetOpen] = useState(false);

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStepText, setGenerationStepText] = useState('');
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [canvasDataUrl, setCanvasDataUrl] = useState<string>('');
  const [hasCanvasFrame, setHasCanvasFrame] = useState(false);
  const [generationNotice, setGenerationNotice] = useState<{
    type: 'success' | 'warning' | 'info';
    text: string;
  } | null>(null);

  const [isFinalizeModalOpen, setIsFinalizeModalOpen] = useState(false);
  const [designName, setDesignName] = useState(
    `${currentTemplate?.name || 'Curtain'} · ${new Date().toLocaleDateString()}`
  );

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const offscreenRef = useRef<HTMLCanvasElement | null>(null);
  const renderSeq = useRef(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const templateId = currentTemplate?.id;

  useEffect(() => {
    if (!currentTemplate) return;
    setActiveRegionId((current) =>
      currentTemplate.regions.some((r) => r.id === current)
        ? current
        : currentTemplate.regions[0]?.id || null
    );
    setGeneratedImageUrl(null);
    setHasCanvasFrame(false);
    setDesignName(`${currentTemplate.name} · ${new Date().toLocaleDateString()}`);
  }, [templateId]);

  // Render the drape offscreen, then blit in one frame so the visible canvas never blanks.
  useEffect(() => {
    if (!currentTemplate) return;
    const seq = ++renderSeq.current;
    let cancelled = false;

    const run = async () => {
      if (!offscreenRef.current) {
        offscreenRef.current = document.createElement('canvas');
      }
      const offscreen = offscreenRef.current;

      try {
        const dataUrl = await renderCurtainOnCanvas(
          offscreen,
          currentTemplate,
          assignments,
          scopedFabrics,
          { width: 800, height: 1000 }
        );
        if (cancelled || seq !== renderSeq.current) return;

        const visible = canvasRef.current;
        if (!visible) return;
        const ctx = visible.getContext('2d');
        if (!ctx) return;

        if (visible.width !== offscreen.width) visible.width = offscreen.width;
        if (visible.height !== offscreen.height) visible.height = offscreen.height;
        ctx.drawImage(offscreen, 0, 0);

        setHasCanvasFrame(true);
        setCanvasDataUrl((prev) => (prev === dataUrl ? prev : dataUrl));
      } catch (e) {
        console.error('Canvas render error:', e);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [currentTemplate, assignments, scopedFabrics]);

  const plateUrl = useMemo(
    () => (currentTemplate ? getTemplateRealPhotoUrl(currentTemplate, 800, 1000) : ''),
    [currentTemplate?.id]
  );

  const isCompactPicker = () =>
    typeof window !== 'undefined' && window.matchMedia('(max-width: 1023px)').matches;

  const handleSelectRegion = (regionId: string) => {
    setActiveRegionId(regionId);
    if (isCompactPicker()) setIsPickerSheetOpen(true);
  };

  const handleAssignFabric = useCallback(
    (fabricId: string) => {
      if (!activeRegionId) return;
      assignFabricToRegion(activeRegionId, fabricId);
      setGeneratedImageUrl(null);
    },
    [activeRegionId, assignFabricToRegion]
  );

  const handleTriggerAiGeneration = async () => {
    setIsGenerating(true);
    setGenerationNotice(null);
    setGeneratedImageUrl(null);

    try {
      const result = await generateSequentialRedesign({
        template: currentTemplate,
        assignments,
        fabrics: scopedFabrics,
        onStep: (stepMsg) => {
          setGenerationStepText(stepMsg);
        },
        callEdit: (payload) =>
          fetch('/api/generate-curtain-fabric', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...payload,
              brandId: currentBrandId,
              provider: getModelConfig(currentBrandId).region_edit_provider,
            }),
          }).then((r) => r.json()),
      });

      if (result && result.imageUrl) {
        setGeneratedImageUrl(result.imageUrl);
        setGenerationNotice({
          type: 'success',
          text: 'Photoreal render is ready.',
        });
      }
    } catch (err: any) {
      setGenerationNotice({
        type: 'info',
        text: err.message || 'Showing the studio canvas preview.',
      });
      setGeneratedImageUrl(canvasDataUrl || null);
    } finally {
      setIsGenerating(false);
      setGenerationStepText('');
    }
  };

  const handleConfirmFinalize = () => {
    const finalUrl = generatedImageUrl || canvasDataUrl || currentTemplate.original_image_url;

    const newDesign = saveDesign({
      brand_id: currentBrandId,
      template_id: currentTemplate.id,
      template_name: currentTemplate.name,
      name: designName || `${currentTemplate.name} Design`,
      assignments,
      final_image_url: finalUrl,
      created_by_user_id: 'usr-current',
      room_previews: [],
    });

    setIsFinalizeModalOpen(false);
    setActiveDesignId(newDesign.id);
    setActiveView('design_detail');
  };

  if (!currentTemplate) {
    return (
      <div className="studio-shell items-start justify-center">
        <div className="brand-card max-w-md p-6">
          <p className="eyebrow-label">Studio</p>
          <h1 className="page-title mt-1">No template yet</h1>
          <p className="page-lede">Add a silhouette before assigning fabrics.</p>
          <button type="button" className="btn btn-primary mt-4" onClick={() => setActiveView('templates')}>
            Browse templates
          </button>
        </div>
      </div>
    );
  }

  const activeRegion = currentTemplate.regions.find((r) => r.id === activeRegionId) || null;
  const activeAssignment = assignments.find((a) => a.region_id === activeRegionId);
  const mappedCount = currentTemplate.regions.filter((r) =>
    assignments.some((a) => a.region_id === r.id)
  ).length;

  return (
    <div className="studio-shell gap-4">
      <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
        <div className="min-w-0">
          <p className="eyebrow-label">Studio</p>
          <div className="relative mt-1 max-w-xl">
            <select
              aria-label="Curtain template"
              value={currentTemplate.id}
              onChange={(e) => selectTemplate(e.target.value)}
              className="w-full cursor-pointer appearance-none bg-transparent py-0.5 pr-7 font-display text-[1.35rem] font-semibold tracking-tight text-[var(--color-text-primary)] outline-none"
            >
              {templates.map((tpl) => (
                <option key={tpl.id} value={tpl.id}>
                  {tpl.name}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute top-1/2 right-0 h-4 w-4 -translate-y-1/2 text-[var(--color-text-tertiary)]" />
          </div>
          <p className="mt-1 text-[13px] text-[var(--color-text-secondary)]">
            {mappedCount}/{currentTemplate.regions.length} zones mapped
            {activeRegion ? ` · ${activeRegion.display_name}` : ''}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start">
          <button
            type="button"
            disabled={isGenerating}
            onClick={handleTriggerAiGeneration}
            className="btn btn-primary"
          >
            <Sparkles className={`h-3.5 w-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            {isGenerating ? generationStepText || 'Generating' : 'Generate'}
          </button>
          <button type="button" onClick={() => setIsFinalizeModalOpen(true)} className="btn btn-secondary">
            <Check className="h-3.5 w-3.5" />
            Save design
          </button>
        </div>
      </div>

      {generationNotice && (
        <div
          className={`flex items-center justify-between rounded-[14px] px-4 py-3 text-[13px] ${
            generationNotice.type === 'success'
              ? 'bg-[rgba(44,154,106,0.1)] text-[#1F6B48]'
              : 'bg-[var(--color-premium-soft)] text-[#6B5420]'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{generationNotice.text}</span>
          </div>
          <button type="button" onClick={() => setGenerationNotice(null)} className="btn btn-ghost btn-sm">
            Dismiss
          </button>
        </div>
      )}

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-hidden lg:grid-cols-[260px_minmax(0,1fr)_300px]">
        <aside className="flex min-h-0 flex-col overflow-hidden rounded-[18px] bg-[var(--color-bg-surface)] p-3 shadow-[var(--shadow-card)]">
          <div className="mb-2 flex items-center justify-between px-1 py-1">
            <span className="flex items-center gap-1.5 text-[13px] font-semibold">
              <Layers className="h-3.5 w-3.5 text-[var(--color-accent)]" />
              Zones
            </span>
            <span className="font-mono text-[11px] text-[var(--color-text-tertiary)] tabular-nums">
              {mappedCount}/{currentTemplate.regions.length}
            </span>
          </div>
          <div className="min-h-0 flex-1 space-y-1 overflow-y-auto pr-0.5">
            {currentTemplate.regions.map((region) => {
              const isSelected = region.id === activeRegionId;
              const assignment = assignments.find((a) => a.region_id === region.id);
              const assignedFabric = scopedFabrics.find((f) => f.id === assignment?.fabric_id);

              return (
                <button
                  key={region.id}
                  type="button"
                  onClick={() => handleSelectRegion(region.id)}
                  className={`flex w-full items-center gap-2.5 rounded-[12px] px-2 py-2 text-left transition-colors ${
                    isSelected
                      ? 'bg-[var(--color-accent-tint)]'
                      : 'hover:bg-[var(--color-bg-sunken)]'
                  }`}
                >
                  {assignedFabric ? (
                    <img
                      src={assignedFabric.image_url}
                      alt=""
                      className="h-9 w-9 shrink-0 rounded-[8px] object-cover shadow-[var(--shadow-ring)]"
                    />
                  ) : (
                    <span
                      className="h-9 w-9 shrink-0 rounded-[8px]"
                      style={{ backgroundColor: region.default_color || '#DDD6C7' }}
                    />
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-semibold">{region.display_name}</span>
                    <span className="block truncate text-[11px] text-[var(--color-text-tertiary)]">
                      {assignedFabric ? assignedFabric.name : 'Unassigned'}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        <section className="relative flex min-h-[420px] min-w-0 items-center justify-center overflow-hidden rounded-[18px] bg-[var(--color-bg-sunken)] p-4 shadow-[var(--shadow-card)] lg:min-h-0">
          <div
            ref={containerRef}
            className="studio-stage media-frame overflow-hidden rounded-[16px] bg-[var(--color-bg-surface)]"
          >
            {plateUrl && !hasCanvasFrame && !generatedImageUrl && (
              <img src={plateUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
            )}

            <canvas
              ref={canvasRef}
              width={800}
              height={1000}
              className={`relative h-full w-full object-contain ${generatedImageUrl ? 'hidden' : 'block'}`}
            />

            {generatedImageUrl && (
              <img
                src={generatedImageUrl}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
              />
            )}

            <svg
              className="absolute inset-0 h-full w-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              {currentTemplate.regions.map((region) => {
                const isSelected = region.id === activeRegionId;
                const isHovered = region.id === hoveredRegionId;
                const points = region.polygon_coords.map((p) => `${p.x},${p.y}`).join(' ');

                return (
                  <polygon
                    key={region.id}
                    points={points}
                    onClick={() => handleSelectRegion(region.id)}
                    onMouseEnter={() => setHoveredRegionId(region.id)}
                    onMouseLeave={() => setHoveredRegionId(null)}
                    className="cursor-pointer"
                    fill={isSelected ? 'var(--color-accent)' : isHovered ? 'white' : 'transparent'}
                    fillOpacity={isSelected ? 0.08 : isHovered ? 0.12 : 0}
                    stroke={isSelected ? 'var(--color-accent)' : isHovered ? 'white' : 'transparent'}
                    strokeWidth={isSelected ? 0.7 : isHovered ? 0.45 : 0}
                    vectorEffect="non-scaling-stroke"
                  />
                );
              })}
            </svg>

            {isGenerating && (
              <div className="absolute inset-0 ai-generation-shimmer pointer-events-none" />
            )}

            <div className="absolute right-3 bottom-3 left-3 flex items-end justify-between gap-2">
              <span className="badge badge-muted">
                {generatedImageUrl ? 'Photoreal render' : 'Live preview'}
              </span>
              <button
                type="button"
                className="compact-only rounded-[8px] bg-[var(--color-bg-surface)] px-3 py-1.5 text-[12px] font-semibold shadow-[var(--shadow-ring)]"
                onClick={() => setIsPickerSheetOpen(true)}
              >
                Assign fabric
              </button>
            </div>
          </div>
        </section>

        <aside className="hidden min-h-0 overflow-hidden lg:flex">
          <FabricPickerSheet
            variant="dock"
            isOpen
            onClose={() => undefined}
            activeRegion={activeRegion}
            currentAssignedFabricId={activeAssignment?.fabric_id || null}
            onAssignFabric={handleAssignFabric}
          />
        </aside>
      </div>

      <div className="lg:hidden">
        <FabricPickerSheet
          variant="modal"
          isOpen={isPickerSheetOpen}
          onClose={() => setIsPickerSheetOpen(false)}
          activeRegion={activeRegion}
          currentAssignedFabricId={activeAssignment?.fabric_id || null}
          onAssignFabric={(fabricId) => {
            handleAssignFabric(fabricId);
            setIsPickerSheetOpen(false);
          }}
        />
      </div>

      {isFinalizeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1814]/45 p-4 backdrop-blur-sm">
          <div className="brand-card w-full max-w-md space-y-4 p-6">
            <div>
              <p className="eyebrow-label">Save</p>
              <h3 className="mt-1 font-display text-[20px] font-semibold">Save curtain design</h3>
              <p className="page-lede">
                Snapshot this assignment set for client presentation and room staging.
              </p>
            </div>
            <div>
              <label className="field-label">Design name</label>
              <input
                type="text"
                value={designName}
                onChange={(e) => setDesignName(e.target.value)}
                className="field"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-1">
              <button type="button" onClick={() => setIsFinalizeModalOpen(false)} className="btn btn-ghost">
                Cancel
              </button>
              <button type="button" onClick={handleConfirmFinalize} className="btn btn-primary">
                Save and open room
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
