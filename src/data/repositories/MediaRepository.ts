import type {
  PhotoCount,
  PhotoSlot,
  PhotoTransform,
  TextOrder,
  TextPosition,
} from '@/domain/home/decor';

/** Everything the home hero needs, loaded in one call (indexed by PhotoSlot). */
export interface HomeDecorSnapshot {
  photoCount: PhotoCount | null;
  photos: (Blob | null)[];
  transforms: (PhotoTransform | null)[];
  textPosition: TextPosition | null;
  mainText: string;
  subText: string;
  textOrder: TextOrder | null;
}

export interface MediaRepository {
  /** Batched read for hydrate — one round trip per table instead of one per field/slot. */
  getHomeDecor(): Promise<HomeDecorSnapshot>;

  getPhotoCount(): Promise<PhotoCount | null>;
  setPhotoCount(count: PhotoCount): Promise<void>;
  getHomePhoto(slot: PhotoSlot): Promise<Blob | null>;
  setHomePhoto(slot: PhotoSlot, blob: Blob): Promise<void>;
  clearHomePhoto(slot: PhotoSlot): Promise<void>;

  getPhotoTransform(slot: PhotoSlot): Promise<PhotoTransform | null>;
  setPhotoTransform(slot: PhotoSlot, transform: PhotoTransform): Promise<void>;
  clearPhotoTransform(slot: PhotoSlot): Promise<void>;

  getTextPosition(): Promise<TextPosition | null>;
  setTextPosition(position: TextPosition): Promise<void>;
  getMainText(): Promise<string>;
  setMainText(text: string): Promise<void>;
  getSubText(): Promise<string>;
  setSubText(text: string): Promise<void>;
  getTextOrder(): Promise<TextOrder | null>;
  setTextOrder(order: TextOrder): Promise<void>;
}
