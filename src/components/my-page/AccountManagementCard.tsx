'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useT } from '@/i18n/useT';
import { useAuthStore } from '@/store/authStore';
import { queueAppToast } from '@/lib/appToast';
import { MyPageCard } from './MyPageCard';
import { MyPageRow } from './MyPageRow';
import { LogoutConfirmDialog } from './LogoutConfirmDialog';
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
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const deleteAccount = useAuthStore((s) => s.deleteAccount);

  const [signOutDialogOpen, setSignOutDialogOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [alertVariant, setAlertVariant] = useState<AccountAlertVariant | null>(null);

  const isAuthenticated = !!user && !user.is_anonymous;
  if (!isAuthenticated) return null;

  async function handleSignOutConfirm() {
    if (signingOut) return;
    setSigningOut(true);
    // Navigate first, cleanup after. Previously we awaited the entire
    // signOut() (network round-trip + IDB resets + rehydrate) plus a
    // duplicate rehydrate before pushing — during which the settings
    // AuthGuard blanked out (user became null mid-await). Routing to
    // /login up front unmounts /settings immediately, so the blank
    // never appears. signOut() below still runs (fire-and-forget)
    // but the user is already on LoginScreen when it finishes.
    // The rehydrate that used to sit here is redundant — signOut's
    // internal applyRepoMode('local') already rehydrates every store.
    queueAppToast(t.myPage.signOutToast);
    setSignOutDialogOpen(false);
    router.push('/login');
    void signOut();
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
            onClick={() => setSignOutDialogOpen(true)}
          />
          <MyPageRow
            label={t.myPage.accountManagement.delete}
            onClick={() => setDialogOpen(true)}
          />
        </div>
      </MyPageCard>

      {signOutDialogOpen ? (
        <LogoutConfirmDialog
          onCancel={() => setSignOutDialogOpen(false)}
          onConfirm={handleSignOutConfirm}
          submitting={signingOut}
        />
      ) : null}
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
