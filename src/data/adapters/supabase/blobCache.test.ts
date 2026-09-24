import { beforeEach, describe, expect, it, vi } from 'vitest';

// In-memory stand-in for the idb-keyval store so the cache logic runs under Node.
const mem = new Map<string, unknown>();
const failures = { get: false };
vi.mock('idb-keyval', () => ({
  createStore: vi.fn(() => 'store'),
  get: vi.fn(async (k: string) => {
    if (failures.get) throw new Error('idb broken');
    return mem.get(k);
  }),
  set: vi.fn(async (k: string, v: unknown) => void mem.set(k, v)),
  del: vi.fn(async (k: string) => void mem.delete(k)),
  clear: vi.fn(async () => mem.clear()),
}));

import {
  clearRemoteBlobCache,
  downloadWithCache,
  forgetCachedBlob,
  writeCachedBlob,
} from './blobCache';

const blob = (text: string) => new Blob([text], { type: 'image/jpeg' });

beforeEach(() => {
  mem.clear();
  failures.get = false;
  vi.stubGlobal('indexedDB', {});
});

describe('downloadWithCache', () => {
  it('downloads on a miss and remembers the result', async () => {
    const b = blob('a');
    const download = vi.fn(async () => b);

    expect(await downloadWithCache('u/p/1.jpg', download)).toBe(b);
    expect(download).toHaveBeenCalledTimes(1);
    expect(mem.get('u/p/1.jpg')).toBe(b);
  });

  it('serves a hit without touching the network', async () => {
    const b = blob('a');
    mem.set('u/p/1.jpg', b);
    const download = vi.fn(async () => blob('other'));

    expect(await downloadWithCache('u/p/1.jpg', download)).toBe(b);
    expect(download).not.toHaveBeenCalled();
  });

  it('does not cache a failed (null) download', async () => {
    expect(await downloadWithCache('u/p/missing.jpg', async () => null)).toBeNull();
    expect(mem.has('u/p/missing.jpg')).toBe(false);
  });

  it('falls back to the network when the cache read throws', async () => {
    failures.get = true;
    const b = blob('a');
    expect(await downloadWithCache('u/p/1.jpg', async () => b)).toBe(b);
  });

  it('skips caching entirely where IndexedDB is unavailable', async () => {
    vi.stubGlobal('indexedDB', undefined);
    const download = vi.fn(async () => blob('a'));
    await downloadWithCache('u/p/1.jpg', download);
    await downloadWithCache('u/p/1.jpg', download);
    expect(download).toHaveBeenCalledTimes(2);
  });
});

describe('write / forget / clear', () => {
  it('writeCachedBlob seeds a path so the next read is a hit', async () => {
    const b = blob('a');
    await writeCachedBlob('u/p/2.jpg', b);
    const download = vi.fn(async () => null);
    expect(await downloadWithCache('u/p/2.jpg', download)).toBe(b);
    expect(download).not.toHaveBeenCalled();
  });

  it('forgetCachedBlob drops one path', async () => {
    mem.set('a', blob('a'));
    mem.set('b', blob('b'));
    await forgetCachedBlob('a');
    expect([...mem.keys()]).toEqual(['b']);
  });

  it('clearRemoteBlobCache empties everything', async () => {
    mem.set('a', blob('a'));
    mem.set('b', blob('b'));
    await clearRemoteBlobCache();
    expect(mem.size).toBe(0);
  });
});
