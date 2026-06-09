'use client';
import { useEffect, useMemo, useState } from 'react';
import { useT } from '@/i18n/useT';
import { PageContainer } from '@/components/ui/PageContainer';
import { useSettingsStore } from '@/store/settingsStore';
import { usePeriodStore } from '@/store/periodStore';
import { useConditionStore } from '@/store/conditionStore';
import { predictNextPeriod } from '@/domain/cycle/predictor';
import { todayISO, toISO, formatMonthLabel } from '@/lib/date';
import { cn } from '@/lib/cn';
import { MonthGrid } from '@/components/calendar/MonthGrid';
import { Button } from '@/components/ui/Button';
import { PeriodHistoryList } from './PeriodHistoryList';

type ViewMode = 'calendar' | 'list';
const WEEK_STARTS_ON = 0;

export function PeriodHistorySection() {
  const t = useT();
  const today = todayISO();

  const periods = usePeriodStore((s) => s.periods);
  const periodsHydrated = usePeriodStore((s) => s.hydrated);
  const hydratePeriods = usePeriodStore((s) => s.hydrate);

  const settings = useSettingsStore((s) => s.settings);
  const conditionByDate = useConditionStore((s) => s.byDate);
  const hydrateRange = useConditionStore((s) => s.hydrateRange);

  const [view, setView] = useState<ViewMode>('calendar');
  const [cursor, setCursor] = useState(() => initialCursor(today));

  useEffect(() => {
    if (!periodsHydrated) hydratePeriods();
  }, [periodsHydrated, hydratePeriods]);

  useEffect(() => {
    if (view !== 'calendar') return;
    const start = toISO(new Date(cursor.year, cursor.monthIndex, 1));
    const end = toISO(new Date(cursor.year, cursor.monthIndex + 1, 0));
    hydrateRange(start, end);
  }, [view, cursor, hydrateRange]);

  const prediction = useMemo(
    () => predictNextPeriod(periods, settings),
    [periods, settings],
  );

  const headerDate = new Date(cursor.year, cursor.monthIndex, 1);
  const todayCursor = initialCursor(today);
  const onTodayMonth =
    cursor.year === todayCursor.year && cursor.monthIndex === todayCursor.monthIndex;

  return (
    <PageContainer className="gap-4 pb-24">
      <h2 className="text-lg font-semibold text-brand-gray900">{t.log.periodHistoryTitle}</h2>

      <div role="tablist" className="flex items-center gap-2">
        <ViewTab
          label={t.log.viewCalendar}
          active={view === 'calendar'}
          onClick={() => setView('calendar')}
        />
        <ViewTab
          label={t.log.viewList}
          active={view === 'list'}
          onClick={() => setView('list')}
        />
        <div className="flex-1" />
        {view === 'calendar' && !onTodayMonth ? (
          <button
            type="button"
            onClick={() => setCursor(todayCursor)}
            className="rounded-full bg-brand-gray200 px-3 py-1.5 text-sm font-medium text-brand-gray800 transition-colors hover:bg-brand-gray300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gray900 focus-visible:ring-offset-2"
          >
            {t.log.gotoToday}
          </button>
        ) : null}
      </div>

      {view === 'calendar' ? (
        <>
          <header className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCursor(shiftMonth(cursor, -1))}
              aria-label={t.calendar.previousMonth}
            >
              ‹
            </Button>
            <h3 className="text-base font-semibold text-brand-gray900">
              {formatMonthLabel(headerDate, settings.locale)}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCursor(shiftMonth(cursor, 1))}
              aria-label={t.calendar.nextMonth}
            >
              ›
            </Button>
          </header>
          <MonthGrid
            year={cursor.year}
            monthIndex={cursor.monthIndex}
            weekStartsOn={WEEK_STARTS_ON}
            today={today}
            periods={periods}
            conditionByDate={conditionByDate}
            predictedDate={prediction.predictedDate}
            onSelect={() => {
              /* read-only in /log view; use /calendar tab for edits */
            }}
          />
        </>
      ) : (
        <PeriodHistoryList periods={periods} />
      )}
    </PageContainer>
  );
}

interface MonthCursor {
  year: number;
  monthIndex: number;
}

function initialCursor(todayDate: string): MonthCursor {
  const [y, m] = todayDate.split('-').map(Number);
  return { year: y!, monthIndex: (m ?? 1) - 1 };
}

function shiftMonth(cursor: MonthCursor, delta: number): MonthCursor {
  const d = new Date(cursor.year, cursor.monthIndex + delta, 1);
  return { year: d.getFullYear(), monthIndex: d.getMonth() };
}

interface ViewTabProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

function ViewTab({ label, active, onClick }: ViewTabProps) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gray900 focus-visible:ring-offset-2',
        active
          ? 'bg-brand-gray900 text-brand-white'
          : 'bg-brand-gray200 text-brand-gray800 hover:bg-brand-gray300',
      )}
    >
      {label}
    </button>
  );
}
