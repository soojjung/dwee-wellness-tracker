'use client';
import { useMemo, useState } from 'react';
import { useT } from '@/i18n/useT';
import { useSettingsStore } from '@/store/settingsStore';
import { calendarGrid, formatMonthLabel, fromISO, todayISO } from '@/lib/date';
import { ChevronDownIcon } from '@/components/ui/icons';
import { YearMonthWheelPicker } from './YearMonthWheelPicker';

const WEEK_STARTS_ON = 0;
const WEEKDAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;

interface InlineDatePickerProps {
  selectedDate: string;
  onSelect: (date: string) => void;
  minDate?: string;
  maxDate?: string;
}

export function InlineDatePicker({
  selectedDate,
  onSelect,
  minDate,
  maxDate,
}: InlineDatePickerProps) {
  const t = useT();
  const locale = useSettingsStore((s) => s.settings.locale);
  const today = todayISO();

  const [cursor, setCursor] = useState(() => {
    const d = fromISO(selectedDate);
    return { year: d.getFullYear(), monthIndex: d.getMonth() };
  });
  const [wheelOpen, setWheelOpen] = useState(false);

  const cells = useMemo(
    () => calendarGrid(cursor.year, cursor.monthIndex, WEEK_STARTS_ON),
    [cursor],
  );
  const monthLabel = formatMonthLabel(
    new Date(cursor.year, cursor.monthIndex, 1),
    locale,
  );

  function goPrev() {
    setCursor(({ year, monthIndex }) => {
      const d = new Date(year, monthIndex - 1, 1);
      return { year: d.getFullYear(), monthIndex: d.getMonth() };
    });
  }
  function goNext() {
    setCursor(({ year, monthIndex }) => {
      const d = new Date(year, monthIndex + 1, 1);
      return { year: d.getFullYear(), monthIndex: d.getMonth() };
    });
  }

  return (
    <div className="border-t border-brand-gray300 px-4 py-3">
      <div className="flex items-center justify-between pb-2">
        <button
          type="button"
          onClick={() => setWheelOpen(true)}
          aria-label={t.report.diary.inlineDate.openYearMonth}
          className="flex items-center gap-1 text-sm font-medium text-brand-pink300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink300"
        >
          <span>{monthLabel}</span>
          <ChevronDownIcon className="h-2 w-3 -rotate-90 text-brand-pink300" />
        </button>
        <div className="flex items-center gap-3 text-brand-gray900">
          <button
            type="button"
            onClick={goPrev}
            aria-label={t.report.diary.inlineDate.prevMonth}
            className="flex h-6 w-6 items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gray900"
          >
            <ChevronDownIcon className="h-2 w-3 rotate-90" />
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label={t.report.diary.inlineDate.nextMonth}
            className="flex h-6 w-6 items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gray900"
          >
            <ChevronDownIcon className="h-2 w-3 -rotate-90" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 py-1 text-center text-xs text-brand-gray500">
        {WEEKDAY_KEYS.map((k, i) => (
          <span
            key={k}
            className={i === 0 || i === 6 ? '' : 'text-brand-gray700'}
          >
            {t.calendar.weekdays[k]}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 py-1">
        {cells.map((cell) => {
          if (!cell.inCurrentMonth) {
            return <span key={cell.date} className="h-9" aria-hidden />;
          }
          const day = fromISO(cell.date).getDate();
          const isSelected = cell.date === selectedDate;
          const isToday = cell.date === today;
          const disabled =
            (!!minDate && cell.date < minDate) ||
            (!!maxDate && cell.date > maxDate);

          // Figma spec 12/13:
          //   - Today's date: Pink/300 text, no background circle.
          //   - Selected (non-today) date: Pink/50 background circle,
          //     Pink/300 text.
          //   - Today + selected: overlay both — pink50 bg with pink300 text.
          const bg = isSelected ? 'bg-brand-pink50' : '';
          const color = disabled
            ? 'text-brand-gray400'
            : isSelected || isToday
              ? 'text-brand-pink300'
              : 'text-brand-gray900';
          const classes =
            'flex h-9 w-9 items-center justify-center rounded-full text-sm mx-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink300 ' +
            bg +
            ' ' +
            color;

          return (
            <button
              key={cell.date}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(cell.date)}
              aria-label={cell.date}
              aria-pressed={isSelected}
              className={classes}
            >
              {day}
            </button>
          );
        })}
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
