'use client';
import { useState } from 'react';
import { useSettingsStore } from '@/store/settingsStore';
import { todayISO } from '@/lib/date';
import { PeriodHistorySection } from '@/components/log/PeriodHistorySection';
import { LogEntryDialog } from '@/components/log/LogEntryDialog';
import { LogEntryFab } from '@/components/log/LogEntryFab';

export default function LogPage() {
  const today = todayISO();
  const periodLength = useSettingsStore((s) => s.settings.averagePeriodLength);
  const [open, setOpen] = useState(false);

  return (
    <>
      <PeriodHistorySection />
      <LogEntryFab onClick={() => setOpen(true)} />
      {open ? (
        <LogEntryDialog
          today={today}
          defaultPeriodLength={periodLength}
          onClose={() => setOpen(false)}
          onSaved={() => setOpen(false)}
        />
      ) : null}
    </>
  );
}
