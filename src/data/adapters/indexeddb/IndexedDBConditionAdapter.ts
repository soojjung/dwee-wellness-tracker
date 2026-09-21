import { get, set } from 'idb-keyval';
import type { DailyConditionLog } from '@/types';
import type {
  ConditionRepository,
  NewConditionInput,
} from '../../repositories/ConditionRepository';
import { STORAGE_KEYS } from './keys';
import { newId } from './kv';

type ConditionMap = Record<string, DailyConditionLog>;

const readAll = async (): Promise<ConditionMap> =>
  (await get<ConditionMap>(STORAGE_KEYS.conditions)) ?? {};
const writeAll = (m: ConditionMap) => set(STORAGE_KEYS.conditions, m);

export const indexedDBConditionAdapter: ConditionRepository = {
  async getByDate(date) {
    return (await readAll())[date] ?? null;
  },

  async upsert(input: NewConditionInput) {
    const all = await readAll();
    const existing = all[input.date];
    const log: DailyConditionLog = {
      id: existing?.id ?? newId(),
      createdAt: existing?.createdAt ?? new Date().toISOString(),
      ...input,
    };
    await writeAll({ ...all, [input.date]: log });
    return log;
  },

  async range(fromDate, toDate) {
    return Object.values(await readAll())
      .filter((l) => l.date >= fromDate && l.date <= toDate)
      .sort((a, b) => a.date.localeCompare(b.date));
  },
};
