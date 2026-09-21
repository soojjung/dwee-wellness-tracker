import { getDay, getDaysInMonth } from 'date-fns';
import { formatMonthName, toISO, type ISODate } from './index';

export interface MonthGrid {
  key: string;
  labelKo: string;
  labelEn: string;
  weeks: Array<Array<ISODate | null>>;
}

/**
 * 생리 선택 시트 전용 월 그리드. `calendarGrid`(달력 화면)와 null 패딩 의미가
 * 다르다 — 여긴 달 밖 날짜를 아예 null 로 비워 두고, calendarGrid 는 이웃 달
 * 날짜를 채운 뒤 `inCurrentMonth` 플래그로 구분한다. 서로 섞어 쓰지 않는다.
 */
export function buildMonth(year: number, monthIndex: number): MonthGrid {
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
    labelKo: formatMonthName(first, 'ko'),
    labelEn: formatMonthName(first, 'en'),
    weeks,
  };
}
