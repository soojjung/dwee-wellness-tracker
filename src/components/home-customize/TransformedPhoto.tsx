'use client';
import { useLayoutEffect, useRef, useState } from 'react';
import {
  DEFAULT_PHOTO_TRANSFORM,
  computePhotoRender,
  type PhotoTransform,
  type RenderSize,
} from '@/domain/home/decor';

interface TransformedPhotoProps {
  url: string;
  transform: PhotoTransform | null;
  className?: string;
}

/**
 * View-only projection of an original photo + stored PhotoTransform. The blob
 * is never rewritten — the transform is applied here via CSS. Used by every
 * consumer that displays a slot (home hero, preview grid, edit overview) so
 * they all match pixel-for-pixel at the same aspect ratio.
 */
export function TransformedPhoto({ url, transform, className }: TransformedPhotoProps) {
  const cellRef = useRef<HTMLDivElement | null>(null);
  const [cell, setCell] = useState<RenderSize>({ w: 0, h: 0 });
  const [natural, setNatural] = useState<RenderSize | null>(null);

  useLayoutEffect(() => {
    const el = cellRef.current;
    if (!el) return;
    const update = () => {
      const rect = el.getBoundingClientRect();
      setCell({ w: rect.width, h: rect.height });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const tx = transform ?? DEFAULT_PHOTO_TRANSFORM;
  const ready = !!natural && cell.w > 0 && cell.h > 0;
  const rendered = ready
    ? computePhotoRender(tx, natural!, cell)
    : null;

  return (
    <div ref={cellRef} className={className ?? 'relative h-full w-full overflow-hidden'}>
      <img
        src={url}
        alt=""
        aria-hidden
        draggable={false}
        onLoad={(e) => {
          const img = e.currentTarget;
          setNatural({ w: img.naturalWidth, h: img.naturalHeight });
        }}
        className="pointer-events-none absolute left-1/2 top-1/2 max-w-none"
        style={
          rendered
            ? {
                width: rendered.renderedW,
                height: rendered.renderedH,
                transform: `translate(calc(-50% + ${rendered.offsetPxX}px), calc(-50% + ${rendered.offsetPxY}px))`,
              }
            : { width: '100%', height: '100%', objectFit: 'cover' }
        }
      />
    </div>
  );
}
