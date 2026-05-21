import { format, differenceInCalendarDays, addDays, parseISO, isValid, startOfDay } from 'date-fns';
import { ko } from 'date-fns/locale';
import type { Locale } from '@/types';

export type ISODate = string;

export const todayISO = (): ISODate => format(startOfDay(new Date()), 'yyyy-MM-dd');

export const toISO = (d: Date): ISODate => format(d, 'yyyy-MM-dd');

export const fromISO = (s: ISODate): Date => {
  const d = parseISO(s);
  if (!isValid(d)) throw new Error(`Invalid ISO date: ${s}`);
  return d;
};

export const formatKR = (d: ISODate | Date, pattern = 'yyyy년 M월 d일'): string =>
  format(typeof d === 'string' ? fromISO(d) : d, pattern, { locale: ko });

export const daysBetween = (a: ISODate, b: ISODate): number =>
  differenceInCalendarDays(fromISO(b), fromISO(a));

export const addDaysISO = (d: ISODate, days: number): ISODate => toISO(addDays(fromISO(d), days));

export const formatMonthLabel = (d: ISODate | Date, locale: Locale): string => {
  const date = typeof d === 'string' ? fromISO(d) : d;
  return locale === 'ko'
    ? format(date, 'yyyy년 M월', { locale: ko })
    : format(date, 'MMMM yyyy');
};

export * from './calendarGrid';
