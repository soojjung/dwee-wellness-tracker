import { del, get, set } from 'idb-keyval';
import {
  STORAGE_KEYS,
  DEPRECATED_KEYS,
  CURRENT_SCHEMA_VERSION,
  LEGACY_PHOTO_SLOTS,
  legacyMediaPhotoKey,
  type LegacyPhotoSlot,
} from './keys';
import { slotsForCount, type PhotoCount } from '@/domain/home/decor';

type Migration = () => Promise<void>;

const migrations: Record<number, Migration> = {
  1: async () => {
    /* 초기 schema, no-op */
  },
  2: async () => {
    // Drop legacy hero-overlay records left over from the removed sticker feature.
    await del(DEPRECATED_KEYS.mediaHomeOverlays);
  },
  3: async () => {
    // Move single home hero into the new slot-based layout (slot 0, count = 1).
    const legacy = await get<Blob>(DEPRECATED_KEYS.mediaHomeHero);
    if (legacy) {
      await set(STORAGE_KEYS.mediaPhoto(0), legacy);
      await set(STORAGE_KEYS.mediaPhotoCount, 1);
      await del(DEPRECATED_KEYS.mediaHomeHero);
    }
  },
  4: async () => {
    /* Adds text-position + main/sub text keys. No data to migrate. */
  },
  5: async () => {
    // Split the shared slot 0..3 storage into per-count slot ranges so that
    // switching photo counts preserves each set (count=1→[0], 2→[1,2], 4→[3..6]).
    // Existing blobs move to the range matching whatever count they were saved under.
    const legacyBlobs = new Map<LegacyPhotoSlot, Blob | undefined>();
    for (const s of LEGACY_PHOTO_SLOTS) {
      const blob = await get<Blob>(legacyMediaPhotoKey(s));
      if (blob) legacyBlobs.set(s, blob);
    }
    if (legacyBlobs.size === 0) return;

    const rawCount = await get<number>(STORAGE_KEYS.mediaPhotoCount);
    const count: PhotoCount = rawCount === 2 || rawCount === 4 ? rawCount : 1;
    const targetSlots = slotsForCount(count);

    for (const legacySlot of LEGACY_PHOTO_SLOTS) {
      await del(legacyMediaPhotoKey(legacySlot));
    }
    for (let i = 0; i < targetSlots.length; i++) {
      const legacyBlob = legacyBlobs.get(i as LegacyPhotoSlot);
      if (!legacyBlob) continue;
      await set(STORAGE_KEYS.mediaPhoto(targetSlots[i]!), legacyBlob);
    }
  },
};

export async function runMigrations(): Promise<void> {
  const current = (await get<number>(STORAGE_KEYS.schemaVersion)) ?? 0;
  for (let v = current + 1; v <= CURRENT_SCHEMA_VERSION; v++) {
    const m = migrations[v];
    if (m) await m();
  }
  await set(STORAGE_KEYS.schemaVersion, CURRENT_SCHEMA_VERSION);
}
