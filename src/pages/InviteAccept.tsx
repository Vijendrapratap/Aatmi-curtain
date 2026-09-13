// src/pages/InviteAccept.tsx
// Opened from an invite link: /invite/<token>. Sets a name and password, then signs in.
import React, { useEffect, useState } from 'react';
import { AlertCircle, Sparkles } from 'lucide-react';
import { getInviteApi } from '../lib/accountClient';
import { useBrandStore } from '../lib/brandStore';

export const InviteAccept: React.FC<{ token: string; onDone: () => void }> = ({ token, onDone }) => {
  const { acceptInvite } = useBrandStore();
  const [invite, setInvite] = useState<{ email: string; brandName: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getInviteApi(token).then(setInvite).catch((e) => setError(e.message));
  }, [token]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await acceptInvite(token, name, password);
      window.history.replaceState(null, '', '/');
      onDone();
    } catch (err: any) {
      setError(err.message || 'Could not accept the invite.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-[var(--color-bg-base)] p-4 font-sans text-[var(--color-text-primary)]">
      <div className="brand-card w-full max-w-md space-y-5 p-6">
        <div>
          <span className="icon-tile"><Sparkles className="h-5 w-5" /></span>
          <p className="eyebrow-label mt-4">You're invited</p>
          <h1 className="page-title">{invite ? `Join ${invite.brandName}` : 'Checking your invite…'}</h1>
          {invite && <p className="page-lede">Set a password for <strong className="font-semibold">{invite.email}</strong> to start generating curtain designs.</p>}
        </div>
        {error && <p role="alert" className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-900"><AlertCircle className="h-4 w-4 shrink-0" />{error}</p>}
        {invite && (
          <form className="space-y-3" onSubmit={submit}>
            <div>
              <label className="field-label" htmlFor="inv-name">Your name</label>
              <input id="inv-name" className="field" value={name} onChange={(e) => setName(e.target.value)} required autoFocus />
            </div>
            <div>
              <label className="field-label" htmlFor="inv-pass">Password</label>
              <input id="inv-pass" type="password" className="field" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} required />
              <p className="mt-1 text-[11px] text-[var(--color-text-tertiary)]">At least 8 characters.</p>
            </div>
            <button type="submit" className="btn btn-primary btn-block" disabled={busy}>{busy ? 'Creating your account…' : 'Create account and sign in'}</button>
          </form>
        )}
        {!invite && !error && <p className="text-[13px] text-[var(--color-text-secondary)]">One moment.</p>}
        {error && <a href="/" className="btn btn-ghost btn-block">Go to sign in</a>}
      </div>
    </div>
  );
};
