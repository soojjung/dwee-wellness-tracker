'use client';
import { useT } from '@/i18n/useT';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

interface LogoutConfirmDialogProps {
  onCancel: () => void;
  onConfirm: () => void;
  submitting?: boolean;
}

/**
 * 015_7 sign-out confirmation. Matches the shape of DiscardDraftDialog /
 * CancelEditDialog (pink alert badge, single question line, cancel + dark
 * confirm button pair). Copy is intentionally short — the post-logout toast
 * (`myPage.signOutToast`) provides the follow-up confirmation.
 */
export function LogoutConfirmDialog({
  onCancel,
  onConfirm,
  submitting = false,
}: LogoutConfirmDialogProps) {
  const t = useT();
  return (
    <ConfirmDialog
      titleId="sign-out-dialog-title"
      title={t.myPage.signOutDialog.title}
      cancelLabel={t.myPage.signOutDialog.cancel}
      confirmLabel={t.myPage.signOutDialog.confirm}
      onCancel={onCancel}
      onConfirm={onConfirm}
      submitting={submitting}
    />
  );
}
