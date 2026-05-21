import type { PeriodLog, DailyConditionLog } from '@/types';
import type { ISODate } from '@/lib/date';

export interface CellMarkers {
  background: 'menstrual' | null;
  predicted: boolean;
  hasCondition: boolean;
  isToday: boolean;
}

export function isPeriodDate(date: ISODate, periods: PeriodLog[]): boolean {
  for (const p of periods) {
    if (p.endDate) {
      if (date >= p.startDate && date <= p.endDate) return true;
    } else if (date === p.startDate) {
      return true;
    }
  }
  return false;
}

export function deriveCellMarkers(args: {
  date: ISODate;
  today: ISODate;
  periods: PeriodLog[];
  conditionByDate: Record<string, DailyConditionLog>;
  predictedDate: ISODate | null;
}): CellMarkers {
  return {
    background: isPeriodDate(args.date, args.periods) ? 'menstrual' : null,
    predicted: args.predictedDate === args.date,
    hasCondition: !!args.conditionByDate[args.date],
    isToday: args.date === args.today,
  };
}
