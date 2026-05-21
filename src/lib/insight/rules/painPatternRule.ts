import type { Insight } from '@/types';
import type { InsightContext } from '../generator';
import { addDaysISO } from '@/lib/date';

const PAIN_THRESHOLD = 3;
const PAIN_WINDOW_DAYS = 2;

export function painPatternRule(ctx: InsightContext): Insight[] | null {
  if (ctx.periods.length < 2 || ctx.conditions.length === 0) return null;

  const byDate = new Map(ctx.conditions.map((c) => [c.date, c]));
  let count = 0;
  for (const p of ctx.periods) {
    for (let offset = 0; offset < PAIN_WINDOW_DAYS; offset += 1) {
      const day = addDaysISO(p.startDate, offset);
      const log = byDate.get(day);
      if (log && log.pain && log.pain !== 'none') count += 1;
    }
  }

  if (count < PAIN_THRESHOLD) return null;
  return [
    {
      id: 'pain_pattern',
      kind: 'pain_pattern',
      count,
      confidence: ctx.periods.length >= 3 ? 'medium' : 'low',
    },
  ];
}
