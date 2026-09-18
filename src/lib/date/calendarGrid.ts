import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { toISO, type ISODate } from './index';

export type WeekStartsOn = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface CalendarCell {
  date: ISODate;
  inCurrentMonth: boolean;
}

/**
 * 달력 셀. 그 달이 걸치는 주만 돌려준다 (4~6주, 대개 5주). 예전엔 항상 42칸(6주)으로
 * 채웠는데, 5주짜리 달에 다음 달 한 주가 통째로 붙어 보이는 게 어색하다는 피드백(2026-09-18).
 * 6주가 실제로 필요한 달(31일이 주 첫날 직전에 시작하는 달)만 6행이 된다.
 */
export function calendarGrid(
  year: number,
  monthIndex: number,
  weekStartsOn: WeekStartsOn = 0,
): CalendarCell[] {
  const monthStart = startOfMonth(new Date(year, monthIndex, 1));
  const monthEnd = endOfMonth(monthStart);
  const gridStart = startOfWeek(monthStart, { weekStartsOn });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn });
  return eachDayOfInterval({ start: gridStart, end: gridEnd }).map((d) => ({
    date: toISO(d),
    inCurrentMonth: d.getMonth() === monthIndex,
  }));
}
