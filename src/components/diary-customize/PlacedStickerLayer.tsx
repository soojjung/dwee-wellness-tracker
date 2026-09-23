'use client';
import { useEffect, useRef, useState } from 'react';
import type { DiarySticker, DiaryStickerPlacement } from '@/types';
import { cn } from '@/lib/cn';
import { applyPinch, pinchGeometry, type PinchStart, type Point } from '@/domain/diary/stickerPinch';
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

  // 두 손가락 핀치 → 선택된 스티커의 크기·회전. 손가락이 스티커 위에 있을 필요는
  // 없고 캘린더 안이면 된다 (스티커가 작아서 두 손가락이 다 올라가기 어렵다).
  // pointerdown 은 캡처 단계로 받아 스티커 버튼의 stopPropagation 보다 먼저 세고,
  // move/up 은 document 에서 받아 손가락이 캘린더 밖으로 나가도 놓치지 않는다.
  const pointers = useRef(new Map<number, Point>());
  const pinchStart = useRef<PinchStart | null>(null);
  const pinchActive = useRef(false);
  const latest = useRef({ placements, selectedId, onChange });
  latest.current = { placements, selectedId, onChange };

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const active = pointers.current;

    function endPinch() {
      pinchStart.current = null;
      pinchActive.current = false;
    }

    function onDown(e: PointerEvent) {
      if (e.pointerType === 'mouse') return;
      pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    }

    function onMove(e: PointerEvent) {
      if (!pointers.current.has(e.pointerId)) return;
      pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.current.size < 2) return;
      const { placements: current, selectedId: id, onChange: change } = latest.current;
      const target = id ? current.find((p) => p.id === id) : undefined;
      if (!target) return;
      const [a, b] = [...pointers.current.values()];
      if (!a || !b) return;
      const now = pinchGeometry(a, b);
      // 둘째 손가락이 먼저 내려와 선택이 잠시 풀렸다가 돌아오는 경우도 있어서,
      // 핀치는 pointerdown 이 아니라 "두 손가락 + 선택" 이 처음 성립하는 순간 시작한다.
      if (!pinchStart.current) {
        pinchStart.current = { ...now, scale: target.scale, rotation: target.rotation };
        pinchActive.current = true;
        return;
      }
      change(target.id, applyPinch(pinchStart.current, now));
    }

    function onUp(e: PointerEvent) {
      if (!pointers.current.delete(e.pointerId)) return;
      if (pointers.current.size < 2) endPinch();
    }

    el.addEventListener('pointerdown', onDown, { capture: true });
    document.addEventListener('pointermove', onMove, { capture: true });
    document.addEventListener('pointerup', onUp, { capture: true });
    document.addEventListener('pointercancel', onUp, { capture: true });
    return () => {
      el.removeEventListener('pointerdown', onDown, { capture: true });
      document.removeEventListener('pointermove', onMove, { capture: true });
      document.removeEventListener('pointerup', onUp, { capture: true });
      document.removeEventListener('pointercancel', onUp, { capture: true });
      active.clear();
      endPinch();
    };
  }, []);

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
      // 스티커가 선택된 동안은 브라우저가 두 손가락 제스처를 스크롤로 가져가지
      // 못하게 막는다 (가져가면 pointercancel 로 핀치가 끊긴다). 선택을 풀면 원래대로.
      className={cn('relative', selectedId && 'touch-none')}
      onPointerDown={(e) => {
        // Spec 8: tap outside any placed sticker → clear selection. The
        // strict `target === currentTarget` check we had before never
        // fired because the calendar tree sits inside the layer and
        // captures all target values. `closest` walks up from the actual
        // event target, matching only when the tap did NOT land on a
        // placed sticker.
        // 두 번째 손가락은 핀치의 시작이지 바깥 탭이 아니다.
        if (pointers.current.size > 1) return;
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
                source={sticker.source}
                imageUrl={url}
                containerWidth={containerWidth}
                selected={selectedId === p.id}
                onSelect={() => onSelect(p.id)}
                onChange={(patch) => onChange(p.id, patch)}
                onDelete={() => onDelete(p.id)}
                pinchActive={pinchActive}
              />
            );
          })
        : null}
    </div>
  );
}
