'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useT } from '@/i18n/useT';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';
import { useSettingsStore } from '@/store/settingsStore';
import { usePeriodStore } from '@/store/periodStore';
import { useConditionStore } from '@/store/conditionStore';
import { DeleteAccountDialog } from './DeleteAccountDialog';
import { AccountAlertDialog, type AccountAlertVariant } from './AccountAlertDialog';

export function AccountSection() {
  const t = useT();
  const a = t.settings.account;
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const deleteAccount = useAuthStore((s) => s.deleteAccount);
  const [busy, setBusy] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [alertVariant, setAlertVariant] = useState<AccountAlertVariant | null>(null);

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

  function openDeleteDialog() {
    setDialogOpen(true);
  }

  function closeDeleteDialog() {
    setDialogOpen(false);
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const result = await deleteAccount();
      setDialogOpen(false);
      setAlertVariant(result.ok ? 'success' : 'failure');
    } finally {
      setDeleting(false);
    }
  }

  function closeAlert() {
    const wasSuccess = alertVariant === 'success';
    setAlertVariant(null);
    // On success the auth user is gone; a full reload lets AuthGuard
    // bounce to /login with every store rehydrating from a clean slate.
    if (wasSuccess && typeof window !== 'undefined') window.location.assign('/');
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
          <button
            type="button"
            onClick={openDeleteDialog}
            className="mt-1 self-start text-xs font-medium text-red-600 underline underline-offset-4 hover:text-red-700 focus-visible:outline-none focus-visible:text-red-700"
          >
            {a.deleteLink}
          </button>
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

      {dialogOpen ? (
        <DeleteAccountDialog
          onConfirm={handleDelete}
          onCancel={closeDeleteDialog}
          submitting={deleting}
        />
      ) : null}

      {alertVariant ? (
        <AccountAlertDialog variant={alertVariant} onClose={closeAlert} />
      ) : null}
    </section>
  );
}
