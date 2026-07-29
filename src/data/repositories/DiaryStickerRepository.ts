import type { DiarySticker, StickerRatio, StickerSource } from '@/types';

export interface NewDiaryStickerInput {
  blob: Blob;
  ratio: StickerRatio;
  source: StickerSource;
}

export interface DiaryStickerRepository {
  list(): Promise<DiarySticker[]>;
  /** Returns the blob for a sticker (client fetches from Supabase storage or reads from IndexedDB). */
  getBlob(sticker: DiarySticker): Promise<Blob | null>;
  add(input: NewDiaryStickerInput): Promise<DiarySticker>;
  remove(id: string): Promise<void>;
}
