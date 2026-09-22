'use client';
import { useSearchParams } from 'next/navigation';
import { useSettingsStore } from '@/store/settingsStore';
import { dictionaries, type Dictionary } from '@/i18n';
import type { Locale } from '@/types';

function isLocale(value: string | null): value is Locale {
  return value === 'ko' || value === 'en';
}

/**
 * Locale for the public legal pages: `?lang=en|ko` wins (so a store listing or
 * a reviewer can pin the language without touching the app setting), otherwise
 * the app locale. Also hands back the matching dictionary, since `useT()` only
 * knows the app locale.
 */
export function useLegalLocale(): { locale: Locale; t: Dictionary } {
  const appLocale = useSettingsStore((s) => s.settings.locale);
  const param = useSearchParams().get('lang');
  const locale = isLocale(param) ? param : appLocale;
  return { locale, t: dictionaries[locale] };
}
