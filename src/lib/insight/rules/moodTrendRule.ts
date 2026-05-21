import type { Insight } from '@/types';
import type { InsightContext } from '../generator';
import { addDaysISO } from '@/lib/date';

const MOOD_THRESHOLD = 3;
const MOOD_WINDOW_DAYS = 3;

export function moodTrendRule(ctx: InsightContext): Insight[] | null {
  if (ctx.periods.length < 2 || ctx.conditions.length === 0) return null;

  const byDate = new Map(ctx.conditions.map((c) => [c.date, c]));
  let count = 0;
  for (const p of ctx.periods) {
    for (let offset = 1; offset <= MOOD_WINDOW_DAYS; offset += 1) {
      const day = addDaysISO(p.startDate, -offset);
      const log = byDate.get(day);
      if (log && (log.mood === 'down' || log.mood === 'low')) count += 1;
    }
  }

  if (count < MOOD_THRESHOLD) return null;
  return [
    {
      id: 'mood_trend',
      kind: 'mood_trend',
      count,
      confidence: ctx.periods.length >= 3 ? 'medium' : 'low',
    },
  ];
}
