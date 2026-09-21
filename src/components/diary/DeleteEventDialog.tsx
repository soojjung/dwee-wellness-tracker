'use client';
import { useT } from '@/i18n/useT';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

interface DeleteEventDialogProps {
  onCancel: () => void;
  onConfirm: () => void;
  submitting?: boolean;
}

/**
 * "일정 및 기록 삭제" 확인 팝업. 예전엔 window.confirm 이었는데 iOS 홈화면 PWA
 * 등 일부 WebView 가 confirm 을 조용히 false 로 돌려 버튼이 죽은 것처럼 보였다.
 * DeleteStickersDialog 와 같은 2버튼 레이아웃.
 */
export function DeleteEventDialog({
  onCancel,
  onConfirm,
  submitting = false,
}: DeleteEventDialogProps) {
  const t = useT();
  const d = t.report.diary.eventDetail;
  return (
    <ConfirmDialog
      titleId="delete-event-dialog-title"
      title={d.deleteConfirm}
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
