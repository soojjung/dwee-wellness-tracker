import { get, set } from 'idb-keyval';
import type { BookmarkRepository } from '../../repositories/BookmarkRepository';
import { STORAGE_KEYS } from './keys';

async function read(): Promise<readonly string[]> {
  const stored = await get<readonly string[]>(STORAGE_KEYS.bookmarks);
  return stored ?? [];
}

export const indexedDBBookmarkAdapter: BookmarkRepository = {
  list() {
    return read();
  },
  async add(slug) {
    const current = await read();
    if (current.includes(slug)) return current;
    const next = [...current, slug];
    await set(STORAGE_KEYS.bookmarks, next);
    return next;
  },
  async remove(slug) {
    const current = await read();
    if (!current.includes(slug)) return current;
    const next = current.filter((s) => s !== slug);
    await set(STORAGE_KEYS.bookmarks, next);
    return next;
  },
};
