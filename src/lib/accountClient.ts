// src/lib/accountClient.ts
// Browser client for /api/auth, /api/admin and /api/data.
import type { Brand, BrandUser } from '../types/brand';

export interface SessionInfo { user: BrandUser; brand: Brand | null }

async function call<T>(method: string, url: string, body?: unknown): Promise<T> {
  const res = await fetch(url, { method, headers: body ? { 'Content-Type': 'application/json' } : undefined, body: body ? JSON.stringify(body) : undefined, credentials: 'same-origin' });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data.error || `Request failed (${res.status})`), { code: data.code, status: res.status });
  return data as T;
}

function toBrand(b: any): Brand {
  return {
    id: b.id, name: b.name, slug: b.slug, logo_url: null, theme_accent_color: b.theme_accent_color || '#5B4FE0',
    primary_contact_name: '', primary_contact_email: '', primary_contact_phone: null,
    status: b.status === 'suspended' ? 'suspended' : 'active', onboarding_step: 5, created_at: b.created_at, activated_at: b.created_at,
  };
}

function toUser(u: any): BrandUser {
  return { id: u.id, brand_id: u.brand_id || '', name: u.name, email: u.email, role: u.role === 'admin' ? 'platform_admin' : 'brand_admin', created_at: u.created_at };
}

function toSession(data: any): SessionInfo {
  return { user: toUser(data.user), brand: data.brand ? toBrand(data.brand) : null };
}

export const fetchMe = async () => toSession(await call('GET', '/api/auth/me'));
export const loginApi = async (email: string, password: string) => toSession(await call('POST', '/api/auth/login', { email, password }));
export const logoutApi = () => call<{ ok: true }>('POST', '/api/auth/logout');
export const getInviteApi = (token: string) => call<{ email: string; brandName: string; expiresAt: string }>('GET', `/api/auth/invite/${encodeURIComponent(token)}`);
export const acceptInviteApi = async (token: string, name: string, password: string) => toSession(await call('POST', `/api/auth/invite/${encodeURIComponent(token)}/accept`, { name, password }));

export interface AdminBrandUser { id: string; email: string; name: string; role: string; created_at: string }
export interface AdminBrand extends Brand { user_count: number; users: AdminBrandUser[]; monthly_generation_cap: number; monthly_generations_used: number }
const toAdminBrand = (b: any): AdminBrand => ({ ...toBrand(b), user_count: b.user_count ?? 0, users: b.users ?? [], monthly_generation_cap: b.monthly_generation_cap ?? 0, monthly_generations_used: b.monthly_generations_used ?? 0 });

export const listBrandsApi = async () => (await call<{ brands: any[] }>('GET', '/api/admin/brands')).brands.map(toAdminBrand);
export const createBrandApi = async (name: string, accent?: string) => toAdminBrand((await call<{ brand: any }>('POST', '/api/admin/brands', { name, accent })).brand);
export const patchBrandApi = async (id: string, patch: { name?: string; status?: 'active' | 'suspended'; accent?: string; monthly_cap?: number }) => toAdminBrand((await call<{ brand: any }>('PATCH', `/api/admin/brands/${id}`, patch)).brand);
export const createUserApi = (brandId: string, input: { email: string; name: string; password: string }) => call<{ user: any }>('POST', `/api/admin/brands/${brandId}/users`, input);
export const createInviteApi = (brandId: string, email: string) => call<{ token: string; email: string; url: string; expiresAt: string }>('POST', `/api/admin/brands/${brandId}/invites`, { email });

export type Collection = 'designs' | 'fabrics' | 'templates';
export const loadCollection = async <T>(c: Collection) => (await call<{ items: T[] }>('GET', `/api/data/${c}`)).items;
export const putDocumentApi = <T extends { id: string }>(c: Collection, doc: T) => call<{ item: T }>('PUT', `/api/data/${c}/${encodeURIComponent(doc.id)}`, doc).then((r) => r.item);
export const deleteDocumentApi = (c: Collection, id: string) => call<{ deleted: boolean }>('DELETE', `/api/data/${c}/${encodeURIComponent(id)}`);

export const getModelConfigApi = () => call<{ config: any }>('GET', '/api/model-config').then((r) => r.config);
export const patchModelConfigApi = (patch: Record<string, unknown>) => call<{ config: any }>('PATCH', '/api/model-config', patch).then((r) => r.config);
