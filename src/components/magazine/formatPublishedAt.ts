import type { Locale } from '@/types';

const localeTag: Record<Locale, string> = {
  en: 'en-US',
  ko: 'ko-KR',
};

export function formatPublishedAt(iso: string, locale: Locale): string {
  const date = new Date(iso);
  return new Intl.DateTimeFormat(localeTag[locale], {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}
