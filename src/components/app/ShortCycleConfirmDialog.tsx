'use client';
import { useState } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useT } from '@/i18n/useT';
import { useSettingsStore } from '@/store/settingsStore';
import { fromISO } from '@/lib/date';
import { Button } from '@/components/ui/Button';

export type ShortCycleChoice = 'extend' | 'replace' | 'saveAnyway';

interface ShortCycleConfirmDialogProps {
  priorStartDate: string;
  daysSincePrior: number;
  onChoose: (choice: ShortCycleChoice) => Promise<void> | void;
  onCancel: () => void;
}

export function ShortCycleConfirmDialog({
  priorStartDate,
  daysSincePrior,
  onChoose,
  onCancel,
}: ShortCycleConfirmDialogProps) {
  const t = useT();
  const locale = useSettingsStore((s) => s.settings.locale);
  const [submitting, setSubmitting] = useState<ShortCycleChoice | null>(null);

  const priorLabel =
    locale === 'ko'
      ? format(fromISO(priorStartDate), 'M월 d일', { locale: ko })
      : format(fromISO(priorStartDate), 'MMM d');

  async function pick(choice: ShortCycleChoice) {
    if (submitting) return;
    setSubmitting(choice);
    try {
      await onChoose(choice);
    } finally {
      setSubmitting(null);
    }
  }

  function handleCancel() {
    if (submitting) return;
    onCancel();
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 px-5 pb-8 sm:items-center sm:pb-0"
      onClick={handleCancel}
    >
      <div
        className="w-full max-w-sm rounded-3xl bg-brand-white p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.18)]"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-base font-semibold text-brand-gray900">
          {t.home.shortCycle.title}
        </p>
        <p className="mt-1.5 text-sm leading-relaxed text-brand-gray800">
          {t.home.shortCycle.bodyPrefix}
          <strong className="font-semibold text-brand-gray900">{daysSincePrior}</strong>
          {t.home.shortCycle.bodySuffix}
        </p>
        <p className="mt-3 text-sm font-medium text-brand-gray900">
          {t.home.shortCycle.question}
        </p>

        <div className="mt-4 flex flex-col gap-2">
          <ChoiceButton
            title={t.home.shortCycle.extendTitle}
            body={t.home.shortCycle.extendBody}
            busy={submitting === 'extend'}
            disabled={submitting !== null}
            onClick={() => pick('extend')}
          />
          <ChoiceButton
            title={t.home.shortCycle.replaceTitle}
            body={
              <>
                {t.home.shortCycle.replaceBodyPrefix}
                <strong className="font-semibold text-brand-gray900">{priorLabel}</strong>
                {t.home.shortCycle.replaceBodySuffix}
              </>
            }
            busy={submitting === 'replace'}
            disabled={submitting !== null}
            onClick={() => pick('replace')}
          />
          <ChoiceButton
            title={t.home.shortCycle.saveAnywayTitle}
            body={t.home.shortCycle.saveAnywayBody}
            busy={submitting === 'saveAnyway'}
            disabled={submitting !== null}
            onClick={() => pick('saveAnyway')}
          />
        </div>

        <div className="mt-3">
          <Button
            variant="ghost"
            size="md"
            fullWidth
            disabled={submitting !== null}
            onClick={handleCancel}
          >
            {t.home.shortCycle.cancel}
          </Button>
        </div>
      </div>
    </div>
  );
}

interface ChoiceButtonProps {
  title: string;
  body: React.ReactNode;
  busy: boolean;
  disabled: boolean;
  onClick: () => void;
}

function ChoiceButton({ title, body, busy, disabled, onClick }: ChoiceButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex flex-col items-start gap-1 rounded-2xl border border-brand-gray300 bg-brand-white px-4 py-3 text-left transition-colors hover:bg-brand-gray200 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gray900 focus-visible:ring-offset-2"
    >
      <span className="text-sm font-semibold text-brand-gray900">{title}</span>
      <span className="text-xs leading-relaxed text-brand-gray800">{body}</span>
      {busy ? (
        <span className="mt-1 text-[11px] text-brand-gray600" aria-live="polite">
          ...
        </span>
      ) : null}
    </button>
  );
}
