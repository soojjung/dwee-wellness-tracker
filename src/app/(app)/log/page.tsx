'use client';
import { useState } from 'react';
import { CycleReportScreen } from '@/components/report/CycleReportScreen';
import { DiaryScreen } from '@/components/diary/DiaryScreen';
import type { LogView } from '@/components/diary/LogViewToggle';

export default function LogPage() {
  const [view, setView] = useState<LogView>('diary');
  return view === 'diary' ? (
    <DiaryScreen currentView={view} onViewChange={setView} />
  ) : (
    <CycleReportScreen currentView={view} onViewChange={setView} />
  );
}
