// src/server/auth.ts
// Passwords (scrypt), sessions (cookie token), invites, and the Express guards.
import crypto from 'node:crypto';
import type { Request, Response, NextFunction } from 'express';
import { Db, UserRow, InviteRow, BrandRow, getUser, getUserByEmail, insertUser, getBrand, countAdmins, now } from './db';

export const SESSION_COOKIE = 'aatmi_session';
export const SESSION_DAYS = 30;
export const INVITE_DAYS = 7;

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 32).toString('hex');
  return `scrypt$${salt}$${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [scheme, salt, hash] = stored.split('$');
  if (scheme !== 'scrypt' || !salt || !hash) return false;
  const candidate = crypto.scryptSync(password, salt, 32);
  const expected = Buffer.from(hash, 'hex');
  return candidate.length === expected.length && crypto.timingSafeEqual(candidate, expected);
}

const addDays = (days: number) => new Date(Date.now() + days * 86_400_000).toISOString();

export function createSession(db: Db, userId: string): string {
  const token = crypto.randomBytes(32).toString('base64url');
  db.prepare('INSERT INTO sessions (token, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)').run(token, userId, addDays(SESSION_DAYS), now());
  return token;
}

export function getSessionUser(db: Db, token: string | undefined): UserRow | null {
  if (!token) return null;
  const row = db.prepare('SELECT user_id, expires_at FROM sessions WHERE token = ?').get(token) as { user_id: string; expires_at: string } | undefined;
  if (!row) return null;
  if (row.expires_at < now()) { db.prepare('DELETE FROM sessions WHERE token = ?').run(token); return null; }
  return getUser(db, row.user_id) ?? null;
}

export function deleteSession(db: Db, token: string | undefined): void {
  if (token) db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
}

export function login(db: Db, email: string, password: string): UserRow | null {
  const user = getUserByEmail(db, email);
  if (!user || !verifyPassword(password, user.password_hash)) return null;
  return user;
}

export function createInvite(db: Db, input: { email: string; brandId: string; createdBy: string }): InviteRow {
  const token = crypto.randomBytes(24).toString('base64url');
  db.prepare('INSERT INTO invites (token, email, brand_id, role, created_by, expires_at, used_at, created_at) VALUES (?, ?, ?, ?, ?, ?, NULL, ?)')
    .run(token, input.email.trim().toLowerCase(), input.brandId, 'brand', input.createdBy, addDays(INVITE_DAYS), now());
  return db.prepare('SELECT * FROM invites WHERE token = ?').get(token) as unknown as InviteRow;
}

export type InviteStatus = { status: 'ok'; invite: InviteRow; brand: BrandRow } | { status: 'not_found' } | { status: 'expired' } | { status: 'used' };

export function getInviteStatus(db: Db, token: string): InviteStatus {
  const invite = db.prepare('SELECT * FROM invites WHERE token = ?').get(token) as unknown as InviteRow | undefined;
  if (!invite) return { status: 'not_found' };
  if (invite.used_at) return { status: 'used' };
  if (invite.expires_at < now()) return { status: 'expired' };
  const brand = getBrand(db, invite.brand_id);
  if (!brand) return { status: 'not_found' };
  return { status: 'ok', invite, brand };
}

export function acceptInvite(db: Db, token: string, input: { name: string; password: string }): { user: UserRow } | { error: string; code: number } {
  const s = getInviteStatus(db, token);
  if (s.status !== 'ok') return { error: s.status === 'used' ? 'This invite has already been used.' : s.status === 'expired' ? 'This invite has expired. Ask your admin for a new one.' : 'This invite link is not valid.', code: s.status === 'not_found' ? 404 : 410 };
  if (!input.name.trim()) return { error: 'Enter your name.', code: 400 };
  if (input.password.length < 8) return { error: 'Use a password of at least 8 characters.', code: 400 };
  if (getUserByEmail(db, s.invite.email)) return { error: 'An account with this email already exists. Sign in instead.', code: 409 };
  const user = insertUser(db, { email: s.invite.email, name: input.name, password_hash: hashPassword(input.password), role: 'brand', brand_id: s.invite.brand_id });
  db.prepare('UPDATE invites SET used_at = ? WHERE token = ?').run(now(), token);
  return { user };
}

/**
 * Makes ADMIN_EMAIL / ADMIN_PASSWORD authoritative: creates that admin if missing, otherwise
 * resets its password to the env value (and ensures the admin role). Returns what happened.
 */
export function syncAdminFromEnv(db: Db, env: NodeJS.ProcessEnv = process.env): { action: 'created' | 'updated' | 'unchanged' | 'skipped'; email?: string } {
  const email = env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = env.ADMIN_PASSWORD;
  if (!email || !password) return { action: 'skipped' };
  const existing = getUserByEmail(db, email);
  if (!existing) {
    insertUser(db, { email, name: env.ADMIN_NAME || 'Admin', password_hash: hashPassword(password), role: 'admin', brand_id: null });
    return { action: 'created', email };
  }
  if (existing.role === 'admin' && verifyPassword(password, existing.password_hash)) return { action: 'unchanged', email };
  db.prepare("UPDATE users SET password_hash = ?, role = 'admin', brand_id = NULL WHERE id = ?").run(hashPassword(password), existing.id);
  db.prepare('DELETE FROM sessions WHERE user_id = ?').run(existing.id);
  return { action: 'updated', email };
}

/** Kept for callers that only want the first-admin behaviour. */
export function bootstrapAdmin(db: Db, env: NodeJS.ProcessEnv = process.env): UserRow | null {
  if (countAdmins(db) > 0) return null;
  const r = syncAdminFromEnv(db, env);
  return r.action === 'created' ? getUserByEmail(db, r.email!) ?? null : null;
}

// ---- Express glue

export interface AuthedRequest extends Request { user?: UserRow; sessionToken?: string }

export function parseCookies(header: string | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  for (const part of (header || '').split(';')) {
    const i = part.indexOf('=');
    if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}

export function setSessionCookie(res: Response, token: string): void {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader('Set-Cookie', `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_DAYS * 86400}${secure}`);
}

export function clearSessionCookie(res: Response): void {
  res.setHeader('Set-Cookie', `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
}

export function attachUser(db: Db) {
  return (req: AuthedRequest, _res: Response, next: NextFunction) => {
    const token = parseCookies(req.headers.cookie)[SESSION_COOKIE];
    req.sessionToken = token;
    req.user = getSessionUser(db, token) ?? undefined;
    next();
  };
}

export function requireUser(req: AuthedRequest, res: Response, next: NextFunction) {
  if (!req.user) return res.status(401).json({ error: 'Sign in to continue.', code: 'UNAUTHENTICATED' });
  next();
}

export function requireAdmin(req: AuthedRequest, res: Response, next: NextFunction) {
  if (!req.user) return res.status(401).json({ error: 'Sign in to continue.', code: 'UNAUTHENTICATED' });
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admins only.', code: 'FORBIDDEN' });
  next();
}

export function publicUser(u: UserRow) {
  return { id: u.id, email: u.email, name: u.name, role: u.role, brand_id: u.brand_id, created_at: u.created_at };
}

export function publicBrand(b: BrandRow) {
  return { id: b.id, name: b.name, slug: b.slug, status: b.status, theme_accent_color: b.accent, monthly_generation_cap: b.monthly_cap, monthly_generations_used: b.monthly_used, created_at: b.created_at };
}
