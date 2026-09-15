// src/server/renderAgent/routes.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import express from 'express';
import sharp from 'sharp';
import { createRenderRouter } from './routes';
import { JobStore } from './jobs';
import { RUBRICS } from './grading';
import { SERVER_MODEL_CONFIGS } from '../brandConfigs';

async function solid(w: number, h: number): Promise<string> {
  const buf = await sharp({ create: { width: w, height: h, channels: 3, background: { r: 200, g: 10, b: 10 } } }).png().toBuffer();
  return `data:image/png;base64,${buf.toString('base64')}`;
}

let server: any; let base: string;
const store = new JobStore();
const grade = JSON.stringify({ items: RUBRICS.fabric_swap.map((r) => ({ key: r.key, score: 9, reason: 'ok' })) });

beforeAll(async () => {
  process.env.OPENROUTER_API_KEY = 'test-openrouter-key-0001';
  const app = express();
  app.use(express.json({ limit: '50mb' }));
  app.use('/api/render', createRenderRouter({ store, deps: { generate: async () => solid(40, 50), ask: async () => grade, sleep: async () => undefined } }));
  await new Promise<void>((r) => { server = app.listen(0, r); });
  base = `http://127.0.0.1:${server.address().port}`;
});
afterAll(() => server.close());

async function validBody() {
  return {
    kind: 'fabric_swap', brandId: 'brand-test', templateName: 'T', variations: 3, templatePhoto: await solid(40, 50),
    zones: [{ id: 'top', display_name: 'Top', description: 'd', location: 'l', polygon_coords: [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 50 }, { x: 0, y: 50 }] }],
    changes: [{ regionId: 'top', fabricName: 'F', weave: 'w', colorHex: '#000', category: 'c', swatch: await solid(8, 8) }],
  };
}

async function finishedJobId(): Promise<string> {
  const res = await fetch(`${base}/api/render/jobs`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(await validBody()) });
  const { jobId } = await res.json();
  for (let i = 0; i < 50; i++) {
    const body = await (await fetch(`${base}/api/render/jobs/${jobId}`)).json();
    if (body.status === 'done' || body.status === 'needs_review' || body.status === 'failed') return jobId;
    await new Promise((r) => setTimeout(r, 20));
  }
  throw new Error('job never finished');
}

describe('render routes', () => {
  it('accepts a job, then reports done via polling', async () => {
    const res = await fetch(`${base}/api/render/jobs`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(await validBody()) });
    expect(res.status).toBe(202);
    const { jobId } = await res.json();
    let body: any;
    for (let i = 0; i < 50; i++) {
      body = await (await fetch(`${base}/api/render/jobs/${jobId}`)).json();
      if (body.status === 'done' || body.status === 'failed') break;
      await new Promise((r) => setTimeout(r, 20));
    }
    expect(body.status).toBe('done');
    expect(body.result.finalImage).toMatch(/^data:image\/png;base64,/);
    expect(body.result.candidates).toBeUndefined();
    expect(body.candidates).toHaveLength(3);
    expect(body.candidates[0].image).toMatch(/^data:image\/png;base64,/);
    expect(body.apiKey).toBeUndefined();
    expect(body.input).toBeUndefined();
  });

  it('re-locks and returns the job when another option is chosen', async () => {
    const jobId = await finishedJobId();
    const before = await (await fetch(`${base}/api/render/jobs/${jobId}`)).json();
    const other = before.candidates[2];
    expect(other.id).not.toBe(before.result.chosenId);

    const res = await fetch(`${base}/api/render/jobs/${jobId}/choose`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ candidateId: other.id }) });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.result.chosenId).toBe(other.id);
    expect(body.result.finalImage).toMatch(/^data:image\/png;base64,/);
    expect(body.candidates).toHaveLength(3);
  });

  it('404s choose on an unknown job and 400s an unknown option', async () => {
    const missing = await fetch(`${base}/api/render/jobs/nope/choose`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ candidateId: 'x' }) });
    expect(missing.status).toBe(404);
    const jobId = await finishedJobId();
    const bad = await fetch(`${base}/api/render/jobs/${jobId}/choose`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ candidateId: 'not-a-candidate' }) });
    expect(bad.status).toBe(400);
  });
  it('rejects a body with an svg swatch', async () => {
    const b = await validBody();
    b.changes[0].swatch = 'data:image/svg+xml;charset=utf-8,%3Csvg';
    const res = await fetch(`${base}/api/render/jobs`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) });
    expect(res.status).toBe(400);
  });
  it('increments the brand counter per job and refuses at the cap', async () => {
    SERVER_MODEL_CONFIGS.set('brand-capped', { id: 'c', brand_id: 'brand-capped', region_edit_provider: 'flux_kontext', room_preview_provider: 'nano_banana_pro', key_mode: 'platform_managed', monthly_generation_cap: 1, monthly_generations_used: 0, updated_at: '', updated_by_user_id: 'x' });
    const b = { ...(await validBody()), brandId: 'brand-capped' };
    const first = await fetch(`${base}/api/render/jobs`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) });
    expect(first.status).toBe(202);
    expect(SERVER_MODEL_CONFIGS.get('brand-capped')!.monthly_generations_used).toBe(1);
    const second = await fetch(`${base}/api/render/jobs`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) });
    expect(second.status).toBe(402);
    expect((await second.json()).code).toBe('QUOTA_EXCEEDED');
  });
  it('404s an unknown job', async () => {
    expect((await fetch(`${base}/api/render/jobs/nope`)).status).toBe(404);
  });

  it('hides a job from a user of another brand', async () => {
    const jobId = await finishedJobId(); // created for brand-test
    const asBrand = async (brandId: string) => {
      const app = express();
      app.use(express.json());
      app.use((req: any, _res, next) => { req.user = { brand_id: brandId }; next(); });
      app.use('/api/render', createRenderRouter({ store }));
      const s = await new Promise<any>((r) => { const x = app.listen(0, () => r(x)); });
      const b = `http://127.0.0.1:${s.address().port}`;
      const get = (await fetch(`${b}/api/render/jobs/${jobId}`)).status;
      const choose = (await fetch(`${b}/api/render/jobs/${jobId}/choose`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ candidateId: 'x' }) })).status;
      s.close();
      return { get, choose };
    };
    expect(await asBrand('brand-other')).toEqual({ get: 404, choose: 404 });
    expect((await asBrand('brand-test')).get).toBe(200);
  });
});
