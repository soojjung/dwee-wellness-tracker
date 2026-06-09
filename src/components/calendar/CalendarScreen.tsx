'use client';
import { useEffect, useMemo, useState } from 'react';
import { useT } from '@/i18n/useT';
import { PageContainer } from '@/components/ui/PageContainer';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import { usePeriodStore } from '@/store/periodStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useConditionStore } from '@/store/conditionStore';
import { predictNextPeriod } from '@/domain/cycle/predictor';
import { PeriodRangeDialog, type AddPeriodInput } from '@/components/app/PeriodRangeDialog';
import { todayISO, toISO, formatMonthLabel } from '@/lib/date';
import { MonthGrid } from './MonthGrid';
import { DayDetailSheet } from './DayDetailSheet';
import { isPeriodDate } from './cellState';

const TOAST_MS = 2400;

const WEEK_STARTS_ON = 0;

export function CalendarScreen() {
  const t = useT();
  const today = todayISO();

  const periods = usePeriodStore((s) => s.periods);
  const periodsHydrated = usePeriodStore((s) => s.hydrated);
  const periodsError = usePeriodStore((s) => s.error);
  const hydratePeriods = usePeriodStore((s) => s.hydrate);
  const addPeriod = usePeriodStore((s) => s.add);
  const removePeriod = usePeriodStore((s) => s.remove);
  const updatePeriod = usePeriodStore((s) => s.update);

  const settings = useSettingsStore((s) => s.settings);
  const settingsHydrated = useSettingsStore((s) => s.hydrated);

  const conditionByDate = useConditionStore((s) => s.byDate);
  const conditionLoading = useConditionStore((s) => s.loading);
  const conditionError = useConditionStore((s) => s.error);
  const hydrateRange = useConditionStore((s) => s.hydrateRange);

  const [cursor, setCursor] = useState(() => initialCursor(today));
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [rangeStartSeed, setRangeStartSeed] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), TOAST_MS);
    return () => clearTimeout(id);
  }, [toast]);

  useEffect(() => {
    if (!periodsHydrated) hydratePeriods();
  }, [periodsHydrated, hydratePeriods]);

  useEffect(() => {
    const start = toISO(new Date(cursor.year, cursor.monthIndex, 1));
    const end = toISO(new Date(cursor.year, cursor.monthIndex + 1, 0));
    hydrateRange(start, end);
  }, [cursor, hydrateRange]);

  const prediction = useMemo(
    () => predictNextPeriod(periods, settings),
    [periods, settings],
  );

  const monthHasEntry = useMemo(
    () => detectMonthEntry(cursor, periods, conditionByDate),
    [cursor, periods, conditionByDate],
  );

  const startMatchId = useMemo(
    () => (selectedDate ? (periods.find((p) => p.startDate === selectedDate)?.id ?? null) : null),
    [periods, selectedDate],
  );
  const openRecordId = useMemo(() => {
    if (!selectedDate) return null;
    let latest: { id: string; startDate: string } | null = null;
    for (const p of periods) {
      if (p.endDate) continue;
      if (p.startDate > selectedDate) continue;
      if (!latest || p.startDate > latest.startDate) latest = { id: p.id, startDate: p.startDate };
    }
    return latest?.id ?? null;
  }, [periods, selectedDate]);

  const canAddOnSelected = !!selectedDate && !startMatchId && selectedDate <= today;

  function handleAdd(startDate: string) {
    setSelectedDate(null);
    setRangeStartSeed(startDate);
  }

  async function handleRangeSubmit(input: AddPeriodInput) {
    await addPeriod(input);
    setRangeStartSeed(null);
    setToast(t.calendar.detail.added);
  }

  async function handleRemove(id: string) {
    await removePeriod(id);
    setSelectedDate(null);
    setToast(t.calendar.detail.removed);
  }

  async function handleMarkEnd(id: string, endDate: string) {
    await updatePeriod(id, { endDate });
    setSelectedDate(null);
    setToast(t.calendar.detail.endMarked);
  }

  if (!settingsHydrated) {
    return (
      <PageContainer>
        <p className="text-sm text-neutral-500">{t.calendar.loadingLabel}</p>
      </PageContainer>
    );
  }
  if (periodsError || conditionError) {
    return (
      <PageContainer>
        <p className="text-sm text-neutral-500">{t.calendar.errorLabel}</p>
      </PageContainer>
    );
  }

  const headerDate = new Date(cursor.year, cursor.monthIndex, 1);

  return (
    <PageContainer className="gap-5 pb-24">
      <header className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCursor(shiftMonth(cursor, -1))}
          aria-label={t.calendar.previousMonth}
        >
          ‹
        </Button>
        <h1 className="text-base font-semibold text-neutral-900">
          {formatMonthLabel(headerDate, settings.locale)}
        </h1>
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
        onSelect={setSelectedDate}
      />

      {!conditionLoading && !monthHasEntry ? (
        <p className="text-center text-xs text-neutral-500">{t.calendar.emptyMonth}</p>
      ) : null}

      {selectedDate ? (
        <DayDetailSheet
          date={selectedDate}
          onClose={() => setSelectedDate(null)}
          hasPeriod={isPeriodDate(selectedDate, periods)}
          isPredicted={prediction.predictedDate === selectedDate}
          condition={conditionByDate[selectedDate] ?? null}
          startMatchId={startMatchId}
          openRecordId={openRecordId}
          canAdd={canAddOnSelected}
          onAdd={handleAdd}
          onRemove={handleRemove}
          onMarkEnd={handleMarkEnd}
        />
      ) : null}

      {rangeStartSeed ? (
        <PeriodRangeDialog
          initialStartDate={rangeStartSeed}
          defaultPeriodLength={settings.averagePeriodLength}
          today={today}
          onSubmit={handleRangeSubmit}
          onCancel={() => setRangeStartSeed(null)}
        />
      ) : null}

      <Toast message={toast} />
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

function detectMonthEntry(
  cursor: MonthCursor,
  periods: Array<{ startDate: string; endDate?: string }>,
  conditionByDate: Record<string, unknown>,
): boolean {
  const start = toISO(new Date(cursor.year, cursor.monthIndex, 1));
  const end = toISO(new Date(cursor.year, cursor.monthIndex + 1, 0));
  for (const p of periods) {
    if (p.startDate <= end && (p.endDate ?? p.startDate) >= start) return true;
  }
  for (const date of Object.keys(conditionByDate)) {
    if (date >= start && date <= end) return true;
  }
  return false;
}
