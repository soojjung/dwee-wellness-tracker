import { PHOTO_SLOTS, type PhotoSlot } from '@/domain/home/decor';

export const STORAGE_KEYS = {
  schemaVersion: 'dwee:schema_version',
  settings: 'dwee:settings',
  periods: 'dwee:periods',
  conditions: 'dwee:conditions',
  mediaPhotoCount: 'dwee:media:photo_count',
  mediaPhoto: (slot: PhotoSlot) => `dwee:media:photo:${slot}` as const,
  mediaTextPosition: 'dwee:media:text_position',
  mediaMainText: 'dwee:media:main_text',
  mediaSubText: 'dwee:media:sub_text',
  mediaTextOrder: 'dwee:media:text_order',
  bookmarks: 'dwee:bookmarks',
} as const;

export const ALL_MEDIA_PHOTO_KEYS = PHOTO_SLOTS.map((s) => STORAGE_KEYS.mediaPhoto(s));

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
} as const;

export const CURRENT_SCHEMA_VERSION = 5;
