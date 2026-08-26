'use client';
import { useEffect, useRef, useState } from 'react';
import type {
  DiarySticker,
  DiaryStickerPlacement,
  StickerRatio,
} from '@/types';
import { PLACEMENT_BASE_SIZE, PLACEMENT_NOMINAL_WIDTH } from '@/types';

interface DiaryStickerViewLayerProps {
  placements: DiaryStickerPlacement[];
  stickers: DiarySticker[];
  urls: Record<string, string>;
  /** Slot to render underneath the sticker layer (usually the calendar grid). */
  children: React.ReactNode;
}

/**
 * View-only sticker overlay used on the main diary tab. Mirrors the geometry
 * math from PlacedStickerLayer/PlacedSticker but strips out drag, resize,
 * selection, and delete — the diary main is read-only. Stickers sit above
 * the calendar and don't intercept taps (`pointer-events-none`) so day
 * cells and event badges underneath stay tappable.
 */
export function DiaryStickerViewLayer({
  placements,
  stickers,
  urls,
  children,
}: DiaryStickerViewLayerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) setContainerWidth(entry.contentRect.width);
    });
    observer.observe(el);
    setContainerWidth(el.getBoundingClientRect().width);
    return () => observer.disconnect();
  }, []);

  const stickerById = new Map(stickers.map((s) => [s.id, s]));

  return (
    <div ref={ref} className="relative">
      {children}
      {containerWidth > 0
        ? placements.map((p) => {
            const sticker = stickerById.get(p.stickerId);
            const url = urls[p.stickerId];
            if (!sticker || !url) return null;
            return (
              <ViewSticker
                key={p.id}
                placement={p}
                ratio={sticker.ratio}
                imageUrl={url}
                containerWidth={containerWidth}
              />
            );
          })
        : null}
    </div>
  );
}

interface ViewStickerProps {
  placement: DiaryStickerPlacement;
  ratio: StickerRatio;
  imageUrl: string;
  containerWidth: number;
}

function ViewSticker({ placement, ratio, imageUrl, containerWidth }: ViewStickerProps) {
  const scaleFactor = containerWidth / PLACEMENT_NOMINAL_WIDTH;
  const baseW = PLACEMENT_BASE_SIZE * placement.scale;
  // "4:3" label = portrait 3:4 aspect (height taller than width).
  const baseH = ratio === '1:1' ? baseW : baseW * (4 / 3);
  const renderX = placement.x * scaleFactor;
  const renderY = placement.y * scaleFactor;
  const renderW = baseW * scaleFactor;
  const renderH = baseH * scaleFactor;

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute select-none"
      style={{
        left: renderX,
        top: renderY,
        width: renderW,
        height: renderH,
        transform: `translate(-50%, -50%) rotate(${placement.rotation}deg)`,
        transformOrigin: 'center',
      }}
    >
      <img
        src={imageUrl}
        alt=""
        draggable={false}
        className="h-full w-full object-cover"
      />
    </div>
  );
}
