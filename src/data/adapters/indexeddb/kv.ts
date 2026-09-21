import { get, set } from 'idb-keyval';

export const newId = (): string => crypto.randomUUID();

/** List-shaped IndexedDB store: reads default to `[]` when the key is unset. */
export const listStore = <T>(key: string) => ({
  readAll: async (): Promise<T[]> => (await get<T[]>(key)) ?? [],
  writeAll: (list: T[]): Promise<void> => set(key, list),
});
