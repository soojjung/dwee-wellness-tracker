'use client';
import { useT } from '@/i18n/useT';
import { useSettingsStore } from '@/store/settingsStore';
import { PageContainer } from '@/components/ui/PageContainer';
import { ChoiceGroup } from '@/components/ui/ChoiceGroup';
import type { Locale } from '@/types';
import { NotificationToggle } from '@/components/settings/NotificationToggle';
import { CycleLengthEditor } from '@/components/settings/CycleLengthEditor';
import { DataResetSection } from '@/components/settings/DataResetSection';
import { DevSeedSection } from '@/components/settings/DevSeedSection';
import { AccountSection } from '@/components/settings/AccountSection';
import { APP_VERSION } from '@/constants/app';

export default function SettingsPage() {
  const t = useT();
  const locale = useSettingsStore((s) => s.settings.locale);
  const update = useSettingsStore((s) => s.update);

  const localeChoices = [
    { value: 'ko' as Locale, label: t.settings.languageKo },
    { value: 'en' as Locale, label: t.settings.languageEn },
  ];

  return (
    <PageContainer className="gap-6">
      <h1 className="text-2xl font-semibold text-brand-gray900">{t.settings.title}</h1>

      <section className="flex flex-col gap-2">
        <span className="text-sm font-medium text-brand-gray900">{t.settings.language}</span>
        <ChoiceGroup
          ariaLabel={t.settings.language}
          value={locale}
          onChange={(v) => update({ locale: v })}
          choices={localeChoices}
        />
      </section>

      <CycleLengthEditor />

      <NotificationToggle />

      <AccountSection />

      <DataResetSection />

      <DevSeedSection />

      <section className="flex items-center justify-between border-t border-brand-gray300 pt-4 text-sm">
        <span className="text-brand-gray600">{t.settings.versionLabel}</span>
        <span className="font-medium text-brand-gray900">{APP_VERSION}</span>
      </section>
    </PageContainer>
  );
}
