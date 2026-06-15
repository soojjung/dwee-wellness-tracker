import type { PeriodLog } from '@/types';
import { addDaysISO, daysBetween } from '@/lib/date';

/**
 * 두 시작일 사이가 이 값 미만이면 의도가 모호하다고 보고 사용자에게 확인을 받는다.
 * `aggregate.ts` 의 이상치 필터(`gap >= 15 && gap <= 60`)와 같은 값으로 두 정책을 동기화한다.
 */
export const SHORT_CYCLE_THRESHOLD_DAYS = 15;

export interface CloseUpdate {
  id: string;
  endDate: string;
}

export interface NewStartReconciliation {
  /** 같은 startDate가 이미 있으면 그 record (idempotent), 없으면 null */
  existingMatch: PeriodLog | null;
  /** 새 record를 추가하기 전에 close 처리해야 하는 미완 record들 */
  closeUpdates: CloseUpdate[];
}

export type NewStartEvaluation =
  | { kind: 'idempotent'; match: PeriodLog }
  | { kind: 'shortGap'; priorPeriod: PeriodLog; daysSincePrior: number }
  | { kind: 'ok' };

/**
 * 새 startDate 를 추가하기 전에 사용자의 의도를 확인할지 결정한다.
 *
 * - `idempotent`: 같은 startDate 가 이미 존재. 호출처는 추가 없이 무시.
 * - `shortGap`: 가장 가까운 직전 startDate 와의 간격이 임계치(`SHORT_CYCLE_THRESHOLD_DAYS`) 미만.
 *   호출처는 사용자에게 의도(연장/대체/그대로 저장)를 물어야 한다.
 * - `ok`: 일반 흐름으로 진행. `reconcileForNewStart` 로 후속 처리.
 */
export function evaluateNewStart(
  existing: PeriodLog[],
  newStart: string,
): NewStartEvaluation {
  const match = existing.find((p) => p.startDate === newStart);
  if (match) return { kind: 'idempotent', match };

  let priorPeriod: PeriodLog | null = null;
  for (const p of existing) {
    if (p.startDate >= newStart) continue;
    if (!priorPeriod || p.startDate > priorPeriod.startDate) priorPeriod = p;
  }
  if (!priorPeriod) return { kind: 'ok' };

  const gap = daysBetween(priorPeriod.startDate, newStart);
  if (gap < SHORT_CYCLE_THRESHOLD_DAYS) {
    return { kind: 'shortGap', priorPeriod, daysSincePrior: gap };
  }
  return { kind: 'ok' };
}

/**
 * 새 startDate로 record를 추가할 때 기존 record들에 적용할 변경 계산.
 *
 * - 같은 startDate가 이미 존재하면 idempotent: 기존 record 반환, 추가/변경 없음
 * - 새 startDate보다 이전이면서 endDate가 비어 있는(미완) record들은 close
 *   (endDate = 새 startDate - 1일). 미완을 무한 누적시키지 않기 위함.
 * - 새 startDate가 미완 record의 startDate보다 과거이면 close 대상에서 제외
 *   (시간 역행 케이스 — 사용자가 며칠 전 데이터를 늦게 추가)
 */
/**
 * 사용자가 생리 시작일만 입력했을 때 적용할 기본 종료일.
 *
 * `settings.averagePeriodLength` (기본 5일) 만큼의 기간을 가정해 끝 날짜를 산정.
 * 시작일 day 1 ~ 종료일 day N 포함이므로 `endDate = startDate + (periodLength - 1) 일`.
 *
 * 사용자가 명시적으로 endDate 를 다시 비우거나 다른 값으로 바꾸면 호출처에서 별도 처리.
 */
export function defaultPeriodEndDate(startDate: string, periodLength: number): string {
  return addDaysISO(startDate, periodLength - 1);
}

export function reconcileForNewStart(
  existing: PeriodLog[],
  newStart: string,
): NewStartReconciliation {
  const existingMatch = existing.find((p) => p.startDate === newStart) ?? null;
  if (existingMatch) {
    return { existingMatch, closeUpdates: [] };
  }
  const prevEnd = addDaysISO(newStart, -1);
  const closeUpdates: CloseUpdate[] = [];
  for (const p of existing) {
    if (p.endDate) continue;
    if (p.startDate >= newStart) continue;
    closeUpdates.push({ id: p.id, endDate: prevEnd });
  }
  return { existingMatch: null, closeUpdates };
}
