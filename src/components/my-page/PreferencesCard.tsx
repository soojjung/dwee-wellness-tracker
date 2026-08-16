'use client';
import { useT } from '@/i18n/useT';
import { useSettingsStore } from '@/store/settingsStore';
import { MyPageCard } from './MyPageCard';
import { MyPageRow } from './MyPageRow';
import { MyPageToggle } from './MyPageToggle';

/**
 * `설정` card — notification toggle + language row that navigates to the
 * language sub-page (delivered in a later design batch).
 */
export function PreferencesCard() {
  const t = useT();
  const enabled = useSettingsStore((s) => s.settings.notificationsEnabled);
  const locale = useSettingsStore((s) => s.settings.locale);
  const update = useSettingsStore((s) => s.update);

  const languageLabel = locale === 'ko' ? t.settings.languageKo : t.settings.languageEn;

  return (
    <MyPageCard title={t.myPage.settings.title}>
      <div className="flex flex-col">
        <MyPageRow
          label={t.myPage.settings.notifications}
          trailing={
            <MyPageToggle
              enabled={enabled}
              onToggle={() => update({ notificationsEnabled: !enabled })}
              ariaLabel={t.myPage.settings.notifications}
            />
          }
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
