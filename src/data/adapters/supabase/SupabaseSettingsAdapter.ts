import type { HolidayCountry, UserSettings } from '@/types';
import { DEFAULT_USER_SETTINGS } from '@/types/userSettings';
import type { SettingsRepository } from '@/data/repositories/SettingsRepository';
import { supabase, requireUserId } from './client';

interface ProfileRow {
  id: string;
  locale: 'ko' | 'en';
  average_cycle_length: number;
  average_period_length: number;
  notifications_enabled: boolean;
  onboarding_completed: boolean;
  /** null = 언어 따라 자동 (0014 migration). */
  holiday_countries: HolidayCountry[] | null;
}

function rowToSettings(row: ProfileRow): UserSettings {
  // Only known Supabase columns are mapped; the notification sub-toggles
  // (IndexedDB only until push infrastructure is wired) and `ageConfirmedAt`
  // (deliberately per-install, see UserSettings) never reach the server.
  // Spread defaults so those fields fall back safely.
  return {
    ...DEFAULT_USER_SETTINGS,
    locale: row.locale,
    averageCycleLength: row.average_cycle_length,
    averagePeriodLength: row.average_period_length,
    notificationsEnabled: row.notifications_enabled,
    onboardingCompleted: row.onboarding_completed,
    holidayCountries: row.holiday_countries ?? null,
  };
}

function patchToRow(patch: Partial<UserSettings>): Partial<ProfileRow> {
  const out: Partial<ProfileRow> = {};
  if (patch.locale !== undefined) out.locale = patch.locale;
  if (patch.averageCycleLength !== undefined) out.average_cycle_length = patch.averageCycleLength;
  if (patch.averagePeriodLength !== undefined)
    out.average_period_length = patch.averagePeriodLength;
  if (patch.notificationsEnabled !== undefined)
    out.notifications_enabled = patch.notificationsEnabled;
  if (patch.onboardingCompleted !== undefined) out.onboarding_completed = patch.onboardingCompleted;
  if (patch.holidayCountries !== undefined) {
    out.holiday_countries = patch.holidayCountries ? [...patch.holidayCountries] : null;
  }
  return out;
}

export const supabaseSettingsAdapter: SettingsRepository = {
  async get() {
    const userId = await requireUserId();
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (error) throw error;
    return data ? rowToSettings(data as ProfileRow) : DEFAULT_USER_SETTINGS;
  },

  async update(patch) {
    const userId = await requireUserId();
    const row = patchToRow(patch);
    const { data, error } = await supabase
      .from('profiles')
      .update(row)
      .eq('id', userId)
      .select('*')
      .single();
    if (error) throw error;
    return rowToSettings(data as ProfileRow);
  },
};
