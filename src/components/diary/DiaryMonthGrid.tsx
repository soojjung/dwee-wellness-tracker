'use client';
import { useMemo } from 'react';
import { useT } from '@/i18n/useT';
import { calendarGrid, type WeekStartsOn } from '@/lib/date';
import type {
  PeriodLog,
  EventLog,
  EventCategory,
  DailyConditionLog,
  HolidayCountry,
} from '@/types';
import type { Dictionary } from '@/i18n';
import { deriveCellMarkers } from '@/components/calendar/cellState';
import { layoutWeekSegments } from '@/domain/event/weekLanes';
import { holidaysByDate, type Holiday } from '@/domain/holiday';
import { DiaryDayCell } from './DiaryDayCell';
import { DiaryWeekEventLayer } from './DiaryWeekEventLayer';

interface DiaryMonthGridProps {
  year: number;
  monthIndex: number;
  weekStartsOn: WeekStartsOn;
  today: string;
  periods: PeriodLog[];
  events: EventLog[];
  categories: EventCategory[];
  conditionByDate?: Record<string, DailyConditionLog>;
  predictedDate?: string | null;
  // Bumped by the parent whenever the today cell should replay its
  // pulse-ring + "오늘" bubble animation (log-tab tap, initial mount).
  todayPulseKey?: number;
  /** 공휴일을 얹을 나라. 비어 있으면 라벨 띠는 비운 채 높이만 유지한다. */
  holidayCountries?: readonly HolidayCountry[];
  onSelect: (date: string) => void;
  onSelectEvent?: (event: EventLog) => void;
}

const WEEKDAY_ORDER_SUN_START = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;

export function DiaryMonthGrid({
  year,
  monthIndex,
  weekStartsOn,
  today,
  periods,
  events,
  categories,
  conditionByDate,
  predictedDate,
  todayPulseKey,
  holidayCountries,
  onSelect,
  onSelectEvent,
}: DiaryMonthGridProps) {
  const t = useT();
  const cells = useMemo(
    () => calendarGrid(year, monthIndex, weekStartsOn),
    [year, monthIndex, weekStartsOn],
  );
  const weekdays = useMemo(() => {
    const rotated = [...WEEKDAY_ORDER_SUN_START];
    for (let i = 0; i < weekStartsOn; i += 1) rotated.push(rotated.shift()!);
    return rotated.map((k) => t.calendar.weekdays[k]);
  }, [t, weekStartsOn]);
  const categoriesById = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);
  const holidays = useMemo(() => {
    const first = cells[0]?.date;
    const last = cells[cells.length - 1]?.date;
    if (!first || !last || !holidayCountries?.length) return {};
    return holidaysByDate(holidayCountries, first, last);
  }, [cells, holidayCountries]);
  const rows = useMemo(() => {
    const list: (typeof cells)[] = [];
    for (let r = 0; r < cells.length; r += 7) {
      list.push(cells.slice(r, r + 7));
    }
    return list;
  }, [cells]);

  return (
    <div className="flex flex-col">
      <div className="grid grid-cols-7 py-2 text-center text-xs text-brand-gray700">
        {weekdays.map((label, i) => (
          <span
            key={i}
            className={i === 0 || i === 6 ? 'text-brand-gray500' : 'text-brand-gray700'}
          >
            {label}
          </span>
        ))}
      </div>
      {rows.map((row, ri) => (
        <div
          key={ri}
          className={
            'relative grid grid-cols-7' + (ri > 0 ? ' border-t-[0.75px] border-brand-gray400' : '')
          }
        >
          {row.map((cell) => (
            <DiaryDayCell
              key={cell.date}
              date={cell.date}
              inCurrentMonth={cell.inCurrentMonth}
              markers={deriveCellMarkers({
                date: cell.date,
                today,
                periods,
                conditionByDate: conditionByDate ?? {},
                predictedDate: predictedDate ?? null,
              })}
              todayPulseKey={cell.date === today ? todayPulseKey : undefined}
              holidayLabel={
                cell.inCurrentMonth ? holidayLabelFor(holidays[cell.date], t.holiday) : undefined
              }
              onSelect={onSelect}
            />
          ))}
          <DiaryWeekEventLayer
            segments={layoutWeekSegments(events, row)}
            categoriesById={categoriesById}
            onSelectEvent={onSelectEvent}
          />
        </div>
      ))}
    </div>
  );
}

/**
 * 같은 날 두 나라 공휴일이 겹치면 가운뎃점으로 잇는다 — 어차피 한 줄에서 잘리므로
 * 첫 이름이 먼저 보이는 게 중요하다. 한국 대체공휴일은 "대체공휴일" 한 단어로,
 * 미국 observed 는 원래 이름 뒤에 접미사를 붙인다.
 */
function holidayLabelFor(
  list: Holiday[] | undefined,
  copy: Dictionary['holiday'],
): string | undefined {
  if (!list || list.length === 0) return undefined;
  return list
    .map((h) => {
      if (h.country === 'KR') {
        const names = copy.KR;
        return h.substitute ? names.substitute : names[h.key as keyof typeof names];
      }
      const names = copy.US;
      const name = names[h.key as keyof typeof names];
      return h.substitute ? `${name}${names.observedSuffix}` : name;
    })
    .join(' · ');
}
