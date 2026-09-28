'use client';
import { useT } from '@/i18n/useT';
import { useSettingsStore } from '@/store/settingsStore';
import { resolveHolidayCountries } from '@/domain/holiday';
import { MyPageCard } from './MyPageCard';
import { MyPageRow } from './MyPageRow';
import { MyPageToggle } from './MyPageToggle';

/**
 * `설정` card — notification / language / holiday rows navigate to a
 * dedicated sub-page; the calendar-predictions row is an inline switch.
 */
export function PreferencesCard() {
  const t = useT();
  const enabled = useSettingsStore((s) => s.settings.notificationsEnabled);
  const locale = useSettingsStore((s) => s.settings.locale);
  const holidaySetting = useSettingsStore((s) => s.settings.holidayCountries);
  const showPredictions = useSettingsStore((s) => s.settings.showCalendarPredictions);
  const update = useSettingsStore((s) => s.update);

  const languageLabel = locale === 'ko' ? t.settings.languageKo : t.settings.languageEn;
  const notificationsLabel = enabled
    ? t.myPage.notifications.valueOn
    : t.myPage.notifications.valueOff;
  const holidayCountries = resolveHolidayCountries(holidaySetting, locale);
  const holidaysLabel =
    holidayCountries.length === 0
      ? t.myPage.holidays.valueNone
      : holidayCountries.map((c) => t.myPage.holidays.valueByCountry[c]).join(' · ');

  return (
    <MyPageCard title={t.myPage.settings.title}>
      <div className="flex flex-col">
        <MyPageRow
          href="/settings/notifications"
          label={t.myPage.settings.notifications}
          value={notificationsLabel}
        />
        <MyPageRow
          href="/settings/language"
          label={t.myPage.settings.language}
          value={languageLabel}
        />
        <MyPageRow
          href="/settings/holidays"
          label={t.myPage.settings.holidays}
          value={holidaysLabel}
        />
        <MyPageRow
          label={t.myPage.settings.calendarPredictions}
          trailing={
            <MyPageToggle
              enabled={showPredictions}
              onToggle={() => void update({ showCalendarPredictions: !showPredictions })}
              ariaLabel={t.myPage.settings.calendarPredictions}
            />
          }
        />
      </div>
    </MyPageCard>
  );
}
