import { del } from 'idb-keyval';
import { indexedDBSettingsAdapter } from './adapters/indexeddb/IndexedDBSettingsAdapter';
import { indexedDBPeriodAdapter } from './adapters/indexeddb/IndexedDBPeriodAdapter';
import { indexedDBConditionAdapter } from './adapters/indexeddb/IndexedDBConditionAdapter';
import { indexedDBMediaAdapter } from './adapters/indexeddb/IndexedDBMediaAdapter';
import { indexedDBBookmarkAdapter } from './adapters/indexeddb/IndexedDBBookmarkAdapter';
import { supabaseSettingsAdapter } from './adapters/supabase/SupabaseSettingsAdapter';
import { supabasePeriodAdapter } from './adapters/supabase/SupabasePeriodAdapter';
import { supabaseConditionAdapter } from './adapters/supabase/SupabaseConditionAdapter';
import { supabaseMediaAdapter } from './adapters/supabase/SupabaseMediaAdapter';
import { runMigrations } from './adapters/indexeddb/migrations';
import {
  STORAGE_KEYS,
  ALL_MEDIA_PHOTO_KEYS,
  ALL_MEDIA_TEXT_KEYS,
  DEPRECATED_KEYS,
} from './adapters/indexeddb/keys';
import type { SettingsRepository } from './repositories/SettingsRepository';
import type { PeriodRepository } from './repositories/PeriodRepository';
import type { ConditionRepository } from './repositories/ConditionRepository';
import type { MediaRepository } from './repositories/MediaRepository';
import type { BookmarkRepository } from './repositories/BookmarkRepository';

export type { SettingsRepository, PeriodRepository, ConditionRepository, MediaRepository, BookmarkRepository };
export type { NewPeriodInput } from './repositories/PeriodRepository';
export type { NewConditionInput } from './repositories/ConditionRepository';

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

export const mediaRepo: MediaRepository = {
  getPhotoCount: () => pickMedia().getPhotoCount(),
  setPhotoCount: (count) => pickMedia().setPhotoCount(count),
  getHomePhoto: (slot) => pickMedia().getHomePhoto(slot),
  setHomePhoto: (slot, blob) => pickMedia().setHomePhoto(slot, blob),
  clearHomePhoto: (slot) => pickMedia().clearHomePhoto(slot),
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
    ...ALL_MEDIA_PHOTO_KEYS.map((k) => del(k)),
    ...ALL_MEDIA_TEXT_KEYS.map((k) => del(k)),
    del(DEPRECATED_KEYS.mediaHomeHero),
    del(DEPRECATED_KEYS.mediaHomeOverlays),
  ]);
}
