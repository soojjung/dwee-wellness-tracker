'use client';
import { useT } from '@/i18n/useT';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { useEscToClose } from '@/hooks/useEscToClose';

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
  useBodyScrollLock();
  useEscToClose(onCancel);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="discard-draft-dialog-title"
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
            id="discard-draft-dialog-title"
            className="text-center text-sm font-medium leading-[1.5] text-brand-gray900"
          >
            {t.home.customize.discardDialog.title}
          </p>
          <p className="text-center text-xs leading-[1.5] text-brand-gray800">
            {t.home.customize.discardDialog.body}
          </p>
        </div>
        <div className="grid grid-cols-2 border-t border-brand-gray300">
          <button
            type="button"
            onClick={onCancel}
            className="bg-brand-gray300 py-3.5 text-sm font-medium text-brand-gray900 transition-colors hover:bg-brand-gray400/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-gray900"
          >
            {t.home.customize.discardDialog.cancel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="bg-brand-gray900 py-3.5 text-sm font-medium text-brand-white transition-colors hover:bg-brand-gray800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-white"
          >
            {t.home.customize.discardDialog.confirm}
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
