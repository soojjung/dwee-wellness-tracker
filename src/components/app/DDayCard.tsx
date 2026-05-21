'use client';
import { useT } from '@/i18n/useT';
import type { CyclePhase } from '@/domain/cycle/types';

interface DDayCardProps {
  daysUntilNext: number | null;
  phase: CyclePhase;
}

export function DDayCard({ daysUntilNext, phase }: DDayCardProps) {
  const t = useT();
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-brand-gray900 px-6 py-5">
      <p className="text-2xl font-semibold text-brand-white">
        {daysUntilNext === null
          ? t.home.dDayNone
          : `${t.home.dDayPrefix}${Math.max(0, daysUntilNext)}`}
      </p>
      <p className="text-sm font-medium text-brand-gray400">{t.home.phaseAdvice[phase]}</p>
    </div>
  );
}
