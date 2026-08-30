'use client';
import { useRef } from 'react';
import { Camera } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { useT } from '@/i18n/useT';
import { cn } from '@/lib/cn';
import { PHOTO_COUNTS, type PhotoCount } from '@/domain/home/decor';

const COUNT_TO_KEY: Record<PhotoCount, 'one' | 'two' | 'four'> = {
  1: 'one',
  2: 'two',
  4: 'four',
};

interface PhotoCountSectionProps {
  selected: PhotoCount | null;
  onPick: (count: PhotoCount, blobs: Blob[]) => void;
}

export function PhotoCountSection({ selected, onPick }: PhotoCountSectionProps) {
  const t = useT();
  const inputRefs = useRef<Record<PhotoCount, HTMLInputElement | null>>({
    1: null,
    2: null,
    4: null,
  });

  async function handleClick(count: PhotoCount) {
    // Native (Capacitor): open the OS photo-library picker directly — no
    // camera / file browser options. Album permission is the only prompt.
    if (Capacitor.isNativePlatform()) {
      try {
        const result = await Camera.pickImages({ limit: count, quality: 90 });
        const blobs: Blob[] = [];
        for (const photo of result.photos.slice(0, count)) {
          if (!photo.webPath) continue;
          const res = await fetch(photo.webPath);
          blobs.push(await res.blob());
        }
        if (blobs.length) onPick(count, blobs);
      } catch {
        // User cancelled or picker unavailable — no-op.
      }
      return;
    }
    inputRefs.current[count]?.click();
  }

  return (
    <section className="px-4 pt-4">
      <h2 className="text-lg font-semibold text-brand-gray900">{t.home.customize.photo.title}</h2>
      <p className="mt-1 text-xs leading-[1.5] text-brand-gray800">{t.home.customize.photo.hint}</p>
      <ul className="mt-4 grid grid-cols-3 gap-2">
        {PHOTO_COUNTS.map((count) => {
          const isSelected = selected === count;
          const label = t.home.customize.photo.count[COUNT_TO_KEY[count]];
          return (
            <li key={count}>
              <button
                type="button"
                aria-pressed={isSelected}
                aria-label={label}
                onClick={() => handleClick(count)}
                className={cn(
                  'flex w-full cursor-pointer flex-col items-center justify-center gap-1.5 rounded-2xl py-4 transition-colors',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-gray900 focus-visible:ring-offset-2',
                  isSelected
                    ? 'border-[0.75px] border-brand-pink200 bg-brand-pink50'
                    : 'border-[0.75px] border-brand-gray400 bg-transparent hover:bg-brand-gray200',
                )}
              >
                <PhotoLayoutIcon count={count} />
                <span className="text-xs font-semibold text-brand-gray900">{label}</span>
              </button>
              <input
                ref={(el) => {
                  inputRefs.current[count] = el;
                }}
                type="file"
                accept="image/*"
                multiple={count > 1}
                className="sr-only"
                onChange={(e) => {
                  const files = e.target.files;
                  if (files && files.length) onPick(count, Array.from(files));
                  e.target.value = '';
                }}
              />
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function PhotoLayoutIcon({ count }: { count: PhotoCount }) {
  if (count === 1) {
    return <div className="h-5 w-5 rounded-[4px] border-2 border-brand-gray900" aria-hidden />;
  }
  if (count === 2) {
    return (
      <svg viewBox="0 0 20 20" fill="none" stroke="#353434" strokeWidth="2" className="h-5 w-5" aria-hidden>
        <rect x="1" y="1" width="18" height="18" rx="3" />
        <line x1="1" y1="10" x2="19" y2="10" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="#353434" strokeWidth="2" className="h-5 w-5" aria-hidden>
      <rect x="1" y="1" width="18" height="18" rx="3" />
      <line x1="1" y1="10" x2="19" y2="10" />
      <line x1="10" y1="1" x2="10" y2="19" />
    </svg>
  );
}
