import { del, get, keys, set } from 'idb-keyval';
import { DEFAULT_STICKERS, defaultStickerUrl } from '@/domain/diary/defaultStickers';
import { indexedDBSettingsAdapter } from './adapters/indexeddb/IndexedDBSettingsAdapter';
import { indexedDBPeriodAdapter } from './adapters/indexeddb/IndexedDBPeriodAdapter';
import { indexedDBConditionAdapter } from './adapters/indexeddb/IndexedDBConditionAdapter';
import { indexedDBMediaAdapter } from './adapters/indexeddb/IndexedDBMediaAdapter';
import { indexedDBBookmarkAdapter } from './adapters/indexeddb/IndexedDBBookmarkAdapter';
import { indexedDBEventCategoryAdapter } from './adapters/indexeddb/IndexedDBEventCategoryAdapter';
import { indexedDBEventAdapter } from './adapters/indexeddb/IndexedDBEventAdapter';
import { indexedDBDiaryStickerAdapter } from './adapters/indexeddb/IndexedDBDiaryStickerAdapter';
import { indexedDBDiaryStickerPlacementAdapter } from './adapters/indexeddb/IndexedDBDiaryStickerPlacementAdapter';
import { indexedDBBodyTypeReportAdapter } from './adapters/indexeddb/IndexedDBBodyTypeReportAdapter';
import { supabaseSettingsAdapter } from './adapters/supabase/SupabaseSettingsAdapter';
import { supabasePeriodAdapter } from './adapters/supabase/SupabasePeriodAdapter';
import { supabaseConditionAdapter } from './adapters/supabase/SupabaseConditionAdapter';
import { supabaseMediaAdapter } from './adapters/supabase/SupabaseMediaAdapter';
import { supabaseEventCategoryAdapter } from './adapters/supabase/SupabaseEventCategoryAdapter';
import { supabaseEventAdapter } from './adapters/supabase/SupabaseEventAdapter';
import { supabaseDiaryStickerAdapter } from './adapters/supabase/SupabaseDiaryStickerAdapter';
import { supabaseDiaryStickerPlacementAdapter } from './adapters/supabase/SupabaseDiaryStickerPlacementAdapter';
import { supabaseBodyTypeReportAdapter } from './adapters/supabase/SupabaseBodyTypeReportAdapter';
import { requireUserId } from './adapters/supabase/client';
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
import type { BodyTypeReportRepository } from './repositories/BodyTypeReportRepository';

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
  BodyTypeReportRepository,
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
function pickBodyTypeReport(): BodyTypeReportRepository {
  return mode === 'remote' ? supabaseBodyTypeReportAdapter : indexedDBBodyTypeReportAdapter;
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

export const bodyTypeReportRepo: BodyTypeReportRepository = {
  get: () => pickBodyTypeReport().get(),
  save: (report) => pickBodyTypeReport().save(report),
  clear: () => pickBodyTypeReport().clear(),
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

// Bump whenever the built-in artwork changes. The flag records the version
// that was seeded, so a device sitting on an older set re-seeds — but only
// while its library is empty, which is what keeps a deliberate deletion
// deleted and stops the refreshed art from duplicating anyone's stickers.
const DEFAULT_STICKER_SET_VERSION = 2;

// Scopes already seeded in this page session, so repeated hydrates don't
// re-check IndexedDB. Cleared on reset.
const seededScopes = new Set<string>();

// Seeds that are still running, keyed by scope. `seededScopes` alone can't
// stop a double-seed: it is only set after the inserts finish, so two hydrates
// racing each other both get past the check and each insert the full set.
// Sharing the in-flight promise makes the second caller wait for the first.
const seedsInFlight = new Map<string, Promise<void>>();

/**
 * The seeded flag lives in local IndexedDB, but the library it guards lives
 * wherever the active repo mode points. Scoping the flag per backend is what
 * lets a device that already seeded its anonymous library still seed the
 * account it later signs in to.
 */
async function currentSeedScope(): Promise<string> {
  if (getRepoMode() !== 'remote') return 'local';
  return `remote:${await requireUserId()}`;
}

function seedFlagKey(scope: string): string {
  return `${STORAGE_KEYS.diaryDefaultStickersSeeded}:${scope}`;
}

/**
 * Seeds the built-in sticker set (Figma frame 2563:1601) into the user's
 * library on first use. Runs at most once per backend — a subsequent call
 * (after the user deletes any of the defaults) is a no-op so we don't
 * resurrect stickers the user intentionally removed. If the library already
 * contains stickers when we first look, we mark seeded without inserting so
 * cross-device sync (Supabase) doesn't duplicate.
 */
export async function ensureDefaultStickersSeeded(): Promise<void> {
  if (typeof window === 'undefined') return;
  let scope: string;
  try {
    scope = await currentSeedScope();
  } catch {
    // Remote mode without a live session — the hydrate that follows sign-in
    // gets another chance rather than the seed being marked done.
    return;
  }
  if (seededScopes.has(scope)) return;

  const running = seedsInFlight.get(scope);
  if (running) return running;

  // Registered before the first await inside `runSeed` so a concurrent caller
  // joins this run instead of starting its own. Dropped on settle either way —
  // a failed run has to stay retryable.
  const run = runSeed(scope).finally(() => seedsInFlight.delete(scope));
  seedsInFlight.set(scope, run);
  return run;
}

async function runSeed(scope: string): Promise<void> {
  // Pre-scoping builds wrote a single unscoped flag. It is deliberately not
  // honoured: it was set even when every insert had failed, which is the
  // state that leaves a library permanently empty. Dropping it costs at most
  // one re-seed for someone who had emptied their library on purpose.
  await del(STORAGE_KEYS.diaryDefaultStickersSeeded);

  const key = seedFlagKey(scope);
  // Older builds stored `true` here; anything that isn't the current version
  // counts as out of date.
  if ((await get<number | boolean>(key)) === DEFAULT_STICKER_SET_VERSION) {
    seededScopes.add(scope);
    return;
  }

  const existing = await diaryStickerRepo.list();
  if (existing.length > 0) {
    // Library already has content — inserting would duplicate it. Record the
    // version so cross-device sync (Supabase) settles without re-checking.
    seededScopes.add(scope);
    await set(key, DEFAULT_STICKER_SET_VERSION);
    return;
  }

  let inserted = 0;
  // 어댑터의 add 는 새 스티커를 목록 맨 앞에 넣는다(newest first). 그래서 시드도
  // 순서대로 넣으면 화면에는 거꾸로 보인다. 뒤에서부터 넣어야 DEFAULT_STICKERS
  // 에 적힌 순서 그대로 보인다.
  for (const seed of [...DEFAULT_STICKERS].reverse()) {
    try {
      const res = await fetch(defaultStickerUrl(seed.filename));
      if (!res.ok) continue;
      const blob = await res.blob();
      await diaryStickerRepo.add({ blob, ratio: seed.ratio, source: 'sticker' });
      inserted += 1;
    } catch {
      // Skip a single failed asset — don't block the rest of the seed.
    }
  }
  // A run where every insert failed (offline, storage rejection) has to stay
  // retryable — flagging it would strand the user with an empty library.
  if (inserted === 0) return;
  seededScopes.add(scope);
  await set(key, DEFAULT_STICKER_SET_VERSION);
}

/** Drops every per-scope seed flag, including the pre-scoping unscoped one. */
async function clearSeedFlags(): Promise<void> {
  const prefix = STORAGE_KEYS.diaryDefaultStickersSeeded;
  const all = await keys();
  await Promise.all(
    all
      .filter((k): k is string => typeof k === 'string' && k.startsWith(prefix))
      .map((k) => del(k)),
  );
  seededScopes.clear();
  seedsInFlight.clear();
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
    del(STORAGE_KEYS.bodyTypeReport),
    // Clear the seed flags so a fresh account on the same device gets the
    // built-in stickers again on next hydrate.
    clearSeedFlags(),
    ...ALL_MEDIA_PHOTO_KEYS.map((k) => del(k)),
    ...ALL_MEDIA_PHOTO_TRANSFORM_KEYS.map((k) => del(k)),
    ...ALL_MEDIA_TEXT_KEYS.map((k) => del(k)),
    del(DEPRECATED_KEYS.mediaHomeHero),
    del(DEPRECATED_KEYS.mediaHomeOverlays),
  ]);
}
