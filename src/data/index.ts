import { del } from 'idb-keyval';
import { indexedDBSettingsAdapter } from './adapters/indexeddb/IndexedDBSettingsAdapter';
import { indexedDBPeriodAdapter } from './adapters/indexeddb/IndexedDBPeriodAdapter';
import { indexedDBConditionAdapter } from './adapters/indexeddb/IndexedDBConditionAdapter';
import { indexedDBMediaAdapter } from './adapters/indexeddb/IndexedDBMediaAdapter';
import { runMigrations } from './adapters/indexeddb/migrations';
import { STORAGE_KEYS } from './adapters/indexeddb/keys';
import type { SettingsRepository } from './repositories/SettingsRepository';
import type { PeriodRepository } from './repositories/PeriodRepository';
import type { ConditionRepository } from './repositories/ConditionRepository';
import type { MediaRepository } from './repositories/MediaRepository';

export type { SettingsRepository, PeriodRepository, ConditionRepository, MediaRepository };
export type { NewPeriodInput } from './repositories/PeriodRepository';
export type { NewConditionInput } from './repositories/ConditionRepository';

export const settingsRepo: SettingsRepository = indexedDBSettingsAdapter;
export const periodRepo: PeriodRepository = indexedDBPeriodAdapter;
export const conditionRepo: ConditionRepository = indexedDBConditionAdapter;
export const mediaRepo: MediaRepository = indexedDBMediaAdapter;

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
    del(STORAGE_KEYS.mediaHomeHero),
    del(STORAGE_KEYS.mediaHomeOverlays),
  ]);
}
