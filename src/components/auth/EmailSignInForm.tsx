'use client';
import { useState, type FormEvent } from 'react';
import { useT } from '@/i18n/useT';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LEN = 6;

type Mode = 'signin' | 'signup';

interface Props {
  onSuccess: (mode: Mode) => void;
}

export function EmailSignInForm({ onSuccess }: Props) {
  const t = useT();
  const e = t.auth.email;
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const loading = useAuthStore((s) => s.loading);
  const setError = useAuthStore.setState;
  const signInWithEmail = useAuthStore((s) => s.signInWithEmail);
  const signUpWithEmail = useAuthStore((s) => s.signUpWithEmail);
  const clearError = useAuthStore((s) => s.clearError);

  async function submit(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    if (!EMAIL_RE.test(email)) {
      setError({ error: 'invalidEmail' });
      return;
    }
    if (password.length < MIN_PASSWORD_LEN) {
      setError({ error: 'weakPassword' });
      return;
    }
    clearError();
    const action = mode === 'signin' ? signInWithEmail : signUpWithEmail;
    const ok = await action(email, password);
    if (ok) onSuccess(mode);
  }

  return (
    <form className="flex flex-col gap-3" onSubmit={submit} noValidate>
      <label className="flex flex-col gap-1 text-sm font-medium text-auth-linkMuted">
        <span>{e.emailLabel}</span>
        <input
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(ev) => setEmail(ev.target.value)}
          placeholder={e.emailPlaceholder}
          className="rounded-2xl border border-brand-gray300 bg-white px-4 py-3 text-base text-brand-gray900 placeholder:text-brand-gray400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-auth-button"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium text-auth-linkMuted">
        <span>{e.passwordLabel}</span>
        <input
          type="password"
          autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
          value={password}
          onChange={(ev) => setPassword(ev.target.value)}
          placeholder={e.passwordPlaceholder}
          className="rounded-2xl border border-brand-gray300 bg-white px-4 py-3 text-base text-brand-gray900 placeholder:text-brand-gray400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-auth-button"
        />
      </label>
      <Button type="submit" size="lg" fullWidth disabled={loading}>
        {mode === 'signin' ? e.signInButton : e.signUpButton}
      </Button>
      <button
        type="button"
        onClick={() => {
          setMode(mode === 'signin' ? 'signup' : 'signin');
          clearError();
        }}
        className="mt-1 self-center rounded-sm px-2 py-1 text-sm text-auth-linkMuted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-auth-button"
      >
        {mode === 'signin' ? e.toggleToSignUp : e.toggleToSignIn}
      </button>
    </form>
  );
}
