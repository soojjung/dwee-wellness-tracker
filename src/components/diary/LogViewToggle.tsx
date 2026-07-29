'use client';
import { ChartIcon, DotGridIcon } from '@/components/ui/icons';

export type LogView = 'report' | 'diary';

interface LogViewToggleProps {
  current: LogView;
  onChange: (view: LogView) => void;
  reportAriaLabel: string;
  diaryAriaLabel: string;
}

export function LogViewToggle({
  current,
  onChange,
  reportAriaLabel,
  diaryAriaLabel,
}: LogViewToggleProps) {
  const isReport = current === 'report';
  return (
    <div
      role="tablist"
      aria-orientation="horizontal"
      className="relative flex items-center gap-3 rounded-lg bg-brand-gray400/40 p-1"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute left-1 top-1 h-6 w-6 rounded bg-brand-white transition-transform duration-200 ease-out"
        style={{ transform: isReport ? 'translateX(0)' : 'translateX(36px)' }}
      />
      <button
        type="button"
        role="tab"
        aria-selected={isReport}
        aria-label={reportAriaLabel}
        onClick={() => onChange('report')}
        className="relative z-10 flex h-6 w-6 items-center justify-center rounded text-brand-gray900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gray900"
      >
        <ChartIcon className="h-6 w-6" />
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={!isReport}
        aria-label={diaryAriaLabel}
        onClick={() => onChange('diary')}
        className="relative z-10 flex h-6 w-6 items-center justify-center rounded text-brand-gray900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gray900"
      >
        <DotGridIcon className="h-6 w-6" />
      </button>
    </div>
  );
}
