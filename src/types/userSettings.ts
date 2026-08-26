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
};
