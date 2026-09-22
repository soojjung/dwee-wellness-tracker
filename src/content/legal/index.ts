import type { Locale } from '@/types';
import { TERMS_KO, type TermsDocument } from './terms-ko';
import { TERMS_EN } from './terms-en';
import { PRIVACY_KO, type PrivacyDocument } from './privacy-ko';
import { PRIVACY_EN } from './privacy-en';

export type { TermsDocument, TermsSection } from './terms-ko';
export type { PrivacyDocument, PrivacySection, PrivacyBlock } from './privacy-ko';

// The Korean text is the governing document; en is a convenience translation
// (each en file says so in its own intro).
export function legalTerms(locale: Locale): TermsDocument {
  return locale === 'ko' ? TERMS_KO : TERMS_EN;
}

export function legalPrivacy(locale: Locale): PrivacyDocument {
  return locale === 'ko' ? PRIVACY_KO : PRIVACY_EN;
}
