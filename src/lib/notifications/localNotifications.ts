import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { atLocalHour } from '@/lib/date';
import {
  NOTIFICATION_HOUR,
  NOTIFICATION_IDS,
  type PlannedNotification,
} from '@/domain/notification/schedule';

export interface NotificationCopy {
  title: string;
  body: string;
}

/** Local notifications exist only inside the Capacitor shell; the PWA has none. */
export function canDeliverLocalNotifications(): boolean {
  return Capacitor.isNativePlatform();
}

/** Prompts once (iOS shows the system dialog only the first time). */
export async function ensureNotificationPermission(): Promise<boolean> {
  if (!canDeliverLocalNotifications()) return false;
  const current = await LocalNotifications.checkPermissions();
  if (current.display === 'granted') return true;
  if (current.display === 'denied') return false;
  const asked = await LocalNotifications.requestPermissions();
  return asked.display === 'granted';
}

export async function cancelAllLocalNotifications(): Promise<void> {
  if (!canDeliverLocalNotifications()) return;
  await LocalNotifications.cancel({
    notifications: Object.values(NOTIFICATION_IDS).map((id) => ({ id })),
  });
}

/**
 * Replaces every dwee reminder with the given plan. Cancel-then-schedule on
 * the fixed ids keeps the OS queue equal to the plan no matter what was
 * pending before (records edited, settings changed, app reinstalled).
 */
export async function syncLocalNotifications(
  planned: PlannedNotification[],
  copyFor: (p: PlannedNotification) => NotificationCopy,
): Promise<void> {
  if (!canDeliverLocalNotifications()) return;
  await cancelAllLocalNotifications();
  if (planned.length === 0) return;
  const status = await LocalNotifications.checkPermissions();
  if (status.display !== 'granted') return;
  await LocalNotifications.schedule({
    notifications: planned.map((p) => {
      const copy = copyFor(p);
      return {
        id: p.id,
        title: copy.title,
        body: copy.body,
        schedule: { at: atLocalHour(p.date, NOTIFICATION_HOUR), allowWhileIdle: true },
      };
    }),
  });
}
