'use client';
import { useLayoutEffect, useRef } from 'react';
import { cn } from '@/lib/cn';
import {
  clampPhotoTransform,
  computePhotoRender,
  type PhotoSlot,
  type PhotoTransform,
  type RenderSize,
} from '@/domain/home/decor';

export interface PhotoCellProps {
  slot: PhotoSlot;
  url: string | null;
  active: boolean;
  transform: PhotoTransform;
  natural: RenderSize | undefined;
  cellSize: RenderSize;
  onSelect: (slot: PhotoSlot) => void;
  onTransformChange: (slot: PhotoSlot, tx: PhotoTransform) => void;
  onNaturalLoad: (slot: PhotoSlot, size: RenderSize) => void;
  onCellSize: (slot: PhotoSlot, size: RenderSize) => void;
}

export function PhotoCell({
  slot,
  url,
  active,
  transform,
  natural,
  cellSize,
  onSelect,
  onTransformChange,
  onNaturalLoad,
  onCellSize,
}: PhotoCellProps) {
  const cellRef = useRef<HTMLDivElement | null>(null);

  const pointers = useRef<Map<number, { x: number; y: number }>>(new Map());
  const gestureRef = useRef<{
    baseTx: PhotoTransform;
    baseCell: RenderSize;
    pinchDist: number | null;
    dragStart: { x: number; y: number } | null;
  } | null>(null);

  useLayoutEffect(() => {
    const el = cellRef.current;
    if (!el) return;
    function update() {
      const rect = el!.getBoundingClientRect();
      onCellSize(slot, { w: rect.width, h: rect.height });
    }
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [slot, onCellSize]);

  if (!url) return <div className="bg-brand-gray300" aria-hidden />;

  const ready = !!natural && cellSize.w > 0 && cellSize.h > 0;
  const rendered = ready ? computePhotoRender(transform, natural!, cellSize) : null;

  function clamp(next: PhotoTransform): PhotoTransform {
    if (!natural || cellSize.w <= 0)
      return { ...next, scale: Math.max(1, Math.min(4, next.scale)) };
    return clampPhotoTransform(next, natural, cellSize);
  }

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (!active) {
      onSelect(slot);
      return;
    }
    e.currentTarget.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 1) {
      gestureRef.current = {
        baseTx: transform,
        baseCell: cellSize,
        pinchDist: null,
        dragStart: { x: e.clientX, y: e.clientY },
      };
    } else if (pointers.current.size === 2) {
      const values = [...pointers.current.values()];
      const p1 = values[0]!;
      const p2 = values[1]!;
      gestureRef.current = {
        baseTx: transform,
        baseCell: cellSize,
        pinchDist: pointDistance(p1, p2),
        dragStart: null,
      };
    }
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!active || !pointers.current.has(e.pointerId) || !gestureRef.current) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const g = gestureRef.current;
    if (pointers.current.size === 1 && g.dragStart) {
      const dxPx = e.clientX - g.dragStart.x;
      const dyPx = e.clientY - g.dragStart.y;
      const cw = g.baseCell.w || 1;
      const ch = g.baseCell.h || 1;
      onTransformChange(
        slot,
        clamp({
          scale: g.baseTx.scale,
          offsetXNorm: g.baseTx.offsetXNorm + dxPx / cw,
          offsetYNorm: g.baseTx.offsetYNorm + dyPx / ch,
        }),
      );
    } else if (pointers.current.size === 2 && g.pinchDist) {
      const values = [...pointers.current.values()];
      const p1 = values[0]!;
      const p2 = values[1]!;
      const dist = pointDistance(p1, p2);
      const multiplier = dist / g.pinchDist;
      onTransformChange(
        slot,
        clamp({
          scale: g.baseTx.scale * multiplier,
          offsetXNorm: g.baseTx.offsetXNorm,
          offsetYNorm: g.baseTx.offsetYNorm,
        }),
      );
    }
  }

  function handlePointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    pointers.current.delete(e.pointerId);
    if (pointers.current.size === 0) {
      gestureRef.current = null;
    } else if (pointers.current.size === 1) {
      const remaining = [...pointers.current.values()][0]!;
      gestureRef.current = {
        baseTx: transform,
        baseCell: cellSize,
        pinchDist: null,
        dragStart: { x: remaining.x, y: remaining.y },
      };
    }
  }

  return (
    <div
      ref={cellRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      role="button"
      tabIndex={0}
      aria-pressed={active}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(slot);
        }
      }}
      className={cn(
        'relative h-full w-full touch-none select-none overflow-hidden bg-brand-gray300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-pink200',
        active && 'z-10',
      )}
      style={{ cursor: active ? 'grab' : 'pointer' }}
    >
      <img
        src={url}
        alt=""
        aria-hidden
        draggable={false}
        onLoad={(e) => {
          const img = e.currentTarget;
          onNaturalLoad(slot, { w: img.naturalWidth, h: img.naturalHeight });
        }}
        className="pointer-events-none absolute left-1/2 top-1/2 max-w-none"
        style={
          rendered
            ? {
                width: rendered.renderedW,
                height: rendered.renderedH,
                transform: `translate(calc(-50% + ${rendered.offsetPxX}px), calc(-50% + ${rendered.offsetPxY}px))`,
              }
            : { width: '100%', height: '100%', objectFit: 'cover' as const }
        }
      />
      {active ? (
        // border-width 는 브라우저가 정수 CSS px 로 스냅해서 2.5px 이 2px 로 그려진다.
        // inset box-shadow 는 소수점 폭을 그대로 유지하므로 테두리를 shadow 로 그린다.
        // 핑크 한 겹만 — 안쪽에 얹었던 흰 선은 회색 줄처럼 보여 뺐다.
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 z-10 shadow-[inset_0_0_0_2.5px_theme(colors.brand.pink200)]"
        />
      ) : null}
    </div>
  );
}

function pointDistance(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}
