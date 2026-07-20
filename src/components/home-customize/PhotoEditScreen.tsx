'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useT } from '@/i18n/useT';
import { cn } from '@/lib/cn';
import { useMediaStore } from '@/store/mediaStore';
import { slotsForCount, type PhotoSlot } from '@/domain/home/decor';

export function PhotoEditScreen() {
  const t = useT();
  const router = useRouter();

  const hydrated = useMediaStore((s) => s.hydrated);
  const hydrate = useMediaStore((s) => s.hydrate);
  const photoCount = useMediaStore((s) => s.photoCount);
  const photoUrls = useMediaStore((s) => s.photoUrls);

  useEffect(() => {
    if (!hydrated) hydrate();
  }, [hydrated, hydrate]);

  const slots = photoCount ? slotsForCount(photoCount) : [];

  useEffect(() => {
    if (hydrated && (!photoCount || slots.some((s) => !photoUrls[s]))) {
      router.replace('/home/customize');
    }
  }, [hydrated, photoCount, photoUrls, slots, router]);

  if (!photoCount) return null;
  if (slots.some((s) => !photoUrls[s])) return null;

  const wrapperClass = cn(
    'grid h-full w-full',
    photoCount === 2 && 'grid-rows-2 gap-px bg-brand-gray400',
    photoCount === 4 && 'grid-cols-2 grid-rows-2 gap-px bg-brand-gray400',
  );

  return (
    <div className="flex min-h-dvh flex-col bg-brand-white">
      <div className="mx-auto flex w-full max-w-[420px] flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-14 items-center bg-brand-white px-4">
          <Link
            href="/home/customize"
            aria-label={t.home.customize.photoEdit.back}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand-gray200 text-brand-gray900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gray900 focus-visible:ring-offset-2"
          >
            <BackIcon />
          </Link>
        </header>

        <main className="flex flex-1 flex-col items-center justify-center">
          <div className="aspect-square w-full max-h-full overflow-hidden">
            <div className={wrapperClass}>
              {slots.map((slot) => (
                <SlotLink
                  key={slot}
                  slot={slot}
                  url={photoUrls[slot] ?? null}
                  ariaLabel={t.home.customize.photoEdit.slotAriaLabel}
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
            onClick={() => router.push('/home/customize')}
            className="block w-full text-center text-lg font-semibold leading-6 text-brand-gray900 transition-opacity hover:opacity-80"
          >
            {t.home.customize.photoEdit.submit}
          </button>
        </footer>
      </div>
    </div>
  );
}

interface SlotLinkProps {
  slot: PhotoSlot;
  url: string | null;
  ariaLabel: string;
}

function SlotLink({ slot, url, ariaLabel }: SlotLinkProps) {
  if (!url) return <div className="bg-brand-gray300" aria-hidden />;
  return (
    <Link
      href={`/home/customize/edit-photos/${slot}`}
      aria-label={ariaLabel}
      className="relative block h-full w-full overflow-hidden bg-brand-gray300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-pink200"
    >
      <img src={url} alt="" aria-hidden className="h-full w-full object-cover" />
    </Link>
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
