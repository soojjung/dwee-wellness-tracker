'use client';
import { useState } from 'react';
import { useT } from '@/i18n/useT';
import { Button } from '@/components/ui/Button';
import { usePeriodStore } from '@/store/periodStore';
import { useSettingsStore } from '@/store/settingsStore';
import { todayISO } from '@/lib/date';

const MIN_CYCLE = 15;
const MAX_CYCLE = 60;
const DEFAULT_CYCLE = 28;

export function HomeEmptyForm() {
  const t = useT();
  const today = todayISO();

  const addPeriod = usePeriodStore((s) => s.add);
  const updateSettings = useSettingsStore((s) => s.update);

  const [date, setDate] = useState('');
  const [cycle, setCycle] = useState(DEFAULT_CYCLE);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    if (!date) return setError(t.onboarding.errorMissingDate);
    if (date > today) return setError(t.onboarding.errorFutureDate);
    if (cycle < MIN_CYCLE || cycle > MAX_CYCLE) return setError(t.onboarding.errorCycleRange);
    setError(null);
    setSubmitting(true);
    const created = await addPeriod({ startDate: date });
    if (!created) {
      setSubmitting(false);
      return setError(t.home.errorLabel);
    }
    await updateSettings({ averageCycleLength: cycle, onboardingCompleted: true });
    setSubmitting(false);
  }

  return (
    <section className="flex flex-col gap-5 rounded-3xl bg-brand-pink50 p-5">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-brand-gray900">{t.home.emptyHello}</h2>
        <p className="text-sm leading-relaxed text-brand-gray600">{t.home.emptyDescription}</p>
      </div>

      <label className="flex flex-col gap-1.5 text-sm text-brand-gray600">
        <span>{t.onboarding.lastPeriodLabel}</span>
        <input
          type="date"
          value={date}
          max={today}
          onChange={(e) => {
            setDate(e.target.value);
            setError(null);
          }}
          className="h-11 rounded-lg border border-brand-gray300 bg-brand-white px-3 text-base text-brand-gray900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-auth-button focus-visible:ring-offset-1"
        />
      </label>

      <div className="flex flex-col gap-1.5 text-sm text-brand-gray600">
        <span>{t.onboarding.cycleLengthTitle}</span>
        <div className="flex items-center justify-between rounded-lg border border-brand-gray300 bg-brand-white px-2 py-1">
          <Button
            variant="ghost"
            size="sm"
            aria-label={t.onboarding.decrease}
            onClick={() => {
              setCycle((n) => Math.max(MIN_CYCLE, n - 1));
              setError(null);
            }}
          >
            −
          </Button>
          <span className="text-base font-semibold tabular-nums text-brand-gray900">
            {cycle}
            <span className="ml-1 text-xs font-normal text-brand-gray600">{t.onboarding.cycleLengthUnit}</span>
          </span>
          <Button
            variant="ghost"
            size="sm"
            aria-label={t.onboarding.increase}
            onClick={() => {
              setCycle((n) => Math.min(MAX_CYCLE, n + 1));
              setError(null);
            }}
          >
            +
          </Button>
        </div>
      </div>

      {error ? <p className="text-sm text-brand-pink900">{error}</p> : null}

      <Button size="lg" fullWidth onClick={submit} disabled={submitting}>
        {submitting ? t.onboarding.saving : t.onboarding.done}
      </Button>
    </section>
  );
}
