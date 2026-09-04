'use client';
import { useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useT } from '@/i18n/useT';
import { cn } from '@/lib/cn';
import { useMediaStore } from '@/store/mediaStore';
import { useMediaCustomizeView } from '@/store/useMediaCustomizeView';
import { slotsForCount, type PhotoSlot, type PhotoTransform } from '@/domain/home/decor';
import { TransformedPhoto } from './TransformedPhoto';

export function PhotoEditScreen() {
  const t = useT();
  const router = useRouter();

  const hydrated = useMediaStore((s) => s.hydrated);
  const hydrate = useMediaStore((s) => s.hydrate);
  const draftConfirmPicks = useMediaStore((s) => s.draftConfirmPicks);
  const draftSetPhoto = useMediaStore((s) => s.draftSetPhoto);
  const draftClearPhoto = useMediaStore((s) => s.draftClearPhoto);
  const view = useMediaCustomizeView();
  const photoCount = view.photoCount;
  const photoUrls = view.photoUrls;
  const photoTransforms = view.photoTransforms;
  const draftActive = view.draftActive;

  const fileRef = useRef<HTMLInputElement | null>(null);
  const pickTargetSlotRef = useRef<PhotoSlot | null>(null);

  useEffect(() => {
    if (!hydrated) hydrate();
  }, [hydrated, hydrate]);

  const slots = useMemo(
    () => (photoCount ? slotsForCount(photoCount) : []),
    [photoCount],
  );

  // Only redirect on structurally invalid entry (no active draft session or
  // no count). Empty slots are allowed — they show as "+ Add photo"
  // placeholders so the user can fill / rearrange from here.
  useEffect(() => {
    if (!hydrated) return;
    if (!draftActive || !photoCount) {
      router.replace('/home/customize');
    }
  }, [hydrated, draftActive, photoCount, router]);

  if (!draftActive || !photoCount) return null;

  const allFilled = slots.every((s) => !!photoUrls[s]);

  const wrapperClass = cn(
    'grid h-full w-full',
    photoCount === 2 && 'grid-rows-2 gap-px bg-brand-gray400',
    photoCount === 4 && 'grid-cols-2 grid-rows-2 gap-px bg-brand-gray400',
  );

  function handleAdd(slot: PhotoSlot) {
    pickTargetSlotRef.current = slot;
    fileRef.current?.click();
  }

  function handleRemove(slot: PhotoSlot) {
    draftClearPhoto(slot);
  }

  function handleFilePicked(files: FileList) {
    const slot = pickTargetSlotRef.current;
    pickTargetSlotRef.current = null;
    if (slot === null) return;
    const file = Array.from(files)[0];
    if (!file) return;
    draftSetPhoto(slot, file);
  }

  return (
    <div className="flex min-h-dvh flex-col bg-brand-white">
      <div className="mx-auto flex w-full flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-14 items-center bg-brand-white px-4">
          <Link
            href="/home/customize"
            aria-label={t.home.customize.photoEdit.back}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand-gray200 text-brand-gray900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gray900 focus-visible:ring-offset-2"
          >
            <BackIcon />
          </Link>
        </header>

        <main className="flex flex-1 flex-col items-center justify-start">
          <div className="aspect-square w-full max-h-full overflow-hidden">
            <div className={wrapperClass}>
              {slots.map((slot) => (
                <SlotCell
                  key={slot}
                  slot={slot}
                  url={photoUrls[slot] ?? null}
                  transform={photoTransforms[slot] ?? null}
                  editAriaLabel={t.home.customize.photoEdit.slotAriaLabel}
                  addAriaLabel={t.home.customize.photoEdit.addAriaLabel}
                  addLabel={t.home.customize.photoEdit.addPhoto}
                  removeAriaLabel={t.home.customize.photoEdit.removeAriaLabel}
                  onAdd={handleAdd}
                  onRemove={handleRemove}
                />
              ))}
            </div>
          </div>
          <p className="mt-10 px-10 text-center text-sm leading-[1.5] text-brand-gray800">
            {allFilled
              ? t.home.customize.photoEdit.hint
              : t.home.customize.photoEdit.hintMissing}
          </p>
        </main>

        <footer
          className={cn(
            'px-4 pb-8 pt-5 transition-colors',
            allFilled ? 'bg-brand-pink50' : 'bg-brand-gray200',
          )}
        >
          <button
            type="button"
            disabled={!allFilled}
            onClick={() => {
              // Explicit acknowledgement of the current photo picks. Flips
              // draftPicksConfirmed on so the top-level "편집 완료" activates.
              draftConfirmPicks();
              router.push('/home/customize');
            }}
            className={cn(
              'block w-full text-center text-lg font-semibold leading-6 transition-opacity',
              allFilled
                ? 'text-brand-gray900 hover:opacity-80'
                : 'cursor-default text-brand-gray500',
            )}
          >
            {t.home.customize.photoEdit.submit}
          </button>
        </footer>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const files = e.target.files;
          if (files && files.length) handleFilePicked(files);
          e.target.value = '';
        }}
      />
    </div>
  );
}

interface SlotCellProps {
  slot: PhotoSlot;
  url: string | null;
  transform: PhotoTransform | null;
  editAriaLabel: string;
  addAriaLabel: string;
  addLabel: string;
  removeAriaLabel: string;
  onAdd: (slot: PhotoSlot) => void;
  onRemove: (slot: PhotoSlot) => void;
}

function SlotCell({
  slot,
  url,
  transform,
  editAriaLabel,
  addAriaLabel,
  addLabel,
  removeAriaLabel,
  onAdd,
  onRemove,
}: SlotCellProps) {
  if (!url) {
    return (
      <button
        type="button"
        onClick={() => onAdd(slot)}
        aria-label={addAriaLabel}
        className="flex h-full w-full flex-col items-center justify-center gap-1.5 bg-brand-gray200 text-brand-gray700 transition-colors hover:bg-brand-gray300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-pink200"
      >
        <PlusIcon />
        <span className="text-xs font-medium">{addLabel}</span>
      </button>
    );
  }

  return (
    <div className="relative h-full w-full bg-brand-gray300">
      <Link
        href={`/home/customize/edit-photos/${slot}`}
        aria-label={editAriaLabel}
        className="block h-full w-full overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-pink200"
      >
        <TransformedPhoto url={url} transform={transform} />
      </Link>
      <button
        type="button"
        onClick={(e) => {
          // Sibling of the Link — click stays on the button, so tapping ×
          // doesn't also navigate to the detail screen.
          e.stopPropagation();
          onRemove(slot);
        }}
        aria-label={removeAriaLabel}
        className="absolute right-2 top-2 z-10 inline-flex h-7 w-7 items-center justify-center rounded-full bg-brand-gray900/70 text-brand-white shadow-[0_2px_6px_0_rgba(0,0,0,0.2)] transition-colors hover:bg-brand-gray900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-white"
      >
        <XIcon />
      </button>
    </div>
  );
}

function BackIcon() {
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
      <path d="M15 5l-7 7 7 7" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6"
      aria-hidden
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}
