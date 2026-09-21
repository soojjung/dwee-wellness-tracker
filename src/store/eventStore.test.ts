// Unit tests for the two guards around built-in event categories:
//  1. seeding must not double-insert when it is called again mid-flight
//  2. hydrate must clean up accounts that already hold duplicated built-ins
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { EventCategory, EventLog } from '@/types';

// In-memory stand-in for the repositories. Mocked BEFORE the store imports
// `@/data` — the real IndexedDB adapter would crash under Node.
const db = vi.hoisted(() => ({
  categories: [] as EventCategory[],
  events: [] as EventLog[],
  nextId: 1,
  // Each write yields first, like a network round trip — that gap is what let
  // a second seed slip in.
  tick: () => new Promise<void>((resolve) => setTimeout(resolve, 5)),
}));

vi.mock('@/data', () => ({
  ensureMigrations: vi.fn(async () => {}),
  eventCategoryRepo: {
    list: vi.fn(async () => [...db.categories]),
    add: vi.fn(async (input: Omit<EventCategory, 'id' | 'createdAt'>) => {
      await db.tick();
      const row: EventCategory = {
        ...input,
        id: `cat-${db.nextId++}`,
        createdAt: new Date(2026, 0, 1, 0, 0, db.nextId).toISOString(),
      };
      db.categories.push(row);
      return row;
    }),
    update: vi.fn(async () => null),
    remove: vi.fn(async (id: string) => {
      await db.tick();
      db.categories = db.categories.filter((c) => c.id !== id);
    }),
  },
  eventRepo: {
    list: vi.fn(async () => [...db.events]),
    add: vi.fn(),
    update: vi.fn(async (id: string, patch: Partial<EventLog>) => {
      await db.tick();
      const current = db.events.find((e) => e.id === id);
      if (!current) return null;
      const next = { ...current, ...patch };
      db.events = db.events.map((e) => (e.id === id ? next : e));
      return next;
    }),
    remove: vi.fn(),
  },
}));

// eventStore imports periodStore, which would pull the real data layer too.
vi.mock('./periodStore', () => ({ usePeriodStore: { getState: () => ({}) } }));

import { eventCategoryRepo, eventRepo } from '@/data';
import { useEventStore } from './eventStore';

const namer = (key: string) => key;

function builtin(id: string, order: number, name: string, createdAt: string): EventCategory {
  const colorId = (['pink', 'lavender', 'gray', 'mint'] as const)[order] ?? 'pink';
  return { id, name, colorId, isBuiltIn: true, order, createdAt };
}

function event(id: string, categoryId: string): EventLog {
  return {
    id,
    title: id,
    startDate: '2026-10-09',
    endDate: '2026-10-09',
    categoryId,
    createdAt: '2026-10-01T00:00:00.000Z',
  } as EventLog;
}

beforeEach(() => {
  db.categories = [];
  db.events = [];
  db.nextId = 1;
  vi.clearAllMocks();
  useEventStore.setState({ categories: [], events: [], hydrated: false, error: null });
});

describe('seedBuiltinsIfEmpty', () => {
  it('inserts the four built-ins once', async () => {
    await useEventStore.getState().seedBuiltinsIfEmpty(namer);
    expect(db.categories).toHaveLength(4);
    expect(useEventStore.getState().categories.map((c) => c.name)).toEqual([
      'family',
      'friend',
      'work',
      'club',
    ]);
  });

  it('does not seed a second set when called again while the first is still writing', async () => {
    // The screen effect re-fires (locale settles, post-sign-in rehydrate) while
    // memory still shows zero categories.
    const first = useEventStore.getState().seedBuiltinsIfEmpty(namer);
    const second = useEventStore.getState().seedBuiltinsIfEmpty(namer);
    await Promise.all([first, second]);
    expect(eventCategoryRepo.add).toHaveBeenCalledTimes(4);
    expect(db.categories).toHaveLength(4);
    expect(useEventStore.getState().categories).toHaveLength(4);
  });

  it('adopts categories already in storage instead of seeding over them', async () => {
    db.categories = [builtin('remote-1', 0, 'family', '2026-01-01T00:00:00.000Z')];
    await useEventStore.getState().seedBuiltinsIfEmpty(namer);
    expect(eventCategoryRepo.add).not.toHaveBeenCalled();
    expect(useEventStore.getState().categories.map((c) => c.id)).toEqual(['remote-1']);
  });

  it('can seed again after a failed attempt', async () => {
    vi.mocked(eventCategoryRepo.add).mockRejectedValueOnce(new Error('offline'));
    await useEventStore.getState().seedBuiltinsIfEmpty(namer);
    expect(useEventStore.getState().error).toBe('offline');
    db.categories = [];
    await useEventStore.getState().seedBuiltinsIfEmpty(namer);
    expect(db.categories).toHaveLength(4);
  });
});

describe('hydrate — duplicated built-ins', () => {
  beforeEach(() => {
    // Two full sets, the way the double seed left them.
    const names = ['family', 'friend', 'work', 'club'];
    db.categories = [
      ...names.map((n, i) => builtin(`a-${i}`, i, n, `2026-10-01T00:00:0${i}.000Z`)),
      ...names.map((n, i) => builtin(`b-${i}`, i, n, `2026-10-01T00:00:1${i}.000Z`)),
    ];
  });

  it('keeps the older copy of each built-in and removes the rest', async () => {
    await useEventStore.getState().hydrate();
    expect(useEventStore.getState().categories.map((c) => c.id)).toEqual([
      'a-0',
      'a-1',
      'a-2',
      'a-3',
    ]);
    expect(db.categories.map((c) => c.id)).toEqual(['a-0', 'a-1', 'a-2', 'a-3']);
  });

  it('moves events off a duplicate before deleting it', async () => {
    db.events = [event('dinner', 'b-1'), event('lunch', 'a-1')];
    await useEventStore.getState().hydrate();
    expect(db.events.map((e) => [e.id, e.categoryId])).toEqual([
      ['dinner', 'a-1'],
      ['lunch', 'a-1'],
    ]);
    expect(useEventStore.getState().events.every((e) => e.categoryId === 'a-1')).toBe(true);
    // FK is `on delete restrict`: the event update has to land before the delete.
    const updateOrder = vi.mocked(eventRepo.update).mock.invocationCallOrder[0] ?? Infinity;
    const removeOrder = vi.mocked(eventCategoryRepo.remove).mock.invocationCallOrder[0] ?? 0;
    expect(updateOrder).toBeLessThan(removeOrder);
  });

  it('leaves a built-in the user renamed alone', async () => {
    db.categories = db.categories.map((c) => (c.id === 'b-2' ? { ...c, name: 'Studio' } : c));
    await useEventStore.getState().hydrate();
    expect(useEventStore.getState().categories.map((c) => c.id)).toContain('b-2');
    expect(useEventStore.getState().categories).toHaveLength(5);
  });

  it('still shows a clean list when the storage cleanup fails', async () => {
    const logged = vi.spyOn(console, 'error').mockImplementation(() => {});
    // Once is enough — the cleanup stops at the first failure. A persistent
    // rejection would leak into every later test (clearAllMocks keeps implementations).
    vi.mocked(eventCategoryRepo.remove).mockRejectedValueOnce(new Error('offline'));
    await useEventStore.getState().hydrate();
    expect(useEventStore.getState().categories).toHaveLength(4);
    expect(useEventStore.getState().hydrated).toBe(true);
    logged.mockRestore();
  });

  it('does nothing for an account that was never duplicated', async () => {
    db.categories = db.categories.filter((c) => c.id.startsWith('a-'));
    await useEventStore.getState().hydrate();
    expect(eventCategoryRepo.remove).not.toHaveBeenCalled();
    expect(eventRepo.update).not.toHaveBeenCalled();
  });
});

describe('removeCategory', () => {
  const names = ['family', 'friend', 'work', 'club'];
  beforeEach(async () => {
    db.categories = names.map((n, i) => builtin(`c-${i}`, i, n, `2026-10-01T00:00:0${i}.000Z`));
    db.events = [event('dinner', 'c-2'), event('lunch', 'c-1')];
    await useEventStore.getState().hydrate();
    vi.clearAllMocks();
  });

  it('removes the category from storage and from the list', async () => {
    expect(await useEventStore.getState().removeCategory('c-3')).toBe(true);
    expect(db.categories.map((c) => c.id)).toEqual(['c-0', 'c-1', 'c-2']);
    expect(useEventStore.getState().categories.map((c) => c.id)).toEqual(['c-0', 'c-1', 'c-2']);
  });

  it('keeps events of the removed category by moving them to the default one', async () => {
    await useEventStore.getState().removeCategory('c-2');
    expect(db.events.find((e) => e.id === 'dinner')?.categoryId).toBe('c-1');
    expect(useEventStore.getState().events.find((e) => e.id === 'dinner')?.categoryId).toBe('c-1');
    expect(db.events).toHaveLength(2);
    // FK is `on delete restrict`: move first, delete after.
    const updateOrder = vi.mocked(eventRepo.update).mock.invocationCallOrder[0] ?? Infinity;
    const removeOrder = vi.mocked(eventCategoryRepo.remove).mock.invocationCallOrder[0] ?? 0;
    expect(updateOrder).toBeLessThan(removeOrder);
  });

  it('falls back to the next category when the default itself is removed', async () => {
    await useEventStore.getState().removeCategory('c-1');
    expect(db.events.find((e) => e.id === 'lunch')?.categoryId).toBe('c-0');
  });

  it('refuses to remove the last remaining category', async () => {
    for (const id of ['c-0', 'c-2', 'c-3']) await useEventStore.getState().removeCategory(id);
    vi.clearAllMocks();
    expect(await useEventStore.getState().removeCategory('c-1')).toBe(false);
    expect(eventCategoryRepo.remove).not.toHaveBeenCalled();
    expect(useEventStore.getState().categories).toHaveLength(1);
  });

  it('leaves everything in place when storage rejects the delete', async () => {
    vi.mocked(eventCategoryRepo.remove).mockRejectedValueOnce(new Error('offline'));
    expect(await useEventStore.getState().removeCategory('c-3')).toBe(false);
    expect(useEventStore.getState().categories).toHaveLength(4);
    expect(useEventStore.getState().error).toBe('offline');
  });
});
