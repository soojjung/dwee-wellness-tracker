'use client';
import { create } from 'zustand';
import { errorMessage } from '@/lib/errorMessage';
import { periodRepo, ensureMigrations } from '@/data';
import type { NewPeriodInput } from '@/data';
import type { PeriodLog } from '@/types';
import { reconcileForNewStart } from '@/domain/cycle/recordPolicy';
import { isValidISODate } from '@/lib/date';
import { captureException } from '@/lib/monitoring/sentry';

// Mutation failures go back to the caller (the sheet keeps the user's input and
// shows a toast) instead of into `error`, which is the load failure HomeScreen
// turns into a full-page error — that would also unmount the open sheet (R7-11).
function reportMutationFailure(op: 'add' | 'update' | 'remove', e: unknown): void {
  captureException(e, { tags: { period_op: op } });
}

function sortByStart(list: PeriodLog[]): PeriodLog[] {
  return [...list].sort((a, b) => a.startDate.localeCompare(b.startDate));
}

interface PeriodState {
  periods: PeriodLog[];
  hydrated: boolean;
  loading: boolean;
  error: string | null;
  hydrate: () => Promise<void>;
  rehydrate: () => Promise<void>;
  /** null when the input is invalid or the write failed. */
  add: (input: NewPeriodInput) => Promise<PeriodLog | null>;
  /** 직전 기록을 삭제하고 새 입력을 추가한다 (typo 수정 시나리오). */
  replace: (oldId: string, input: NewPeriodInput) => Promise<PeriodLog | null>;
  /** 직전 기록의 endDate 를 `throughDate` 까지 연장 ("still bleeding" 시나리오). 기존 endDate 가 더 크면 유지. */
  extendThrough: (id: string, throughDate: string) => Promise<boolean>;
  /** false when the patch is invalid or the write failed. */
  update: (id: string, patch: Partial<Omit<PeriodLog, 'id' | 'createdAt'>>) => Promise<boolean>;
  /** false when the write failed. */
  remove: (id: string) => Promise<boolean>;
}

function maxISO(a: string, b: string): string {
  return a > b ? a : b;
}

export const usePeriodStore = create<PeriodState>()((set, get) => ({
  periods: [],
  hydrated: false,
  loading: false,
  error: null,

  async hydrate() {
    set({ loading: true, error: null });
    try {
      await ensureMigrations();
      const periods = await periodRepo.list();
      set({ periods: sortByStart(periods), hydrated: true, loading: false });
    } catch (e) {
      set({ error: errorMessage(e), loading: false });
    }
  },

  async rehydrate() {
    set({ hydrated: false });
    await get().hydrate();
  },

  async add(input) {
    if (!isValidISODate(input.startDate)) return null;
    if (input.endDate !== undefined && !isValidISODate(input.endDate)) return null;
    try {
      const { existingMatch, closeUpdates } = reconcileForNewStart(get().periods, input.startDate);
      if (existingMatch) return existingMatch;
      for (const u of closeUpdates) {
        await periodRepo.update(u.id, { endDate: u.endDate });
      }
      const log = await periodRepo.add(input);
      const closedMap = new Map(closeUpdates.map((u) => [u.id, u.endDate]));
      const refreshed = get().periods.map((p) => {
        const endDate = closedMap.get(p.id);
        return endDate ? { ...p, endDate } : p;
      });
      set({ periods: sortByStart([...refreshed, log]) });
      return log;
    } catch (e) {
      reportMutationFailure('add', e);
      return null;
    }
  },

  async replace(oldId, input) {
    if (!(await get().remove(oldId))) return null;
    return get().add(input);
  },

  async extendThrough(id, throughDate) {
    if (!isValidISODate(throughDate)) return false;
    const target = get().periods.find((p) => p.id === id);
    if (!target) return false;
    const nextEnd = target.endDate ? maxISO(target.endDate, throughDate) : throughDate;
    if (nextEnd === target.endDate) return true;
    return get().update(id, { endDate: nextEnd });
  },

  async update(id, patch) {
    if (patch.startDate !== undefined && !isValidISODate(patch.startDate)) return false;
    if (patch.endDate !== undefined && !isValidISODate(patch.endDate)) return false;
    try {
      const next = await periodRepo.update(id, patch);
      if (!next) return false;
      set({ periods: sortByStart(get().periods.map((p) => (p.id === id ? next : p))) });
      return true;
    } catch (e) {
      reportMutationFailure('update', e);
      return false;
    }
  },

  async remove(id) {
    try {
      await periodRepo.remove(id);
      set({ periods: get().periods.filter((p) => p.id !== id) });
      return true;
    } catch (e) {
      reportMutationFailure('remove', e);
      return false;
    }
  },
}));
