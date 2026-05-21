// 초안. SettingsRepository 구현.
import type { UserSettings } from '@/types';
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
}

function rowToSettings(row: ProfileRow): UserSettings {
  return {
    locale: row.locale,
    averageCycleLength: row.average_cycle_length,
    averagePeriodLength: row.average_period_length,
    notificationsEnabled: row.notifications_enabled,
    onboardingCompleted: row.onboarding_completed,
  };
}

function patchToRow(patch: Partial<UserSettings>): Partial<ProfileRow> {
  const out: Partial<ProfileRow> = {};
  if (patch.locale !== undefined) out.locale = patch.locale;
  if (patch.averageCycleLength !== undefined) out.average_cycle_length = patch.averageCycleLength;
  if (patch.averagePeriodLength !== undefined) out.average_period_length = patch.averagePeriodLength;
  if (patch.notificationsEnabled !== undefined) out.notifications_enabled = patch.notificationsEnabled;
  if (patch.onboardingCompleted !== undefined) out.onboarding_completed = patch.onboardingCompleted;
  return out;
}

export const supabaseSettingsAdapter: SettingsRepository = {
  async get() {
    const userId = await requireUserId();
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
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
