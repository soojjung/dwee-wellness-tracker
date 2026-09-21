import type { PeriodLog } from '@/types';
import type { PeriodRepository, NewPeriodInput } from '../../repositories/PeriodRepository';
import { STORAGE_KEYS } from './keys';
import { listStore, newId } from './kv';

const { readAll, writeAll } = listStore<PeriodLog>(STORAGE_KEYS.periods);

export const indexedDBPeriodAdapter: PeriodRepository = {
  list: () => readAll(),

  async add(input: NewPeriodInput) {
    const log: PeriodLog = {
      id: newId(),
      startDate: input.startDate,
      endDate: input.endDate,
      createdAt: new Date().toISOString(),
    };
    await writeAll([...(await readAll()), log]);
    return log;
  },

  async update(id, patch) {
    const all = await readAll();
    const idx = all.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    const next: PeriodLog = { ...all[idx]!, ...patch };
    await writeAll([...all.slice(0, idx), next, ...all.slice(idx + 1)]);
    return next;
  },

  async remove(id) {
    await writeAll((await readAll()).filter((p) => p.id !== id));
  },
};
