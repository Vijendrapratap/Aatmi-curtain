import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import express from 'express';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createDb, createBrand, listDocuments } from './db';
import { hashPassword, verifyPassword, bootstrapAdmin, syncAdminFromEnv, login, createSession, getSessionUser, createInvite, acceptInvite, attachUser, getInviteStatus } from './auth';
import { storeImage, externalizeImages } from './imageStore';
import { createAuthRouter, createAdminRouter, createDataRouter } from './accountRoutes';

const PNG = 'data:image/png;base64,' + 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='.repeat(40);

describe('passwords and sessions', () => {
  it('hashes with a per-user salt and verifies', () => {
    const a = hashPassword('correct horse');
    const b = hashPassword('correct horse');
    expect(a).not.toBe(b);
    expect(verifyPassword('correct horse', a)).toBe(true);
    expect(verifyPassword('wrong', a)).toBe(false);
    expect(verifyPassword('x', 'garbage')).toBe(false);
  });
  it('bootstraps one admin from env and never a second', () => {
    const db = createDb(':memory:');
    expect(bootstrapAdmin(db, { ADMIN_EMAIL: 'root@x.io', ADMIN_PASSWORD: 'secret-pass' } as any)?.role).toBe('admin');
    expect(bootstrapAdmin(db, { ADMIN_EMAIL: 'other@x.io', ADMIN_PASSWORD: 'secret-pass' } as any)).toBeNull();
    expect(bootstrapAdmin(createDb(':memory:'), {} as any)).toBeNull();
  });
  it('env credentials are authoritative: a changed ADMIN_PASSWORD resets the admin password', () => {
    const db = createDb(':memory:');
    expect(syncAdminFromEnv(db, { ADMIN_EMAIL: 'Root@X.io', ADMIN_PASSWORD: 'first-pass' } as any).action).toBe('created');
    expect(syncAdminFromEnv(db, { ADMIN_EMAIL: 'root@x.io', ADMIN_PASSWORD: 'first-pass' } as any).action).toBe('unchanged');
    expect(syncAdminFromEnv(db, { ADMIN_EMAIL: 'root@x.io', ADMIN_PASSWORD: 'second-pass' } as any).action).toBe('updated');
    expect(login(db, 'root@x.io', 'first-pass')).toBeNull();
    expect(login(db, 'root@x.io', 'second-pass')?.role).toBe('admin');
    expect(syncAdminFromEnv(db, {} as any).action).toBe('skipped');
  });
  it('resolves and expires sessions', () => {
    const db = createDb(':memory:');
    const admin = bootstrapAdmin(db, { ADMIN_EMAIL: 'root@x.io', ADMIN_PASSWORD: 'secret-pass' } as any)!;
    const token = createSession(db, admin.id);
    expect(getSessionUser(db, token)?.id).toBe(admin.id);
    expect(getSessionUser(db, 'nope')).toBeNull();
    db.prepare('UPDATE sessions SET expires_at = ? WHERE token = ?').run('2000-01-01T00:00:00.000Z', token);
    expect(getSessionUser(db, token)).toBeNull();
  });
});

describe('invites', () => {
  it('is single use, scoped to a brand, and rejects short passwords', () => {
    const db = createDb(':memory:');
    const admin = bootstrapAdmin(db, { ADMIN_EMAIL: 'root@x.io', ADMIN_PASSWORD: 'secret-pass' } as any)!;
    const brand = createBrand(db, { name: 'Maison Test' });
    const inv = createInvite(db, { email: 'Staff@Brand.com', brandId: brand.id, createdBy: admin.id });
    expect(getInviteStatus(db, inv.token).status).toBe('ok');
    expect(acceptInvite(db, inv.token, { name: 'S', password: 'short' })).toMatchObject({ code: 400 });
    const ok = acceptInvite(db, inv.token, { name: 'Staff One', password: 'long-enough-1' });
    expect('user' in ok && ok.user.brand_id).toBe(brand.id);
    expect('user' in ok && ok.user.email).toBe('staff@brand.com');
    expect(getInviteStatus(db, inv.token).status).toBe('used');
    expect(acceptInvite(db, inv.token, { name: 'Again', password: 'long-enough-1' })).toMatchObject({ code: 410 });
  });
  it('expires', () => {
    const db = createDb(':memory:');
    const brand = createBrand(db, { name: 'B' });
    const inv = createInvite(db, { email: 'a@b.c', brandId: brand.id, createdBy: 'x' });
    db.prepare('UPDATE invites SET expires_at = ? WHERE token = ?').run('2000-01-01T00:00:00.000Z', inv.token);
    expect(getInviteStatus(db, inv.token).status).toBe('expired');
  });
});

describe('image store', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'aatmi-img-'));
  afterAll(() => fs.rmSync(dir, { recursive: true, force: true }));
  it('writes a data url once and returns a served path', () => {
    const url = storeImage(PNG, dir)!;
    expect(url).toMatch(/^\/images\/[0-9a-f]{32}\.png$/);
    expect(fs.existsSync(path.join(dir, path.basename(url)))).toBe(true);
    expect(storeImage(PNG, dir)).toBe(url);
    expect(storeImage('data:image/svg+xml;utf8,<svg/>', dir)).toBeNull();
  });
  it('externalizes nested images and leaves everything else alone', () => {
    const doc = { name: 'd', final_image_url: PNG, small: 'data:image/png;base64,AAAA', nested: [{ image: PNG }], n: 3 };
    const out = externalizeImages(doc, () => '/images/x.png');
    expect(out.final_image_url).toBe('/images/x.png');
    expect(out.nested[0].image).toBe('/images/x.png');
    expect(out.small).toBe('data:image/png;base64,AAAA');
    expect(out.n).toBe(3);
  });
});

describe('account routes', () => {
  const db = createDb(':memory:');
  let server: any; let base: string;
  const jar: Record<string, string> = {};
  const call = async (who: string, method: string, url: string, body?: unknown) => {
    const res = await fetch(`${base}${url}`, { method, headers: { 'Content-Type': 'application/json', ...(jar[who] ? { Cookie: jar[who] } : {}) }, body: body ? JSON.stringify(body) : undefined });
    const set = res.headers.get('set-cookie');
    if (set) jar[who] = set.split(';')[0];
    return { status: res.status, body: await res.json().catch(() => ({})) };
  };
  beforeAll(async () => {
    bootstrapAdmin(db, { ADMIN_EMAIL: 'root@x.io', ADMIN_PASSWORD: 'secret-pass' } as any);
    const app = express();
    app.use(express.json({ limit: '5mb' }));
    app.use(attachUser(db));
    app.use('/api/auth', createAuthRouter(db));
    app.use('/api/admin', createAdminRouter(db, { appUrl: () => 'https://app.test' }));
    app.use('/api/data', createDataRouter(db, (v) => externalizeImages(v, () => '/images/stored.png')));
    await new Promise<void>((r) => { server = app.listen(0, r); });
    base = `http://127.0.0.1:${server.address().port}`;
  });
  afterAll(() => server.close());

  it('rejects bad credentials and accepts good ones', async () => {
    expect((await call('admin', 'POST', '/api/auth/login', { email: 'root@x.io', password: 'nope' })).status).toBe(401);
    const ok = await call('admin', 'POST', '/api/auth/login', { email: 'root@x.io', password: 'secret-pass' });
    expect(ok.status).toBe(200);
    expect(ok.body.user.role).toBe('admin');
    expect(jar.admin).toMatch(/^aatmi_session=/);
    expect((await call('admin', 'GET', '/api/auth/me')).body.user.email).toBe('root@x.io');
  });

  it('admin creates a brand and an invite; the invitee accepts and is scoped to that brand', async () => {
    expect((await call('nobody', 'POST', '/api/admin/brands', { name: 'Maison Test' })).status).toBe(401);
    const created = await call('admin', 'POST', '/api/admin/brands', { name: 'Maison Test' });
    expect(created.status).toBe(201);
    const brandId = created.body.brand.id;
    const inv = await call('admin', 'POST', `/api/admin/brands/${brandId}/invites`, { email: 'staff@maison.test' });
    expect(inv.status).toBe(201);
    expect(inv.body.url).toBe(`https://app.test/invite/${inv.body.token}`);
    expect((await call('nobody', 'GET', `/api/auth/invite/${inv.body.token}`)).body.brandName).toBe('Maison Test');
    const acc = await call('staff', 'POST', `/api/auth/invite/${inv.body.token}/accept`, { name: 'Staff One', password: 'long-enough-1' });
    expect(acc.status).toBe(201);
    expect(acc.body.brand.id).toBe(brandId);
    expect((await call('staff', 'GET', '/api/admin/brands')).status).toBe(403);
    expect((await call('admin', 'GET', '/api/admin/brands')).body.brands.find((b: any) => b.id === brandId).user_count).toBe(1);
  });

  it('brand data is scoped, images are externalized, admins have no brand data', async () => {
    const put = await call('staff', 'PUT', '/api/data/designs/d1', { name: 'Design 1', final_image_url: PNG });
    expect(put.status).toBe(200);
    expect(put.body.item.final_image_url).toBe('/images/stored.png');
    expect(put.body.item.brand_id).toBeTruthy();
    const list = await call('staff', 'GET', '/api/data/designs');
    expect(list.body.items).toHaveLength(1);
    expect(listDocuments(db, put.body.item.brand_id, 'designs')).toHaveLength(1);
    expect((await call('admin', 'GET', '/api/data/designs')).status).toBe(403);
    expect((await call('staff', 'GET', '/api/data/nope')).status).toBe(404);
    expect((await call('staff', 'DELETE', '/api/data/designs/d1')).body.deleted).toBe(true);
    expect((await call('staff', 'GET', '/api/data/designs')).body.items).toHaveLength(0);
  });

  it('suspended brands cannot sign in; logout clears the session', async () => {
    const brands = (await call('admin', 'GET', '/api/admin/brands')).body.brands;
    const b = brands.find((x: any) => x.name === 'Maison Test');
    expect((await call('admin', 'PATCH', `/api/admin/brands/${b.id}`, { status: 'suspended' })).body.brand.status).toBe('suspended');
    expect((await call('staff2', 'POST', '/api/auth/login', { email: 'staff@maison.test', password: 'long-enough-1' })).status).toBe(403);
    await call('admin', 'PATCH', `/api/admin/brands/${b.id}`, { status: 'active' });
    expect((await call('staff', 'POST', '/api/auth/logout')).status).toBe(200);
    expect((await call('staff', 'GET', '/api/auth/me')).status).toBe(401);
  });
});
