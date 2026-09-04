// Unit tests for the draft-mode customize flow inside mediaStore. Focuses on
// the state machine and side effects introduced by the "commit on Customize home submit"
// refactor: draft lifecycle, per-slot mutations, URL ownership, and the
// picksConfirmed gate.
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the data layer BEFORE the store imports it — otherwise the real
// IndexedDB adapter would run at module load and crash under Node.
vi.mock('@/data', () => ({
  mediaRepo: {
    getPhotoCount: vi.fn(async () => null),
    setPhotoCount: vi.fn(async () => {}),
    getHomePhoto: vi.fn(async () => null),
    setHomePhoto: vi.fn(async () => {}),
    clearHomePhoto: vi.fn(async () => {}),
    getPhotoTransform: vi.fn(async () => null),
    setPhotoTransform: vi.fn(async () => {}),
    clearPhotoTransform: vi.fn(async () => {}),
    getTextPosition: vi.fn(async () => null),
    setTextPosition: vi.fn(async () => {}),
    getMainText: vi.fn(async () => ''),
    setMainText: vi.fn(async () => {}),
    getSubText: vi.fn(async () => ''),
    setSubText: vi.fn(async () => {}),
    getTextOrder: vi.fn(async () => null),
    setTextOrder: vi.fn(async () => {}),
  },
  ensureMigrations: vi.fn(async () => {}),
}));

import { mediaRepo } from '@/data';
import {
  DEFAULT_PHOTO_TRANSFORM,
  MAX_PHOTO_SLOTS,
  type PhotoSlot,
  type PhotoTransform,
} from '@/domain/home/decor';
import { useMediaStore } from './mediaStore';
import { isPhotoDraftDirty } from './useMediaCustomizeView';

// -------- URL stubs & tracking --------

let urlCounter = 0;
let createdUrls: string[];
let revokedUrls: string[];

function stubUrlGlobals() {
  const anyGlobal = globalThis as unknown as {
    URL: {
      createObjectURL: (b: Blob) => string;
      revokeObjectURL: (u: string) => void;
    };
  };
  anyGlobal.URL.createObjectURL = ((_b: Blob) => {
    const url = `blob:mock:${urlCounter++}`;
    createdUrls.push(url);
    return url;
  }) as typeof URL.createObjectURL;
  anyGlobal.URL.revokeObjectURL = ((u: string) => {
    revokedUrls.push(u);
  }) as typeof URL.revokeObjectURL;
}

function stubBlob(): Blob {
  return { size: 1, type: 'image/jpeg' } as unknown as Blob;
}

// -------- Store reset --------

// Capture the pristine initial state once (before any test mutates it).
const initialState = useMediaStore.getState();

function resetStore() {
  useMediaStore.setState(initialState, true);
}

// -------- Helpers to seed committed state --------

function seedCommitted(patch: {
  photoCount?: 1 | 2 | 4 | null;
  photoUrls?: (string | null)[];
  photoTransforms?: (PhotoTransform | null)[];
}) {
  const s = useMediaStore.getState();
  useMediaStore.setState({
    photoCount: patch.photoCount ?? s.photoCount,
    photoUrls: patch.photoUrls ?? s.photoUrls,
    photoTransforms: patch.photoTransforms ?? s.photoTransforms,
  });
}

function nullArray<T>(fill: T): T[] {
  return Array<T>(MAX_PHOTO_SLOTS).fill(fill);
}

beforeEach(() => {
  urlCounter = 0;
  createdUrls = [];
  revokedUrls = [];
  stubUrlGlobals();
  vi.clearAllMocks();
  resetStore();
});

// ========================================================================
// beginPhotoDraft
// ========================================================================
describe('beginPhotoDraft', () => {
  it('activates the draft and snapshots committed state', () => {
    const urls: (string | null)[] = ['committed-url-a', 'committed-url-b', null, null, null, null, null];
    seedCommitted({ photoCount: 2, photoUrls: urls });
    useMediaStore.getState().beginPhotoDraft();

    const s = useMediaStore.getState();
    expect(s.draftActive).toBe(true);
    expect(s.draftPhotoCount).toBe(2);
    // Committed photos were previously confirmed, so the draft starts as
    // confirmed too — the top-level submit stays active for unchanged sessions.
    expect(s.draftPicksConfirmed).toBe(true);
    expect(s.draftPhotoUrls).toEqual(urls);
    expect(s.draftPhotoTransforms).toEqual(nullArray<PhotoTransform | null>(null));
    expect(s.draftPendingBlobs).toEqual(nullArray<Blob | null>(null));
    expect(s.draftClearedPhotos).toEqual(nullArray(false));
    expect(s.draftOwnedUrls).toEqual([]);
  });

  it('leaves draft photoCount null when nothing is committed', () => {
    useMediaStore.getState().beginPhotoDraft();
    expect(useMediaStore.getState().draftPhotoCount).toBeNull();
    expect(useMediaStore.getState().draftPicksConfirmed).toBe(false);
  });

  it('starts a fresh draft when photoCount is stale but no photos are committed', () => {
    // Stale state: prior sessions left photoCount=1 with no photo blobs.
    // Home hero is still on the default image, so the customize screen
    // must not pre-select "1장".
    seedCommitted({ photoCount: 1, photoUrls: nullArray<string | null>(null) });
    useMediaStore.getState().beginPhotoDraft();
    expect(useMediaStore.getState().draftPhotoCount).toBeNull();
    expect(useMediaStore.getState().draftPicksConfirmed).toBe(false);
  });

  it('is idempotent — a second call while active is a no-op (preserves picks)', () => {
    useMediaStore.getState().beginPhotoDraft();
    useMediaStore.getState().draftSetPhoto(3 as PhotoSlot, stubBlob());
    const before = useMediaStore.getState();
    const draftUrls = before.draftPhotoUrls.slice();
    const owned = before.draftOwnedUrls.slice();

    useMediaStore.getState().beginPhotoDraft();

    const after = useMediaStore.getState();
    expect(after.draftPhotoUrls).toEqual(draftUrls);
    expect(after.draftOwnedUrls).toEqual(owned);
    // No spurious revocations from the second call.
    expect(revokedUrls).toEqual([]);
  });
});

// ========================================================================
// discardPhotoDraft
// ========================================================================

describe('discardPhotoDraft', () => {
  it('is a no-op when no draft is active', () => {
    useMediaStore.getState().discardPhotoDraft();
    expect(useMediaStore.getState().draftActive).toBe(false);
    expect(revokedUrls).toEqual([]);
  });

  it('resets all draft fields and revokes owned URLs', () => {
    useMediaStore.getState().beginPhotoDraft();
    useMediaStore.getState().draftSetPhoto(0 as PhotoSlot, stubBlob());
    useMediaStore.getState().draftSetPhoto(1 as PhotoSlot, stubBlob());
    const ownedBefore = useMediaStore.getState().draftOwnedUrls.slice();
    expect(ownedBefore.length).toBe(2);

    useMediaStore.getState().discardPhotoDraft();

    const s = useMediaStore.getState();
    expect(s.draftActive).toBe(false);
    expect(s.draftPhotoCount).toBeNull();
    expect(s.draftPhotoUrls).toEqual(nullArray<string | null>(null));
    expect(s.draftPendingBlobs).toEqual(nullArray<Blob | null>(null));
    expect(s.draftClearedPhotos).toEqual(nullArray(false));
    expect(s.draftOwnedUrls).toEqual([]);
    expect(s.draftPicksConfirmed).toBe(false);
    // Every URL we created should have been revoked.
    expect(revokedUrls.sort()).toEqual(ownedBefore.sort());
  });

  it('does NOT revoke non-owned URLs (those copied from committed)', () => {
    // Simulate a committed URL already present at slot 0.
    seedCommitted({
      photoCount: 1,
      photoUrls: ['committed-url', null, null, null, null, null, null],
    });
    useMediaStore.getState().beginPhotoDraft();
    // draftPhotoUrls[0] === 'committed-url' but ownership is with committed.

    useMediaStore.getState().discardPhotoDraft();

    expect(revokedUrls).not.toContain('committed-url');
  });
});

// ========================================================================
// draftSetPhotoCount
// ========================================================================

describe('draftSetPhotoCount', () => {
  it('is a no-op when no draft is active', () => {
    useMediaStore.getState().draftSetPhotoCount(4);
    expect(useMediaStore.getState().draftPhotoCount).toBeNull();
  });

  it('does nothing when count already matches (preserves picksConfirmed)', () => {
    seedCommitted({
      photoCount: 1,
      photoUrls: ['committed-url', null, null, null, null, null, null],
    });
    useMediaStore.getState().beginPhotoDraft();
    // Fresh draft mirrors committed count (1), so re-setting to 1 is a no-op.
    useMediaStore.getState().draftSetPhotoCount(1);
    expect(useMediaStore.getState().draftPicksConfirmed).toBe(true);
  });

  it('resets picksConfirmed when the count actually changes', () => {
    useMediaStore.getState().beginPhotoDraft();
    useMediaStore.getState().draftSetPhotoCount(4);
    expect(useMediaStore.getState().draftPhotoCount).toBe(4);
    expect(useMediaStore.getState().draftPicksConfirmed).toBe(false);
  });
});

// ========================================================================
// draftSetPhoto
// ========================================================================

describe('draftSetPhoto', () => {
  it('is a no-op when no draft is active', () => {
    useMediaStore.getState().draftSetPhoto(0 as PhotoSlot, stubBlob());
    expect(useMediaStore.getState().draftPhotoUrls[0]).toBeNull();
    expect(createdUrls).toEqual([]);
  });

  it('populates url/blob/cleared and resets transform + picksConfirmed', () => {
    useMediaStore.getState().beginPhotoDraft();
    const blob = stubBlob();
    useMediaStore.getState().draftSetPhoto(2 as PhotoSlot, blob);

    const s = useMediaStore.getState();
    expect(s.draftPhotoUrls[2]).toBe(createdUrls[0]);
    expect(s.draftPendingBlobs[2]).toBe(blob);
    expect(s.draftPhotoTransforms[2]).toBeNull();
    expect(s.draftClearedPhotos[2]).toBe(false);
    expect(s.draftOwnedUrls).toContain(createdUrls[0]);
    expect(s.draftPicksConfirmed).toBe(false);
  });

  it('revokes the prior owned URL when replacing a pick on the same slot', () => {
    useMediaStore.getState().beginPhotoDraft();
    useMediaStore.getState().draftSetPhoto(0 as PhotoSlot, stubBlob());
    const firstUrl = createdUrls[0]!;
    useMediaStore.getState().draftSetPhoto(0 as PhotoSlot, stubBlob());
    const secondUrl = createdUrls[1]!;

    expect(revokedUrls).toContain(firstUrl);
    expect(useMediaStore.getState().draftPhotoUrls[0]).toBe(secondUrl);
    expect(useMediaStore.getState().draftOwnedUrls).toEqual([secondUrl]);
  });

  it('does NOT revoke a committed (unowned) URL when a slot gets picked over', () => {
    seedCommitted({
      photoCount: 1,
      photoUrls: ['committed-url', null, null, null, null, null, null],
    });
    useMediaStore.getState().beginPhotoDraft();
    useMediaStore.getState().draftSetPhoto(0 as PhotoSlot, stubBlob());

    expect(revokedUrls).not.toContain('committed-url');
    expect(useMediaStore.getState().draftOwnedUrls).toEqual([createdUrls[0]]);
  });

  it('drops a previously-cleared flag when the slot gets a new blob', () => {
    useMediaStore.getState().beginPhotoDraft();
    useMediaStore.getState().draftClearPhoto(3 as PhotoSlot);
    expect(useMediaStore.getState().draftClearedPhotos[3]).toBe(true);
    useMediaStore.getState().draftSetPhoto(3 as PhotoSlot, stubBlob());
    expect(useMediaStore.getState().draftClearedPhotos[3]).toBe(false);
  });
});

// ========================================================================
// draftClearPhoto
// ========================================================================

describe('draftClearPhoto', () => {
  it('is a no-op when no draft is active', () => {
    useMediaStore.getState().draftClearPhoto(0 as PhotoSlot);
    expect(useMediaStore.getState().draftClearedPhotos[0]).toBe(false);
  });

  it('revokes an owned URL and marks the slot cleared', () => {
    useMediaStore.getState().beginPhotoDraft();
    useMediaStore.getState().draftSetPhoto(0 as PhotoSlot, stubBlob());
    const url = createdUrls[0]!;

    useMediaStore.getState().draftClearPhoto(0 as PhotoSlot);

    const s = useMediaStore.getState();
    expect(s.draftPhotoUrls[0]).toBeNull();
    expect(s.draftPendingBlobs[0]).toBeNull();
    expect(s.draftPhotoTransforms[0]).toBeNull();
    expect(s.draftClearedPhotos[0]).toBe(true);
    expect(s.draftOwnedUrls).not.toContain(url);
    expect(revokedUrls).toContain(url);
    expect(s.draftPicksConfirmed).toBe(false);
  });

  it('does NOT revoke a committed (unowned) URL, still marks cleared', () => {
    seedCommitted({
      photoCount: 1,
      photoUrls: ['committed-url', null, null, null, null, null, null],
    });
    useMediaStore.getState().beginPhotoDraft();

    useMediaStore.getState().draftClearPhoto(0 as PhotoSlot);

    expect(revokedUrls).not.toContain('committed-url');
    expect(useMediaStore.getState().draftClearedPhotos[0]).toBe(true);
    expect(useMediaStore.getState().draftPhotoUrls[0]).toBeNull();
  });
});

// ========================================================================
// draftSetPhotoTransform / draftClearPhotoTransform / draftConfirmPicks
// ========================================================================

describe('draftSetPhotoTransform', () => {
  it('is a no-op when no draft is active', () => {
    useMediaStore
      .getState()
      .draftSetPhotoTransform(0 as PhotoSlot, DEFAULT_PHOTO_TRANSFORM);
    expect(useMediaStore.getState().draftPhotoTransforms[0]).toBeNull();
  });

  it('stores the transform and leaves picksConfirmed untouched', () => {
    seedCommitted({
      photoCount: 1,
      photoUrls: ['committed-url', null, null, null, null, null, null],
    });
    useMediaStore.getState().beginPhotoDraft(); // picksConfirmed=true
    const tx: PhotoTransform = { scale: 1.5, offsetXNorm: 0.2, offsetYNorm: 0 };
    useMediaStore.getState().draftSetPhotoTransform(3 as PhotoSlot, tx);
    expect(useMediaStore.getState().draftPhotoTransforms[3]).toEqual(tx);
    // Crop edits are not "pick" changes — the flag stays put.
    expect(useMediaStore.getState().draftPicksConfirmed).toBe(true);
  });
});

describe('draftClearPhotoTransform', () => {
  it('is a no-op when no draft is active', () => {
    useMediaStore.getState().draftClearPhotoTransform(0 as PhotoSlot);
    expect(useMediaStore.getState().draftPhotoTransforms[0]).toBeNull();
  });

  it('resets the transform slot without touching picksConfirmed', () => {
    seedCommitted({
      photoCount: 1,
      photoUrls: ['committed-url', null, null, null, null, null, null],
    });
    useMediaStore.getState().beginPhotoDraft();
    useMediaStore
      .getState()
      .draftSetPhotoTransform(0 as PhotoSlot, {
        scale: 2,
        offsetXNorm: 0,
        offsetYNorm: 0,
      });
    useMediaStore.getState().draftClearPhotoTransform(0 as PhotoSlot);
    expect(useMediaStore.getState().draftPhotoTransforms[0]).toBeNull();
    expect(useMediaStore.getState().draftPicksConfirmed).toBe(true);
  });
});

describe('draftConfirmPicks', () => {
  it('is a no-op when no draft is active', () => {
    useMediaStore.getState().draftConfirmPicks();
    expect(useMediaStore.getState().draftPicksConfirmed).toBe(false);
  });

  it('flips picksConfirmed on', () => {
    useMediaStore.getState().beginPhotoDraft();
    useMediaStore.getState().draftSetPhotoCount(4); // resets to false
    expect(useMediaStore.getState().draftPicksConfirmed).toBe(false);
    useMediaStore.getState().draftConfirmPicks();
    expect(useMediaStore.getState().draftPicksConfirmed).toBe(true);
  });
});

// ========================================================================
// commitPhotoDraft
// ========================================================================

describe('commitPhotoDraft', () => {
  it('is a no-op when no draft is active', async () => {
    await useMediaStore.getState().commitPhotoDraft();
    expect(mediaRepo.setPhotoCount).not.toHaveBeenCalled();
    expect(mediaRepo.setHomePhoto).not.toHaveBeenCalled();
  });

  it('writes the new photoCount only when it changed', async () => {
    seedCommitted({ photoCount: 2 });
    useMediaStore.getState().beginPhotoDraft(); // draftPhotoCount=2
    await useMediaStore.getState().commitPhotoDraft();
    expect(mediaRepo.setPhotoCount).not.toHaveBeenCalled();

    // Second round: change count.
    useMediaStore.getState().beginPhotoDraft();
    useMediaStore.getState().draftSetPhotoCount(4);
    await useMediaStore.getState().commitPhotoDraft();
    expect(mediaRepo.setPhotoCount).toHaveBeenCalledWith(4);
  });

  it('persists a pending blob via setHomePhoto and resets its transform', async () => {
    useMediaStore.getState().beginPhotoDraft();
    const blob = stubBlob();
    useMediaStore.getState().draftSetPhoto(0 as PhotoSlot, blob);

    await useMediaStore.getState().commitPhotoDraft();

    expect(mediaRepo.setHomePhoto).toHaveBeenCalledWith(0, blob);
    expect(mediaRepo.clearPhotoTransform).toHaveBeenCalledWith(0);
  });

  it('persists a cleared slot via clearHomePhoto', async () => {
    seedCommitted({
      photoCount: 1,
      photoUrls: ['committed-url', null, null, null, null, null, null],
    });
    useMediaStore.getState().beginPhotoDraft();
    useMediaStore.getState().draftClearPhoto(0 as PhotoSlot);

    await useMediaStore.getState().commitPhotoDraft();

    expect(mediaRepo.clearHomePhoto).toHaveBeenCalledWith(0);
    expect(mediaRepo.clearPhotoTransform).toHaveBeenCalledWith(0);
  });

  it('sets a newly-introduced transform on an already-committed slot', async () => {
    seedCommitted({
      photoCount: 1,
      photoUrls: ['committed-url', null, null, null, null, null, null],
    });
    useMediaStore.getState().beginPhotoDraft();
    const tx: PhotoTransform = { scale: 2, offsetXNorm: 0.1, offsetYNorm: -0.05 };
    useMediaStore.getState().draftSetPhotoTransform(0 as PhotoSlot, tx);

    await useMediaStore.getState().commitPhotoDraft();

    expect(mediaRepo.setPhotoTransform).toHaveBeenCalledWith(0, tx);
  });

  it('clears a transform when the draft drops it (previously committed non-null)', async () => {
    const priorTx: PhotoTransform = { scale: 2, offsetXNorm: 0, offsetYNorm: 0 };
    seedCommitted({
      photoCount: 1,
      photoUrls: ['committed-url', null, null, null, null, null, null],
      photoTransforms: [priorTx, null, null, null, null, null, null],
    });
    useMediaStore.getState().beginPhotoDraft();
    useMediaStore.getState().draftClearPhotoTransform(0 as PhotoSlot);

    await useMediaStore.getState().commitPhotoDraft();

    expect(mediaRepo.clearPhotoTransform).toHaveBeenCalledWith(0);
    expect(mediaRepo.setPhotoTransform).not.toHaveBeenCalled();
  });

  it('deactivates the draft and mirrors changes into committed state', async () => {
    useMediaStore.getState().beginPhotoDraft();
    useMediaStore.getState().draftSetPhotoCount(2);
    const blob0 = stubBlob();
    const blob1 = stubBlob();
    useMediaStore.getState().draftSetPhoto(1 as PhotoSlot, blob0);
    useMediaStore.getState().draftSetPhoto(2 as PhotoSlot, blob1);
    const draftUrls = useMediaStore.getState().draftPhotoUrls.slice();

    await useMediaStore.getState().commitPhotoDraft();

    const s = useMediaStore.getState();
    expect(s.draftActive).toBe(false);
    expect(s.photoCount).toBe(2);
    expect(s.photoUrls[1]).toBe(draftUrls[1]);
    expect(s.photoUrls[2]).toBe(draftUrls[2]);
    // Draft URLs are handed over to committed — they must NOT be revoked.
    expect(revokedUrls).not.toContain(draftUrls[1]!);
    expect(revokedUrls).not.toContain(draftUrls[2]!);
    // picksConfirmed resets so the next draft session starts fresh (with a
    // fresh confirmation state derived from the new committed values).
    expect(s.draftPicksConfirmed).toBe(false);
  });

  it('revokes an old committed URL when a slot gets a new blob', async () => {
    seedCommitted({
      photoCount: 1,
      photoUrls: ['old-committed-url', null, null, null, null, null, null],
    });
    useMediaStore.getState().beginPhotoDraft();
    useMediaStore.getState().draftSetPhoto(0 as PhotoSlot, stubBlob());

    await useMediaStore.getState().commitPhotoDraft();

    expect(revokedUrls).toContain('old-committed-url');
  });
});

// ========================================================================
// isPhotoDraftDirty (pure predicate)
// ========================================================================

describe('isPhotoDraftDirty', () => {
  function baseState(over: Partial<Parameters<typeof isPhotoDraftDirty>[0]> = {}) {
    return {
      draftActive: true,
      draftPhotoCount: 1 as 1 | 2 | 4,
      photoCount: 1 as 1 | 2 | 4,
      draftPendingBlobs: nullArray<Blob | null>(null),
      draftClearedPhotos: nullArray(false),
      draftPhotoTransforms: nullArray<PhotoTransform | null>(null),
      photoTransforms: nullArray<PhotoTransform | null>(null),
      ...over,
    };
  }

  it('returns false when the draft is inactive', () => {
    expect(isPhotoDraftDirty(baseState({ draftActive: false }))).toBe(false);
  });

  it('returns false when draft mirrors committed state exactly', () => {
    expect(isPhotoDraftDirty(baseState())).toBe(false);
  });

  it('returns true when photoCount differs', () => {
    expect(
      isPhotoDraftDirty(baseState({ draftPhotoCount: 4, photoCount: 1 })),
    ).toBe(true);
  });

  it('returns true when any slot has a pending blob', () => {
    const pending = nullArray<Blob | null>(null);
    pending[3] = stubBlob();
    expect(isPhotoDraftDirty(baseState({ draftPendingBlobs: pending }))).toBe(true);
  });

  it('returns true when any slot was explicitly cleared', () => {
    const cleared = nullArray(false);
    cleared[0] = true;
    expect(isPhotoDraftDirty(baseState({ draftClearedPhotos: cleared }))).toBe(true);
  });

  it('returns true when a transform diverges from committed', () => {
    const tx: PhotoTransform = { scale: 1.5, offsetXNorm: 0, offsetYNorm: 0 };
    const draftTransforms = nullArray<PhotoTransform | null>(null);
    draftTransforms[2] = tx;
    expect(
      isPhotoDraftDirty(baseState({ draftPhotoTransforms: draftTransforms })),
    ).toBe(true);
  });

  it('treats identity vs null as equal (no false dirty on epsilon drift)', () => {
    const draftTransforms = nullArray<PhotoTransform | null>(null);
    draftTransforms[0] = { ...DEFAULT_PHOTO_TRANSFORM }; // effectively same as null
    expect(
      isPhotoDraftDirty(baseState({ draftPhotoTransforms: draftTransforms })),
    ).toBe(false);
  });
});

// ========================================================================
// Cross-cutting scenarios
// ========================================================================

describe('draft flow — cross-cutting scenarios', () => {
  it('customize → edit-photos → back preserves picks (regression: beginPhotoDraft was resetting on remount)', () => {
    // Simulate: user enters customize (mount → beginPhotoDraft), picks 1 photo,
    // navigates to /edit-photos, confirms picks, returns to customize which
    // re-runs beginPhotoDraft. Prior to the idempotency fix this wiped
    // draftPhotoUrls and picksConfirmed. Ensure picks survive.
    useMediaStore.getState().beginPhotoDraft();
    useMediaStore.getState().draftSetPhoto(0 as PhotoSlot, stubBlob());
    useMediaStore.getState().draftConfirmPicks();
    const urlBefore = useMediaStore.getState().draftPhotoUrls[0];

    // Simulated remount.
    useMediaStore.getState().beginPhotoDraft();

    expect(useMediaStore.getState().draftPhotoUrls[0]).toBe(urlBefore);
    expect(useMediaStore.getState().draftPicksConfirmed).toBe(true);
  });

  it('picksConfirmed resets on every pick mutation but not on crop edits', () => {
    useMediaStore.getState().beginPhotoDraft();
    // pick mutation → false
    useMediaStore.getState().draftSetPhoto(0 as PhotoSlot, stubBlob());
    expect(useMediaStore.getState().draftPicksConfirmed).toBe(false);

    // confirm → true
    useMediaStore.getState().draftConfirmPicks();
    expect(useMediaStore.getState().draftPicksConfirmed).toBe(true);

    // transform edit → unchanged
    useMediaStore
      .getState()
      .draftSetPhotoTransform(0 as PhotoSlot, {
        scale: 2,
        offsetXNorm: 0,
        offsetYNorm: 0,
      });
    expect(useMediaStore.getState().draftPicksConfirmed).toBe(true);

    // clear → false
    useMediaStore.getState().draftClearPhoto(0 as PhotoSlot);
    expect(useMediaStore.getState().draftPicksConfirmed).toBe(false);

    // confirm again, then change count → false
    useMediaStore.getState().draftConfirmPicks();
    useMediaStore.getState().draftSetPhotoCount(4);
    expect(useMediaStore.getState().draftPicksConfirmed).toBe(false);
  });

  it('discardPhotoDraft never leaks owned URLs across multiple pick replacements', () => {
    useMediaStore.getState().beginPhotoDraft();
    useMediaStore.getState().draftSetPhoto(0 as PhotoSlot, stubBlob());
    useMediaStore.getState().draftSetPhoto(0 as PhotoSlot, stubBlob());
    useMediaStore.getState().draftSetPhoto(0 as PhotoSlot, stubBlob());
    // Replacing revokes intermediate URLs immediately.
    expect(revokedUrls.length).toBe(2);

    useMediaStore.getState().discardPhotoDraft();

    // Every URL ever created should end up revoked.
    expect(revokedUrls.sort()).toEqual(createdUrls.sort());
  });

  it('commitPhotoDraft with a pending blob transfers ownership without revoking the draft URL', async () => {
    useMediaStore.getState().beginPhotoDraft();
    useMediaStore.getState().draftSetPhoto(0 as PhotoSlot, stubBlob());
    const draftUrl = useMediaStore.getState().draftPhotoUrls[0];

    await useMediaStore.getState().commitPhotoDraft();

    // The URL survives — committed state now owns it.
    expect(revokedUrls).not.toContain(draftUrl!);
    expect(useMediaStore.getState().photoUrls[0]).toBe(draftUrl);
  });
});
