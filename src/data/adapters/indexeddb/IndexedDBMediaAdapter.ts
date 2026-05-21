import { get, set, del } from 'idb-keyval';
import type { MediaRepository, HomeOverlay } from '../../repositories/MediaRepository';
import { STORAGE_KEYS } from './keys';

const newId = (): string => crypto.randomUUID();

async function readOverlays(): Promise<HomeOverlay[]> {
  return (await get<HomeOverlay[]>(STORAGE_KEYS.mediaHomeOverlays)) ?? [];
}
async function writeOverlays(items: HomeOverlay[]): Promise<void> {
  await set(STORAGE_KEYS.mediaHomeOverlays, items);
}

export const indexedDBMediaAdapter: MediaRepository = {
  async getHomeHero() {
    return (await get<Blob>(STORAGE_KEYS.mediaHomeHero)) ?? null;
  },
  async setHomeHero(blob: Blob) {
    await set(STORAGE_KEYS.mediaHomeHero, blob);
  },
  async clearHomeHero() {
    await del(STORAGE_KEYS.mediaHomeHero);
  },

  async listOverlays() {
    return readOverlays();
  },
  async addOverlay(blob: Blob) {
    const item: HomeOverlay = { id: newId(), blob, x: 0.5, y: 0.5 };
    const list = await readOverlays();
    await writeOverlays([...list, item]);
    return item;
  },
  async updateOverlayPosition(id, x, y) {
    const list = await readOverlays();
    const next = list.map((o) => (o.id === id ? { ...o, x, y } : o));
    await writeOverlays(next);
  },
  async removeOverlay(id) {
    const list = await readOverlays();
    await writeOverlays(list.filter((o) => o.id !== id));
  },
};
