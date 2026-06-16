'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useT } from '@/i18n/useT';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';
import { useSettingsStore } from '@/store/settingsStore';
import { usePeriodStore } from '@/store/periodStore';
import { useConditionStore } from '@/store/conditionStore';

export function AccountSection() {
  const t = useT();
  const a = t.settings.account;
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const [busy, setBusy] = useState(false);

  const isAuthenticated = !!user && !user.is_anonymous;
  const email = user?.email ?? null;

  async function handleSignOut() {
    if (typeof window === 'undefined') return;
    if (!window.confirm(a.signOutConfirm)) return;
    setBusy(true);
    try {
      await signOut();
      await Promise.all([
        useSettingsStore.getState().rehydrate(),
        usePeriodStore.getState().rehydrate(),
        useConditionStore.getState().rehydrate(),
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="flex flex-col gap-2">
      <span className="text-sm font-medium text-brand-gray900">{a.title}</span>
      {isAuthenticated ? (
        <>
          <p className="text-xs text-brand-gray600">
            {a.signedInAs}
            <span className="font-medium text-brand-gray900">{email ?? ''}</span>
          </p>
          <Button variant="secondary" size="md" onClick={handleSignOut} disabled={busy}>
            {busy ? a.signOutBusy : a.signOutButton}
          </Button>
        </>
      ) : (
        <>
          <p className="text-xs text-brand-gray600">
            <span className="font-medium text-brand-gray900">{a.anonymousLabel}</span>
            <span> — {a.signInHint}</span>
          </p>
          <Link
            href="/login"
            className="inline-flex w-fit items-center justify-center rounded-2xl bg-brand-pink200 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-pink800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink200"
          >
            {a.signInButton}
          </Link>
        </>
      )}
    </section>
  );
}
