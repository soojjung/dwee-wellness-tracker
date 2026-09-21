import type { EventCategory } from '@/types';
import type {
  EventCategoryRepository,
  NewEventCategoryInput,
} from '../../repositories/EventCategoryRepository';
import { STORAGE_KEYS } from './keys';
import { listStore, newId } from './kv';

const { readAll, writeAll } = listStore<EventCategory>(STORAGE_KEYS.eventCategories);

export const indexedDBEventCategoryAdapter: EventCategoryRepository = {
  list: () => readAll(),

  async add(input: NewEventCategoryInput) {
    const now = new Date().toISOString();
    const record: EventCategory = {
      id: newId(),
      name: input.name,
      colorId: input.colorId,
      isBuiltIn: input.isBuiltIn ?? false,
      order: input.order ?? 0,
      createdAt: now,
    };
    await writeAll([...(await readAll()), record]);
    return record;
  },

  async update(id, patch) {
    const all = await readAll();
    const idx = all.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    const next: EventCategory = { ...all[idx]!, ...patch };
    await writeAll([...all.slice(0, idx), next, ...all.slice(idx + 1)]);
    return next;
  },

  async remove(id) {
    await writeAll((await readAll()).filter((c) => c.id !== id));
  },
};
