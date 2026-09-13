// src/components/brand/GeneratePage.tsx
// One screen: a curtain design in, fabrics for its areas in, a client-grade image out.
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Upload, Camera, Sparkles, Download, X, RefreshCw, Sofa, Check, Images, AlertCircle, Search } from 'lucide-react';
import { useBrandStore } from '../../lib/brandStore';
import { useStudioStore } from '../../lib/store';
import { CurtainTemplate, Fabric } from '../../types/curtain';
import { startRender, pollRender, chooseCandidate, toDataUrl, STAGE_COPY, RenderJobView } from '../../lib/renderClient';
import { CameraCaptureModal } from './CameraCaptureModal';
import { StylePickerModal } from './StylePickerModal';

interface Area {
  id: string;
  name: string;
  description: string;
  location: string;
  polygon: Array<{ x: number; y: number }>;
}

interface DesignInput {
  image: string; // data URL or app path
  name: string;
  areas: Area[];
  templateId?: string;
}

interface Generation {
  id: string;
  at: string;
  designId: string;
  design: DesignInput;
  slots: Record<string, Fabric | undefined>;
  job: RenderJobView;
  finalImage: string;
  roomPhoto?: string;
  roomImage?: string;
}

const MIN_WIDTH = 240; // below this the analyzer has nothing to work with
const GOOD_WIDTH = 1500;

const isPhotographic = (f: Fabric) => !f.image_url.startsWith('data:image/svg');

function probeWidth(src: string): Promise<number> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img.naturalWidth);
    img.onerror = () => resolve(0);
    img.src = src;
  });
}

function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = () => reject(new Error('Could not read the file'));
    r.readAsDataURL(file);
  });
}

function areasFromTemplate(t: CurtainTemplate): Area[] {
  return t.regions.map((r) => ({ id: r.id, name: r.display_name, description: r.description, location: r.location, polygon: r.polygon_coords }));
}

function centreOf(polygon: Array<{ x: number; y: number }>) {
  const xs = polygon.map((p) => p.x);
  const ys = polygon.map((p) => p.y);
  return { x: (Math.min(...xs) + Math.max(...xs)) / 2, y: (Math.min(...ys) + Math.max(...ys)) / 2 };
}

export const GeneratePage: React.FC = () => {
  const { brandTemplates, brandFabrics, currentBrandId, saveDesign, updateDesign, addRoomPreview, addBrandFabric, setActiveDesignId, setActiveView } = useBrandStore();
  const { selectedTemplateId } = useStudioStore();

  const fabrics = useMemo(() => brandFabrics.filter((f) => (f.brand_id === currentBrandId || !f.brand_id) && isPhotographic(f)), [brandFabrics, currentBrandId]);
  const templates = useMemo(() => brandTemplates.filter((t) => t.brand_id === currentBrandId || !t.brand_id), [brandTemplates, currentBrandId]);

  const [design, setDesign] = useState<DesignInput | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [slots, setSlots] = useState<Record<string, Fabric | undefined>>({});
  const [pickerFor, setPickerFor] = useState<string | null>(null);
  const [isStylePickerOpen, setIsStylePickerOpen] = useState(false);
  const [notice, setNotice] = useState<{ kind: 'info' | 'error'; text: string } | null>(null);

  const [job, setJob] = useState<RenderJobView | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isChoosing, setIsChoosing] = useState(false);
  const [isStaging, setIsStaging] = useState(false);
  const [current, setCurrent] = useState<Generation | null>(null);
  const [history, setHistory] = useState<Generation[]>([]);
  const [resultTab, setResultTab] = useState<'curtain' | 'room'>('curtain');
  const abortRef = useRef<AbortController | null>(null);

  const cancelJob = () => { abortRef.current?.abort(); abortRef.current = null; };
  useEffect(() => () => cancelJob(), []);

  // A style picked on Home or Library arrives through the studio store.
  useEffect(() => {
    if (design || !selectedTemplateId) return;
    const t = templates.find((x) => x.id === selectedTemplateId);
    if (t) loadTemplate(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTemplateId]);

  const [designWidth, setDesignWidth] = useState(0);
  const designTooSmall = designWidth > 0 && designWidth < MIN_WIDTH;

  const loadTemplate = async (t: CurtainTemplate) => {
    cancelJob();
    const image = t.real_photo_url || t.original_image_url;
    setDesign({ image, name: t.name, areas: areasFromTemplate(t), templateId: t.id });
    setSlots({});
    setJob(null);
    setCurrent(null);
    setNotice(null);
    const width = await probeWidth(image);
    setDesignWidth(width);
    if (width > 0 && width < MIN_WIDTH) setNotice({ kind: 'error', text: `"${t.name}" is only ${width} px wide, too small to generate from. Upload a larger photo of it instead.` });
    else if (width > 0 && width < GOOD_WIDTH) setNotice({ kind: 'info', text: `"${t.name}" is ${width} px wide. The result is still generated at full size, but a ${GOOD_WIDTH} px photo gives a sharper background.` });
  };

  const analyze = async (image: string, name: string) => {
    setIsAnalyzing(true);
    try {
      // Saved styles are app paths and phone photos can be odd formats; the analyzer needs a PNG/JPEG data URL.
      const raster = await toDataUrl(image);
      const res = await fetch('/api/analyze-curtain', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ imageBase64: raster, mimeType: raster.startsWith('data:image/jpeg') ? 'image/jpeg' : 'image/png' }) });
      const data = await res.json();
      const regions: any[] = Array.isArray(data.regions) ? data.regions : [];
      if (!res.ok || regions.length === 0) throw new Error(data.error || 'Could not find fabric areas in this image.');
      const areas: Area[] = regions.map((r, i) => ({
        id: `area-${i + 1}`,
        name: r.display_name || `Area ${i + 1}`,
        description: r.description || 'fabric area',
        location: r.location || '',
        polygon: Array.isArray(r.polygon_coords) && r.polygon_coords.length >= 3 ? r.polygon_coords : [{ x: 10, y: 5 + i * 30 }, { x: 90, y: 5 + i * 30 }, { x: 90, y: 30 + i * 30 }, { x: 10, y: 30 + i * 30 }],
      }));
      setDesign((d) => ({ image, name, areas, templateId: d?.image === image ? d.templateId : undefined }));
      setSlots({});
      setJob(null);
      setCurrent(null);
    } catch (err: any) {
      setNotice({ kind: 'error', text: err.message || 'Could not analyze the image.' });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDesignFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setNotice(null);
    const image = await readFile(file);
    const width = await probeWidth(image);
    if (width < MIN_WIDTH) {
      setNotice({ kind: 'error', text: `This image is only ${width} px wide, too small to find the fabric areas. Use a larger photo.` });
      return;
    }
    if (width < GOOD_WIDTH) setNotice({ kind: 'info', text: `This image is ${width} px wide. The result is still generated at full size, but ${GOOD_WIDTH} px or wider gives a sharper background.` });
    cancelJob();
    setDesignWidth(width);
    await analyze(image, file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
  };

  const handleFabricFile = async (e: React.ChangeEvent<HTMLInputElement>, areaId: string) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const image = await readFile(file);
    const fabric: Fabric = {
      id: `fab-upload-${Date.now()}`,
      brand_id: currentBrandId,
      name: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
      image_url: image,
      category: 'Custom',
      tileable: true,
      tags: ['upload'],
      visibility: 'session_only',
      source: 'custom',
      metadata: { weave: 'woven', scale: 'medium', sheen: 'Matte', weight: 'Medium', composition: 'Uploaded fabric photo' },
      color_hex: '#8a8a8a',
    };
    addBrandFabric(fabric);
    assignFabric(areaId, fabric);
    setPickerFor(null);
  };

  /** Mirrored panels come back from the analyzer with the same name; one choice dresses all of them. */
  const assignFabric = (areaId: string, fabric: Fabric) => {
    if (!design) return;
    const name = design.areas.find((a) => a.id === areaId)?.name;
    const ids = design.areas.filter((a) => a.id === areaId || (name && a.name === name)).map((a) => a.id);
    setSlots((s) => { const next = { ...s }; for (const id of ids) next[id] = fabric; return next; });
  };

  const changedAreas = design ? design.areas.filter((a) => slots[a.id]) : [];

  const handleGenerate = async () => {
    if (!design) return;
    if (changedAreas.length === 0) { setNotice({ kind: 'info', text: 'Choose a fabric for at least one area first.' }); return; }
    cancelJob();
    const controller = new AbortController();
    abortRef.current = controller;
    setIsGenerating(true);
    setNotice(null);
    setJob(null);
    setResultTab('curtain');
    try {
      const templatePhoto = await toDataUrl(design.image);
      const changes = [];
      for (const a of changedAreas) {
        const f = slots[a.id]!;
        changes.push({ regionId: a.id, fabricName: f.name, weave: f.metadata?.weave || 'woven', colorHex: f.color_hex, category: f.category, swatch: await toDataUrl(f.image_url) });
      }
      const body = {
        kind: 'fabric_swap' as const,
        brandId: currentBrandId,
        templateName: design.name,
        templatePhoto,
        zones: design.areas.map((a) => ({ id: a.id, display_name: a.name, description: a.description, location: a.location, polygon_coords: a.polygon })),
        changes,
      };
      const done = await pollRender(await startRender(body), setJob, { signal: controller.signal });
      if (done.status === 'failed' || !done.result) throw new Error(done.error || 'Generation did not finish.');
      const saved = saveDesign({
        brand_id: currentBrandId,
        template_id: design.templateId || `upload-${Date.now()}`,
        template_name: design.name,
        name: `${design.name} · ${changedAreas.map((a) => slots[a.id]!.name).join(', ')}`,
        assignments: changedAreas.map((a) => ({ region_id: a.id, fabric_id: slots[a.id]!.id, scale: 1, rotation: 0 })),
        final_image_url: done.result.finalImage,
        render_kind: 'photoreal',
        created_by_user_id: 'usr-current',
        room_previews: [],
        render_candidates: done.candidates,
        render_prompt: done.result.prompt,
      });
      const gen: Generation = { id: done.id, at: new Date().toISOString(), designId: saved.id, design, slots: { ...slots }, job: done, finalImage: done.result.finalImage };
      setCurrent(gen);
      setHistory((h) => [gen, ...h]);
      if (done.status === 'needs_review') setNotice({ kind: 'info', text: 'None of the three options passed every quality check. The best one is shown; try another variation or generate again.' });
    } catch (err: any) {
      if (err?.code !== 'CANCELLED') setNotice({ kind: 'error', text: err.message || 'Generation did not finish.' });
    } finally {
      setIsGenerating(false);
      abortRef.current = null;
    }
  };

  const handleChoose = async (candidateId: string) => {
    if (!current || isChoosing || candidateId === current.job.result?.chosenId) return;
    setIsChoosing(true);
    try {
      const updated = await chooseCandidate(current.job.id, candidateId);
      if (!updated.result) throw new Error('Could not switch to that variation.');
      const gen = { ...current, job: updated, finalImage: updated.result.finalImage };
      setCurrent(gen);
      setHistory((h) => h.map((g) => (g.id === gen.id ? gen : g)));
      updateDesign(current.designId, { final_image_url: updated.result.finalImage });
      setResultTab('curtain');
    } catch (err: any) {
      setNotice({ kind: 'error', text: err.message || 'Could not switch to that variation.' });
    } finally {
      setIsChoosing(false);
    }
  };

  const handleRoomFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !current) return;
    const roomPhoto = await readFile(file);
    cancelJob();
    const controller = new AbortController();
    abortRef.current = controller;
    setIsStaging(true);
    setNotice(null);
    setResultTab('room');
    try {
      const body = { kind: 'room_stage' as const, brandId: currentBrandId, roomPhoto: await toDataUrl(roomPhoto), curtainImage: await toDataUrl(current.finalImage) };
      const done = await pollRender(await startRender(body), setJob, { signal: controller.signal });
      if (done.status === 'failed' || !done.result) throw new Error(done.error || 'Room placement did not finish.');
      const gen = { ...current, roomPhoto, roomImage: done.result.finalImage };
      setCurrent(gen);
      setHistory((h) => h.map((g) => (g.id === gen.id ? gen : g)));
      addRoomPreview(current.designId, { design_id: current.designId, brand_id: currentBrandId, room_source: 'uploaded', room_photo_url: roomPhoto, output_url: done.result.finalImage, provider_used: 'render_agent', candidates: done.candidates });
    } catch (err: any) {
      if (err?.code !== 'CANCELLED') setNotice({ kind: 'error', text: err.message || 'Room placement did not finish.' });
      setResultTab('curtain');
    } finally {
      setIsStaging(false);
      abortRef.current = null;
    }
  };

  const download = (src: string, suffix: string) => {
    const a = document.createElement('a');
    a.href = src;
    a.download = `${(design?.name || 'curtain').toLowerCase().replace(/\s+/g, '-')}-${suffix}.png`;
    a.click();
  };

  const restore = (g: Generation) => {
    cancelJob();
    setDesign(g.design);
    setSlots(g.slots);
    setJob(g.job);
    setCurrent(g);
    setResultTab(g.roomImage ? 'room' : 'curtain');
    setNotice(null);
  };

  const busy = isGenerating || isStaging;
  const shownImage = resultTab === 'room' && current?.roomImage ? current.roomImage : current?.finalImage;
  const stageLine = job && busy ? `${STAGE_COPY[job.stage]}${job.round > 1 ? ` · round ${job.round}` : ''}` : busy ? 'Starting…' : '';

  return (
    <div className="page-shell space-y-5">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="eyebrow-label">Generate</p>
          <h1 className="page-title">Design in, fabrics in, image out</h1>
          <p className="page-lede">Drop a curtain design, choose a fabric for any area, press Generate. About a minute per image.</p>
        </div>
      </div>

      {notice && (
        <div role={notice.kind === 'error' ? 'alert' : 'status'} className={`flex items-center justify-between gap-3 rounded-xl px-3.5 py-3 text-[13px] ${notice.kind === 'error' ? 'border border-red-200 bg-red-50 text-red-900' : 'bg-[var(--color-accent-tint)] text-[var(--color-text-primary)]'}`}>
          <span className="flex items-center gap-2"><AlertCircle className="h-4 w-4 shrink-0" />{notice.text}</span>
          <button type="button" onClick={() => setNotice(null)} className="btn btn-ghost btn-sm">Dismiss</button>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)_minmax(0,1.2fr)]">
        {/* 1. Design */}
        <section className="brand-card flex flex-col gap-3 p-4">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-semibold"><span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-accent)] text-[11px] text-white">1</span>Design</span>
            {design && (
              <div className="flex items-center gap-1">
                <button type="button" className="btn btn-ghost btn-sm" disabled={isAnalyzing || busy} onClick={() => analyze(design.image, design.name)} title="Find the fabric areas again"><RefreshCw className={`h-3.5 w-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} /> Redetect</button>
                <button type="button" className="btn btn-ghost btn-sm" disabled={busy} onClick={() => { cancelJob(); setDesign(null); setSlots({}); setJob(null); setCurrent(null); }} aria-label="Remove design"><X className="h-3.5 w-3.5" /></button>
              </div>
            )}
          </div>

          {!design ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-[14px] border-2 border-dashed border-[var(--color-border-strong)] bg-[var(--color-bg-sunken)] p-6 text-center">
              <Upload className="h-8 w-8 text-[var(--color-accent)]" />
              <p className="text-[14px] font-semibold">Drop a curtain design here</p>
              <p className="text-[12px] text-[var(--color-text-secondary)]">A photo or drawing of the curtain, {GOOD_WIDTH} px wide or more. The fabric areas are found for you.</p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <label className="btn btn-primary cursor-pointer"><Upload className="h-3.5 w-3.5" /> Upload<input type="file" accept="image/*" className="hidden" onChange={handleDesignFile} /></label>
                <label className="btn btn-secondary cursor-pointer"><Camera className="h-3.5 w-3.5" /> Take photo<input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleDesignFile} /></label>
                <button type="button" className="btn btn-secondary" onClick={() => setIsStylePickerOpen(true)}><Images className="h-3.5 w-3.5" /> Saved styles</button>
              </div>
              {isAnalyzing && <p className="text-[12px] font-semibold text-[var(--color-accent)]">Finding fabric areas…</p>}
            </div>
          ) : (
            <div className="relative overflow-hidden rounded-[14px] bg-[var(--color-bg-sunken)]">
              <img src={design.image} alt={design.name} className="block h-auto w-full" />
              {design.areas.map((a, i) => {
                const c = centreOf(a.polygon);
                const f = slots[a.id];
                return (
                  <button key={a.id} type="button" onClick={() => setPickerFor(a.id)} style={{ left: `${c.x}%`, top: `${c.y}%` }} title={`${a.name}${f ? `: ${f.name}` : ''}`} className={`absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 rounded-full bg-[var(--color-bg-surface)]/95 py-1 pr-2.5 pl-1 text-[11px] font-semibold shadow-[var(--shadow-ring)] ${pickerFor === a.id ? 'ring-2 ring-[var(--color-accent)]' : ''}`}>
                    <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] text-white ${f ? 'bg-[#1F6B48]' : 'bg-[var(--color-accent)]'}`}>{i + 1}</span>
                    <span className="max-w-[110px] truncate">{a.name}</span>
                  </button>
                );
              })}
              {isAnalyzing && <div className="ai-generation-shimmer pointer-events-none absolute inset-0" />}
              <span className="absolute right-2 bottom-2 rounded-full bg-black/60 px-2 py-0.5 text-[11px] font-semibold text-white">{design.name}</span>
            </div>
          )}
        </section>

        {/* 2. Fabrics */}
        <section className="brand-card flex flex-col gap-3 p-4">
          <span className="text-[13px] font-semibold"><span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-accent)] text-[11px] text-white">2</span>Fabrics</span>
          {!design ? (
            <p className="text-[13px] text-[var(--color-text-secondary)]">Add a design first. Each fabric area it contains appears here with its own fabric choice.</p>
          ) : (
            <ul className="space-y-2">
              {design.areas.map((a, i) => {
                const f = slots[a.id];
                return (
                  <li key={a.id} className="flex items-center gap-3 rounded-[12px] bg-[var(--color-bg-sunken)] px-3 py-2">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)] text-[11px] font-semibold text-white">{i + 1}</span>
                    {f ? <img src={f.image_url} alt="" className="h-10 w-10 shrink-0 rounded-[8px] object-cover" /> : <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] border border-dashed border-[var(--color-text-tertiary)] text-[10px] text-[var(--color-text-tertiary)]">as is</span>}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-semibold">{a.name}</span>
                      <span className="block truncate text-[11px] text-[var(--color-text-tertiary)]">{f ? f.name : 'As photographed'}</span>
                    </span>
                    {f && <button type="button" className="btn btn-ghost btn-sm" onClick={() => setSlots((s) => ({ ...s, [a.id]: undefined }))} aria-label={`Keep ${a.name} as photographed`}><X className="h-3.5 w-3.5" /></button>}
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => setPickerFor(a.id)}>{f ? 'Change' : 'Choose'}</button>
                  </li>
                );
              })}
            </ul>
          )}
          <div className="mt-auto pt-2">
            <button type="button" className="btn btn-primary btn-block" disabled={!design || busy || isAnalyzing || designTooSmall} onClick={handleGenerate}>
              <Sparkles className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />{isGenerating ? stageLine : current ? 'Generate again' : 'Generate'}
            </button>
            <p className="mt-1.5 text-center text-[11px] text-[var(--color-text-tertiary)]">{designTooSmall ? 'This design is too small to generate from' : changedAreas.length === 0 ? 'Choose at least one fabric' : `${changedAreas.length} of ${design?.areas.length} areas change · 3 variations · about a minute`}</p>
          </div>
        </section>

        {/* 3. Result */}
        <section className="brand-card flex flex-col gap-3 p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[13px] font-semibold"><span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-accent)] text-[11px] text-white">3</span>Result</span>
            {current && (
              <div className="flex items-center gap-1">
                <button type="button" className={`btn btn-sm ${resultTab === 'curtain' ? 'btn-secondary' : 'btn-ghost'}`} onClick={() => setResultTab('curtain')}>Curtain</button>
                {current.roomImage && <button type="button" className={`btn btn-sm ${resultTab === 'room' ? 'btn-secondary' : 'btn-ghost'}`} onClick={() => setResultTab('room')}>Room</button>}
              </div>
            )}
          </div>

          <div className="media-frame relative min-h-[320px] flex-1 overflow-hidden rounded-[14px]">
            {shownImage ? <img src={shownImage} alt="Generated curtain" className="block h-auto w-full" /> : (
              <div className="flex h-full min-h-[320px] flex-col items-center justify-center gap-2 p-6 text-center text-[13px] text-[var(--color-text-secondary)]">
                <Sparkles className="h-8 w-8 text-[var(--color-accent)]" />
                {busy ? <span className="font-semibold text-[var(--color-text-primary)]">{stageLine}</span> : 'Your generated image appears here.'}
              </div>
            )}
            {busy && <div className="ai-generation-shimmer pointer-events-none absolute inset-0" />}
            {busy && shownImage && <span className="absolute top-3 left-3 rounded-[10px] bg-[var(--color-bg-surface)]/90 px-3 py-2 text-[12px] font-semibold shadow-[var(--shadow-ring)]">{stageLine}</span>}
          </div>

          {current && resultTab === 'curtain' && current.job.candidates.length > 1 && (
            <div className={`flex items-center gap-2 overflow-x-auto ${isChoosing ? 'pointer-events-none opacity-60' : ''}`}>
              <span className="shrink-0 text-[11px] text-[var(--color-text-tertiary)]">Variations</span>
              {current.job.candidates.map((c, i) => (
                <button key={c.id} type="button" onClick={() => handleChoose(c.id)} title={c.scores.map((s) => `${s.key.replace(/_/g, ' ')}: ${s.score}`).join('\n')} className={`relative h-16 w-12 shrink-0 overflow-hidden rounded-[8px] border-2 ${current.job.result?.chosenId === c.id ? 'border-[var(--color-accent)]' : 'border-transparent opacity-70 hover:opacity-100'}`}>
                  {c.image && <img src={c.image} alt={`Variation ${i + 1}`} className="h-full w-full object-cover" />}
                  <span className={`absolute right-0.5 bottom-0.5 rounded-full px-1 text-[9px] font-semibold text-white ${c.passed ? 'bg-[#1F6B48]' : 'bg-[#6B5420]'}`}>{c.total}</span>
                </button>
              ))}
            </div>
          )}

          {current && (
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => download(shownImage!, resultTab)}><Download className="h-3.5 w-3.5" /> Download</button>
              <label className={`btn btn-secondary btn-sm cursor-pointer ${busy ? 'pointer-events-none opacity-60' : ''}`}><Sofa className="h-3.5 w-3.5" /> {current.roomImage ? 'Place in another room' : 'Place in a room'}<input type="file" accept="image/*" className="hidden" onChange={handleRoomFile} /></label>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setActiveDesignId(current.designId); setActiveView('design_detail'); }}>Open in Designs</button>
            </div>
          )}
        </section>
      </div>

      {history.length > 0 && (
        <section className="brand-card p-4">
          <p className="eyebrow-label mb-2">This session</p>
          <div className="flex items-stretch gap-3 overflow-x-auto pb-1">
            {history.map((g) => (
              <button key={g.id} type="button" onClick={() => restore(g)} className={`flex w-[200px] shrink-0 flex-col gap-1.5 rounded-[12px] p-2 text-left ${current?.id === g.id ? 'bg-[var(--color-accent-tint)] ring-1 ring-[var(--color-accent)]' : 'hover:bg-[var(--color-bg-sunken)]'}`}>
                <img src={g.roomImage || g.finalImage} alt="" className="h-28 w-full rounded-[8px] object-cover" />
                <span className="truncate text-[12px] font-semibold">{g.design.name}</span>
                <span className="truncate text-[11px] text-[var(--color-text-tertiary)]">{(Object.values(g.slots) as Array<Fabric | undefined>).filter((f): f is Fabric => Boolean(f)).map((f) => f.name).join(', ') || 'no fabric change'} · {new Date(g.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Fabric picker */}
      {pickerFor && design && (
        <FabricPicker
          area={design.areas.find((a) => a.id === pickerFor)!}
          fabrics={fabrics}
          selectedId={slots[pickerFor]?.id || null}
          onClose={() => setPickerFor(null)}
          onPick={(f) => { assignFabric(pickerFor, f); setPickerFor(null); }}
          onUpload={(e) => handleFabricFile(e, pickerFor)}
        />
      )}

      <StylePickerModal isOpen={isStylePickerOpen} onClose={() => setIsStylePickerOpen(false)} onPick={(t) => { setIsStylePickerOpen(false); loadTemplate(t); }} onAddStyle={() => setIsStylePickerOpen(false)} />
    </div>
  );
};

const FabricPicker: React.FC<{
  area: Area;
  fabrics: Fabric[];
  selectedId: string | null;
  onClose: () => void;
  onPick: (f: Fabric) => void;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ area, fabrics, selectedId, onClose, onPick, onUpload }) => {
  const [query, setQuery] = useState('');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? fabrics.filter((f) => f.name.toLowerCase().includes(q) || f.category.toLowerCase().includes(q) || f.tags.some((t) => t.includes(q))) : fabrics;
  }, [fabrics, query]);
  const onKey = useCallback((e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); }, [onClose]);
  useEffect(() => { window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey); }, [onKey]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#1A1814]/45 p-0 backdrop-blur-sm sm:items-center sm:p-4" onClick={onClose}>
      <div role="dialog" aria-label={`Fabric for ${area.name}`} className="brand-card flex max-h-[90dvh] w-full max-w-3xl flex-col gap-3 rounded-b-none p-4 sm:rounded-b-[18px]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="eyebrow-label">Fabric for</p>
            <h3 className="font-display text-[18px] font-semibold">{area.name}</h3>
          </div>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose} aria-label="Close"><X className="h-4 w-4" /></button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="field flex h-9 flex-1 items-center gap-2"><Search className="h-3.5 w-3.5 text-[var(--color-text-tertiary)]" /><input className="min-w-0 flex-1 bg-transparent text-[13px] outline-none" placeholder="Search catalog" value={query} onChange={(e) => setQuery(e.target.value)} /></label>
          <label className="btn btn-secondary btn-sm cursor-pointer"><Upload className="h-3.5 w-3.5" /> Upload<input type="file" accept="image/*" className="hidden" onChange={onUpload} /></label>
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => setIsCameraOpen(true)}><Camera className="h-3.5 w-3.5" /> Camera</button>
        </div>
        <div className="grid flex-1 grid-cols-3 gap-2 overflow-y-auto sm:grid-cols-4 md:grid-cols-5">
          {shown.map((f) => (
            <button key={f.id} type="button" onClick={() => onPick(f)} className={`flex flex-col overflow-hidden rounded-[12px] text-left ${selectedId === f.id ? 'ring-2 ring-[var(--color-accent)] ring-offset-1' : 'shadow-[var(--shadow-ring)] hover:shadow-[var(--shadow-card)]'}`}>
              <img src={f.image_url} alt="" className="aspect-square w-full object-cover" />
              <span className="truncate px-2 py-1.5 text-[11px] font-semibold">{f.name}</span>
              {selectedId === f.id && <Check className="absolute m-1.5 h-4 w-4 rounded-full bg-[var(--color-accent)] p-0.5 text-white" />}
            </button>
          ))}
          {shown.length === 0 && <p className="col-span-full py-6 text-center text-[13px] text-[var(--color-text-secondary)]">No photographed fabrics match. Upload one or use the camera.</p>}
        </div>
        <CameraCaptureModal isOpen={isCameraOpen} onClose={() => setIsCameraOpen(false)} onFabricCaptured={(f) => { setIsCameraOpen(false); onPick(f); }} />
      </div>
    </div>
  );
};
