// src/server/renderAgent/runner.ts
import type { Bbox, BuiltPrompt, Candidate, RenderJob } from './types';
import { generateImage, askVision, GenerateRequest, VisionRequest } from './imageClient';
import { detectWindow as defaultDetectWindow } from './windowDetect';
import { buildFabricSwapPrompt, buildRoomStagePrompt, closestAspectRatio } from './prompt';
import { buildGradePrompt, gradeImages, parseGrade, passes, total, reasonsBelowThreshold } from './grading';
import { getImageSize, polygonMaskPng, bboxMaskPng, lockOutsideMask } from './lock';
import { withRetry, FatalError } from './errors';

export const CANDIDATES_PER_ROUND = 3;
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

export async function runRenderJob(job: RenderJob, partial: Partial<RunnerDeps> = {}): Promise<RenderJob> {
  const deps: RunnerDeps = { ...defaultDeps, ...partial };
  const update = (patch: Partial<RenderJob>) => { Object.assign(job, patch); deps.onUpdate?.(job); };
  const retry = <T>(fn: () => Promise<T>) => withRetry(fn, { sleep: deps.sleep });

  try {
    update({ status: 'running', stage: 'prompt' });

    // Inputs that do not change between rounds
    const original = job.input.kind === 'fabric_swap' ? job.input.templatePhoto : job.input.roomPhoto;
    const { width, height } = await getImageSize(original);
    const aspectRatio = closestAspectRatio(width, height);

    let windowBbox: Bbox | undefined;
    if (job.input.kind === 'room_stage') {
      windowBbox = await retry(() => deps.detectWindow(job.input.kind === 'room_stage' ? job.input.roomPhoto : '', job.apiKey));
    }

    const swatches = job.input.kind === 'fabric_swap' ? job.input.changes.map((c) => c.swatch) : [job.input.curtainImage];
    const zones = job.input.kind === 'fabric_swap' ? job.input.zones : [];
    const gradeContext = job.input.kind === 'fabric_swap'
      ? { changes: job.input.changes.map((c) => ({ zoneName: zones.find((z) => z.id === c.regionId)?.display_name ?? c.regionId, fabricName: c.fabricName })) }
      : {};
    const gradePrompt = buildGradePrompt(job.kind, gradeContext).text;

    const mask = job.input.kind === 'fabric_swap'
      ? job.input.curtainMask ?? (await polygonMaskPng(job.input.zones, width, height))
      : await bboxMaskPng(windowBbox!, width, height);

    let previousProblems: string[] | undefined;
    let lastPrompt: BuiltPrompt | undefined;

    for (let round = 1; round <= MAX_ROUNDS; round++) {
      update({ round, stage: 'prompt' });
      const prompt: BuiltPrompt = job.input.kind === 'fabric_swap'
        ? buildFabricSwapPrompt(job.input, previousProblems)
        : buildRoomStagePrompt(job.input, windowBbox!, previousProblems);
      lastPrompt = prompt;

      update({ stage: 'generate' });
      const images = await Promise.all(
        Array.from({ length: CANDIDATES_PER_ROUND }, (_, i) =>
          retry(() => deps.generate({ prompt: prompt.text, images: prompt.images, aspectRatio, seed: round * 100 + i + 1, apiKey: job.apiKey }))
        )
      );

      update({ stage: 'grade' });
      const graded: Candidate[] = await Promise.all(
        images.map(async (image, i) => {
          const scores = await retry(async () => parseGrade(await deps.ask({ prompt: gradePrompt, images: gradeImages(job.kind, original, swatches, image), apiKey: job.apiKey }), job.kind));
          return { id: `${job.id}-r${round}-c${i + 1}`, round, image, scores, total: total(scores), passed: passes(scores) };
        })
      );
      update({ candidates: [...job.candidates, ...graded] });

      const winner = graded.filter((c) => c.passed).sort((a, b) => b.total - a.total)[0];
      if (winner) {
        update({ stage: 'lock' });
        const finalImage = await lockOutsideMask(original, winner.image, mask);
        update({ stage: 'store', status: 'done', result: { finalImage, chosenId: winner.id, prompt: prompt.text, candidates: job.candidates } });
        return job;
      }
      const best = graded.slice().sort((a, b) => b.total - a.total)[0];
      previousProblems = reasonsBelowThreshold(best.scores);
    }

    // No round passed: hand the best candidate back for review, still locked.
    const best = job.candidates.slice().sort((a, b) => b.total - a.total)[0];
    update({ stage: 'lock' });
    const finalImage = await lockOutsideMask(original, best.image, mask);
    update({ stage: 'store', status: 'needs_review', result: { finalImage, chosenId: best.id, prompt: lastPrompt!.text, candidates: job.candidates } });
    return job;
  } catch (err: any) {
    const message = err instanceof FatalError ? err.message : `Render did not finish: ${err?.message || 'unknown error'}`;
    update({ status: 'failed', error: message });
    return job;
  }
}
