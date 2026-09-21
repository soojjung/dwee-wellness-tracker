'use client';
import { useT } from '@/i18n/useT';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

interface DiscardDraftDialogProps {
  onCancel: () => void;
  onConfirm: () => void;
}

/**
 * Whole-session discard confirmation for the customize flow. Fired from the
 * HomeCustomize header back arrow when the draft has any dirty change —
 * confirming here throws away every photo pick and crop in the current
 * session, so the copy leans stronger than the slot-level cancel dialog.
 */
export function DiscardDraftDialog({ onCancel, onConfirm }: DiscardDraftDialogProps) {
  const t = useT();
  return (
    <ConfirmDialog
      titleId="discard-draft-dialog-title"
      title={t.home.customize.discardDialog.title}
      body={t.home.customize.discardDialog.body}
      cancelLabel={t.home.customize.discardDialog.cancel}
      confirmLabel={t.home.customize.discardDialog.confirm}
      onCancel={onCancel}
      onConfirm={onConfirm}
    />
  );
}
