'use client';
import { useRef, useState } from 'react';

const SWIPE_ANIMATION_MS = 220;

interface UseHorizontalSwipeArgs {
  /** 스와이프가 임계값을 넘어 커밋될 때 -1(다음) / 1(이전) 방향과 함께 호출. */
  onCommit: (direction: -1 | 1) => void;
}

interface HorizontalSwipeHandlers {
  onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void;
  onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => void;
  onPointerUp: (e: React.PointerEvent<HTMLDivElement>) => void;
  onPointerCancel: (e: React.PointerEvent<HTMLDivElement>) => void;
}

interface UseHorizontalSwipeResult {
  containerRef: React.RefObject<HTMLDivElement | null>;
  offset: number;
  animating: boolean;
  handlers: HorizontalSwipeHandlers;
}

/**
 * 다이어리 캘린더의 좌우 스와이프 제스처. 순수 포인터 드래그 상태만 다루고 도메인
 * 데이터(달 커서 등)는 모른다 — 임계값을 넘으면 `onCommit(direction)` 만 알린다.
 */
export function useHorizontalSwipe({ onCommit }: UseHorizontalSwipeArgs): UseHorizontalSwipeResult {
  const containerRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);
  const [animating, setAnimating] = useState(false);
  const dragRef = useRef<{ id: number; startX: number; startY: number; captured: boolean } | null>(
    null,
  );

  function commit(direction: -1 | 0 | 1, containerWidth: number) {
    if (direction === 0) {
      setAnimating(true);
      setOffset(0);
      return;
    }
    // Slide fully out of view in the swipe direction, then swap month +
    // instantly snap the new month in from the opposite side (offset 0).
    setAnimating(true);
    setOffset(direction * -containerWidth);
    window.setTimeout(() => {
      onCommit(direction);
      setAnimating(false);
      setOffset(0);
    }, SWIPE_ANIMATION_MS);
  }

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    dragRef.current = {
      id: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      captured: false,
    };
    setAnimating(false);
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const s = dragRef.current;
    if (!s || s.id !== e.pointerId) return;
    const dx = e.clientX - s.startX;
    const dy = e.clientY - s.startY;
    if (!s.captured) {
      // Only start owning the gesture once horizontal intent dominates so
      // vertical scrolls (calendar list, page scroll) still work.
      if (Math.abs(dx) < 8 || Math.abs(dx) < Math.abs(dy)) return;
      s.captured = true;
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    }
    setOffset(dx);
  }

  function handlePointerEnd(e: React.PointerEvent<HTMLDivElement>) {
    const s = dragRef.current;
    if (!s || s.id !== e.pointerId) return;
    dragRef.current = null;
    if (!s.captured) return;
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    const width = containerRef.current?.getBoundingClientRect().width ?? 0;
    const threshold = Math.max(60, width * 0.2);
    if (offset <= -threshold) commit(1, width);
    else if (offset >= threshold) commit(-1, width);
    else commit(0, width);
  }

  return {
    containerRef,
    offset,
    animating,
    handlers: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerEnd,
      onPointerCancel: handlePointerEnd,
    },
  };
}
