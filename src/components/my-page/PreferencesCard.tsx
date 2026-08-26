'use client';
import { useT } from '@/i18n/useT';
import { useSettingsStore } from '@/store/settingsStore';
import { MyPageCard } from './MyPageCard';
import { MyPageRow } from './MyPageRow';

/**
 * `설정` card — notification + language rows that both navigate to a
 * dedicated sub-page. Notification detail (per-topic toggles) lives on
 * /settings/notifications.
 */
export function PreferencesCard() {
  const t = useT();
  const enabled = useSettingsStore((s) => s.settings.notificationsEnabled);
  const locale = useSettingsStore((s) => s.settings.locale);

  const languageLabel = locale === 'ko' ? t.settings.languageKo : t.settings.languageEn;
  const notificationsLabel = enabled
    ? t.myPage.notifications.valueOn
    : t.myPage.notifications.valueOff;

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
      </div>
    </MyPageCard>
  );
}
