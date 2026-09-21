'use client';
import { useEffect, useRef, useState } from 'react';
import type { DiarySticker, DiaryStickerPlacement, StickerRatio, StickerSource } from '@/types';
import { PLACEMENT_BASE_SIZE, PLACEMENT_NOMINAL_WIDTH } from '@/types';
import { cn } from '@/lib/cn';
import { stickerImageFit } from './stickerImageFit';

interface DiaryStickerViewLayerProps {
  placements: DiaryStickerPlacement[];
  stickers: DiarySticker[];
  urls: Record<string, string>;
  /** Slot to render underneath the sticker layer (usually the calendar grid). */
  children: React.ReactNode;
  /**
   * 스티커 탭 콜백. 주면 스티커가 탭을 받는다 (일정 바보다 위에 있으므로 겹친 곳은
   * 스티커가 이긴다). 없으면 예전처럼 투명하게 통과시켜 아래 셀·일정이 탭을 받는다.
   */
  onStickerTap?: (placementId: string) => void;
  /** 탭 가능한 스티커의 접근성 라벨 (`onStickerTap` 과 함께 준다). */
  stickerAriaLabel?: string;
}

/**
 * View-only sticker overlay used on the main diary tab. Mirrors the geometry
 * math from PlacedStickerLayer/PlacedSticker but strips out drag, resize,
 * and delete — editing happens on /log/customize. With `onStickerTap` a tap
 * on a sticker hands off to that screen (a sticker drawn over an event bar
 * should open the sticker, not the event); the empty space around stickers
 * still falls through to day cells and event bars.
 */
export function DiaryStickerViewLayer({
  placements,
  stickers,
  urls,
  children,
  onStickerTap,
  stickerAriaLabel,
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
                source={sticker.source}
                imageUrl={url}
                containerWidth={containerWidth}
                onTap={onStickerTap ? () => onStickerTap(p.id) : undefined}
                ariaLabel={stickerAriaLabel}
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
  source: StickerSource;
  imageUrl: string;
  containerWidth: number;
  onTap?: () => void;
  ariaLabel?: string;
}

function ViewSticker({
  placement,
  ratio,
  source,
  imageUrl,
  containerWidth,
  onTap,
  ariaLabel,
}: ViewStickerProps) {
  const scaleFactor = containerWidth / PLACEMENT_NOMINAL_WIDTH;
  const baseW = PLACEMENT_BASE_SIZE * placement.scale;
  // "4:3" label = portrait 3:4 aspect (height taller than width).
  const baseH = ratio === '1:1' ? baseW : baseW * (4 / 3);
  const renderX = placement.x * scaleFactor;
  const renderY = placement.y * scaleFactor;
  const renderW = baseW * scaleFactor;
  const renderH = baseH * scaleFactor;

  const style = {
    left: renderX,
    top: renderY,
    width: renderW,
    height: renderH,
    transform: `translate(-50%, -50%) rotate(${placement.rotation}deg)`,
    transformOrigin: 'center',
  } as const;
  const img = (
    <img
      src={imageUrl}
      alt=""
      draggable={false}
      className={cn('h-full w-full', stickerImageFit(source), source === 'photo' && 'rounded-lg')}
    />
  );

  if (!onTap) {
    return (
      <div aria-hidden className="pointer-events-none absolute select-none" style={style}>
        {img}
      </div>
    );
  }
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onTap();
      }}
      aria-label={ariaLabel}
      className="absolute select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink300"
      style={style}
    >
      {img}
    </button>
  );
}
