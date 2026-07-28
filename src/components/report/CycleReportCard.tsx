'use client';
import { useState } from 'react';
import { useT } from '@/i18n/useT';
import type { PeriodLog } from '@/types';
import { classifyCycleStatus } from '@/domain/cycle/status';
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
  const canPlot = periods.length >= 3;

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
      {canPlot ? (
        <CycleChart
          periods={periods}
          months={months}
          averageCycleDays={result.averageCycleDays}
        />
      ) : (
        <div className="flex flex-col items-center rounded-2xl bg-brand-gray200 px-12 py-5">
          <p className="text-center text-sm leading-normal text-brand-gray800">
            {t.report.chartEmpty.title}
          </p>
          <p className="text-center text-sm leading-normal text-brand-gray800">
            {t.report.chartEmpty.body}
          </p>
        </div>
      )}
    </section>
  );
}
