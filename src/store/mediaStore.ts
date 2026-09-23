'use client';
import { create } from 'zustand';
import { errorMessage } from '@/lib/errorMessage';
import { mediaRepo, ensureMigrations } from '@/data';
import {
  DEFAULT_TEXT_ORDER,
  MAX_PHOTO_SLOTS,
  PHOTO_SLOTS,
  type PhotoCount,
  type PhotoSlot,
  type PhotoTransform,
  type TextOrder,
  type TextPosition,
} from '@/domain/home/decor';
import { downscaleImage } from '@/lib/image/downscale';

type PhotoUrls = (string | null)[];
type PhotoTransforms = (PhotoTransform | null)[];
type PhotoBlobs = (Blob | null)[];

interface MediaState {
  photoCount: PhotoCount | null;
  photoUrls: PhotoUrls;
  photoTransforms: PhotoTransforms;
  textPosition: TextPosition | null;
  mainText: string;
  subText: string;
  textOrder: TextOrder | null;
  hydrated: boolean;
  loading: boolean;
  error: string | null;

  // Draft (customize flow): mutations from HomeCustomizeScreen /
  // PhotoEditDetailScreen accumulate here and only reach the repo when the
  // user taps "편집 완료" (commitPhotoDraft). Discard on cancel/back.
  draftActive: boolean;
  draftPhotoCount: PhotoCount | null;
  draftPhotoUrls: PhotoUrls;
  draftPhotoTransforms: PhotoTransforms;
  // Blobs picked during the draft session. null = unchanged (use committed).
  draftPendingBlobs: PhotoBlobs;
  // Which slot's photo was explicitly cleared during draft.
  draftClearedPhotos: boolean[];
  // Object URLs the draft created (must be revoked on discard/commit).
  draftOwnedUrls: string[];
  // Explicit "these are my final picks" acknowledgement from the edit-photos
  // overview screen (tap PhotoEditScreen's "편집 완료"). Cleared automatically whenever the user
  // changes photoCount, replaces a blob, or clears a slot — forcing them to
  // re-visit the overview and confirm again before "편집 완료" activates.
  draftPicksConfirmed: boolean;

  hydrate: () => Promise<void>;
  rehydrate: () => Promise<void>;
  setPhotoCount: (count: PhotoCount) => Promise<void>;
  setPhoto: (slot: PhotoSlot, blob: Blob) => Promise<void>;
  clearPhoto: (slot: PhotoSlot) => Promise<void>;
  setPhotoTransform: (slot: PhotoSlot, transform: PhotoTransform) => Promise<void>;
  clearPhotoTransform: (slot: PhotoSlot) => Promise<void>;
  setTextPosition: (position: TextPosition) => Promise<void>;
  setMainText: (text: string) => Promise<void>;
  setSubText: (text: string) => Promise<void>;
  swapTexts: () => Promise<void>;

  beginPhotoDraft: () => void;
  discardPhotoDraft: () => void;
  /** Resolves false when a write failed (the draft stays active so the user can retry). */
  commitPhotoDraft: () => Promise<boolean>;
  draftSetPhotoCount: (count: PhotoCount) => void;
  draftSetPhoto: (slot: PhotoSlot, blob: Blob) => void;
  draftClearPhoto: (slot: PhotoSlot) => void;
  draftSetPhotoTransform: (slot: PhotoSlot, transform: PhotoTransform) => void;
  draftClearPhotoTransform: (slot: PhotoSlot) => void;
  draftConfirmPicks: () => void;
}

function emptyUrls(): PhotoUrls {
  return Array<string | null>(MAX_PHOTO_SLOTS).fill(null);
}

function emptyTransforms(): PhotoTransforms {
  return Array<PhotoTransform | null>(MAX_PHOTO_SLOTS).fill(null);
}

function emptyBlobs(): PhotoBlobs {
  return Array<Blob | null>(MAX_PHOTO_SLOTS).fill(null);
}

function emptyClearedFlags(): boolean[] {
  return Array<boolean>(MAX_PHOTO_SLOTS).fill(false);
}

function replaceUrl(prev: PhotoUrls, slot: PhotoSlot, next: string | null): PhotoUrls {
  const old = prev[slot];
  if (old && old !== next) URL.revokeObjectURL(old);
  const out = prev.slice();
  out[slot] = next;
  return out;
}

function replaceTransform(
  prev: PhotoTransforms,
  slot: PhotoSlot,
  next: PhotoTransform | null,
): PhotoTransforms {
  const out = prev.slice();
  out[slot] = next;
  return out;
}

function revokeAll(urls: PhotoUrls): void {
  urls.forEach((u) => {
    if (u) URL.revokeObjectURL(u);
  });
}

interface DraftSlotUpdate {
  url: string | null;
  blob: Blob | null;
  cleared: boolean;
}

type DraftSlotPatch = Pick<
  MediaState,
  | 'draftPhotoUrls'
  | 'draftPendingBlobs'
  | 'draftPhotoTransforms'
  | 'draftClearedPhotos'
  | 'draftOwnedUrls'
  | 'draftPicksConfirmed'
>;

/**
 * Shared by draftSetPhoto/draftClearPhoto: revokes the slot's prior owned
 * URL first (same as each call site did inline), then asks `makeNext` for
 * the replacement — so draftSetPhoto's `URL.createObjectURL(blob)` still
 * runs after the revoke, preserving the original call order.
 */
function replaceDraftSlot(
  state: Pick<
    MediaState,
    | 'draftPhotoUrls'
    | 'draftOwnedUrls'
    | 'draftPendingBlobs'
    | 'draftPhotoTransforms'
    | 'draftClearedPhotos'
  >,
  slot: PhotoSlot,
  makeNext: () => DraftSlotUpdate,
): DraftSlotPatch {
  const prevUrl = state.draftPhotoUrls[slot] ?? null;
  let ownedUrls = state.draftOwnedUrls;
  if (prevUrl && ownedUrls.includes(prevUrl)) {
    URL.revokeObjectURL(prevUrl);
    ownedUrls = ownedUrls.filter((u) => u !== prevUrl);
  }
  const next = makeNext();
  const nextUrls = state.draftPhotoUrls.slice();
  nextUrls[slot] = next.url;
  const nextBlobs = state.draftPendingBlobs.slice();
  nextBlobs[slot] = next.blob;
  // Replacing a photo also invalidates its crop.
  const nextTx = state.draftPhotoTransforms.slice();
  nextTx[slot] = null;
  const nextCleared = state.draftClearedPhotos.slice();
  nextCleared[slot] = next.cleared;
  return {
    draftPhotoUrls: nextUrls,
    draftPendingBlobs: nextBlobs,
    draftPhotoTransforms: nextTx,
    draftClearedPhotos: nextCleared,
    draftOwnedUrls: next.url ? [...ownedUrls, next.url] : ownedUrls,
    draftPicksConfirmed: false,
  };
}

export const useMediaStore = create<MediaState>()((set, get) => ({
  photoCount: null,
  photoUrls: emptyUrls(),
  photoTransforms: emptyTransforms(),
  textPosition: null,
  mainText: '',
  subText: '',
  textOrder: null,
  hydrated: false,
  loading: false,
  error: null,

  draftActive: false,
  draftPhotoCount: null,
  draftPhotoUrls: emptyUrls(),
  draftPhotoTransforms: emptyTransforms(),
  draftPendingBlobs: emptyBlobs(),
  draftClearedPhotos: emptyClearedFlags(),
  draftOwnedUrls: [],
  draftPicksConfirmed: false,

  async rehydrate() {
    set({ hydrated: false });
    await get().hydrate();
  },

  async hydrate() {
    set({ loading: true, error: null });
    try {
      await ensureMigrations();
      const [count, blobs, transforms, textPosition, mainText, subText, textOrder] =
        await Promise.all([
          mediaRepo.getPhotoCount(),
          Promise.all(PHOTO_SLOTS.map((s) => mediaRepo.getHomePhoto(s))),
          Promise.all(PHOTO_SLOTS.map((s) => mediaRepo.getPhotoTransform(s))),
          mediaRepo.getTextPosition(),
          mediaRepo.getMainText(),
          mediaRepo.getSubText(),
          mediaRepo.getTextOrder(),
        ]);
      revokeAll(get().photoUrls);
      const urls: PhotoUrls = blobs.map((b) => (b ? URL.createObjectURL(b) : null));
      set({
        photoCount: count ?? null,
        photoUrls: urls,
        photoTransforms: transforms,
        textPosition,
        mainText,
        subText,
        textOrder,
        hydrated: true,
        loading: false,
      });
    } catch (e) {
      set({ error: errorMessage(e), loading: false });
    }
  },

  async setPhotoCount(count: PhotoCount) {
    if (get().photoCount === count) return;
    try {
      await mediaRepo.setPhotoCount(count);
      set({ photoCount: count });
    } catch (e) {
      set({ error: errorMessage(e) });
    }
  },

  async setPhoto(slot: PhotoSlot, blob: Blob) {
    try {
      await mediaRepo.setHomePhoto(slot, blob);
      // A replacement blob invalidates any prior crop — reset the transform
      // so the new photo shows in its natural fit.
      await mediaRepo.clearPhotoTransform(slot);
      const url = URL.createObjectURL(blob);
      set({
        photoUrls: replaceUrl(get().photoUrls, slot, url),
        photoTransforms: replaceTransform(get().photoTransforms, slot, null),
      });
    } catch (e) {
      set({ error: errorMessage(e) });
    }
  },

  async clearPhoto(slot: PhotoSlot) {
    try {
      await mediaRepo.clearHomePhoto(slot);
      await mediaRepo.clearPhotoTransform(slot);
      set({
        photoUrls: replaceUrl(get().photoUrls, slot, null),
        photoTransforms: replaceTransform(get().photoTransforms, slot, null),
      });
    } catch (e) {
      set({ error: errorMessage(e) });
    }
  },

  async setPhotoTransform(slot: PhotoSlot, transform: PhotoTransform) {
    try {
      await mediaRepo.setPhotoTransform(slot, transform);
      set({
        photoTransforms: replaceTransform(get().photoTransforms, slot, transform),
      });
    } catch (e) {
      set({ error: errorMessage(e) });
    }
  },

  async clearPhotoTransform(slot: PhotoSlot) {
    try {
      await mediaRepo.clearPhotoTransform(slot);
      set({
        photoTransforms: replaceTransform(get().photoTransforms, slot, null),
      });
    } catch (e) {
      set({ error: errorMessage(e) });
    }
  },

  async setTextPosition(position: TextPosition) {
    try {
      await mediaRepo.setTextPosition(position);
      set({ textPosition: position });
    } catch (e) {
      set({ error: errorMessage(e) });
    }
  },

  async setMainText(text: string) {
    try {
      await mediaRepo.setMainText(text);
      set({ mainText: text });
    } catch (e) {
      set({ error: errorMessage(e) });
    }
  },

  async setSubText(text: string) {
    try {
      await mediaRepo.setSubText(text);
      set({ subText: text });
    } catch (e) {
      set({ error: errorMessage(e) });
    }
  },

  async swapTexts() {
    const current = get().textOrder ?? DEFAULT_TEXT_ORDER;
    const next: TextOrder = current === 'mainFirst' ? 'subFirst' : 'mainFirst';
    try {
      await mediaRepo.setTextOrder(next);
      set({ textOrder: next });
    } catch (e) {
      set({ error: errorMessage(e) });
    }
  },

  // -------- Draft (customize flow) --------
  //
  // beginPhotoDraft is idempotent — if a draft is already active it's a
  // no-op so the customize flow's edits survive intra-flow navigation
  // (customize ⇄ edit-photos ⇄ detail). A fresh draft only starts once the
  // prior one was explicitly committed or discarded.
  beginPhotoDraft() {
    const state = get();
    if (state.draftActive) return;
    // If no photo is committed, the home hero is still showing the default
    // image — treat the draft as fresh so no photo-count tile appears
    // pre-selected on the customize screen.
    const hasCommittedPhoto = state.photoUrls.some((u) => !!u);
    // Committed photos were previously confirmed (they wouldn't be in the
    // repo otherwise), so open the draft in a "confirmed" state. Any pick
    // mutation below flips it back off.
    set({
      draftActive: true,
      draftPhotoCount: hasCommittedPhoto ? state.photoCount : null,
      draftPhotoUrls: state.photoUrls.slice(),
      draftPhotoTransforms: state.photoTransforms.slice(),
      draftPendingBlobs: emptyBlobs(),
      draftClearedPhotos: emptyClearedFlags(),
      draftOwnedUrls: [],
      draftPicksConfirmed: hasCommittedPhoto,
    });
  },

  discardPhotoDraft() {
    const state = get();
    if (!state.draftActive) return;
    state.draftOwnedUrls.forEach((u) => URL.revokeObjectURL(u));
    set({
      draftActive: false,
      draftPhotoCount: null,
      draftPhotoUrls: emptyUrls(),
      draftPhotoTransforms: emptyTransforms(),
      draftPendingBlobs: emptyBlobs(),
      draftClearedPhotos: emptyClearedFlags(),
      draftOwnedUrls: [],
      draftPicksConfirmed: false,
    });
  },

  async commitPhotoDraft() {
    const state = get();
    if (!state.draftActive) return true;
    try {
      // 1) photoCount — write if it changed.
      if (state.draftPhotoCount !== null && state.draftPhotoCount !== state.photoCount) {
        await mediaRepo.setPhotoCount(state.draftPhotoCount);
      }

      // 2) Per-slot blob changes: pending file picks and explicit clears.
      // For a slot that had both a pending blob AND a transform change, write
      // the blob first and explicitly clear the stored transform — a replacement
      // photo invalidates the old crop (same pairing as the committed setPhoto path).
      for (const slot of PHOTO_SLOTS) {
        const blob = state.draftPendingBlobs[slot];
        if (blob) {
          await mediaRepo.setHomePhoto(slot, await downscaleImage(blob));
          await mediaRepo.clearPhotoTransform(slot);
        } else if (state.draftClearedPhotos[slot]) {
          await mediaRepo.clearHomePhoto(slot);
          await mediaRepo.clearPhotoTransform(slot);
        }
      }

      // 3) Per-slot transform changes. If the blob was cleared this slot has
      // no transform meaning; skip. If the blob was replaced, we already
      // cleared the transform above — write the new one if it's non-default.
      for (const slot of PHOTO_SLOTS) {
        if (state.draftClearedPhotos[slot]) continue;
        const draftTx = state.draftPhotoTransforms[slot] ?? null;
        const committedTx = state.photoTransforms[slot] ?? null;
        const replacedBlob = !!state.draftPendingBlobs[slot];
        if (replacedBlob) {
          if (draftTx) await mediaRepo.setPhotoTransform(slot, draftTx);
        } else if (draftTx && !committedTx) {
          await mediaRepo.setPhotoTransform(slot, draftTx);
        } else if (!draftTx && committedTx) {
          await mediaRepo.clearPhotoTransform(slot);
        } else if (draftTx && committedTx && draftTx !== committedTx) {
          await mediaRepo.setPhotoTransform(slot, draftTx);
        }
      }

      // 4) Update committed state to mirror the just-persisted draft. We
      // reuse the draft's blob URLs directly (they're the ones the user just
      // saw in preview) and revoke the previous committed URLs they replace.
      const nextUrls = state.photoUrls.slice();
      for (const slot of PHOTO_SLOTS) {
        const draftUrl = state.draftPhotoUrls[slot] ?? null;
        if (draftUrl !== nextUrls[slot]) {
          const old = nextUrls[slot];
          if (old && !state.draftOwnedUrls.includes(old)) URL.revokeObjectURL(old);
          nextUrls[slot] = draftUrl;
        }
      }
      // Any owned URL not present in nextUrls (e.g. slot was overwritten
      // twice during draft — old owned URL got replaced) is already revoked
      // by draftSetPhoto. Owned URLs that ARE in nextUrls transfer ownership
      // to committed state, so we clear the draft's owned list.

      set({
        photoCount: state.draftPhotoCount ?? state.photoCount ?? 1,
        photoUrls: nextUrls,
        photoTransforms: state.draftPhotoTransforms.slice(),
        draftActive: false,
        draftPhotoCount: null,
        draftPhotoUrls: emptyUrls(),
        draftPhotoTransforms: emptyTransforms(),
        draftPendingBlobs: emptyBlobs(),
        draftClearedPhotos: emptyClearedFlags(),
        draftOwnedUrls: [],
        draftPicksConfirmed: false,
      });
      return true;
    } catch (e) {
      set({ error: errorMessage(e) });
      return false;
    }
  },

  draftSetPhotoCount(count: PhotoCount) {
    const state = get();
    if (!state.draftActive) return;
    if (state.draftPhotoCount === count) return;
    set({ draftPhotoCount: count, draftPicksConfirmed: false });
  },

  draftSetPhoto(slot: PhotoSlot, blob: Blob) {
    const state = get();
    if (!state.draftActive) return;
    set(
      replaceDraftSlot(state, slot, () => ({
        url: URL.createObjectURL(blob),
        blob,
        cleared: false,
      })),
    );
  },

  draftClearPhoto(slot: PhotoSlot) {
    const state = get();
    if (!state.draftActive) return;
    set(replaceDraftSlot(state, slot, () => ({ url: null, blob: null, cleared: true })));
  },

  draftSetPhotoTransform(slot: PhotoSlot, transform: PhotoTransform) {
    const state = get();
    if (!state.draftActive) return;
    const nextTx = state.draftPhotoTransforms.slice();
    nextTx[slot] = transform;
    set({ draftPhotoTransforms: nextTx });
  },

  draftClearPhotoTransform(slot: PhotoSlot) {
    const state = get();
    if (!state.draftActive) return;
    const nextTx = state.draftPhotoTransforms.slice();
    nextTx[slot] = null;
    set({ draftPhotoTransforms: nextTx });
  },

  draftConfirmPicks() {
    if (!get().draftActive) return;
    set({ draftPicksConfirmed: true });
  },
}));
