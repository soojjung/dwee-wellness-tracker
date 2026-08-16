import type { PeriodLog, DailyConditionLog, UserSettings, Insight } from '@/types';
import { cycleRegularityRule } from './rules/cycleRegularityRule';
// Retired from Home 2026-08-16 — the MyPage cycle card already surfaces the
// "not enough data" state (with a stricter 3-record threshold), and the home
// hero itself prompts a first period entry. Keeping the rule file + i18n
// keys around in case we want to reintroduce it on another surface.
// import { dataNeededRule } from './rules/dataNeededRule';
import { cyclePhaseRule } from './rules/cyclePhaseRule';
import { painPatternRule } from './rules/painPatternRule';
import { moodTrendRule } from './rules/moodTrendRule';

export interface InsightContext {
  today: string;
  periods: PeriodLog[];
  conditions: DailyConditionLog[];
  settings: UserSettings;
}

export function generateInsights(ctx: InsightContext): Insight[] {
  const rules = [
    // dataNeededRule,
    cycleRegularityRule,
    cyclePhaseRule,
    painPatternRule,
    moodTrendRule,
  ];
  return rules.flatMap((rule) => rule(ctx) ?? []);
}
