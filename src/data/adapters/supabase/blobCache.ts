import { clear, createStore, del, get, set, type UseStore } from 'idb-keyval';

/**
 * On-device cache for images downloaded from Supabase Storage (home photos,
 * diary stickers), keyed by storage path. Every upload goes to a fresh path,
 * so a path's content never changes and a hit never needs revalidating —
 * without this, signed-in users re-downloaded every image on each launch.
 *
 * Lives in its own IndexedDB database so it needs no migration of the main
 * store. Every call swallows IndexedDB errors: the cache is an optimization,
 * and a failure just means a network download.
 */
let store: UseStore | null = null;

function cacheStore(): UseStore | null {
  if (typeof indexedDB === 'undefined') return null;
  store ??= createStore('dwee-remote-blobs', 'blobs');
  return store;
}

export async function writeCachedBlob(path: string, blob: Blob): Promise<void> {
  const s = cacheStore();
  if (!s) return;
  try {
    await set(path, blob, s);
  } catch {
    // Quota or private-mode failure — the next read falls back to the network.
  }
}

export async function forgetCachedBlob(path: string): Promise<void> {
  const s = cacheStore();
  if (!s) return;
  try {
    await del(path, s);
  } catch {
    // Nothing to clean up.
  }
}

/** Wiped on sign-out / account deletion so the next user of the device can't see them. */
export async function clearRemoteBlobCache(): Promise<void> {
  const s = cacheStore();
  if (!s) return;
  try {
    await clear(s);
  } catch {
    // Nothing to clean up.
  }
}

/** Cached blob for `path`, else `download()` and remember a non-null result. */
export async function downloadWithCache(
  path: string,
  download: () => Promise<Blob | null>,
): Promise<Blob | null> {
  const s = cacheStore();
  if (s) {
    try {
      const hit = await get<Blob>(path, s);
      if (hit) return hit;
    } catch {
      // Fall through to the network.
    }
  }
  const blob = await download();
  if (blob) await writeCachedBlob(path, blob);
  return blob;
}
