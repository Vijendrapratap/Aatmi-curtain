// src/server/renderAgent/runner.test.ts
import { describe, it, expect, vi } from 'vitest';
import sharp from 'sharp';
import { runRenderJob, lockCandidate, CANDIDATES_PER_ROUND, MAX_ROUNDS } from './runner';
import { JobStore } from './jobs';
import { RUBRICS } from './grading';
import { FatalError, RetryableError } from './errors';
import type { GenerateRequest } from './imageClient';
import type { FabricSwapInput, RoomStageInput } from './types';

async function solid(w: number, h: number, rgb: [number, number, number]): Promise<string> {
  const buf = await sharp({ create: { width: w, height: h, channels: 3, background: { r: rgb[0], g: rgb[1], b: rgb[2] } } }).png().toBuffer();
  return `data:image/png;base64,${buf.toString('base64')}`;
}

const gradeReply = (score: number) => JSON.stringify({ items: RUBRICS.fabric_swap.map((r) => ({ key: r.key, score, reason: score < 6 ? 'bad zone' : 'ok' })) });
const roomGradeReply = (score: number) => JSON.stringify({ items: RUBRICS.room_stage.map((r) => ({ key: r.key, score, reason: 'ok' })) });

async function fabricInput(): Promise<FabricSwapInput> {
  return {
    kind: 'fabric_swap', brandId: 'b', templateName: 'T',
    templatePhoto: await solid(40, 50, [255, 0, 0]),
    zones: [{ id: 'top', display_name: 'Top', description: 'd', location: 'l', polygon_coords: [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 50 }, { x: 0, y: 50 }] }],
    changes: [{ regionId: 'top', fabricName: 'F', weave: 'w', colorHex: '#000', category: 'c', swatch: await solid(8, 8, [0, 255, 0]) }],
  };
}

describe('runRenderJob fabric_swap', () => {
  it('walks every stage and returns done with a locked final image', async () => {
    const store = new JobStore();
    const job = store.create(await fabricInput(), 'k');
    const blue = await solid(40, 50, [0, 0, 255]);
    const generate = vi.fn<(req: GenerateRequest) => Promise<string>>(async () => blue);
    const ask = vi.fn(async () => gradeReply(8));
    const stages: string[] = [];
    const out = await runRenderJob(job, { generate, ask, sleep: async () => undefined, onUpdate: (j) => stages.push(j.stage) });
    expect(out.status).toBe('done');
    expect(generate).toHaveBeenCalledTimes(CANDIDATES_PER_ROUND);
    expect(ask).toHaveBeenCalledTimes(CANDIDATES_PER_ROUND);
    expect(out.candidates).toHaveLength(3);
    expect(out.result).not.toHaveProperty('candidates');
    expect(out.result?.chosenId).toBe(out.candidates[0].id);
    expect(out.result?.prompt).toContain('Replace the Top');
    expect(stages).toEqual(expect.arrayContaining(['generate', 'grade', 'lock', 'store']));
    // seeds differ per candidate
    const seeds = generate.mock.calls.map((c: any) => c[0].seed);
    expect(new Set(seeds).size).toBe(3);
    // aspect ratio derived from the photo (40x50 -> 4:5)
    expect(generate.mock.calls[0][0].aspectRatio).toBe('4:5');
    // final image keeps the original's size
    expect(out.result?.finalImage.startsWith('data:image/png;base64,')).toBe(true);
  });

  it('retries a retryable generate error then succeeds', async () => {
    const store = new JobStore();
    const job = store.create(await fabricInput(), 'k');
    const blue = await solid(40, 50, [0, 0, 255]);
    let n = 0;
    const generate = vi.fn(async () => { if (n++ === 0) throw new RetryableError('429'); return blue; });
    const out = await runRenderJob(job, { generate, ask: async () => gradeReply(9), sleep: async () => undefined });
    expect(out.status).toBe('done');
    expect(generate).toHaveBeenCalledTimes(CANDIDATES_PER_ROUND + 1);
  });

  it('fails the job on a fatal error with its message', async () => {
    const store = new JobStore();
    const job = store.create(await fabricInput(), 'k');
    const out = await runRenderJob(job, { generate: async () => { throw new FatalError('bad key', 'BAD_KEY'); }, ask: async () => gradeReply(9), sleep: async () => undefined });
    expect(out.status).toBe('failed');
    expect(out.error).toBe('bad key');
  });

  it('runs a second round with the grader reasons and ends needs_review when nothing passes', async () => {
    const store = new JobStore();
    const job = store.create(await fabricInput(), 'k');
    const blue = await solid(40, 50, [0, 0, 255]);
    const generate = vi.fn<(req: GenerateRequest) => Promise<string>>(async () => blue);
    const ask = vi.fn(async () => gradeReply(4));
    const out = await runRenderJob(job, { generate, ask, sleep: async () => undefined });
    expect(out.status).toBe('needs_review');
    expect(out.round).toBe(MAX_ROUNDS);
    expect(generate).toHaveBeenCalledTimes(CANDIDATES_PER_ROUND * MAX_ROUNDS);
    const secondRoundPrompt = generate.mock.calls[CANDIDATES_PER_ROUND][0].prompt;
    expect(secondRoundPrompt).toContain('Previous attempt problems, avoid these: target_zones: bad zone');
    expect(out.candidates).toHaveLength(6);
    expect(out.result?.finalImage).toBeTruthy(); // best candidate, locked
  });

  it('keeps the round going when one candidate never generates', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    try {
      const store = new JobStore();
      const job = store.create(await fabricInput(), 'k');
      const blue = await solid(40, 50, [0, 0, 255]);
      const generate = vi.fn<(req: GenerateRequest) => Promise<string>>(async (req) => {
        if (req.seed === 102) throw new RetryableError('exhausted');
        return blue;
      });
      const out = await runRenderJob(job, { generate, ask: async () => gradeReply(8), sleep: async () => undefined });
      expect(out.status).toBe('done');
      expect(out.candidates).toHaveLength(2);
      expect(warn).toHaveBeenCalled();
    } finally {
      warn.mockRestore();
    }
  });

  it('picks the highest passing total, not the first', async () => {
    const store = new JobStore();
    const job = store.create(await fabricInput(), 'k');
    const blue = await solid(40, 50, [0, 0, 255]);
    let g = 0;
    const scores = [7, 9, 8];
    const out = await runRenderJob(job, { generate: async () => blue, ask: async () => gradeReply(scores[g++]), sleep: async () => undefined });
    expect(out.result?.chosenId).toBe(out.candidates[1].id);
  });
});

describe('runRenderJob room_stage', () => {
  it('detects the window, prompts with it, and locks with the bbox mask', async () => {
    const store = new JobStore();
    const input: RoomStageInput = { kind: 'room_stage', brandId: 'b', roomPhoto: await solid(60, 40, [255, 0, 0]), curtainImage: await solid(10, 12, [0, 255, 0]) };
    const job = store.create(input, 'k');
    const generate = vi.fn<(req: GenerateRequest) => Promise<string>>(async () => solid(60, 40, [0, 0, 255]));
    const detectWindow = vi.fn(async () => ({ x: 25, y: 10, width: 50, height: 80 }));
    const out = await runRenderJob(job, { generate, ask: async () => roomGradeReply(8), detectWindow, sleep: async () => undefined });
    expect(out.status).toBe('done');
    expect(detectWindow).toHaveBeenCalledTimes(1);
    expect(generate.mock.calls[0][0].prompt).toContain('x 25-75%, y 10-90%');
    expect(generate.mock.calls[0][0].aspectRatio).toBe('3:2');
  });
  it('fails fatally when no window is found', async () => {
    const store = new JobStore();
    const input: RoomStageInput = { kind: 'room_stage', brandId: 'b', roomPhoto: await solid(60, 40, [255, 0, 0]), curtainImage: await solid(10, 12, [0, 255, 0]) };
    const job = store.create(input, 'k');
    const out = await runRenderJob(job, { generate: vi.fn(), ask: vi.fn(), detectWindow: async () => { throw new FatalError('no window', 'NO_WINDOW_DETECTED'); }, sleep: async () => undefined });
    expect(out.status).toBe('failed');
    expect(out.error).toBe('no window');
  });
});

describe('lockCandidate', () => {
  it('locks any candidate of a finished job against the same mask', async () => {
    const store = new JobStore();
    const job = store.create(await fabricInput(), 'k');
    const blue = await solid(40, 50, [0, 0, 255]);
    const out = await runRenderJob(job, { generate: async () => blue, ask: async () => gradeReply(8), sleep: async () => undefined });
    const other = out.candidates[2];
    const locked = await lockCandidate(out, other.id);
    expect(locked.startsWith('data:image/png;base64,')).toBe(true);
    await expect(lockCandidate(out, 'nope')).rejects.toBeInstanceOf(FatalError);
  });
});
