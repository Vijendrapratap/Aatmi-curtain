// src/pages/SignIn.tsx
import React, { useState } from 'react';
import { AlertCircle, Sparkles } from 'lucide-react';
import { useBrandStore } from '../lib/brandStore';

export const SignIn: React.FC = () => {
  const { signIn } = useBrandStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await signIn(email.trim(), password);
    } catch (err: any) {
      setError(err.message || 'Could not sign in.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-[var(--color-bg-base)] p-4 font-sans text-[var(--color-text-primary)]">
      <div className="brand-card w-full max-w-md space-y-5 p-6">
        <div>
          <span className="icon-tile"><Sparkles className="h-5 w-5" /></span>
          <p className="eyebrow-label mt-4">Aatmi Curtain Studio</p>
          <h1 className="page-title">Sign in</h1>
          <p className="page-lede">Use the email your admin invited. No account yet? Ask your admin for an invite link.</p>
        </div>
        {error && <p role="alert" className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-900"><AlertCircle className="h-4 w-4 shrink-0" />{error}</p>}
        <form className="space-y-3" onSubmit={submit}>
          <div>
            <label className="field-label" htmlFor="login-email">Email</label>
            <input id="login-email" type="email" className="field" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required autoFocus />
          </div>
          <div>
            <label className="field-label" htmlFor="login-pass">Password</label>
            <input id="login-pass" type="password" className="field" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={busy || !email || !password}>{busy ? 'Signing in…' : 'Sign in'}</button>
        </form>
      </div>
    </div>
  );
};
