import { format, differenceInCalendarDays, addDays, parseISO, isValid, startOfDay } from 'date-fns';
import { ko } from 'date-fns/locale';
import type { Locale } from '@/types';

export type ISODate = string;

export const todayISO = (): ISODate => format(startOfDay(new Date()), 'yyyy-MM-dd');

/** Full ISO 8601 timestamp (UTC) for audit-style fields such as consent times. */
export const nowISODateTime = (): string => new Date().toISOString();

export const toISO = (d: Date): ISODate => format(d, 'yyyy-MM-dd');

export const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export const isValidISODate = (s: unknown): s is ISODate => {
  if (typeof s !== 'string') return false;
  if (!ISO_DATE_RE.test(s)) return false;
  return isValid(parseISO(s));
};

export const fromISO = (s: ISODate): Date => {
  const d = parseISO(s);
  if (!isValid(d)) throw new Error(`Invalid ISO date: ${s}`);
  return d;
};

export const daysBetween = (a: ISODate, b: ISODate): number =>
  differenceInCalendarDays(fromISO(b), fromISO(a));

export const addDaysISO = (d: ISODate, days: number): ISODate => toISO(addDays(fromISO(d), days));

/** 일정 상세 헤딩 — ko "2026년 6월 15일 월요일", en "Monday, June 15, 2026". */
export const formatFullDate = (d: ISODate | Date, locale: Locale): string => {
  const date = typeof d === 'string' ? fromISO(d) : d;
  return locale === 'ko'
    ? format(date, 'yyyy년 M월 d일 EEEE', { locale: ko })
    : format(date, 'EEEE, MMMM d, yyyy');
};

export const formatMonthLabel = (d: ISODate | Date, locale: Locale): string => {
  const date = typeof d === 'string' ? fromISO(d) : d;
  return locale === 'ko' ? format(date, 'yyyy년 M월', { locale: ko }) : format(date, 'MMMM yyyy');
};

/** 월 이름만 — ko "6월", en "June". 생리 선택 시트의 월 헤더. */
export const formatMonthName = (d: ISODate | Date, locale: Locale): string => {
  const date = typeof d === 'string' ? fromISO(d) : d;
  return locale === 'ko' ? format(date, 'M월', { locale: ko }) : format(date, 'MMMM');
};

/** 연도 없는 날짜 — ko "6월 15일", en "Jun 15". 홈 오늘 헤딩·짧은 주기 확인 다이얼로그. */
export const formatMonthDay = (d: ISODate | Date, locale: Locale): string => {
  const date = typeof d === 'string' ? fromISO(d) : d;
  return locale === 'ko' ? format(date, 'M월 d일', { locale: ko }) : format(date, 'MMM d');
};

/**
 * 최근 주기 목록의 기간 표기 — ko "26.06.15" / "06.15", en "Jun 15, 26" / "Jun 15".
 * 시작일은 연도를 붙이고 종료일은 뺀다.
 */
export const formatCompactDate = (
  d: ISODate | Date,
  locale: Locale,
  { omitYear }: { omitYear: boolean },
): string => {
  const date = typeof d === 'string' ? fromISO(d) : d;
  if (locale === 'ko') return format(date, omitYear ? 'MM.dd' : 'yy.MM.dd');
  return format(date, omitYear ? 'MMM d' : 'MMM d, yy');
};

/** 일정·컨디션 폼의 날짜 행 — ko "2026.06.15", en "June 2026 15". */
export const formatDateShort = (d: ISODate | Date, locale: Locale): string => {
  const date = typeof d === 'string' ? fromISO(d) : d;
  if (locale === 'ko') return format(date, 'yyyy.MM.dd');
  return `${formatMonthLabel(date, 'en')} ${date.getDate()}`;
};

export * from './calendarGrid';
export * from './month';
