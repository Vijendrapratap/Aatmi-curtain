// src/server/accountRoutes.ts
// /api/auth (login, invites), /api/admin (brands, invites), /api/data (per-brand documents), /api/model-config (a brand's own model and key settings).
import express from 'express';
import { z } from 'zod';
import { Db, COLLECTIONS, Collection, createBrand, getBrand, listBrands, listBrandUsers, listDocuments, putDocument, getDocument, deleteDocument, updateBrand, getUserByEmail, insertUser, now } from './db';
import { AuthedRequest, acceptInvite, clearSessionCookie, createInvite, createSession, deleteSession, getInviteStatus, hashPassword, login, publicBrand, publicUser, requireAdmin, requireUser, setSessionCookie } from './auth';
import { externalizeImages, removeOrphanImages } from './imageStore';
import { SERVER_MODEL_CONFIGS, getOrCreateBrandConfig } from './brandConfigs';
import { BrandModelConfig } from '../types/brand';

export function createAuthRouter(db: Db): express.Router {
  const r = express.Router();

  r.post('/login', (req, res) => {
    const parsed = z.object({ email: z.string().email(), password: z.string().min(1) }).safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Enter your email and password.' });
    const user = login(db, parsed.data.email, parsed.data.password);
    if (!user) return res.status(401).json({ error: 'Email or password is not right.', code: 'BAD_CREDENTIALS' });
    const brand = user.brand_id ? getBrand(db, user.brand_id) : undefined;
    if (brand && brand.status === 'suspended') return res.status(403).json({ error: 'This brand is suspended. Contact your admin.', code: 'SUSPENDED' });
    setSessionCookie(res, createSession(db, user.id));
    res.json({ user: publicUser(user), brand: brand ? publicBrand(brand) : null });
  });

  r.post('/logout', (req: AuthedRequest, res) => {
    deleteSession(db, req.sessionToken);
    clearSessionCookie(res);
    res.json({ ok: true });
  });

  r.get('/me', (req: AuthedRequest, res) => {
    if (!req.user) return res.status(401).json({ error: 'Not signed in.', code: 'UNAUTHENTICATED' });
    const brand = req.user.brand_id ? getBrand(db, req.user.brand_id) : undefined;
    res.json({ user: publicUser(req.user), brand: brand ? publicBrand(brand) : null });
  });

  r.get('/invite/:token', (req, res) => {
    const s = getInviteStatus(db, req.params.token);
    if (s.status === 'ok') return res.json({ email: s.invite.email, brandName: s.brand.name, expiresAt: s.invite.expires_at });
    res.status(s.status === 'not_found' ? 404 : 410).json({ error: s.status === 'used' ? 'This invite has already been used.' : s.status === 'expired' ? 'This invite has expired.' : 'This invite link is not valid.', code: s.status.toUpperCase() });
  });

  r.post('/invite/:token/accept', (req, res) => {
    const parsed = z.object({ name: z.string(), password: z.string() }).safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Enter your name and a password.' });
    const result = acceptInvite(db, req.params.token, parsed.data);
    if ('error' in result) return res.status(result.code).json({ error: result.error });
    setSessionCookie(res, createSession(db, result.user.id));
    const brand = getBrand(db, result.user.brand_id!);
    res.status(201).json({ user: publicUser(result.user), brand: brand ? publicBrand(brand) : null });
  });

  return r;
}

export function createAdminRouter(db: Db, opts: { appUrl?: () => string } = {}): express.Router {
  const r = express.Router();
  r.use(requireAdmin);

  r.get('/brands', (_req, res) => {
    res.json({ brands: listBrands(db).map((b) => ({ ...publicBrand(b), user_count: b.user_count, users: listBrandUsers(db, b.id) })) });
  });

  r.post('/brands', (req, res) => {
    const parsed = z.object({ name: z.string().min(2), accent: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(), monthly_cap: z.number().int().min(0).optional() }).safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Give the brand a name of at least 2 characters.' });
    res.status(201).json({ brand: publicBrand(createBrand(db, parsed.data)) });
  });

  r.patch('/brands/:id', (req, res) => {
    const parsed = z.object({ name: z.string().min(2).optional(), status: z.enum(['active', 'suspended']).optional(), accent: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(), monthly_cap: z.number().int().min(0).optional() }).safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Invalid brand update.' });
    const b = updateBrand(db, req.params.id, parsed.data);
    if (!b) return res.status(404).json({ error: 'Brand not found.' });
    res.json({ brand: publicBrand(b) });
  });

  /** Direct account creation: the admin sets the password and hands it over. */
  r.post('/brands/:id/users', (req: AuthedRequest, res) => {
    const parsed = z.object({ email: z.string().email(), name: z.string().min(1), password: z.string().min(8) }).safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Enter a name, a valid email and a password of at least 8 characters.' });
    if (!getBrand(db, req.params.id)) return res.status(404).json({ error: 'Brand not found.' });
    if (getUserByEmail(db, parsed.data.email)) return res.status(409).json({ error: 'An account with this email already exists.' });
    const user = insertUser(db, { email: parsed.data.email, name: parsed.data.name, password_hash: hashPassword(parsed.data.password), role: 'brand', brand_id: req.params.id });
    res.status(201).json({ user: publicUser(user) });
  });

  r.post('/brands/:id/invites', (req: AuthedRequest, res) => {
    const parsed = z.object({ email: z.string().email() }).safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Enter a valid email address.' });
    if (!getBrand(db, req.params.id)) return res.status(404).json({ error: 'Brand not found.' });
    const invite = createInvite(db, { email: parsed.data.email, brandId: req.params.id, createdBy: req.user!.id });
    const base = (opts.appUrl?.() || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '');
    res.status(201).json({ token: invite.token, email: invite.email, url: `${base}/invite/${invite.token}`, expiresAt: invite.expires_at });
  });

  return r;
}

export function createDataRouter(db: Db, externalize: <T>(v: T) => T = externalizeImages): express.Router {
  const r = express.Router();
  r.use(requireUser);

  const collection = (name: string): Collection | null => (COLLECTIONS as readonly string[]).includes(name) ? (name as Collection) : null;
  const brandOf = (req: AuthedRequest, res: express.Response): string | null => {
    if (!req.user!.brand_id) { res.status(403).json({ error: 'Admins have no brand data. Sign in as a brand user.', code: 'NO_BRAND' }); return null; }
    return req.user!.brand_id;
  };

  r.get('/:collection', (req: AuthedRequest, res) => {
    const c = collection(req.params.collection);
    if (!c) return res.status(404).json({ error: 'Unknown collection.' });
    const brandId = brandOf(req, res);
    if (!brandId) return;
    res.json({ items: listDocuments(db, brandId, c) });
  });

  r.put('/:collection/:id', (req: AuthedRequest, res) => {
    const c = collection(req.params.collection);
    if (!c) return res.status(404).json({ error: 'Unknown collection.' });
    const brandId = brandOf(req, res);
    if (!brandId) return;
    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) return res.status(400).json({ error: 'Send the document as a JSON object.' });
    const doc = externalize({ ...req.body, id: req.params.id, brand_id: brandId });
    putDocument(db, brandId, c, req.params.id, doc);
    res.json({ item: doc });
  });

  r.delete('/:collection/:id', (req: AuthedRequest, res) => {
    const c = collection(req.params.collection);
    if (!c) return res.status(404).json({ error: 'Unknown collection.' });
    const brandId = brandOf(req, res);
    if (!brandId) return;
    const existing = getDocument(db, brandId, c, req.params.id);
    const deleted = deleteDocument(db, brandId, c, req.params.id);
    if (deleted) removeOrphanImages(db, existing);
    res.json({ deleted });
  });

  return r;
}

/** A brand's own model / key settings. Quota fields are admin-only (PATCH /api/admin/brands/:id) and the key is never sent back. */
export function createModelConfigRouter(): express.Router {
  const r = express.Router();
  r.use(requireUser);
  const redact = (c: BrandModelConfig) => ({ ...c, byo_api_key_encrypted: c.byo_api_key_encrypted ? '••••' : null });
  const brandOf = (req: AuthedRequest, res: express.Response): string | null => {
    if (!req.user!.brand_id) { res.status(403).json({ error: 'Admins have no brand settings. Sign in as a brand user.', code: 'NO_BRAND' }); return null; }
    return req.user!.brand_id;
  };
  const patchSchema = z.object({
    region_edit_provider: z.string().min(1).optional(),
    room_preview_provider: z.string().min(1).optional(),
    key_mode: z.enum(['platform_managed', 'brand_byo_key']).optional(),
    byo_provider: z.string().nullable().optional(),
    byo_api_key_encrypted: z.string().min(1).nullable().optional(), // omitted = keep the stored key
  });

  r.get('/', (req: AuthedRequest, res) => {
    const brandId = brandOf(req, res);
    if (brandId) res.json({ config: redact(getOrCreateBrandConfig(brandId)) });
  });

  r.patch('/', (req: AuthedRequest, res) => {
    const brandId = brandOf(req, res);
    if (!brandId) return;
    const parsed = patchSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Invalid model settings.' });
    const existing = getOrCreateBrandConfig(brandId);
    const updated = { ...existing, ...parsed.data, updated_at: now(), updated_by_user_id: req.user!.id } as BrandModelConfig;
    SERVER_MODEL_CONFIGS.set(brandId, updated);
    res.json({ config: redact(updated) });
  });

  return r;
}
