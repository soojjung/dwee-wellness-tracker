'use client';
import { useEffect } from 'react';
import { useT } from '@/i18n/useT';
import { Button } from '@/components/ui/Button';
import { formatKR } from '@/lib/date';
import type { DailyConditionLog } from '@/types';

interface DayDetailSheetProps {
  date: string;
  onClose: () => void;
  hasPeriod: boolean;
  isPredicted: boolean;
  condition: DailyConditionLog | null;
}

export function DayDetailSheet({
  date,
  onClose,
  hasPeriod,
  isPredicted,
  condition,
}: DayDetailSheetProps) {
  const t = useT();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const conditionRows = condition
    ? buildConditionRows(condition, t.condition, t.log)
    : [];

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center" role="dialog" aria-modal="true">
      <button
        type="button"
        aria-label={t.calendar.detail.close}
        className="absolute inset-0 bg-neutral-900/30"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-md rounded-t-3xl bg-white p-6 shadow-xl">
        <h2 className="text-base font-semibold text-neutral-900">{formatKR(date)}</h2>

        <div className="mt-3 flex flex-col gap-1 text-sm text-neutral-700">
          {hasPeriod ? <p>{t.calendar.detail.periodMark}</p> : null}
          {isPredicted ? <p>{t.calendar.detail.predictedMark}</p> : null}
        </div>

        {conditionRows.length > 0 ? (
          <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            {conditionRows.map((row) => (
              <div key={row.key} className="flex flex-col">
                <dt className="text-xs text-neutral-500">{row.label}</dt>
                <dd className="text-neutral-900">{row.value}</dd>
              </div>
            ))}
            {condition?.memo ? (
              <div className="col-span-2 flex flex-col">
                <dt className="text-xs text-neutral-500">{t.calendar.detail.memoLabel}</dt>
                <dd className="whitespace-pre-wrap text-neutral-900">{condition.memo}</dd>
              </div>
            ) : null}
          </dl>
        ) : (
          <p className="mt-4 text-sm text-neutral-500">{t.calendar.detail.noCondition}</p>
        )}

        <Button variant="ghost" size="md" fullWidth className="mt-6" onClick={onClose}>
          {t.calendar.detail.close}
        </Button>
      </div>
    </div>
  );
}

interface Row {
  key: string;
  label: string;
  value: string;
}

function buildConditionRows(
  log: DailyConditionLog,
  dict: ReturnType<typeof useT>['condition'],
  labels: ReturnType<typeof useT>['log'],
): Row[] {
  const rows: Row[] = [];
  if (log.mood) rows.push({ key: 'mood', label: labels.todayMood, value: dict.mood[log.mood] });
  if (log.energy) rows.push({ key: 'energy', label: labels.todayEnergy, value: dict.energy[log.energy] });
  if (log.pain) rows.push({ key: 'pain', label: labels.todayPain, value: dict.pain[log.pain] });
  if (log.bloating) rows.push({ key: 'bloating', label: labels.todayBloating, value: dict.bloating[log.bloating] });
  if (log.appetite) rows.push({ key: 'appetite', label: labels.todayAppetite, value: dict.appetite[log.appetite] });
  if (log.skin) rows.push({ key: 'skin', label: labels.todaySkin, value: dict.skin[log.skin] });
  return rows;
}
