// src/server/renderAgent/jobs.ts
import type { RenderJob, RenderJobInput } from './types';

export const JOB_TTL_MS = 30 * 60 * 1000;

export class JobStore {
  private jobs = new Map<string, RenderJob>();
  private timers = new Map<string, NodeJS.Timeout>();

  create(input: RenderJobInput, apiKey: string | null): RenderJob {
    const id = `job-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const job: RenderJob = { id, kind: input.kind, brandId: input.brandId, status: 'queued', stage: 'prompt', round: 0, candidates: [], createdAt: Date.now(), input, apiKey };
    this.jobs.set(id, job);
    return job;
  }

  get(id: string): RenderJob | undefined {
    return this.jobs.get(id);
  }

  /** Marks the job finished and schedules its removal after JOB_TTL_MS. */
  finish(job: RenderJob, ttlMs = JOB_TTL_MS): void {
    job.finishedAt = Date.now();
    const t = setTimeout(() => { this.jobs.delete(job.id); this.timers.delete(job.id); }, ttlMs);
    if (typeof t.unref === 'function') t.unref();
    this.timers.set(job.id, t);
  }

  /** What the GET endpoint returns: no input images, no api key. */
  publicView(job: RenderJob) {
    return { id: job.id, kind: job.kind, status: job.status, stage: job.stage, round: job.round, candidates: job.candidates, result: job.result, error: job.error };
  }

  size(): number { return this.jobs.size; }
}

export const jobStore = new JobStore();
