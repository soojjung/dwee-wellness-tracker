'use client';
import { useEffect, useMemo, useState } from 'react';
import { usePeriodStore } from '@/store/periodStore';
import { useSettingsStore } from '@/store/settingsStore';
import { todayISO } from '@/lib/date';
import { LogEntryDialog } from '@/components/log/LogEntryDialog';
import { ReportHeader } from './ReportHeader';
import { CycleReportCard } from './CycleReportCard';
import { RecentCyclesCard } from './RecentCyclesCard';
import { CycleReportEmpty } from './CycleReportEmpty';

const MONTHS_ON_CHART = 6;

export function CycleReportScreen() {
  const periods = usePeriodStore((s) => s.periods);
  const hydrated = usePeriodStore((s) => s.hydrated);
  const hydrate = usePeriodStore((s) => s.hydrate);
  const periodLength = useSettingsStore((s) => s.settings.averagePeriodLength);
  const today = todayISO();
  const [entryOpen, setEntryOpen] = useState(false);

  useEffect(() => {
    if (!hydrated) hydrate();
  }, [hydrated, hydrate]);

  const now = new Date();
  const months = useMemo(() => {
    const list: { year: number; monthIndex: number }[] = [];
    for (let i = MONTHS_ON_CHART - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      list.push({ year: d.getFullYear(), monthIndex: d.getMonth() });
    }
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [now.getFullYear(), now.getMonth()]);

  const showFullEmpty = hydrated && periods.length === 0;

  return (
    <>
      <ReportHeader year={now.getFullYear()} onAddClick={() => setEntryOpen(true)} />
      {showFullEmpty ? (
        <CycleReportEmpty onLogClick={() => setEntryOpen(true)} />
      ) : (
        <div className="flex flex-col gap-4 px-4 pt-4">
          <CycleReportCard periods={periods} months={months} />
          <RecentCyclesCard periods={periods} />
        </div>
      )}
      {entryOpen ? (
        <LogEntryDialog
          today={today}
          defaultPeriodLength={periodLength}
          onClose={() => setEntryOpen(false)}
          onSaved={() => setEntryOpen(false)}
        />
      ) : null}
    </>
  );
}
