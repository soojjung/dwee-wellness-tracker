'use client';
import { useMemo } from 'react';
import { useT } from '@/i18n/useT';
import { useSettingsStore } from '@/store/settingsStore';
import { daysBetween, fromISO } from '@/lib/date';
import { format } from 'date-fns';
import type { PeriodLog } from '@/types';

interface PeriodHistoryListProps {
  periods: PeriodLog[];
}

interface Row {
  id: string;
  startDate: string;
  endDate?: string;
  lengthDays: number | null;
  cycleDays: number | null;
}

export function PeriodHistoryList({ periods }: PeriodHistoryListProps) {
  const t = useT();
  const locale = useSettingsStore((s) => s.settings.locale);

  const rows = useMemo<Row[]>(() => {
    const sorted = [...periods].sort((a, b) => b.startDate.localeCompare(a.startDate));
    const out: Row[] = [];
    for (let i = 0; i < sorted.length; i++) {
      const cur = sorted[i]!;
      const next = sorted[i + 1];
      const lengthDays =
        cur.endDate ? daysBetween(cur.startDate, cur.endDate) + 1 : null;
      const cycleDays = next ? daysBetween(next.startDate, cur.startDate) : null;
      out.push({
        id: cur.id,
        startDate: cur.startDate,
        endDate: cur.endDate,
        lengthDays,
        cycleDays,
      });
    }
    return out;
  }, [periods]);

  if (rows.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-brand-gray600">{t.log.listEmpty}</p>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-brand-gray300">
      <table className="w-full text-sm text-brand-gray900">
        <thead className="bg-brand-gray200 text-xs font-medium text-brand-gray800">
          <tr>
            <th className="px-3 py-2 text-left">{t.log.listHeaderStart}</th>
            <th className="px-3 py-2 text-left">{t.log.listHeaderEnd}</th>
            <th className="px-3 py-2 text-right">{t.log.listHeaderLength}</th>
            <th className="px-3 py-2 text-right">{t.log.listHeaderCycle}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr
              key={r.id}
              className={i % 2 === 1 ? 'bg-brand-gray50' : 'bg-brand-white'}
            >
              <td className="px-3 py-2">{formatShort(r.startDate, locale)}</td>
              <td className="px-3 py-2">
                {r.endDate ? formatShort(r.endDate, locale) : (
                  <span className="text-brand-gray600">{t.log.listEndPending}</span>
                )}
              </td>
              <td className="px-3 py-2 text-right">
                {r.lengthDays !== null
                  ? `${r.lengthDays}${t.log.daysSuffix}`
                  : t.log.notAvailable}
              </td>
              <td className="px-3 py-2 text-right">
                {r.cycleDays !== null
                  ? `${r.cycleDays}${t.log.daysSuffix}`
                  : t.log.notAvailable}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatShort(iso: string, locale: 'ko' | 'en'): string {
  const d = fromISO(iso);
  return locale === 'ko' ? format(d, 'yy.MM.dd') : format(d, 'MMM d, yy');
}
