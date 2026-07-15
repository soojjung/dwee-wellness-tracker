import type { PeriodLog } from '@/types';
import { addDaysISO, type ISODate } from '@/lib/date';

/**
 * 시트가 편집 중 유지하는 로컬 표현. `endDate` 는 항상 존재하고
 * `originalId` 가 null 이면 신규(아직 저장 전) 기록.
 */
export interface DraftPeriod {
  key: string;
  originalId: string | null;
  startDate: ISODate;
  endDate: ISODate;
}

export const EXTEND_GAP_DAYS = 7;

export function toDrafts(periods: PeriodLog[]): DraftPeriod[] {
  return sortDrafts(
    periods.map((p) => ({
      key: p.id,
      originalId: p.id,
      startDate: p.startDate,
      endDate: p.endDate ?? p.startDate,
    })),
  );
}

export function sortDrafts(drafts: DraftPeriod[]): DraftPeriod[] {
  return [...drafts].sort((a, b) => a.startDate.localeCompare(b.startDate));
}

export function findContainingDraft(
  drafts: DraftPeriod[],
  d: ISODate,
): DraftPeriod | null {
  return drafts.find((p) => d >= p.startDate && d <= p.endDate) ?? null;
}

/** d 이전에 끝난 기록 중 (d - gapDays) 이내에 종료된 가장 최근 것. */
export function findExtendableDraft(
  drafts: DraftPeriod[],
  d: ISODate,
  gapDays: number,
): DraftPeriod | null {
  const cutoff = addDaysISO(d, -gapDays);
  let best: DraftPeriod | null = null;
  for (const p of drafts) {
    if (p.endDate < d && p.endDate >= cutoff) {
      if (!best || p.endDate > best.endDate) best = p;
    }
  }
  return best;
}

/** 인접·중첩 구간을 병합. originalId 는 최소값을 우선 보존. */
export function compact(drafts: DraftPeriod[]): DraftPeriod[] {
  const sorted = sortDrafts(drafts);
  const out: DraftPeriod[] = [];
  for (const p of sorted) {
    const last = out[out.length - 1];
    if (last && p.startDate <= addDaysISO(last.endDate, 1)) {
      last.endDate = p.endDate > last.endDate ? p.endDate : last.endDate;
      if (!last.originalId && p.originalId) {
        last.originalId = p.originalId;
        last.key = p.key;
      }
      continue;
    }
    out.push({ ...p });
  }
  return out;
}

export function removeDay(
  drafts: DraftPeriod[],
  targetKey: string,
  d: ISODate,
  newKey: () => string,
): DraftPeriod[] {
  const out: DraftPeriod[] = [];
  for (const p of drafts) {
    if (p.key !== targetKey || d < p.startDate || d > p.endDate) {
      out.push(p);
      continue;
    }
    if (p.startDate === p.endDate) continue; // fully removed
    if (d === p.startDate) {
      out.push({ ...p, startDate: addDaysISO(d, 1) });
      continue;
    }
    if (d === p.endDate) {
      out.push({ ...p, endDate: addDaysISO(d, -1) });
      continue;
    }
    out.push({ ...p, endDate: addDaysISO(d, -1) });
    out.push({
      key: newKey(),
      originalId: null,
      startDate: addDaysISO(d, 1),
      endDate: p.endDate,
    });
  }
  return sortDrafts(out);
}

export function extendTo(
  drafts: DraftPeriod[],
  targetKey: string,
  d: ISODate,
): DraftPeriod[] {
  const next = drafts.map((p) =>
    p.key === targetKey && p.endDate < d ? { ...p, endDate: d } : p,
  );
  return compact(next);
}

export function addRange(
  drafts: DraftPeriod[],
  startDate: ISODate,
  endDate: ISODate,
  newKey: string,
): DraftPeriod[] {
  const [lo, hi] = startDate <= endDate ? [startDate, endDate] : [endDate, startDate];
  return compact([
    ...drafts,
    { key: newKey, originalId: null, startDate: lo, endDate: hi },
  ]);
}

export type PeriodChange =
  | { kind: 'add'; startDate: ISODate; endDate: ISODate }
  | { kind: 'update'; id: string; startDate: ISODate; endDate: ISODate }
  | { kind: 'remove'; id: string };

export function computeChanges(
  original: PeriodLog[],
  working: DraftPeriod[],
): PeriodChange[] {
  const originalById = new Map(original.map((p) => [p.id, p]));
  const seen = new Set<string>();
  const changes: PeriodChange[] = [];

  for (const d of working) {
    if (d.originalId) {
      seen.add(d.originalId);
      const orig = originalById.get(d.originalId);
      if (!orig) continue;
      const origEnd = orig.endDate ?? orig.startDate;
      if (orig.startDate !== d.startDate || origEnd !== d.endDate) {
        changes.push({
          kind: 'update',
          id: d.originalId,
          startDate: d.startDate,
          endDate: d.endDate,
        });
      }
    } else {
      changes.push({ kind: 'add', startDate: d.startDate, endDate: d.endDate });
    }
  }

  for (const p of original) {
    if (!seen.has(p.id)) changes.push({ kind: 'remove', id: p.id });
  }

  return changes;
}
