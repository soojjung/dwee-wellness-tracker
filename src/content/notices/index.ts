import type { Locale } from '@/types';
import type { Notice } from './types';
import { NOTICES_EN } from './en';
import { NOTICES_KO } from './ko';

export type { Notice } from './types';

export function noticesFor(locale: Locale): readonly Notice[] {
  return locale === 'ko' ? NOTICES_KO : NOTICES_EN;
}

/** URL segment for a notice — dots in a version would read as a file extension in the static export. */
export function noticeSlug(version: string): string {
  return version.replace(/\./g, '-');
}

export const NOTICE_SLUGS: readonly string[] = NOTICES_EN.map((n) => noticeSlug(n.version));

export function findNotice(locale: Locale, slug: string): Notice | undefined {
  return noticesFor(locale).find((n) => noticeSlug(n.version) === slug);
}
