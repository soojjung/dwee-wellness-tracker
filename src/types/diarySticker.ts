export type StickerRatio = '1:1' | '4:3';
export type StickerSource = 'photo' | 'sticker';

export interface DiarySticker {
  id: string;
  /** IndexedDB blob key OR Supabase Storage path — adapter-specific. */
  storageRef: string;
  ratio: StickerRatio;
  source: StickerSource;
  createdAt: string;
}
