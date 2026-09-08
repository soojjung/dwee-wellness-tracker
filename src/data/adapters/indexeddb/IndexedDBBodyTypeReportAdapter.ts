import { del, get, set } from 'idb-keyval';
import type { BodyTypeReport } from '@/types';
import type { BodyTypeReportRepository } from '../../repositories/BodyTypeReportRepository';
import { STORAGE_KEYS } from './keys';

export const indexedDBBodyTypeReportAdapter: BodyTypeReportRepository = {
  async get() {
    const stored = await get<BodyTypeReport>(STORAGE_KEYS.bodyTypeReport);
    return stored ?? null;
  },
  async save(report) {
    await set(STORAGE_KEYS.bodyTypeReport, report);
  },
  async clear() {
    await del(STORAGE_KEYS.bodyTypeReport);
  },
};
