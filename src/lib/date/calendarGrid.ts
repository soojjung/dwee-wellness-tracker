import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, addDays } from 'date-fns';
import { toISO, type ISODate } from './index';

export type WeekStartsOn = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface CalendarCell {
  date: ISODate;
  inCurrentMonth: boolean;
}

const GRID_CELLS = 42;

export function calendarGrid(
  year: number,
  monthIndex: number,
  weekStartsOn: WeekStartsOn = 0,
): CalendarCell[] {
  const monthStart = startOfMonth(new Date(year, monthIndex, 1));
  const monthEnd = endOfMonth(monthStart);
  const gridStart = startOfWeek(monthStart, { weekStartsOn });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });
  while (days.length < GRID_CELLS) days.push(addDays(days[days.length - 1]!, 1));
  return days.slice(0, GRID_CELLS).map((d) => ({
    date: toISO(d),
    inCurrentMonth: d.getMonth() === monthIndex,
  }));
}
