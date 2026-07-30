'use client';
import { useState } from 'react';
import { useT } from '@/i18n/useT';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { useEscToClose } from '@/hooks/useEscToClose';
import { Button } from '@/components/ui/Button';

type Stage = 'first' | 'second';

interface DeleteAccountDialogProps {
  onConfirm: () => Promise<void>;
  onCancel: () => void;
  submitting: boolean;
}

export function DeleteAccountDialog({
  onConfirm,
  onCancel,
  submitting,
}: DeleteAccountDialogProps) {
  const t = useT();
  const a = t.settings.account;
  const [stage, setStage] = useState<Stage>('first');

  function handleCancel() {
    if (submitting) return;
    onCancel();
  }

  useBodyScrollLock();
  useEscToClose(handleCancel);

  const isFirst = stage === 'first';
  const title = isFirst ? a.deleteConfirmTitle : a.deleteReconfirmTitle;
  const body = isFirst ? a.deleteConfirmBody : a.deleteReconfirmBody;
  const primaryLabel = isFirst ? a.deleteContinue : a.deleteConfirmButton;

  async function handlePrimary() {
    if (submitting) return;
    if (isFirst) {
      setStage('second');
      return;
    }
    await onConfirm();
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-account-title"
      className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 px-5 pb-8 sm:items-center sm:pb-0"
      onClick={handleCancel}
    >
      <div
        className="w-full max-w-sm rounded-3xl bg-brand-white p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.18)]"
        onClick={(e) => e.stopPropagation()}
      >
        <p id="delete-account-title" className="text-base font-semibold text-brand-gray900">
          {title}
        </p>
        <p className="mt-1.5 text-sm leading-relaxed text-brand-gray800">{body}</p>

        <div className="mt-5 flex flex-col gap-2">
          <button
            type="button"
            onClick={handlePrimary}
            disabled={submitting}
            className="inline-flex h-11 items-center justify-center rounded-full bg-red-600 px-6 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
          >
            {submitting ? a.deleteBusy : primaryLabel}
          </button>
          <Button
            variant="ghost"
            size="md"
            fullWidth
            onClick={handleCancel}
            disabled={submitting}
          >
            {a.deleteCancel}
          </Button>
        </div>
      </div>
    </div>
  );
}
