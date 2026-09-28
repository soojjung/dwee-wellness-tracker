import { describe, it, expect } from 'vitest';
import { isPeriodDate, deriveCellMarkers, calendarPredictions, predictedRange } from './cellState';
import { predictFertileWindow } from './fertile';
import type { CalendarPredictions } from './cellState';
import type { PeriodLog, DailyConditionLog } from '@/types';

function period(id: string, startDate: string, endDate?: string): PeriodLog {
  return {
    id,
    startDate,
    ...(endDate ? { endDate } : {}),
    createdAt: '2026-01-01T00:00:00.000Z',
  };
}

function condition(date: string): DailyConditionLog {
  return {
    id: `cond-${date}`,
    date,
    createdAt: '2026-01-01T00:00:00.000Z',
  };
}

describe('isPeriodDate', () => {
  it('returns false when there are no periods', () => {
    expect(isPeriodDate('2026-03-10', [])).toBe(false);
  });

  it('returns true when target equals startDate of a closed period', () => {
    expect(isPeriodDate('2026-03-01', [period('a', '2026-03-01', '2026-03-05')])).toBe(true);
  });

  it('returns true when target equals endDate of a closed period (inclusive upper)', () => {
    expect(isPeriodDate('2026-03-05', [period('a', '2026-03-01', '2026-03-05')])).toBe(true);
  });

  it('returns true when target is strictly between start and end', () => {
    expect(isPeriodDate('2026-03-03', [period('a', '2026-03-01', '2026-03-05')])).toBe(true);
  });

  it('returns false when target is before startDate of a closed period', () => {
    expect(isPeriodDate('2026-02-28', [period('a', '2026-03-01', '2026-03-05')])).toBe(false);
  });

  it('returns false when target is after endDate of a closed period', () => {
    expect(isPeriodDate('2026-03-06', [period('a', '2026-03-01', '2026-03-05')])).toBe(false);
  });

  it('returns true only for startDate when the period has no endDate (open record)', () => {
    const open = [period('a', '2026-03-01')];
    expect(isPeriodDate('2026-03-01', open)).toBe(true);
    // Without an endDate the range does not extend forward — matches the
    // "open record only marks its start" convention used by the calendar.
    expect(isPeriodDate('2026-03-02', open)).toBe(false);
  });

  it('handles a single-day closed period (startDate === endDate)', () => {
    expect(isPeriodDate('2026-06-15', [period('a', '2026-06-15', '2026-06-15')])).toBe(true);
    expect(isPeriodDate('2026-06-16', [period('a', '2026-06-15', '2026-06-15')])).toBe(false);
  });

  it('handles year boundaries via lexical ISO comparison', () => {
    expect(isPeriodDate('2026-01-01', [period('a', '2025-12-31', '2026-01-02')])).toBe(true);
  });

  it('returns true if any period in the list covers the target date', () => {
    const periods = [
      period('a', '2026-01-01', '2026-01-05'),
      period('b', '2026-03-01', '2026-03-05'),
      period('c', '2026-05-01', '2026-05-05'),
    ];
    expect(isPeriodDate('2026-03-03', periods)).toBe(true);
  });

  it('returns false when no period covers the target date (mixed list)', () => {
    const periods = [
      period('a', '2026-01-01', '2026-01-05'),
      period('b', '2026-05-01', '2026-05-05'),
    ];
    expect(isPeriodDate('2026-03-15', periods)).toBe(false);
  });
});

describe('deriveCellMarkers', () => {
  const base = {
    date: '2026-03-10',
    today: '2026-03-10',
    periods: [] as PeriodLog[],
    conditionByDate: {} as Record<string, DailyConditionLog>,
    predictions: null as CalendarPredictions | null,
  };

  it('marks today with isToday=true when date === today', () => {
    expect(deriveCellMarkers(base).isToday).toBe(true);
  });

  it('marks isToday=false when date !== today', () => {
    expect(deriveCellMarkers({ ...base, date: '2026-03-11' }).isToday).toBe(false);
  });

  it('sets cycle=actualPeriod when the date falls in a period range', () => {
    const markers = deriveCellMarkers({
      ...base,
      periods: [period('a', '2026-03-08', '2026-03-12')],
    });
    expect(markers.cycle).toBe('actualPeriod');
  });

  it('sets cycle=null when no period covers the date and predictions is null', () => {
    expect(deriveCellMarkers(base).cycle).toBeNull();
  });

  it('sets cycle=predictedPeriod when the date is within the predicted range (inclusive start/end)', () => {
    const predictions: CalendarPredictions = {
      predictedPeriod: { start: '2026-03-10', end: '2026-03-14' },
      fertile: null,
    };
    expect(deriveCellMarkers({ ...base, date: '2026-03-10', predictions }).cycle).toBe(
      'predictedPeriod',
    );
    expect(deriveCellMarkers({ ...base, date: '2026-03-14', predictions }).cycle).toBe(
      'predictedPeriod',
    );
    expect(deriveCellMarkers({ ...base, date: '2026-03-09', predictions }).cycle).toBeNull();
    expect(deriveCellMarkers({ ...base, date: '2026-03-15', predictions }).cycle).toBeNull();
  });

  it('sets cycle=predictedFertile when the date is within the fertile range only', () => {
    const predictions: CalendarPredictions = {
      predictedPeriod: null,
      fertile: { start: '2026-02-20', end: '2026-02-26' },
    };
    expect(deriveCellMarkers({ ...base, date: '2026-02-22', predictions }).cycle).toBe(
      'predictedFertile',
    );
  });

  it('prioritizes actualPeriod over an overlapping predicted period', () => {
    const predictions: CalendarPredictions = {
      predictedPeriod: { start: '2026-03-10', end: '2026-03-14' },
      fertile: null,
    };
    const markers = deriveCellMarkers({
      ...base,
      date: '2026-03-11',
      periods: [period('a', '2026-03-10', '2026-03-12')],
      predictions,
    });
    expect(markers.cycle).toBe('actualPeriod');
  });

  it('shows only actualPeriod (never predicted markers) when predictions is null', () => {
    const markers = deriveCellMarkers({
      ...base,
      date: '2026-03-10',
      periods: [period('a', '2026-03-08', '2026-03-12')],
      predictions: null,
    });
    expect(markers.cycle).toBe('actualPeriod');
    expect(deriveCellMarkers({ ...base, date: '2026-03-20', predictions: null }).cycle).toBeNull();
  });

  it('sets hasCondition=true when the date is a key in conditionByDate', () => {
    const markers = deriveCellMarkers({
      ...base,
      conditionByDate: { '2026-03-10': condition('2026-03-10') },
    });
    expect(markers.hasCondition).toBe(true);
  });

  it('sets hasCondition=false when the date is missing from conditionByDate', () => {
    const markers = deriveCellMarkers({
      ...base,
      conditionByDate: { '2026-03-11': condition('2026-03-11') },
    });
    expect(markers.hasCondition).toBe(false);
  });

  it('combines cycle, hasCondition, and isToday independently for a single day', () => {
    const markers = deriveCellMarkers({
      date: '2026-03-10',
      today: '2026-03-10',
      periods: [],
      conditionByDate: { '2026-03-10': condition('2026-03-10') },
      predictions: {
        predictedPeriod: { start: '2026-03-10', end: '2026-03-14' },
        fertile: null,
      },
    });
    expect(markers).toEqual({
      cycle: 'predictedPeriod',
      hasCondition: true,
      isToday: true,
    });
  });
});

describe('calendarPredictions', () => {
  it('returns both predictedPeriod and fertile as null when predictedDate is null', () => {
    expect(calendarPredictions(null, 5, 'medium')).toEqual({
      predictedPeriod: null,
      fertile: null,
    });
  });

  it('matches predictedRange and predictFertileWindow for a real date and confidence', () => {
    const result = calendarPredictions('2026-06-10', 5, 'medium');
    expect(result).toEqual({
      predictedPeriod: predictedRange('2026-06-10', 5),
      fertile: predictFertileWindow('2026-06-10', 'medium'),
    });
  });
});
