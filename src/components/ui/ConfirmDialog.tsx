'use client';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { useEscToClose } from '@/hooks/useEscToClose';
import { ExclamationIcon } from './icons/ExclamationIcon';

interface ConfirmDialogProps {
  /** id the dialog's `<p>` title carries, referenced by `aria-labelledby`. */
  titleId: string;
  title: string;
  body?: string;
  cancelLabel: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
  /** Omit entirely for dialogs with no busy state (buttons never disable). */
  submitting?: boolean;
  zIndex?: 40 | 50;
  /** Renders the title with `whitespace-pre-line` for dialogs whose copy embeds line breaks. */
  titlePreLine?: boolean;
}

/**
 * Shared 2-button destructive-confirm popup (pink alert badge + title +
 * optional body + cancel/confirm split footer). See `.claude/rules/modals.md`
 * #8 for the cancel-button color history this consolidates.
 */
export function ConfirmDialog({
  titleId,
  title,
  body,
  cancelLabel,
  confirmLabel,
  onCancel,
  onConfirm,
  submitting,
  zIndex = 40,
  titlePreLine = false,
}: ConfirmDialogProps) {
  useBodyScrollLock();
  useEscToClose(onCancel);
  // Only dialogs that pass `submitting` opt into the disabled/opacity styling —
  // dialogs that never pass it keep their original (always-enabled) markup.
  const hasSubmitting = submitting !== undefined;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className={`fixed inset-0 ${zIndex === 50 ? 'z-50' : 'z-40'} flex items-center justify-center bg-black/40 px-6`}
      onClick={submitting ? undefined : onCancel}
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
            <ExclamationIcon className="h-6 w-6" />
          </span>
          <p
            id={titleId}
            className={`${titlePreLine ? 'whitespace-pre-line' : ''}text-center text-sm font-medium leading-[1.5] text-brand-gray900`}
          >
            {title}
          </p>
          {body ? (
            <p className="text-center text-xs leading-[1.5] text-brand-gray800">{body}</p>
          ) : null}
        </div>
        <div className="grid grid-cols-2 border-t border-brand-gray300">
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className={`bg-brand-gray300 py-3.5 text-sm font-medium text-brand-gray900 transition-colors hover:bg-brand-gray400/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-gray900${hasSubmitting ? 'disabled:opacity-60' : ''}`}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={submitting}
            className={`bg-brand-gray900 py-3.5 text-sm font-medium text-brand-white transition-colors hover:bg-brand-gray800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-white${hasSubmitting ? 'disabled:opacity-60' : ''}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
