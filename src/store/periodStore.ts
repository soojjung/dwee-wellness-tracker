'use client';
import { create } from 'zustand';
import { periodRepo, ensureMigrations } from '@/data';
import type { NewPeriodInput } from '@/data';
import type { PeriodLog } from '@/types';
import { averageCycleLength } from '@/domain/cycle/aggregate';
import { reconcileForNewStart } from '@/domain/cycle/recordPolicy';
import { isValidISODate } from '@/lib/date';

function sortByStart(list: PeriodLog[]): PeriodLog[] {
  return [...list].sort((a, b) => a.startDate.localeCompare(b.startDate));
}

interface PeriodState {
  periods: PeriodLog[];
  hydrated: boolean;
  loading: boolean;
  error: string | null;
  hydrate: () => Promise<void>;
  add: (input: NewPeriodInput) => Promise<PeriodLog | null>;
  /** 직전 기록을 삭제하고 새 입력을 추가한다 (typo 수정 시나리오). */
  replace: (oldId: string, input: NewPeriodInput) => Promise<PeriodLog | null>;
  /** 직전 기록의 endDate 를 `throughDate` 까지 연장 ("still bleeding" 시나리오). 기존 endDate 가 더 크면 유지. */
  extendThrough: (id: string, throughDate: string) => Promise<void>;
  update: (id: string, patch: Partial<Omit<PeriodLog, 'id' | 'createdAt'>>) => Promise<void>;
  remove: (id: string) => Promise<void>;
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
      set({ error: (e as Error).message, loading: false });
    }
  },

  async add(input) {
    if (!isValidISODate(input.startDate)) {
      set({ error: `Invalid startDate: ${input.startDate}` });
      return null;
    }
    if (input.endDate !== undefined && !isValidISODate(input.endDate)) {
      set({ error: `Invalid endDate: ${input.endDate}` });
      return null;
    }
    try {
      const { existingMatch, closeUpdates } = reconcileForNewStart(
        get().periods,
        input.startDate,
      );
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
      set({ error: (e as Error).message });
      return null;
    }
  },

  async replace(oldId, input) {
    await get().remove(oldId);
    return get().add(input);
  },

  async extendThrough(id, throughDate) {
    if (!isValidISODate(throughDate)) {
      set({ error: `Invalid throughDate: ${throughDate}` });
      return;
    }
    const target = get().periods.find((p) => p.id === id);
    if (!target) return;
    const nextEnd = target.endDate ? maxISO(target.endDate, throughDate) : throughDate;
    if (nextEnd === target.endDate) return;
    await get().update(id, { endDate: nextEnd });
  },

  async update(id, patch) {
    if (patch.startDate !== undefined && !isValidISODate(patch.startDate)) {
      set({ error: `Invalid startDate: ${patch.startDate}` });
      return;
    }
    if (patch.endDate !== undefined && !isValidISODate(patch.endDate)) {
      set({ error: `Invalid endDate: ${patch.endDate}` });
      return;
    }
    try {
      const next = await periodRepo.update(id, patch);
      if (!next) return;
      set({ periods: sortByStart(get().periods.map((p) => (p.id === id ? next : p))) });
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },

  async remove(id) {
    try {
      await periodRepo.remove(id);
      set({ periods: get().periods.filter((p) => p.id !== id) });
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },
}));

export const selectAverageCycleLength = (s: PeriodState): number | null =>
  averageCycleLength(s.periods);
