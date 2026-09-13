// src/components/brand/AdminPage.tsx
// Platform admin: create brands, invite their users, suspend or reactivate.
import React, { useEffect, useState } from 'react';
import { Plus, Mail, Copy, Check, Ban, RotateCcw, AlertCircle, Building2 } from 'lucide-react';
import { AdminBrand, listBrandsApi, createBrandApi, patchBrandApi, createInviteApi } from '../../lib/accountClient';

export const AdminPage: React.FC = () => {
  const [brands, setBrands] = useState<AdminBrand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [newAccent, setNewAccent] = useState('#5B4FE0');
  const [inviteFor, setInviteFor] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteLink, setInviteLink] = useState<{ brandId: string; email: string; url: string; expiresAt: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);

  const refresh = () => listBrandsApi().then(setBrands).catch((e) => setError(e.message)).finally(() => setLoading(false));
  useEffect(() => { refresh(); }, []);

  const createBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim().length < 2) return;
    setBusy(true); setError(null);
    try { await createBrandApi(newName.trim(), newAccent); setNewName(''); await refresh(); } catch (err: any) { setError(err.message); } finally { setBusy(false); }
  };

  const createInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteFor) return;
    setBusy(true); setError(null);
    try {
      const inv = await createInviteApi(inviteFor, inviteEmail.trim());
      setInviteLink({ brandId: inviteFor, email: inv.email, url: inv.url, expiresAt: inv.expiresAt });
      setInviteEmail('');
      setInviteFor(null);
    } catch (err: any) { setError(err.message); } finally { setBusy(false); }
  };

  const setStatus = async (b: AdminBrand, status: 'active' | 'suspended') => {
    setBusy(true); setError(null);
    try { await patchBrandApi(b.id, { status }); await refresh(); } catch (err: any) { setError(err.message); } finally { setBusy(false); }
  };

  const copy = async (text: string) => {
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { setError('Could not copy. Select the link and copy it by hand.'); }
  };

  return (
    <div className="page-shell max-w-5xl space-y-6">
      <div>
        <p className="eyebrow-label">Admin</p>
        <h1 className="page-title">Brands</h1>
        <p className="page-lede">Create a brand, then invite the people who will use it. Each person gets a link to set their password.</p>
      </div>

      {error && (
        <div role="alert" className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-[13px] text-red-900">
          <span className="flex items-center gap-2"><AlertCircle className="h-4 w-4 shrink-0" />{error}</span>
          <button type="button" onClick={() => setError(null)} className="btn btn-ghost btn-sm">Dismiss</button>
        </div>
      )}

      {inviteLink && (
        <div role="status" className="brand-card space-y-2 border border-[var(--color-accent)] p-4">
          <p className="text-[13px] font-semibold">Invite for {inviteLink.email} · valid until {new Date(inviteLink.expiresAt).toLocaleDateString()}</p>
          <p className="text-[12px] text-[var(--color-text-secondary)]">Send this link to them. It works once.</p>
          <div className="flex flex-wrap items-center gap-2">
            <code className="min-w-0 flex-1 truncate rounded-[8px] bg-[var(--color-bg-sunken)] px-2 py-1.5 text-[12px]">{inviteLink.url}</code>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => copy(inviteLink.url)}>{copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />} {copied ? 'Copied' : 'Copy link'}</button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setInviteLink(null)}>Done</button>
          </div>
        </div>
      )}

      <form onSubmit={createBrand} className="brand-card flex flex-wrap items-end gap-3 p-4">
        <div className="min-w-[200px] flex-1">
          <label className="field-label" htmlFor="brand-name">New brand</label>
          <input id="brand-name" className="field" placeholder="Brand name" value={newName} onChange={(e) => setNewName(e.target.value)} />
        </div>
        <div>
          <label className="field-label" htmlFor="brand-accent">Accent</label>
          <input id="brand-accent" type="color" className="field h-10 w-16 p-1" value={newAccent} onChange={(e) => setNewAccent(e.target.value)} />
        </div>
        <button type="submit" className="btn btn-primary" disabled={busy || newName.trim().length < 2}><Plus className="h-3.5 w-3.5" /> Create brand</button>
      </form>

      <div className="space-y-3">
        {loading && <p className="text-[13px] text-[var(--color-text-secondary)]">Loading brands…</p>}
        {!loading && brands.length === 0 && <div className="brand-card p-6 text-[13px] text-[var(--color-text-secondary)]">No brands yet. Create the first one above.</div>}
        {brands.map((b) => (
          <div key={b.id} className="brand-card space-y-3 p-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg text-[11px] font-semibold text-white" style={{ backgroundColor: b.theme_accent_color }}>{b.name.slice(0, 2).toUpperCase()}</span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2 font-display text-[16px] font-semibold"><Building2 className="h-4 w-4 text-[var(--color-text-tertiary)]" />{b.name}
                  <span className={`badge ${b.status === 'active' ? 'badge-accent' : 'badge-muted'}`}>{b.status}</span>
                </span>
                <span className="block text-[12px] text-[var(--color-text-tertiary)]">{b.slug} · {b.user_count} {b.user_count === 1 ? 'user' : 'users'} · {b.monthly_generations_used}/{b.monthly_generation_cap} renders this month</span>
              </span>
              <div className="flex items-center gap-2">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => { setInviteFor(inviteFor === b.id ? null : b.id); setInviteEmail(''); }}><Mail className="h-3.5 w-3.5" /> Invite user</button>
                {b.status === 'active'
                  ? <button type="button" className="btn btn-ghost btn-sm" disabled={busy} onClick={() => setStatus(b, 'suspended')}><Ban className="h-3.5 w-3.5" /> Suspend</button>
                  : <button type="button" className="btn btn-ghost btn-sm" disabled={busy} onClick={() => setStatus(b, 'active')}><RotateCcw className="h-3.5 w-3.5" /> Reactivate</button>}
              </div>
            </div>
            {inviteFor === b.id && (
              <form onSubmit={createInvite} className="flex flex-wrap items-end gap-2 rounded-[12px] bg-[var(--color-bg-sunken)] p-3">
                <div className="min-w-[220px] flex-1">
                  <label className="field-label" htmlFor={`inv-${b.id}`}>Email to invite to {b.name}</label>
                  <input id={`inv-${b.id}`} type="email" className="field" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="person@brand.com" required autoFocus />
                </div>
                <button type="submit" className="btn btn-primary btn-sm" disabled={busy || !inviteEmail.includes('@')}>Create invite link</button>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setInviteFor(null)}>Cancel</button>
              </form>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
