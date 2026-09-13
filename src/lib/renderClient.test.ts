// src/lib/renderClient.test.ts
import { describe, it, expect, vi } from 'vitest';
import { startRender, pollRender, chooseCandidate, STAGE_COPY } from './renderClient';

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
      { id: 'j', kind: 'fabric_swap', status: 'done', stage: 'store', round: 1, candidates: [], result: { finalImage: 'x', chosenId: 'c', prompt: 'p' } },
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
  it('stops and reports CANCELLED when its signal aborts', async () => {
    const running = { id: 'j', kind: 'fabric_swap', status: 'running', stage: 'generate', round: 1, candidates: [] };
    const f = vi.fn(async () => json(200, running));
    const controller = new AbortController();
    const sleep = vi.fn(async () => { controller.abort(); });
    const err: any = await pollRender('j', () => undefined, { fetchImpl: f as any, sleep, signal: controller.signal }).catch((e) => e);
    expect(err.code).toBe('CANCELLED');
    expect(err.message).toBe('cancelled');
    expect(f).toHaveBeenCalledTimes(1);
  });

  it('times out with code TIMEOUT when the job never finishes', async () => {
    const running = { id: 'j', kind: 'fabric_swap', status: 'running', stage: 'generate', round: 1, candidates: [] };
    const f = vi.fn(async () => json(200, running));
    const err: any = await pollRender('j', () => undefined, { fetchImpl: f as any, sleep: async () => undefined, maxWaitMs: 0 }).catch((e) => e);
    expect(err.code).toBe('TIMEOUT');
    expect(err.message).toBe('Render timed out');
    expect(f).toHaveBeenCalledTimes(1);
  });

  it('has copy for every stage', () => {
    expect(STAGE_COPY.generate).toBe('Generating 3 options');
    expect(STAGE_COPY.grade).toBe('Checking quality');
    expect(STAGE_COPY.lock).toBe('Locking background');
  });
});

describe('chooseCandidate', () => {
  it('posts the candidate id and returns the updated job', async () => {
    const updated = { id: 'j', kind: 'fabric_swap', status: 'done', stage: 'store', round: 1, candidates: [], result: { finalImage: 'y', chosenId: 'c2', prompt: 'p' } };
    const f = vi.fn(async (_url: string, _init?: any) => json(200, updated));
    const out = await chooseCandidate('j', 'c2', f as any);
    expect(out.result!.chosenId).toBe('c2');
    expect(f.mock.calls[0][0]).toBe('/api/render/jobs/j/choose');
    expect(JSON.parse((f.mock.calls[0][1] as any).body)).toEqual({ candidateId: 'c2' });
  });
  it('throws the server message', async () => {
    const f = vi.fn(async (_url: string, _init?: any) => json(409, { error: 'This render is still running.', code: 'NOT_FINISHED' }));
    const err: any = await chooseCandidate('j', 'c2', f as any).catch((e) => e);
    expect(err.message).toBe('This render is still running.');
    expect(err.code).toBe('NOT_FINISHED');
  });
});
