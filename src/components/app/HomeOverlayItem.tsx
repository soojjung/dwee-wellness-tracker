'use client';
import { useRef, useState } from 'react';
import { useT } from '@/i18n/useT';
import { cn } from '@/lib/cn';
import type { OverlayDisplay } from '@/store/mediaStore';

const OVERLAY_WIDTH_PCT = 35;
const DRAG_THRESHOLD_PX = 4;

interface HomeOverlayItemProps {
  overlay: OverlayDisplay;
  containerSize: number;
  selected: boolean;
  onSelect: (id: string) => void;
  onMove: (id: string, x: number, y: number) => void;
  onRemove: (id: string) => void;
}

export function HomeOverlayItem({
  overlay,
  containerSize,
  selected,
  onSelect,
  onMove,
  onRemove,
}: HomeOverlayItemProps) {
  const t = useT();
  const dragRef = useRef<{ startX: number; startY: number; baseX: number; baseY: number } | null>(null);
  const [moved, setMoved] = useState(false);

  function clamp01(v: number) {
    return Math.min(1, Math.max(0, v));
  }

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { startX: e.clientX, startY: e.clientY, baseX: overlay.x, baseY: overlay.y };
    setMoved(false);
  }
  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const d = dragRef.current;
    if (!d || containerSize <= 0) return;
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    if (Math.abs(dx) + Math.abs(dy) > DRAG_THRESHOLD_PX) setMoved(true);
    const nx = clamp01(d.baseX + dx / containerSize);
    const ny = clamp01(d.baseY + dy / containerSize);
    onMove(overlay.id, nx, ny);
  }
  function handlePointerUp(e: React.PointerEvent<HTMLDivElement>) {
    e.currentTarget.releasePointerCapture(e.pointerId);
    if (!moved) onSelect(overlay.id);
    dragRef.current = null;
  }

  return (
    <div
      data-overlay-id={overlay.id}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{
        left: `${overlay.x * 100}%`,
        top: `${overlay.y * 100}%`,
        width: `${OVERLAY_WIDTH_PCT}%`,
      }}
      className={cn(
        'absolute -translate-x-1/2 -translate-y-1/2 touch-none select-none cursor-grab',
        selected && 'ring-2 ring-brand-white rounded-md',
      )}
    >
      <img src={overlay.url} alt="" draggable={false} className="pointer-events-none block w-full" />
      {selected ? (
        <button
          type="button"
          aria-label={t.home.removeOverlay}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onRemove(overlay.id);
          }}
          className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-brand-gray900 text-brand-white shadow-md"
        >
          ×
        </button>
      ) : null}
    </div>
  );
}
