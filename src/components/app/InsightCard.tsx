'use client';
import type { ReactNode } from 'react';
import type { Insight, Confidence } from '@/types';
import { useT } from '@/i18n/useT';
import { cn } from '@/lib/cn';

interface InsightCardProps {
  insight: Insight;
}

export function InsightCard({ insight }: InsightCardProps) {
  const t = useT();
  return (
    <article className="rounded-2xl bg-brand-pink50 p-4">
      <header className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-brand-gray900">{titleFor(insight, t)}</h3>
        <ConfidenceBadge confidence={insight.confidence} label={t.insight.confidence[insight.confidence]} />
      </header>
      <p className="mt-1.5 text-sm leading-relaxed text-brand-gray600">{bodyFor(insight, t)}</p>
    </article>
  );
}

function titleFor(insight: Insight, t: ReturnType<typeof useT>): string {
  switch (insight.kind) {
    case 'data_needed':
      return t.insight.dataNeeded.title;
    case 'cycle_regularity':
      return t.insight.cycleRegularity.title;
    case 'cycle_phase':
      return t.insight.cyclePhase.title;
    case 'pain_pattern':
      return t.insight.painPattern.title;
    case 'mood_trend':
      return t.insight.moodTrend.title;
  }
}

function bodyFor(insight: Insight, t: ReturnType<typeof useT>): ReactNode {
  switch (insight.kind) {
    case 'data_needed':
      return t.insight.dataNeeded.body;
    case 'cycle_regularity':
      return (
        <>
          {t.insight.cycleRegularity.bodyPrefix}
          <strong className="font-semibold text-brand-gray900">{insight.averageDays}</strong>
          {t.insight.cycleRegularity.bodySuffix}
        </>
      );
    case 'cycle_phase':
      return t.insight.cyclePhase.body[insight.phase];
    case 'pain_pattern':
      return (
        <>
          {t.insight.painPattern.bodyPrefix}
          <strong className="font-semibold text-brand-gray900">{insight.count}</strong>
          {t.insight.painPattern.bodySuffix}
        </>
      );
    case 'mood_trend':
      return (
        <>
          {t.insight.moodTrend.bodyPrefix}
          <strong className="font-semibold text-brand-gray900">{insight.count}</strong>
          {t.insight.moodTrend.bodySuffix}
        </>
      );
  }
}

function ConfidenceBadge({ confidence, label }: { confidence: Confidence; label: string }) {
  return (
    <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium', tone(confidence))}>
      {label}
    </span>
  );
}

function tone(c: Confidence): string {
  switch (c) {
    case 'high':
      return 'bg-brand-pink100 text-brand-pink900';
    case 'medium':
      return 'bg-brand-gray300 text-brand-gray900';
    case 'low':
      return 'bg-brand-gray300 text-brand-gray600';
    case 'unknown':
      return 'bg-brand-gray300 text-brand-gray600';
  }
}
