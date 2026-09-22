'use client';
import { useEffect } from 'react';
import { useT } from '@/i18n/useT';
import { usePeriodStore } from '@/store/periodStore';
import { useSettingsStore } from '@/store/settingsStore';
import { planNotifications, type PlannedNotification } from '@/domain/notification/schedule';
import {
  canDeliverLocalNotifications,
  syncLocalNotifications,
  type NotificationCopy,
} from '@/lib/notifications/localNotifications';
import type { Dictionary } from '@/i18n';

function copyFor(t: Dictionary): (p: PlannedNotification) => NotificationCopy {
  const push = t.myPage.notifications.push;
  return (p) => {
    switch (p.kind) {
      case 'periodDue':
        return p.leadDays === 0
          ? { title: push.periodDueToday.title, body: push.periodDueToday.body }
          : {
              title: push.periodDue.title,
              body: `${push.periodDue.bodyPrefix}${p.leadDays}${push.periodDue.bodySuffix}`,
            };
      case 'periodDelay':
        return { title: push.periodDelay.title, body: push.periodDelay.body };
      case 'fertile':
        return { title: push.fertile.title, body: push.fertile.body };
    }
  };
}

/**
 * Keeps the OS reminder queue equal to `planNotifications()` whenever the
 * records or the notification settings change. Native only; on the web this
 * is a no-op. Mounted once in AppShell.
 */
export function useNotificationSync(): void {
  const t = useT();
  const periods = usePeriodStore((s) => s.periods);
  const periodsHydrated = usePeriodStore((s) => s.hydrated);
  const settings = useSettingsStore((s) => s.settings);
  const settingsHydrated = useSettingsStore((s) => s.hydrated);

  useEffect(() => {
    if (!canDeliverLocalNotifications() || !periodsHydrated || !settingsHydrated) return;
    const planned = planNotifications({ periods, settings, now: new Date() });
    void syncLocalNotifications(planned, copyFor(t)).catch(() => undefined);
  }, [periods, periodsHydrated, settings, settingsHydrated, t]);
}
