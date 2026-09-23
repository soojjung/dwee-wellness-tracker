'use client';
import { useState } from 'react';
import { useT } from '@/i18n/useT';
import { MyPageBackLink } from './MyPageBackLink';
import { useSettingsStore } from '@/store/settingsStore';
import { SettingCard, SettingDetailRow, SettingToggleRow } from './SettingRows';
import { ChevronIcon, LeadDaysWheel } from './LeadDaysWheel';
import {
  canDeliverLocalNotifications,
  ensureNotificationPermission,
} from '@/lib/notifications/localNotifications';

export function NotificationsScreen() {
  const t = useT();
  const settings = useSettingsStore((s) => s.settings);
  const update = useSettingsStore((s) => s.update);
  const [timingOpen, setTimingOpen] = useState(false);
  // iOS answered "don't allow" for this app — the toggles would be a lie.
  const [permissionDenied, setPermissionDenied] = useState(false);
  const nativeDelivery = canDeliverLocalNotifications();

  const master = settings.notificationsEnabled;
  const periodDue = settings.notifPeriodDueEnabled;
  const periodDelay = settings.notifPeriodDelayEnabled;
  const fertile = settings.notifFertileEnabled;
  const leadDays = settings.notifPeriodDueLeadDays;

  // Spec (Figma 292:2765): turning master ON enables all sub-toggles; turning
  // master OFF disables all subs. When individual subs are toggled off and the
  // aggregate becomes false, we also flip master to false — screen collapses
  // back to state #1.
  const handleMasterToggle = async () => {
    const next = !master;
    if (next) {
      if (nativeDelivery) {
        const granted = await ensureNotificationPermission();
        setPermissionDenied(!granted);
        if (!granted) return;
      }
      update({
        notificationsEnabled: true,
        notifPeriodDueEnabled: true,
        notifPeriodDelayEnabled: true,
        notifFertileEnabled: true,
      });
    } else {
      update({
        notificationsEnabled: false,
        notifPeriodDueEnabled: false,
        notifPeriodDelayEnabled: false,
        notifFertileEnabled: false,
      });
      setTimingOpen(false);
    }
  };

  const toggleSub = (key: 'periodDue' | 'periodDelay' | 'fertile') => {
    const nextValues = {
      periodDue: key === 'periodDue' ? !periodDue : periodDue,
      periodDelay: key === 'periodDelay' ? !periodDelay : periodDelay,
      fertile: key === 'fertile' ? !fertile : fertile,
    };
    const anyOn = nextValues.periodDue || nextValues.periodDelay || nextValues.fertile;
    update({
      notifPeriodDueEnabled: nextValues.periodDue,
      notifPeriodDelayEnabled: nextValues.periodDelay,
      notifFertileEnabled: nextValues.fertile,
      notificationsEnabled: anyOn,
    });
    if (key === 'periodDue' && !nextValues.periodDue) setTimingOpen(false);
  };

  const timingValue =
    leadDays === 0
      ? t.myPage.notifications.periodDueTimingSameDay
      : `${t.myPage.notifications.periodDueTimingValuePrefix}${leadDays}${t.myPage.notifications.periodDueTimingValueSuffix}`;

  return (
    <div className="flex min-h-dvh flex-col bg-brand-gray200">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-[calc(3.5rem+env(safe-area-inset-top,0px))] items-center pt-[env(safe-area-inset-top,0px)] bg-brand-gray200 px-4">
          <MyPageBackLink ariaLabel={t.myPage.notifications.backAriaLabel} />
        </header>

        <main className="flex flex-col gap-4 px-4 pb-24">
          <SettingCard>
            <SettingToggleRow
              title={t.myPage.notifications.master}
              enabled={master}
              onToggle={() => void handleMasterToggle()}
            />
          </SettingCard>
          {permissionDenied ? (
            <p className="-mt-2 px-1 text-xs leading-[1.5] text-brand-gray600" role="status">
              {t.myPage.notifications.permissionDenied}
            </p>
          ) : null}
          {!nativeDelivery ? (
            <p className="-mt-2 px-1 text-xs leading-[1.5] text-brand-gray600">
              {t.myPage.notifications.webOnlyHint}
            </p>
          ) : null}

          {master ? (
            <>
              <SettingCard>
                <SettingDetailRow
                  title={t.myPage.notifications.periodDue.title}
                  subtitle={t.myPage.notifications.periodDue.subtitle}
                  enabled={periodDue}
                  onToggle={() => toggleSub('periodDue')}
                />
                {periodDue ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setTimingOpen((v) => !v)}
                      aria-expanded={timingOpen}
                      className="flex h-[52px] w-full items-center justify-between px-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-gray900"
                    >
                      <span className="text-base text-brand-gray700">
                        {t.myPage.notifications.periodDueTiming}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="text-base font-medium text-brand-pink300">
                          {timingValue}
                        </span>
                        <ChevronIcon open={timingOpen} />
                      </span>
                    </button>
                    {timingOpen ? (
                      <LeadDaysWheel
                        value={leadDays}
                        onChange={(d) => update({ notifPeriodDueLeadDays: d })}
                        unit={t.myPage.notifications.periodDueTimingWheelUnit}
                        trailingLabel={t.myPage.notifications.periodDueTimingWheelTrailing}
                      />
                    ) : null}
                  </>
                ) : null}
              </SettingCard>

              <SettingCard>
                <SettingDetailRow
                  title={t.myPage.notifications.periodDelay.title}
                  subtitle={t.myPage.notifications.periodDelay.subtitle}
                  enabled={periodDelay}
                  onToggle={() => toggleSub('periodDelay')}
                />
              </SettingCard>

              <SettingCard>
                <SettingDetailRow
                  title={t.myPage.notifications.fertile.title}
                  subtitle={t.myPage.notifications.fertile.subtitle}
                  enabled={fertile}
                  onToggle={() => toggleSub('fertile')}
                />
              </SettingCard>
            </>
          ) : null}
        </main>
      </div>
    </div>
  );
}
