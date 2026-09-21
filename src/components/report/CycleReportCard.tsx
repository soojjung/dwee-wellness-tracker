'use client';
import { useState } from 'react';
import { useT } from '@/i18n/useT';
import type { PeriodLog } from '@/types';
import { classifyCycleStatus } from '@/domain/cycle/status';
import { monthlyCyclePoints } from '@/domain/cycle/chartPoints';
import { CycleChart } from './CycleChart';
import { StatusBadge } from './StatusBadge';
import { StatusTooltip } from './StatusTooltip';

interface CycleReportCardProps {
  periods: PeriodLog[];
  months: readonly { year: number; monthIndex: number }[];
}

export function CycleReportCard({ periods, months }: CycleReportCardProps) {
  const t = useT();
  const [showTip, setShowTip] = useState(false);
  const result = classifyCycleStatus(periods);
  const statusCopy = t.report.status[result.status];
  const monthly = monthlyCyclePoints(periods, months);
  // 기록이 3회 미만이면 "기록 부족", 기록은 있는데 이 창(최근 6개월)에 셀 수 있는 주기가
  // 하나도 없으면 그 사실을 말해 준다 — 빈 격자만 보여 주면 기록이 반영 안 된 것처럼 보인다.
  const chartState: 'tooFewRecords' | 'noCycles' | 'plot' =
    periods.length < 3
      ? 'tooFewRecords'
      : monthly.some((m) => m.cycleDays !== null)
        ? 'plot'
        : 'noCycles';
  const emptyCopy = chartState === 'noCycles' ? t.report.chartNoCycles : t.report.chartEmpty;

  return (
    <section className="relative flex w-full flex-col gap-[22px] rounded-2xl bg-brand-white p-4">
      <header className="flex items-center justify-between">
        <h2 className="text-lg font-semibold leading-normal text-brand-gray900">
          {t.report.chartTitle}
        </h2>
        <div className="relative">
          <StatusBadge
            status={result.status}
            label={statusCopy.badge}
            infoAriaLabel={t.report.tooltipAria}
            onInfoClick={() => setShowTip((v) => !v)}
          />
          {showTip ? (
            <StatusTooltip
              title={statusCopy.title}
              criteria={statusCopy.criteria}
              onDismiss={() => setShowTip(false)}
            />
          ) : null}
        </div>
      </header>
      {chartState === 'plot' ? (
        <CycleChart monthly={monthly} averageCycleDays={result.averageCycleDays} />
      ) : (
        <div className="flex flex-col items-center rounded-2xl bg-brand-gray200 px-12 py-5">
          <p className="text-center text-sm leading-normal text-brand-gray800">{emptyCopy.title}</p>
          <p className="text-center text-sm leading-normal text-brand-gray800">{emptyCopy.body}</p>
        </div>
      )}
    </section>
  );
}
