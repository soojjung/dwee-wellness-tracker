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
import { AddPeriodFab } from './AddPeriodFab';
import { InsightCard } from './InsightCard';
import { WeekStrip } from './WeekStrip';
import { HomeHero } from './HomeHero';
import { TodayDateHeading } from './TodayDateHeading';
import { PhaseAdvicePill } from './PhaseAdvicePill';
import { KeywordCards } from './KeywordCards';
import { ActivitySuggestions } from './ActivitySuggestions';
import { FoodSuggestions } from './FoodSuggestions';
import { EmptyHintCard } from './EmptyHintCard';

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
  const updateSettings = useSettingsStore((s) => s.update);

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
  const homeInsights = useMemo(
    () => insights.filter((i) => i.kind !== 'cycle_regularity' && i.kind !== 'cycle_phase'),
    [insights],
  );

  const daysUntilNext = prediction.predictedDate
    ? daysBetween(today, prediction.predictedDate)
    : null;

  async function handleStartPeriod(startDate: string) {
    const created = await addPeriod({ startDate });
    if (!created) return;
    if (!settings.onboardingCompleted) {
      await updateSettings({ onboardingCompleted: true });
    }
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

  const isEmpty = periods.length === 0;

  return (
    <PageContainer className="gap-0 pb-10">
      <HomeHero isEmpty={isEmpty} />

      <div className="flex flex-col gap-5 pt-7">
        <TodayDateHeading date={today} />

        <WeekStrip
          today={today}
          periods={periods}
          predictedDate={prediction.predictedDate}
          daysUntilNext={daysUntilNext}
          averagePeriodLength={settings.averagePeriodLength}
          isEmpty={isEmpty}
        />

        {isEmpty ? (
          <EmptyHintCard
            title={t.home.empty.title}
            body={
              <p className="inline-flex items-center gap-1 text-xs text-brand-gray800">
                {t.home.empty.bodyPrefix}
                <PlusIcon />
                {t.home.empty.bodySuffix}
              </p>
            }
          />
        ) : (
          <PhaseAdvicePill phase={phase.phase} />
        )}
      </div>

      <div className="flex flex-col gap-10 pt-10">
        <section className="flex flex-col gap-5">
          <h3 className="text-2xl font-semibold text-brand-gray900">{t.home.keywordsTitle}</h3>
          {isEmpty ? (
            <EmptyHintCard body={t.home.empty.keywords} />
          ) : (
            <KeywordCards phase={phase.phase} />
          )}
        </section>

        {isEmpty ? (
          <section className="flex flex-col gap-5">
            <h3 className="text-2xl font-semibold text-brand-gray900">{t.home.activitiesTitle}</h3>
            <EmptyHintCard body={t.home.empty.activities} />
          </section>
        ) : (
          <ActivitySuggestions phase={phase.phase} />
        )}

        {isEmpty ? (
          <section className="flex flex-col gap-5">
            <h3 className="text-2xl font-semibold text-brand-gray900">{t.home.foodsTitle}</h3>
            <EmptyHintCard body={t.home.empty.foods} />
          </section>
        ) : (
          <FoodSuggestions phase={phase.phase} />
        )}

        {!isEmpty && homeInsights.length > 0 ? (
          <section className="flex flex-col gap-3">
            {homeInsights.map((ins) => (
              <InsightCard key={ins.id} insight={ins} />
            ))}
          </section>
        ) : null}
      </div>

      <Toast message={toast} />

      <AddPeriodFab today={today} onSubmit={handleStartPeriod} />
    </PageContainer>
  );
}

function PlusIcon() {
  return (
    <svg
      viewBox="0 0 12 12"
      fill="currentColor"
      className="inline-block h-3 w-3 text-brand-gray800"
      aria-hidden
    >
      <g transform="translate(0 1)">
        <path d="M12 8.18182C12 9.18597 11.1046 10 10 10H2C0.895431 10 0 9.18597 0 8.18182V5.77273C0 5.22044 0.447715 4.77273 1 4.77273H11C11.5523 4.77273 12 5.22044 12 5.77273V8.18182Z" />
        <path d="M9 0C9.55228 0 10 0.407014 10 0.909091V1.81818C11.1046 1.81818 12 2.63221 12 3.63636C12 3.8874 11.7965 4.09091 11.5455 4.09091H0.454545C0.203507 4.09091 0 3.8874 0 3.63636C0 2.63221 0.895431 1.81818 2 1.81818V0.909091C2 0.407014 2.44772 0 3 0C3.55228 0 4 0.407014 4 0.909091V1.81818H8V0.909091C8 0.407014 8.44772 0 9 0Z" />
      </g>
    </svg>
  );
}
