'use client';
import { useT } from '@/i18n/useT';
import { useSettingsStore } from '@/store/settingsStore';
import { resolveHolidayCountries } from '@/domain/holiday';
import type { HolidayCountry } from '@/types';
import { MyPageBackLink } from './MyPageBackLink';
import { SettingCard, SettingDetailRow } from './SettingRows';

/**
 * 마이페이지 → 공휴일 표시. 나라별 토글 두 개.
 *
 * 저장값이 `null`(언어 따라 자동)인 동안은 해석된 값을 보여주고, 토글을 한 번이라도
 * 건드리면 그 시점의 해석값을 기준으로 명시적 배열을 저장한다 — 그래야 나중에 언어를
 * 바꿔도 사용자가 고른 나라가 그대로 남는다.
 */
export function HolidaysScreen() {
  const t = useT();
  const c = t.myPage.holidays;
  const setting = useSettingsStore((s) => s.settings.holidayCountries);
  const locale = useSettingsStore((s) => s.settings.locale);
  const update = useSettingsStore((s) => s.update);

  const enabled = resolveHolidayCountries(setting, locale);
  const isAuto = setting === null;

  function toggle(country: HolidayCountry) {
    const next = enabled.includes(country)
      ? enabled.filter((c) => c !== country)
      : [...enabled, country];
    void update({ holidayCountries: next });
  }

  return (
    <div className="flex min-h-dvh flex-col bg-brand-gray200">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-14 items-center bg-brand-gray200 px-4">
          <MyPageBackLink ariaLabel={c.backAriaLabel} />
        </header>

        <main className="flex flex-col gap-4 px-4 pb-24">
          <div className="flex flex-col gap-1 px-1">
            <h1 className="text-xl font-semibold leading-normal text-brand-gray900">{c.title}</h1>
            <p className="text-sm leading-normal text-brand-gray700">{c.description}</p>
          </div>

          <SettingCard>
            <SettingDetailRow
              title={c.kr.title}
              subtitle={c.kr.subtitle}
              enabled={enabled.includes('KR')}
              onToggle={() => toggle('KR')}
            />
            <div className="mx-5 h-px bg-brand-gray200" />
            <SettingDetailRow
              title={c.us.title}
              subtitle={c.us.subtitle}
              enabled={enabled.includes('US')}
              onToggle={() => toggle('US')}
            />
          </SettingCard>

          {isAuto ? (
            <p className="px-1 text-xs leading-normal text-brand-gray600">{c.autoHint}</p>
          ) : null}
        </main>
      </div>
    </div>
  );
}
