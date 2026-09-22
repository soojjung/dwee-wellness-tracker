import type { PeriodLog, UserSettings } from '@/types';
import { addDaysISO, toISO, type ISODate } from '@/lib/date';
import { predictNextPeriod } from '@/domain/cycle/predictor';
import { predictFertileWindow } from '@/domain/cycle/fertile';

export type NotificationKind = 'periodDue' | 'periodDelay' | 'fertile';

export interface PlannedNotification {
  /** Stable per-kind id so a re-plan can cancel the previous one. */
  id: number;
  kind: NotificationKind;
  /** Calendar day the notification fires on (device local time). */
  date: ISODate;
  /** periodDue only: days between the notification and the expected start. */
  leadDays?: number;
}

export const NOTIFICATION_IDS: Record<NotificationKind, number> = {
  periodDue: 1001,
  periodDelay: 1002,
  fertile: 1003,
};

/** Local wall-clock hour every reminder fires at. */
export const NOTIFICATION_HOUR = 9;

/**
 * Days after the expected start before the "not logged yet" reminder. One
 * day of slack keeps a prediction that is off by a day from nagging.
 */
export const PERIOD_DELAY_GRACE_DAYS = 2;

export interface PlanInput {
  periods: PeriodLog[];
  settings: UserSettings;
  /** Injected clock so the plan is a pure function of its inputs. */
  now: Date;
}

/**
 * Turns the current prediction and the notification settings into the
 * reminders to keep scheduled: at most one per kind, only for days still
 * ahead (today counts only if the firing hour hasn't passed). No prediction
 * (no records) means no reminders — we never invent a date.
 */
export function planNotifications({ periods, settings, now }: PlanInput): PlannedNotification[] {
  if (!settings.notificationsEnabled) return [];
  const prediction = predictNextPeriod(periods, settings);
  const predictedDate = prediction.predictedDate;
  if (!predictedDate) return [];

  const today = toISO(now);
  const isUpcoming = (date: ISODate) =>
    date > today || (date === today && now.getHours() < NOTIFICATION_HOUR);

  const planned: PlannedNotification[] = [];

  if (settings.notifPeriodDueEnabled) {
    const leadDays = settings.notifPeriodDueLeadDays;
    const date = addDaysISO(predictedDate, -leadDays);
    if (isUpcoming(date)) {
      planned.push({ id: NOTIFICATION_IDS.periodDue, kind: 'periodDue', date, leadDays });
    }
  }

  if (settings.notifPeriodDelayEnabled) {
    const date = addDaysISO(predictedDate, PERIOD_DELAY_GRACE_DAYS);
    if (isUpcoming(date)) {
      planned.push({ id: NOTIFICATION_IDS.periodDelay, kind: 'periodDelay', date });
    }
  }

  if (settings.notifFertileEnabled) {
    const window = predictFertileWindow(predictedDate, prediction.confidence);
    if (window && isUpcoming(window.start)) {
      planned.push({ id: NOTIFICATION_IDS.fertile, kind: 'fertile', date: window.start });
    }
  }

  return planned;
}
