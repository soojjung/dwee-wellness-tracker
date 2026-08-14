'use client';
import { useState } from 'react';
import { useT } from '@/i18n/useT';
import { useAuthStore } from '@/store/authStore';
import { useSettingsStore } from '@/store/settingsStore';
import { usePeriodStore } from '@/store/periodStore';
import { useConditionStore } from '@/store/conditionStore';
import { MyPageCard } from './MyPageCard';
import { MyPageRow } from './MyPageRow';
import { DeleteAccountDialog } from '@/components/settings/DeleteAccountDialog';
import { AccountAlertDialog, type AccountAlertVariant } from '@/components/settings/AccountAlertDialog';

/**
 * `계정 관리` card. Only rendered for authenticated (non-anonymous) users.
 * Uses the existing signOut / deleteAccount infra from the previous
 * settings screen — the dedicated 015_7 / 015_9 popup designs replace
 * these dialogs in the next batch.
 */
export function AccountManagementCard() {
  const t = useT();
  const s = t.settings.account;
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const deleteAccount = useAuthStore((s) => s.deleteAccount);

  const [busy, setBusy] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [alertVariant, setAlertVariant] = useState<AccountAlertVariant | null>(null);

  const isAuthenticated = !!user && !user.is_anonymous;
  if (!isAuthenticated) return null;

  async function handleSignOut() {
    if (busy) return;
    if (typeof window === 'undefined') return;
    if (!window.confirm(s.signOutConfirm)) return;
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
    if (wasSuccess && typeof window !== 'undefined') window.location.assign('/');
  }

  return (
    <>
      <MyPageCard title={t.myPage.accountManagement.title}>
        <div className="flex flex-col">
          <MyPageRow
            label={t.myPage.accountManagement.signOut}
            onClick={handleSignOut}
          />
          <MyPageRow
            label={t.myPage.accountManagement.delete}
            onClick={() => setDialogOpen(true)}
          />
        </div>
      </MyPageCard>

      {dialogOpen ? (
        <DeleteAccountDialog
          onConfirm={handleDelete}
          onCancel={() => setDialogOpen(false)}
          submitting={deleting}
        />
      ) : null}
      {alertVariant ? (
        <AccountAlertDialog variant={alertVariant} onClose={closeAlert} />
      ) : null}
    </>
  );
}
