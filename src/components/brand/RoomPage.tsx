// src/components/brand/RoomPage.tsx
// Second step after Generate: put a saved curtain design into a photo of the customer's room.
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Upload, Camera, Sparkles, Download, ArrowLeft, AlertCircle, Sun } from 'lucide-react';
import { useBrandStore } from '../../lib/brandStore';
import { Design, RoomPreview } from '../../types/brand';
import { startRender, pollRender, chooseCandidate, toDataUrl, STAGE_COPY, RenderJobView, LIGHTING_OPTIONS, Lighting } from '../../lib/renderClient';

function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = () => reject(new Error('Could not read the file'));
    r.readAsDataURL(file);
  });
}

export const RoomPage: React.FC = () => {
  const { designs, activeDesignId, currentBrandId, addRoomPreview, updateDesign, setActiveView, setActiveDesignId } = useBrandStore();
  const design: Design | undefined = useMemo(() => designs.find((d) => d.id === activeDesignId && d.brand_id === currentBrandId) || designs.find((d) => d.brand_id === currentBrandId), [designs, activeDesignId, currentBrandId]);

  const [roomPhoto, setRoomPhoto] = useState<string | null>(null);
  const [lighting, setLighting] = useState<Lighting>('as_photographed');
  const [variations, setVariations] = useState<1 | 2 | 3>(1);
  const [job, setJob] = useState<RenderJobView | null>(null);
  const [isStaging, setIsStaging] = useState(false);
  const [isChoosing, setIsChoosing] = useState(false);
  const [notice, setNotice] = useState<{ kind: 'info' | 'error'; text: string } | null>(null);
  const [selectedPreviewId, setSelectedPreviewId] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  useEffect(() => () => abortRef.current?.abort(), []);

  const previews: RoomPreview[] = design?.room_previews || [];
  const selected = previews.find((p) => p.id === selectedPreviewId) || previews[previews.length - 1];

  if (!design) {
    return (
      <div className="page-shell max-w-3xl space-y-4 text-center">
        <p className="eyebrow-label">Room</p>
        <h1 className="page-title">No curtain to place yet</h1>
        <p className="page-lede mx-auto">Generate a curtain first, then come back here to see it in a room.</p>
        <button type="button" onClick={() => setActiveView('editor')} className="btn btn-primary">Open Generate</button>
      </div>
    );
  }

  const chooseRoomFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setRoomPhoto(await readFile(file));
    setNotice(null);
  };

  const handlePlace = async () => {
    if (!roomPhoto) { setNotice({ kind: 'info', text: 'Add a photo of the room first.' }); return; }
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setIsStaging(true);
    setNotice(null);
    setJob(null);
    try {
      const body = { kind: 'room_stage' as const, brandId: currentBrandId, roomPhoto: await toDataUrl(roomPhoto), curtainImage: await toDataUrl(design.final_image_url), lighting, variations };
      const done = await pollRender(await startRender(body), setJob, { signal: controller.signal });
      if (done.status === 'failed' || !done.result) throw new Error(done.error || 'Room placement did not finish.');
      const preview = addRoomPreview(design.id, { design_id: design.id, brand_id: currentBrandId, room_source: 'uploaded', room_photo_url: roomPhoto, output_url: done.result.finalImage, provider_used: done.id, candidates: done.candidates, lighting });
      setSelectedPreviewId(preview.id);
      if (done.status === 'needs_review') setNotice({ kind: 'info', text: 'None of the options passed every quality check. The best one is shown; try another variation or place it again.' });
    } catch (err: any) {
      if (err?.code !== 'CANCELLED') setNotice({ kind: 'error', text: err.message || 'Room placement did not finish.' });
    } finally {
      setIsStaging(false);
      abortRef.current = null;
    }
  };

  const handleChoose = async (candidateId: string) => {
    if (!selected || isChoosing) return;
    setIsChoosing(true);
    try {
      const updated = await chooseCandidate(selected.provider_used, candidateId);
      if (!updated.result) throw new Error('Could not switch to that variation.');
      updateDesign(design.id, { room_previews: previews.map((p) => (p.id === selected.id ? { ...p, output_url: updated.result!.finalImage, candidates: updated.candidates } : p)) });
    } catch (err: any) {
      setNotice({ kind: 'error', text: err.message || 'Could not switch to that variation.' });
    } finally {
      setIsChoosing(false);
    }
  };

  const download = (src: string) => {
    const a = document.createElement('a');
    a.href = src;
    a.download = `${design.name.toLowerCase().replace(/\s+/g, '-')}-room.png`;
    a.click();
  };

  const stageLine = job && isStaging ? `${STAGE_COPY[job.stage]}${job.round > 1 ? ` · round ${job.round}` : ''}` : isStaging ? 'Starting…' : '';
  const chosenId = selected?.candidates?.find((c) => c.image === selected.output_url)?.id;

  return (
    <div className="page-shell space-y-5">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <button type="button" onClick={() => setActiveView('editor')} className="btn btn-ghost btn-sm -ml-2 mb-1"><ArrowLeft className="h-3.5 w-3.5" /> Back to Generate</button>
          <p className="eyebrow-label">Room</p>
          <h1 className="page-title">See it in the room</h1>
          <p className="page-lede">Add a photo of the customer's room, pick the light, and place the curtain on the window. The room stays as photographed.</p>
        </div>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setActiveDesignId(design.id); setActiveView('design_detail'); }}>Open in Designs</button>
      </div>

      {notice && (
        <div role={notice.kind === 'error' ? 'alert' : 'status'} className={`flex items-center justify-between gap-3 rounded-xl px-3.5 py-3 text-[13px] ${notice.kind === 'error' ? 'border border-red-200 bg-red-50 text-red-900' : 'bg-[var(--color-accent-tint)] text-[var(--color-text-primary)]'}`}>
          <span className="flex items-center gap-2"><AlertCircle className="h-4 w-4 shrink-0" />{notice.text}</span>
          <button type="button" onClick={() => setNotice(null)} className="btn btn-ghost btn-sm">Dismiss</button>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)]">
        <section className="brand-card flex flex-col gap-4 p-4">
          <div>
            <span className="text-[13px] font-semibold"><span className="step-dot mr-2">1</span>Curtain</span>
            <div className="mt-2 flex items-center gap-3 rounded-[12px] bg-[var(--color-bg-sunken)] p-2">
              <img src={design.final_image_url} alt={design.name} className="h-20 w-16 rounded-[8px] object-cover" />
              <span className="min-w-0">
                <span className="block truncate text-[13px] font-semibold">{design.name}</span>
                <span className="block truncate text-[11px] text-[var(--color-text-tertiary)]">{design.template_name}</span>
              </span>
            </div>
          </div>

          <div>
            <span className="text-[13px] font-semibold"><span className="step-dot mr-2">2</span>Room photo</span>
            {roomPhoto ? (
              <div className="relative mt-2 overflow-hidden rounded-[12px] bg-[var(--color-bg-sunken)]">
                <img src={roomPhoto} alt="Room" className="block h-auto w-full" />
                <label className="btn btn-secondary btn-sm absolute right-2 bottom-2 cursor-pointer">Change<input type="file" accept="image/*" className="hidden" onChange={chooseRoomFile} /></label>
              </div>
            ) : (
              <div className="mt-2 flex flex-col items-center gap-2 rounded-[12px] border-2 border-dashed border-[var(--color-border-strong)] bg-[var(--color-bg-sunken)] p-5 text-center">
                <p className="text-[12px] text-[var(--color-text-secondary)]">A straight-on photo of the wall with the window works best.</p>
                <div className="flex gap-2">
                  <label className="btn btn-primary btn-sm cursor-pointer"><Upload className="h-3.5 w-3.5" /> Upload<input type="file" accept="image/*" className="hidden" onChange={chooseRoomFile} /></label>
                  <label className="btn btn-secondary btn-sm cursor-pointer"><Camera className="h-3.5 w-3.5" /> Take photo<input type="file" accept="image/*" capture="environment" className="hidden" onChange={chooseRoomFile} /></label>
                </div>
              </div>
            )}
          </div>

          <div>
            <span className="text-[13px] font-semibold"><Sun className="mr-2 inline h-4 w-4 text-[var(--color-accent)]" />Light</span>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {LIGHTING_OPTIONS.map((o) => (
                <button key={o.id} type="button" title={o.hint} onClick={() => setLighting(o.id)} className={`rounded-full px-3 py-1 text-[12px] font-semibold ${lighting === o.id ? 'bg-[var(--color-accent)] text-white' : 'bg-[var(--color-bg-sunken)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'}`}>{o.label}</button>
              ))}
            </div>
            <p className="mt-1 text-[11px] text-[var(--color-text-tertiary)]">{LIGHTING_OPTIONS.find((o) => o.id === lighting)?.hint}</p>
          </div>

          <div>
            <span className="text-[13px] font-semibold">Variations</span>
            <div className="mt-2 flex gap-1.5">
              {([1, 2, 3] as const).map((n) => (
                <button key={n} type="button" onClick={() => setVariations(n)} title={n === 1 ? 'One image, fastest and cheapest' : `${n} options to choose from, ${n}× the cost`} className={`rounded-full px-3 py-1 text-[12px] font-semibold ${variations === n ? 'bg-[var(--color-accent)] text-white' : 'bg-[var(--color-bg-sunken)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'}`}>{n}</button>
              ))}
            </div>
          </div>

          <button type="button" className="btn btn-primary btn-block mt-auto" disabled={!roomPhoto || isStaging} onClick={handlePlace}>
            <Sparkles className={`h-4 w-4 ${isStaging ? 'animate-spin' : ''}`} />{isStaging ? stageLine : previews.length ? 'Place again' : 'Place in this room'}
          </button>
          <p className="text-center text-[11px] text-[var(--color-text-tertiary)]">{variations === 1 ? '1 image · about 30 s' : `${variations} variations · about a minute`}</p>
        </section>

        <section className="brand-card flex flex-col gap-3 p-4">
          <span className="text-[13px] font-semibold"><span className="step-dot mr-2">3</span>Result</span>
          <div className="media-frame relative min-h-[320px] flex-1 overflow-hidden rounded-[14px]">
            {selected ? <img src={selected.output_url} alt="Curtain in the room" className="block h-auto w-full" /> : (
              <div className="flex h-full min-h-[320px] flex-col items-center justify-center gap-2 p-6 text-center text-[13px] text-[var(--color-text-secondary)]">
                <Sparkles className="h-8 w-8 text-[var(--color-accent)]" />
                {isStaging ? <span className="font-semibold text-[var(--color-text-primary)]">{stageLine}</span> : 'The room with your curtain appears here.'}
              </div>
            )}
            {isStaging && <div className="ai-generation-shimmer pointer-events-none absolute inset-0" />}
            {isStaging && selected && <span className="absolute top-3 left-3 rounded-[10px] bg-[var(--color-bg-surface)]/90 px-3 py-2 text-[12px] font-semibold shadow-[var(--shadow-ring)]">{stageLine}</span>}
          </div>

          {selected?.candidates && selected.candidates.length > 1 && (
            <div className={`flex items-center gap-2 overflow-x-auto ${isChoosing ? 'pointer-events-none opacity-60' : ''}`}>
              <span className="shrink-0 text-[11px] text-[var(--color-text-tertiary)]">Variations</span>
              {selected.candidates.map((c, i) => (
                <button key={c.id} type="button" onClick={() => handleChoose(c.id)} title={c.scores.map((s) => `${s.key.replace(/_/g, ' ')}: ${s.score}`).join('\n')} className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-[8px] border-2 ${chosenId === c.id ? 'border-[var(--color-accent)]' : 'border-transparent opacity-70 hover:opacity-100'}`}>
                  {c.image && <img src={c.image} alt={`Variation ${i + 1}`} className="h-full w-full object-cover" />}
                  <span className={`absolute right-0.5 bottom-0.5 rounded-full px-1 text-[9px] font-semibold text-white ${c.passed ? 'bg-[#1F6B48]' : 'bg-[#6B5420]'}`}>{c.total}</span>
                </button>
              ))}
            </div>
          )}

          {selected && (
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => download(selected.output_url)}><Download className="h-3.5 w-3.5" /> Download</button>
              {selected.lighting && selected.lighting !== 'as_photographed' && <span className="badge badge-muted">{LIGHTING_OPTIONS.find((o) => o.id === selected.lighting)?.label}</span>}
            </div>
          )}

          {previews.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pt-1">
              <span className="shrink-0 text-[11px] text-[var(--color-text-tertiary)]">Rooms</span>
              {previews.map((p, i) => (
                <button key={p.id} type="button" onClick={() => setSelectedPreviewId(p.id)} className={`h-14 w-20 shrink-0 overflow-hidden rounded-[8px] border-2 ${selected?.id === p.id ? 'border-[var(--color-accent)]' : 'border-transparent opacity-70 hover:opacity-100'}`}>
                  <img src={p.output_url} alt={`Room ${i + 1}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
