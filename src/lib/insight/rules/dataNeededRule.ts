import type { Insight } from '@/types';
import type { InsightContext } from '../generator';

export function dataNeededRule(ctx: InsightContext): Insight[] | null {
  if (ctx.periods.length >= 2) return null;
  return [
    {
      id: 'data_needed',
      kind: 'data_needed',
      confidence: 'unknown',
    },
  ];
}
