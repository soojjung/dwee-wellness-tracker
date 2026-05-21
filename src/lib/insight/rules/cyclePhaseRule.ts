import type { Insight } from '@/types';
import type { InsightContext } from '../generator';
import { currentPhase } from '@/domain/cycle/phase';

export function cyclePhaseRule(ctx: InsightContext): Insight[] | null {
  if (ctx.periods.length === 0) return null;
  const estimate = currentPhase(ctx.today, ctx.periods, ctx.settings);
  if (estimate.phase === 'unknown') return null;
  return [
    {
      id: 'cycle_phase',
      kind: 'cycle_phase',
      phase: estimate.phase,
      confidence: estimate.confidence,
    },
  ];
}
