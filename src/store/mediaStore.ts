'use client';
import { create } from 'zustand';
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
  commitPhotoDraft: () => Promise<void>;
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
      set({ error: (e as Error).message, loading: false });
    }
  },

  async setPhotoCount(count: PhotoCount) {
    if (get().photoCount === count) return;
    try {
      await mediaRepo.setPhotoCount(count);
      set({ photoCount: count });
    } catch (e) {
      set({ error: (e as Error).message });
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
      set({ error: (e as Error).message });
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
      set({ error: (e as Error).message });
    }
  },

  async setPhotoTransform(slot: PhotoSlot, transform: PhotoTransform) {
    try {
      await mediaRepo.setPhotoTransform(slot, transform);
      set({
        photoTransforms: replaceTransform(get().photoTransforms, slot, transform),
      });
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },

  async clearPhotoTransform(slot: PhotoSlot) {
    try {
      await mediaRepo.clearPhotoTransform(slot);
      set({
        photoTransforms: replaceTransform(get().photoTransforms, slot, null),
      });
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },

  async setTextPosition(position: TextPosition) {
    try {
      await mediaRepo.setTextPosition(position);
      set({ textPosition: position });
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },

  async setMainText(text: string) {
    try {
      await mediaRepo.setMainText(text);
      set({ mainText: text });
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },

  async setSubText(text: string) {
    try {
      await mediaRepo.setSubText(text);
      set({ subText: text });
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },

  async swapTexts() {
    const current = get().textOrder ?? DEFAULT_TEXT_ORDER;
    const next: TextOrder = current === 'mainFirst' ? 'subFirst' : 'mainFirst';
    try {
      await mediaRepo.setTextOrder(next);
      set({ textOrder: next });
    } catch (e) {
      set({ error: (e as Error).message });
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
    if (!state.draftActive) return;
    try {
      // 1) photoCount — write if it changed.
      if (
        state.draftPhotoCount !== null &&
        state.draftPhotoCount !== state.photoCount
      ) {
        await mediaRepo.setPhotoCount(state.draftPhotoCount);
      }

      // 2) Per-slot blob changes: pending file picks and explicit clears.
      // For a slot that had both a pending blob AND a transform change, the
      // blob write comes first because the repo call also clears the stored
      // transform (mirroring committed setPhoto behavior we removed here).
      for (const slot of PHOTO_SLOTS) {
        const blob = state.draftPendingBlobs[slot];
        if (blob) {
          await mediaRepo.setHomePhoto(slot, blob);
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
    } catch (e) {
      set({ error: (e as Error).message });
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
    // Revoke any previously-owned URL at this slot before creating a new one.
    const prevUrl = state.draftPhotoUrls[slot] ?? null;
    let ownedUrls = state.draftOwnedUrls;
    if (prevUrl && ownedUrls.includes(prevUrl)) {
      URL.revokeObjectURL(prevUrl);
      ownedUrls = ownedUrls.filter((u) => u !== prevUrl);
    }
    const url = URL.createObjectURL(blob);
    const nextUrls = state.draftPhotoUrls.slice();
    nextUrls[slot] = url;
    const nextBlobs = state.draftPendingBlobs.slice();
    nextBlobs[slot] = blob;
    // Replacing a photo also invalidates its crop.
    const nextTx = state.draftPhotoTransforms.slice();
    nextTx[slot] = null;
    const nextCleared = state.draftClearedPhotos.slice();
    nextCleared[slot] = false;
    set({
      draftPhotoUrls: nextUrls,
      draftPendingBlobs: nextBlobs,
      draftPhotoTransforms: nextTx,
      draftClearedPhotos: nextCleared,
      draftOwnedUrls: [...ownedUrls, url],
      draftPicksConfirmed: false,
    });
  },

  draftClearPhoto(slot: PhotoSlot) {
    const state = get();
    if (!state.draftActive) return;
    const prevUrl = state.draftPhotoUrls[slot] ?? null;
    let ownedUrls = state.draftOwnedUrls;
    if (prevUrl && ownedUrls.includes(prevUrl)) {
      URL.revokeObjectURL(prevUrl);
      ownedUrls = ownedUrls.filter((u) => u !== prevUrl);
    }
    const nextUrls = state.draftPhotoUrls.slice();
    nextUrls[slot] = null;
    const nextBlobs = state.draftPendingBlobs.slice();
    nextBlobs[slot] = null;
    const nextTx = state.draftPhotoTransforms.slice();
    nextTx[slot] = null;
    const nextCleared = state.draftClearedPhotos.slice();
    nextCleared[slot] = true;
    set({
      draftPhotoUrls: nextUrls,
      draftPendingBlobs: nextBlobs,
      draftPhotoTransforms: nextTx,
      draftClearedPhotos: nextCleared,
      draftOwnedUrls: ownedUrls,
      draftPicksConfirmed: false,
    });
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
