'use client';
import { useMediaStore } from './mediaStore';
import {
  MAX_PHOTO_SLOTS,
  photoTransformEqual,
  type PhotoCount,
  type PhotoTransform,
} from '@/domain/home/decor';

/**
 * Merged view of media state for the customize flow. Reads draft* fields
 * while a draft is active, otherwise falls back to committed state. Screens
 * inside the customize / edit-photos flow render off this so preview matches
 * what will land in the repo when the user taps "설정 완료".
 */
export interface MediaCustomizeView {
  photoCount: PhotoCount | null;
  photoUrls: (string | null)[];
  photoTransforms: (PhotoTransform | null)[];
  draftActive: boolean;
  picksConfirmed: boolean;
}

export function useMediaCustomizeView(): MediaCustomizeView {
  const draftActive = useMediaStore((s) => s.draftActive);
  const photoCount = useMediaStore((s) =>
    s.draftActive ? s.draftPhotoCount : s.photoCount,
  );
  const photoUrls = useMediaStore((s) =>
    s.draftActive ? s.draftPhotoUrls : s.photoUrls,
  );
  const photoTransforms = useMediaStore((s) =>
    s.draftActive ? s.draftPhotoTransforms : s.photoTransforms,
  );
  const picksConfirmed = useMediaStore((s) => s.draftPicksConfirmed);
  return { photoCount, photoUrls, photoTransforms, draftActive, picksConfirmed };
}

/**
 * Snapshot shape consumed by isPhotoDraftDirty. Extracted so the predicate
 * can be unit-tested without React or the Zustand store.
 */
export interface PhotoDraftDirtyInput {
  draftActive: boolean;
  draftPhotoCount: PhotoCount | null;
  photoCount: PhotoCount | null;
  draftPendingBlobs: (Blob | null)[];
  draftClearedPhotos: boolean[];
  draftPhotoTransforms: (PhotoTransform | null)[];
  photoTransforms: (PhotoTransform | null)[];
}

/** Pure dirty check for the customize draft — see hook below for React use. */
export function isPhotoDraftDirty(s: PhotoDraftDirtyInput): boolean {
  if (!s.draftActive) return false;
  if (s.draftPhotoCount !== null && s.draftPhotoCount !== s.photoCount) return true;
  for (let slot = 0; slot < MAX_PHOTO_SLOTS; slot++) {
    if (s.draftPendingBlobs[slot]) return true;
    if (s.draftClearedPhotos[slot]) return true;
    const dTx = s.draftPhotoTransforms[slot] ?? null;
    const cTx = s.photoTransforms[slot] ?? null;
    if (!photoTransformEqual(dTx, cTx)) return true;
  }
  return false;
}

/**
 * True if the active draft differs from committed state in any way the user
 * would recognize as their edit. Used by the HomeCustomize back button to
 * decide whether to prompt for discard confirmation.
 */
export function useIsPhotoDraftDirty(): boolean {
  return useMediaStore(isPhotoDraftDirty);
}
