// src/server/renderAgent/jobs.test.ts
import { describe, it, expect, vi, afterEach } from 'vitest';
import { JobStore, JOB_TTL_MS } from './jobs';
import type { FabricSwapInput } from './types';

function fabricInput(): FabricSwapInput {
  return {
    kind: 'fabric_swap',
    brandId: 'b',
    templateName: 'T',
    templatePhoto: 'data:image/png;base64,xxx',
    zones: [],
    changes: [],
  };
}

describe('JobStore', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('create returns a queued job at round 0 with the given input and apiKey, retrievable by id', () => {
    const store = new JobStore();
    const input = fabricInput();
    const job = store.create(input, 'my-key');

    expect(job.status).toBe('queued');
    expect(job.stage).toBe('prompt');
    expect(job.round).toBe(0);
    expect(job.candidates).toEqual([]);
    expect(job.input).toBe(input);
    expect(job.apiKey).toBe('my-key');
    expect(store.get(job.id)).toBe(job);
  });

  it('finish sets finishedAt and removes the job from the store after the TTL', () => {
    vi.useFakeTimers();
    const store = new JobStore();
    const job = store.create(fabricInput(), 'k');

    store.finish(job, 1000);

    expect(job.finishedAt).toBeDefined();
    expect(store.get(job.id)).toBe(job);
    expect(store.size()).toBe(1);

    vi.advanceTimersByTime(1000);

    expect(store.get(job.id)).toBeUndefined();
    expect(store.size()).toBe(0);
  });

  it('publicView omits input and apiKey and carries the public fields', () => {
    const store = new JobStore();
    const job = store.create(fabricInput(), 'secret-key');
    const view = store.publicView(job);

    expect(view).not.toHaveProperty('input');
    expect(view).not.toHaveProperty('apiKey');
    expect(view).toEqual({
      id: job.id,
      kind: job.kind,
      status: job.status,
      stage: job.stage,
      round: job.round,
      candidates: job.candidates,
      result: job.result,
      error: job.error,
    });
  });

  it('JOB_TTL_MS is 30 minutes', () => {
    expect(JOB_TTL_MS).toBe(30 * 60 * 1000);
  });
});
