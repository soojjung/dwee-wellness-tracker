'use client';
import { useT } from '@/i18n/useT';
import type { CyclePhase } from '@/domain/cycle/types';

interface PhaseAdvicePillProps {
  phase: CyclePhase;
}

export function PhaseAdvicePill({ phase }: PhaseAdvicePillProps) {
  const t = useT();
  return (
    <div className="flex items-center gap-4 rounded-lg bg-brand-gray200 px-6 py-4">
      <span className="shrink-0 text-sm font-semibold text-brand-gray900">
        {t.home.phaseShortLabel[phase]}
      </span>
      <span className="h-4 w-px shrink-0 bg-brand-gray500" aria-hidden />
      <p className="text-sm leading-relaxed tracking-tight text-brand-gray800">
        {t.home.phaseAdvice[phase]}
      </p>
    </div>
  );
}
