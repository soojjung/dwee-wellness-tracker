import { get, set } from 'idb-keyval';
import type { DiaryStickerPlacement } from '@/types';
import type {
  DiaryStickerPlacementRepository,
  NewDiaryStickerPlacementInput,
} from '../../repositories/DiaryStickerPlacementRepository';
import { STORAGE_KEYS } from './keys';

const newId = (): string => crypto.randomUUID();
const readAll = async (): Promise<DiaryStickerPlacement[]> =>
  (await get<DiaryStickerPlacement[]>(STORAGE_KEYS.diaryStickerPlacements)) ?? [];
const writeAll = (list: DiaryStickerPlacement[]) =>
  set(STORAGE_KEYS.diaryStickerPlacements, list);

export const indexedDBDiaryStickerPlacementAdapter: DiaryStickerPlacementRepository = {
  async listByMonth(year, monthIndex) {
    const all = await readAll();
    return all.filter((p) => p.year === year && p.monthIndex === monthIndex);
  },

  async add(input: NewDiaryStickerPlacementInput) {
    const now = new Date().toISOString();
    const record: DiaryStickerPlacement = {
      id: newId(),
      stickerId: input.stickerId,
      year: input.year,
      monthIndex: input.monthIndex,
      x: input.x,
      y: input.y,
      scale: input.scale,
      rotation: input.rotation,
      createdAt: now,
      updatedAt: now,
    };
    await writeAll([...(await readAll()), record]);
    return record;
  },

  async update(id, patch) {
    const all = await readAll();
    const idx = all.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    const next: DiaryStickerPlacement = {
      ...all[idx]!,
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    await writeAll([...all.slice(0, idx), next, ...all.slice(idx + 1)]);
    return next;
  },

  async remove(id) {
    await writeAll((await readAll()).filter((p) => p.id !== id));
  },
};
