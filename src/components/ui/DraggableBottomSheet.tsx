'use client';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
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
  /** When false the sheet slides fully below the viewport. Defaults to true. */
  open?: boolean;
  /** Fires on a tap outside the sheet. Omit to ignore outside taps (e.g.
   * while a modal of the parent's own is covering the sheet). */
  onDismiss?: () => void;
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

// Pointer travel before a gesture commits to "drag the sheet" vs. "let the
// inner list scroll". Small enough that the sheet still feels immediate,
// large enough that a tap on a sticker isn't stolen.
const DRAG_THRESHOLD_PX = 6;

/** Nearest actually-scrollable ancestor of `from`, bounded by `root`. */
function findScroller(
  from: EventTarget | null,
  root: HTMLElement | null,
): HTMLElement | null {
  if (!root || !(from instanceof HTMLElement)) return null;
  let el: HTMLElement | null = from;
  while (el && root.contains(el)) {
    if (el.scrollHeight > el.clientHeight + 1) {
      const overflowY = window.getComputedStyle(el).overflowY;
      if (overflowY === 'auto' || overflowY === 'scroll') return el;
    }
    el = el.parentElement;
  }
  return null;
}

interface DragState {
  pointerId: number;
  startClientY: number;
  startTopPx: number;
  scroller: HTMLElement | null;
  fromHandle: boolean;
  /** Whether the gesture direction has been resolved yet. */
  decided: boolean;
  /** Once decided: true = move the sheet, false = leave it to the scroller. */
  dragging: boolean;
}

/**
 * A one-file draggable bottom sheet with 3 snap points. Controlled: the
 * parent owns the current snap, and the sheet reports a new value only
 * when the user finishes a drag. During drag the sheet follows the finger
 * (uncontrolled visual state), then snaps to the nearest of the three
 * offsets on release.
 *
 * A tap outside the sheet reports through `onDismiss`; the parent flips
 * `open` and the sheet slides fully off the bottom of the viewport.
 *
 * The whole sheet surface is draggable, not just the handle. When the
 * pointer starts over a scrollable list the gesture is arbitrated the way
 * native sheets do it: below `full` the sheet always wins (so a swipe up
 * anywhere expands it), and at `full` the list scrolls until it is back at
 * the top, where a further pull down collapses the sheet again.
 */
export function DraggableBottomSheet({
  snap,
  onSnapChange,
  snapHeightsDvh = DEFAULT_SNAPS,
  open = true,
  onDismiss,
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

  const rootRef = useRef<HTMLDivElement>(null);

  // Kept in a ref so the document listener below doesn't resubscribe on
  // every parent render (the handler is usually an inline arrow).
  const dismissRef = useRef(onDismiss);
  dismissRef.current = onDismiss;
  const dismissable = Boolean(onDismiss);

  useEffect(() => {
    if (!open || !dismissable) return;
    function handleDocPointerDown(e: PointerEvent) {
      const el = rootRef.current;
      const target = e.target;
      if (!el || (target instanceof Node && el.contains(target))) return;
      dismissRef.current?.();
    }
    document.addEventListener('pointerdown', handleDocPointerDown);
    return () => document.removeEventListener('pointerdown', handleDocPointerDown);
  }, [open, dismissable]);

  // Pixel offset from the top of the viewport where the sheet's top edge
  // currently sits. Derived from snap when idle; overridden while
  // dragging so the sheet follows the finger.
  const snapPx = useCallback(
    (s: SheetSnap) => Math.round((snapHeightsDvh[s] / 100) * viewportH),
    [snapHeightsDvh, viewportH],
  );

  const [dragTopPx, setDragTopPx] = useState<number | null>(null);
  const dragRef = useRef<DragState | null>(null);
  // Set when a drag actually moved the sheet, so the click that trails the
  // release doesn't also pick the sticker the finger started on.
  const suppressClickRef = useRef(false);

  const topPx = dragTopPx ?? snapPx(snap);

  function shouldDragSheet(state: DragState, delta: number): boolean {
    if (state.fromHandle || !state.scroller) return true;
    // Below `full`, an upward swipe should grow the sheet before the list
    // scrolls — matches how native sheets arbitrate the same gesture.
    if (snap !== 'full') return true;
    return delta > 0 && state.scroller.scrollTop <= 0;
  }

  function handlePointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    if (!open || viewportH === 0) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    suppressClickRef.current = false;
    const target = e.target;
    const fromHandle =
      target instanceof HTMLElement && Boolean(target.closest('[data-sheet-handle]'));
    dragRef.current = {
      pointerId: e.pointerId,
      startClientY: e.clientY,
      startTopPx: snapPx(snap),
      scroller: fromHandle ? null : findScroller(target, rootRef.current),
      fromHandle,
      decided: false,
      dragging: false,
    };
  }

  function handlePointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    const state = dragRef.current;
    if (!state || state.pointerId !== e.pointerId) return;
    const delta = e.clientY - state.startClientY;
    if (!state.decided) {
      if (Math.abs(delta) < DRAG_THRESHOLD_PX) return;
      state.decided = true;
      state.dragging = shouldDragSheet(state, delta);
      if (!state.dragging) return;
      rootRef.current?.setPointerCapture(e.pointerId);
      setDragTopPx(state.startTopPx);
    }
    if (!state.dragging) return;
    suppressClickRef.current = true;
    const next = state.startTopPx + delta;
    const minTop = snapPx('full');
    const maxTop = snapPx('peek');
    setDragTopPx(Math.min(maxTop, Math.max(minTop, next)));
  }

  function handlePointerUp(e: ReactPointerEvent<HTMLDivElement>) {
    const state = dragRef.current;
    if (!state || state.pointerId !== e.pointerId) return;
    dragRef.current = null;
    if (!state.dragging) return;
    if (rootRef.current?.hasPointerCapture(e.pointerId)) {
      rootRef.current.releasePointerCapture(e.pointerId);
    }
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

  function handleClickCapture(e: ReactMouseEvent<HTMLDivElement>) {
    if (!suppressClickRef.current) return;
    suppressClickRef.current = false;
    e.preventDefault();
    e.stopPropagation();
  }

  const isDragging = dragTopPx !== null;

  return (
    <div
      ref={rootRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onClickCapture={handleClickCapture}
      aria-hidden={!open}
      // overflow-hidden + overscroll-contain make the sheet its own scroll
      // container, so a wheel over the non-scrolling header (title bar) is
      // absorbed here instead of chaining up to scroll the calendar
      // underneath.
      className={cn(
        'fixed inset-x-0 bottom-0 z-30 mx-auto flex w-full max-w-md flex-col overflow-hidden overscroll-contain rounded-t-[32px] bg-brand-white shadow-[0_-8px_32px_0_rgba(0,0,0,0.08)]',
        !isDragging && 'transition-[top,transform] duration-200 ease-out',
        // Slides the whole sheet below the viewport rather than collapsing
        // its height, so closing reads as "pushed down and gone".
        !open && 'pointer-events-none translate-y-full',
        className,
      )}
      style={{
        top: viewportH ? topPx : undefined,
        // Native scrolling stays off until the sheet is fully expanded, so
        // a swipe anywhere on the body drags the sheet instead of racing
        // the list. At `full` the list takes over (see shouldDragSheet).
        touchAction: snap === 'full' ? undefined : 'none',
      }}
    >
      <div
        role="separator"
        aria-label="Drag to resize"
        data-sheet-handle
        // 8px of top padding above a 64x6 bar, per the Figma sheet header
        // (256:20927). The strip is a thin affordance rather than the drag
        // target it used to be — the whole sheet body drags now.
        className="flex h-[14px] shrink-0 cursor-grab touch-none items-start justify-center pt-2 active:cursor-grabbing"
      >
        <span aria-hidden className="h-1.5 w-16 rounded-full bg-brand-gray300" />
      </div>
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
