'use client';
import { useEffect, useRef, useState } from 'react';
import type { DiarySticker, DiaryStickerPlacement } from '@/types';
import { PlacedSticker } from './PlacedSticker';

interface PlacedStickerLayerProps {
  placements: DiaryStickerPlacement[];
  stickers: DiarySticker[];
  urls: Record<string, string>;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onChange: (id: string, patch: Partial<DiaryStickerPlacement>) => void;
  onDelete: (id: string) => void;
  children: React.ReactNode;
}

export function PlacedStickerLayer({
  placements,
  stickers,
  urls,
  selectedId,
  onSelect,
  onChange,
  onDelete,
  children,
}: PlacedStickerLayerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    observer.observe(el);
    setContainerWidth(el.getBoundingClientRect().width);
    return () => observer.disconnect();
  }, []);

  const stickerById = new Map(stickers.map((s) => [s.id, s]));

  return (
    <div
      ref={ref}
      data-diary-canvas="true"
      className="relative"
      onPointerDown={(e) => {
        // Spec 8: tap outside any placed sticker → clear selection. The
        // strict `target === currentTarget` check we had before never
        // fired because the calendar tree sits inside the layer and
        // captures all target values. `closest` walks up from the actual
        // event target, matching only when the tap did NOT land on a
        // placed sticker.
        const target = e.target as HTMLElement | null;
        if (target?.closest('[data-placed-sticker="true"]')) return;
        onSelect(null);
      }}
    >
      {children}
      {containerWidth > 0
        ? placements.map((p) => {
            const sticker = stickerById.get(p.stickerId);
            const url = urls[p.stickerId];
            if (!sticker || !url) return null;
            return (
              <PlacedSticker
                key={p.id}
                placement={p}
                ratio={sticker.ratio}
                imageUrl={url}
                containerWidth={containerWidth}
                selected={selectedId === p.id}
                onSelect={() => onSelect(p.id)}
                onChange={(patch) => onChange(p.id, patch)}
                onDelete={() => onDelete(p.id)}
              />
            );
          })
        : null}
    </div>
  );
}
