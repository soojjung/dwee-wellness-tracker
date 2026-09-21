'use client';
import { useT } from '@/i18n/useT';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

interface WithdrawConfirmDialogProps {
  onCancel: () => void;
  onConfirm: () => void;
}

/**
 * 015_9 회원탈퇴 확인 팝업. Same shape as LogoutConfirmDialog — pink
 * exclamation badge over a single-sentence question, split cancel /
 * confirm buttons at the bottom. Confirming here routes the user to
 * the reason-collection screen (015_10~14); no delete happens yet.
 */
export function WithdrawConfirmDialog({ onCancel, onConfirm }: WithdrawConfirmDialogProps) {
  const t = useT();
  return (
    <ConfirmDialog
      titleId="withdraw-confirm-title"
      title={t.myPage.withdrawDialog.title}
      cancelLabel={t.myPage.withdrawDialog.cancel}
      confirmLabel={t.myPage.withdrawDialog.confirm}
      onCancel={onCancel}
      onConfirm={onConfirm}
    />
  );
}
