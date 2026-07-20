'use client';
import { useT } from '@/i18n/useT';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { useEscToClose } from '@/hooks/useEscToClose';

interface CancelEditDialogProps {
  onCancel: () => void;
  onConfirm: () => void;
}

export function CancelEditDialog({ onCancel, onConfirm }: CancelEditDialogProps) {
  const t = useT();
  useBodyScrollLock();
  useEscToClose(onCancel);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cancel-edit-dialog-title"
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-6"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-[300px] overflow-hidden rounded-2xl bg-brand-white shadow-[0_8px_32px_0_rgba(0,0,0,0.18)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center gap-3 px-6 pb-5 pt-6">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-pink50 text-brand-pink300"
            aria-hidden
          >
            <ExclamationIcon />
          </span>
          <p
            id="cancel-edit-dialog-title"
            className="text-center text-sm font-medium leading-[1.5] text-brand-gray900"
          >
            {t.home.customize.photoEditDetail.cancelDialog.title}
          </p>
        </div>
        <div className="grid grid-cols-2 border-t border-brand-gray300">
          <button
            type="button"
            onClick={onCancel}
            className="py-3.5 text-sm font-medium text-brand-gray900 transition-colors hover:bg-brand-gray200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-gray900"
          >
            {t.home.customize.photoEditDetail.cancelDialog.cancel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="bg-brand-gray900 py-3.5 text-sm font-medium text-brand-white transition-colors hover:bg-brand-gray800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-white"
          >
            {t.home.customize.photoEditDetail.cancelDialog.confirm}
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
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden
    >
      <path d="M12 8v5" />
      <circle cx="12" cy="16.5" r="0.75" fill="currentColor" stroke="none" />
    </svg>
  );
}
