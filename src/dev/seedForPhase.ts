// Snapshot/test helper: seed exactly the data needed so today lands on a given cycle phase.
// Mirrors the logic in `src/domain/cycle/phase.ts` so the assertions stay aligned.
import {
  periodRepo,
  settingsRepo,
  ensureMigrations,
  resetAllUserData,
} from '@/data';
import { todayISO, addDaysISO } from '@/lib/date';
import type { Locale } from '@/types';

type PhaseKind = 'menstrual' | 'follicular' | 'ovulation' | 'luteal' | 'unknown';

const PERIOD_DURATION = 5;
const CYCLE = 28;

const DAYS_AGO_BY_PHASE: Record<PhaseKind, number | null> = {
  menstrual: 1,
  follicular: 6,
  ovulation: 13,
  luteal: 20,
  unknown: 60,
};

export async function seedForPhase(phase: PhaseKind, locale: Locale = 'en') {
  if (process.env.NODE_ENV === 'production') return;
  // AuthGuard redirects to /login when no user is present. Synthesize an anon
  // user directly in state (see ensureAnon.ts for why we skip Supabase).
  const { ensureAnon } = await import('./ensureAnon');
  await ensureAnon();
  await ensureMigrations();
  await resetAllUserData();
  await settingsRepo.update({
    locale,
    onboardingCompleted: true,
    averageCycleLength: CYCLE,
    averagePeriodLength: PERIOD_DURATION,
  });
  const daysAgo = DAYS_AGO_BY_PHASE[phase];
  if (daysAgo === null) return;

  const today = todayISO();
  const offsets = [daysAgo, daysAgo + CYCLE, daysAgo + 2 * CYCLE];
  for (const offset of offsets) {
    const startDate = addDaysISO(today, -offset);
    const endDate = addDaysISO(startDate, PERIOD_DURATION - 1);
    await periodRepo.add({ startDate, endDate });
  }
}
