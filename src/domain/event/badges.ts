import type { EventLog } from '@/types/eventLog';

export const MAX_BADGES_PER_DAY = 3;
export const MAX_BADGE_TITLE_LEN = 4;

export function truncateTitle(title: string, max = MAX_BADGE_TITLE_LEN): string {
  return [...title].length > max ? [...title].slice(0, max).join('') : title;
}

export function dateWithin(target: string, start: string, end: string): boolean {
  return target >= start && target <= end;
}

export function eventsForDate(events: readonly EventLog[], date: string): EventLog[] {
  return events.filter((e) => dateWithin(date, e.startDate, e.endDate));
}

export function pickBadgesForDay(
  events: readonly EventLog[],
  date: string,
  max = MAX_BADGES_PER_DAY,
): EventLog[] {
  return eventsForDate(events, date).slice(0, max);
}
