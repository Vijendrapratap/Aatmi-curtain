// src/server/renderAgent/routes.ts
import express from 'express';
import { z } from 'zod';
import { jobStore as defaultStore, JobStore } from './jobs';
import type { RunnerDeps } from './runner';
import { runRenderJob, lockCandidate } from './runner';
import { getOrCreateBrandConfig } from '../brandConfigs';
import { getEffectiveOpenRouterKey } from '../openrouter';
import { parseBase64Image } from '../images';

const rasterDataUrl = z.string().refine((s) => s.startsWith('data:image/') && parseBase64Image(s) !== null, 'must be a PNG, JPEG or WEBP data URL');
const point = z.object({ x: z.number(), y: z.number() });

const fabricSwapSchema = z.object({
  kind: z.literal('fabric_swap'),
  brandId: z.string().min(1),
  templateName: z.string().min(1),
  templatePhoto: rasterDataUrl,
  zones: z.array(z.object({ id: z.string(), display_name: z.string(), description: z.string(), location: z.string(), polygon_coords: z.array(point) })).min(1),
  changes: z.array(z.object({ regionId: z.string(), fabricName: z.string(), weave: z.string(), colorHex: z.string(), category: z.string(), swatch: rasterDataUrl })).min(1),
  curtainMask: rasterDataUrl.optional(),
});

const roomStageSchema = z.object({
  kind: z.literal('room_stage'),
  brandId: z.string().min(1),
  roomPhoto: rasterDataUrl,
  curtainImage: rasterDataUrl,
});

const inputSchema = z.discriminatedUnion('kind', [fabricSwapSchema, roomStageSchema]);

const chooseSchema = z.object({ candidateId: z.string().min(1) });

const TERMINAL_STATUSES = ['done', 'needs_review', 'failed'];

export function createRenderRouter(opts: { store?: JobStore; deps?: Partial<RunnerDeps> } = {}): express.Router {
  const store = opts.store ?? defaultStore;
  const router = express.Router();

  router.post('/jobs', (req, res) => {
    const parsed = inputSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ') });
    const input = parsed.data;

    const config = getOrCreateBrandConfig(input.brandId);
    const brandKey = config.key_mode === 'brand_byo_key' ? config.byo_api_key_encrypted : null;
    // Grading and window detection both go through OpenRouter, so a Gemini-only deployment
    // could start a job it can never finish. Require an OpenRouter key up front.
    const apiKey = getEffectiveOpenRouterKey(brandKey);
    if (!apiKey) return res.status(401).json({ error: 'An OpenRouter key is required for rendering. Add one in Settings or set OPENROUTER_API_KEY.', code: 'BAD_KEY' });

    const cap = config.monthly_generation_cap ?? Infinity;
    const used = config.monthly_generations_used ?? 0;
    if (used >= cap) return res.status(402).json({ error: `This brand has used all ${cap} renders for the month.`, code: 'QUOTA_EXCEEDED' });
    config.monthly_generations_used = used + 1;

    const job = store.create(input, apiKey);
    void runRenderJob(job, opts.deps).finally(() => store.finish(job)).catch(() => {});
    res.status(202).json({ jobId: job.id });
  });

  router.get('/jobs/:id', (req, res) => {
    const job = store.get(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found or expired' });
    res.json(store.publicView(job));
  });

  // Picking a runner-up has to re-run the pixel lock, or the client would show an unlocked candidate.
  router.post('/jobs/:id/choose', async (req, res) => {
    const job = store.get(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found or expired' });
    if (!TERMINAL_STATUSES.includes(job.status)) return res.status(409).json({ error: 'This render is still running.', code: 'NOT_FINISHED' });
    const parsed = chooseSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'candidateId is required' });
    const candidate = job.candidates.find((c) => c.id === parsed.data.candidateId);
    if (!candidate) return res.status(400).json({ error: 'Unknown option for this render' });
    try {
      const finalImage = await lockCandidate(job, candidate.id);
      job.result = { finalImage, chosenId: candidate.id, prompt: job.result?.prompt ?? '' };
      res.json(store.publicView(job));
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Could not switch to that option' });
    }
  });

  return router;
}
