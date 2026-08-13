import { del } from 'idb-keyval';
import { indexedDBSettingsAdapter } from './adapters/indexeddb/IndexedDBSettingsAdapter';
import { indexedDBPeriodAdapter } from './adapters/indexeddb/IndexedDBPeriodAdapter';
import { indexedDBConditionAdapter } from './adapters/indexeddb/IndexedDBConditionAdapter';
import { indexedDBMediaAdapter } from './adapters/indexeddb/IndexedDBMediaAdapter';
import { indexedDBBookmarkAdapter } from './adapters/indexeddb/IndexedDBBookmarkAdapter';
import { indexedDBEventCategoryAdapter } from './adapters/indexeddb/IndexedDBEventCategoryAdapter';
import { indexedDBEventAdapter } from './adapters/indexeddb/IndexedDBEventAdapter';
import { indexedDBDiaryStickerAdapter } from './adapters/indexeddb/IndexedDBDiaryStickerAdapter';
import { indexedDBDiaryStickerPlacementAdapter } from './adapters/indexeddb/IndexedDBDiaryStickerPlacementAdapter';
import { supabaseSettingsAdapter } from './adapters/supabase/SupabaseSettingsAdapter';
import { supabasePeriodAdapter } from './adapters/supabase/SupabasePeriodAdapter';
import { supabaseConditionAdapter } from './adapters/supabase/SupabaseConditionAdapter';
import { supabaseMediaAdapter } from './adapters/supabase/SupabaseMediaAdapter';
import { supabaseEventCategoryAdapter } from './adapters/supabase/SupabaseEventCategoryAdapter';
import { supabaseEventAdapter } from './adapters/supabase/SupabaseEventAdapter';
import { supabaseDiaryStickerAdapter } from './adapters/supabase/SupabaseDiaryStickerAdapter';
import { supabaseDiaryStickerPlacementAdapter } from './adapters/supabase/SupabaseDiaryStickerPlacementAdapter';
import { runMigrations } from './adapters/indexeddb/migrations';
import {
  STORAGE_KEYS,
  ALL_MEDIA_PHOTO_KEYS,
  ALL_MEDIA_PHOTO_TRANSFORM_KEYS,
  ALL_MEDIA_TEXT_KEYS,
  DEPRECATED_KEYS,
} from './adapters/indexeddb/keys';
import type { SettingsRepository } from './repositories/SettingsRepository';
import type { PeriodRepository } from './repositories/PeriodRepository';
import type { ConditionRepository } from './repositories/ConditionRepository';
import type { MediaRepository } from './repositories/MediaRepository';
import type { BookmarkRepository } from './repositories/BookmarkRepository';
import type { EventCategoryRepository } from './repositories/EventCategoryRepository';
import type { EventRepository } from './repositories/EventRepository';
import type { DiaryStickerRepository } from './repositories/DiaryStickerRepository';
import type { DiaryStickerPlacementRepository } from './repositories/DiaryStickerPlacementRepository';

export type {
  SettingsRepository,
  PeriodRepository,
  ConditionRepository,
  MediaRepository,
  BookmarkRepository,
  EventCategoryRepository,
  EventRepository,
  DiaryStickerRepository,
  DiaryStickerPlacementRepository,
};
export type { NewPeriodInput } from './repositories/PeriodRepository';
export type { NewConditionInput } from './repositories/ConditionRepository';
export type { NewEventCategoryInput } from './repositories/EventCategoryRepository';
export type { NewEventInput } from './repositories/EventRepository';
export type { NewDiaryStickerInput } from './repositories/DiaryStickerRepository';
export type { NewDiaryStickerPlacementInput } from './repositories/DiaryStickerPlacementRepository';

export type RepoMode = 'local' | 'remote';

let mode: RepoMode = 'local';

export function getRepoMode(): RepoMode {
  return mode;
}

export function setRepoMode(next: RepoMode): void {
  mode = next;
}

function pickSettings(): SettingsRepository {
  return mode === 'remote' ? supabaseSettingsAdapter : indexedDBSettingsAdapter;
}
function pickPeriod(): PeriodRepository {
  return mode === 'remote' ? supabasePeriodAdapter : indexedDBPeriodAdapter;
}
function pickCondition(): ConditionRepository {
  return mode === 'remote' ? supabaseConditionAdapter : indexedDBConditionAdapter;
}
function pickMedia(): MediaRepository {
  return mode === 'remote' ? supabaseMediaAdapter : indexedDBMediaAdapter;
}
function pickEventCategory(): EventCategoryRepository {
  return mode === 'remote'
    ? supabaseEventCategoryAdapter
    : indexedDBEventCategoryAdapter;
}
function pickEvent(): EventRepository {
  return mode === 'remote' ? supabaseEventAdapter : indexedDBEventAdapter;
}
function pickDiarySticker(): DiaryStickerRepository {
  return mode === 'remote' ? supabaseDiaryStickerAdapter : indexedDBDiaryStickerAdapter;
}
function pickDiaryStickerPlacement(): DiaryStickerPlacementRepository {
  return mode === 'remote'
    ? supabaseDiaryStickerPlacementAdapter
    : indexedDBDiaryStickerPlacementAdapter;
}

export const settingsRepo: SettingsRepository = {
  get: () => pickSettings().get(),
  update: (patch) => pickSettings().update(patch),
};

export const periodRepo: PeriodRepository = {
  list: () => pickPeriod().list(),
  add: (input) => pickPeriod().add(input),
  update: (id, patch) => pickPeriod().update(id, patch),
  remove: (id) => pickPeriod().remove(id),
};

export const conditionRepo: ConditionRepository = {
  getByDate: (date) => pickCondition().getByDate(date),
  upsert: (input) => pickCondition().upsert(input),
  range: (from, to) => pickCondition().range(from, to),
};

// Bookmarks are local-only for now (no remote sync). If Supabase sync arrives later,
// add a SupabaseBookmarkAdapter + mode-based picker like the other repos.
export const bookmarkRepo: BookmarkRepository = {
  list: () => indexedDBBookmarkAdapter.list(),
  add: (slug) => indexedDBBookmarkAdapter.add(slug),
  remove: (slug) => indexedDBBookmarkAdapter.remove(slug),
};

export const eventCategoryRepo: EventCategoryRepository = {
  list: () => pickEventCategory().list(),
  add: (input) => pickEventCategory().add(input),
  update: (id, patch) => pickEventCategory().update(id, patch),
  remove: (id) => pickEventCategory().remove(id),
};

export const eventRepo: EventRepository = {
  list: () => pickEvent().list(),
  add: (input) => pickEvent().add(input),
  update: (id, patch) => pickEvent().update(id, patch),
  remove: (id) => pickEvent().remove(id),
};

export const diaryStickerRepo: DiaryStickerRepository = {
  list: () => pickDiarySticker().list(),
  getBlob: (sticker) => pickDiarySticker().getBlob(sticker),
  add: (input) => pickDiarySticker().add(input),
  remove: (id) => pickDiarySticker().remove(id),
};

export const diaryStickerPlacementRepo: DiaryStickerPlacementRepository = {
  listByMonth: (year, monthIndex) =>
    pickDiaryStickerPlacement().listByMonth(year, monthIndex),
  add: (input) => pickDiaryStickerPlacement().add(input),
  update: (id, patch) => pickDiaryStickerPlacement().update(id, patch),
  remove: (id) => pickDiaryStickerPlacement().remove(id),
};

export const mediaRepo: MediaRepository = {
  getPhotoCount: () => pickMedia().getPhotoCount(),
  setPhotoCount: (count) => pickMedia().setPhotoCount(count),
  getHomePhoto: (slot) => pickMedia().getHomePhoto(slot),
  setHomePhoto: (slot, blob) => pickMedia().setHomePhoto(slot, blob),
  clearHomePhoto: (slot) => pickMedia().clearHomePhoto(slot),
  getPhotoTransform: (slot) => pickMedia().getPhotoTransform(slot),
  setPhotoTransform: (slot, transform) => pickMedia().setPhotoTransform(slot, transform),
  clearPhotoTransform: (slot) => pickMedia().clearPhotoTransform(slot),
  getTextPosition: () => pickMedia().getTextPosition(),
  setTextPosition: (position) => pickMedia().setTextPosition(position),
  getMainText: () => pickMedia().getMainText(),
  setMainText: (text) => pickMedia().setMainText(text),
  getSubText: () => pickMedia().getSubText(),
  setSubText: (text) => pickMedia().setSubText(text),
  getTextOrder: () => pickMedia().getTextOrder(),
  setTextOrder: (order) => pickMedia().setTextOrder(order),
};

let migrationsRan = false;
export async function ensureMigrations(): Promise<void> {
  if (migrationsRan) return;
  await runMigrations();
  migrationsRan = true;
}

export async function resetAllUserData(): Promise<void> {
  await Promise.all([
    del(STORAGE_KEYS.settings),
    del(STORAGE_KEYS.periods),
    del(STORAGE_KEYS.conditions),
    del(STORAGE_KEYS.mediaPhotoCount),
    del(STORAGE_KEYS.bookmarks),
    del(STORAGE_KEYS.eventCategories),
    del(STORAGE_KEYS.events),
    del(STORAGE_KEYS.diaryStickers),
    del(STORAGE_KEYS.diaryStickerPlacements),
    ...ALL_MEDIA_PHOTO_KEYS.map((k) => del(k)),
    ...ALL_MEDIA_PHOTO_TRANSFORM_KEYS.map((k) => del(k)),
    ...ALL_MEDIA_TEXT_KEYS.map((k) => del(k)),
    del(DEPRECATED_KEYS.mediaHomeHero),
    del(DEPRECATED_KEYS.mediaHomeOverlays),
  ]);
}
