'use client';
import { useEffect, useMemo, useState } from 'react';
import { useT } from '@/i18n/useT';
import { PageContainer } from '@/components/ui/PageContainer';
import { Toast } from '@/components/ui/Toast';
import { usePeriodStore } from '@/store/periodStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useAuthStore } from '@/store/authStore';
import { useConditionStore } from '@/store/conditionStore';
import { currentPhase } from '@/domain/cycle/phase';
import { predictNextPeriod } from '@/domain/cycle/predictor';
import { PeriodSelectSheet } from './PeriodSelectSheet';
import type { PeriodChange } from '@/domain/cycle/periodEdit';
import { generateInsights } from '@/lib/insight/generator';
import { todayISO, daysBetween, addDaysISO } from '@/lib/date';
import { InsightCard } from './InsightCard';
import { WeekStrip } from './WeekStrip';
import { HomeHero } from './HomeHero';
import { TodayDateHeading } from './TodayDateHeading';
import { CalendarAddIcon } from './CalendarAddIcon';
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
  const updatePeriod = usePeriodStore((s) => s.update);
  const removePeriod = usePeriodStore((s) => s.remove);

  const settings = useSettingsStore((s) => s.settings);
  const settingsHydrated = useSettingsStore((s) => s.hydrated);
  const updateSettings = useSettingsStore((s) => s.update);

  const authHydrated = useAuthStore((s) => s.hydrated);

  const conditionMap = useConditionStore((s) => s.byDate);
  const hydrateRange = useConditionStore((s) => s.hydrateRange);

  const [toast, setToast] = useState<string | null>(null);
  const [periodDialogOpen, setPeriodDialogOpen] = useState(false);

  useEffect(() => {
    if (!authHydrated) return;
    if (!periodsHydrated) hydratePeriods();
  }, [authHydrated, periodsHydrated, hydratePeriods]);

  useEffect(() => {
    if (!authHydrated) return;
    hydrateRange(addDaysISO(today, -INSIGHT_LOOKBACK_DAYS), today);
  }, [authHydrated, hydrateRange, today]);

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

  async function handlePeriodChanges(changes: PeriodChange[]) {
    for (const c of changes) {
      if (c.kind === 'remove') await removePeriod(c.id);
    }
    for (const c of changes) {
      if (c.kind === 'update') {
        await updatePeriod(c.id, { startDate: c.startDate, endDate: c.endDate });
      }
    }
    for (const c of changes) {
      if (c.kind === 'add') {
        await addPeriod({ startDate: c.startDate, endDate: c.endDate });
      }
    }
    if (changes.length > 0 && !settings.onboardingCompleted) {
      await updateSettings({ onboardingCompleted: true });
    }
    setPeriodDialogOpen(false);
  }

  if (!authHydrated || !settingsHydrated || (periodsLoading && !periodsHydrated)) {
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

      <div className="flex flex-col gap-5 pt-12">
        <TodayDateHeading date={today} onCalendarClick={() => setPeriodDialogOpen(true)} />

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
                <CalendarAddIcon className="inline-block h-4 w-4" />
                {t.home.empty.bodySuffix}
              </p>
            }
          />
        ) : (
          <PhaseAdvicePill phase={phase.phase} />
        )}
      </div>

      <div className="flex flex-col gap-12 pt-12">
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

      {periodDialogOpen ? (
        <PeriodSelectSheet
          today={today}
          periods={periods}
          onSubmit={handlePeriodChanges}
          onCancel={() => setPeriodDialogOpen(false)}
        />
      ) : null}
    </PageContainer>
  );
}
