'use client';
import { useMemo } from 'react';
import { useT } from '@/i18n/useT';
import { useSettingsStore } from '@/store/settingsStore';
import type { PeriodLog } from '@/types';
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

  const c = t.report.row;
  const days = (n: number | null) => (n !== null ? `${n}${c.daysSuffix}` : c.notAvailable);

  return (
    <section className="rounded-2xl bg-brand-white p-4">
      <h2 className="text-lg font-semibold leading-normal text-brand-gray900">
        {t.report.recentTitle}
      </h2>
      <table className="mt-3 w-full table-fixed text-center">
        <thead>
          <tr className="text-xs font-medium text-brand-gray600">
            <th scope="col" className="pb-2 font-medium">{c.start}</th>
            <th scope="col" className="pb-2 font-medium">{c.end}</th>
            <th scope="col" className="pb-2 font-medium">{c.length}</th>
            <th scope="col" className="pb-2 font-medium">{c.cycle}</th>
          </tr>
        </thead>
        <tbody className="text-[15px] font-medium tabular-nums text-brand-gray900">
          {rows.map((r) => (
            <tr key={r.id} className="border-t border-brand-gray200">
              <td className="py-3">{formatCompactDate(r.startDate, locale)}</td>
              <td className={'py-3' + (r.endDate ? '' : ' text-brand-gray600')}>
                {r.endDate ? formatCompactDate(r.endDate, locale) : c.ongoing}
              </td>
              <td className="py-3">{days(r.lengthDays)}</td>
              {/* 목록은 기록 그대로 보여 주되, 차트·평균에서 빠지는 값은 흐리게 두고 아래 각주로 설명한다. */}
              <td className={'py-3' + (r.cycleExcluded ? ' text-brand-gray500' : '')}>
                {days(r.cycleDays)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {rows.some((r) => r.cycleExcluded) ? (
        <p className="pt-2 text-xs leading-normal text-brand-gray600">
          {t.report.recentExcludedNote}
        </p>
      ) : null}
    </section>
  );
}
