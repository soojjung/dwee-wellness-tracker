'use client';
import { cn } from '@/lib/cn';
import type { PhotoCount, PhotoTransform } from '@/domain/home/decor';
import { TransformedPhoto } from './TransformedPhoto';

interface PhotoPreviewGridProps {
  count: PhotoCount;
  urls: (string | null)[];
  transforms?: (PhotoTransform | null)[];
}

export function PhotoPreviewGrid({ count, urls, transforms }: PhotoPreviewGridProps) {
  const wrapperClass = cn(
    'grid h-full w-full',
    count === 2 && 'grid-rows-2 gap-px bg-brand-gray400',
    count === 4 && 'grid-cols-2 grid-rows-2 gap-px bg-brand-gray400',
  );

  return (
    <div className="mt-6 flex aspect-[358/190] w-full items-center justify-center overflow-hidden rounded-2xl bg-brand-gray300">
      <div className="aspect-square h-full">
        <div className={wrapperClass}>
          {Array.from({ length: count }, (_, i) => {
            const url = urls[i];
            if (!url) return <div key={i} className="bg-brand-gray300" aria-hidden />;
            return (
              <TransformedPhoto
                key={i}
                url={url}
                transform={transforms?.[i] ?? null}
                className="relative h-full w-full overflow-hidden bg-brand-gray300"
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
