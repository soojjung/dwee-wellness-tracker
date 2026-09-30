'use client';
import { Fragment, useMemo, type ReactNode } from 'react';
import { useT } from '@/i18n/useT';
import { useSettingsStore } from '@/store/settingsStore';
import type { PeriodLog } from '@/types';
import { daysBetween, formatCompactDate } from '@/lib/date';
import { isCountableCycleGap } from '@/domain/cycle/cycleGap';

interface RecentCyclesCardProps {
  periods: PeriodLog[];
  maxRows?: number;
  /** 줄을 누르면 그 기록의 생리 기간 편집 시트를 연다 (R5-7). */
  onSelectPeriod?: (id: string) => void;
}

interface Row {
  id: string;
  startDate: string;
  endDate?: string;
  lengthDays: number | null;
  cycleDays: number | null;
  /** 주기 값은 있지만 셀 수 있는 범위 밖이라 차트·평균·상태 판정에서 빠지는 행. */
  cycleExcluded: boolean;
}

export function RecentCyclesCard({ periods, maxRows = 6, onSelectPeriod }: RecentCyclesCardProps) {
  const t = useT();
  const locale = useSettingsStore((s) => s.settings.locale);

  const rows = useMemo<Row[]>(() => {
    const sorted = [...periods].sort((a, b) => b.startDate.localeCompare(a.startDate));
    return sorted.slice(0, maxRows).map((cur, i) => {
      const next = sorted[i + 1];
      const cycleDays = next ? daysBetween(next.startDate, cur.startDate) : null;
      return {
        id: cur.id,
        startDate: cur.startDate,
        endDate: cur.endDate,
        lengthDays: cur.endDate ? daysBetween(cur.startDate, cur.endDate) + 1 : null,
        cycleDays,
        cycleExcluded: cycleDays !== null && !isCountableCycleGap(cycleDays),
      };
    });
  }, [periods, maxRows]);

  if (rows.length === 0) return null;

  const c = t.report.row;
  const days = (n: number | null) => (n !== null ? `${n}${c.daysSuffix}` : c.notAvailable);

  return (
    <section className="flex flex-col gap-3 rounded-2xl bg-brand-white p-4">
      <h2 className="text-lg font-semibold leading-normal text-brand-gray900">
        {t.report.recentTitle}
      </h2>
      {/* Figma 955:2619 — 헤더 한 줄 + 기록마다 회색 둥근 줄. 줄 양끝 여백은 시안 값 15 로 고정하고,
          칸 사이(시안 39)는 남는 폭을 똑같이 나눠 갖는다 — 390pt ko 에서 ≈36, 320pt en 처럼 폭이
          모자라면 최소 10 까지 줄어든다.
          모든 줄이 같은 열 폭을 써야 해서 table 로 그린다 (subgrid 는 iOS 15 미지원). */}
      <table className="-my-2 w-full border-separate border-spacing-y-2 text-center">
        <thead>
          <CycleRow
            as="th"
            className="text-sm font-normal leading-normal text-brand-gray600"
            cells={[c.start, c.end, c.length, c.cycle]}
          />
        </thead>
        <tbody>
          {rows.map((r) => (
            <CycleRow
              key={r.id}
              className="h-11 text-base font-medium tabular-nums text-brand-gray900"
              cellBg="bg-brand-gray200"
              onActivate={onSelectPeriod ? () => onSelectPeriod(r.id) : undefined}
              ariaLabel={t.report.diary.periodEditSheet.editRowAria}
              cells={[
                formatCompactDate(r.startDate, locale),
                r.endDate ? (
                  formatCompactDate(r.endDate, locale)
                ) : (
                  <span className="text-brand-gray600">{c.ongoing}</span>
                ),
                days(r.lengthDays),
                // 목록은 기록 그대로 보여 주되, 차트·평균에서 빠지는 값은 흐리게 두고 아래 각주로 설명한다.
                <span key="cycle" className={r.cycleExcluded ? 'text-brand-gray500' : undefined}>
                  {days(r.cycleDays)}
                </span>,
              ]}
            />
          ))}
        </tbody>
      </table>
      {rows.some((r) => r.cycleExcluded) ? (
        <p className="text-xs leading-normal text-brand-gray600">{t.report.recentExcludedNote}</p>
      ) : null}
    </section>
  );
}

// 내용 칸과 양끝 칸(15px 블록)은 `w-px` 로 내용 폭에 딱 맞추고, 폭 지정이 없는 칸 사이
// 스페이서가 표의 남는 폭을 똑같이 나눠 갖는다 (안쪽 10px 블록이 최소치).

function CycleRow({
  cells,
  className,
  cellBg = '',
  as: Cell = 'td',
  onActivate,
  ariaLabel,
}: {
  cells: readonly ReactNode[];
  className: string;
  /** 둥근 줄 배경. tr 에 칠하면 끝 칸의 rounded 가 먹지 않아서 칸마다 칠한다. */
  cellBg?: string;
  as?: 'td' | 'th';
  onActivate?: () => void;
  ariaLabel?: string;
}) {
  const edge = `w-px p-0 ${cellBg}`;
  return (
    <tr
      className={onActivate ? `${className} cursor-pointer active:opacity-70` : className}
      onClick={onActivate}
      tabIndex={onActivate ? 0 : undefined}
      aria-label={onActivate ? ariaLabel : undefined}
      onKeyDown={
        onActivate
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onActivate();
              }
            }
          : undefined
      }
    >
      <td aria-hidden className={`${edge} rounded-l-lg`}>
        <div className="w-[15px]" />
      </td>
      {cells.map((cell, i) => (
        <Fragment key={i}>
          {i > 0 ? (
            <td aria-hidden className={`p-0 ${cellBg}`}>
              <div className="w-2.5" />
            </td>
          ) : null}
          <Cell
            scope={Cell === 'th' ? 'col' : undefined}
            className={`w-px whitespace-nowrap p-0 [font-weight:inherit] ${cellBg}`}
          >
            {cell}
          </Cell>
        </Fragment>
      ))}
      <td aria-hidden className={`${edge} rounded-r-lg`}>
        <div className="w-[15px]" />
      </td>
    </tr>
  );
}
