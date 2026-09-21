import type { CycleState } from '@/domain/cycle/weekStripDays';

// Fill for actual data, outline for predicted, subtle outline for default.
export function cellChipClasses(state: CycleState): string {
  switch (state) {
    case 'actualPeriod':
      return 'bg-brand-pink100 text-brand-pink900';
    case 'predictedPeriod':
      return 'border border-brand-pink200 bg-brand-white text-brand-pink500';
    case 'predictedFertile':
      return 'border border-brand-lavender100 bg-brand-white text-brand-lavender400';
    case null:
      return 'border border-brand-gray300 bg-brand-white text-brand-gray600';
  }
}

export function todayEmptyChipClasses(): string {
  return 'bg-brand-gray900 text-brand-white';
}

export function stateLabelColorClass(state: CycleState): string {
  switch (state) {
    case 'actualPeriod':
    case 'predictedPeriod':
      return 'text-brand-pink500';
    case 'predictedFertile':
      return 'text-brand-lavender400';
    case null:
      return 'text-brand-gray600';
  }
}

export function stateLabelFor(
  state: CycleState,
  copy: { actualPeriod: string; predictedPeriod: string; predictedFertile: string },
): string | null {
  switch (state) {
    case 'actualPeriod':
      return copy.actualPeriod;
    case 'predictedPeriod':
      return copy.predictedPeriod;
    case 'predictedFertile':
      return copy.predictedFertile;
    case null:
      return null;
  }
}

export function formatTodayChip(args: {
  todayState: CycleState;
  daysUntilNext: number | null;
  dDayPrefix: string;
  dDaySuffix: string;
  todayLabel: string;
  menstrualLabel: string;
}): string {
  if (args.todayState === 'actualPeriod') return args.menstrualLabel;
  if (args.daysUntilNext === null) return args.todayLabel;
  if (args.daysUntilNext <= 0) return args.todayLabel;
  return `${args.dDayPrefix}${args.daysUntilNext}${args.dDaySuffix}`;
}
