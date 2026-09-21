'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useT } from '@/i18n/useT';
import { cn } from '@/lib/cn';
import { useMediaStore } from '@/store/mediaStore';
import { useMediaCustomizeView } from '@/store/useMediaCustomizeView';
import {
  DEFAULT_PHOTO_TRANSFORM,
  photoTransformEqual,
  slotsForCount,
  type PhotoSlot,
  type PhotoTransform,
  type RenderSize,
} from '@/domain/home/decor';
import { AlbumIcon, CheckIcon24, CloseIcon24 } from '@/components/ui/icons';
import { CancelEditDialog } from './CancelEditDialog';
import { PhotoCell } from './PhotoCell';

interface PhotoEditDetailScreenProps {
  initialSlot: PhotoSlot;
}

export function PhotoEditDetailScreen({ initialSlot }: PhotoEditDetailScreenProps) {
  const t = useT();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement | null>(null);

  const hydrated = useMediaStore((s) => s.hydrated);
  const hydrate = useMediaStore((s) => s.hydrate);
  const draftSetPhoto = useMediaStore((s) => s.draftSetPhoto);
  const draftSetPhotoTransform = useMediaStore((s) => s.draftSetPhotoTransform);
  const view = useMediaCustomizeView();
  const photoCount = view.photoCount;
  const photoUrls = view.photoUrls;
  const photoTransforms = view.photoTransforms;
  const draftActive = view.draftActive;

  const [activeSlot, setActiveSlot] = useState<PhotoSlot>(initialSlot);
  // Local pan/zoom state. Seeded from the store the first time hydration
  // completes for a slot, then edited freely — nothing is persisted until
  // the user taps the confirm (✓) button.
  const [transforms, setTransforms] = useState<Record<number, PhotoTransform>>({});
  const [naturals, setNaturals] = useState<Record<number, RenderSize>>({});
  const [cellSizes, setCellSizes] = useState<Record<number, RenderSize>>({});
  const [submitting, setSubmitting] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const seededRef = useRef(false);
  // Session-scoped file picks. "Replace photo" writes here instead of pushing
  // straight to the draft, so ✓ / X consistently mean "commit this slot's
  // session edits to draft" / "throw away this slot's session edits".
  const [localPicks, setLocalPicks] = useState<Record<number, { blob: Blob; url: string }>>({});
  const ownedUrlsRef = useRef<Set<string>>(new Set());

  // Revoke any leftover object URLs when this screen unmounts. Individual
  // URLs are also revoked as they're consumed (on ✓) or dropped (on X + dialog
  // confirm, and when replaced by another pick for the same slot).
  useEffect(() => {
    const owned = ownedUrlsRef.current;
    return () => {
      owned.forEach((u) => URL.revokeObjectURL(u));
      owned.clear();
    };
  }, []);

  useEffect(() => {
    if (!hydrated) hydrate();
  }, [hydrated, hydrate]);

  // Bail out (before any redirects) if the URL slot doesn't belong to the
  // current photoCount — e.g. someone hits /edit-photos/2 while count=4.
  const validSlots = useMemo(() => (photoCount ? slotsForCount(photoCount) : []), [photoCount]);
  const initialSlotValid = validSlots.includes(initialSlot);

  useEffect(() => {
    if (!hydrated) return;
    // The draft session is the only owner of the customize flow's blob URLs
    // and transforms. If it isn't active (e.g. deep-linked here directly),
    // bounce back to /home/customize so beginPhotoDraft can seed it.
    if (!draftActive) {
      router.replace('/home/customize');
      return;
    }
    if (!photoCount || validSlots.some((s) => !photoUrls[s])) {
      router.replace('/home/customize');
      return;
    }
    if (!initialSlotValid) {
      router.replace('/home/customize/edit-photos');
    }
  }, [hydrated, draftActive, photoCount, photoUrls, validSlots, initialSlotValid, router]);

  // Seed local transforms from the store exactly once per hydration cycle so
  // the user can undo their gesture by comparing against the stored value.
  useEffect(() => {
    if (!hydrated || seededRef.current) return;
    if (!photoCount) return;
    const seeded: Record<number, PhotoTransform> = {};
    for (const slot of slotsForCount(photoCount)) {
      seeded[slot] = photoTransforms[slot] ?? DEFAULT_PHOTO_TRANSFORM;
    }
    setTransforms(seeded);
    seededRef.current = true;
  }, [hydrated, photoCount, photoTransforms]);

  const handleTransform = useCallback(
    (s: PhotoSlot, tx: PhotoTransform) => setTransforms((prev) => ({ ...prev, [s]: tx })),
    [],
  );
  const handleNatural = useCallback(
    (s: PhotoSlot, n: RenderSize) => setNaturals((prev) => ({ ...prev, [s]: n })),
    [],
  );
  const handleCellSize = useCallback(
    (s: PhotoSlot, size: RenderSize) =>
      setCellSizes((prev) => {
        const cur = prev[s];
        if (cur && cur.w === size.w && cur.h === size.h) return prev;
        return { ...prev, [s]: size };
      }),
    [],
  );

  if (!draftActive) return null;
  if (!photoCount) return null;
  const filledInValidSlots = validSlots.filter((s) => !!photoUrls[s]).length;
  if (filledInValidSlots !== photoCount) return null;
  if (!initialSlotValid) return null;

  const slots = slotsForCount(photoCount);
  // 이 화면은 사진이 다 채워졌을 때만 열린다(위 가드). 구분선을 두면 선택
  // 테두리 바깥에 회색 선이 겹쳐 보이므로 넣지 않는다.
  const wrapperClass = cn(
    'grid h-full w-full',
    photoCount === 2 && 'grid-rows-2',
    photoCount === 4 && 'grid-cols-2 grid-rows-2',
  );

  // "dirty" = any session edit exists (crop gesture or file pick). Empty local
  // maps (pre-seed) count as clean.
  const anyDirty =
    Object.keys(localPicks).length > 0 ||
    slots.some((s) => {
      const local = transforms[s];
      if (!local) return false;
      return !photoTransformEqual(local, photoTransforms[s] ?? null);
    });

  function handleFilesPicked(files: FileList) {
    const [file] = Array.from(files);
    if (!file) return;
    // Buffer locally — do NOT push to draft yet. ✓ commits; X + dialog
    // discards. Revoke any prior local URL held for this slot.
    const prior = localPicks[activeSlot];
    if (prior) {
      URL.revokeObjectURL(prior.url);
      ownedUrlsRef.current.delete(prior.url);
    }
    const url = URL.createObjectURL(file);
    ownedUrlsRef.current.add(url);
    setLocalPicks((prev) => ({ ...prev, [activeSlot]: { blob: file, url } }));
    setTransforms((prev) => ({ ...prev, [activeSlot]: DEFAULT_PHOTO_TRANSFORM }));
    setNaturals((prev) => {
      const rest = { ...prev };
      delete rest[activeSlot];
      return rest;
    });
  }

  function handleConfirm() {
    if (submitting || !anyDirty) return;
    setSubmitting(true);
    try {
      // 1) File picks first. draftSetPhoto also resets the slot's transform
      // in the draft, so we won't rewrite it below.
      const pickedSlots = new Set<number>();
      for (const [slotStr, pick] of Object.entries(localPicks)) {
        const slot = Number(slotStr) as PhotoSlot;
        draftSetPhoto(slot, pick.blob);
        URL.revokeObjectURL(pick.url);
        ownedUrlsRef.current.delete(pick.url);
        pickedSlots.add(slot);
      }
      setLocalPicks({});

      // 2) Crop gestures. For slots we just replaced, the pick reset draft
      // transform to null — so compare local against null (not the old value)
      // to catch panning that happened AFTER the file replace.
      for (const slot of slots) {
        const local = transforms[slot];
        if (!local) continue;
        const stored = pickedSlots.has(slot) ? null : (photoTransforms[slot] ?? null);
        if (photoTransformEqual(local, stored)) continue;
        draftSetPhotoTransform(slot, local);
      }
      router.push('/home/customize/edit-photos');
    } finally {
      setSubmitting(false);
    }
  }

  function handleCancel() {
    if (anyDirty) {
      setShowCancelDialog(true);
      return;
    }
    router.push('/home/customize/edit-photos');
  }

  function handleDialogConfirm() {
    // Discard session picks (revoke owned URLs) — draft is untouched, so
    // nothing else to undo.
    for (const pick of Object.values(localPicks)) {
      URL.revokeObjectURL(pick.url);
      ownedUrlsRef.current.delete(pick.url);
    }
    setLocalPicks({});
    setShowCancelDialog(false);
    router.push('/home/customize/edit-photos');
  }

  return (
    <div className="flex min-h-dvh flex-col bg-brand-white">
      <div className="mx-auto flex w-full flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between bg-brand-white px-4">
          <button
            type="button"
            onClick={handleCancel}
            aria-label={t.home.customize.photoEditDetail.cancelAriaLabel}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand-gray200 text-brand-gray900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gray900 focus-visible:ring-offset-2"
          >
            <CloseIcon24 className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!anyDirty || submitting}
            aria-label={t.home.customize.photoEditDetail.confirmAriaLabel}
            className={cn(
              'inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gray900 focus-visible:ring-offset-2',
              anyDirty && !submitting
                ? 'bg-brand-pink200 text-brand-pink50'
                : 'cursor-default bg-brand-gray300 text-brand-gray500',
            )}
          >
            <CheckIcon24 className="h-4 w-4" />
          </button>
        </header>

        <main className="flex flex-1 flex-col items-center justify-start">
          <div className="aspect-square max-h-full w-full overflow-hidden">
            <div className={wrapperClass}>
              {slots.map((slot) => (
                <PhotoCell
                  key={slot}
                  slot={slot}
                  url={localPicks[slot]?.url ?? photoUrls[slot] ?? null}
                  active={activeSlot === slot}
                  transform={transforms[slot] ?? DEFAULT_PHOTO_TRANSFORM}
                  natural={naturals[slot]}
                  cellSize={cellSizes[slot] ?? { w: 0, h: 0 }}
                  onSelect={setActiveSlot}
                  onTransformChange={handleTransform}
                  onNaturalLoad={handleNatural}
                  onCellSize={handleCellSize}
                />
              ))}
            </div>
          </div>

          <div className="mt-8 flex w-full justify-center">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-full bg-brand-gray300 px-7 py-4 text-sm font-medium text-brand-gray900 transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gray900 focus-visible:ring-offset-2"
            >
              <AlbumIcon className="h-[18px] w-[18px]" />
              {t.home.customize.photoEditDetail.changePhoto}
            </button>
          </div>

          <p className="mt-4 px-8 text-center text-xs leading-[1.5] text-brand-gray800">
            {t.home.customize.photoEditDetail.draftHint}
          </p>
        </main>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const files = e.target.files;
          if (files && files.length) handleFilesPicked(files);
          e.target.value = '';
        }}
      />

      {showCancelDialog ? (
        <CancelEditDialog
          onCancel={() => setShowCancelDialog(false)}
          onConfirm={handleDialogConfirm}
        />
      ) : null}
    </div>
  );
}
