// src/server/renderAgent/runner.ts
import type { Bbox, BuiltPrompt, Candidate, RenderJob } from './types';
import type { GenerateRequest, VisionRequest } from './imageClient';
import { generateImage, askVision } from './imageClient';
import { detectWindow as defaultDetectWindow } from './windowDetect';
import { buildFabricSwapPrompt, buildRoomStagePrompt, closestAspectRatio, isRelit, LIGHTING_TEXT } from './prompt';
import { buildGradePrompt, gradeImages, parseGrade, passes, total, retryFeedback } from './grading';
import { getImageSize, polygonMaskPng, bboxMaskPng, lockOutsideMask } from './lock';
import { withRetry, FatalError } from './errors';

export const CANDIDATES_PER_ROUND = 1; // default; the request may ask for up to 3
export const MAX_CANDIDATES = 3;
export const MAX_ROUNDS = 2;

export interface RunnerDeps {
  generate: (req: GenerateRequest) => Promise<string>;
  ask: (req: VisionRequest) => Promise<string>;
  detectWindow: (roomPhoto: string, apiKey: string | null) => Promise<Bbox>;
  sleep: (ms: number) => Promise<void>;
  onUpdate?: (job: RenderJob) => void;
}

const defaultDeps: RunnerDeps = {
  generate: (req) => generateImage(req),
  ask: (req) => askVision(req),
  detectWindow: (photo, key) => defaultDetectWindow(photo, key),
  sleep: (ms) => new Promise((r) => setTimeout(r, ms)),
};

function originalOf(job: RenderJob): string {
  return job.input.kind === 'fabric_swap' ? job.input.templatePhoto : job.input.roomPhoto;
}

/** The mask that decides which pixels the model is allowed to change. Same rule for every candidate. */
async function buildMask(job: RenderJob, width: number, height: number): Promise<string> {
  if (job.input.kind === 'fabric_swap') {
    return job.input.curtainMask ?? (await polygonMaskPng(job.input.zones, width, height));
  }
  if (!job.windowBbox) throw new FatalError('This render has no detected window to lock against', 'NO_WINDOW_DETECTED');
  return bboxMaskPng(job.windowBbox, width, height);
}

/** Re-runs the lock stage for another candidate of a finished job, rebuilding the mask the runner used. */
export async function lockCandidate(job: RenderJob, candidateId: string): Promise<string> {
  if (isRelit(job.input.lighting)) {
    const relitCandidate = job.candidates.find((c) => c.id === candidateId);
    if (!relitCandidate) throw new FatalError('Unknown candidate', 'BAD_REQUEST');
    return relitCandidate.image; // a relit image cannot be locked against the original's lighting
  }
  const candidate = job.candidates.find((c) => c.id === candidateId);
  if (!candidate) throw new FatalError('Unknown candidate for this render', 'BAD_REQUEST');
  const original = originalOf(job);
  const { width, height } = await getImageSize(original);
  const mask = await buildMask(job, width, height);
  return lockOutsideMask(original, candidate.image, mask);
}

export async function runRenderJob(job: RenderJob, partial: Partial<RunnerDeps> = {}): Promise<RenderJob> {
  const deps: RunnerDeps = { ...defaultDeps, ...partial };
  const update = (patch: Partial<RenderJob>) => { Object.assign(job, patch); deps.onUpdate?.(job); };
  const retry = <T>(fn: () => Promise<T>) => withRetry(fn, { sleep: deps.sleep });

  try {
    update({ status: 'running', stage: 'prompt' });

    // Inputs that do not change between rounds
    const original = originalOf(job);
    const { width, height } = await getImageSize(original);
    const aspectRatio = closestAspectRatio(width, height);

    if (job.input.kind === 'room_stage') {
      const bbox = await retry(() => deps.detectWindow(job.input.kind === 'room_stage' ? job.input.roomPhoto : '', job.apiKey));
      update({ windowBbox: bbox });
    }
    const windowBbox = job.windowBbox;

    const swatches = job.input.kind === 'fabric_swap' ? job.input.changes.map((c) => c.swatch) : [job.input.curtainImage];
    const zones = job.input.kind === 'fabric_swap' ? job.input.zones : [];
    const gradeContext = job.input.kind === 'fabric_swap'
      ? { changes: job.input.changes.map((c) => ({ zoneName: zones.find((z) => z.id === c.regionId)?.display_name ?? c.regionId, fabricName: c.fabricName })) }
      : {};
    const relitAs = isRelit(job.input.lighting) ? LIGHTING_TEXT[job.input.lighting] : undefined;
    const gradePrompt = buildGradePrompt(job.kind, { ...gradeContext, relitAs }).text;

    const relit = isRelit(job.input.lighting);
    const mask = relit ? '' : await buildMask(job, width, height);

    let previousProblems: string[] | undefined;
    let lastPrompt: BuiltPrompt | undefined;

    for (let round = 1; round <= MAX_ROUNDS; round++) {
      update({ round, stage: 'prompt' });
      const prompt: BuiltPrompt = job.input.kind === 'fabric_swap'
        ? buildFabricSwapPrompt(job.input, previousProblems)
        : buildRoomStagePrompt(job.input, windowBbox!, previousProblems);
      lastPrompt = prompt;

      update({ stage: 'generate' });
      // One exhausted candidate must not kill the round: keep whatever came back.
      const settled = await Promise.allSettled(
        Array.from({ length: Math.min(MAX_CANDIDATES, Math.max(1, job.input.variations ?? CANDIDATES_PER_ROUND)) }, (_, i) =>
          retry(() => deps.generate({ prompt: prompt.text, images: prompt.images, aspectRatio, seed: round * 100 + i + 1, apiKey: job.apiKey }))
        )
      );
      const images = settled.filter((r) => r.status === 'fulfilled').map((r) => (r as PromiseFulfilledResult<string>).value);
      const generateFailures = settled.filter((r) => r.status === 'rejected') as PromiseRejectedResult[];
      if (images.length === 0) throw generateFailures[0].reason;
      for (const f of generateFailures) console.warn('Render candidate failed to generate:', f.reason?.message || f.reason);

      update({ stage: 'grade' });
      const gradeSettled = await Promise.allSettled(
        images.map(async (image, i): Promise<Candidate> => {
          const scores = await retry(async () => parseGrade(await deps.ask({ prompt: gradePrompt, images: gradeImages(job.kind, original, swatches, image), apiKey: job.apiKey }), job.kind));
          return { id: `${job.id}-r${round}-c${i + 1}`, round, image, scores, total: total(scores), passed: passes(scores) };
        })
      );
      const graded = gradeSettled.filter((r) => r.status === 'fulfilled').map((r) => (r as PromiseFulfilledResult<Candidate>).value);
      const gradeFailures = gradeSettled.filter((r) => r.status === 'rejected') as PromiseRejectedResult[];
      if (graded.length === 0) throw gradeFailures[0].reason;
      for (const f of gradeFailures) console.warn('Dropping a render candidate whose grading failed:', f.reason?.message || f.reason);
      update({ candidates: [...job.candidates, ...graded] });

      const winner = graded.filter((c) => c.passed).sort((a, b) => b.total - a.total)[0];
      if (winner) {
        update({ stage: 'lock' });
        const finalImage = relit ? winner.image : await lockOutsideMask(original, winner.image, mask);
        update({ stage: 'store', status: 'done', result: { finalImage, chosenId: winner.id, prompt: prompt.text } });
        return job;
      }
      const best = graded.slice().sort((a, b) => b.total - a.total)[0];
      previousProblems = retryFeedback(best.scores);
    }

    // No round passed: hand the best candidate back for review, still locked.
    const best = job.candidates.slice().sort((a, b) => b.total - a.total)[0];
    update({ stage: 'lock' });
    const finalImage = relit ? best.image : await lockOutsideMask(original, best.image, mask);
    update({ stage: 'store', status: 'needs_review', result: { finalImage, chosenId: best.id, prompt: lastPrompt!.text } });
    return job;
  } catch (err: any) {
    const message = err instanceof FatalError ? err.message : `Render did not finish: ${err?.message || 'unknown error'}`;
    update({ status: 'failed', error: message });
    return job;
  }
}
