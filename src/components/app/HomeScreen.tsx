'use client';
import { useEffect, useMemo, useState } from 'react';
import { useT } from '@/i18n/useT';
import { PageContainer } from '@/components/ui/PageContainer';
import { Toast } from '@/components/ui/Toast';
import { usePeriodStore } from '@/store/periodStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useConditionStore } from '@/store/conditionStore';
import { currentPhase } from '@/domain/cycle/phase';
import { predictNextPeriod } from '@/domain/cycle/predictor';
import { generateInsights } from '@/lib/insight/generator';
import { todayISO, daysBetween, addDaysISO } from '@/lib/date';
import { StartPeriodControl } from './StartPeriodControl';
import { InsightCard } from './InsightCard';
import { WeekStrip } from './WeekStrip';
import { DDayCard } from './DDayCard';
import { HomeHero } from './HomeHero';
import { HomeEmptyForm } from './HomeEmptyForm';

const TOAST_MS = 2400;
const INSIGHT_LOOKBACK_DAYS = 90;

export function HomeScreen() {
  const t = useT();
  const today = todayISO();

  const periods = usePeriodStore((s) => s.periods);
  const periodsHydrated = usePeriodStore((s) => s.hydrated);
  const periodsLoading = usePeriodStore((s) => s.loading);
  const periodsError = usePeriodStore((s) => s.error);
  const hydratePeriods = usePeriodStore((s) => s.hydrate);
  const addPeriod = usePeriodStore((s) => s.add);

  const settings = useSettingsStore((s) => s.settings);
  const settingsHydrated = useSettingsStore((s) => s.hydrated);

  const conditionMap = useConditionStore((s) => s.byDate);
  const hydrateRange = useConditionStore((s) => s.hydrateRange);

  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!periodsHydrated) hydratePeriods();
  }, [periodsHydrated, hydratePeriods]);

  useEffect(() => {
    hydrateRange(addDaysISO(today, -INSIGHT_LOOKBACK_DAYS), today);
  }, [hydrateRange, today]);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), TOAST_MS);
    return () => clearTimeout(id);
  }, [toast]);

  const conditions = useMemo(() => Object.values(conditionMap), [conditionMap]);

  const phase = useMemo(
    () => currentPhase(today, periods, settings),
    [today, periods, settings],
  );
  const prediction = useMemo(
    () => predictNextPeriod(periods, settings),
    [periods, settings],
  );
  const insights = useMemo(
    () => generateInsights({ today, periods, conditions, settings }),
    [today, periods, conditions, settings],
  );

  const daysUntilNext = prediction.predictedDate
    ? daysBetween(today, prediction.predictedDate)
    : null;

  async function handleStartPeriod(startDate: string) {
    const created = await addPeriod({ startDate });
    if (created) setToast(t.home.savedToast);
  }

  if (!settingsHydrated || (periodsLoading && !periodsHydrated)) {
    return (
      <PageContainer>
        <p className="text-sm text-neutral-500">{t.home.loadingLabel}</p>
      </PageContainer>
    );
  }
  if (periodsError) {
    return (
      <PageContainer>
        <p className="text-sm text-neutral-500">{t.home.errorLabel}</p>
      </PageContainer>
    );
  }

  if (periods.length === 0) {
    return (
      <PageContainer className="gap-6">
        <HomeHero />
        <HomeEmptyForm />
        <Toast message={toast} />
      </PageContainer>
    );
  }

  return (
    <PageContainer className="gap-6">
      <HomeHero />

      <WeekStrip today={today} periods={periods} predictedDate={prediction.predictedDate} />

      <DDayCard daysUntilNext={daysUntilNext} phase={phase.phase} />

      <StartPeriodControl today={today} onSubmit={handleStartPeriod} />

      {insights.length > 0 ? (
        <section className="flex flex-col gap-3">
          {insights.map((ins) => (
            <InsightCard key={ins.id} insight={ins} />
          ))}
        </section>
      ) : null}

      <Toast message={toast} />
    </PageContainer>
  );
}
