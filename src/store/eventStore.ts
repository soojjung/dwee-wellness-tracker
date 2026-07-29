'use client';
import { create } from 'zustand';
import { eventCategoryRepo, eventRepo, ensureMigrations } from '@/data';
import type { NewEventInput, NewEventCategoryInput } from '@/data';
import type { EventCategory, EventLog } from '@/types';
import {
  BUILTIN_CATEGORY_SEEDS,
  type BuiltinCategoryKey,
} from '@/domain/event/builtins';
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
  linkPeriodMark: (eventId: string) => Promise<void>;
  unlinkPeriodMark: (eventId: string) => Promise<void>;
}

function sortCategories(list: EventCategory[]): EventCategory[] {
  return [...list].sort((a, b) => a.order - b.order || a.createdAt.localeCompare(b.createdAt));
}

function sortEvents(list: EventLog[]): EventLog[] {
  return [...list].sort((a, b) => a.startDate.localeCompare(b.startDate));
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
      const [categories, events] = await Promise.all([
        eventCategoryRepo.list(),
        eventRepo.list(),
      ]);
      set({
        categories: sortCategories(categories),
        events: sortEvents(events),
        hydrated: true,
        loading: false,
      });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  async rehydrate() {
    set({ hydrated: false });
    await get().hydrate();
  },

  async seedBuiltinsIfEmpty(namer) {
    if (get().categories.length > 0) return;
    try {
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
      set({ error: (e as Error).message });
    }
  },

  async addEvent(input) {
    try {
      const log = await eventRepo.add(input);
      set({ events: sortEvents([...get().events, log]) });
      return log;
    } catch (e) {
      set({ error: (e as Error).message });
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
      set({ error: (e as Error).message });
      return null;
    }
  },

  async removeEvent(id) {
    try {
      await eventRepo.remove(id);
      set({ events: get().events.filter((e) => e.id !== id) });
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },

  async addCategory(input) {
    try {
      const row = await eventCategoryRepo.add(input);
      set({ categories: sortCategories([...get().categories, row]) });
      return row;
    } catch (e) {
      set({ error: (e as Error).message });
      return null;
    }
  },

  async updateCategory(id, patch) {
    try {
      const next = await eventCategoryRepo.update(id, patch);
      if (!next) return null;
      set({
        categories: sortCategories(
          get().categories.map((c) => (c.id === id ? next : c)),
        ),
      });
      return next;
    } catch (e) {
      set({ error: (e as Error).message });
      return null;
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
      set({ error: (e as Error).message });
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
      set({ error: (e as Error).message });
    }
  },
}));

export const selectCategoryById = (id: string) => (s: EventState): EventCategory | undefined =>
  s.categories.find((c) => c.id === id);
