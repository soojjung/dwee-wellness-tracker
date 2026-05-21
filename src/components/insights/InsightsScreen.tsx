'use client';
import { useEffect, useMemo } from 'react';
import { useT } from '@/i18n/useT';
import { PageContainer } from '@/components/ui/PageContainer';
import { usePeriodStore } from '@/store/periodStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useConditionStore } from '@/store/conditionStore';
import { generateInsights } from '@/lib/insight/generator';
import { addDaysISO, todayISO } from '@/lib/date';
import { InsightCard } from '@/components/app/InsightCard';

const INSIGHT_LOOKBACK_DAYS = 180;

export function InsightsScreen() {
  const t = useT();
  const today = todayISO();

  const periods = usePeriodStore((s) => s.periods);
  const periodsHydrated = usePeriodStore((s) => s.hydrated);
  const periodsLoading = usePeriodStore((s) => s.loading);
  const periodsError = usePeriodStore((s) => s.error);
  const hydratePeriods = usePeriodStore((s) => s.hydrate);

  const settings = useSettingsStore((s) => s.settings);
  const settingsHydrated = useSettingsStore((s) => s.hydrated);

  const conditionMap = useConditionStore((s) => s.byDate);
  const conditionLoading = useConditionStore((s) => s.loading);
  const conditionError = useConditionStore((s) => s.error);
  const hydrateRange = useConditionStore((s) => s.hydrateRange);

  useEffect(() => {
    if (!periodsHydrated) hydratePeriods();
  }, [periodsHydrated, hydratePeriods]);

  useEffect(() => {
    hydrateRange(addDaysISO(today, -INSIGHT_LOOKBACK_DAYS), today);
  }, [hydrateRange, today]);

  const conditions = useMemo(() => Object.values(conditionMap), [conditionMap]);
  const insights = useMemo(
    () => generateInsights({ today, periods, conditions, settings }),
    [today, periods, conditions, settings],
  );

  if (!settingsHydrated || (periodsLoading && !periodsHydrated) || (conditionLoading && conditions.length === 0)) {
    return (
      <PageContainer>
        <p className="text-sm text-brand-gray600">{t.insight.loadingLabel}</p>
      </PageContainer>
    );
  }
  if (periodsError || conditionError) {
    return (
      <PageContainer>
        <p className="text-sm text-brand-gray600">{t.insight.errorLabel}</p>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="gap-5">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-brand-gray900">{t.insight.listTitle}</h1>
        <p className="text-sm text-brand-gray600">{t.insight.listSubtitle}</p>
      </header>

      {insights.length === 0 ? (
        <p className="rounded-2xl bg-brand-pink50 p-4 text-sm text-brand-gray600">
          {t.insight.noInsights}
        </p>
      ) : (
        <section className="flex flex-col gap-3">
          {insights.map((ins) => (
            <InsightCard key={ins.id} insight={ins} />
          ))}
        </section>
      )}
    </PageContainer>
  );
}
