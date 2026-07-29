import { del, get, set } from 'idb-keyval';
import type { DiarySticker } from '@/types';
import type {
  DiaryStickerRepository,
  NewDiaryStickerInput,
} from '../../repositories/DiaryStickerRepository';
import { STORAGE_KEYS } from './keys';

const newId = (): string => crypto.randomUUID();

const readList = async (): Promise<DiarySticker[]> =>
  (await get<DiarySticker[]>(STORAGE_KEYS.diaryStickers)) ?? [];
const writeList = (list: DiarySticker[]) => set(STORAGE_KEYS.diaryStickers, list);

export const indexedDBDiaryStickerAdapter: DiaryStickerRepository = {
  list: () => readList(),

  async getBlob(sticker: DiarySticker) {
    return (await get<Blob>(sticker.storageRef)) ?? null;
  },

  async add(input: NewDiaryStickerInput) {
    const id = newId();
    const storageRef = STORAGE_KEYS.diaryStickerBlob(id);
    await set(storageRef, input.blob);
    const record: DiarySticker = {
      id,
      storageRef,
      ratio: input.ratio,
      source: input.source,
      createdAt: new Date().toISOString(),
    };
    await writeList([record, ...(await readList())]);
    return record;
  },

  async remove(id: string) {
    const list = await readList();
    const target = list.find((s) => s.id === id);
    if (!target) return;
    await del(target.storageRef);
    await writeList(list.filter((s) => s.id !== id));
  },
};
