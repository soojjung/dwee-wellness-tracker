'use client';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';
import { cn } from '@/lib/cn';

export type SheetSnap = 'peek' | 'medium' | 'full';

interface DraggableBottomSheetProps {
  /** Which snap point the sheet sits at. Controlled by the parent. */
  snap: SheetSnap;
  /** Fires when the user drags + releases, and the sheet settles on a snap. */
  onSnapChange: (snap: SheetSnap) => void;
  /** Vertical fractions of the viewport (dvh) where the sheet TOP EDGE
   * lands for each snap. `peek` = large value (sheet mostly below), `full`
   * = small value (sheet fills most of the viewport). */
  snapHeightsDvh?: Record<SheetSnap, number>;
  /** Rendered inside the sheet body — scrollable area sits below the
   * drag handle. */
  children: ReactNode;
  className?: string;
}

// Snap defaults land the sheet at ~30% (peek shows headers + one row),
// ~55% (medium, roughly two rows), ~90% (full — almost full screen with a
// small top gap so the calendar is still peekable if the user drags down).
const DEFAULT_SNAPS: Record<SheetSnap, number> = {
  peek: 70,
  medium: 45,
  full: 10,
};

const RESIZE_MEDIA = '(orientation: portrait)';

/**
 * A one-file draggable bottom sheet with 3 snap points. Controlled: the
 * parent owns the current snap, and the sheet reports a new value only
 * when the user finishes a drag. During drag the sheet follows the finger
 * (uncontrolled visual state), then snaps to the nearest of the three
 * offsets on release.
 *
 * The drag interaction lives only on the top handle strip so the sheet's
 * inner scroll area still works normally.
 */
export function DraggableBottomSheet({
  snap,
  onSnapChange,
  snapHeightsDvh = DEFAULT_SNAPS,
  children,
  className,
}: DraggableBottomSheetProps) {
  const [viewportH, setViewportH] = useState<number>(0);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const update = () => setViewportH(window.innerHeight);
    update();
    window.addEventListener('resize', update);
    const mq = window.matchMedia(RESIZE_MEDIA);
    mq.addEventListener?.('change', update);
    return () => {
      window.removeEventListener('resize', update);
      mq.removeEventListener?.('change', update);
    };
  }, []);

  // Pixel offset from the top of the viewport where the sheet's top edge
  // currently sits. Derived from snap when idle; overridden while
  // dragging so the sheet follows the finger.
  const snapPx = useCallback(
    (s: SheetSnap) => Math.round((snapHeightsDvh[s] / 100) * viewportH),
    [snapHeightsDvh, viewportH],
  );

  const [dragTopPx, setDragTopPx] = useState<number | null>(null);
  const dragRef = useRef<{
    pointerId: number;
    startClientY: number;
    startTopPx: number;
  } | null>(null);

  const topPx = dragTopPx ?? snapPx(snap);

  function handlePointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    if (viewportH === 0) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = {
      pointerId: e.pointerId,
      startClientY: e.clientY,
      startTopPx: snapPx(snap),
    };
    setDragTopPx(snapPx(snap));
  }

  function handlePointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    const state = dragRef.current;
    if (!state || state.pointerId !== e.pointerId) return;
    const delta = e.clientY - state.startClientY;
    const next = state.startTopPx + delta;
    const minTop = snapPx('full');
    const maxTop = snapPx('peek');
    setDragTopPx(Math.min(maxTop, Math.max(minTop, next)));
  }

  function handlePointerUp(e: ReactPointerEvent<HTMLDivElement>) {
    const state = dragRef.current;
    if (!state || state.pointerId !== e.pointerId) return;
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    dragRef.current = null;
    // Snap to nearest defined point.
    const current = dragTopPx ?? snapPx(snap);
    const candidates: SheetSnap[] = ['full', 'medium', 'peek'];
    let best: SheetSnap = snap;
    let bestDist = Number.POSITIVE_INFINITY;
    for (const c of candidates) {
      const d = Math.abs(current - snapPx(c));
      if (d < bestDist) {
        best = c;
        bestDist = d;
      }
    }
    setDragTopPx(null);
    if (best !== snap) onSnapChange(best);
  }

  const isDragging = dragTopPx !== null;

  return (
    <div
      // overflow-hidden + overscroll-contain make the sheet its own scroll
      // container, so a wheel over the non-scrolling header (title bar) is
      // absorbed here instead of chaining up to scroll the calendar
      // underneath.
      className={cn(
        'fixed inset-x-0 bottom-0 z-30 mx-auto flex w-full max-w-md flex-col overflow-hidden overscroll-contain rounded-t-3xl bg-brand-white shadow-[0_-8px_32px_0_rgba(0,0,0,0.08)]',
        !isDragging && 'transition-[top] duration-200 ease-out',
        className,
      )}
      style={{ top: viewportH ? topPx : undefined }}
    >
      <div
        role="separator"
        aria-label="Drag to resize"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="flex h-6 shrink-0 cursor-grab touch-none items-center justify-center active:cursor-grabbing"
      >
        <span
          aria-hidden
          className="h-1 w-10 rounded-full bg-brand-gray400"
        />
      </div>
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
