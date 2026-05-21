'use client';
import { useEffect, useRef, useState } from 'react';
import { useT } from '@/i18n/useT';
import { useMediaStore } from '@/store/mediaStore';
import { CropDialog } from './CropDialog';
import { HomeOverlayItem } from './HomeOverlayItem';

const DEFAULT_HERO = '/brand/home-hero.png';
const HERO_SIZE = 320;

interface Pending {
  src: string;
  naturalWidth: number;
  naturalHeight: number;
}

export function HomeHero() {
  const t = useT();
  const fileHeroRef = useRef<HTMLInputElement | null>(null);
  const fileOverlayRef = useRef<HTMLInputElement | null>(null);

  const homeHeroUrl = useMediaStore((s) => s.homeHeroUrl);
  const overlays = useMediaStore((s) => s.overlays);
  const hydrated = useMediaStore((s) => s.hydrated);
  const hydrate = useMediaStore((s) => s.hydrate);
  const setHomeHero = useMediaStore((s) => s.setHomeHero);
  const clearHomeHero = useMediaStore((s) => s.clearHomeHero);
  const addOverlay = useMediaStore((s) => s.addOverlay);
  const moveOverlay = useMediaStore((s) => s.moveOverlay);
  const removeOverlay = useMediaStore((s) => s.removeOverlay);

  const [pending, setPending] = useState<Pending | null>(null);
  const [selectedOverlayId, setSelectedOverlayId] = useState<string | null>(null);

  useEffect(() => {
    if (!hydrated) hydrate();
  }, [hydrated, hydrate]);

  useEffect(() => {
    return () => {
      if (pending) URL.revokeObjectURL(pending.src);
    };
  }, [pending]);

  const src = homeHeroUrl ?? DEFAULT_HERO;
  const isCustom = !!homeHeroUrl;

  async function handleHeroPick(file: File) {
    const url = URL.createObjectURL(file);
    const { width, height } = await readImageSize(url);
    setPending({ src: url, naturalWidth: width, naturalHeight: height });
  }

  async function handleCropConfirm(blob: Blob) {
    await setHomeHero(blob);
    if (pending) URL.revokeObjectURL(pending.src);
    setPending(null);
  }

  function handleCropCancel() {
    if (pending) URL.revokeObjectURL(pending.src);
    setPending(null);
  }

  async function handleOverlayPick(file: File) {
    await addOverlay(file);
  }

  return (
    <>
      <div
        className="relative mx-auto overflow-hidden rounded-3xl"
        style={{ width: HERO_SIZE, height: HERO_SIZE }}
        onPointerDown={(e) => {
          if (!(e.target as HTMLElement).closest('[data-overlay-id]')) {
            setSelectedOverlayId(null);
          }
        }}
      >
        <img src={src} alt="" aria-hidden className="h-full w-full object-cover" />

        {overlays.map((o) => (
          <HomeOverlayItem
            key={o.id}
            overlay={o}
            containerSize={HERO_SIZE}
            selected={selectedOverlayId === o.id}
            onSelect={(id) => setSelectedOverlayId((prev) => (prev === id ? null : id))}
            onMove={moveOverlay}
            onRemove={(id) => {
              removeOverlay(id);
              setSelectedOverlayId(null);
            }}
          />
        ))}

        <div className="absolute right-3 top-3 z-10 flex flex-col gap-2">
          <button
            type="button"
            aria-label={t.home.changePhoto}
            onClick={() => fileHeroRef.current?.click()}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-gray900/75 text-brand-white backdrop-blur-sm transition-colors hover:bg-brand-gray900/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-white focus-visible:ring-offset-1"
          >
            <PencilIcon />
          </button>
          <button
            type="button"
            aria-label={t.home.addOverlay}
            onClick={() => fileOverlayRef.current?.click()}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-gray900/75 text-brand-white backdrop-blur-sm transition-colors hover:bg-brand-gray900/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-white focus-visible:ring-offset-1"
          >
            <PlusIcon />
          </button>
          {isCustom ? (
            <button
              type="button"
              aria-label={t.home.resetPhoto}
              onClick={() => clearHomeHero()}
              className="h-9 rounded-full bg-brand-gray900/75 px-3 text-xs font-medium text-brand-white backdrop-blur-sm transition-colors hover:bg-brand-gray900/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-white focus-visible:ring-offset-1"
            >
              {t.home.resetPhoto}
            </button>
          ) : null}
        </div>

        <input
          ref={fileHeroRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleHeroPick(file);
            e.target.value = '';
          }}
        />
        <input
          ref={fileOverlayRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleOverlayPick(file);
            e.target.value = '';
          }}
        />
      </div>

      {pending ? (
        <CropDialog
          src={pending.src}
          naturalWidth={pending.naturalWidth}
          naturalHeight={pending.naturalHeight}
          onConfirm={handleCropConfirm}
          onCancel={handleCropCancel}
        />
      ) : null}
    </>
  );
}

function readImageSize(src: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = reject;
    img.src = src;
  });
}

function PencilIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden>
      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden>
      <path d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6V5z" />
    </svg>
  );
}
