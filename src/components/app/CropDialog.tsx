'use client';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useT } from '@/i18n/useT';
import { Button } from '@/components/ui/Button';

const OUTPUT_SIZE = 320;
const MIN_USER_SCALE = 1;
const MAX_USER_SCALE = 3;

interface CropDialogProps {
  src: string;
  naturalWidth: number;
  naturalHeight: number;
  onConfirm: (blob: Blob) => void;
  onCancel: () => void;
}

export function CropDialog({
  src,
  naturalWidth,
  naturalHeight,
  onConfirm,
  onCancel,
}: CropDialogProps) {
  const t = useT();
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [viewport, setViewport] = useState(0);

  const [userScale, setUserScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragRef = useRef<{ startX: number; startY: number; baseX: number; baseY: number } | null>(null);

  useLayoutEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    setViewport(el.clientWidth);
    const ro = new ResizeObserver(() => setViewport(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const baseScale = useMemo(
    () => (viewport > 0 ? Math.max(viewport / naturalWidth, viewport / naturalHeight) : 0),
    [viewport, naturalWidth, naturalHeight],
  );
  const renderedW = naturalWidth * baseScale * userScale;
  const renderedH = naturalHeight * baseScale * userScale;
  const maxOffsetX = Math.max(0, (renderedW - viewport) / 2);
  const maxOffsetY = Math.max(0, (renderedH - viewport) / 2);

  useEffect(() => {
    setOffset((prev) => clampOffset(prev, maxOffsetX, maxOffsetY));
  }, [maxOffsetX, maxOffsetY]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onCancel();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel]);

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { startX: e.clientX, startY: e.clientY, baseX: offset.x, baseY: offset.y };
  }
  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const d = dragRef.current;
    if (!d) return;
    const next = { x: d.baseX + (e.clientX - d.startX), y: d.baseY + (e.clientY - d.startY) };
    setOffset(clampOffset(next, maxOffsetX, maxOffsetY));
  }
  function handlePointerUp(e: React.PointerEvent<HTMLDivElement>) {
    dragRef.current = null;
    e.currentTarget.releasePointerCapture(e.pointerId);
  }

  async function handleConfirm() {
    if (viewport <= 0 || baseScale <= 0) return;
    const blob = await renderCroppedBlob({
      src,
      naturalWidth,
      naturalHeight,
      baseScale,
      userScale,
      offset,
      viewport,
    });
    if (blob) onConfirm(blob);
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-brand-gray900/70 p-4" role="dialog" aria-modal="true">
      <div className="flex w-full max-w-xs flex-col gap-4 rounded-3xl bg-brand-white p-4">
        <h2 className="text-base font-semibold text-brand-gray900">{t.home.cropTitle}</h2>

        <div
          ref={viewportRef}
          className="relative mx-auto aspect-square w-full overflow-hidden rounded-2xl bg-brand-gray300 touch-none select-none"
          style={{ cursor: 'grab' }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          {viewport > 0 ? (
            <img
              src={src}
              alt=""
              draggable={false}
              className="pointer-events-none absolute left-1/2 top-1/2 max-w-none"
              style={{
                width: renderedW,
                height: renderedH,
                transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px))`,
              }}
            />
          ) : null}
        </div>

        <label className="flex flex-col gap-2 text-xs text-brand-gray600">
          <span>{t.home.cropZoomLabel}</span>
          <input
            type="range"
            min={MIN_USER_SCALE}
            max={MAX_USER_SCALE}
            step={0.01}
            value={userScale}
            onChange={(e) => setUserScale(Number(e.target.value))}
            className="accent-brand-pink200"
          />
        </label>

        <div className="flex gap-2">
          <Button variant="ghost" size="md" fullWidth onClick={onCancel}>
            {t.home.cropCancel}
          </Button>
          <Button variant="primary" size="md" fullWidth onClick={handleConfirm}>
            {t.home.cropConfirm}
          </Button>
        </div>
      </div>
    </div>
  );
}

function clampOffset(o: { x: number; y: number }, maxX: number, maxY: number) {
  return {
    x: Math.min(maxX, Math.max(-maxX, o.x)),
    y: Math.min(maxY, Math.max(-maxY, o.y)),
  };
}

interface RenderArgs {
  src: string;
  naturalWidth: number;
  naturalHeight: number;
  baseScale: number;
  userScale: number;
  offset: { x: number; y: number };
  viewport: number;
}

async function renderCroppedBlob(args: RenderArgs): Promise<Blob | null> {
  const img = await loadImage(args.src);
  const canvas = document.createElement('canvas');
  canvas.width = OUTPUT_SIZE;
  canvas.height = OUTPUT_SIZE;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const k = args.baseScale * args.userScale;
  const sourceSide = args.viewport / k;
  const sx = args.naturalWidth / 2 - args.offset.x / k - sourceSide / 2;
  const sy = args.naturalHeight / 2 - args.offset.y / k - sourceSide / 2;

  ctx.drawImage(img, sx, sy, sourceSide, sourceSide, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.9));
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
