// src/components/brand/TemplateEditor.tsx
// The Studio: pick a curtain style, dress each zone with a fabric, then save.
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Sparkles, Layers, Check, ChevronDown, CircleDashed, CheckCircle2, ArrowRight, Info } from 'lucide-react';
import { useBrandStore } from '../../lib/brandStore';
import { useStudioStore } from '../../lib/store';
import { CurtainTemplate } from '../../types/curtain';
import { deriveJourney, JourneyStepId } from '../../lib/journey';
import { buildFabricSwapInput, startRender, pollRender, chooseCandidate, STAGE_COPY, RenderJobView } from '../../lib/renderClient';
import { renderCurtainOnCanvas, getTemplateRealPhotoUrl } from '../../utils/fabricRenderer';
import { JourneyStrip } from '../JourneyStrip';
import { FabricPickerSheet } from './FabricPickerSheet';
import { StylePickerModal } from './StylePickerModal';
import { ZoneChooser } from './ZoneChooser';

interface TemplateEditorProps {
  onOpenNewStyle: () => void;
}

export const TemplateEditor: React.FC<TemplateEditorProps> = ({ onOpenNewStyle }) => {
  const { brandTemplates, brandFabrics, currentBrandId, getModelConfig, saveDesign, setActiveDesignId, setActiveView } = useBrandStore();
  const { selectedTemplateId, selectTemplate, assignments, activeRegionId, setActiveRegionId, hoveredRegionId, setHoveredRegionId, assignFabricToRegion, assignFabricToAllRegions } = useStudioStore();

  const templates = useMemo(() => brandTemplates.filter((t) => t.brand_id === currentBrandId || !t.brand_id), [brandTemplates, currentBrandId]);
  const currentTemplate: CurtainTemplate | undefined = templates.find((t) => t.id === selectedTemplateId) || templates[0];
  const scopedFabrics = useMemo(() => brandFabrics.filter((f) => f.brand_id === currentBrandId || !f.brand_id), [brandFabrics, currentBrandId]);

  const [isStylePickerOpen, setIsStylePickerOpen] = useState(false);
  const [isZoneChooserOpen, setIsZoneChooserOpen] = useState(false);
  const [isPickerSheetOpen, setIsPickerSheetOpen] = useState(false);
  const [renderJob, setRenderJob] = useState<RenderJobView | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [chosenCandidateId, setChosenCandidateId] = useState<string | null>(null);
  const [isChoosing, setIsChoosing] = useState(false);
  const [canvasDataUrl, setCanvasDataUrl] = useState('');
  const [hasCanvasFrame, setHasCanvasFrame] = useState(false);
  const [status, setStatus] = useState<{ kind: 'ok' | 'info'; text: string } | null>(null);
  const [isSaveOpen, setIsSaveOpen] = useState(false);
  const [saveHint, setSaveHint] = useState<string | null>(null);
  const [designName, setDesignName] = useState('');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const offscreenRef = useRef<HTMLCanvasElement | null>(null);
  const renderSeq = useRef(0);
  const renderAbortRef = useRef<AbortController | null>(null);
  const zonesRailRef = useRef<HTMLDivElement | null>(null);

  const templateId = currentTemplate?.id;

  useEffect(() => {
    if (!currentTemplate) return;
    // A render still in flight belongs to the template we just left.
    renderAbortRef.current?.abort();
    setGeneratedImageUrl(null);
    setHasCanvasFrame(false);
    setStatus(null);
    setRenderJob(null);
    setChosenCandidateId(null);
    setDesignName(`${currentTemplate.name} · ${new Date().toLocaleDateString()}`);
  }, [templateId]);

  // If the store's template is not in this brand's list (brand switched), fall back to the first.
  useEffect(() => {
    if (currentTemplate && currentTemplate.id !== selectedTemplateId) selectTemplate(currentTemplate.id, templates);
  }, [currentTemplate?.id, selectedTemplateId]);

  useEffect(() => {
    if (!currentTemplate) return;
    const seq = ++renderSeq.current;
    let cancelled = false;
    const run = async () => {
      if (!offscreenRef.current) offscreenRef.current = document.createElement('canvas');
      const offscreen = offscreenRef.current;
      try {
        const dataUrl = await renderCurtainOnCanvas(offscreen, currentTemplate, assignments, scopedFabrics, { width: 800, height: 1000 });
        if (cancelled || seq !== renderSeq.current) return;
        const visible = canvasRef.current;
        const ctx = visible?.getContext('2d');
        if (!visible || !ctx) return;
        if (visible.width !== offscreen.width) visible.width = offscreen.width;
        if (visible.height !== offscreen.height) visible.height = offscreen.height;
        ctx.drawImage(offscreen, 0, 0);
        setHasCanvasFrame(true);
        setCanvasDataUrl((prev) => (prev === dataUrl ? prev : dataUrl));
      } catch (e) {
        console.error('Preview render error:', e);
      }
    };
    run();
    return () => { cancelled = true; };
  }, [currentTemplate, assignments, scopedFabrics]);

  const plateUrl = useMemo(() => (currentTemplate ? getTemplateRealPhotoUrl(currentTemplate, 800, 1000) : ''), [currentTemplate?.id]);

  const isCompact = () => typeof window !== 'undefined' && window.matchMedia('(max-width: 1023px)').matches;

  const handleSelectRegion = (regionId: string) => {
    setActiveRegionId(regionId);
    if (isCompact()) setIsPickerSheetOpen(true);
  };

  const handleAssignFabric = useCallback((fabricId: string) => {
    if (!activeRegionId) return;
    renderAbortRef.current?.abort();
    assignFabricToRegion(activeRegionId, fabricId);
    setGeneratedImageUrl(null);
    setRenderJob(null);
    setChosenCandidateId(null);
  }, [activeRegionId, assignFabricToRegion]);

  const safeRegions = currentTemplate?.regions ?? [];
  const handleAssignFabricTo = useCallback((target: string | 'all', fabricId: string) => {
    renderAbortRef.current?.abort();
    if (target === 'all') assignFabricToAllRegions(safeRegions.map((r) => r.id), fabricId);
    else assignFabricToRegion(target, fabricId);
    setGeneratedImageUrl(null);
    setRenderJob(null);
    setChosenCandidateId(null);
  }, [safeRegions, assignFabricToRegion, assignFabricToAllRegions]);

  const handleRender = async () => {
    if (!currentTemplate) return;
    if (assignments.length === 0) { setStatus({ kind: 'info', text: 'Choose a fabric for at least one zone before rendering.' }); return; }
    renderAbortRef.current?.abort();
    const controller = new AbortController();
    renderAbortRef.current = controller;
    setIsGenerating(true);
    setStatus(null);
    setGeneratedImageUrl(null);
    setRenderJob(null);
    try {
      const body = await buildFabricSwapInput(currentTemplate, assignments, scopedFabrics, currentBrandId);
      const jobId = await startRender(body);
      const job = await pollRender(jobId, setRenderJob, { signal: controller.signal });
      if (job.status === 'failed') {
        setStatus({ kind: 'info', text: job.error || 'The render did not finish.' });
      } else if (job.result) {
        setGeneratedImageUrl(job.result.finalImage);
        setChosenCandidateId(job.result.chosenId);
        setStatus(job.status === 'needs_review'
          ? { kind: 'info', text: 'No option passed the quality check. Showing the best one; accept it or rerun.' }
          : { kind: 'ok', text: 'Render ready. Save the design to keep it.' });
      }
    } catch (err: any) {
      // A cancelled render was abandoned on purpose; saying so would only confuse.
      if (err?.code !== 'CANCELLED') setStatus({ kind: 'info', text: err.message || 'The render did not finish.' });
    } finally {
      if (renderAbortRef.current === controller) setIsGenerating(false);
    }
  };

  const handleChooseCandidate = async (id: string) => {
    if (!renderJob || isChoosing || id === chosenCandidateId) return;
    setIsChoosing(true);
    try {
      // The server re-runs the pixel lock for this option; the raw candidate is not lock-safe.
      const job = await chooseCandidate(renderJob.id, id);
      setRenderJob(job);
      setChosenCandidateId(job.result?.chosenId ?? id);
      if (job.result) setGeneratedImageUrl(job.result.finalImage);
    } catch (err: any) {
      setStatus({ kind: 'info', text: err.message || 'Could not switch to that option.' });
    } finally {
      setIsChoosing(false);
    }
  };

  const handleConfirmSave = () => {
    if (!currentTemplate) return;
    const finalUrl = generatedImageUrl || canvasDataUrl || currentTemplate.original_image_url;
    const design = saveDesign({
      brand_id: currentBrandId,
      template_id: currentTemplate.id,
      template_name: currentTemplate.name,
      name: designName.trim() || `${currentTemplate.name} design`,
      assignments,
      final_image_url: finalUrl,
      render_kind: generatedImageUrl ? 'photoreal' : 'preview',
      created_by_user_id: 'usr-current',
      room_previews: [],
      render_candidates: renderJob?.candidates,
      render_prompt: renderJob?.result?.prompt,
    });
    setIsSaveOpen(false);
    setActiveDesignId(design.id);
    setActiveView('design_detail');
  };

  if (!currentTemplate) {
    return (
      <div className="studio-shell items-start justify-center">
        <div className="brand-card max-w-md p-6">
          <p className="eyebrow-label">Studio</p>
          <h1 className="page-title mt-1">No curtain style yet</h1>
          <p className="page-lede">Add a curtain style before choosing fabrics.</p>
          <button type="button" className="btn btn-primary mt-4" onClick={onOpenNewStyle}>Add a curtain style</button>
        </div>
      </div>
    );
  }

  const regions = currentTemplate.regions;
  const activeRegion = regions.find((r) => r.id === activeRegionId) || null;
  const activeAssignment = assignments.find((a) => a.region_id === activeRegionId);
  const assignedCount = regions.filter((r) => assignments.some((a) => a.region_id === r.id)).length;
  const firstUnassigned = regions.find((r) => !assignments.some((a) => a.region_id === r.id)) || null;
  const steps = deriveJourney({ page: 'studio', zoneCount: regions.length, assignedCount, hasPhotoreal: Boolean(generatedImageUrl), roomPreviewCount: 0 });

  const onStepClick = (id: JourneyStepId) => {
    if (id === 'style') setIsStylePickerOpen(true);
    else if (id === 'fabrics') {
      if (firstUnassigned) handleSelectRegion(firstUnassigned.id);
      zonesRailRef.current?.scrollIntoView({ block: 'nearest' });
    } else {
      setSaveHint('Save the design first. You can render, stage in a room, and share from the design page.');
      setIsSaveOpen(true);
    }
  };

  const zoneRow = (region: CurtainTemplate['regions'][number], asChip: boolean) => {
    const isSelected = region.id === activeRegionId;
    const assignment = assignments.find((a) => a.region_id === region.id);
    const fabric = scopedFabrics.find((f) => f.id === assignment?.fabric_id);
    const thumb = fabric ? (
      <img src={fabric.image_url} alt="" className={`${asChip ? 'h-6 w-6' : 'h-9 w-9'} shrink-0 rounded-[8px] object-cover shadow-[var(--shadow-ring)]`} />
    ) : (
      <span className={`${asChip ? 'h-6 w-6' : 'h-9 w-9'} shrink-0 rounded-[8px]`} style={{ backgroundColor: region.default_color || '#DDD6C7' }} />
    );
    if (asChip) {
      return (
        <button key={region.id} type="button" onClick={() => handleSelectRegion(region.id)} className={`zone-chip ${isSelected ? 'is-active' : ''}`}>
          {thumb}<span>{region.display_name}</span>
          {fabric ? <Check className="h-3.5 w-3.5 text-[var(--color-accent)]" /> : <CircleDashed className="h-3.5 w-3.5 text-[var(--color-text-tertiary)]" />}
        </button>
      );
    }
    return (
      <button
        key={region.id}
        type="button"
        onClick={() => handleSelectRegion(region.id)}
        onMouseEnter={() => setHoveredRegionId(region.id)}
        onMouseLeave={() => setHoveredRegionId(null)}
        aria-pressed={isSelected}
        className={`flex w-full items-center gap-2.5 rounded-[12px] px-2 py-2 text-left transition-colors ${isSelected ? 'bg-[var(--color-accent-tint)]' : 'hover:bg-[var(--color-bg-sunken)]'}`}
      >
        {thumb}
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] font-semibold">{region.display_name}</span>
          <span className={`block truncate text-[11px] ${fabric ? 'text-[var(--color-text-tertiary)]' : 'text-[var(--color-accent)]'}`}>{fabric ? fabric.name : 'Choose a fabric'}</span>
        </span>
        {fabric ? <CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--color-accent)]" /> : <CircleDashed className="h-4 w-4 shrink-0 text-[var(--color-text-disabled)]" />}
      </button>
    );
  };

  return (
    <div className="studio-shell gap-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <button
          type="button"
          onClick={() => setIsStylePickerOpen(true)}
          className="flex min-w-0 items-center gap-3 rounded-[14px] bg-[var(--color-bg-surface)] py-1.5 pr-3 pl-1.5 text-left shadow-[var(--shadow-ring)] transition-colors hover:bg-[var(--color-bg-sunken)]"
          title="Change curtain style"
        >
          <img src={currentTemplate.real_photo_url || currentTemplate.original_image_url} alt="" className="h-11 w-9 shrink-0 rounded-[8px] object-cover" />
          <span className="min-w-0">
            <span className="eyebrow-label block">Curtain style</span>
            <span className="flex items-center gap-1.5 font-display text-[17px] font-semibold leading-tight">
              <span className="truncate">{currentTemplate.name}</span>
              <ChevronDown className="h-4 w-4 shrink-0 text-[var(--color-text-tertiary)]" />
            </span>
          </span>
        </button>
        <div className="min-w-0 flex-1 lg:max-w-[720px]">
          <JourneyStrip steps={steps} onStepClick={onStepClick} />
        </div>
      </div>

      {status && (
        <p role="status" className={`flex items-center gap-2 px-1 text-[13px] ${status.kind === 'ok' ? 'text-[#1F6B48]' : 'text-[#6B5420]'}`}>
          <Info className="h-4 w-4 shrink-0" />{status.text}
        </p>
      )}

      {status && !isGenerating && renderJob?.status === 'needs_review' && (
        <div className="px-1">
          <ul className="space-y-1 text-[12px] text-[var(--color-text-secondary)]">
            {renderJob.candidates.find((c) => c.id === chosenCandidateId)?.scores.filter((s) => s.score < 6).map((s) => (
              <li key={s.key}>{s.key.replace(/_/g, ' ')}: {s.reason}</li>
            ))}
          </ul>
          <div className="mt-2 flex items-center gap-2">
            <button type="button" onClick={() => setStatus(null)} className="btn btn-secondary btn-sm">Accept</button>
            <button type="button" onClick={handleRender} className="btn btn-ghost btn-sm">Rerun render</button>
          </div>
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto pb-1 lg:hidden">{regions.map((r) => zoneRow(r, true))}</div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 overflow-hidden lg:grid-cols-[250px_minmax(0,1fr)_300px]">
        <aside ref={zonesRailRef} className="hidden min-h-0 flex-col overflow-hidden rounded-[18px] bg-[var(--color-bg-surface)] p-3 shadow-[var(--shadow-card)] lg:flex">
          <div className="mb-2 flex items-center justify-between px-1 py-1">
            <span className="flex items-center gap-1.5 text-[13px] font-semibold"><Layers className="h-3.5 w-3.5 text-[var(--color-accent)]" /> Zones</span>
            <span className="font-mono text-[11px] text-[var(--color-text-tertiary)] tabular-nums">{assignedCount}/{regions.length}</span>
          </div>
          <div className="min-h-0 flex-1 space-y-1 overflow-y-auto pr-0.5">{regions.map((r) => zoneRow(r, false))}</div>
          {firstUnassigned && (
            <button type="button" onClick={() => handleSelectRegion(firstUnassigned.id)} className="btn btn-ghost btn-sm mt-2 w-full justify-between">
              Next zone without a fabric <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
        </aside>

        <section className="relative flex min-h-[420px] min-w-0 items-center justify-center overflow-hidden rounded-[18px] bg-[var(--color-bg-sunken)] p-4 shadow-[var(--shadow-card)] lg:min-h-0">
          <div className="studio-stage media-frame overflow-hidden rounded-[16px] bg-[var(--color-bg-surface)]">
            {plateUrl && !hasCanvasFrame && !generatedImageUrl && <img src={plateUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />}
            <canvas ref={canvasRef} width={800} height={1000} className={`relative h-full w-full object-contain ${generatedImageUrl ? 'hidden' : 'block'} ${isGenerating ? 'opacity-60' : ''}`} />
            {generatedImageUrl && <img src={generatedImageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />}
            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              {regions.map((region) => {
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
                  >
                    <title>{region.display_name}</title>
                  </polygon>
                );
              })}
            </svg>
            {isGenerating && <div className="ai-generation-shimmer pointer-events-none absolute inset-0" />}
            <div className="absolute right-3 bottom-3 left-3 flex items-end justify-between gap-2">
              <span className="badge badge-muted" title={generatedImageUrl ? 'Made by the AI model from your fabrics and checked for quality. This is what clients see.' : 'Instant sketch drawn by the studio. Press Render for the client-ready image.'}>
                {generatedImageUrl ? (renderJob?.status === 'needs_review' ? 'Rendered · needs review' : 'Rendered') : 'Sketch'}
              </span>
              <button type="button" className="compact-only rounded-[8px] bg-[var(--color-bg-surface)] px-3 py-1.5 text-[12px] font-semibold shadow-[var(--shadow-ring)]" onClick={() => setIsPickerSheetOpen(true)}>
                {activeRegion ? `Fabric for ${activeRegion.display_name}` : 'Choose a fabric'}
              </button>
            </div>
            {isGenerating && renderJob && (
              <div className="absolute top-3 left-3 rounded-[10px] bg-[var(--color-bg-surface)]/90 px-3 py-2 text-[12px] font-semibold shadow-[var(--shadow-ring)]">
                {STAGE_COPY[renderJob.stage]}{renderJob.round > 1 ? ` · round ${renderJob.round}` : ''}
              </div>
            )}
          </div>
        </section>

        {renderJob?.result && renderJob.candidates.length > 1 && (
          <div className={`col-span-full flex items-center gap-2 overflow-x-auto px-1 lg:col-start-2 lg:col-end-3 ${isChoosing ? 'pointer-events-none opacity-60' : ''}`}>
            {renderJob.candidates.map((c) => (
              <button key={c.id} type="button" disabled={isChoosing} onClick={() => handleChooseCandidate(c.id)} title={c.scores.map((s) => `${s.key}: ${s.score} — ${s.reason}`).join('\n')} className={`relative h-20 w-16 shrink-0 overflow-hidden rounded-[10px] border-2 ${chosenCandidateId === c.id ? 'border-[var(--color-accent)]' : 'border-transparent opacity-70 hover:opacity-100'}`}>
                <img src={c.image} alt="" className="h-full w-full object-cover" />
                <span className={`absolute right-1 bottom-1 rounded-full px-1.5 text-[10px] font-semibold text-white ${c.passed ? 'bg-[#1F6B48]' : 'bg-[#6B5420]'}`}>{c.total}</span>
              </button>
            ))}
          </div>
        )}

        <aside className="hidden min-h-0 overflow-hidden lg:flex">
          <FabricPickerSheet
            variant="dock"
            isOpen
            onClose={() => undefined}
            activeRegion={activeRegion}
            regions={regions}
            assignments={assignments}
            fabrics={scopedFabrics}
            currentAssignedFabricId={activeAssignment?.fabric_id || null}
            onAssignFabric={handleAssignFabric}
            onAssignFabricTo={handleAssignFabricTo}
            onChangeZone={() => setIsZoneChooserOpen(true)}
          />
        </aside>
      </div>

      <div className="studio-actionbar">
        <span className="text-[13px] text-[var(--color-text-secondary)]">
          <strong className="font-semibold text-[var(--color-text-primary)] tabular-nums">{assignedCount} of {regions.length}</strong> zones have a fabric
          {firstUnassigned ? <> · next: <button type="button" className="font-semibold text-[var(--color-accent)]" onClick={() => handleSelectRegion(firstUnassigned.id)}>{firstUnassigned.display_name}</button></> : ' · ready to save'}
        </span>
        <div className="flex items-center gap-2">
          <button type="button" disabled={isGenerating} onClick={handleRender} className="btn btn-secondary flex-col items-start gap-0 py-1" style={{ height: 'auto', minHeight: 40 }}>
            <span className="flex items-center gap-2"><Sparkles className={`h-3.5 w-3.5 ${isGenerating ? 'animate-spin' : ''}`} />{isGenerating ? (renderJob ? STAGE_COPY[renderJob.stage] : 'Starting…') : renderJob?.status === 'needs_review' ? 'Rerun render' : 'Render'}</span>
            <span className="studio-action-note">Uses 1 monthly render · about a minute</span>
          </button>
          <button type="button" onClick={() => { setSaveHint(null); setIsSaveOpen(true); }} className="btn btn-primary">
            <Check className="h-3.5 w-3.5" /> Save design <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="lg:hidden">
        <FabricPickerSheet
          variant="modal"
          isOpen={isPickerSheetOpen}
          onClose={() => setIsPickerSheetOpen(false)}
          activeRegion={activeRegion}
          regions={regions}
          assignments={assignments}
          fabrics={scopedFabrics}
          currentAssignedFabricId={activeAssignment?.fabric_id || null}
          onAssignFabric={handleAssignFabric}
          onAssignFabricTo={handleAssignFabricTo}
          onChangeZone={() => { setIsPickerSheetOpen(false); setIsZoneChooserOpen(true); }}
        />
      </div>

      <ZoneChooser
        isOpen={isZoneChooserOpen}
        onClose={() => setIsZoneChooserOpen(false)}
        title="Which zone do you want to dress?"
        regions={regions}
        activeRegionId={activeRegionId}
        assignments={assignments}
        fabrics={scopedFabrics}
        onChoose={(target) => {
          if (target !== 'all') handleSelectRegion(target);
          setIsZoneChooserOpen(false);
        }}
      />

      <StylePickerModal
        isOpen={isStylePickerOpen}
        onClose={() => setIsStylePickerOpen(false)}
        onPick={(t) => selectTemplate(t.id, templates)}
        onAddStyle={() => { setIsStylePickerOpen(false); onOpenNewStyle(); }}
      />

      {isSaveOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1814]/45 p-4 backdrop-blur-sm">
          <div className="brand-card w-full max-w-md space-y-4 p-6">
            <div>
              <p className="eyebrow-label">Save</p>
              <h3 className="mt-1 font-display text-[20px] font-semibold">Save this design</h3>
              <p className="page-lede">{saveHint || 'Keeps the style and fabric choices together so you can render, stage it in a room, and share it.'}</p>
            </div>
            <div>
              <label className="field-label" htmlFor="design-name">Design name</label>
              <input id="design-name" type="text" value={designName} onChange={(e) => setDesignName(e.target.value)} className="field" />
            </div>
            {assignedCount < regions.length && (
              <p className="text-[12px] text-[#6B5420]">{regions.length - assignedCount} {regions.length - assignedCount === 1 ? 'zone has' : 'zones have'} no fabric yet. You can still save and come back.</p>
            )}
            <div className="flex items-center justify-end gap-2 pt-1">
              <button type="button" onClick={() => setIsSaveOpen(false)} className="btn btn-ghost">Cancel</button>
              <button type="button" onClick={handleConfirmSave} className="btn btn-primary">Save and continue <ArrowRight className="h-3.5 w-3.5" /></button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
