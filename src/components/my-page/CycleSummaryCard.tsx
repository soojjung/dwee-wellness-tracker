'use client';
import { useEffect } from 'react';
import { useT } from '@/i18n/useT';
import { usePeriodStore } from '@/store/periodStore';
import { classifyCycleStatus } from '@/domain/cycle/status';
import { MyPageCard } from './MyPageCard';

const CHIP_TONE: Record<
  ReturnType<typeof classifyCycleStatus>['status'],
  { bg: string; text: string }
> = {
  stable: { bg: 'bg-green-100', text: 'text-green-700' },
  regular: { bg: 'bg-blue-100', text: 'text-blue-700' },
  slightlyIrregular: { bg: 'bg-amber-100', text: 'text-amber-700' },
  irregular: { bg: 'bg-orange-100', text: 'text-orange-700' },
  shortPeriod: { bg: 'bg-brand-pink50', text: 'text-brand-pink800' },
  longPeriod: { bg: 'bg-brand-pink50', text: 'text-brand-pink800' },
  insufficient: { bg: 'bg-brand-gray200', text: 'text-brand-gray700' },
};

/**
 * Shows the user's average cycle length + a status chip in the top-right.
 * When there aren't enough records yet, replaces the number with the
 * "add more entries" hint copy.
 */
export function CycleSummaryCard() {
  const t = useT();
  const hydrated = usePeriodStore((s) => s.hydrated);
  const hydrate = usePeriodStore((s) => s.hydrate);
  const periods = usePeriodStore((s) => s.periods);

  useEffect(() => {
    if (!hydrated) void hydrate();
  }, [hydrated, hydrate]);

  const result = classifyCycleStatus(periods);
  const isInsufficient = result.status === 'insufficient';
  const badgeCopy = t.report.status[result.status].badge;
  const chipTone = CHIP_TONE[result.status];

  return (
    <MyPageCard
      title={t.myPage.cycle.title}
      headerRight={
        !isInsufficient ? (
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${chipTone.bg} ${chipTone.text}`}
          >
            {badgeCopy}
          </span>
        ) : undefined
      }
    >
      {isInsufficient || result.averageCycleDays === null ? (
        <div className="flex min-h-[80px] items-center justify-center rounded-xl bg-brand-gray200 px-4 py-6">
          <p className="whitespace-pre-line text-center text-sm leading-[1.5] text-brand-gray700">
            {t.myPage.cycle.insufficient}
          </p>
        </div>
      ) : (
        <div className="flex min-h-[80px] items-center justify-center rounded-xl bg-brand-gray200 px-4 py-6">
          <p className="text-lg font-semibold text-brand-gray900">
            {t.myPage.cycle.averagePrefix}
            {result.averageCycleDays}
            {t.myPage.cycle.averageSuffix}
          </p>
        </div>
      )}
    </MyPageCard>
  );
}
