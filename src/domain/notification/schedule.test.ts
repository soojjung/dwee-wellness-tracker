import { describe, it, expect } from 'vitest';
import type { PeriodLog } from '@/types';
import { DEFAULT_USER_SETTINGS } from '@/types/userSettings';
import {
  planNotifications,
  NOTIFICATION_IDS,
  NOTIFICATION_HOUR,
  PERIOD_DELAY_GRACE_DAYS,
} from './schedule';

// Three 28-day cycles ending 2026-06-01 → next period predicted 2026-06-29,
// fertile window 2026-06-10 … 2026-06-16 (ovulation 06-15).
const periods: PeriodLog[] = [
  { id: 'p1', startDate: '2026-04-06', endDate: '2026-04-10' },
  { id: 'p2', startDate: '2026-05-04', endDate: '2026-05-08' },
  { id: 'p3', startDate: '2026-06-01', endDate: '2026-06-05' },
] as PeriodLog[];

const allOn = {
  ...DEFAULT_USER_SETTINGS,
  notificationsEnabled: true,
  notifPeriodDueEnabled: true,
  notifPeriodDueLeadDays: 5,
  notifPeriodDelayEnabled: true,
  notifFertileEnabled: true,
};

const at = (iso: string, hour = 8) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y!, m! - 1, d!, hour, 0, 0, 0);
};

describe('planNotifications', () => {
  it('returns nothing when the master toggle is off', () => {
    expect(
      planNotifications({
        periods,
        settings: { ...allOn, notificationsEnabled: false },
        now: at('2026-06-02'),
      }),
    ).toEqual([]);
  });

  it('returns nothing without records (no prediction, no invented date)', () => {
    expect(planNotifications({ periods: [], settings: allOn, now: at('2026-06-02') })).toEqual([]);
  });

  it('plans all three kinds from the prediction when everything is on', () => {
    const plan = planNotifications({ periods, settings: allOn, now: at('2026-06-02') });
    expect(plan).toEqual([
      { id: NOTIFICATION_IDS.periodDue, kind: 'periodDue', date: '2026-06-24', leadDays: 5 },
      { id: NOTIFICATION_IDS.periodDelay, kind: 'periodDelay', date: '2026-07-01' },
      { id: NOTIFICATION_IDS.fertile, kind: 'fertile', date: '2026-06-10' },
    ]);
  });

  it('uses the grace constant for the delay reminder', () => {
    const plan = planNotifications({ periods, settings: allOn, now: at('2026-06-02') });
    expect(plan.find((p) => p.kind === 'periodDelay')?.date).toBe(
      `2026-07-0${1 + PERIOD_DELAY_GRACE_DAYS - 2}`,
    );
  });

  it('respects each sub-toggle independently', () => {
    const plan = planNotifications({
      periods,
      settings: { ...allOn, notifPeriodDelayEnabled: false, notifFertileEnabled: false },
      now: at('2026-06-02'),
    });
    expect(plan.map((p) => p.kind)).toEqual(['periodDue']);
  });

  it('lead time 0 fires on the expected day itself', () => {
    const plan = planNotifications({
      periods,
      settings: { ...allOn, notifPeriodDueLeadDays: 0 },
      now: at('2026-06-02'),
    });
    expect(plan.find((p) => p.kind === 'periodDue')).toEqual({
      id: 1001,
      kind: 'periodDue',
      date: '2026-06-29',
      leadDays: 0,
    });
  });

  it('drops reminders whose day has already passed', () => {
    const plan = planNotifications({ periods, settings: allOn, now: at('2026-06-26') });
    expect(plan.map((p) => p.kind)).toEqual(['periodDelay']);
  });

  it('keeps a same-day reminder only before the firing hour', () => {
    const before = planNotifications({
      periods,
      settings: allOn,
      now: at('2026-06-24', NOTIFICATION_HOUR - 1),
    });
    const after = planNotifications({
      periods,
      settings: allOn,
      now: at('2026-06-24', NOTIFICATION_HOUR),
    });
    expect(before.some((p) => p.kind === 'periodDue')).toBe(true);
    expect(after.some((p) => p.kind === 'periodDue')).toBe(false);
  });

  it('schedules the fertile reminder even at low confidence (one record)', () => {
    const one = [periods[2]!];
    const plan = planNotifications({ periods: one, settings: allOn, now: at('2026-06-02') });
    expect(plan.find((p) => p.kind === 'fertile')?.date).toBe('2026-06-10');
  });

  it('re-plans from the new prediction once the period is logged', () => {
    const logged = [...periods, { id: 'p4', startDate: '2026-06-29' } as PeriodLog];
    const plan = planNotifications({ periods: logged, settings: allOn, now: at('2026-06-30') });
    expect(plan.find((p) => p.kind === 'periodDelay')?.date).toBe('2026-07-29');
    expect(plan.find((p) => p.kind === 'periodDue')?.date).toBe('2026-07-22');
  });
});
