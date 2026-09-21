import type { EventLog } from '@/types';
import type { EventRepository, NewEventInput } from '../../repositories/EventRepository';
import { STORAGE_KEYS } from './keys';
import { listStore, newId } from './kv';

const { readAll, writeAll } = listStore<EventLog>(STORAGE_KEYS.events);

export const indexedDBEventAdapter: EventRepository = {
  list: () => readAll(),

  async add(input: NewEventInput) {
    const now = new Date().toISOString();
    const record: EventLog = {
      id: newId(),
      startDate: input.startDate,
      endDate: input.endDate,
      title: input.title,
      memo: input.memo,
      categoryId: input.categoryId,
      hasPeriodMark: input.hasPeriodMark ?? false,
      ...(input.linkedPeriodId ? { linkedPeriodId: input.linkedPeriodId } : {}),
      createdAt: now,
      updatedAt: now,
    };
    await writeAll([...(await readAll()), record]);
    return record;
  },

  async update(id, patch) {
    const all = await readAll();
    const idx = all.findIndex((e) => e.id === id);
    if (idx === -1) return null;
    const next: EventLog = {
      ...all[idx]!,
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    await writeAll([...all.slice(0, idx), next, ...all.slice(idx + 1)]);
    return next;
  },

  async remove(id) {
    await writeAll((await readAll()).filter((e) => e.id !== id));
  },
};
