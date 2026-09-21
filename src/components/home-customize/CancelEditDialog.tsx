'use client';
import { useT } from '@/i18n/useT';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

interface CancelEditDialogProps {
  onCancel: () => void;
  onConfirm: () => void;
}

export function CancelEditDialog({ onCancel, onConfirm }: CancelEditDialogProps) {
  const t = useT();
  return (
    <ConfirmDialog
      titleId="cancel-edit-dialog-title"
      title={t.home.customize.photoEditDetail.cancelDialog.title}
      cancelLabel={t.home.customize.photoEditDetail.cancelDialog.cancel}
      confirmLabel={t.home.customize.photoEditDetail.cancelDialog.confirm}
      onCancel={onCancel}
      onConfirm={onConfirm}
    />
  );
}
