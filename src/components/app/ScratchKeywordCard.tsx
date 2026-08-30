'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useT } from '@/i18n/useT';
import type { CyclePhase } from '@/domain/cycle/types';

interface ScratchKeywordCardProps {
  phase: CyclePhase;
  today: string;
}

const SCRATCH_RADIUS = 28;
const REVEAL_THRESHOLD = 0.2;
const STORAGE_PREFIX = 'dwee:ui:home_scratch:';
const COVER_IMAGE_SRC = '/home/scratch-cover.png';

export function ScratchKeywordCard({ phase, today }: ScratchKeywordCardProps) {
  const t = useT();
  const items = t.home.keywords[phase];
  const keyword = useMemo(() => {
    if (items.length === 0) return null;
    const index = hashDate(today) % items.length;
    return items[index] ?? items[0] ?? null;
  }, [items, today]);

  const storageKey = `${STORAGE_PREFIX}${today}:${phase}`;

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const preparedRef = useRef(false);
  const coverImageRef = useRef<HTMLImageElement | null>(null);

  const [revealed, setRevealed] = useState(false);
  const [coverReady, setCoverReady] = useState(false);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage.getItem(storageKey) === '1') {
        setRevealed(true);
      } else {
        setRevealed(false);
        preparedRef.current = false;
      }
    } catch {
      setRevealed(false);
    }
  }, [storageKey]);

  const prepareCanvas = useCallback(() => {
    if (preparedRef.current) return;
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const image = coverImageRef.current;
    if (!container || !canvas || !image) return;
    const rect = container.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawCover(ctx, image, rect.width, rect.height);
    ctx.globalCompositeOperation = 'destination-out';
    preparedRef.current = true;
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (coverImageRef.current) {
      setCoverReady(true);
      return;
    }
    const img = new Image();
    img.onload = () => {
      coverImageRef.current = img;
      setCoverReady(true);
    };
    img.src = COVER_IMAGE_SRC;
  }, []);

  useEffect(() => {
    if (revealed) return;
    if (!coverReady) return;
    prepareCanvas();
    const handle = () => {
      preparedRef.current = false;
      prepareCanvas();
    };
    window.addEventListener('resize', handle);
    return () => window.removeEventListener('resize', handle);
  }, [revealed, coverReady, prepareCanvas]);

  const revealNow = useCallback(() => {
    setRevealed(true);
    try {
      if (typeof window !== 'undefined') window.localStorage.setItem(storageKey, '1');
    } catch {
      /* ignore */
    }
  }, [storageKey]);

  const scratchAt = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    ctx.beginPath();
    ctx.arc(x, y, SCRATCH_RADIUS, 0, Math.PI * 2);
    ctx.fill();
  }, []);

  const checkRevealThreshold = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    try {
      const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = image.data;
      const step = 40; // every 10th pixel
      let cleared = 0;
      let total = 0;
      for (let i = 3; i < data.length; i += step) {
        total += 1;
        if (data[i] === 0) cleared += 1;
      }
      if (total > 0 && cleared / total >= REVEAL_THRESHOLD) {
        revealNow();
      }
    } catch {
      /* getImageData can throw on tainted canvas — safe to skip */
    }
  }, [revealNow]);

  function onPointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    if (revealed) return;
    prepareCanvas();
    drawingRef.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    scratchAt(e.clientX, e.clientY);
  }

  function onPointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (revealed || !drawingRef.current) return;
    scratchAt(e.clientX, e.clientY);
  }

  function onPointerEnd(e: React.PointerEvent<HTMLCanvasElement>) {
    if (revealed) return;
    drawingRef.current = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    checkRevealThreshold();
  }

  if (!keyword) return null;

  return (
    <div
      ref={containerRef}
      className="relative h-[178px] w-full overflow-hidden rounded-2xl bg-brand-pink50"
    >
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1.5 px-6 text-center">
        <span className="text-base font-medium text-brand-gray900">{keyword.subtitle}</span>
        <span className="flex items-center gap-1 text-2xl font-semibold text-brand-gray900">
          <span>{keyword.main}</span>
          <span aria-hidden>{keyword.emoji}</span>
        </span>
      </div>

      {!revealed ? (
        <canvas
          ref={canvasRef}
          role="img"
          aria-label={t.home.scratchCanvasAria}
          className="absolute inset-0 h-full w-full touch-none cursor-pointer"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerEnd}
          onPointerCancel={onPointerEnd}
          onPointerLeave={onPointerEnd}
        />
      ) : null}
    </div>
  );
}

function hashDate(iso: string): number {
  let hash = 5381;
  for (let i = 0; i < iso.length; i += 1) {
    hash = ((hash << 5) + hash + iso.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function drawCover(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  width: number,
  height: number,
) {
  const imgRatio = image.width / image.height;
  const boxRatio = width / height;
  let drawW = width;
  let drawH = height;
  let drawX = 0;
  let drawY = 0;
  if (imgRatio > boxRatio) {
    drawH = height;
    drawW = drawH * imgRatio;
    drawX = (width - drawW) / 2;
  } else {
    drawW = width;
    drawH = drawW / imgRatio;
    drawY = (height - drawH) / 2;
  }
  ctx.drawImage(image, drawX, drawY, drawW, drawH);
}
