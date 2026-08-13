'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { useT } from '@/i18n/useT';
import { useMediaStore } from '@/store/mediaStore';
import { slotsForCount } from '@/domain/home/decor';
import { PhotoLayout } from '@/components/home-customize/PhotoLayout';
import { EditStarIcon } from '@/components/ui/icons';
import { HomeHeroText } from './HomeHeroText';

interface HomeHeroProps {
  isEmpty?: boolean;
}

export function HomeHero({ isEmpty = false }: HomeHeroProps) {
  const t = useT();

  const photoCount = useMediaStore((s) => s.photoCount);
  const photoUrls = useMediaStore((s) => s.photoUrls);
  const photoTransforms = useMediaStore((s) => s.photoTransforms);
  const mainText = useMediaStore((s) => s.mainText);
  const subText = useMediaStore((s) => s.subText);
  const hydrated = useMediaStore((s) => s.hydrated);
  const hydrate = useMediaStore((s) => s.hydrate);
  const hasUserText = mainText.trim() !== '' || subText.trim() !== '';

  useEffect(() => {
    if (!hydrated) hydrate();
  }, [hydrated, hydrate]);

  const activeSlots = photoCount ? slotsForCount(photoCount) : [];
  const activePhotos = activeSlots.map((s) => photoUrls[s]).filter((u): u is string => !!u);
  const activeTransforms = activeSlots.map((s) => photoTransforms[s] ?? null);
  const isCustom = photoCount !== null && activePhotos.length === photoCount;

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
          <Link
            href="/home/customize"
            aria-label={t.home.customize.title}
            className="flex h-6 w-6 items-center justify-center text-brand-gray900 transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gray900 focus-visible:ring-offset-2"
          >
            <EditStarIcon />
          </Link>
        </div>
      </div>

      <div className="relative -mx-4 aspect-square overflow-hidden bg-brand-gray300">
        {isCustom ? (
          <PhotoLayout
            count={photoCount}
            urls={activePhotos}
            transforms={activeTransforms}
          />
        ) : null}

        <HomeHeroText />

        {isEmpty && !isCustom && !hasUserText ? (
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
      </div>
    </>
  );
}

