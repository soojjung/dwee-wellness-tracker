import { PHOTO_SLOTS, type PhotoSlot } from '@/domain/home/decor';

export const STORAGE_KEYS = {
  schemaVersion: 'dwee:schema_version',
  settings: 'dwee:settings',
  periods: 'dwee:periods',
  conditions: 'dwee:conditions',
  mediaPhotoCount: 'dwee:media:photo_count',
  mediaPhoto: (slot: PhotoSlot) => `dwee:media:photo:${slot}` as const,
  mediaPhotoTransform: (slot: PhotoSlot) =>
    `dwee:media:photo_transform:${slot}` as const,
  mediaTextPosition: 'dwee:media:text_position',
  mediaMainText: 'dwee:media:main_text',
  mediaSubText: 'dwee:media:sub_text',
  mediaTextOrder: 'dwee:media:text_order',
  bookmarks: 'dwee:bookmarks',
  eventCategories: 'dwee:event_categories',
  events: 'dwee:events',
  diaryStickers: 'dwee:diary:stickers',
  diaryStickerBlob: (id: string) => `dwee:diary:sticker_blob:${id}` as const,
  diaryStickerPlacements: 'dwee:diary:sticker_placements',
  bodyTypeReport: 'dwee:body_type_report',
  // Device-scoped flag: true once we've attempted to seed the built-in
  // sticker set into the user's library. Prevents re-seeding after the
  // user manually deletes any of the defaults.
  diaryDefaultStickersSeeded: 'dwee:diary:default_stickers_seeded',
} as const;

export const ALL_MEDIA_PHOTO_KEYS = PHOTO_SLOTS.map((s) => STORAGE_KEYS.mediaPhoto(s));

export const ALL_MEDIA_PHOTO_TRANSFORM_KEYS = PHOTO_SLOTS.map((s) =>
  STORAGE_KEYS.mediaPhotoTransform(s),
);

// Slot 0..3 layout that predates count-scoped storage (schema < 5). Only used
// by migration v5 to relocate old blobs into their per-count slots.
export const LEGACY_PHOTO_SLOTS = [0, 1, 2, 3] as const;
export type LegacyPhotoSlot = (typeof LEGACY_PHOTO_SLOTS)[number];
export const legacyMediaPhotoKey = (slot: LegacyPhotoSlot) =>
  `dwee:media:photo:${slot}` as const;

export const ALL_MEDIA_TEXT_KEYS = [
  STORAGE_KEYS.mediaTextPosition,
  STORAGE_KEYS.mediaMainText,
  STORAGE_KEYS.mediaSubText,
  STORAGE_KEYS.mediaTextOrder,
] as const;

// Keys removed from the active schema. Kept here so migrations can clean up
// orphaned data on user devices. Do not reference outside of migration logic.
export const DEPRECATED_KEYS = {
  mediaHomeOverlays: 'dwee:media:home_overlays',
  mediaHomeHero: 'dwee:media:home_hero',
  // 체형 리딩 결과를 Repository 로 옮기기 전, 브라우저 저장소에 직접 쓰던 키.
  // localStorage / sessionStorage 쪽이라 idb 키와 달리 del() 대상이 아니다 —
  // data/bodyTypeReportStorage.ts 가 한 번 끌어올린 뒤 지운다.
  bodyTypeReportBrowser: 'dwee:body-type-report',
} as const;

export const CURRENT_SCHEMA_VERSION = 10;
