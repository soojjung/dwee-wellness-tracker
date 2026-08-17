'use client';
import { useEffect, useMemo, useState } from 'react';
import { usePeriodStore } from '@/store/periodStore';
import { useSettingsStore } from '@/store/settingsStore';
import { todayISO } from '@/lib/date';
import { LogEntryDialog } from '@/components/log/LogEntryDialog';
import type { LogView } from '@/components/diary/LogViewToggle';
import { ReportHeader } from './ReportHeader';
import { CycleReportCard } from './CycleReportCard';
import { RecentCyclesCard } from './RecentCyclesCard';
import { CycleReportEmpty } from './CycleReportEmpty';

const MONTHS_ON_CHART = 6;

interface CycleReportScreenProps {
  currentView: LogView;
  onViewChange: (view: LogView) => void;
}

export function CycleReportScreen({ currentView, onViewChange }: CycleReportScreenProps) {
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
      {/* Match diary: fixed gray200 backdrop under the whole viewport so
          the header + gutter share the same tinted background regardless
          of content height, and content sits above via z-10. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 bg-brand-gray200"
      />
      <div className="relative z-10">
        <ReportHeader
          year={now.getFullYear()}
          onAddClick={() => setEntryOpen(true)}
          currentView={currentView}
          onViewChange={onViewChange}
        />
        {showFullEmpty ? (
          <CycleReportEmpty onLogClick={() => setEntryOpen(true)} />
        ) : (
          <div className="flex flex-col gap-4 px-4 pt-4">
            <CycleReportCard periods={periods} months={months} />
            <RecentCyclesCard periods={periods} />
          </div>
        )}
      </div>
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
