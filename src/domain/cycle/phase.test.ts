import { describe, it, expect } from 'vitest';
import { currentPhase, PERIOD_LATE_GRACE_DAYS } from './phase';
import { addDaysISO } from '@/lib/date';
import { DEFAULT_USER_SETTINGS } from '@/types/userSettings';
import type { PeriodLog } from '@/types';

const DEFAULT_SETTINGS = { ...DEFAULT_USER_SETTINGS, onboardingCompleted: true };

function createPeriod(startDate: string, endDate?: string): PeriodLog {
  return {
    id: `period-${startDate}`,
    startDate,
    endDate: endDate ?? addDaysISO(startDate, 4), // default to 5-day period (start to start+4)
    createdAt: new Date().toISOString(),
  };
}

describe('currentPhase', () => {
  describe('No periods', () => {
    it('returns unknown when no periods exist', () => {
      const result = currentPhase('2026-06-04', [], DEFAULT_SETTINGS);
      expect(result.phase).toBe('unknown');
      expect(result.confidence).toBe('unknown');
    });
  });

  describe('Negative dayInCycle', () => {
    it('returns unknown when today is before last period start', () => {
      const period = createPeriod('2026-06-05');
      const result = currentPhase('2026-06-04', [period], DEFAULT_SETTINGS);
      expect(result.phase).toBe('unknown');
      expect(result.confidence).toBe('low');
    });
  });

  describe('Menstrual phase', () => {
    it('returns menstrual for day 0-4 (within period length)', () => {
      const period = createPeriod('2026-06-04');
      const result = currentPhase('2026-06-04', [period], DEFAULT_SETTINGS);
      expect(result.phase).toBe('menstrual');
      expect(result.confidence).toBe('low'); // 1 period
    });

    it('returns menstrual for day 4 (end of 5-day period)', () => {
      const period = createPeriod('2026-06-04');
      const result = currentPhase('2026-06-08', [period], DEFAULT_SETTINGS);
      expect(result.phase).toBe('menstrual');
    });

    it('leaves menstrual phase at day 5', () => {
      const period = createPeriod('2026-06-04');
      const result = currentPhase('2026-06-09', [period], DEFAULT_SETTINGS);
      expect(result.phase).not.toBe('menstrual');
    });
  });

  describe('Follicular phase', () => {
    it('returns follicular after menstrual, before ovulation', () => {
      const period = createPeriod('2026-06-04');
      // day 6 (after 5-day period), before ovulation at day 14
      const result = currentPhase('2026-06-10', [period], DEFAULT_SETTINGS);
      expect(result.phase).toBe('follicular');
    });

    it('stays follicular on day 11 (before ovulation window starts at day 12)', () => {
      const period = createPeriod('2026-06-04');
      // day 11, ovulation window starts at day 12 (cycle 28, ovulation = 28 - 14 = 14, window = 12-15)
      const result = currentPhase('2026-06-15', [period], DEFAULT_SETTINGS);
      expect(result.phase).toBe('follicular');
    });
  });

  describe('Ovulation phase', () => {
    it('returns ovulation around day 14 (cycle 28)', () => {
      const period = createPeriod('2026-06-04');
      // day 12 (ovulation window = 12-14)
      const result = currentPhase('2026-06-16', [period], DEFAULT_SETTINGS);
      expect(result.phase).toBe('ovulation');
    });

    it('ovulation window is days 12-15 for 28-day cycle', () => {
      const period = createPeriod('2026-06-04');
      const ovulationDays = [];
      for (let i = 12; i <= 16; i++) {
        const date = addDaysISO('2026-06-04', i);
        const result = currentPhase(date, [period], DEFAULT_SETTINGS);
        if (result.phase === 'ovulation') {
          ovulationDays.push(i);
        }
      }
      // ovulation_day = 28 - 14 = 14
      // window: dayInCycle >= 12 (14-2) && dayInCycle <= 15 (14+1)
      expect(ovulationDays).toEqual([12, 13, 14, 15]);
    });
  });

  describe('Luteal phase', () => {
    it('returns luteal after ovulation, before predicted cycle end', () => {
      const period = createPeriod('2026-06-04');
      // day 20, after ovulation (ends at day 15), before cycle end (day 28)
      const result = currentPhase('2026-06-24', [period], DEFAULT_SETTINGS);
      expect(result.phase).toBe('luteal');
    });

    it('leaves luteal phase at cycle end', () => {
      const period = createPeriod('2026-06-04');
      // day 27, still in luteal
      const result = currentPhase('2026-07-01', [period], DEFAULT_SETTINGS);
      expect(result.phase).toBe('luteal');
    });
  });

  describe('Grace window: period due/late but not logged', () => {
    it('returns luteal with low confidence when period is due (dayInCycle >= cycle)', () => {
      const period = createPeriod('2026-06-04');
      // day 28, exactly at predicted cycle end
      const result = currentPhase('2026-07-02', [period], DEFAULT_SETTINGS);
      expect(result.phase).toBe('luteal');
      expect(result.confidence).toBe('low'); // grace window activated
    });

    it('returns luteal with low confidence at cycle + 7 days (mid-grace)', () => {
      const period = createPeriod('2026-06-04');
      // day 35 (cycle 28 + 7), still in grace window
      const result = currentPhase('2026-07-09', [period], DEFAULT_SETTINGS);
      expect(result.phase).toBe('luteal');
      expect(result.confidence).toBe('low');
    });

    it('returns luteal with low confidence at cycle + 13 days (end of grace window)', () => {
      const period = createPeriod('2026-06-04');
      // day 41 (cycle 28 + 13), still in grace window (grace = 14)
      const result = currentPhase('2026-07-15', [period], DEFAULT_SETTINGS);
      expect(result.phase).toBe('luteal');
      expect(result.confidence).toBe('low');
    });

    it('returns unknown at cycle + 14 days (outside grace window)', () => {
      const period = createPeriod('2026-06-04');
      // day 42 (cycle 28 + 14), beyond grace window
      const result = currentPhase('2026-07-16', [period], DEFAULT_SETTINGS);
      expect(result.phase).toBe('unknown');
      expect(result.confidence).toBe('low');
    });

    it('returns unknown at cycle + 30 days (far beyond grace window)', () => {
      const period = createPeriod('2026-06-04');
      // day 58 (cycle 28 + 30)
      const result = currentPhase('2026-08-02', [period], DEFAULT_SETTINGS);
      expect(result.phase).toBe('unknown');
      expect(result.confidence).toBe('low');
    });
  });

  describe('Confidence levels', () => {
    it('returns low confidence with 1 period outside grace window', () => {
      const period = createPeriod('2026-06-04');
      // day 10, inside normal cycle, 1 period
      const result = currentPhase('2026-06-14', [period], DEFAULT_SETTINGS);
      expect(result.confidence).toBe('low');
    });

    it('returns low confidence with 2 periods outside grace window', () => {
      const period1 = createPeriod('2026-05-07');
      const period2 = createPeriod('2026-06-04');
      // day 10, inside normal cycle, 2 periods
      const result = currentPhase('2026-06-14', [period1, period2], DEFAULT_SETTINGS);
      expect(result.confidence).toBe('low');
    });

    it('returns medium confidence with 3+ periods outside grace window', () => {
      const period1 = createPeriod('2026-04-09');
      const period2 = createPeriod('2026-05-07');
      const period3 = createPeriod('2026-06-04');
      // day 10, 3 periods
      const result = currentPhase('2026-06-14', [period1, period2, period3], DEFAULT_SETTINGS);
      expect(result.confidence).toBe('medium');
    });

    it('returns low confidence with 3+ periods but in grace window', () => {
      const period1 = createPeriod('2026-04-09');
      const period2 = createPeriod('2026-05-07');
      const period3 = createPeriod('2026-06-04');
      // day 30 (cycle 28 + 2, in grace window)
      const result = currentPhase('2026-07-04', [period1, period2, period3], DEFAULT_SETTINGS);
      expect(result.phase).toBe('luteal');
      expect(result.confidence).toBe('low');
    });
  });

  describe('PERIOD_LATE_GRACE_DAYS constant', () => {
    it('is set to 14 days', () => {
      expect(PERIOD_LATE_GRACE_DAYS).toBe(14);
    });
  });

  describe('Edge cases with different cycle lengths', () => {
    it('works with 21-day cycle (short)', () => {
      const settings = { ...DEFAULT_SETTINGS, averageCycleLength: 21 };
      const period = createPeriod('2026-06-04');
      // day 21, at cycle end
      const result = currentPhase('2026-06-25', [period], settings);
      expect(result.phase).toBe('luteal');
      // day 22, in grace window
      const result2 = currentPhase('2026-06-26', [period], settings);
      expect(result2.phase).toBe('luteal');
      expect(result2.confidence).toBe('low');
      // day 35 (cycle + 14), out of grace
      const result3 = currentPhase('2026-07-09', [period], settings);
      expect(result3.phase).toBe('unknown');
    });

    it('works with 35-day cycle (long)', () => {
      const settings = { ...DEFAULT_SETTINGS, averageCycleLength: 35 };
      const period = createPeriod('2026-06-04');
      // day 35, at cycle end
      const result = currentPhase('2026-07-09', [period], settings);
      expect(result.phase).toBe('luteal');
      // day 36, in grace window
      const result2 = currentPhase('2026-07-10', [period], settings);
      expect(result2.phase).toBe('luteal');
      expect(result2.confidence).toBe('low');
      // day 49 (cycle + 14), out of grace
      const result3 = currentPhase('2026-07-23', [period], settings);
      expect(result3.phase).toBe('unknown');
    });
  });

  describe('Multiple periods, most recent is used', () => {
    it('uses last period for dayInCycle calculation', () => {
      const period1 = createPeriod('2026-05-01');
      const period2 = createPeriod('2026-06-04');
      // day 10 from period2 (not period1)
      const result = currentPhase('2026-06-14', [period1, period2], DEFAULT_SETTINGS);
      expect(result.phase).toBe('follicular');
    });
  });
});
