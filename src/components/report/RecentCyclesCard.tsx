'use client';
import { useMemo } from 'react';
import { useT } from '@/i18n/useT';
import { useSettingsStore } from '@/store/settingsStore';
import type { Locale, PeriodLog } from '@/types';
import { daysBetween, formatCompactDate } from '@/lib/date';
import { isCountableCycleGap } from '@/domain/cycle/cycleGap';

interface RecentCyclesCardProps {
  periods: PeriodLog[];
  maxRows?: number;
}

interface Row {
  id: string;
  startDate: string;
  endDate?: string;
  lengthDays: number | null;
  cycleDays: number | null;
  /** 주기 값은 있지만 셀 수 있는 범위 밖이라 차트·평균·상태 판정에서 빠지는 행. */
  cycleExcluded: boolean;
}

export function RecentCyclesCard({ periods, maxRows = 6 }: RecentCyclesCardProps) {
  const t = useT();
  const locale = useSettingsStore((s) => s.settings.locale);

  const rows = useMemo<Row[]>(() => {
    const sorted = [...periods].sort((a, b) => b.startDate.localeCompare(a.startDate));
    return sorted.slice(0, maxRows).map((cur, i) => {
      const next = sorted[i + 1];
      const cycleDays = next ? daysBetween(next.startDate, cur.startDate) : null;
      return {
        id: cur.id,
        startDate: cur.startDate,
        endDate: cur.endDate,
        lengthDays: cur.endDate ? daysBetween(cur.startDate, cur.endDate) + 1 : null,
        cycleDays,
        cycleExcluded: cycleDays !== null && !isCountableCycleGap(cycleDays),
      };
    });
  }, [periods, maxRows]);

  if (rows.length === 0) return null;

  return (
    <section className="rounded-2xl bg-brand-white p-4">
      <h2 className="text-lg font-semibold leading-normal text-brand-gray900">
        {t.report.recentTitle}
      </h2>
      <ul className="mt-3 flex flex-col">
        {rows.map((r, i) => (
          <li
            key={r.id}
            className={
              i === rows.length - 1
                ? 'flex flex-col gap-0.5 pb-3.5 pt-2'
                : 'flex flex-col gap-0.5 border-b border-brand-gray200 pb-3.5 pt-2'
            }
          >
            <Row label={t.report.row.dates} value={formatRange(r, locale, t.report.row.ongoing)} />
            <Row
              label={t.report.row.length}
              value={
                r.lengthDays !== null
                  ? `${r.lengthDays}${t.report.row.daysSuffix}`
                  : t.report.row.notAvailable
              }
            />
            <Row
              label={t.report.row.cycle}
              value={
                r.cycleDays !== null
                  ? `${r.cycleDays}${t.report.row.daysSuffix}`
                  : t.report.row.notAvailable
              }
              // 목록은 기록 그대로 보여 주되, 차트·평균에서 빠지는 값이라는 걸 표시한다.
              mutedNote={r.cycleExcluded ? t.report.row.excluded : undefined}
            />
          </li>
        ))}
      </ul>
      {rows.some((r) => r.cycleExcluded) ? (
        <p className="pt-1 text-xs leading-normal text-brand-gray600">
          {t.report.recentExcludedNote}
        </p>
      ) : null}
    </section>
  );
}

function Row({ label, value, mutedNote }: { label: string; value: string; mutedNote?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-brand-gray600">{label}</span>
      <span
        className={
          'text-base font-medium ' + (mutedNote ? 'text-brand-gray500' : 'text-brand-gray900')
        }
      >
        {value}
        {mutedNote ? <span className="text-xs font-normal"> · {mutedNote}</span> : null}
      </span>
    </div>
  );
}

function formatRange(r: Row, locale: Locale, ongoing: string): string {
  const start = formatCompactDate(r.startDate, locale, { omitYear: false });
  if (!r.endDate) return `${start} ~ ${ongoing}`;
  const end = formatCompactDate(r.endDate, locale, { omitYear: true });
  return `${start} ~ ${end}`;
}
