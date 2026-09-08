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
  const allFilled = Array.from({ length: count }, (_, i) => urls[i]).every(Boolean);
  // 빈 칸이 남아 있을 때만 칸을 나눠 보여준다 — 다 채우면 홈과 같은 모습이 된다.
  const gridLines = allFilled ? '' : 'gap-px bg-brand-gray400';
  const wrapperClass = cn(
    'grid h-full w-full',
    count === 2 && 'grid-rows-2',
    count === 4 && 'grid-cols-2 grid-rows-2',
    count !== 1 && gridLines,
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
