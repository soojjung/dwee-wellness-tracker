import type { PeriodLog, DailyConditionLog, UserSettings, Insight } from '@/types';
import { cycleRegularityRule } from './rules/cycleRegularityRule';
import { dataNeededRule } from './rules/dataNeededRule';
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
    dataNeededRule,
    cycleRegularityRule,
    cyclePhaseRule,
    painPatternRule,
    moodTrendRule,
  ];
  return rules.flatMap((rule) => rule(ctx) ?? []);
}
