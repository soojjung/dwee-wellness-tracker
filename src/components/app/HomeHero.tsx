'use client';
import { useEffect, useRef, useState } from 'react';
import { useT } from '@/i18n/useT';
import { useMediaStore } from '@/store/mediaStore';
import { CropDialog } from './CropDialog';
import { HomeQuote } from './HomeQuote';

const DEFAULT_HERO = '/brand/home-hero.png';

interface Pending {
  src: string;
  naturalWidth: number;
  naturalHeight: number;
}

interface HomeHeroProps {
  isEmpty?: boolean;
}

export function HomeHero({ isEmpty = false }: HomeHeroProps) {
  const t = useT();
  const fileHeroRef = useRef<HTMLInputElement | null>(null);

  const homeHeroUrl = useMediaStore((s) => s.homeHeroUrl);
  const hydrated = useMediaStore((s) => s.hydrated);
  const hydrate = useMediaStore((s) => s.hydrate);
  const setHomeHero = useMediaStore((s) => s.setHomeHero);
  const clearHomeHero = useMediaStore((s) => s.clearHomeHero);

  const [pending, setPending] = useState<Pending | null>(null);

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

  return (
    <>
      <div className="-mx-4">
        <div className="flex items-center justify-between p-4">
          <img
            src="/brand/wordmark-dwee.svg"
            alt={t.app.name}
            width={57}
            height={16}
            className="h-4 w-auto"
          />
          <button
            type="button"
            aria-label={t.home.changePhoto}
            onClick={() => fileHeroRef.current?.click()}
            className="flex h-6 w-6 items-center justify-center text-brand-gray900 transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gray900 focus-visible:ring-offset-2"
          >
            <EditStarIcon />
          </button>
        </div>
      </div>

      <div className="relative -mx-4 aspect-square overflow-hidden">
        <img src={src} alt="" aria-hidden className="h-full w-full object-cover" />

        {!isEmpty ? <HomeQuote /> : null}

        {isEmpty ? (
          <div
            className="pointer-events-none absolute right-4 top-4 z-10 flex flex-col items-end gap-1.5"
            aria-hidden
          >
            <span className="bg-brand-gray900 px-2 py-0.5 text-sm text-brand-pink50">
              {t.home.editHint.cta}
            </span>
            <span className="bg-brand-pink50 px-1.5 py-0.5 text-lg font-semibold leading-tight text-brand-gray900">
              {t.home.editHint.line1}
            </span>
            <span className="bg-brand-pink50 px-1.5 py-0.5 text-lg font-semibold leading-tight text-brand-gray900">
              {t.home.editHint.line2}
            </span>
          </div>
        ) : null}

        {isCustom ? (
          <button
            type="button"
            aria-label={t.home.resetPhoto}
            onClick={() => clearHomeHero()}
            className="absolute right-3 top-3 z-10 h-8 rounded-full bg-brand-gray900/75 px-3 text-xs font-medium text-brand-white backdrop-blur-sm transition-colors hover:bg-brand-gray900/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-white focus-visible:ring-offset-1"
          >
            {t.home.resetPhoto}
          </button>
        ) : null}

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

function EditStarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6" aria-hidden>
      <path
        transform="translate(8.56 8.56) rotate(45) translate(-5.042 -5.042)"
        d="M0.0931 1.4173C-0.2893 0.5761 0.5761 -0.2893 1.4173 0.0931L2.5592 0.6122C4.1368 1.3292 5.9473 1.3292 7.5249 0.6122L8.6668 0.0931C9.508 -0.2893 10.3733 0.5761 9.991 1.4173L9.4719 2.5592C8.7548 4.1368 8.7548 5.9473 9.4719 7.5249L9.991 8.6668C10.3733 9.508 9.508 10.3733 8.6668 9.991L7.5249 9.4719C5.9473 8.7548 4.1368 8.7548 2.5592 9.4719L1.4173 9.991C0.5761 10.3733 -0.2893 9.508 0.0931 8.6668L0.6122 7.5249C1.3292 5.9473 1.3292 4.1368 0.6122 2.5592L0.0931 1.4173Z"
      />
      <path
        transform="translate(17.96 17.96) rotate(45) translate(-3.262 -3.262)"
        d="M0.0931 1.4173C-0.2893 0.5761 0.5761 -0.2893 1.4173 0.0931L1.6067 0.1792C2.6584 0.6572 3.8654 0.6572 4.9171 0.1792L5.1066 0.0931C5.9477 -0.2893 6.8131 0.5761 6.4307 1.4173L6.3446 1.6067C5.8666 2.6584 5.8666 3.8654 6.3446 4.9171L6.4307 5.1066C6.8131 5.9477 5.9477 6.8131 5.1066 6.4307L4.9171 6.3446C3.8654 5.8666 2.6584 5.8666 1.6067 6.3446L1.4173 6.4307C0.5761 6.8131 -0.2893 5.9477 0.0931 5.1066L0.1792 4.9171C0.6572 3.8654 0.6572 2.6584 0.1792 1.6067L0.0931 1.4173Z"
      />
    </svg>
  );
}
