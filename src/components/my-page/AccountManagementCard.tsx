'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useT } from '@/i18n/useT';
import { useAuthStore } from '@/store/authStore';
import { queueAppToast } from '@/lib/appToast';
import { MyPageCard } from './MyPageCard';
import { MyPageRow } from './MyPageRow';
import { LogoutConfirmDialog } from './LogoutConfirmDialog';
import { WithdrawConfirmDialog } from './WithdrawConfirmDialog';

/**
 * `계정 관리` card. Only rendered for authenticated (non-anonymous) users.
 * Sign-out uses the existing dialog + toast handoff; account deletion
 * routes through the two-step 015_9 confirm → 015_10~14 reason screen
 * flow (`/settings/withdraw`), so this card no longer touches the
 * `deleteAccount` action directly.
 */
export function AccountManagementCard() {
  const t = useT();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);

  const [signOutDialogOpen, setSignOutDialogOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);

  const isAuthenticated = !!user && !user.is_anonymous;
  if (!isAuthenticated) return null;

  async function handleSignOutConfirm() {
    if (signingOut) return;
    setSigningOut(true);
    // Navigate first, cleanup after (see previous refactor commit for
    // why: the settings AuthGuard used to blank out mid-await if we
    // held here until signOut() finished).
    queueAppToast(t.myPage.signOutToast);
    setSignOutDialogOpen(false);
    router.push('/login');
    void signOut();
  }

  function handleWithdrawConfirm() {
    setWithdrawDialogOpen(false);
    router.push('/settings/withdraw');
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
            onClick={() => setWithdrawDialogOpen(true)}
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
      {withdrawDialogOpen ? (
        <WithdrawConfirmDialog
          onCancel={() => setWithdrawDialogOpen(false)}
          onConfirm={handleWithdrawConfirm}
        />
      ) : null}
    </>
  );
}
