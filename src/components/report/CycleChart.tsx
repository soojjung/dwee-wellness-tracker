'use client';
import { useMemo } from 'react';
import { useT } from '@/i18n/useT';
import type { PeriodLog } from '@/types';
import { fromISO, daysBetween } from '@/lib/date';

interface CycleChartProps {
  periods: PeriodLog[];
  months: readonly { year: number; monthIndex: number }[];
  averageCycleDays: number | null;
}

interface Point {
  monthIndex: number;
  monthLabel: string;
  cycle: number | null;
  isCurrent: boolean;
}

const CHART_HEIGHT = 209;
const PLOT_LEFT = 25;
const PLOT_RIGHT = 4;
const PLOT_TOP = 22;
const PLOT_BOTTOM_DATA = 154; // last real tick row (min value)
const PLOT_BOTTOM_ZERO = 176; // "0" baseline label row
const AXIS_LABEL_LEFT = 9.5;

export function CycleChart({ periods, months, averageCycleDays }: CycleChartProps) {
  const t = useT();

  const points: Point[] = useMemo(() => {
    const sorted = [...periods].sort((a, b) => a.startDate.localeCompare(b.startDate));
    const nowYear = new Date().getFullYear();
    const nowMonth = new Date().getMonth();
    return months.map(({ year, monthIndex }) => {
      const inMonth = sorted.find((p) => {
        const d = fromISO(p.startDate);
        return d.getFullYear() === year && d.getMonth() === monthIndex;
      });
      let cycle: number | null = null;
      if (inMonth) {
        const idx = sorted.indexOf(inMonth);
        if (idx > 0) {
          const gap = daysBetween(sorted[idx - 1]!.startDate, inMonth.startDate);
          if (gap >= 15 && gap <= 60) cycle = gap;
        }
      }
      return {
        monthIndex,
        monthLabel: t.report.monthShort[(monthIndex + 1) as 1],
        cycle,
        isCurrent: year === nowYear && monthIndex === nowMonth,
      };
    });
  }, [periods, months, t]);

  const withData = points.filter((p): p is Point & { cycle: number } => p.cycle !== null);
  const dataMin = withData.length ? Math.min(...withData.map((p) => p.cycle)) : 25;
  const dataMax = withData.length ? Math.max(...withData.map((p) => p.cycle)) : 31;
  const { yMin, yMax, tickStepValue } = niceScale(dataMin, dataMax);
  const yTicks: number[] = [];
  for (let v = yMax; v >= yMin; v -= tickStepValue) yTicks.push(v);

  const width = 328;
  const span = Math.max(yMax - yMin, 1);
  const unitStep = (PLOT_BOTTOM_DATA - PLOT_TOP) / span;
  const yFor = (v: number): number => PLOT_TOP + (yMax - v) * unitStep;

  const gridXStart = PLOT_LEFT;
  const gridXEnd = width - PLOT_RIGHT;
  const colStep = (gridXEnd - gridXStart) / (points.length - 1);
  const colX = (i: number): number => gridXStart + i * colStep;

  const coords = points.map((p, i) => ({
    x: colX(i),
    y: p.cycle !== null ? yFor(p.cycle) : null,
  }));

  const linePath = buildSmoothPath(coords);
  const areaPath = buildAreaPath(coords, PLOT_BOTTOM_DATA);

  const avgY = averageCycleDays !== null && averageCycleDays >= yMin && averageCycleDays <= yMax
    ? yFor(averageCycleDays)
    : null;

  const avgPillX = pickAvgPillX(coords, gridXStart, gridXEnd);

  return (
    <div className="relative h-[209px] w-full">
      <span
        className="absolute -translate-x-1/2 text-[12px] leading-[1.5] text-brand-gray500"
        style={{ left: `${AXIS_LABEL_LEFT}px`, top: '0px' }}
      >
        {t.report.chartYAxisLabel}
      </span>
      {yTicks.map((v) => (
        <span
          key={v}
          className="absolute -translate-x-1/2 -translate-y-1/2 text-[12px] leading-[1.5] text-brand-gray600"
          style={{ left: `${AXIS_LABEL_LEFT}px`, top: `${yFor(v)}px` }}
        >
          {v}
        </span>
      ))}
      <span
        className="absolute -translate-x-1/2 -translate-y-1/2 text-[12px] leading-[1.5] text-brand-gray600"
        style={{ left: `${AXIS_LABEL_LEFT}px`, top: `${PLOT_BOTTOM_ZERO}px` }}
      >
        0
      </span>

      <svg
        viewBox={`0 0 ${width} ${CHART_HEIGHT}`}
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {yTicks.map((v, i) => (
          <line
            key={v}
            x1={gridXStart}
            x2={gridXEnd}
            y1={yFor(v)}
            y2={yFor(v)}
            stroke={i === 0 ? '#E7E5E6' : '#F0EEEF'}
            strokeWidth={i === 0 ? 1 : 0.5}
          />
        ))}
        <line
          x1={gridXStart}
          x2={gridXEnd}
          y1={PLOT_BOTTOM_ZERO}
          y2={PLOT_BOTTOM_ZERO}
          stroke="#D5D3D4"
          strokeWidth={1}
        />

        {areaPath ? <path d={areaPath} fill="#FDE2EF" opacity={0.55} /> : null}
        {avgY !== null ? (
          <line
            x1={gridXStart}
            x2={gridXEnd}
            y1={avgY}
            y2={avgY}
            stroke="#F158A0"
            strokeWidth={1.2}
          />
        ) : null}
        {linePath ? (
          <path
            d={linePath}
            stroke="#F689BC"
            strokeWidth={1.5}
            strokeDasharray="4 3"
            fill="none"
            strokeLinecap="round"
          />
        ) : null}
        {coords.map((c, i) =>
          c.y !== null ? (
            <circle
              key={i}
              cx={c.x}
              cy={c.y}
              r={3}
              fill={points[i]!.isCurrent ? '#F158A0' : '#FFFDFE'}
              stroke="#F158A0"
              strokeWidth={1.3}
            />
          ) : null,
        )}
      </svg>

      {points.map((p, i) => (
        <span
          key={i}
          className={`absolute -translate-x-1/2 text-[12px] leading-[1.5] ${
            p.isCurrent ? 'font-medium text-brand-gray900' : 'text-brand-gray600'
          }`}
          style={{ left: `${colX(i)}px`, top: `${PLOT_BOTTOM_ZERO + 15}px` }}
        >
          {p.monthLabel}
        </span>
      ))}

      {averageCycleDays !== null && avgY !== null ? (
        <div
          className="pointer-events-none absolute -translate-x-1/2"
          style={{ left: `${avgPillX}px`, top: `${Math.max(avgY - 30, 4)}px` }}
        >
          <div className="relative rounded-full bg-brand-pink300 px-2 py-1.5 text-[12px] font-medium leading-none text-brand-white shadow-[0_2px_6px_0_rgba(241,88,160,0.24)]">
            {t.report.chartAveragePrefix}
            {averageCycleDays}
            {t.report.chartAverageSuffix}
            <span
              aria-hidden
              className="absolute left-1/2 top-full h-2 w-2 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-brand-pink300"
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function buildSmoothPath(coords: { x: number; y: number | null }[]): string {
  const segs: string[] = [];
  let prev: { x: number; y: number } | null = null;
  for (const c of coords) {
    if (c.y === null) { prev = null; continue; }
    if (!prev) segs.push(`M ${c.x.toFixed(2)} ${c.y.toFixed(2)}`);
    else {
      const mid = (prev.x + c.x) / 2;
      segs.push(
        `C ${mid.toFixed(2)} ${prev.y.toFixed(2)}, ${mid.toFixed(2)} ${c.y.toFixed(2)}, ${c.x.toFixed(2)} ${c.y.toFixed(2)}`,
      );
    }
    prev = { x: c.x, y: c.y };
  }
  return segs.join(' ');
}

function buildAreaPath(coords: { x: number; y: number | null }[], baselineY: number): string {
  const withY = coords
    .map((c) => (c.y !== null ? { x: c.x, y: c.y } : null))
    .filter((c): c is { x: number; y: number } => c !== null);
  if (withY.length < 2) return '';
  const smooth = buildSmoothPath(withY);
  const first = withY[0]!;
  const last = withY[withY.length - 1]!;
  return `${smooth} L ${last.x.toFixed(2)} ${baselineY} L ${first.x.toFixed(2)} ${baselineY} Z`;
}

function pickAvgPillX(coords: { x: number; y: number | null }[], min: number, max: number): number {
  const withY = coords.filter((c) => c.y !== null);
  if (withY.length === 0) return (min + max) / 2;
  const mid = withY[Math.floor(withY.length / 2)]!;
  return mid.x;
}

/**
 * 데이터 min/max 를 7개 이하의 tick 으로 담을 수 있는 nice step (1|2|5) 을 고르고,
 * yMin/yMax 를 그 step 배수로 반올림한다. 시각적으로 촘촘함을 방지.
 */
function niceScale(
  dataMin: number,
  dataMax: number,
): { yMin: number; yMax: number; tickStepValue: number } {
  const MAX_TICKS = 7;
  const HARD_MIN = 15;
  const HARD_MAX = 60;
  const rawMin = Math.max(Math.floor(dataMin), HARD_MIN);
  const rawMax = Math.min(Math.ceil(dataMax === dataMin ? dataMax + 1 : dataMax), HARD_MAX);
  const candidates = [1, 2, 5, 10];
  for (const step of candidates) {
    const yMin = Math.floor(rawMin / step) * step;
    const yMax = Math.ceil(rawMax / step) * step;
    const ticks = (yMax - yMin) / step + 1;
    if (ticks <= MAX_TICKS) return { yMin: Math.max(yMin, 0), yMax, tickStepValue: step };
  }
  const step = 10;
  const yMin = Math.floor(rawMin / step) * step;
  const yMax = Math.ceil(rawMax / step) * step;
  return { yMin: Math.max(yMin, 0), yMax, tickStepValue: step };
}
