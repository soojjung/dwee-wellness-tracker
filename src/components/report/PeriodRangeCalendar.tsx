'use client';
import { useMemo, useState } from 'react';
import { useT } from '@/i18n/useT';
import { useSettingsStore } from '@/store/settingsStore';
import {
  addDaysISO,
  calendarGrid,
  formatMonthLabel,
  fromISO,
  shiftMonth,
  type ISODate,
} from '@/lib/date';
import { ChevronDownIcon } from '@/components/ui/icons';
import { YearMonthWheelPicker } from '@/components/diary/YearMonthWheelPicker';
import { useHorizontalSwipe } from '@/hooks/useHorizontalSwipe';
import { FUTURE_WINDOW_DAYS, collectRecordedDates, toDrafts } from '@/domain/cycle/periodEdit';
import { isInPeriodRange, type PeriodRangeSelection } from '@/domain/cycle/periodRangeSelection';
import type { PeriodLog } from '@/types';

const WEEK_STARTS_ON = 0;
const WEEKDAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;

interface PeriodRangeCalendarProps {
  today: ISODate;
  periods: PeriodLog[];
  selection: PeriodRangeSelection | null;
  onTapDate: (date: ISODate) => void;
}

/**
 * Month calendar for `PeriodRecordSheet` (Figma 947:7787 / 952:9088). Only
 * ADDS a new period range — existing records are shown as a subtle dot but
 * stay untouched here (editing an existing period still lives on Home).
 */
export function PeriodRangeCalendar({
  today,
  periods,
  selection,
  onTapDate,
}: PeriodRangeCalendarProps) {
  const t = useT();
  const locale = useSettingsStore((s) => s.settings.locale);
  const [cursor, setCursor] = useState(() => {
    const d = fromISO(today);
    return { year: d.getFullYear(), monthIndex: d.getMonth() };
  });
  const [wheelOpen, setWheelOpen] = useState(false);

  const cells = useMemo(
    () => calendarGrid(cursor.year, cursor.monthIndex, WEEK_STARTS_ON),
    [cursor],
  );
  const monthLabel = formatMonthLabel(new Date(cursor.year, cursor.monthIndex, 1), locale);
  const maxSelectable = useMemo(() => addDaysISO(today, FUTURE_WINDOW_DAYS), [today]);
  const recordedSet = useMemo(() => collectRecordedDates(toDrafts(periods)), [periods]);

  const { containerRef, offset, animating, handlers } = useHorizontalSwipe({
    onCommit: (direction) => setCursor((c) => shiftMonth(c, direction)),
  });

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setWheelOpen(true)}
          aria-label={t.report.diary.inlineDate.openYearMonth}
          className={`flex items-center gap-1 text-base font-medium ${
            wheelOpen ? 'text-brand-pink300' : 'text-brand-gray900'
          }`}
        >
          <span>{monthLabel}</span>
          <ChevronDownIcon className="h-2.5 w-3.5 -rotate-90" />
        </button>
        <div className="-my-2.5 -mr-3 flex items-center">
          <button
            type="button"
            onClick={() => setCursor((c) => shiftMonth(c, -1))}
            aria-label={t.report.diary.inlineDate.prevMonth}
            className="flex h-11 w-11 items-center justify-center text-brand-gray900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gray900"
          >
            <ChevronDownIcon className="h-3 w-4 rotate-90" />
          </button>
          <button
            type="button"
            onClick={() => setCursor((c) => shiftMonth(c, 1))}
            aria-label={t.report.diary.inlineDate.nextMonth}
            className="flex h-11 w-11 items-center justify-center text-brand-gray900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gray900"
          >
            <ChevronDownIcon className="h-3 w-4 -rotate-90" />
          </button>
        </div>
      </div>

      <div ref={containerRef} className="touch-pan-y select-none overflow-hidden" {...handlers}>
        <div
          style={{
            transform: `translateX(${offset}px)`,
            transition: animating ? 'transform 220ms ease-out' : 'none',
          }}
        >
          <div className="grid grid-cols-7 gap-x-[3px]">
            {WEEKDAY_KEYS.map((k) => (
              <span
                key={k}
                className="flex min-h-[30px] items-center justify-center text-xs font-normal text-brand-gray500"
              >
                {t.calendar.weekdays[k]}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-x-[3px]">
            {cells.map((cell) => (
              <PeriodDayCell
                key={cell.date}
                date={cell.date}
                inCurrentMonth={cell.inCurrentMonth}
                today={today}
                maxSelectable={maxSelectable}
                recorded={recordedSet.has(cell.date)}
                selected={isInPeriodRange(selection, cell.date)}
                onTap={onTapDate}
              />
            ))}
          </div>
        </div>
      </div>

      {wheelOpen ? (
        <YearMonthWheelPicker
          initialYear={cursor.year}
          initialMonthIndex={cursor.monthIndex}
          onCancel={() => setWheelOpen(false)}
          onApply={(year, monthIndex) => {
            setCursor({ year, monthIndex });
            setWheelOpen(false);
          }}
        />
      ) : null}
    </div>
  );
}

interface PeriodDayCellProps {
  date: ISODate;
  inCurrentMonth: boolean;
  today: ISODate;
  maxSelectable: ISODate;
  recorded: boolean;
  selected: boolean;
  onTap: (date: ISODate) => void;
}

function PeriodDayCell({
  date,
  inCurrentMonth,
  today,
  maxSelectable,
  recorded,
  selected,
  onTap,
}: PeriodDayCellProps) {
  if (!inCurrentMonth) return <div className="h-11 w-11" aria-hidden />;

  const day = fromISO(date).getDate();
  const isToday = date === today;
  const disabled = date > maxSelectable;

  let bg = '';
  let text = 'text-brand-gray900';
  let weight = 'font-medium';
  if (disabled) {
    text = 'text-brand-gray400';
  } else if (isToday && selected) {
    bg = 'bg-brand-pink300';
    text = 'text-brand-white';
    weight = 'font-semibold';
  } else if (selected) {
    bg = 'bg-brand-pink50';
    text = 'text-brand-pink300';
    weight = 'font-semibold';
  } else if (isToday) {
    text = 'text-brand-pink300';
  }

  return (
    <button
      type="button"
      onClick={() => onTap(date)}
      disabled={disabled}
      aria-pressed={selected}
      aria-label={date}
      className="relative flex h-11 w-11 items-center justify-center focus-visible:outline-none"
    >
      <span
        className={`flex h-11 w-11 items-center justify-center rounded-full text-sm ${weight} ${bg} ${text}`}
      >
        {day}
      </span>
      {recorded ? (
        <span aria-hidden className="absolute bottom-1.5 h-1 w-1 rounded-full bg-brand-pink200" />
      ) : null}
    </button>
  );
}
