'use client';
import { useRef, type MutableRefObject } from 'react';
import { useT } from '@/i18n/useT';
import { applyPinch, pinchGeometry } from '@/domain/diary/stickerPinch';
import { cn } from '@/lib/cn';
import { stickerImageFit } from '@/components/diary/stickerImageFit';
import {
  PLACEMENT_BASE_SIZE,
  PLACEMENT_NOMINAL_WIDTH,
  type DiaryStickerPlacement,
  type StickerRatio,
  type StickerSource,
} from '@/types';

interface PlacedStickerProps {
  placement: DiaryStickerPlacement;
  ratio: StickerRatio;
  source: StickerSource;
  imageUrl: string;
  containerWidth: number;
  selected: boolean;
  onSelect: () => void;
  onChange: (patch: Partial<DiaryStickerPlacement>) => void;
  onDelete: () => void;
  /** 레이어가 두 손가락 핀치를 잡고 있는 동안 true — 한 손가락 드래그는 물러난다. */
  pinchActive: MutableRefObject<boolean>;
}

interface DragState {
  kind: 'move' | 'resize';
  pointerId: number;
  startClientX: number;
  startClientY: number;
  startX: number;
  startY: number;
  startScale: number;
  startRotation: number;
  centerClientX: number;
  centerClientY: number;
}

export function PlacedSticker({
  placement,
  ratio,
  source,
  imageUrl,
  containerWidth,
  selected,
  onSelect,
  onChange,
  onDelete,
  pinchActive,
}: PlacedStickerProps) {
  const t = useT();
  const scaleFactor = containerWidth / PLACEMENT_NOMINAL_WIDTH;
  const baseW = PLACEMENT_BASE_SIZE * placement.scale;
  // "4:3" label = portrait 3:4 aspect → height is longer than width.
  const baseH = ratio === '1:1' ? baseW : baseW * (4 / 3);
  const renderX = placement.x * scaleFactor;
  const renderY = placement.y * scaleFactor;
  const renderW = baseW * scaleFactor;
  const renderH = baseH * scaleFactor;

  const dragRef = useRef<DragState | null>(null);

  function beginMove(e: React.PointerEvent) {
    e.stopPropagation();
    onSelect();
    const el = e.currentTarget as HTMLElement;
    el.setPointerCapture(e.pointerId);
    dragRef.current = {
      kind: 'move',
      pointerId: e.pointerId,
      startClientX: e.clientX,
      startClientY: e.clientY,
      startX: placement.x,
      startY: placement.y,
      startScale: placement.scale,
      startRotation: placement.rotation,
      centerClientX: 0,
      centerClientY: 0,
    };
  }

  function beginResize(e: React.PointerEvent) {
    e.stopPropagation();
    onSelect();
    const el = e.currentTarget as HTMLElement;
    el.setPointerCapture(e.pointerId);
    // Approximate center in client coords using rendered position.
    const parent = el.closest('[data-diary-canvas="true"]') as HTMLElement | null;
    const parentRect = parent?.getBoundingClientRect();
    const centerClientX = (parentRect?.left ?? 0) + renderX;
    const centerClientY = (parentRect?.top ?? 0) + renderY;
    dragRef.current = {
      kind: 'resize',
      pointerId: e.pointerId,
      startClientX: e.clientX,
      startClientY: e.clientY,
      startX: placement.x,
      startY: placement.y,
      startScale: placement.scale,
      startRotation: placement.rotation,
      centerClientX,
      centerClientY,
    };
  }

  function handlePointerMove(e: React.PointerEvent) {
    const state = dragRef.current;
    if (!state || state.pointerId !== e.pointerId) return;
    // 두 번째 손가락이 내려오면 핀치가 이 스티커를 넘겨받는다. 드래그 상태를 버려야
    // 핀치가 끝난 뒤 남은 손가락이 처음 잡은 지점 기준으로 스티커를 튕기지 않는다.
    if (pinchActive.current) {
      dragRef.current = null;
      return;
    }
    if (state.kind === 'move') {
      const dx = (e.clientX - state.startClientX) / scaleFactor;
      const dy = (e.clientY - state.startClientY) / scaleFactor;
      onChange({ x: state.startX + dx, y: state.startY + dy });
    } else {
      const center = { x: state.centerClientX, y: state.centerClientY };
      const start = pinchGeometry(center, { x: state.startClientX, y: state.startClientY });
      const now = pinchGeometry(center, { x: e.clientX, y: e.clientY });
      onChange(
        applyPinch({ ...start, scale: state.startScale, rotation: state.startRotation }, now),
      );
    }
  }

  function endDrag(e: React.PointerEvent) {
    const state = dragRef.current;
    if (!state || state.pointerId !== e.pointerId) return;
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    dragRef.current = null;
  }

  return (
    <div
      data-placed-sticker="true"
      className="absolute touch-none select-none"
      style={{
        left: renderX,
        top: renderY,
        width: renderW,
        height: renderH,
        transform: `translate(-50%, -50%) rotate(${placement.rotation}deg)`,
        transformOrigin: 'center',
      }}
    >
      <button
        type="button"
        onPointerDown={beginMove}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        aria-label={t.report.diary.customize.placement}
        className={
          'block h-full w-full overflow-hidden focus-visible:outline-none ' +
          // Photo stickers get an 8px radius; cutouts already carry their own
          // silhouette so clipping the bounding box would only eat the subject.
          (source === 'photo' ? 'rounded-lg ' : '') +
          (selected ? 'ring-2 ring-brand-pink300' : '')
        }
      >
        <img
          src={imageUrl}
          alt=""
          draggable={false}
          className={cn('h-full w-full', stickerImageFit(source))}
        />
      </button>
      {selected ? (
        <>
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            aria-label={t.report.diary.customize.deletePlacement}
            className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-brand-gray900 text-brand-white shadow"
            style={{ transform: `rotate(${-placement.rotation}deg)` }}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden>
              <path
                d="M2 2l6 6M8 2L2 8"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </button>
          <button
            type="button"
            onPointerDown={beginResize}
            onPointerMove={handlePointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            aria-label={t.report.diary.customize.resizePlacement}
            className="absolute -bottom-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-brand-white text-brand-gray900 shadow ring-1 ring-brand-gray400"
            style={{ transform: `rotate(${-placement.rotation}deg)` }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
              <path
                d="M4 8l-2 2m0 0l3 0m-3 0v-3M8 4l2-2m0 0l-3 0m3 0v3"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          </button>
        </>
      ) : null}
    </div>
  );
}
