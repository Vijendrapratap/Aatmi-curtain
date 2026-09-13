// src/lib/renderClient.test.ts
import { describe, it, expect, vi } from 'vitest';
import { startRender, pollRender, STAGE_COPY } from './renderClient';

const json = (status: number, body: any) => ({ ok: status < 400, status, json: async () => body }) as any;

describe('startRender', () => {
  it('returns the job id', async () => {
    const f = vi.fn<typeof fetch>(async () => json(202, { jobId: 'job-1' }));
    await expect(startRender({ kind: 'fabric_swap' }, f)).resolves.toBe('job-1');
    expect(f.mock.calls[0][0]).toBe('/api/render/jobs');
  });
  it('throws with the server message and code', async () => {
    const f = vi.fn(async () => json(402, { error: 'cap', code: 'QUOTA_EXCEEDED' }));
    const err = await startRender({}, f).catch((e) => e);
    expect(err.message).toBe('cap');
    expect(err.code).toBe('QUOTA_EXCEEDED');
  });
});

describe('pollRender', () => {
  it('reports each update and resolves on a terminal status', async () => {
    const states = [
      { id: 'j', kind: 'fabric_swap', status: 'running', stage: 'generate', round: 1, candidates: [] },
      { id: 'j', kind: 'fabric_swap', status: 'running', stage: 'grade', round: 1, candidates: [] },
      { id: 'j', kind: 'fabric_swap', status: 'done', stage: 'store', round: 1, candidates: [], result: { finalImage: 'x', chosenId: 'c', prompt: 'p', candidates: [] } },
    ];
    let i = 0;
    const f = vi.fn(async () => json(200, states[i++]));
    const seen: string[] = [];
    const sleep = vi.fn(async () => undefined);
    const out = await pollRender('j', (j) => seen.push(j.stage), { fetchImpl: f, intervalMs: 2000, sleep });
    expect(out.status).toBe('done');
    expect(seen).toEqual(['generate', 'grade', 'store']);
    expect(sleep).toHaveBeenCalledWith(2000);
  });
  it('rejects when the job disappears', async () => {
    const f = vi.fn(async () => json(404, { error: 'gone' }));
    await expect(pollRender('j', () => undefined, { fetchImpl: f, sleep: async () => undefined })).rejects.toThrow('gone');
  });
  it('has copy for every stage', () => {
    expect(STAGE_COPY.generate).toBe('Generating 3 options');
    expect(STAGE_COPY.grade).toBe('Checking quality');
    expect(STAGE_COPY.lock).toBe('Locking background');
  });
});
