'use client';
import { useT } from '@/i18n/useT';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

interface DeleteStickersDialogProps {
  onCancel: () => void;
  onConfirm: () => void;
  submitting?: boolean;
}

/**
 * Confirms multi-sticker deletion from the library edit mode. Same alert
 * badge shape as LogoutConfirmDialog / DiscardDraftDialog for visual
 * consistency across destructive confirms.
 */
export function DeleteStickersDialog({
  onCancel,
  onConfirm,
  submitting = false,
}: DeleteStickersDialogProps) {
  const t = useT();
  const d = t.report.diary.customize.deleteDialog;
  return (
    <ConfirmDialog
      titleId="delete-stickers-dialog-title"
      title={d.title}
      titlePreLine
      cancelLabel={d.cancel}
      confirmLabel={d.confirm}
      onCancel={onCancel}
      onConfirm={onConfirm}
      submitting={submitting}
      zIndex={50}
    />
  );
}
