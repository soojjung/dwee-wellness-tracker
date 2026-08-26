'use client';
import { useRef } from 'react';
import { useT } from '@/i18n/useT';
import {
  PLACEMENT_BASE_SIZE,
  PLACEMENT_NOMINAL_WIDTH,
  type DiaryStickerPlacement,
  type StickerRatio,
} from '@/types';

interface PlacedStickerProps {
  placement: DiaryStickerPlacement;
  ratio: StickerRatio;
  imageUrl: string;
  containerWidth: number;
  selected: boolean;
  onSelect: () => void;
  onChange: (patch: Partial<DiaryStickerPlacement>) => void;
  onDelete: () => void;
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
  imageUrl,
  containerWidth,
  selected,
  onSelect,
  onChange,
  onDelete,
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
    if (state.kind === 'move') {
      const dx = (e.clientX - state.startClientX) / scaleFactor;
      const dy = (e.clientY - state.startClientY) / scaleFactor;
      onChange({ x: state.startX + dx, y: state.startY + dy });
    } else {
      const startVecX = state.startClientX - state.centerClientX;
      const startVecY = state.startClientY - state.centerClientY;
      const nextVecX = e.clientX - state.centerClientX;
      const nextVecY = e.clientY - state.centerClientY;
      const startDist = Math.hypot(startVecX, startVecY) || 1;
      const nextDist = Math.hypot(nextVecX, nextVecY) || 1;
      const scale = Math.min(3, Math.max(0.3, state.startScale * (nextDist / startDist)));
      const startAngle = Math.atan2(startVecY, startVecX);
      const nextAngle = Math.atan2(nextVecY, nextVecX);
      const rotation = state.startRotation + ((nextAngle - startAngle) * 180) / Math.PI;
      onChange({ scale, rotation });
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
          'block h-full w-full overflow-hidden rounded-md focus-visible:outline-none ' +
          (selected ? 'ring-2 ring-brand-pink300' : '')
        }
      >
        <img
          src={imageUrl}
          alt=""
          draggable={false}
          className="h-full w-full object-cover"
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
