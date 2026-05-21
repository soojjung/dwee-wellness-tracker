'use client';
import { useState } from 'react';
import { useT } from '@/i18n/useT';
import { Button } from '@/components/ui/Button';
import { addDaysISO } from '@/lib/date';

interface StartPeriodControlProps {
  today: string;
  onSubmit: (startDate: string) => Promise<void>;
}

type Choice = { labelKey: 'startChoiceToday' | 'startChoiceYesterday' | 'startChoice2DaysAgo'; offset: 0 | -1 | -2 };

const CHOICES: readonly Choice[] = [
  { labelKey: 'startChoiceToday', offset: 0 },
  { labelKey: 'startChoiceYesterday', offset: -1 },
  { labelKey: 'startChoice2DaysAgo', offset: -2 },
];

export function StartPeriodControl({ today, onSubmit }: StartPeriodControlProps) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!open) {
    return (
      <Button size="lg" fullWidth onClick={() => setOpen(true)}>
        {t.home.startPeriodButton}
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-center text-sm text-neutral-600">{t.home.startPeriodPrompt}</p>
      <div className="grid grid-cols-3 gap-2">
        {CHOICES.map(({ labelKey, offset }) => (
          <Button
            key={labelKey}
            variant="primary"
            size="md"
            disabled={submitting}
            onClick={async () => {
              setSubmitting(true);
              await onSubmit(addDaysISO(today, offset));
              setSubmitting(false);
              setOpen(false);
            }}
          >
            {t.home[labelKey]}
          </Button>
        ))}
      </div>
      <Button
        variant="ghost"
        size="md"
        fullWidth
        disabled={submitting}
        onClick={() => setOpen(false)}
      >
        {t.home.cancel}
      </Button>
    </div>
  );
}
