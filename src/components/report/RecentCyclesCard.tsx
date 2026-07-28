'use client';
import { useMemo } from 'react';
import { useT } from '@/i18n/useT';
import { useSettingsStore } from '@/store/settingsStore';
import type { PeriodLog } from '@/types';
import { daysBetween, fromISO } from '@/lib/date';
import { format } from 'date-fns';

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
}

export function RecentCyclesCard({ periods, maxRows = 6 }: RecentCyclesCardProps) {
  const t = useT();
  const locale = useSettingsStore((s) => s.settings.locale);

  const rows = useMemo<Row[]>(() => {
    const sorted = [...periods].sort((a, b) => b.startDate.localeCompare(a.startDate));
    return sorted.slice(0, maxRows).map((cur, i) => {
      const next = sorted[i + 1];
      return {
        id: cur.id,
        startDate: cur.startDate,
        endDate: cur.endDate,
        lengthDays: cur.endDate ? daysBetween(cur.startDate, cur.endDate) + 1 : null,
        cycleDays: next ? daysBetween(next.startDate, cur.startDate) : null,
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
            />
          </li>
        ))}
      </ul>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-brand-gray600">{label}</span>
      <span className="text-base font-medium text-brand-gray900">{value}</span>
    </div>
  );
}

function formatRange(r: Row, locale: 'ko' | 'en', ongoing: string): string {
  const start = formatShort(r.startDate, locale, false);
  if (!r.endDate) return `${start} ~ ${ongoing}`;
  const end = formatShort(r.endDate, locale, true);
  return `${start} ~ ${end}`;
}

function formatShort(iso: string, locale: 'ko' | 'en', omitYear: boolean): string {
  const d = fromISO(iso);
  if (locale === 'ko') return omitYear ? format(d, 'MM.dd') : format(d, 'yy.MM.dd');
  return omitYear ? format(d, 'MMM d') : format(d, 'MMM d, yy');
}
