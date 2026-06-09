'use client';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useT } from '@/i18n/useT';
import { cn } from '@/lib/cn';
import { useMediaStore } from '@/store/mediaStore';
import { type PhotoCount, type PhotoSlot } from '@/domain/home/decor';

interface Transform {
  offsetX: number;
  offsetY: number;
  scale: number;
}

interface NaturalSize {
  w: number;
  h: number;
}

interface CellSize {
  w: number;
  h: number;
}

const DEFAULT_TX: Transform = { offsetX: 0, offsetY: 0, scale: 1 };
const MIN_SCALE = 1;
const MAX_SCALE = 4;
const OUTPUT_LONG = 1280;

export function PhotoEditScreen() {
  const t = useT();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement | null>(null);

  const hydrated = useMediaStore((s) => s.hydrated);
  const hydrate = useMediaStore((s) => s.hydrate);
  const photoCount = useMediaStore((s) => s.photoCount);
  const photoUrls = useMediaStore((s) => s.photoUrls);
  const setPhoto = useMediaStore((s) => s.setPhoto);

  const [selectedSlot, setSelectedSlot] = useState<PhotoSlot | null>(null);
  const [transforms, setTransforms] = useState<Record<number, Transform>>({});
  const [naturals, setNaturals] = useState<Record<number, NaturalSize>>({});
  const [cellSizes, setCellSizes] = useState<Record<number, CellSize>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!hydrated) hydrate();
  }, [hydrated, hydrate]);

  useEffect(() => {
    if (hydrated && (!photoCount || photoUrls.slice(0, photoCount).some((u) => !u))) {
      router.replace('/home/customize');
    }
  }, [hydrated, photoCount, photoUrls, router]);

  const handleSelect = useCallback((s: PhotoSlot) => setSelectedSlot(s), []);
  const handleTransform = useCallback(
    (s: PhotoSlot, tx: Transform) => setTransforms((prev) => ({ ...prev, [s]: tx })),
    [],
  );
  const handleNatural = useCallback(
    (s: PhotoSlot, n: NaturalSize) => setNaturals((prev) => ({ ...prev, [s]: n })),
    [],
  );
  const handleCellSize = useCallback(
    (s: PhotoSlot, size: CellSize) =>
      setCellSizes((prev) => {
        const cur = prev[s];
        if (cur && cur.w === size.w && cur.h === size.h) return prev;
        return { ...prev, [s]: size };
      }),
    [],
  );
  const handleChangePhoto = useCallback(() => {
    if (selectedSlot === null) return;
    fileRef.current?.click();
  }, [selectedSlot]);

  if (!photoCount) return null;
  const activeUrls = photoUrls.slice(0, photoCount).filter((u): u is string => !!u);
  if (activeUrls.length !== photoCount) return null;

  const slots = slotsFor(photoCount);
  const wrapperClass = cn(
    'grid h-full w-full',
    photoCount === 2 && 'grid-rows-2 gap-px bg-brand-gray400',
    photoCount === 4 && 'grid-cols-2 grid-rows-2 gap-px bg-brand-gray400',
  );

  async function handleFilesPicked(files: FileList) {
    if (selectedSlot === null) return;
    const [file] = Array.from(files);
    if (!file) return;
    await setPhoto(selectedSlot, file);
    setTransforms((prev) => ({ ...prev, [selectedSlot]: DEFAULT_TX }));
  }

  async function handleSubmit() {
    if (submitting) return;
    setSubmitting(true);
    try {
      for (const slot of slots) {
        const tx = transforms[slot];
        const natural = naturals[slot];
        const cell = cellSizes[slot];
        const url = photoUrls[slot];
        if (!tx || !natural || !cell || !url) continue;
        if (tx.offsetX === 0 && tx.offsetY === 0 && tx.scale === 1) continue;
        const blob = await renderCroppedBlob({ srcUrl: url, natural, cell, transform: tx });
        if (blob) await setPhoto(slot, blob);
      }
      router.push('/home/customize');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col bg-brand-white">
      <div className="mx-auto flex w-full max-w-[420px] flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-14 items-center bg-brand-white px-4">
          <Link
            href="/home/customize"
            aria-label={t.home.customize.photoEdit.back}
            className="flex h-6 w-6 items-center justify-center text-brand-gray900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gray900 focus-visible:ring-offset-2"
          >
            <BackIcon />
          </Link>
          <h1 className="text-lg font-semibold leading-6 text-brand-gray900">{t.home.customize.photoEdit.title}</h1>
        </header>

        <main className="flex flex-1 flex-col items-center justify-center">
          <div className="aspect-square w-full max-h-full overflow-hidden">
            <div className={wrapperClass}>
              {slots.map((slot) => (
                <PhotoCell
                  key={slot}
                  slot={slot}
                  url={photoUrls[slot] ?? null}
                  selected={selectedSlot === slot}
                  transform={transforms[slot] ?? DEFAULT_TX}
                  natural={naturals[slot]}
                  onSelect={handleSelect}
                  onTransformChange={handleTransform}
                  onNaturalLoad={handleNatural}
                  onCellSize={handleCellSize}
                  onChangePhoto={handleChangePhoto}
                  slotAriaLabel={t.home.customize.photoEdit.slotAriaLabel}
                  changeAriaLabel={t.home.customize.photoEdit.changeAriaLabel}
                />
              ))}
            </div>
          </div>
          <p className="mt-10 px-10 text-center text-sm leading-[1.5] text-brand-gray800">
            {t.home.customize.photoEdit.hint}
          </p>
        </main>

        <footer className="bg-brand-pink50 px-4 pb-8 pt-5">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="block w-full text-center text-lg font-semibold leading-6 text-brand-gray900 transition-opacity hover:opacity-80 disabled:opacity-50"
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
          if (files && files.length) handleFilesPicked(files);
          e.target.value = '';
        }}
      />
    </div>
  );
}

interface PhotoCellProps {
  slot: PhotoSlot;
  url: string | null;
  selected: boolean;
  transform: Transform;
  natural: NaturalSize | undefined;
  onSelect: (slot: PhotoSlot) => void;
  onTransformChange: (slot: PhotoSlot, tx: Transform) => void;
  onNaturalLoad: (slot: PhotoSlot, size: NaturalSize) => void;
  onCellSize: (slot: PhotoSlot, size: CellSize) => void;
  onChangePhoto: () => void;
  slotAriaLabel: string;
  changeAriaLabel: string;
}

function PhotoCell({
  slot,
  url,
  selected,
  transform,
  natural,
  onSelect,
  onTransformChange,
  onNaturalLoad,
  onCellSize,
  onChangePhoto,
  slotAriaLabel,
  changeAriaLabel,
}: PhotoCellProps) {
  const cellRef = useRef<HTMLDivElement | null>(null);
  const [cellSize, setCellSize] = useState<CellSize>({ w: 0, h: 0 });

  const pointers = useRef<Map<number, { x: number; y: number }>>(new Map());
  const gestureRef = useRef<{
    baseTx: Transform;
    pinchDist: number | null;
    dragStart: { x: number; y: number } | null;
  } | null>(null);

  useLayoutEffect(() => {
    const el = cellRef.current;
    if (!el) return;
    function update() {
      const rect = el!.getBoundingClientRect();
      const next = { w: rect.width, h: rect.height };
      setCellSize(next);
      onCellSize(slot, next);
    }
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [slot, onCellSize]);

  if (!url) return <div className="bg-brand-gray300" aria-hidden />;

  const baseScale =
    natural && cellSize.w > 0 ? Math.max(cellSize.w / natural.w, cellSize.h / natural.h) : 0;
  const k = baseScale * transform.scale;
  const renderedW = natural ? natural.w * k : cellSize.w;
  const renderedH = natural ? natural.h * k : cellSize.h;

  function clampTx(t: Transform): Transform {
    const scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, t.scale));
    if (!natural || cellSize.w <= 0) return { ...t, scale };
    const newK = baseScale * scale;
    const newRW = natural.w * newK;
    const newRH = natural.h * newK;
    const maxX = Math.max(0, (newRW - cellSize.w) / 2);
    const maxY = Math.max(0, (newRH - cellSize.h) / 2);
    return {
      scale,
      offsetX: Math.min(maxX, Math.max(-maxX, t.offsetX)),
      offsetY: Math.min(maxY, Math.max(-maxY, t.offsetY)),
    };
  }

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (!selected) {
      onSelect(slot);
      return;
    }
    e.currentTarget.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 1) {
      gestureRef.current = {
        baseTx: transform,
        pinchDist: null,
        dragStart: { x: e.clientX, y: e.clientY },
      };
    } else if (pointers.current.size === 2) {
      const values = [...pointers.current.values()];
      const p1 = values[0]!;
      const p2 = values[1]!;
      gestureRef.current = {
        baseTx: transform,
        pinchDist: pointDistance(p1, p2),
        dragStart: null,
      };
    }
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!selected || !pointers.current.has(e.pointerId) || !gestureRef.current) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const g = gestureRef.current;
    if (pointers.current.size === 1 && g.dragStart) {
      const dx = e.clientX - g.dragStart.x;
      const dy = e.clientY - g.dragStart.y;
      onTransformChange(
        slot,
        clampTx({
          scale: g.baseTx.scale,
          offsetX: g.baseTx.offsetX + dx,
          offsetY: g.baseTx.offsetY + dy,
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
        clampTx({
          scale: g.baseTx.scale * multiplier,
          offsetX: g.baseTx.offsetX,
          offsetY: g.baseTx.offsetY,
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
      aria-pressed={selected}
      aria-label={slotAriaLabel}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(slot);
        }
      }}
      className={cn(
        'relative h-full w-full touch-none select-none overflow-hidden bg-brand-gray300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-pink200',
        selected && 'ring-2 ring-inset ring-brand-pink200',
      )}
      style={{ cursor: selected ? 'grab' : 'pointer' }}
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
        style={{
          width: natural && cellSize.w > 0 ? renderedW : '100%',
          height: natural && cellSize.h > 0 ? renderedH : '100%',
          transform: `translate(calc(-50% + ${transform.offsetX}px), calc(-50% + ${transform.offsetY}px))`,
        }}
      />
      {selected ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onChangePhoto();
          }}
          onPointerDown={(e) => e.stopPropagation()}
          aria-label={changeAriaLabel}
          className="absolute right-2 top-2 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full bg-brand-gray900/75 text-brand-white backdrop-blur-sm transition-colors hover:bg-brand-gray900/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-white focus-visible:ring-offset-1"
        >
          <ChangePhotoIcon />
        </button>
      ) : null}
    </div>
  );
}

function slotsFor(count: PhotoCount): PhotoSlot[] {
  if (count === 1) return [0];
  if (count === 2) return [0, 1];
  return [0, 1, 2, 3];
}

function pointDistance(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

interface RenderArgs {
  srcUrl: string;
  natural: NaturalSize;
  cell: CellSize;
  transform: Transform;
}

async function renderCroppedBlob({ srcUrl, natural, cell, transform }: RenderArgs): Promise<Blob | null> {
  const img = await loadImage(srcUrl);
  const baseScale = Math.max(cell.w / natural.w, cell.h / natural.h);
  const k = baseScale * transform.scale;
  const renderedW = natural.w * k;
  const renderedH = natural.h * k;
  const cellLeftInImg = (renderedW - cell.w) / 2 - transform.offsetX;
  const cellTopInImg = (renderedH - cell.h) / 2 - transform.offsetY;
  const sx = cellLeftInImg / k;
  const sy = cellTopInImg / k;
  const sw = cell.w / k;
  const sh = cell.h / k;
  const aspect = cell.w / cell.h;
  const outputW = aspect >= 1 ? OUTPUT_LONG : Math.round(OUTPUT_LONG * aspect);
  const outputH = aspect >= 1 ? Math.round(OUTPUT_LONG / aspect) : OUTPUT_LONG;
  const canvas = document.createElement('canvas');
  canvas.width = outputW;
  canvas.height = outputH;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, outputW, outputH);
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.95));
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function BackIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6"
      aria-hidden
    >
      <path d="M8 19L1 12L8 5" />
    </svg>
  );
}

function ChangePhotoIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4-4a3 3 0 014 0l4 4M14 14l1.5-1.5a3 3 0 014 0L21 14" />
      <circle cx="9" cy="9" r="1.5" />
      <rect x="3" y="4" width="18" height="16" rx="2" />
    </svg>
  );
}
