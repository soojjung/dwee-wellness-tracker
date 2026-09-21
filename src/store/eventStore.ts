'use client';
import { create } from 'zustand';
import { errorMessage } from '@/lib/errorMessage';
import { eventCategoryRepo, eventRepo, ensureMigrations } from '@/data';
import type { NewEventInput, NewEventCategoryInput } from '@/data';
import type { EventCategory, EventLog } from '@/types';
import {
  BUILTIN_CATEGORY_SEEDS,
  defaultCategoryId,
  type BuiltinCategoryKey,
} from '@/domain/event/builtins';
import { planBuiltinDedupe } from '@/domain/event/builtinDedupe';
import { usePeriodStore } from './periodStore';

export type BuiltinNamer = (key: BuiltinCategoryKey) => string;

interface EventState {
  categories: EventCategory[];
  events: EventLog[];
  hydrated: boolean;
  loading: boolean;
  error: string | null;
  hydrate: () => Promise<void>;
  rehydrate: () => Promise<void>;
  seedBuiltinsIfEmpty: (namer: BuiltinNamer) => Promise<void>;
  addEvent: (input: NewEventInput) => Promise<EventLog | null>;
  updateEvent: (
    id: string,
    patch: Partial<Omit<EventLog, 'id' | 'createdAt'>>,
  ) => Promise<EventLog | null>;
  removeEvent: (id: string) => Promise<void>;
  addCategory: (input: NewEventCategoryInput) => Promise<EventCategory | null>;
  updateCategory: (
    id: string,
    patch: Partial<Omit<EventCategory, 'id' | 'createdAt'>>,
  ) => Promise<EventCategory | null>;
  /**
   * 일정 유형 삭제 (012_10 ⑤). 그 유형을 쓰던 일정은 지우지 않고 남은 유형 중 기본값으로
   * 옮긴다. 마지막 하나 남은 유형은 지우지 않는다 — 0개가 되면 기본 유형 시드가 다시 돌아
   * 방금 지운 것까지 되살아난다. 지웠으면 true.
   */
  removeCategory: (id: string) => Promise<boolean>;
  linkPeriodMark: (eventId: string) => Promise<void>;
  unlinkPeriodMark: (eventId: string) => Promise<void>;
}

function sortCategories(list: EventCategory[]): EventCategory[] {
  return [...list].sort((a, b) => a.order - b.order || a.createdAt.localeCompare(b.createdAt));
}

function sortEvents(list: EventLog[]): EventLog[] {
  return [...list].sort((a, b) => a.startDate.localeCompare(b.startDate));
}

// 진행 중인 기본 유형 시드. `categories.length === 0` 검사만으로는 중복을 못 막는다 — 시드는
// 원격 저장 4번이 끝난 뒤에야 메모리에 반영되는데, 그 사이(언어가 확정되며 화면의 effect 가
// 다시 돌거나, 로그인 직후 재하이드레이션) 두 번째 호출도 0개로 보고 한 벌을 더 넣었다.
// 진행 중인 promise 를 공유해 두 번째 호출이 첫 번째를 기다리게 한다.
let seedInFlight: Promise<void> | null = null;

/**
 * 이미 두 벌로 저장된 계정을 정리한다. 화면(메모리)은 계획대로 항상 고쳐서 돌려주고,
 * 저장소 반영은 최선을 다하되 실패해도 막지 않는다 — 다음 하이드레이션이 다시 시도한다.
 * 일정이 유형을 참조하고 있어(`on delete restrict`) 일정을 먼저 옮긴 뒤 유형을 지운다.
 */
async function repairDuplicateBuiltins(
  categories: EventCategory[],
  events: EventLog[],
): Promise<{ categories: EventCategory[]; events: EventLog[] }> {
  const replacements = planBuiltinDedupe(categories);
  if (replacements.size === 0) return { categories, events };

  const movedEvents = events.map((e) => {
    const keeperId = replacements.get(e.categoryId);
    return keeperId ? { ...e, categoryId: keeperId } : e;
  });

  try {
    for (const e of events) {
      const keeperId = replacements.get(e.categoryId);
      if (keeperId) await eventRepo.update(e.id, { categoryId: keeperId });
    }
    for (const removedId of replacements.keys()) {
      await eventCategoryRepo.remove(removedId);
    }
  } catch (e) {
    console.error('[eventStore] duplicate builtin category cleanup failed', e);
  }

  return {
    categories: categories.filter((c) => !replacements.has(c.id)),
    events: movedEvents,
  };
}

export const useEventStore = create<EventState>()((set, get) => ({
  categories: [],
  events: [],
  hydrated: false,
  loading: false,
  error: null,

  async hydrate() {
    set({ loading: true, error: null });
    try {
      await ensureMigrations();
      const [listedCategories, listedEvents] = await Promise.all([
        eventCategoryRepo.list(),
        eventRepo.list(),
      ]);
      const { categories, events } = await repairDuplicateBuiltins(listedCategories, listedEvents);
      set({
        categories: sortCategories(categories),
        events: sortEvents(events),
        hydrated: true,
        loading: false,
      });
    } catch (e) {
      set({ error: errorMessage(e), loading: false });
    }
  },

  async rehydrate() {
    set({ hydrated: false });
    await get().hydrate();
  },

  async seedBuiltinsIfEmpty(namer) {
    if (get().categories.length > 0) return;
    if (seedInFlight) return seedInFlight;

    const run = (async () => {
      try {
        // 메모리가 비어 있어도 저장소에는 이미 있을 수 있다 (다른 탭·다른 기기가 방금 시드).
        const existing = await eventCategoryRepo.list();
        if (existing.length > 0) {
          set({ categories: sortCategories(existing) });
          return;
        }
        const created: EventCategory[] = [];
        for (const seed of BUILTIN_CATEGORY_SEEDS) {
          const row = await eventCategoryRepo.add({
            name: namer(seed.key),
            colorId: seed.colorId,
            isBuiltIn: true,
            order: seed.order,
          });
          created.push(row);
        }
        set({ categories: sortCategories([...get().categories, ...created]) });
      } catch (e) {
        set({ error: errorMessage(e) });
      }
    })();
    // 끝나면(성공이든 실패든) 비워야 실패한 시드를 다음 호출이 다시 시도할 수 있다.
    seedInFlight = run.finally(() => {
      seedInFlight = null;
    });
    return seedInFlight;
  },

  async addEvent(input) {
    try {
      const log = await eventRepo.add(input);
      set({ events: sortEvents([...get().events, log]) });
      return log;
    } catch (e) {
      set({ error: errorMessage(e) });
      return null;
    }
  },

  async updateEvent(id, patch) {
    try {
      const next = await eventRepo.update(id, patch);
      if (!next) return null;
      set({
        events: sortEvents(get().events.map((e) => (e.id === id ? next : e))),
      });
      return next;
    } catch (e) {
      set({ error: errorMessage(e) });
      return null;
    }
  },

  async removeEvent(id) {
    try {
      await eventRepo.remove(id);
      set({ events: get().events.filter((e) => e.id !== id) });
    } catch (e) {
      set({ error: errorMessage(e) });
    }
  },

  async addCategory(input) {
    try {
      const row = await eventCategoryRepo.add(input);
      set({ categories: sortCategories([...get().categories, row]) });
      return row;
    } catch (e) {
      set({ error: errorMessage(e) });
      return null;
    }
  },

  async updateCategory(id, patch) {
    try {
      const next = await eventCategoryRepo.update(id, patch);
      if (!next) return null;
      set({
        categories: sortCategories(get().categories.map((c) => (c.id === id ? next : c))),
      });
      return next;
    } catch (e) {
      set({ error: errorMessage(e) });
      return null;
    }
  },

  async removeCategory(id) {
    const { categories, events } = get();
    const remaining = categories.filter((c) => c.id !== id);
    if (remaining.length === categories.length || remaining.length === 0) return false;
    const fallbackId = defaultCategoryId(remaining);
    if (!fallbackId) return false;
    try {
      // DB 의 일정 → 유형 참조가 `on delete restrict` 라 일정을 먼저 옮겨야 지워진다.
      const moved = events.filter((e) => e.categoryId === id);
      for (const e of moved) {
        await eventRepo.update(e.id, { categoryId: fallbackId });
      }
      await eventCategoryRepo.remove(id);
      set({
        categories: remaining,
        events: get().events.map((e) =>
          e.categoryId === id ? { ...e, categoryId: fallbackId } : e,
        ),
      });
      return true;
    } catch (e) {
      set({ error: errorMessage(e) });
      return false;
    }
  },

  async linkPeriodMark(eventId) {
    const event = get().events.find((e) => e.id === eventId);
    if (!event) return;
    if (event.hasPeriodMark && event.linkedPeriodId) return;
    try {
      const periodStore = usePeriodStore.getState();
      const period = await periodStore.add({
        startDate: event.startDate,
        endDate: event.endDate,
      });
      if (!period) return;
      await get().updateEvent(eventId, {
        hasPeriodMark: true,
        linkedPeriodId: period.id,
      });
    } catch (e) {
      set({ error: errorMessage(e) });
    }
  },

  async unlinkPeriodMark(eventId) {
    const event = get().events.find((e) => e.id === eventId);
    if (!event) return;
    try {
      if (event.linkedPeriodId) {
        const periodStore = usePeriodStore.getState();
        await periodStore.remove(event.linkedPeriodId);
      }
      await get().updateEvent(eventId, {
        hasPeriodMark: false,
        linkedPeriodId: undefined,
      });
    } catch (e) {
      set({ error: errorMessage(e) });
    }
  },
}));
