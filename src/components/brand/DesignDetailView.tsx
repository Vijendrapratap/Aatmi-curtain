// src/components/brand/DesignDetailView.tsx
// A saved design: its render, room stagings, and sharing options.
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Share2, Download, Check, Sparkles, Plus, Upload, ArrowLeft, FileText, AlertCircle, Image as ImageIcon, X } from 'lucide-react';
import { useBrandStore } from '../../lib/brandStore';
import { useStudioStore } from '../../lib/store';
import { Design } from '../../types/brand';
import { deriveJourney, JourneyStepId } from '../../lib/journey';
import { buildFabricSwapInput, startRender, pollRender, STAGE_COPY, RenderJobView, toDataUrl } from '../../lib/renderClient';
import { JourneyStrip } from '../JourneyStrip';

interface DesignDetailViewProps {
  onOpenSpecSheet: () => void;
}

type RoomSource = 'template_original' | 'uploaded';

export const DesignDetailView: React.FC<DesignDetailViewProps> = ({ onOpenSpecSheet }) => {
  const { designs, activeDesignId, setActiveDesignId, brandTemplates, brandFabrics, currentBrandId, addRoomPreview, updateDesign, setActiveView } = useBrandStore();
  const { loadAssignments } = useStudioStore();

  const brandDesigns = designs.filter((d) => d.brand_id === currentBrandId);
  const design: Design | undefined = brandDesigns.find((d) => d.id === activeDesignId) || brandDesigns[0];

  const [copied, setCopied] = useState(false);
  const [selectedPreviewIndex, setSelectedPreviewIndex] = useState(0);
  const [sliderPos, setSliderPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  const [activeJob, setActiveJob] = useState<RenderJobView | null>(null);
  const [error, setError] = useState<string | null>(null);

  const template = useMemo(() => brandTemplates.find((t) => t.id === design?.template_id), [brandTemplates, design?.template_id]);
  const fabrics = useMemo(() => brandFabrics.filter((f) => f.brand_id === currentBrandId || !f.brand_id), [brandFabrics, currentBrandId]);

  // A render or staging still in flight belongs to the design we just left.
  const jobAbortRef = useRef<AbortController | null>(null);
  useEffect(() => {
    return () => jobAbortRef.current?.abort();
  }, [design?.id]);

  if (!design) {
    return (
      <div className="page-shell max-w-3xl space-y-4 text-center">
        <p className="eyebrow-label">Designs</p>
        <h1 className="page-title">No saved designs yet</h1>
        <p className="page-lede mx-auto">Pick a curtain style, choose fabrics for its zones, and save. Your designs will appear here.</p>
        <button type="button" onClick={() => setActiveView('editor')} className="btn btn-primary">Open Generate</button>
      </div>
    );
  }

  const roomPreviews = design.room_previews || [];
  const currentPreview = roomPreviews[selectedPreviewIndex] || roomPreviews[0];
  const steps = deriveJourney({ page: 'design', zoneCount: design.assignments.length, assignedCount: design.assignments.length, hasPhotoreal: design.render_kind === 'photoreal', roomPreviewCount: roomPreviews.length });

  const goToStudio = () => {
    loadAssignments(design.template_id, design.assignments);
    setActiveView('editor');
  };

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const onStepClick = (id: JourneyStepId) => {
    if (id === 'style' || id === 'fabrics') goToStudio();
    else scrollTo(`design-${id}`);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Could not copy the link. Copy it from the address bar instead.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const download = (src: string, suffix: string) => {
    const a = document.createElement('a');
    a.href = src;
    a.download = `${design.name.toLowerCase().replace(/\s+/g, '-')}-${suffix}.png`;
    a.click();
  };

  const handlePhotoreal = async () => {
    if (!template) return;
    jobAbortRef.current?.abort();
    const controller = new AbortController();
    jobAbortRef.current = controller;
    setIsRendering(true);
    setError(null);
    setActiveJob(null);
    try {
      const body = await buildFabricSwapInput(template, design.assignments, fabrics, currentBrandId);
      const job = await pollRender(await startRender(body), setActiveJob, { signal: controller.signal });
      if (job.status === 'failed') throw new Error(job.error || 'Render did not finish');
      if (job.result) updateDesign(design.id, { final_image_url: job.result.finalImage, render_kind: 'photoreal', render_candidates: job.candidates, render_prompt: job.result.prompt });
      if (job.status === 'needs_review') setError('No render option passed the quality check. The best one was kept; rerun if it is not right.');
    } catch (err: any) {
      // Cancelled means the user moved on; nothing to report.
      if (err?.code !== 'CANCELLED') setError(`Render did not finish: ${err.message || 'unknown error'}.`);
    } finally {
      setIsRendering(false);
      setActiveJob(null);
    }
  };

  const sectionHeader = (id: string, step: string, title: string, lede: string) => (
    <div id={id} className="scroll-mt-24">
      <p className="eyebrow-label">{step}</p>
      <h2 className="mt-0.5 font-display text-[20px] font-semibold">{title}</h2>
      <p className="mt-1 text-[13px] text-[var(--color-text-secondary)]">{lede}</p>
    </div>
  );

  return (
    <div className="page-shell max-w-6xl space-y-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <button type="button" onClick={goToStudio} className="btn btn-ghost btn-sm -ml-2"><ArrowLeft className="h-3.5 w-3.5" /> Edit in Generate</button>
            {brandDesigns.length > 1 && (
              <select aria-label="Switch design" value={design.id} onChange={(e) => { setActiveDesignId(e.target.value); setSelectedPreviewIndex(0); }} className="field h-8 w-auto text-[12px]">
                {brandDesigns.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            )}
          </div>
          <h1 className="page-title">{design.name}</h1>
          <p className="page-lede">{design.template_name} · {design.assignments.length} zones · saved {new Date(design.created_at).toLocaleDateString()}</p>
        </div>
        <div className="w-full lg:max-w-[640px]"><JourneyStrip steps={steps} onStepClick={onStepClick} /></div>
      </div>

      {error && (
        <div role="alert" className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-[13px] text-red-900">
          <span className="flex items-center gap-2"><AlertCircle className="h-4 w-4 shrink-0 text-red-600" />{error}</span>
          <button type="button" onClick={() => setError(null)} className="btn btn-ghost btn-sm">Dismiss</button>
        </div>
      )}

      {/* Step 3: Render */}
      <section className="brand-card space-y-4 p-5 sm:p-6">
        {sectionHeader('design-render', 'Step 3', 'Render', design.render_kind === 'photoreal' ? 'Rendered from your fabric choices and checked for quality.' : 'Not rendered yet. Render it for the client-ready image.')}
        <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_260px]">
          <div className="media-frame relative mx-auto aspect-[4/5] w-full max-w-lg rounded-[16px]">
            <img src={design.final_image_url} alt={design.name} className="h-full w-full object-cover" />
            <span className="badge badge-muted absolute top-3 left-3">{design.render_kind === 'photoreal' ? 'Rendered' : 'Not rendered'}</span>
            {isRendering && <div className="ai-generation-shimmer pointer-events-none absolute inset-0" />}
          </div>
          <div className="space-y-3">
            <div className="rounded-[14px] bg-[var(--color-bg-sunken)] p-3">
              <p className="eyebrow-label mb-2">Fabrics in this design</p>
              <ul className="space-y-1.5">
                {design.assignments.map((a) => {
                  const region = template?.regions.find((r) => r.id === a.region_id);
                  const fabric = fabrics.find((f) => f.id === a.fabric_id);
                  return (
                    <li key={a.region_id} className="flex items-center gap-2 text-[12px]">
                      {fabric && <img src={fabric.image_url} alt="" className="h-6 w-6 rounded-[6px] object-cover" />}
                      <span className="min-w-0 flex-1 truncate"><span className="font-semibold">{region?.display_name || 'Zone'}</span> · {fabric?.name || 'No fabric'}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
            <button type="button" disabled={isRendering || !template} title={template ? undefined : 'The curtain style for this design is no longer available'} onClick={handlePhotoreal} className="btn btn-primary btn-block">
              <Sparkles className={`h-3.5 w-3.5 ${isRendering ? 'animate-spin' : ''}`} />{isRendering ? (activeJob ? STAGE_COPY[activeJob.stage] : 'Starting…') : design.render_kind === 'photoreal' ? 'Rerun render' : 'Render'}
            </button>
            <p className="text-[11px] text-[var(--color-text-tertiary)]">Uses 1 monthly render · about a minute.</p>
          </div>
        </div>
      </section>

      {/* Step 4: Room */}
      <section className="brand-card space-y-4 p-5 sm:p-6">
        {sectionHeader('design-room', 'Step 4', 'Room', 'See this curtain in a customer\'s room. The room stays as photographed; you can also change the light.')}

        {currentPreview ? (
          <div className="space-y-3">
            <div
              className="relative mx-auto aspect-[16/10] w-full max-w-4xl cursor-ew-resize touch-none overflow-hidden rounded-2xl bg-neutral-100 shadow-lg select-none"
              onMouseDown={() => setIsDragging(true)}
              onMouseUp={() => setIsDragging(false)}
              onMouseLeave={() => setIsDragging(false)}
              onMouseMove={(e) => { if (!isDragging) return; const r = e.currentTarget.getBoundingClientRect(); setSliderPos(Math.round((Math.max(0, Math.min(e.clientX - r.left, r.width)) / r.width) * 100)); }}
              onTouchMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); const t = e.touches[0]; setSliderPos(Math.round((Math.max(0, Math.min(t.clientX - r.left, r.width)) / r.width) * 100)); }}
            >
              <img src={currentPreview.room_photo_url} alt="Room before" className="absolute inset-0 h-full w-full object-cover" />
              <span className="absolute right-3 bottom-3 rounded-full bg-black/70 px-2.5 py-1 text-[11px] font-semibold text-white">Before</span>
              <div className="absolute inset-0 overflow-hidden" style={{ width: `${sliderPos}%` }}>
                <img src={currentPreview.output_url} alt="Room with curtain" className="absolute inset-0 h-full w-full max-w-none object-cover" style={{ width: '100%', height: '100%' }} />
                <span className="absolute bottom-3 left-3 rounded-full bg-[var(--color-accent)] px-2.5 py-1 text-[11px] font-semibold text-white">With your curtain</span>
              </div>
              <div className="pointer-events-none absolute top-0 bottom-0 w-0.5 bg-white shadow-xl" style={{ left: `${sliderPos}%` }}>
                <div className="absolute top-1/2 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--color-border-subtle)] bg-white text-xs font-bold text-[var(--color-accent)] shadow-lg">↔</div>
              </div>
            </div>
            <p className="text-center text-[12px] text-[var(--color-text-tertiary)]">Drag the handle to compare before and after.</p>
            <div className="flex items-center gap-3 overflow-x-auto pb-1">
              {roomPreviews.map((p, idx) => (
                <button key={p.id} type="button" onClick={() => setSelectedPreviewIndex(idx)} className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-xl border-2 ${selectedPreviewIndex === idx ? 'border-[var(--color-accent)]' : 'border-transparent opacity-70 hover:opacity-100'}`}>
                  <img src={p.output_url} alt={`Room ${idx + 1}`} className="h-full w-full object-cover" />
                </button>
              ))}
              <button type="button" onClick={() => setActiveView('room')} className="flex h-16 shrink-0 items-center gap-2 rounded-xl border-2 border-dashed border-[var(--color-border-strong)] bg-[var(--color-bg-sunken)] px-4 text-[12px] font-semibold text-[var(--color-text-secondary)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]">
                <Plus className="h-4 w-4" /> Place in another room
              </button>
            </div>
          </div>
        ) : (
          <button type="button" onClick={() => setActiveView('room')} className="brand-card brand-card-interactive flex items-center gap-4 p-4 text-left">
            <span className="icon-tile icon-tile-lg shrink-0"><Upload className="h-6 w-6" /></span>
            <span>
              <span className="block text-[14px] font-semibold">Place in a room</span>
              <span className="block text-[12px] text-[var(--color-text-secondary)]">Add a room photo, pick daylight or evening light, and see this curtain on the window.</span>
            </span>
          </button>
        )}
      </section>

      {/* Step 5: Share */}
      <section className="brand-card space-y-4 p-5 sm:p-6">
        {sectionHeader('design-share', 'Step 5', 'Share', 'Send the design to a client or hand it to the workroom.')}
        <div className="grid gap-3 sm:grid-cols-3">
          <button type="button" onClick={handleCopy} className="brand-card brand-card-interactive flex flex-col items-start gap-2 p-4 text-left">
            {copied ? <Check className="h-5 w-5 text-emerald-600" /> : <Share2 className="h-5 w-5 text-[var(--color-accent)]" />}
            <span className="text-[14px] font-semibold">{copied ? 'Link copied' : 'Copy link'}</span>
            <span className="text-[12px] text-[var(--color-text-secondary)]">Share a link to this design page.</span>
          </button>
          <div className="brand-card flex flex-col items-start gap-2 p-4">
            <Download className="h-5 w-5 text-[var(--color-accent)]" />
            <span className="text-[14px] font-semibold">Download image</span>
            <span className="text-[12px] text-[var(--color-text-secondary)]">Full-size image for email or a deck.</span>
            <div className="mt-1 flex flex-wrap gap-1.5">
              <button type="button" onClick={() => download(design.final_image_url, 'curtain')} className="btn btn-secondary btn-sm"><ImageIcon className="h-3.5 w-3.5" /> Curtain</button>
              {currentPreview && <button type="button" onClick={() => download(currentPreview.output_url, 'room')} className="btn btn-secondary btn-sm"><ImageIcon className="h-3.5 w-3.5" /> Room</button>}
            </div>
          </div>
          <button type="button" onClick={onOpenSpecSheet} className="brand-card brand-card-interactive flex flex-col items-start gap-2 p-4 text-left">
            <FileText className="h-5 w-5 text-[var(--color-accent)]" />
            <span className="text-[14px] font-semibold">Spec sheet</span>
            <span className="text-[12px] text-[var(--color-text-secondary)]">Printable fabric list and yardage for the workroom.</span>
          </button>
        </div>
      </section>


    </div>
  );
};
