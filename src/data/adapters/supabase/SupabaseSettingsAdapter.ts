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
  /** 0016 migration. 옵셔널인 이유는 아래 rowToSettings 참고. */
  notif_period_due_enabled?: boolean;
  notif_period_delay_enabled?: boolean;
  notif_fertile_enabled?: boolean;
  notif_period_due_lead_days?: number;
  onboarding_completed: boolean;
  /** null = 언어 따라 자동 (0014 migration). */
  holiday_countries: HolidayCountry[] | null;
}

function rowToSettings(row: ProfileRow): UserSettings {
  // `ageConfirmedAt` 는 일부러 기기별(설치별) 값이라 서버에 없다 (UserSettings 참고).
  // 알림 세부 컬럼은 0016 에서 추가됐다 — 마이그레이션이 아직 안 된 DB 에서는
  // 빠져서 오므로 기본값으로 메운다.
  return {
    ...DEFAULT_USER_SETTINGS,
    locale: row.locale,
    averageCycleLength: row.average_cycle_length,
    averagePeriodLength: row.average_period_length,
    notificationsEnabled: row.notifications_enabled,
    notifPeriodDueEnabled:
      row.notif_period_due_enabled ?? DEFAULT_USER_SETTINGS.notifPeriodDueEnabled,
    notifPeriodDelayEnabled:
      row.notif_period_delay_enabled ?? DEFAULT_USER_SETTINGS.notifPeriodDelayEnabled,
    notifFertileEnabled: row.notif_fertile_enabled ?? DEFAULT_USER_SETTINGS.notifFertileEnabled,
    notifPeriodDueLeadDays:
      row.notif_period_due_lead_days ?? DEFAULT_USER_SETTINGS.notifPeriodDueLeadDays,
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
  if (patch.notifPeriodDueEnabled !== undefined)
    out.notif_period_due_enabled = patch.notifPeriodDueEnabled;
  if (patch.notifPeriodDelayEnabled !== undefined)
    out.notif_period_delay_enabled = patch.notifPeriodDelayEnabled;
  if (patch.notifFertileEnabled !== undefined) out.notif_fertile_enabled = patch.notifFertileEnabled;
  if (patch.notifPeriodDueLeadDays !== undefined)
    out.notif_period_due_lead_days = patch.notifPeriodDueLeadDays;
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
