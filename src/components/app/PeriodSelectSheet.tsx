'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { addMonths, format, getDay, getDaysInMonth } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useT } from '@/i18n/useT';
import { useSettingsStore } from '@/store/settingsStore';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { useEscToClose } from '@/hooks/useEscToClose';
import { addDaysISO, fromISO, toISO, type ISODate } from '@/lib/date';
import { CancelIcon } from '@/components/ui/icons/CancelIcon';
import { CheckIcon } from '@/components/ui/icons/CheckIcon';
import type { PeriodLog } from '@/types';
import {
  EXTEND_GAP_DAYS,
  addRange,
  computeChanges,
  extendTo,
  findContainingDraft,
  findExtendableDraft,
  removeDay,
  toDrafts,
  type DraftPeriod,
  type PeriodChange,
} from '@/domain/cycle/periodEdit';

interface PeriodSelectSheetProps {
  today: ISODate;
  periods: PeriodLog[];
  monthsBack?: number;
  onSubmit: (changes: PeriodChange[]) => Promise<void>;
  onCancel: () => void;
}

const DEFAULT_MONTHS_BACK = 6;
const WEEKDAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;

interface MonthGrid {
  key: string;
  labelKo: string;
  labelEn: string;
  weeks: Array<Array<ISODate | null>>;
}

function buildMonth(year: number, monthIndex: number): MonthGrid {
  const first = new Date(year, monthIndex, 1);
  const leading = getDay(first);
  const total = getDaysInMonth(first);
  const cells: Array<ISODate | null> = [];
  for (let i = 0; i < leading; i++) cells.push(null);
  for (let d = 1; d <= total; d++) cells.push(toISO(new Date(year, monthIndex, d)));
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: Array<Array<ISODate | null>> = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return {
    key: `${year}-${String(monthIndex + 1).padStart(2, '0')}`,
    labelKo: format(first, 'M월', { locale: ko }),
    labelEn: format(first, 'MMMM'),
    weeks,
  };
}

function collectRecordedDates(drafts: DraftPeriod[]): Set<ISODate> {
  const set = new Set<ISODate>();
  for (const p of drafts) {
    let cursor = p.startDate;
    while (cursor <= p.endDate) {
      set.add(cursor);
      cursor = addDaysISO(cursor, 1);
    }
  }
  return set;
}

export function PeriodSelectSheet({
  today,
  periods,
  monthsBack = DEFAULT_MONTHS_BACK,
  onSubmit,
  onCancel,
}: PeriodSelectSheetProps) {
  const t = useT();
  const locale = useSettingsStore((s) => s.settings.locale);
  const [drafts, setDrafts] = useState<DraftPeriod[]>(() => toDrafts(periods));
  const [pendingStart, setPendingStart] = useState<ISODate | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const currentMonthRef = useRef<HTMLDivElement | null>(null);
  const newKeyCounter = useRef(0);

  function nextNewKey() {
    newKeyCounter.current += 1;
    return `new:${newKeyCounter.current}`;
  }

  const months = useMemo(() => {
    const anchor = fromISO(today);
    const list: MonthGrid[] = [];
    for (let i = monthsBack; i >= 0; i--) {
      const m = addMonths(anchor, -i);
      list.push(buildMonth(m.getFullYear(), m.getMonth()));
    }
    return list;
  }, [today, monthsBack]);

  const recordedSet = useMemo(() => collectRecordedDates(drafts), [drafts]);

  const changes = useMemo(() => computeChanges(periods, drafts), [periods, drafts]);
  const dirty = changes.length > 0;

  useEffect(() => {
    currentMonthRef.current?.scrollIntoView({ block: 'center' });
  }, []);

  useBodyScrollLock();
  useEscToClose(handleCancel);

  function handleCellClick(date: ISODate) {
    if (date > today) return;

    const containing = findContainingDraft(drafts, date);
    if (containing) {
      setPendingStart(null);
      setDrafts(removeDay(drafts, containing.key, date, nextNewKey));
      return;
    }

    const extendable = findExtendableDraft(drafts, date, EXTEND_GAP_DAYS);
    if (extendable) {
      setPendingStart(null);
      setDrafts(extendTo(drafts, extendable.key, date));
      return;
    }

    if (!pendingStart) {
      setPendingStart(date);
      return;
    }
    if (date === pendingStart) {
      setPendingStart(null);
      return;
    }

    const [lo, hi] = pendingStart < date ? [pendingStart, date] : [date, pendingStart];
    const nearbyForLo = findExtendableDraft(drafts, lo, EXTEND_GAP_DAYS);
    if (nearbyForLo) {
      setPendingStart(null);
      setDrafts(extendTo(drafts, nearbyForLo.key, hi));
      return;
    }
    setPendingStart(null);
    setDrafts(addRange(drafts, lo, hi, nextNewKey()));
  }

  async function handleSave() {
    if (!dirty || submitting) return;
    setSubmitting(true);
    try {
      await onSubmit(changes);
    } finally {
      setSubmitting(false);
    }
  }

  function handleCancel() {
    if (submitting) return;
    onCancel();
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t.home.periodSheet.title}
      className="fixed inset-0 z-40 flex items-end justify-center bg-black/20"
      onClick={handleCancel}
    >
      <div
        className="relative flex w-full max-w-md flex-col overflow-hidden rounded-t-[32px] bg-brand-white"
        style={{ maxHeight: '90dvh' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3">
          <button
            type="button"
            onClick={handleCancel}
            aria-label={t.home.periodSheet.closeAria}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-gray200 text-brand-gray900 transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gray900"
          >
            <CancelIcon className="h-5 w-5" />
          </button>
          <h2 className="text-[20px] font-semibold text-brand-gray900">
            {t.home.periodSheet.title}
          </h2>
          <button
            type="button"
            onClick={handleSave}
            disabled={!dirty || submitting}
            aria-label={t.home.periodSheet.saveAria}
            className="flex h-10 w-10 items-center justify-center rounded-full transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink800 disabled:cursor-not-allowed disabled:bg-brand-gray200 disabled:text-brand-gray400 enabled:bg-brand-pink500 enabled:text-brand-white enabled:hover:opacity-80"
          >
            <CheckIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="mx-auto grid w-full max-w-[358px] grid-cols-7 gap-1.5 bg-brand-white px-4 py-2 text-[12px] font-medium text-brand-gray700">
          {WEEKDAY_KEYS.map((k, i) => (
            <span
              key={k}
              className={`text-center ${i === 0 || i === 6 ? 'text-brand-gray500' : ''}`}
            >
              {t.home.weekdays[k]}
            </span>
          ))}
        </div>

        <div
          className="min-h-0 flex-1 overflow-y-auto px-4 pb-10 pt-4"
          style={{
            maskImage: 'linear-gradient(to bottom, transparent 0, black 40px)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0, black 40px)',
          }}
        >
          <div className="mx-auto flex w-full max-w-[358px] flex-col gap-6">
            {months.map((m, idx) => {
              const isCurrent = idx === months.length - 1;
              return (
                <div
                  key={m.key}
                  ref={isCurrent ? currentMonthRef : undefined}
                  className="flex flex-col gap-4"
                >
                  <p className="w-full text-center text-[18px] font-semibold text-brand-gray900">
                    {locale === 'ko' ? m.labelKo : m.labelEn}
                  </p>
                  <div className="flex flex-col gap-3">
                    {m.weeks.map((week, wi) => (
                      <div key={wi} className="grid grid-cols-7 gap-1.5">
                        {week.map((cell, ci) => (
                          <DayCell
                            key={ci}
                            date={cell}
                            today={today}
                            recordedSet={recordedSet}
                            pendingStart={pendingStart}
                            onClick={handleCellClick}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

interface DayCellProps {
  date: ISODate | null;
  today: ISODate;
  recordedSet: Set<ISODate>;
  pendingStart: ISODate | null;
  onClick: (date: ISODate) => void;
}

function DayCell({ date, today, recordedSet, pendingStart, onClick }: DayCellProps) {
  if (!date) return <div className="h-10 w-full" aria-hidden />;
  const day = Number(date.slice(-2));
  const isToday = date === today;
  const isFuture = date > today;
  const isRecorded = recordedSet.has(date);
  const isPendingStart = pendingStart === date;

  let bgClass = '';
  let textClass = 'text-brand-gray900';
  let borderClass = '';

  if (isFuture) {
    textClass = 'text-brand-gray500';
  }
  if (isRecorded) {
    bgClass = 'bg-brand-pink50';
    textClass = 'text-brand-pink800';
    if (isToday) borderClass = 'ring-2 ring-inset ring-brand-pink800';
  } else if (isToday) {
    bgClass = 'bg-brand-gray900';
    textClass = 'text-brand-white';
  } else if (isPendingStart) {
    bgClass = 'bg-brand-pink50';
    textClass = 'text-brand-pink800';
    borderClass = 'ring-2 ring-inset ring-brand-pink800';
  }

  return (
    <button
      type="button"
      onClick={() => onClick(date)}
      disabled={isFuture}
      aria-pressed={isRecorded || isPendingStart}
      className={`flex h-10 w-full items-center justify-center text-[16px] font-medium ${
        isFuture ? 'cursor-default' : 'cursor-pointer'
      } focus-visible:outline-none`}
    >
      <span
        className={`flex h-10 min-w-[40px] items-center justify-center rounded-full px-2 ${bgClass} ${textClass} ${borderClass}`}
      >
        {day}
      </span>
    </button>
  );
}
