// src/server/db.ts
// SQLite through Node's built-in driver. One file under DATA_DIR; tests use ':memory:'.
import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';

export const DATA_DIR = process.env.DATA_DIR || path.resolve(process.cwd(), 'data');

const SCHEMA = `
CREATE TABLE IF NOT EXISTS brands (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'active',
  accent TEXT NOT NULL DEFAULT '#5B4FE0',
  monthly_cap INTEGER NOT NULL DEFAULT 200,
  monthly_used INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL,
  brand_id TEXT,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS invites (
  token TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  brand_id TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'brand',
  created_by TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  used_at TEXT,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS documents (
  brand_id TEXT NOT NULL,
  collection TEXT NOT NULL,
  id TEXT NOT NULL,
  json TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (brand_id, collection, id)
);
`;

export type Db = DatabaseSync;

export function createDb(file: string): Db {
  if (file !== ':memory:') fs.mkdirSync(path.dirname(file), { recursive: true });
  const db = new DatabaseSync(file);
  if (file !== ':memory:') db.exec('PRAGMA journal_mode = WAL');
  db.exec(SCHEMA);
  return db;
}

let shared: Db | null = null;

/** The process-wide database under DATA_DIR. */
export function getDb(): Db {
  if (!shared) shared = createDb(path.join(DATA_DIR, 'aatmi.sqlite'));
  return shared;
}

export const now = () => new Date().toISOString();

export function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'brand';
}

export interface BrandRow { id: string; name: string; slug: string; status: string; accent: string; monthly_cap: number; monthly_used: number; created_at: string }
export interface UserRow { id: string; email: string; name: string; password_hash: string; role: 'admin' | 'brand'; brand_id: string | null; created_at: string }
export interface InviteRow { token: string; email: string; brand_id: string; role: string; created_by: string; expires_at: string; used_at: string | null; created_at: string }

export function getBrand(db: Db, id: string): BrandRow | undefined {
  return db.prepare('SELECT * FROM brands WHERE id = ?').get(id) as unknown as BrandRow | undefined;
}

export function listBrands(db: Db): Array<BrandRow & { user_count: number }> {
  return db.prepare('SELECT b.*, (SELECT COUNT(*) FROM users u WHERE u.brand_id = b.id) AS user_count FROM brands b ORDER BY b.created_at').all() as unknown as Array<BrandRow & { user_count: number }>;
}

export function listBrandUsers(db: Db, brandId: string): Array<{ id: string; email: string; name: string; role: string; created_at: string }> {
  return db.prepare('SELECT id, email, name, role, created_at FROM users WHERE brand_id = ? ORDER BY created_at').all(brandId) as unknown as Array<{ id: string; email: string; name: string; role: string; created_at: string }>;
}

export function createBrand(db: Db, input: { name: string; accent?: string; monthly_cap?: number }): BrandRow {
  const id = `brand-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  let slug = slugify(input.name);
  let n = 1;
  while (db.prepare('SELECT 1 FROM brands WHERE slug = ?').get(slug)) slug = `${slugify(input.name)}-${++n}`;
  db.prepare('INSERT INTO brands (id, name, slug, status, accent, monthly_cap, monthly_used, created_at) VALUES (?, ?, ?, ?, ?, ?, 0, ?)')
    .run(id, input.name.trim(), slug, 'active', input.accent || '#5B4FE0', input.monthly_cap ?? 200, now());
  return getBrand(db, id)!;
}

export function updateBrand(db: Db, id: string, patch: { name?: string; status?: string; accent?: string; monthly_cap?: number }): BrandRow | undefined {
  const b = getBrand(db, id);
  if (!b) return undefined;
  db.prepare('UPDATE brands SET name = ?, status = ?, accent = ?, monthly_cap = ? WHERE id = ?')
    .run(patch.name?.trim() || b.name, patch.status || b.status, patch.accent || b.accent, patch.monthly_cap ?? b.monthly_cap, id);
  return getBrand(db, id);
}

export function getUserByEmail(db: Db, email: string): UserRow | undefined {
  return db.prepare('SELECT * FROM users WHERE email = ?').get(email.trim().toLowerCase()) as unknown as UserRow | undefined;
}

export function getUser(db: Db, id: string): UserRow | undefined {
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id) as unknown as UserRow | undefined;
}

export function insertUser(db: Db, u: { email: string; name: string; password_hash: string; role: 'admin' | 'brand'; brand_id: string | null }): UserRow {
  const id = `usr-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  db.prepare('INSERT INTO users (id, email, name, password_hash, role, brand_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(id, u.email.trim().toLowerCase(), u.name.trim(), u.password_hash, u.role, u.brand_id, now());
  return getUser(db, id)!;
}

export function countAdmins(db: Db): number {
  return (db.prepare("SELECT COUNT(*) AS c FROM users WHERE role = 'admin'").get() as { c: number }).c;
}

// Documents (designs, fabrics, templates) per brand
export const COLLECTIONS = ['designs', 'fabrics', 'templates'] as const;
export type Collection = (typeof COLLECTIONS)[number];

export function listDocuments(db: Db, brandId: string, collection: Collection): unknown[] {
  return (db.prepare('SELECT json FROM documents WHERE brand_id = ? AND collection = ? ORDER BY updated_at').all(brandId, collection) as Array<{ json: string }>).map((r) => JSON.parse(r.json));
}

export function putDocument(db: Db, brandId: string, collection: Collection, id: string, doc: unknown): void {
  db.prepare('INSERT INTO documents (brand_id, collection, id, json, updated_at) VALUES (?, ?, ?, ?, ?) ON CONFLICT(brand_id, collection, id) DO UPDATE SET json = excluded.json, updated_at = excluded.updated_at')
    .run(brandId, collection, id, JSON.stringify(doc), now());
}

export function deleteDocument(db: Db, brandId: string, collection: Collection, id: string): boolean {
  const r = db.prepare('DELETE FROM documents WHERE brand_id = ? AND collection = ? AND id = ?').run(brandId, collection, id);
  return Number(r.changes) > 0;
}
