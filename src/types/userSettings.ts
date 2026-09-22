import type { HolidayCountry } from './holiday';

export type Locale = 'ko' | 'en';

export interface UserSettings {
  averageCycleLength: number;
  averagePeriodLength: number;
  /** Master notifications toggle. Derived state: true iff any sub-toggle is on. */
  notificationsEnabled: boolean;
  notifPeriodDueEnabled: boolean;
  /** Days-before-period notification lead time. 0 = day-of. */
  notifPeriodDueLeadDays: number;
  notifPeriodDelayEnabled: boolean;
  notifFertileEnabled: boolean;
  onboardingCompleted: boolean;
  locale: Locale;
  /**
   * 다이어리에 표시할 공휴일 나라. `null` 은 "언어 따라 자동"(ko→KR, en→US) —
   * 사용자가 토글을 건드리기 전까지의 기본값. 해석은 `domain/holiday`
   * 의 `resolveHolidayCountries` 가 한다.
   */
  holidayCountries: readonly HolidayCountry[] | null;
  /**
   * ISO datetime of the login-screen consent tap (14+ and terms/privacy).
   * `null` = not yet confirmed on this install. Kept local-only (not a
   * Supabase column) and wiped by `resetAllUserData`, so a sign-out asks
   * again — the next person on the device may not be the same one.
   */
  ageConfirmedAt: string | null;
}

export const DEFAULT_USER_SETTINGS: UserSettings = {
  averageCycleLength: 28,
  averagePeriodLength: 5,
  notificationsEnabled: false,
  notifPeriodDueEnabled: false,
  notifPeriodDueLeadDays: 5,
  notifPeriodDelayEnabled: false,
  notifFertileEnabled: false,
  onboardingCompleted: false,
  locale: 'en',
  holidayCountries: null,
  ageConfirmedAt: null,
};
