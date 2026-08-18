'use client';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useT } from '@/i18n/useT';
import { cn } from '@/lib/cn';
import { useMediaStore } from '@/store/mediaStore';
import { useMediaCustomizeView } from '@/store/useMediaCustomizeView';
import {
  DEFAULT_PHOTO_TRANSFORM,
  clampPhotoTransform,
  computePhotoRender,
  isPhotoTransformEdited,
  photoTransformEqual,
  slotsForCount,
  type PhotoSlot,
  type PhotoTransform,
  type RenderSize,
} from '@/domain/home/decor';
import { CancelEditDialog } from './CancelEditDialog';

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
  const validSlots = useMemo(
    () => (photoCount ? slotsForCount(photoCount) : []),
    [photoCount],
  );
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
  }, [
    hydrated,
    draftActive,
    photoCount,
    photoUrls,
    validSlots,
    initialSlotValid,
    router,
  ]);

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
    (s: PhotoSlot, tx: PhotoTransform) =>
      setTransforms((prev) => ({ ...prev, [s]: tx })),
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
  const wrapperClass = cn(
    'grid h-full w-full',
    photoCount === 2 && 'grid-rows-2 gap-px bg-brand-gray400',
    photoCount === 4 && 'grid-cols-2 grid-rows-2 gap-px bg-brand-gray400',
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
        const stored = pickedSlots.has(slot)
          ? null
          : (photoTransforms[slot] ?? null);
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
      <div className="mx-auto flex w-full max-w-[420px] flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between bg-brand-white px-4">
          <button
            type="button"
            onClick={handleCancel}
            aria-label={t.home.customize.photoEditDetail.cancelAriaLabel}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand-gray200 text-brand-gray900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gray900 focus-visible:ring-offset-2"
          >
            <CloseIcon />
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
            <CheckIcon />
          </button>
        </header>

        <main className="flex flex-1 flex-col items-center justify-start">
          <div className="aspect-square w-full max-h-full overflow-hidden">
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
              className="inline-flex items-center gap-2 rounded-full bg-brand-gray200 px-4 py-2.5 text-sm font-medium text-brand-gray900 shadow-[0_2px_8px_0_rgba(0,0,0,0.08)] transition-colors hover:bg-brand-gray300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gray900 focus-visible:ring-offset-2"
            >
              <ChangePhotoIcon />
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

interface PhotoCellProps {
  slot: PhotoSlot;
  url: string | null;
  active: boolean;
  transform: PhotoTransform;
  natural: RenderSize | undefined;
  cellSize: RenderSize;
  onSelect: (slot: PhotoSlot) => void;
  onTransformChange: (slot: PhotoSlot, tx: PhotoTransform) => void;
  onNaturalLoad: (slot: PhotoSlot, size: RenderSize) => void;
  onCellSize: (slot: PhotoSlot, size: RenderSize) => void;
}

function PhotoCell({
  slot,
  url,
  active,
  transform,
  natural,
  cellSize,
  onSelect,
  onTransformChange,
  onNaturalLoad,
  onCellSize,
}: PhotoCellProps) {
  const cellRef = useRef<HTMLDivElement | null>(null);

  const pointers = useRef<Map<number, { x: number; y: number }>>(new Map());
  const gestureRef = useRef<{
    baseTx: PhotoTransform;
    baseCell: RenderSize;
    pinchDist: number | null;
    dragStart: { x: number; y: number } | null;
  } | null>(null);

  useLayoutEffect(() => {
    const el = cellRef.current;
    if (!el) return;
    function update() {
      const rect = el!.getBoundingClientRect();
      onCellSize(slot, { w: rect.width, h: rect.height });
    }
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [slot, onCellSize]);

  if (!url) return <div className="bg-brand-gray300" aria-hidden />;

  const ready = !!natural && cellSize.w > 0 && cellSize.h > 0;
  const rendered = ready ? computePhotoRender(transform, natural!, cellSize) : null;

  function clamp(next: PhotoTransform): PhotoTransform {
    if (!natural || cellSize.w <= 0) return { ...next, scale: Math.max(1, Math.min(4, next.scale)) };
    return clampPhotoTransform(next, natural, cellSize);
  }

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (!active) {
      onSelect(slot);
      return;
    }
    e.currentTarget.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 1) {
      gestureRef.current = {
        baseTx: transform,
        baseCell: cellSize,
        pinchDist: null,
        dragStart: { x: e.clientX, y: e.clientY },
      };
    } else if (pointers.current.size === 2) {
      const values = [...pointers.current.values()];
      const p1 = values[0]!;
      const p2 = values[1]!;
      gestureRef.current = {
        baseTx: transform,
        baseCell: cellSize,
        pinchDist: pointDistance(p1, p2),
        dragStart: null,
      };
    }
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!active || !pointers.current.has(e.pointerId) || !gestureRef.current) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const g = gestureRef.current;
    if (pointers.current.size === 1 && g.dragStart) {
      const dxPx = e.clientX - g.dragStart.x;
      const dyPx = e.clientY - g.dragStart.y;
      const cw = g.baseCell.w || 1;
      const ch = g.baseCell.h || 1;
      onTransformChange(
        slot,
        clamp({
          scale: g.baseTx.scale,
          offsetXNorm: g.baseTx.offsetXNorm + dxPx / cw,
          offsetYNorm: g.baseTx.offsetYNorm + dyPx / ch,
        }),
      );
    } else if (pointers.current.size === 2 && g.pinchDist) {
      const values = [...pointers.current.values()];
      const p1 = values[0]!;
      const p2 = values[1]!;
      const dist = pointDistance(p1, p2);
      const multiplier = dist / g.pinchDist;
      onTransformChange(
        slot,
        clamp({
          scale: g.baseTx.scale * multiplier,
          offsetXNorm: g.baseTx.offsetXNorm,
          offsetYNorm: g.baseTx.offsetYNorm,
        }),
      );
    }
  }

  function handlePointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    pointers.current.delete(e.pointerId);
    if (pointers.current.size === 0) {
      gestureRef.current = null;
    } else if (pointers.current.size === 1) {
      const remaining = [...pointers.current.values()][0]!;
      gestureRef.current = {
        baseTx: transform,
        baseCell: cellSize,
        pinchDist: null,
        dragStart: { x: remaining.x, y: remaining.y },
      };
    }
  }

  return (
    <div
      ref={cellRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      role="button"
      tabIndex={0}
      aria-pressed={active}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(slot);
        }
      }}
      className={cn(
        'relative h-full w-full touch-none select-none overflow-hidden bg-brand-gray300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-pink200',
        active && 'ring-2 ring-inset ring-brand-pink200',
        isPhotoTransformEdited(transform) && !active && 'opacity-100',
      )}
      style={{ cursor: active ? 'grab' : 'pointer' }}
    >
      <img
        src={url}
        alt=""
        aria-hidden
        draggable={false}
        onLoad={(e) => {
          const img = e.currentTarget;
          onNaturalLoad(slot, { w: img.naturalWidth, h: img.naturalHeight });
        }}
        className="pointer-events-none absolute left-1/2 top-1/2 max-w-none"
        style={
          rendered
            ? {
                width: rendered.renderedW,
                height: rendered.renderedH,
                transform: `translate(calc(-50% + ${rendered.offsetPxX}px), calc(-50% + ${rendered.offsetPxY}px))`,
              }
            : { width: '100%', height: '100%', objectFit: 'cover' as const }
        }
      />
    </div>
  );
}


function pointDistance(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden
    >
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

function ChangePhotoIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      className="h-4 w-4"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 16l4-4a3 3 0 014 0l4 4M14 14l1.5-1.5a3 3 0 014 0L21 14"
      />
      <circle cx="9" cy="9" r="1.5" />
      <rect x="3" y="4" width="18" height="16" rx="2" />
    </svg>
  );
}
