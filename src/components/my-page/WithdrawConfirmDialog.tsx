'use client';
import { useT } from '@/i18n/useT';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { useEscToClose } from '@/hooks/useEscToClose';

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
export function WithdrawConfirmDialog({
  onCancel,
  onConfirm,
}: WithdrawConfirmDialogProps) {
  const t = useT();
  useBodyScrollLock();
  useEscToClose(onCancel);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="withdraw-confirm-title"
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-6"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-[300px] overflow-hidden rounded-2xl bg-brand-white shadow-[0_8px_32px_0_rgba(0,0,0,0.18)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center gap-3 px-6 pb-5 pt-6">
          <span
            className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-pink50 text-brand-pink300"
            aria-hidden
          >
            <ExclamationIcon />
          </span>
          <p
            id="withdraw-confirm-title"
            className="text-center text-sm font-medium leading-[1.5] text-brand-gray900"
          >
            {t.myPage.withdrawDialog.title}
          </p>
        </div>
        <div className="grid grid-cols-2 border-t border-brand-gray300">
          <button
            type="button"
            onClick={onCancel}
            className="bg-brand-gray300 py-3.5 text-sm font-medium text-brand-gray900 transition-colors hover:bg-brand-gray400/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-gray900"
          >
            {t.myPage.withdrawDialog.cancel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="bg-brand-gray900 py-3.5 text-sm font-medium text-brand-white transition-colors hover:bg-brand-gray800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-white"
          >
            {t.myPage.withdrawDialog.confirm}
          </button>
        </div>
      </div>
    </div>
  );
}

function ExclamationIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6"
      aria-hidden
    >
      <path d="M12 6v8" />
      <circle cx="12" cy="17.5" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}
