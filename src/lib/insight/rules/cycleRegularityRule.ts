import type { Insight } from '@/types';
import type { InsightContext } from '../generator';
import { averageCycleLength } from '@/domain/cycle/aggregate';

export function cycleRegularityRule(ctx: InsightContext): Insight[] | null {
  const avg = averageCycleLength(ctx.periods);
  if (avg === null) return null;
  return [
    {
      id: 'cycle_regularity',
      kind: 'cycle_regularity',
      averageDays: avg,
      confidence: ctx.periods.length >= 4 ? 'high' : 'medium',
    },
  ];
}
