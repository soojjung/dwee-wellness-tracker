'use client';
import { useState } from 'react';
import { useT } from '@/i18n/useT';
import { Button } from '@/components/ui/Button';
import { defaultPeriodEndDate } from '@/domain/cycle/recordPolicy';

export interface AddPeriodInput {
  startDate: string;
  endDate: string;
}

interface PeriodRangeDialogProps {
  initialStartDate: string;
  defaultPeriodLength: number;
  today: string;
  onSubmit: (input: AddPeriodInput) => Promise<void>;
  onCancel: () => void;
}

export function PeriodRangeDialog({
  initialStartDate,
  defaultPeriodLength,
  today,
  onSubmit,
  onCancel,
}: PeriodRangeDialogProps) {
  const t = useT();
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(() =>
    defaultPeriodEndDate(initialStartDate, defaultPeriodLength),
  );
  const [endDirty, setEndDirty] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const disabled =
    submitting || !startDate || !endDate || startDate > today || endDate < startDate;

  function handleStartChange(v: string) {
    setStartDate(v);
    if (!endDirty && v) {
      setEndDate(defaultPeriodEndDate(v, defaultPeriodLength));
    }
  }

  function handleEndChange(v: string) {
    setEndDate(v);
    setEndDirty(true);
  }

  async function handleSave() {
    setSubmitting(true);
    try {
      await onSubmit({ startDate, endDate });
    } finally {
      setSubmitting(false);
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
        <p className="text-center text-base font-medium text-brand-gray900">
          {t.home.startPeriodPrompt}
        </p>

        <label className="mt-5 flex flex-col gap-1.5">
          <span className="text-xs font-medium text-brand-gray800">
            {t.home.startPeriodStartLabel}
          </span>
          <input
            type="date"
            value={startDate}
            max={today}
            onChange={(e) => handleStartChange(e.target.value)}
            className="h-11 w-full rounded-lg border border-brand-gray300 bg-brand-white px-3 text-base text-brand-gray900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-auth-button focus-visible:ring-offset-1"
          />
        </label>

        <label className="mt-3 flex flex-col gap-1.5">
          <span className="text-xs font-medium text-brand-gray800">
            {t.home.startPeriodEndLabel}
          </span>
          <input
            type="date"
            value={endDate}
            min={startDate}
            onChange={(e) => handleEndChange(e.target.value)}
            className="h-11 w-full rounded-lg border border-brand-gray300 bg-brand-white px-3 text-base text-brand-gray900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-auth-button focus-visible:ring-offset-1"
          />
        </label>

        <div className="mt-5 flex flex-col gap-2">
          <Button
            variant="primary"
            size="md"
            fullWidth
            disabled={disabled}
            onClick={handleSave}
          >
            {t.home.startPeriodSave}
          </Button>
          <Button
            variant="ghost"
            size="md"
            fullWidth
            disabled={submitting}
            onClick={handleCancel}
          >
            {t.home.cancel}
          </Button>
        </div>
      </div>
    </div>
  );
}
